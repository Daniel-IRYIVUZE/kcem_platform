"""utils/pagination.py — Pagination helpers."""
from __future__ import annotations
from typing import TypeVar, Generic, Type
from sqlalchemy.orm import Session, Query
from app.schemas.common import PaginatedResponse

T = TypeVar("T")


def paginate(query: Query, *, page: int = 1, size: int = 20) -> dict:
    """Return dict compatible with PaginatedResponse."""
    total = query.count()
    items = query.offset((page - 1) * size).limit(size).all()
    pages = (total + size - 1) // size if size else 1
    return {
        "items": items,
        "total": total,
        "page": page,
        "size": size,
        "pages": pages,
    }
