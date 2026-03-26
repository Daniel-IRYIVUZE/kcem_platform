"""schemas/collection.py"""
from datetime import datetime
from typing import Any, Optional, List
from pydantic import BaseModel, model_validator
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
    recycler_id:    Optional[int] = None
    driver_id:      Optional[int] = None
    vehicle_id:     Optional[int] = None
    status:         CollectionStatus
    scheduled_date: Optional[datetime] = None
    scheduled_time: Optional[str] = None
    started_at:     Optional[datetime] = None
    arrived_at:     Optional[datetime] = None
    collected_at:   Optional[datetime] = None
    completed_at:   Optional[datetime] = None
    actual_volume:  Optional[float] = None
    notes:          Optional[str] = None
    driver_notes:   Optional[str] = None
    proofs:         List[ProofRead] = []
    created_at:     datetime
    updated_at:     datetime

    # Denormalized fields populated from ORM relationships
    hotel_name:    Optional[str] = None
    hotel_phone:   Optional[str] = None
    hotel_address: Optional[str] = None
    recycler_name: Optional[str] = None
    driver_name:   Optional[str] = None
    driver_phone:  Optional[str] = None
    waste_type:    Optional[str] = None
    volume:        Optional[float] = None
    unit:          Optional[str] = None
    location:      Optional[str] = None
    earnings:      Optional[float] = None   # net_amount: what hotel receives
    gross_amount:  Optional[float] = None   # total bid amount: what recycler pays
    # Coordinates (destination + driver live position)
    listing_lat:   Optional[float] = None
    listing_lng:   Optional[float] = None
    hotel_lat:     Optional[float] = None
    hotel_lng:     Optional[float] = None
    driver_lat:    Optional[float] = None
    driver_lng:    Optional[float] = None

    @model_validator(mode='before')
    @classmethod
    def enrich_from_relationships(cls, data: Any) -> Any:
        if not hasattr(data, '__dict__'):
            return data
        try:
            if data.hotel:
                data.__dict__.setdefault('hotel_name',    data.hotel.hotel_name)
                data.__dict__.setdefault('hotel_phone',   data.hotel.phone)
                data.__dict__.setdefault('hotel_address', data.hotel.address)
                data.__dict__.setdefault('location',      data.hotel.address)
                data.__dict__.setdefault('hotel_lat',     data.hotel.latitude)
                data.__dict__.setdefault('hotel_lng',     data.hotel.longitude)
            if data.recycler:
                data.__dict__.setdefault('recycler_name', data.recycler.company_name)
            if data.driver:
                if data.driver.user:
                    data.__dict__.setdefault('driver_name', data.driver.user.full_name or data.driver.user.email)
                    data.__dict__.setdefault('driver_phone', data.driver.user.phone)
                data.__dict__.setdefault('driver_lat', data.driver.current_lat)
                data.__dict__.setdefault('driver_lng', data.driver.current_lng)
            if data.listing:
                listing = data.listing
                data.__dict__.setdefault('waste_type',   listing.waste_type.value if listing.waste_type else None)
                data.__dict__.setdefault('volume',       listing.volume)
                data.__dict__.setdefault('unit',         listing.unit)
                data.__dict__.setdefault('listing_lat',  listing.latitude)
                data.__dict__.setdefault('listing_lng',  listing.longitude)
                # Fallback hotel coords/name from listing if not already set
                if listing.hotel:
                    if not data.__dict__.get('hotel_name'):
                        data.__dict__['hotel_name'] = listing.hotel.hotel_name
                    data.__dict__.setdefault('hotel_lat', listing.hotel.latitude)
                    data.__dict__.setdefault('hotel_lng', listing.hotel.longitude)
            if data.transaction:
                data.__dict__.setdefault('earnings',     data.transaction.net_amount  or 0.0)
                data.__dict__.setdefault('gross_amount', data.transaction.gross_amount or 0.0)
        except Exception:
            pass
        return data

    model_config = {"from_attributes": True}
