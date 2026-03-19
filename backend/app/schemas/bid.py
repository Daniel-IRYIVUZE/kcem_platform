"""schemas/bid.py"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.models.bid import BidStatus


class BidCreate(BaseModel):
    listing_id: int
    amount:     float
    quantity:   Optional[float] = None   # kg/units; None = bid on full listing
    notes:      Optional[str] = None


class BidUpdate(BaseModel):
    amount: float
    notes:  Optional[str] = None


class BidRead(BaseModel):
    id:              int
    listing_id:      int
    recycler_id:     int
    amount:          float
    quantity:        Optional[float] = None
    previous_amount: Optional[float]
    status:          BidStatus
    notes:           Optional[str]
    created_at:      datetime
    updated_at:      datetime
    # Enriched listing details
    hotel_name:      Optional[str] = None
    waste_type:      Optional[str] = None
    volume:          Optional[float] = None
    unit:            Optional[str] = None

    model_config = {"from_attributes": True}
