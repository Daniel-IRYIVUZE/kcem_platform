"""routes/hotels.py — Hotel profile endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.crud import crud_hotel
from app.auth.dependencies import get_current_active_user, require_role
from app.schemas.hotel import HotelCreate, HotelUpdate, HotelRead
from app.models.user import User, UserRole

router = APIRouter(prefix="/hotels", tags=["Hotels"])
require_business = require_role(UserRole.business, UserRole.admin)


@router.post("/", response_model=HotelRead, status_code=201,
             dependencies=[Depends(require_business)])
def create_hotel(payload: HotelCreate, db: Session = Depends(get_db),
                 current_user: User = Depends(get_current_active_user)):
    if crud_hotel.get_by_user(db, current_user.id):
        raise HTTPException(409, "Hotel profile already exists for this account.")
    return crud_hotel.create(db, obj_in=payload, user_id=current_user.id)


@router.get("/me", response_model=HotelRead,
            dependencies=[Depends(require_business)])
def my_hotel(db: Session = Depends(get_db),
             current_user: User = Depends(get_current_active_user)):
    hotel = crud_hotel.get_by_user(db, current_user.id)
    if not hotel:
        raise HTTPException(404, "No hotel profile found.")
    return hotel


@router.patch("/me", response_model=HotelRead,
              dependencies=[Depends(require_business)])
def update_hotel(payload: HotelUpdate, db: Session = Depends(get_db),
                 current_user: User = Depends(get_current_active_user)):
    hotel = crud_hotel.get_by_user(db, current_user.id)
    if not hotel:
        raise HTTPException(404, "No hotel profile found.")
    return crud_hotel.update(db, db_obj=hotel, obj_in=payload)


@router.get("/", response_model=list[HotelRead])
def list_hotels(city: str | None = None, skip: int = 0, limit: int = 20,
                db: Session = Depends(get_db)):
    if city:
        return crud_hotel.get_by_city(db, city, skip=skip, limit=limit)
    return crud_hotel.get_multi(db, skip=skip, limit=limit)


@router.get("/{hotel_id}", response_model=HotelRead)
def get_hotel(hotel_id: int, db: Session = Depends(get_db)):
    hotel = crud_hotel.get(db, hotel_id)
    if not hotel:
        raise HTTPException(404, "Hotel not found.")
    return hotel
