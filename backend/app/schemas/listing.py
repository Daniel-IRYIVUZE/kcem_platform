"""schemas/listing.py"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from app.models.listing import WasteType, ListingStatus


class ListingImageRead(BaseModel):
    id:         int
    url:        str
    is_primary: bool

    model_config = {"from_attributes": True}


class ListingCreate(BaseModel):
    title:                  str
    waste_type:             WasteType
    volume:                 float
    unit:                   Optional[str] = "kg"
    min_bid:                float
    description:            Optional[str] = None
    collection_window_start: Optional[datetime] = None
    collection_window_end:   Optional[datetime] = None
    address:                Optional[str] = None
    latitude:               Optional[float] = None
    longitude:              Optional[float] = None
    image_url:              Optional[str] = None
    expires_at:             Optional[datetime] = None
    is_urgent:              Optional[bool] = False
    notes:                  Optional[str] = None


class ListingUpdate(BaseModel):
    title:                  Optional[str] = None
    description:            Optional[str] = None
    waste_type:             Optional[WasteType] = None
    volume:                 Optional[float] = None
    unit:                   Optional[str] = None
    min_bid:                Optional[float] = None
    image_url:              Optional[str] = None
    collection_window_start: Optional[datetime] = None
    collection_window_end:   Optional[datetime] = None
    address:                Optional[str] = None
    latitude:               Optional[float] = None
    longitude:              Optional[float] = None
    expires_at:             Optional[datetime] = None
    is_urgent:              Optional[bool] = None
    notes:                  Optional[str] = None
    status:                 Optional[ListingStatus] = None


class ListingRead(BaseModel):
    id:                     int
    hotel_id:               int
    hotel_name:             Optional[str] = None
    image_url:              Optional[str] = None
    title:                  str
    description:            Optional[str]
    waste_type:             WasteType
    volume:                 float
    unit:                   str
    min_bid:                float
    collection_window_start: Optional[datetime]
    collection_window_end:   Optional[datetime]
    address:                Optional[str]
    latitude:               Optional[float]
    longitude:              Optional[float]
    status:                 ListingStatus
    bid_count:              int
    highest_bid:            float
    expires_at:             Optional[datetime]
    is_urgent:              bool
    notes:                  Optional[str]
    view_count:             int
    images:                 List[ListingImageRead] = []
    qr_token:               Optional[str] = None
    created_at:             datetime
    updated_at:             datetime

    model_config = {"from_attributes": True}


class ListingListRead(BaseModel):
    id:          int
    hotel_id:    int
    hotel_name:  Optional[str] = None
    image_url:   Optional[str] = None
    title:       str
    waste_type:  WasteType
    volume:      float
    unit:        str
    min_bid:     float
    status:      ListingStatus
    bid_count:   int
    highest_bid: float
    is_urgent:   bool
    expires_at:  Optional[datetime]
    created_at:  datetime
    address:     Optional[str] = None
    latitude:    Optional[float] = None
    longitude:   Optional[float] = None
    images:      List[ListingImageRead] = []

    model_config = {"from_attributes": True}
