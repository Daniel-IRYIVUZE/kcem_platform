"""routes/drivers.py — Driver & vehicle endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.crud import crud_driver, crud_vehicle
from app.auth.dependencies import get_current_active_user, require_role
from app.schemas.driver import DriverCreate, DriverUpdate, DriverRead, VehicleCreate, VehicleUpdate, VehicleRead
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
        if not base.phone and driver.user.phone:
            base.phone = driver.user.phone
    if driver.vehicle_id:
        v = db.query(Vehicle).filter(Vehicle.id == driver.vehicle_id).first()
        if v:
            base.vehicle_type = v.vehicle_type
            base.plate_number = v.plate_number
            base.capacity_kg = v.capacity_kg
    return base


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


@router.get("/{driver_id}", response_model=DriverRead)
def get_driver(driver_id: int, db: Session = Depends(get_db),
               _: User = Depends(get_current_active_user)):
    d = crud_driver.get(db, driver_id)
    if not d:
        raise HTTPException(404, "Driver not found.")
    return _enrich(d, db)


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
