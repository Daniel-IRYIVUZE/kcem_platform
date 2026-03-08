"""models/review.py — Review model."""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, Text, String
from sqlalchemy.orm import relationship
from app.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class Review(Base):
    __tablename__ = "reviews"

    id           = Column(Integer, primary_key=True, index=True)
    reviewer_id  = Column(Integer, ForeignKey("users.id"), nullable=False)
    hotel_id     = Column(Integer, ForeignKey("hotels.id"), nullable=True)
    recycler_id  = Column(Integer, ForeignKey("recyclers.id"), nullable=True)
    driver_id    = Column(Integer, ForeignKey("drivers.id"), nullable=True)
    collection_id= Column(Integer, ForeignKey("collections.id"), nullable=True)
    rating       = Column(Float, nullable=False)      # 1-5
    title        = Column(String(255), nullable=True)
    body         = Column(Text, nullable=True)
    created_at   = Column(DateTime(timezone=True), default=utc_now)

    # Relationships
    reviewer = relationship("User", foreign_keys=[reviewer_id])
    hotel    = relationship("Hotel", foreign_keys=[hotel_id], back_populates="reviews")
    recycler = relationship("Recycler", foreign_keys=[recycler_id], back_populates="reviews")
    driver   = relationship("Driver", foreign_keys=[driver_id])
