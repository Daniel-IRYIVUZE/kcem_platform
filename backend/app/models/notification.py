"""models/notification.py — Notification model."""
import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, DateTime, ForeignKey, Text, String, Enum as SAEnum, Boolean
from sqlalchemy.orm import relationship
from app.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class NotificationType(str, enum.Enum):
    new_bid           = "new_bid"
    bid_accepted      = "bid_accepted"
    bid_rejected      = "bid_rejected"
    collection_scheduled = "collection_scheduled"
    driver_en_route   = "driver_en_route"
    collection_completed = "collection_completed"
    payment_received  = "payment_received"
    payment_sent      = "payment_sent"
    listing_expired   = "listing_expired"
    document_approved = "document_approved"
    document_rejected = "document_rejected"
    account_suspended = "account_suspended"
    new_message       = "new_message"
    system            = "system"


class Notification(Base):
    __tablename__ = "notifications"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type       = Column(SAEnum(NotificationType), nullable=False)
    title      = Column(String(255), nullable=False)
    body       = Column(Text, nullable=False)
    link       = Column(String(500), nullable=True)   # frontend route
    is_read    = Column(Boolean, default=False)
    meta_data  = Column(Text, nullable=True)          # JSON
    created_at = Column(DateTime(timezone=True), default=utc_now)

    # Relationships
    user = relationship("User", back_populates="notifications")
