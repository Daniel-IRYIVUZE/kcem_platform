"""crud/bid.py — Bid CRUD operations."""
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.bid import Bid, BidStatus
from app.schemas.bid import BidCreate, BidUpdate


class CRUDBid(CRUDBase[Bid, BidCreate, BidUpdate]):

    def get_by_listing(self, db: Session, listing_id: int) -> list[Bid]:
        return (db.query(Bid)
                .filter(Bid.listing_id == listing_id, Bid.status.in_([BidStatus.active]))
                .order_by(Bid.amount.desc()).all())

    def get_by_recycler(self, db: Session, recycler_id: int, *, skip: int = 0, limit: int = 20) -> list[Bid]:
        return (db.query(Bid)
                .filter(Bid.recycler_id == recycler_id)
                .order_by(Bid.created_at.desc())
                .offset(skip).limit(limit).all())

    def get_recycler_bid_on_listing(self, db: Session, recycler_id: int, listing_id: int) -> Bid | None:
        return (db.query(Bid)
                .filter(Bid.recycler_id == recycler_id, Bid.listing_id == listing_id,
                        Bid.status == BidStatus.active)
                .first())

    def increase_bid(self, db: Session, *, bid: Bid, new_amount: float) -> Bid:
        bid.previous_amount = bid.amount
        bid.amount = new_amount
        db.commit()
        db.refresh(bid)
        return bid

    def accept(self, db: Session, *, bid: Bid) -> Bid:
        # Mark all other bids on same listing as rejected
        db.query(Bid).filter(
            Bid.listing_id == bid.listing_id,
            Bid.id != bid.id,
            Bid.status == BidStatus.active,
        ).update({"status": BidStatus.rejected})
        bid.status = BidStatus.accepted
        db.commit()
        db.refresh(bid)
        return bid

    def withdraw(self, db: Session, *, bid: Bid) -> Bid:
        bid.status = BidStatus.withdrawn
        db.commit()
        db.refresh(bid)
        return bid


crud_bid = CRUDBid(Bid)
