"""schemas/inventory.py"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class InventoryCreate(BaseModel):
    material_type: str
    current_stock: Optional[float] = 0.0
    capacity:      Optional[float] = None
    unit:          Optional[str] = "kg"
    notes:         Optional[str] = None


class InventoryUpdate(BaseModel):
    material_type: Optional[str] = None
    current_stock: Optional[float] = None
    capacity:      Optional[float] = None
    unit:          Optional[str] = None
    notes:         Optional[str] = None


class InventoryRead(BaseModel):
    id:            int
    recycler_id:   int
    material_type: str
    current_stock: float
    capacity:      Optional[float]
    unit:          str
    last_updated:  datetime
    notes:         Optional[str]
    created_at:    datetime

    model_config = {"from_attributes": True}
