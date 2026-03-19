"""models/bid.py — Bid model."""
import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, Text, Enum as SAEnum
from sqlalchemy.orm import relationship
from app.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class BidStatus(str, enum.Enum):
    active    = "active"
    accepted  = "accepted"
    rejected  = "rejected"
    withdrawn = "withdrawn"
    outbid    = "outbid"


class Bid(Base):
    __tablename__ = "bids"

    id           = Column(Integer, primary_key=True, index=True)
    listing_id   = Column(Integer, ForeignKey("waste_listings.id", ondelete="CASCADE"), nullable=False)
    recycler_id  = Column(Integer, ForeignKey("recyclers.id", ondelete="CASCADE"), nullable=False)
    amount       = Column(Float, nullable=False)       # RWF
    quantity     = Column(Float, nullable=True)        # kg/units bid for (None = full listing)
    previous_amount = Column(Float, nullable=True)     # for increase tracking
    status       = Column(SAEnum(BidStatus), default=BidStatus.active)
    notes        = Column(Text, nullable=True)
    is_auto_bid  = Column(Integer, default=0)          # future auto-bid feature
    created_at   = Column(DateTime(timezone=True), default=utc_now)
    updated_at   = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    # Relationships
    listing  = relationship("WasteListing", back_populates="bids")
    recycler = relationship("Recycler", back_populates="bids")
