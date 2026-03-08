"""schemas/recycler.py"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class RecyclerCreate(BaseModel):
    company_name:    str
    address:         str
    city:            Optional[str] = "Kigali"
    district:        Optional[str] = None
    phone:           Optional[str] = None
    website:         Optional[str] = None
    license_number:  Optional[str] = None
    description:     Optional[str] = None
    waste_types_handled: Optional[List[str]] = None
    storage_capacity: Optional[float] = None
    latitude:        Optional[float] = None
    longitude:       Optional[float] = None


class RecyclerUpdate(BaseModel):
    company_name:    Optional[str] = None
    address:         Optional[str] = None
    city:            Optional[str] = None
    district:        Optional[str] = None
    phone:           Optional[str] = None
    website:         Optional[str] = None
    description:     Optional[str] = None
    waste_types_handled: Optional[List[str]] = None
    storage_capacity: Optional[float] = None
    logo_url:        Optional[str] = None


class RecyclerRead(BaseModel):
    id:              int
    user_id:         int
    company_name:    str
    description:     Optional[str]
    address:         str
    city:            str
    district:        Optional[str]
    latitude:        Optional[float]
    longitude:       Optional[float]
    phone:           Optional[str]
    website:         Optional[str]
    license_number:  Optional[str]
    is_verified:     bool
    logo_url:        Optional[str]
    green_score:     float
    total_collected: float
    fleet_size:      int
    active_bids:     int
    rating:          float
    review_count:    int
    created_at:      datetime

    model_config = {"from_attributes": True}
