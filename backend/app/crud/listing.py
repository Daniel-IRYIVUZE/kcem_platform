"""crud/listing.py — WasteListing CRUD operations."""
import uuid
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.crud.base import CRUDBase
from app.models.listing import WasteListing, WasteType, ListingStatus, ListingImage
from app.schemas.listing import ListingCreate, ListingUpdate


class CRUDListing(CRUDBase[WasteListing, ListingCreate, ListingUpdate]):

    def create(self, db: Session, *, obj_in: ListingCreate, **extra) -> WasteListing:
        """Create a listing and auto-generate a unique QR token."""
        data = obj_in.model_dump(exclude_unset=True)
        data.update(extra)
        data.setdefault('qr_token', str(uuid.uuid4()))
        db_obj = WasteListing(**data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

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

    def accept_bid(self, db: Session, *, listing: WasteListing, bid_id: int,
                   partial: bool = False) -> WasteListing:
        listing.accepted_bid_id = bid_id
        if not partial:
            # Full acceptance — close the listing to new bids
            listing.status = ListingStatus.accepting
        # For partial bids the listing stays 'open' so remaining volume can attract new bids
        db.commit()
        db.refresh(listing)
        return listing

    def add_image(self, db: Session, *, listing_id: int, url: str, is_primary: bool = False) -> ListingImage:
        img = ListingImage(listing_id=listing_id, url=url, is_primary=is_primary)
        db.add(img)
        db.commit()
        db.refresh(img)
        return img

    def get_image(self, db: Session, *, listing_id: int, image_id: int) -> ListingImage | None:
        return db.query(ListingImage).filter(
            ListingImage.listing_id == listing_id,
            ListingImage.id == image_id,
        ).first()

    def set_primary_image(self, db: Session, *, listing: WasteListing, image_id: int) -> ListingImage | None:
        image = self.get_image(db, listing_id=listing.id, image_id=image_id)
        if not image:
            return None

        for item in listing.images:
            item.is_primary = item.id == image_id

        listing.image_url = image.url
        db.commit()
        db.refresh(image)
        return image

    def remove_image(self, db: Session, *, listing: WasteListing, image_id: int) -> bool:
        image = self.get_image(db, listing_id=listing.id, image_id=image_id)
        if not image:
            return False

        removing_primary = bool(image.is_primary)
        db.delete(image)
        db.flush()

        remaining_images = list(listing.images)
        if not remaining_images:
            listing.image_url = None
        else:
            has_primary = any(item.is_primary for item in remaining_images)
            if removing_primary or not has_primary:
                remaining_images[0].is_primary = True
                for item in remaining_images[1:]:
                    item.is_primary = False
                listing.image_url = remaining_images[0].url
            else:
                primary = next((item for item in remaining_images if item.is_primary), None)
                listing.image_url = primary.url if primary else remaining_images[0].url

        db.commit()
        return True

    def count_by_status(self, db: Session) -> dict:
        from sqlalchemy import func
        rows = db.query(WasteListing.status, func.count(WasteListing.id))\
                 .group_by(WasteListing.status).all()
        return {r[0]: r[1] for r in rows}


crud_listing = CRUDListing(WasteListing)
