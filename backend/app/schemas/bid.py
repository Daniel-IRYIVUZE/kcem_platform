"""schemas/bid.py"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.models.bid import BidStatus


class BidCreate(BaseModel):
    listing_id: int
    amount:     float
    notes:      Optional[str] = None


class BidUpdate(BaseModel):
    amount: float
    notes:  Optional[str] = None


class BidRead(BaseModel):
    id:              int
    listing_id:      int
    recycler_id:     int
    amount:          float
    previous_amount: Optional[float]
    status:          BidStatus
    notes:           Optional[str]
    created_at:      datetime
    updated_at:      datetime

    model_config = {"from_attributes": True}
