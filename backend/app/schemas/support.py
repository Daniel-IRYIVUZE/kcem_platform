"""schemas/support.py — Pydantic schemas for support tickets."""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class TicketResponseRead(BaseModel):
    id:         int
    ticket_id:  int
    from_name:  str
    message:    str
    created_at: datetime

    model_config = {"from_attributes": True}


class SupportTicketCreate(BaseModel):
    subject:  str
    message:  str
    priority: Optional[str] = "medium"


class SupportTicketUpdate(BaseModel):
    status:   Optional[str] = None
    priority: Optional[str] = None


class SupportTicketRead(BaseModel):
    id:         int
    user_id:    int
    user_name:  str
    subject:    str
    message:    str
    status:     str
    priority:   str
    created_at: datetime
    updated_at: datetime
    responses:  List[TicketResponseRead] = []

    model_config = {"from_attributes": True}


class TicketResponseCreate(BaseModel):
    from_name: Optional[str] = "Support Team"
    message:   str
