"""routes/collections.py — Waste collection lifecycle endpoints."""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app.crud import crud_collection, crud_driver, crud_hotel, crud_recycler
from app.auth.dependencies import get_current_active_user, require_role
from app.schemas.collection import CollectionCreate, CollectionRead
from app.models.collection import CollectionStatus
from app.models.user import User, UserRole
from app.services.notification_service import notify_collection_status, notify_driver_assigned
from app.services.green_score_service import update_score
from app.utils.file_upload import save_upload
from app.services.assignment_service import auto_assign_collections
from app.services.email_service import send_driver_assigned_notification_email

router = APIRouter(prefix="/collections", tags=["Collections"])


@router.get("/", response_model=list[CollectionRead],
            dependencies=[Depends(require_role(UserRole.admin))])
def list_all_collections(skip: int = 0, limit: int = 500, db: Session = Depends(get_db),
                         _: User = Depends(get_current_active_user)):
    """Admin-only: returns every collection on the platform."""
    return crud_collection.get_multi(db, skip=skip, limit=limit)


@router.post("/", response_model=CollectionRead, status_code=201,
             dependencies=[Depends(require_role(UserRole.recycler, UserRole.admin))])
def create_collection(payload: CollectionCreate, db: Session = Depends(get_db),
                      current_user: User = Depends(get_current_active_user)):
    return crud_collection.create(db, obj_in=payload)


@router.get("/mine", response_model=list[CollectionRead])
def my_collections(skip: int = 0, limit: int = 20, db: Session = Depends(get_db),
                   current_user: User = Depends(get_current_active_user)):
    if current_user.role == UserRole.admin:
        return crud_collection.get_multi(db, skip=skip, limit=limit)
    if current_user.role == UserRole.driver:
        driver = crud_driver.get_by_user(db, current_user.id)
        return crud_collection.get_by_driver(db, driver.id, skip=skip, limit=limit) if driver else []
    if current_user.role == UserRole.business:
        hotel = crud_hotel.get_by_user(db, current_user.id)
        return crud_collection.get_by_hotel(db, hotel.id, skip=skip, limit=limit) if hotel else []
    if current_user.role == UserRole.recycler:
        rec = crud_recycler.get_by_user(db, current_user.id)
        return crud_collection.get_by_recycler(db, rec.id, skip=skip, limit=limit) if rec else []
    return []


@router.get("/{collection_id}", response_model=CollectionRead)
def get_collection(collection_id: int, db: Session = Depends(get_db),
                   _: User = Depends(get_current_active_user)):
    col = crud_collection.get(db, collection_id)
    if not col:
        raise HTTPException(404, "Collection not found.")
    return col


@router.post("/{collection_id}/assign-driver", response_model=CollectionRead,
             dependencies=[Depends(require_role(UserRole.recycler, UserRole.admin))])
def assign_driver(collection_id: int, payload: dict, db: Session = Depends(get_db),
                  current_user: User = Depends(get_current_active_user)):
    """Assign an available driver to a collection."""
    col = crud_collection.get(db, collection_id)
    if not col:
        raise HTTPException(404, "Collection not found.")
    
    # Verify recycler owns this collection
    recycler = crud_recycler.get_by_user(db, current_user.id)
    if not recycler or col.recycler_id != recycler.id:
        raise HTTPException(403, "Not your collection.")
    
    driver_id = payload.get("driver_id")
    vehicle_id = payload.get("vehicle_id")

    if not driver_id:
        raise HTTPException(400, "driver_id is required.")

    # Verify driver exists and belongs to recycler
    driver = crud_driver.get(db, driver_id)
    if not driver:
        raise HTTPException(403, "Driver not in your organization.")

    # Fall back to the driver's own vehicle if none specified
    if not vehicle_id:
        vehicle_id = driver.vehicle_id

    # Assign driver
    col = crud_collection.assign_driver(db, collection_id=collection_id,
                                       driver_id=driver_id, vehicle_id=vehicle_id)
    
    # Notify driver
    notify_driver_assigned(db, driver_user_id=driver.user_id,
                          hotel_name=col.listing.hotel.hotel_name if col.listing.hotel else "Unknown",
                          waste_type=col.listing.waste_type.value if col.listing else "Waste",
                          volume=col.listing.volume if col.listing else 0,
                          collection_id=col.id)
    
    return col


@router.post("/{collection_id}/advance", response_model=CollectionRead,
             dependencies=[Depends(require_role(UserRole.driver, UserRole.recycler, UserRole.admin))])
def advance_status(collection_id: int, payload: dict, db: Session = Depends(get_db),
                   current_user: User = Depends(get_current_active_user)):
    col = crud_collection.get(db, collection_id)
    if not col:
        raise HTTPException(404, "Collection not found.")
    new_status = payload.get("status")
    actual_weight = payload.get("actual_weight") or payload.get("actual_volume")
    col = crud_collection.advance_status(db, collection_id=collection_id, new_status=new_status,
                                         notes=payload.get("notes"),
                                         actual_volume=float(actual_weight) if actual_weight is not None else None)
    # Notify hotel owner using the actual resulting status
    notify_collection_status(db, user_id=col.listing.hotel.user_id,
                             status=col.status.value if col.status else None, collection_id=col.id)
    # If completed, update green score and recycler totals
    if col.status == CollectionStatus.completed and col.listing:
        listing = col.listing
        vol_kg = col.actual_volume or listing.volume or 0
        update_score(db, user_id=listing.hotel.user_id,
                     waste_type=listing.waste_type.value, kg=vol_kg)
        # Also update the recycler's accumulated stats
        if col.recycler_id:
            recycler = crud_recycler.get(db, col.recycler_id)
            if recycler:
                recycler.total_collected = (recycler.total_collected or 0.0) + vol_kg
                # Green score: 0.5 pts per kg collected + 5 bonus per collection, capped at 100
                recycler.green_score = min(
                    100.0,
                    (recycler.green_score or 0.0) + vol_kg * 0.5 + 5.0,
                )
                db.commit()
    return col


@router.post("/{collection_id}/proofs", status_code=201)
def add_proof(collection_id: int, file: UploadFile = File(...),
              db: Session = Depends(get_db),
              current_user: User = Depends(get_current_active_user)):
    url = save_upload(file, subfolder="proofs")
    proof = crud_collection.add_proof(db, collection_id=collection_id, image_url=url,
                                     description=None, uploaded_by=current_user.id)
    return proof


# ── Hotel-facing: request / assign a driver to a collection ──────────────────

@router.post("/{collection_id}/request-driver", response_model=CollectionRead,
             dependencies=[Depends(require_role(UserRole.business, UserRole.admin))])
def hotel_request_driver(collection_id: int, payload: dict, db: Session = Depends(get_db),
                         current_user: User = Depends(get_current_active_user)):
    """Hotel/business can request a specific driver for their own collection."""
    col = crud_collection.get(db, collection_id)
    if not col:
        raise HTTPException(404, "Collection not found.")
    # Verify the hotel owns this collection (via listing)
    hotel = crud_hotel.get_by_user(db, current_user.id)
    if hotel and col.listing and col.listing.hotel_id != hotel.id:
        raise HTTPException(403, "Not your collection.")

    driver_id = payload.get("driver_id")
    vehicle_id = payload.get("vehicle_id")
    if not driver_id:
        raise HTTPException(400, "driver_id is required.")

    driver = crud_driver.get(db, driver_id)
    if not driver:
        raise HTTPException(404, "Driver not found.")

    # Use vehicle_id if provided, else fall back to driver's own vehicle
    if not vehicle_id:
        vehicle_id = driver.vehicle_id
    if not vehicle_id:
        raise HTTPException(400, "driver has no vehicle; please supply vehicle_id.")

    col = crud_collection.assign_driver(db, collection_id=collection_id,
                                        driver_id=driver_id, vehicle_id=vehicle_id)
    try:
        hotel_name = col.listing.hotel.hotel_name if (col.listing and col.listing.hotel) else "Hotel"
        hotel_address = col.listing.hotel.address if (col.listing and col.listing.hotel) else ""
        waste_type = col.listing.waste_type.value if col.listing else "Waste"
        volume = col.listing.volume if col.listing else 0
        notify_driver_assigned(db, driver_user_id=driver.user_id,
                               hotel_name=hotel_name,
                               waste_type=waste_type,
                               volume=volume,
                               collection_id=col.id)
        # Also send email notification if the driver has an email address
        if driver.user and driver.user.email:
            send_driver_assigned_notification_email(
                email=driver.user.email,
                driver_name=driver.user.full_name,
                hotel_name=hotel_name,
                hotel_address=hotel_address,
                waste_type=waste_type,
                volume=volume,
                scheduled_date=col.scheduled_date.isoformat() if col.scheduled_date else None,
                collection_id=col.id,
            )
    except Exception:
        pass  # Notification failure is non-critical
    return col


# ── Auto-assignment: nearest available driver per waste location ──────────────

@router.post(
    "/auto-assign",
    response_model=list[dict],
    dependencies=[Depends(require_role(UserRole.recycler, UserRole.admin))],
    summary="Auto-assign nearest driver to each unassigned collection",
    description=(
        "Uses the Haversine (geodesic) distance formula to match every unassigned, "
        "geo-coded collection to the nearest available driver that has current GPS "
        "coordinates.  Pass `apply=true` to persist the assignments.  "
        "Pass `balance_load=true` to spread assignments more evenly across drivers."
    ),
)
def auto_assign(
    balance_load: bool = False,
    apply: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Preview or apply nearest-driver assignment for all pending collections.

    Query params
    ------------
    balance_load : bool (default false)
        Add a 500 m workload penalty per already-assigned collection so that
        drivers with fewer assignments are preferred when distances are similar.
    apply : bool (default false)
        When true, writes the driver assignments to the database.
        When false (default), returns a preview without touching the DB.
    """
    recycler = crud_recycler.get_by_user(db, current_user.id)
    if not recycler and current_user.role != UserRole.admin:
        raise HTTPException(403, "Recycler profile not found.")

    recycler_id = recycler.id if recycler else None
    if recycler_id is None:
        raise HTTPException(400, "Admin must specify a recycler context.")

    try:
        results = auto_assign_collections(
            db,
            recycler_id=recycler_id,
            balance_load=balance_load,
            apply=apply,
        )
    except ValueError as exc:
        raise HTTPException(422, str(exc))

    # Send assignment notifications to each assigned driver (only when applying)
    if apply:
        for item in results:
            try:
                col = crud_collection.get(db, item["collection_id"])
                if col and col.driver:
                    notify_driver_assigned(
                        db,
                        driver_user_id=col.driver.user_id,
                        hotel_name=item["location"].get("label", "Hotel"),
                        waste_type=item["location"].get("waste_type", "Waste"),
                        volume=item["location"].get("volume") or 0,
                        collection_id=col.id,
                    )
            except Exception:  # pragma: no cover
                pass

    return results


# ── Live collection tracking ──────────────────────────────────────────────────

@router.get("/{collection_id}/tracking")
def get_collection_tracking(
    collection_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_active_user),
):
    """Return real-time tracking data for a collection.

    Used by the driver (to see the collection/hotel location on the map) and
    by the hotel (to see the driver's live GPS position + ETA).

    Response fields
    ---------------
    hotel_lat / hotel_lng : float | null   — waste pickup location
    driver_lat / driver_lng : float | null — driver's last-known position
    distance_m : int | null                — straight-line distance (metres)
    eta_minutes : int | null               — estimated time (30 km/h average)
    """
    from app.services.assignment_service import haversine_m

    col = crud_collection.get(db, collection_id)
    if not col:
        raise HTTPException(404, "Collection not found.")

    hotel_lat = hotel_lng = hotel_name = hotel_address = None

    if col.listing and col.listing.hotel:
        hotel_lat = col.listing.hotel.latitude
        hotel_lng = col.listing.hotel.longitude
        hotel_name = col.listing.hotel.hotel_name
        hotel_address = col.listing.hotel.address

    driver_lat = driver_lng = driver_name = None
    distance_m = eta_minutes = None

    if col.driver:
        driver_lat = col.driver.current_lat
        driver_lng = col.driver.current_lng
        driver_name = col.driver.user.full_name if col.driver.user else None

        if driver_lat and driver_lng and hotel_lat and hotel_lng:
            dist = haversine_m(driver_lat, driver_lng, hotel_lat, hotel_lng)
            distance_m = round(dist)
            # 30 km/h city average → seconds = metres / (30_000/3600)
            eta_minutes = max(1, round(dist / (30_000 / 60)))

    return {
        "collection_id": col.id,
        "status": col.status.value if col.status else None,
        "hotel_lat": hotel_lat,
        "hotel_lng": hotel_lng,
        "hotel_name": hotel_name,
        "hotel_address": hotel_address,
        "driver_lat": driver_lat,
        "driver_lng": driver_lng,
        "driver_name": driver_name,
        "distance_m": distance_m,
        "eta_minutes": eta_minutes,
    }
