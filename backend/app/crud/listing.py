"""crud/listing.py — WasteListing CRUD operations."""
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.crud.base import CRUDBase
from app.models.listing import WasteListing, WasteType, ListingStatus, ListingImage
from app.schemas.listing import ListingCreate, ListingUpdate


class CRUDListing(CRUDBase[WasteListing, ListingCreate, ListingUpdate]):

    def get_by_hotel(self, db: Session, hotel_id: int, *, status: ListingStatus | None = None,
                     skip: int = 0, limit: int = 20) -> list[WasteListing]:
        q = db.query(WasteListing).filter(WasteListing.hotel_id == hotel_id)
        if status:
            q = q.filter(WasteListing.status == status)
        return q.order_by(WasteListing.created_at.desc()).offset(skip).limit(limit).all()

    def get_open(self, db: Session, *, skip: int = 0, limit: int = 20,
                 waste_type: WasteType | None = None,
                 search: str | None = None,
                 min_volume: float | None = None,
                 city: str | None = None) -> list[WasteListing]:
        q = db.query(WasteListing).filter(WasteListing.status == ListingStatus.open)
        if waste_type:
            q = q.filter(WasteListing.waste_type == waste_type)
        if search:
            pattern = f"%{search}%"
            q = q.filter(
                or_(WasteListing.title.ilike(pattern),
                    WasteListing.description.ilike(pattern))
            )
        if min_volume:
            q = q.filter(WasteListing.volume >= min_volume)
        return q.order_by(WasteListing.created_at.desc()).offset(skip).limit(limit).all()

    def increment_view(self, db: Session, *, listing: WasteListing) -> WasteListing:
        listing.view_count = (listing.view_count or 0) + 1
        db.commit()
        return listing

    def update_bid_stats(self, db: Session, *, listing: WasteListing, new_bid_amount: float) -> WasteListing:
        listing.bid_count = (listing.bid_count or 0) + 1
        if new_bid_amount > (listing.highest_bid or 0):
            listing.highest_bid = new_bid_amount
        db.commit()
        db.refresh(listing)
        return listing

    def accept_bid(self, db: Session, *, listing: WasteListing, bid_id: int) -> WasteListing:
        listing.accepted_bid_id = bid_id
        listing.status = ListingStatus.accepting
        db.commit()
        db.refresh(listing)
        return listing

    def add_image(self, db: Session, *, listing_id: int, url: str, is_primary: bool = False) -> ListingImage:
        img = ListingImage(listing_id=listing_id, url=url, is_primary=is_primary)
        db.add(img)
        db.commit()
        db.refresh(img)
        return img

    def count_by_status(self, db: Session) -> dict:
        from sqlalchemy import func
        rows = db.query(WasteListing.status, func.count(WasteListing.id))\
                 .group_by(WasteListing.status).all()
        return {r[0]: r[1] for r in rows}


crud_listing = CRUDListing(WasteListing)
