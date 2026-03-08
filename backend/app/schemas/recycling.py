"""schemas/recycling.py — Pydantic schemas for recycling events."""
from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel


class RecyclingEventCreate(BaseModel):
    date:       date
    waste_type: str
    weight:     float
    location:   Optional[str] = None
    notes:      Optional[str] = None


class RecyclingEventRead(BaseModel):
    id:         int
    user_id:    int
    user_name:  str
    date:       date
    waste_type: str
    weight:     float
    location:   Optional[str] = None
    points:     int
    notes:      Optional[str] = None
    verified:   bool
    created_at: datetime

    model_config = {"from_attributes": True}
