"""schemas/notification.py"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.models.notification import NotificationType


class NotificationRead(BaseModel):
    id:         int
    user_id:    int
    type:       NotificationType
    title:      str
    body:       str
    link:       Optional[str]
    is_read:    bool
    created_at: datetime

    model_config = {"from_attributes": True}
