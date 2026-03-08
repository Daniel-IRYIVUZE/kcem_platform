"""models/recycling.py — Recycling event model for individual users."""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, ForeignKey, DateTime, Date
from sqlalchemy.orm import relationship
from app.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class RecyclingEvent(Base):
    __tablename__ = "recycling_events"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    date       = Column(Date, nullable=False)
    waste_type = Column(String(100), nullable=False)
    weight     = Column(Float, nullable=False, default=0.0)
    location   = Column(String(255), nullable=True)
    points     = Column(Integer, default=0)
    notes      = Column(Text, nullable=True)
    verified   = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    user = relationship("User", foreign_keys=[user_id])
