"""models/recycler.py — Recycler company profile."""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class Recycler(Base):
    __tablename__ = "recyclers"

    id               = Column(Integer, primary_key=True, index=True)
    user_id          = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    company_name     = Column(String(255), nullable=False)
    description      = Column(Text, nullable=True)
    address          = Column(String(500), nullable=False)
    city             = Column(String(100), default="Kigali")
    district         = Column(String(100), nullable=True)
    latitude         = Column(Float, nullable=True)
    longitude        = Column(Float, nullable=True)
    phone            = Column(String(20), nullable=True)
    website          = Column(String(255), nullable=True)
    license_number   = Column(String(100), nullable=True)
    is_verified      = Column(Boolean, default=False)
    logo_url         = Column(String(500), nullable=True)
    waste_types_handled = Column(Text, nullable=True)     # JSON array stored as string
    storage_capacity = Column(Float, nullable=True)       # kg
    green_score      = Column(Float, default=0.0)
    total_collected  = Column(Float, default=0.0)         # kg cumulative
    total_spent      = Column(Float, default=0.0)         # RWF
    rating           = Column(Float, default=0.0)
    review_count     = Column(Integer, default=0)
    fleet_size       = Column(Integer, default=0)
    active_bids      = Column(Integer, default=0)
    created_at       = Column(DateTime(timezone=True), default=utc_now)
    updated_at       = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)
    tin_number       = Column(String(100), nullable=True)  # New field for TIN

    # Relationships
    user         = relationship("User", back_populates="recycler")
    bids         = relationship("Bid", back_populates="recycler", cascade="all, delete-orphan")
    collections  = relationship("Collection", back_populates="recycler")
    vehicles     = relationship("Vehicle", back_populates="recycler", cascade="all, delete-orphan")
    inventory    = relationship("InventoryItem", back_populates="recycler", cascade="all, delete-orphan")
    reviews      = relationship("Review", foreign_keys="Review.recycler_id", back_populates="recycler")
