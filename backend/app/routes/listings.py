"""routes/listings.py — Waste listing (marketplace) endpoints."""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app.crud import crud_listing, crud_hotel
from app.auth.dependencies import get_current_active_user, require_role
from app.schemas.listing import ListingCreate, ListingUpdate, ListingRead
from app.models.user import User, UserRole
from app.utils.file_upload import save_upload

router = APIRouter(prefix="/listings", tags=["Listings"])
require_business = require_role(UserRole.business, UserRole.admin)


@router.post("/", response_model=ListingRead, status_code=201,
             dependencies=[Depends(require_business)])
def create_listing(payload: ListingCreate, db: Session = Depends(get_db),
                   current_user: User = Depends(get_current_active_user)):
    hotel = crud_hotel.get_by_user(db, current_user.id)
    if not hotel:
        raise HTTPException(400, "You must have a hotel profile to list waste.")
    listing = crud_listing.create(db, obj_in=payload, hotel_id=hotel.id)
    # Always use the hotel's exact coordinates so all listings cluster together on the map
    if hotel.latitude and hotel.longitude:
        listing.latitude  = hotel.latitude
        listing.longitude = hotel.longitude
        listing.address   = listing.address or hotel.address
        db.commit()
    crud_hotel.increment_listing_count(db, hotel.id)
    return listing


@router.get("/", response_model=list[ListingRead])
def list_listings(waste_type: str | None = None, search: str | None = None,
                  min_volume: float | None = None, skip: int = 0, limit: int = 20,
                  db: Session = Depends(get_db)):
    return crud_listing.get_open(db, waste_type=waste_type, search=search,
                                 min_volume=min_volume, skip=skip, limit=limit)


@router.get("/mine", response_model=list[ListingRead],
            dependencies=[Depends(require_business)])
def my_listings(skip: int = 0, limit: int = 20, db: Session = Depends(get_db),
                current_user: User = Depends(get_current_active_user)):
    hotel = crud_hotel.get_by_user(db, current_user.id)
    if not hotel:
        return []
    return crud_listing.get_by_hotel(db, hotel.id, skip=skip, limit=limit)


@router.get("/{listing_id}", response_model=ListingRead)
def get_listing(listing_id: int, db: Session = Depends(get_db)):
    listing = crud_listing.get(db, listing_id)
    if not listing:
        raise HTTPException(404, "Listing not found.")
    crud_listing.increment_view(db, listing=listing)
    return listing


@router.patch("/{listing_id}", response_model=ListingRead,
              dependencies=[Depends(require_business)])
def update_listing(listing_id: int, payload: ListingUpdate,
                   db: Session = Depends(get_db),
                   current_user: User = Depends(get_current_active_user)):
    listing = _get_listing_owned(db, listing_id, current_user)
    return crud_listing.update(db, db_obj=listing, obj_in=payload)


@router.delete("/{listing_id}", status_code=204,
               dependencies=[Depends(require_business)])
def delete_listing(listing_id: int, db: Session = Depends(get_db),
                   current_user: User = Depends(get_current_active_user)):
    listing = _get_listing_owned(db, listing_id, current_user)
    crud_listing.remove(db, id=listing.id)


@router.post("/{listing_id}/images", status_code=201,
             dependencies=[Depends(require_business)])
def add_image(listing_id: int, file: UploadFile = File(...),
              db: Session = Depends(get_db),
              current_user: User = Depends(get_current_active_user)):
    listing = _get_listing_owned(db, listing_id, current_user)
    url = save_upload(file, subfolder="listings")
    img = crud_listing.add_image(db, listing_id=listing.id, url=url)
    return img


def _get_listing_owned(db, listing_id, current_user):
    listing = crud_listing.get(db, listing_id)
    if not listing:
        raise HTTPException(404, "Listing not found.")
    hotel = crud_hotel.get_by_user(db, current_user.id)
    if not hotel or listing.hotel_id != hotel.id:
        raise HTTPException(403, "Not your listing.")
    return listing
