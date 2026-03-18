"""routes/listings.py — Waste listing (marketplace) endpoints."""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Response
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.crud import crud_listing, crud_hotel
from app.auth.dependencies import get_current_active_user, require_role
from app.schemas.listing import ListingCreate, ListingUpdate, ListingRead
from app.schemas.hotel import HotelCreate
from app.models.user import User, UserRole
from app.utils.file_upload import save_upload

router = APIRouter(prefix="/listings", tags=["Listings"])
require_business = require_role(UserRole.business, UserRole.admin)
MAX_LISTING_IMAGES = 5


@router.post("/", response_model=ListingRead, status_code=201,
             dependencies=[Depends(require_business)])
def create_listing(payload: ListingCreate, db: Session = Depends(get_db),
                   current_user: User = Depends(get_current_active_user)):
    hotel = crud_hotel.get_by_user(db, current_user.id)
    if not hotel:
        # Backward compatibility: listing ownership is still linked via `hotels` table.
        # Auto-provision a minimal business profile so business users can list immediately.
        hotel = crud_hotel.create(
            db,
            obj_in=HotelCreate(
                hotel_name=f"{(current_user.full_name or 'Business').strip()} Business",
                address=(payload.address or "Kigali").strip(),
                city="Kigali",
                phone=current_user.phone,
                latitude=payload.latitude,
                longitude=payload.longitude,
            ),
            user_id=current_user.id,
        )
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
    if len(listing.images) >= MAX_LISTING_IMAGES:
        raise HTTPException(400, f"Each listing can have at most {MAX_LISTING_IMAGES} images.")
    url = save_upload(file, subfolder="listings")
    img = crud_listing.add_image(db, listing_id=listing.id, url=url)
    if not listing.image_url:
        listing.image_url = url
        db.commit()
    return img


@router.get("/{listing_id}/images/{image_id}")
def get_image(listing_id: int, image_id: int, db: Session = Depends(get_db)):
    listing = crud_listing.get(db, listing_id)
    if not listing:
        raise HTTPException(404, "Listing not found.")

    image = crud_listing.get_image(db, listing_id=listing.id, image_id=image_id)
    if not image or not image.url:
        raise HTTPException(404, "Image not found.")

    current_path = f"/api/listings/{listing_id}/images/{image_id}"
    if image.url == current_path:
        raise HTTPException(404, "Image source not available.")

    return RedirectResponse(url=image.url, status_code=302)


@router.patch("/{listing_id}/images/{image_id}/primary", status_code=200,
              dependencies=[Depends(require_business)])
def set_primary_image(listing_id: int, image_id: int,
                      db: Session = Depends(get_db),
                      current_user: User = Depends(get_current_active_user)):
    listing = _get_listing_owned(db, listing_id, current_user)
    image = crud_listing.set_primary_image(db, listing=listing, image_id=image_id)
    if not image:
        raise HTTPException(404, "Image not found.")
    return image


@router.delete("/{listing_id}/images/{image_id}", status_code=204,
               dependencies=[Depends(require_business)])
def delete_image(listing_id: int, image_id: int,
                 db: Session = Depends(get_db),
                 current_user: User = Depends(get_current_active_user)):
    listing = crud_listing.get(db, listing_id)
    if not listing:
        return Response(status_code=204)

    hotel = crud_hotel.get_by_user(db, current_user.id)
    if not hotel or listing.hotel_id != hotel.id:
        raise HTTPException(403, "Not your listing.")

    removed = crud_listing.remove_image(db, listing=listing, image_id=image_id)
    if not removed:
        return Response(status_code=204)
    return Response(status_code=204)


def _get_listing_owned(db, listing_id, current_user):
    listing = crud_listing.get(db, listing_id)
    if not listing:
        raise HTTPException(404, "Listing not found.")
    hotel = crud_hotel.get_by_user(db, current_user.id)
    if not hotel or listing.hotel_id != hotel.id:
        raise HTTPException(403, "Not your listing.")
    return listing
