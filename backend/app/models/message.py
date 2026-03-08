"""models/message.py — Message and Conversation models."""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, DateTime, ForeignKey, Text, String, Boolean
from sqlalchemy.orm import relationship
from app.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class Conversation(Base):
    __tablename__ = "conversations"

    id           = Column(Integer, primary_key=True, index=True)
    listing_id   = Column(Integer, ForeignKey("waste_listings.id"), nullable=True)
    subject      = Column(String(255), nullable=True)
    created_at   = Column(DateTime(timezone=True), default=utc_now)
    updated_at   = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    # Relationships
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan",
                            order_by="Message.created_at")


class Message(Base):
    __tablename__ = "messages"

    id               = Column(Integer, primary_key=True, index=True)
    conversation_id  = Column(Integer, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    sender_id        = Column(Integer, ForeignKey("users.id"), nullable=False)
    recipient_id     = Column(Integer, ForeignKey("users.id"), nullable=False)
    body             = Column(Text, nullable=False)
    attachment_url   = Column(String(500), nullable=True)
    is_read          = Column(Boolean, default=False)
    read_at          = Column(DateTime(timezone=True), nullable=True)
    created_at       = Column(DateTime(timezone=True), default=utc_now)

    # Relationships
    conversation = relationship("Conversation", back_populates="messages")
    sender       = relationship("User", foreign_keys=[sender_id], back_populates="sent_messages")
    recipient    = relationship("User", foreign_keys=[recipient_id])
