"""models/listing.py — WasteListing and ListingImage models."""
import enum
from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime,
    ForeignKey, Text, Enum as SAEnum
)
from sqlalchemy.orm import relationship
from app.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class WasteType(str, enum.Enum):
    uco              = "UCO"             # Used Cooking Oil
    glass            = "Glass"
    paper_cardboard  = "Paper/Cardboard"
    plastic          = "Plastic"
    metal            = "Metal"
    organic          = "Organic"
    electronic       = "Electronic"
    textile          = "Textile"
    mixed            = "Mixed"
    other            = "Other"


class ListingStatus(str, enum.Enum):
    draft     = "draft"
    open      = "open"
    accepting = "accepting"   # bid accepted, awaiting collection
    collected = "collected"
    completed = "completed"
    expired   = "expired"
    cancelled = "cancelled"


class WasteListing(Base):
    __tablename__ = "waste_listings"

    id                   = Column(Integer, primary_key=True, index=True)
    hotel_id             = Column(Integer, ForeignKey("hotels.id", ondelete="CASCADE"), nullable=False)
    title                = Column(String(255), nullable=False)
    description          = Column(Text, nullable=True)
    waste_type           = Column(SAEnum(WasteType), nullable=False)
    volume               = Column(Float, nullable=False)        # kg or liters
    unit                 = Column(String(20), default="kg")
    min_bid              = Column(Float, nullable=False)        # RWF
    collection_window_start = Column(DateTime(timezone=True), nullable=True)
    collection_window_end   = Column(DateTime(timezone=True), nullable=True)
    address              = Column(String(500), nullable=True)
    latitude             = Column(Float, nullable=True)
    longitude            = Column(Float, nullable=True)
    status               = Column(SAEnum(ListingStatus), default=ListingStatus.open)
    bid_count            = Column(Integer, default=0)
    highest_bid          = Column(Float, default=0.0)
    accepted_bid_id      = Column(Integer, nullable=True)
    expires_at           = Column(DateTime(timezone=True), nullable=True)
    image_url            = Column(String(500), nullable=True)
    is_urgent            = Column(Boolean, default=False)
    notes                = Column(Text, nullable=True)
    view_count           = Column(Integer, default=0)
    created_at           = Column(DateTime(timezone=True), default=utc_now)
    updated_at           = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    # Relationships
    hotel       = relationship("Hotel", back_populates="listings")
    images      = relationship("ListingImage", back_populates="listing", cascade="all, delete-orphan")
    bids        = relationship("Bid", back_populates="listing", cascade="all, delete-orphan")
    collection  = relationship("Collection", back_populates="listing", uselist=False)
    transaction = relationship("Transaction", back_populates="listing", uselist=False)

    @property
    def hotel_name(self) -> str | None:
        return self.hotel.hotel_name if self.hotel else None

    @property
    def hotel_city(self) -> str | None:
        return self.hotel.city if self.hotel else None

    @property
    def hotel_latitude(self) -> float | None:
        return self.hotel.latitude if self.hotel else None

    @property
    def hotel_longitude(self) -> float | None:
        return self.hotel.longitude if self.hotel else None


class ListingImage(Base):
    __tablename__ = "listing_images"

    id          = Column(Integer, primary_key=True, index=True)
    listing_id  = Column(Integer, ForeignKey("waste_listings.id", ondelete="CASCADE"), nullable=False)
    url         = Column(String(500), nullable=False)
    is_primary  = Column(Boolean, default=False)
    created_at  = Column(DateTime(timezone=True), default=utc_now)

    # Relationships
    listing = relationship("WasteListing", back_populates="images")
