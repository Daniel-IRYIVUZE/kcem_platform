"""schemas/collection.py"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from app.models.collection import CollectionStatus


class ProofCreate(BaseModel):
    description: Optional[str] = None


class ProofRead(BaseModel):
    id:            int
    collection_id: int
    image_url:     str
    description:   Optional[str]
    created_at:    datetime

    model_config = {"from_attributes": True}


class CollectionCreate(BaseModel):
    listing_id:     int
    hotel_id:       int
    recycler_id:    Optional[int] = None
    driver_id:      Optional[int] = None
    vehicle_id:     Optional[int] = None
    scheduled_date: Optional[datetime] = None
    scheduled_time: Optional[str] = None
    notes:          Optional[str] = None


class CollectionUpdate(BaseModel):
    status:         Optional[CollectionStatus] = None
    driver_id:      Optional[int] = None
    vehicle_id:     Optional[int] = None
    scheduled_date: Optional[datetime] = None
    scheduled_time: Optional[str] = None
    notes:          Optional[str] = None
    driver_notes:   Optional[str] = None
    actual_volume:  Optional[float] = None


class CollectionRead(BaseModel):
    id:             int
    listing_id:     int
    hotel_id:       int
    recycler_id:    Optional[int]
    driver_id:      Optional[int]
    vehicle_id:     Optional[int]
    status:         CollectionStatus
    scheduled_date: Optional[datetime]
    scheduled_time: Optional[str]
    started_at:     Optional[datetime]
    arrived_at:     Optional[datetime]
    collected_at:   Optional[datetime]
    completed_at:   Optional[datetime]
    actual_volume:  Optional[float]
    notes:          Optional[str]
    driver_notes:   Optional[str]
    proofs:         List[ProofRead] = []
    created_at:     datetime
    updated_at:     datetime

    model_config = {"from_attributes": True}
