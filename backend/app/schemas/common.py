"""schemas/common.py — Shared/reusable Pydantic schemas."""
from typing import Generic, TypeVar, Optional
from pydantic import BaseModel

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    page_size: int
    pages: int


class StatusMessage(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None
