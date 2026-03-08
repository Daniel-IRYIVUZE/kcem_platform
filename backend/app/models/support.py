"""models/support.py — Support ticket models."""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    subject    = Column(String(255), nullable=False)
    message    = Column(Text, nullable=False)
    status     = Column(String(50), default="open")       # open, in_progress, resolved, closed
    priority   = Column(String(20), default="medium")     # low, medium, high, urgent
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    user      = relationship("User", foreign_keys=[user_id])
    responses = relationship("TicketResponse", back_populates="ticket",
                             cascade="all, delete-orphan", order_by="TicketResponse.created_at")


class TicketResponse(Base):
    __tablename__ = "ticket_responses"

    id         = Column(Integer, primary_key=True, index=True)
    ticket_id  = Column(Integer, ForeignKey("support_tickets.id", ondelete="CASCADE"), nullable=False)
    from_name  = Column(String(150), nullable=False)
    message    = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    ticket = relationship("SupportTicket", back_populates="responses")
