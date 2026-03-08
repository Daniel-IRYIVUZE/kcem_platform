"""schemas/route.py"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from app.models.route import RouteStatus, StopStatus


class RouteStopCreate(BaseModel):
    collection_id:    Optional[int] = None
    stop_order:       int
    hotel_name:       Optional[str] = None
    address:          Optional[str] = None
    latitude:         Optional[float] = None
    longitude:        Optional[float] = None
    notes:            Optional[str] = None


class RouteStopRead(BaseModel):
    id:                 int
    route_id:           int
    collection_id:      Optional[int]
    stop_order:         int
    hotel_name:         Optional[str]
    address:            Optional[str]
    latitude:           Optional[float]
    longitude:          Optional[float]
    status:             StopStatus
    estimated_arrival:  Optional[datetime]
    actual_arrival:     Optional[datetime]
    distance_from_prev: Optional[float]
    notes:              Optional[str]

    model_config = {"from_attributes": True}


class RouteCreate(BaseModel):
    driver_id:       Optional[int] = None
    date:            Optional[datetime] = None
    stops:           List[RouteStopCreate] = []
    total_distance:  Optional[float] = None
    estimated_time:  Optional[int] = None
    notes:           Optional[str] = None


class RouteRead(BaseModel):
    id:              int
    driver_id:       Optional[int]
    date:            datetime
    status:          RouteStatus
    total_stops:     int
    completed_stops: int
    total_distance:  Optional[float]
    estimated_time:  Optional[int]
    actual_start:    Optional[datetime]
    actual_end:      Optional[datetime]
    stops:           List[RouteStopRead] = []
    created_at:      datetime

    model_config = {"from_attributes": True}
