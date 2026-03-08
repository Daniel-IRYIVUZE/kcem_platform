"""models/audit_log.py — AuditLog for admin tracking."""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, DateTime, ForeignKey, Text, String
from sqlalchemy.orm import relationship
from app.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id          = Column(Integer, primary_key=True, index=True)
    user_id     = Column(Integer, ForeignKey("users.id"), nullable=True)
    action      = Column(String(100), nullable=False)     # e.g. "USER_SUSPEND", "BID_ACCEPT"
    entity_type = Column(String(50), nullable=True)       # e.g. "User", "Bid"
    entity_id   = Column(Integer, nullable=True)
    old_value   = Column(Text, nullable=True)             # JSON
    new_value   = Column(Text, nullable=True)             # JSON
    ip_address  = Column(String(50), nullable=True)
    user_agent  = Column(Text, nullable=True)
    notes       = Column(Text, nullable=True)
    created_at  = Column(DateTime(timezone=True), default=utc_now)

    # Relationships
    user = relationship("User", back_populates="audit_logs")
