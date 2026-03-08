"""routes/recycling.py — Recycling event endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any
from app.database import get_db
from app.crud import recycling as crud_recycling
from app.auth.dependencies import get_current_active_user, require_role
from app.schemas.recycling import RecyclingEventCreate
from app.models.user import User, UserRole

router = APIRouter(prefix="/recycling", tags=["Recycling Events"])


def _event_to_dict(event) -> dict:
    return {
        "id": event.id,
        "user_id": event.user_id,
        "user_name": event.user.full_name if event.user else "Unknown",
        "date": str(event.date),
        "waste_type": event.waste_type,
        "weight": event.weight,
        "location": event.location,
        "points": event.points,
        "notes": event.notes,
        "verified": event.verified,
        "created_at": event.created_at.isoformat(),
    }


@router.get("/")
def list_events(
    skip: int = 0, limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    if current_user.role == UserRole.admin:
        events = crud_recycling.list_all(db, skip=skip, limit=limit)
    else:
        events = crud_recycling.list_by_user(db, user_id=current_user.id, skip=skip, limit=limit)
    return [_event_to_dict(e) for e in events]


@router.post("/", status_code=201)
def create_event(
    payload: RecyclingEventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    event = crud_recycling.create(db, user_id=current_user.id,
                                   user_name=current_user.full_name, obj_in=payload)
    return _event_to_dict(event)


@router.delete("/{event_id}", status_code=204)
def delete_event(event_id: int, db: Session = Depends(get_db),
                 current_user: User = Depends(get_current_active_user)):
    deleted = crud_recycling.delete(db, event_id=event_id, user_id=current_user.id)
    if not deleted:
        raise HTTPException(404, "Event not found or not yours.")


@router.post("/{event_id}/verify", dependencies=[Depends(require_role(UserRole.admin))])
def verify_event(event_id: int, db: Session = Depends(get_db)) -> Any:
    event = crud_recycling.verify(db, event_id)
    if not event:
        raise HTTPException(404, "Event not found.")
    return _event_to_dict(event)
