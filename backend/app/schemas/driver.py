"""schemas/driver.py"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr
from app.models.driver import VehicleStatus, DriverStatus


class DriverRegisterByRecycler(BaseModel):
    """Payload for a recycler registering a new driver account."""
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    license_number: Optional[str] = None
    vehicle_id: Optional[int] = None


class VehicleCreate(BaseModel):
    plate_number:  str
    vehicle_type:  str
    make:          Optional[str] = None
    model:         Optional[str] = None
    year:          Optional[int] = None
    capacity_kg:   float


class VehicleUpdate(BaseModel):
    vehicle_type:  Optional[str] = None
    make:          Optional[str] = None
    model:         Optional[str] = None
    year:          Optional[int] = None
    capacity_kg:   Optional[float] = None
    status:        Optional[VehicleStatus] = None


class VehicleRead(BaseModel):
    id:            int
    recycler_id:   int
    plate_number:  str
    vehicle_type:  str
    make:          Optional[str]
    model:         Optional[str]
    year:          Optional[int]
    capacity_kg:   float
    status:        VehicleStatus
    created_at:    datetime

    model_config = {"from_attributes": True}


class DriverCreate(BaseModel):
    license_number: Optional[str] = None
    phone:          Optional[str] = None


class DriverUpdate(BaseModel):
    license_number: Optional[str] = None
    phone:          Optional[str] = None
    status:         Optional[DriverStatus] = None
    vehicle_id:     Optional[int] = None
    current_lat:    Optional[float] = None
    current_lng:    Optional[float] = None


class DriverRead(BaseModel):
    id:             int
    user_id:        int
    recycler_id:    Optional[int]
    vehicle_id:     Optional[int]
    license_number: Optional[str]
    phone:          Optional[str]
    status:         DriverStatus
    current_lat:    Optional[float]
    current_lng:    Optional[float]
    rating:         float
    total_trips:    int
    is_verified:    bool
    created_at:     datetime
    updated_at:     Optional[datetime] = None
    last_login:     Optional[datetime] = None
    has_logged_in:  bool = False

    # Enriched from relationships
    name:           Optional[str] = None
    email:          Optional[str] = None
    vehicle_type:   Optional[str] = None
    plate_number:   Optional[str] = None
    capacity_kg:    Optional[float] = None

    model_config = {"from_attributes": True}

    @classmethod
    def from_orm_with_user(cls, driver) -> "DriverRead":
        """Create a DriverRead enriched with user name and vehicle info."""
        data = {
            "id": driver.id,
            "user_id": driver.user_id,
            "recycler_id": driver.recycler_id,
            "vehicle_id": driver.vehicle_id,
            "license_number": driver.license_number,
            "phone": driver.phone,
            "status": driver.status,
            "current_lat": driver.current_lat,
            "current_lng": driver.current_lng,
            "rating": driver.rating,
            "total_trips": driver.total_trips,
            "is_verified": driver.is_verified,
            "created_at": driver.created_at,
            "updated_at": getattr(driver, "updated_at", None),
        }
        if driver.user:
            data["name"] = driver.user.full_name or driver.user.email
            data["email"] = driver.user.email
        if driver.vehicle_id:
            # Try to load vehicle from same recycler vehicles
            try:
                from app.models.driver import Vehicle  # noqa: PLC0415
                vehicle = next((v for v in (driver.recycler.vehicles if driver.recycler else []) if v.id == driver.vehicle_id), None)
                if vehicle:
                    data["vehicle_type"] = vehicle.vehicle_type
                    data["plate_number"] = vehicle.plate_number
                    data["capacity_kg"] = vehicle.capacity_kg
            except Exception:
                pass
        return cls(**data)
