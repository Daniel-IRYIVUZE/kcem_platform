"""models/hotel.py — Hotel/Business profile."""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class Hotel(Base):
    __tablename__ = "hotels"

    id               = Column(Integer, primary_key=True, index=True)
    user_id          = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    hotel_name       = Column(String(255), nullable=False)
    description      = Column(Text, nullable=True)
    address          = Column(String(500), nullable=False)
    city             = Column(String(100), default="Kigali")
    district         = Column(String(100), nullable=True)
    latitude         = Column(Float, nullable=True)
    longitude        = Column(Float, nullable=True)
    phone            = Column(String(20), nullable=True)
    website          = Column(String(255), nullable=True)
    stars            = Column(Integer, default=3)         # hotel star rating
    room_count       = Column(Integer, nullable=True)
    is_verified      = Column(Boolean, default=False)
    logo_url         = Column(String(500), nullable=True)
    banner_url       = Column(String(500), nullable=True)
    green_score      = Column(Float, default=0.0)
    total_waste_listed = Column(Float, default=0.0)       # kg, cumulative
    total_revenue    = Column(Float, default=0.0)         # RWF
    rating           = Column(Float, default=0.0)
    review_count     = Column(Integer, default=0)
    created_at       = Column(DateTime(timezone=True), default=utc_now)
    updated_at       = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)
    tin_number       = Column(String(100), nullable=True)  # New field for TIN

    # Relationships
    user        = relationship("User", back_populates="hotel")
    listings    = relationship("WasteListing", back_populates="hotel", cascade="all, delete-orphan")
    collections = relationship("Collection", back_populates="hotel")
    reviews     = relationship("Review", foreign_keys="Review.hotel_id", back_populates="hotel")
