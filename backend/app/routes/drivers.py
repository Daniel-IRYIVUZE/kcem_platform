"""routes/drivers.py — Driver & vehicle endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.crud import crud_driver, crud_vehicle, crud_recycler
from app.crud.user import crud_user
from app.auth.dependencies import get_current_active_user, require_role
from app.schemas.driver import (
    DriverCreate, DriverUpdate, DriverRead,
    DriverRegisterByRecycler,
    VehicleCreate, VehicleUpdate, VehicleRead,
)
from app.schemas.recycler import RecyclerCreate
from app.models.user import User, UserRole
from app.models.driver import Driver, Vehicle

router = APIRouter(prefix="/drivers", tags=["Drivers"])
require_driver_role = require_role(UserRole.driver, UserRole.recycler, UserRole.admin)


def _enrich(driver: Driver, db: Session) -> DriverRead:
    """Add user name & vehicle info to a DriverRead."""
    base = DriverRead.model_validate(driver)
    if driver.user:
        base.name = driver.user.full_name or driver.user.email
        base.email = driver.user.email
        base.last_login = driver.user.last_login
        base.has_logged_in = driver.user.last_login is not None
        if not base.phone and driver.user.phone:
            base.phone = driver.user.phone
    if driver.vehicle_id:
        v = db.query(Vehicle).filter(Vehicle.id == driver.vehicle_id).first()
        if v:
            base.vehicle_type = v.vehicle_type
            base.plate_number = v.plate_number
            base.capacity_kg = v.capacity_kg
    return base


def _get_or_create_recycler_profile(db: Session, current_user: User):
    recycler = crud_recycler.get_by_user(db, current_user.id)
    if recycler:
        return recycler
    company_name = (current_user.full_name or current_user.email.split('@')[0]).strip()
    return crud_recycler.create(
        db,
        obj_in=RecyclerCreate(
            company_name=company_name,
            address="Kigali, Rwanda",
            city="Kigali",
            phone=current_user.phone,
        ),
        user_id=current_user.id,
    )


@router.post("/", response_model=DriverRead, status_code=201,
             dependencies=[Depends(require_driver_role)])
def create_driver(payload: DriverCreate, db: Session = Depends(get_db),
                  current_user: User = Depends(get_current_active_user)):
    if crud_driver.get_by_user(db, current_user.id):
        raise HTTPException(409, "Driver profile already exists.")
    return crud_driver.create(db, obj_in=payload, user_id=current_user.id)


@router.get("/me", response_model=DriverRead,
            dependencies=[Depends(require_driver_role)])
def my_driver(db: Session = Depends(get_db),
              current_user: User = Depends(get_current_active_user)):
    driver = crud_driver.get_by_user(db, current_user.id)
    if not driver:
        raise HTTPException(404, "No driver profile found.")
    return _enrich(driver, db)


@router.patch("/me", response_model=DriverRead,
              dependencies=[Depends(require_driver_role)])
def update_driver(payload: DriverUpdate, db: Session = Depends(get_db),
                  current_user: User = Depends(get_current_active_user)):
    driver = crud_driver.get_by_user(db, current_user.id)
    if not driver:
        raise HTTPException(404, "No driver profile found.")
    return crud_driver.update(db, db_obj=driver, obj_in=payload)


@router.patch("/me/availability", response_model=DriverRead,
              dependencies=[Depends(require_driver_role)])
def set_availability(payload: dict, db: Session = Depends(get_db),
                     current_user: User = Depends(get_current_active_user)):
    driver = crud_driver.get_by_user(db, current_user.id)
    if not driver:
        raise HTTPException(404, "No driver profile found.")
    return crud_driver.set_availability(db, driver_id=driver.id,
                                        available=payload.get("available", True))


@router.get("/available", response_model=list[DriverRead])
def get_available_drivers(recycler_id: int | None = None,
                          db: Session = Depends(get_db),
                          current_user: User = Depends(get_current_active_user)):
    """Get all available drivers. If recycler_id provided, only return drivers from that recycler."""
    drivers = crud_driver.get_available(db, recycler_id=recycler_id)
    return [_enrich(d, db) for d in drivers]


@router.get("/", response_model=list[DriverRead])
def list_drivers(skip: int = 0, limit: int = 50,
                db: Session = Depends(get_db),
                _: User = Depends(get_current_active_user)):
    """List all drivers (any authenticated user)."""
    drivers = crud_driver.get_multi(db, skip=skip, limit=limit)
    return [_enrich(d, db) for d in drivers]


@router.get("/details/{driver_id}", response_model=DriverRead)
def get_driver(driver_id: int, db: Session = Depends(get_db),
               _: User = Depends(get_current_active_user)):
    d = crud_driver.get(db, driver_id)
    if not d:
        raise HTTPException(404, "Driver not found.")
    return _enrich(d, db)


@router.delete("/{driver_id}", status_code=204,
               dependencies=[Depends(require_role(UserRole.recycler, UserRole.admin))])
def delete_driver(driver_id: int, db: Session = Depends(get_db),
                  current_user: User = Depends(get_current_active_user)):
    """Recycler: remove a driver from their organisation."""
    from app.crud import crud_recycler as _crud_recycler
    recycler = _crud_recycler.get_by_user(db, current_user.id)
    if not recycler:
        raise HTTPException(404, "Recycler profile not found.")
    driver = crud_driver.get(db, driver_id)
    if not driver or driver.recycler_id != recycler.id:
        raise HTTPException(404, "Driver not found in your organisation.")
    # Unassign any active collections from this driver
    from app.models.collection import Collection
    db.query(Collection).filter(Collection.driver_id == driver_id).update(
        {Collection.driver_id: None, Collection.vehicle_id: None},
        synchronize_session=False,
    )
    db.commit()
    crud_driver.remove(db, id=driver_id)


@router.patch("/{driver_id}/vehicle", response_model=DriverRead,
              dependencies=[Depends(require_role(UserRole.recycler, UserRole.admin))])
def assign_vehicle_to_driver(driver_id: int, payload: dict, db: Session = Depends(get_db),
                              current_user: User = Depends(get_current_active_user)):
    """Recycler: assign (or unassign) a fleet vehicle to an existing driver."""
    from app.crud import crud_recycler as _crud_recycler
    recycler = _crud_recycler.get_by_user(db, current_user.id)
    if not recycler:
        raise HTTPException(404, "Recycler profile not found.")
    driver = crud_driver.get(db, driver_id)
    if not driver or driver.recycler_id != recycler.id:
        raise HTTPException(404, "Driver not found in your organisation.")
    vehicle_id = payload.get("vehicle_id")
    if vehicle_id is not None:
        v = crud_vehicle.get(db, vehicle_id)
        if not v or v.recycler_id != recycler.id:
            raise HTTPException(404, "Vehicle not found in your fleet.")
        driver.vehicle_id = vehicle_id
    else:
        driver.vehicle_id = None  # unassign
    db.commit()
    db.refresh(driver)
    return _enrich(driver, db)


@router.post("/{driver_id}/remind", status_code=200,
             dependencies=[Depends(require_role(UserRole.recycler, UserRole.admin))])
def remind_driver_to_login(driver_id: int, db: Session = Depends(get_db),
                            current_user: User = Depends(get_current_active_user)):
    """Send a login reminder email to a driver who has not yet signed in."""
    from app.services.email_service import send_driver_reminder_email
    recycler = crud_recycler.get_by_user(db, current_user.id)
    driver = crud_driver.get(db, driver_id)
    if not driver:
        raise HTTPException(404, "Driver not found.")
    if not driver.user:
        raise HTTPException(404, "Driver user account not found.")
    if recycler and driver.recycler_id != recycler.id:
        raise HTTPException(403, "Driver is not in your organisation.")
    if driver.user.last_login is not None:
        raise HTTPException(400, "Driver has already logged in to their account.")
    sent = send_driver_reminder_email(
        email=driver.user.email,
        full_name=driver.user.full_name or driver.user.email,
        recycler_name=current_user.full_name or "your recycling company",
    )
    if sent:
        return {"message": "Reminder email sent successfully.", "email_sent": True}
    # SMTP not configured — acknowledge the action but report the email wasn't delivered
    return {
        "message": "Reminder recorded. Email delivery failed — configure SMTP in server settings to enable email notifications.",
        "email_sent": False,
    }


@router.post("/{driver_id}/direction-alert", status_code=200,
             dependencies=[Depends(require_role(UserRole.recycler, UserRole.admin))])
def send_direction_alert(driver_id: int, payload: dict, db: Session = Depends(get_db),
                         current_user: User = Depends(get_current_active_user)):
    """Send an email alert to a driver when they are moving in the wrong direction."""
    from app.services.email_service import send_driver_wrong_direction_email
    recycler = crud_recycler.get_by_user(db, current_user.id)
    driver = crud_driver.get(db, driver_id)
    if not driver:
        raise HTTPException(404, "Driver not found.")
    if not driver.user:
        raise HTTPException(404, "Driver user account not found.")
    if recycler and driver.recycler_id != recycler.id:
        raise HTTPException(403, "Driver is not in your organisation.")

    message = (payload.get("message") or "").strip()
    if not message:
        raise HTTPException(400, "message is required.")

    destination = payload.get("destination")
    distance_km = payload.get("distance_km")
    try:
        distance_km = float(distance_km) if distance_km is not None else None
    except (TypeError, ValueError):
        distance_km = None

    sent = send_driver_wrong_direction_email(
        email=driver.user.email,
        full_name=driver.user.full_name or driver.user.email,
        recycler_name=current_user.full_name or "your recycling company",
        message=message,
        destination=destination,
        distance_km=distance_km,
    )
    if not sent:
        return {
            "message": "Alert recorded. Email delivery failed — configure SMTP in server settings to enable email notifications.",
            "email_sent": False,
        }
    return {"message": "Direction alert email sent successfully."}


@router.post("/{driver_id}/clear-assignments", status_code=200,
             dependencies=[Depends(require_role(UserRole.recycler, UserRole.admin))])
def clear_driver_assignments(driver_id: int, db: Session = Depends(get_db),
                             current_user: User = Depends(get_current_active_user)):
    """Recycler/Admin: remove all active assignments from a driver."""
    from app.models.collection import Collection, CollectionStatus

    recycler = crud_recycler.get_by_user(db, current_user.id)
    driver = crud_driver.get(db, driver_id)
    if not driver:
        raise HTTPException(404, "Driver not found.")
    if recycler and driver.recycler_id != recycler.id:
        raise HTTPException(403, "Driver is not in your organisation.")

    active_statuses = [
        CollectionStatus.scheduled,
        CollectionStatus.en_route,
        CollectionStatus.arrived,
        CollectionStatus.collected,
        CollectionStatus.verified,
    ]

    active_cols = (
        db.query(Collection)
        .filter(
            Collection.driver_id == driver_id,
            Collection.status.in_(active_statuses),
        )
        .all()
    )

    count = len(active_cols)
    for col in active_cols:
        col.driver_id = None
        col.vehicle_id = None
        col.status = CollectionStatus.scheduled

    db.commit()
    return {"message": "Assignments cleared.", "cleared_count": count}


# ── Vehicles ─────────────────────────────────────────────────────────────────

@router.post("/me/vehicles", response_model=VehicleRead, status_code=201,
             dependencies=[Depends(require_driver_role)])
def add_vehicle(payload: VehicleCreate, db: Session = Depends(get_db),
                current_user: User = Depends(get_current_active_user)):
    driver = crud_driver.get_by_user(db, current_user.id)
    if not driver:
        raise HTTPException(404, "No driver profile found.")
    return crud_vehicle.create(db, obj_in=payload, driver_id=driver.id)


@router.get("/me/vehicles", response_model=list[VehicleRead],
            dependencies=[Depends(require_driver_role)])
def list_my_vehicles(db: Session = Depends(get_db),
                     current_user: User = Depends(get_current_active_user)):
    driver = crud_driver.get_by_user(db, current_user.id)
    if not driver:
        return []
    return crud_vehicle.get_by_driver(db, driver.id)


# ── Fleet Vehicles (recycler-managed) ────────────────────────────────────────

@router.get("/fleet-vehicles", response_model=list[VehicleRead],
            dependencies=[Depends(require_role(UserRole.recycler, UserRole.admin))])
def list_fleet_vehicles(db: Session = Depends(get_db),
                        current_user: User = Depends(get_current_active_user)):
    """Recycler: list all vehicles in their fleet."""
    recycler = _get_or_create_recycler_profile(db, current_user)
    return crud_vehicle.get_by_recycler(db, recycler.id)


@router.post("/fleet-vehicles", response_model=VehicleRead, status_code=201,
             dependencies=[Depends(require_role(UserRole.recycler, UserRole.admin))])
def create_fleet_vehicle(payload: VehicleCreate, db: Session = Depends(get_db),
                         current_user: User = Depends(get_current_active_user)):
    """Recycler: register a new vehicle in their fleet."""
    recycler = _get_or_create_recycler_profile(db, current_user)
    return crud_vehicle.create(db, obj_in=payload, recycler_id=recycler.id)


@router.delete("/fleet-vehicles/{vehicle_id}", status_code=204,
               dependencies=[Depends(require_role(UserRole.recycler, UserRole.admin))])
def delete_fleet_vehicle(vehicle_id: int, db: Session = Depends(get_db),
                         current_user: User = Depends(get_current_active_user)):
    """Recycler: remove a vehicle from their fleet."""
    recycler = _get_or_create_recycler_profile(db, current_user)
    v = crud_vehicle.get(db, vehicle_id)
    if not v or v.recycler_id != recycler.id:
        raise HTTPException(404, "Vehicle not found in your fleet.")
    assigned_driver = db.query(Driver).filter(Driver.vehicle_id == vehicle_id).first()
    if assigned_driver:
        raise HTTPException(409, "Cannot delete vehicle while assigned to a driver. Unassign it first.")
    # Unassign vehicle from any drivers before deleting to avoid FK constraint
    db.query(Driver).filter(Driver.vehicle_id == vehicle_id).update(
        {Driver.vehicle_id: None}, synchronize_session=False
    )
    from app.models.collection import Collection
    db.query(Collection).filter(Collection.vehicle_id == vehicle_id).update(
        {Collection.vehicle_id: None}, synchronize_session=False
    )
    db.commit()
    crud_vehicle.remove(db, id=vehicle_id)


# ── Recycler: register a new driver account ───────────────────────────────────

@router.post("/register", response_model=DriverRead, status_code=201,
             dependencies=[Depends(require_role(UserRole.recycler, UserRole.admin))])
def register_driver(
    payload: DriverRegisterByRecycler,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Recycler creates a driver account.

    - Checks for duplicate email.
    - Creates a User(role=driver) with a random temporary password.
    - Creates a Driver profile linked to the recycler.
    - Sends a welcome email with the temp password.
    - Driver is forced to change their password on first login.
    """
    from app.crud import crud_recycler as _crud_recycler
    from app.services.email_service import send_driver_welcome_email

    recycler = _crud_recycler.get_by_user(db, current_user.id)
    if not recycler:
        raise HTTPException(404, "Recycler profile not found.")

    if crud_user.get_by_email(db, payload.email):
        raise HTTPException(409, "Email already registered.")

    # Create user + get temp password
    user, temp_password = crud_user.create_driver_user(
        db,
        full_name=payload.full_name,
        email=payload.email,
        phone=payload.phone,
    )

    # Create driver profile linked to this recycler
    driver = crud_driver.create(
        db,
        obj_in=DriverCreate(
            license_number=payload.license_number,
            phone=payload.phone,
        ),
        user_id=user.id,
        recycler_id=recycler.id,
    )

    # Optionally link a vehicle
    if payload.vehicle_id:
        v = crud_vehicle.get(db, payload.vehicle_id)
        if v and v.recycler_id == recycler.id:
            driver.vehicle_id = payload.vehicle_id
            db.commit()
            db.refresh(driver)

    # Send welcome email (non-blocking on failure)
    try:
        send_driver_welcome_email(
            email=user.email,
            full_name=user.full_name,
            temp_password=temp_password,
        )
    except Exception as exc:  # pragma: no cover
        import logging
        logging.getLogger(__name__).warning("Welcome email failed: %s", exc)

    return _enrich(driver, db)


# ── Driver: update live GPS location ─────────────────────────────────────────

@router.patch("/me/location", response_model=DriverRead,
              dependencies=[Depends(require_driver_role)])
def update_location(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Driver pushes their current GPS coordinates."""
    driver = crud_driver.get_by_user(db, current_user.id)
    if not driver:
        raise HTTPException(404, "No driver profile found.")
    lat = payload.get("lat")
    lng = payload.get("lng")
    if lat is None or lng is None:
        raise HTTPException(400, "lat and lng are required.")
    driver.current_lat = float(lat)
    driver.current_lng = float(lng)
    db.commit()
    db.refresh(driver)
    return _enrich(driver, db)


# ── Recycler: list their own drivers ─────────────────────────────────────────

@router.get("/my-recycler", response_model=list[DriverRead],
            dependencies=[Depends(require_role(UserRole.recycler, UserRole.admin))])
def get_my_recycler_drivers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Recycler: get all drivers belonging to their organisation."""
    from app.crud import crud_recycler as _crud_recycler
    recycler = _crud_recycler.get_by_user(db, current_user.id)
    if not recycler:
        raise HTTPException(404, "Recycler profile not found.")
    drivers = crud_driver.get_by_recycler(db, recycler.id)
    return [_enrich(d, db) for d in drivers]
