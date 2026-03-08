"""routes/collections.py — Waste collection lifecycle endpoints."""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app.crud import crud_collection, crud_driver, crud_hotel, crud_recycler
from app.auth.dependencies import get_current_active_user, require_role
from app.schemas.collection import CollectionCreate, CollectionRead
from app.models.user import User, UserRole
from app.services.notification_service import notify_collection_status, notify_driver_assigned
from app.services.green_score_service import update_score
from app.utils.file_upload import save_upload

router = APIRouter(prefix="/collections", tags=["Collections"])


@router.post("/", response_model=CollectionRead, status_code=201,
             dependencies=[Depends(require_role(UserRole.recycler, UserRole.admin))])
def create_collection(payload: CollectionCreate, db: Session = Depends(get_db),
                      current_user: User = Depends(get_current_active_user)):
    return crud_collection.create(db, obj_in=payload)


@router.get("/mine", response_model=list[CollectionRead])
def my_collections(skip: int = 0, limit: int = 20, db: Session = Depends(get_db),
                   current_user: User = Depends(get_current_active_user)):
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
    
    if not driver_id or not vehicle_id:
        raise HTTPException(400, "driver_id and vehicle_id required.")
    
    # Verify driver exists and belongs to recycler
    driver = crud_driver.get(db, driver_id)
    if not driver or driver.recycler_id != recycler.id:
        raise HTTPException(403, "Driver not in your organization.")
    
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
    col = crud_collection.advance_status(db, collection_id=collection_id, new_status=new_status,
                                         notes=payload.get("notes"))
    # Notify hotel owner
    notify_collection_status(db, user_id=col.listing.hotel.user_id,
                             status=new_status, collection_id=col.id)
    # If completed, update green score
    if new_status == "completed" and col.listing:
        listing = col.listing
        update_score(db, user_id=listing.hotel.user_id,
                     waste_type=listing.waste_type.value, kg=listing.volume_kg or 0)
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
        notify_driver_assigned(db, driver_user_id=driver.user_id,
                               hotel_name=col.listing.hotel.hotel_name if (col.listing and col.listing.hotel) else "Hotel",
                               waste_type=col.listing.waste_type.value if col.listing else "Waste",
                               volume=col.listing.volume if col.listing else 0,
                               collection_id=col.id)
    except Exception:
        pass  # Notification failure is non-critical
    return col
