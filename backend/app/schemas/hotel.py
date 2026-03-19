"""schemas/hotel.py"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class HotelCreate(BaseModel):
    hotel_name:  str
    address:     str
    city:        Optional[str] = "Kigali"
    district:    Optional[str] = None
    phone:       Optional[str] = None
    website:     Optional[str] = None
    stars:       Optional[int] = 3
    room_count:  Optional[int] = None
    description: Optional[str] = None
    latitude:    Optional[float] = None
    longitude:   Optional[float] = None


class HotelUpdate(BaseModel):
    hotel_name:  Optional[str] = None
    address:     Optional[str] = None
    city:        Optional[str] = None
    district:    Optional[str] = None
    phone:       Optional[str] = None
    website:     Optional[str] = None
    stars:       Optional[int] = None
    room_count:  Optional[int] = None
    description: Optional[str] = None
    latitude:    Optional[float] = None
    longitude:   Optional[float] = None
    tin_number:  Optional[str] = None  # New field
    logo_url:    Optional[str] = None
    banner_url:  Optional[str] = None


class HotelRead(BaseModel):
    id:                int
    user_id:           int
    hotel_name:        str
    description:       Optional[str]
    address:           str
    city:              str
    district:          Optional[str]
    latitude:          Optional[float]
    longitude:         Optional[float]
    phone:             Optional[str]
    tin_number:  Optional[str] = None  # New field
    website:           Optional[str]
    stars:             int
    room_count:        Optional[int]
    is_verified:       bool
    logo_url:          Optional[str]
    green_score:       float
    total_waste_listed: float
    total_revenue:     float
    rating:            float
    review_count:      int
    created_at:        datetime

    model_config = {"from_attributes": True}
