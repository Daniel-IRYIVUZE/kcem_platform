"""models/green_score.py — Green impact metrics per user/entity."""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship
from app.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class GreenScore(Base):
    __tablename__ = "green_scores"

    id              = Column(Integer, primary_key=True, index=True)
    user_id         = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    period          = Column(String(20), nullable=False)   # "2025-07" monthly period
    waste_diverted  = Column(Float, default=0.0)           # kg
    co2_saved       = Column(Float, default=0.0)           # kg CO2
    water_saved     = Column(Float, default=0.0)           # liters
    energy_saved    = Column(Float, default=0.0)           # kWh
    score           = Column(Float, default=0.0)           # computed 0-100
    created_at      = Column(DateTime(timezone=True), default=utc_now)
    updated_at      = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    # Relationships
    user = relationship("User", back_populates="green_scores")
