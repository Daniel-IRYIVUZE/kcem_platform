"""schemas/message.py"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class MessageCreate(BaseModel):
    recipient_id:    int
    body:            str
    listing_id:      Optional[int] = None
    conversation_id: Optional[int] = None
    subject:         Optional[str] = None


class MessageRead(BaseModel):
    id:              int
    conversation_id: int
    sender_id:       int
    recipient_id:    int
    body:            str
    attachment_url:  Optional[str]
    is_read:         bool
    read_at:         Optional[datetime]
    created_at:      datetime

    model_config = {"from_attributes": True}


class ConversationRead(BaseModel):
    id:          int
    listing_id:  Optional[int]
    subject:     Optional[str]
    messages:    List[MessageRead] = []
    created_at:  datetime
    updated_at:  datetime

    model_config = {"from_attributes": True}
