"""models/inventory.py — Recycler inventory items."""
import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, Text, String, Enum as SAEnum
from sqlalchemy.orm import relationship
from app.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id               = Column(Integer, primary_key=True, index=True)
    recycler_id      = Column(Integer, ForeignKey("recyclers.id", ondelete="CASCADE"), nullable=False)
    material_type    = Column(String(100), nullable=False)
    current_stock    = Column(Float, default=0.0)      # kg
    capacity         = Column(Float, nullable=True)    # kg max
    unit             = Column(String(20), default="kg")
    last_updated     = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)
    notes            = Column(Text, nullable=True)
    created_at       = Column(DateTime(timezone=True), default=utc_now)

    # Relationships
    recycler = relationship("Recycler", back_populates="inventory")
