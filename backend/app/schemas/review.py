"""schemas/review.py"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, field_validator


class ReviewCreate(BaseModel):
    reviewed_id:   int
    hotel_id:      Optional[int] = None
    recycler_id:   Optional[int] = None
    driver_id:     Optional[int] = None
    collection_id: Optional[int] = None
    rating:        float
    title:         Optional[str] = None
    body:          Optional[str] = None

    @field_validator("rating")
    @classmethod
    def validate_rating(cls, v: float) -> float:
        if not 1.0 <= v <= 5.0:
            raise ValueError("Rating must be between 1 and 5")
        return v


class ReviewUpdate(BaseModel):
    rating: Optional[float] = None
    title:  Optional[str] = None
    body:   Optional[str] = None

    @field_validator("rating")
    @classmethod
    def validate_rating(cls, v: float | None) -> float | None:
        if v is not None and not 1.0 <= v <= 5.0:
            raise ValueError("Rating must be between 1 and 5")
        return v


class ReviewRead(BaseModel):
    id:            int
    reviewer_id:   int
    reviewed_id:   Optional[int] = None
    hotel_id:      Optional[int] = None
    recycler_id:   Optional[int] = None
    driver_id:     Optional[int] = None
    collection_id: Optional[int] = None
    rating:        float
    title:         Optional[str] = None
    body:          Optional[str] = None
    created_at:    datetime

    model_config = {"from_attributes": True}
