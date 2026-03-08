"""models/collection.py — Collection and CollectionProof models."""
import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, Text, String, Enum as SAEnum
from sqlalchemy.orm import relationship
from app.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class CollectionStatus(str, enum.Enum):
    scheduled  = "scheduled"
    en_route   = "en_route"
    arrived    = "arrived"
    collected  = "collected"
    verified   = "verified"
    completed  = "completed"
    failed     = "failed"
    cancelled  = "cancelled"


class Collection(Base):
    __tablename__ = "collections"

    id                = Column(Integer, primary_key=True, index=True)
    listing_id        = Column(Integer, ForeignKey("waste_listings.id"), nullable=False)
    hotel_id          = Column(Integer, ForeignKey("hotels.id"), nullable=False)
    recycler_id       = Column(Integer, ForeignKey("recyclers.id"), nullable=True)
    driver_id         = Column(Integer, ForeignKey("drivers.id"), nullable=True)
    vehicle_id        = Column(Integer, ForeignKey("vehicles.id"), nullable=True)
    route_id          = Column(Integer, ForeignKey("routes.id"), nullable=True)
    status            = Column(SAEnum(CollectionStatus), default=CollectionStatus.scheduled)
    scheduled_date    = Column(DateTime(timezone=True), nullable=True)
    scheduled_time    = Column(String(10), nullable=True)
    started_at        = Column(DateTime(timezone=True), nullable=True)
    arrived_at        = Column(DateTime(timezone=True), nullable=True)
    collected_at      = Column(DateTime(timezone=True), nullable=True)
    completed_at      = Column(DateTime(timezone=True), nullable=True)
    actual_volume     = Column(Float, nullable=True)   # kg actually collected
    notes             = Column(Text, nullable=True)
    driver_notes      = Column(Text, nullable=True)
    created_at        = Column(DateTime(timezone=True), default=utc_now)
    updated_at        = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    # Relationships
    listing     = relationship("WasteListing", back_populates="collection")
    hotel       = relationship("Hotel", back_populates="collections")
    recycler    = relationship("Recycler", back_populates="collections")
    driver      = relationship("Driver", back_populates="collections")
    vehicle     = relationship("Vehicle", back_populates="collections")
    proofs      = relationship("CollectionProof", back_populates="collection", cascade="all, delete-orphan")
    transaction = relationship("Transaction", back_populates="collection", uselist=False)


class CollectionProof(Base):
    __tablename__ = "collection_proofs"

    id             = Column(Integer, primary_key=True, index=True)
    collection_id  = Column(Integer, ForeignKey("collections.id", ondelete="CASCADE"), nullable=False)
    image_url      = Column(String(500), nullable=False)
    description    = Column(Text, nullable=True)
    uploaded_by    = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at     = Column(DateTime(timezone=True), default=utc_now)

    # Relationships
    collection = relationship("Collection", back_populates="proofs")
