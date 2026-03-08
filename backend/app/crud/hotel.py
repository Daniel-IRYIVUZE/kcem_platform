"""crud/hotel.py — Hotel profile CRUD."""
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.hotel import Hotel
from app.schemas.hotel import HotelCreate, HotelUpdate


class CRUDHotel(CRUDBase[Hotel, HotelCreate, HotelUpdate]):

    def get_by_user(self, db: Session, user_id: int) -> Hotel | None:
        return db.query(Hotel).filter(Hotel.user_id == user_id).first()

    def get_by_city(self, db: Session, city: str, *, skip: int = 0, limit: int = 20) -> list[Hotel]:
        return (db.query(Hotel)
                .filter(Hotel.city.ilike(f"%{city}%"))
                .offset(skip).limit(limit).all())

    def increment_listing_count(self, db: Session, hotel_id: int) -> None:
        """No-op placeholder — listing count derived from relationship."""
        pass

    def increment_collection_count(self, db: Session, hotel_id: int) -> None:
        """No-op placeholder — collection count derived from relationship."""
        pass


crud_hotel = CRUDHotel(Hotel)
