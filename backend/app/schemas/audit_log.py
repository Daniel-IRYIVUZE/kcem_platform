"""schemas/audit_log.py"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class AuditLogCreate(BaseModel):
    user_id:     Optional[int] = None
    action:      str
    entity_type: Optional[str] = None
    entity_id:   Optional[int] = None
    old_value:   Optional[str] = None
    new_value:   Optional[str] = None
    ip_address:  Optional[str] = None
    notes:       Optional[str] = None


class AuditLogRead(BaseModel):
    id:          int
    user_id:     Optional[int] = None
    action:      str
    entity_type: Optional[str] = None
    entity_id:   Optional[int] = None
    old_value:   Optional[str] = None
    new_value:   Optional[str] = None
    ip_address:  Optional[str] = None
    notes:       Optional[str] = None
    created_at:  datetime

    model_config = {"from_attributes": True}
