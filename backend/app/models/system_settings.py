"""models/system_settings.py — Key-value system configuration."""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, DateTime, Text, String, Boolean
from app.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class SystemSettings(Base):
    __tablename__ = "system_settings"

    id          = Column(Integer, primary_key=True, index=True)
    key         = Column(String(100), unique=True, nullable=False, index=True)
    value       = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    is_public   = Column(Boolean, default=False)    # visible to non-admins?
    created_at  = Column(DateTime(timezone=True), default=utc_now)
    updated_at  = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)
