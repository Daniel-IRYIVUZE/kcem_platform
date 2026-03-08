"""crud/recycling.py — Recycling event CRUD operations."""
from sqlalchemy.orm import Session
from app.models.recycling import RecyclingEvent
from app.schemas.recycling import RecyclingEventCreate


def _calc_points(weight: float, waste_type: str) -> int:
    """Award points based on weight and waste type."""
    rate = {"UCO": 5, "Plastic": 3, "Paper/Cardboard": 2, "Glass": 2,
            "Metal": 4, "Organic": 1}.get(waste_type, 2)
    return max(1, int(weight * rate))


def create(db: Session, user_id: int, user_name: str, obj_in: RecyclingEventCreate) -> RecyclingEvent:
    event = RecyclingEvent(
        user_id=user_id,
        date=obj_in.date,
        waste_type=obj_in.waste_type,
        weight=obj_in.weight,
        location=obj_in.location,
        notes=obj_in.notes,
        points=_calc_points(obj_in.weight, obj_in.waste_type),
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


def get(db: Session, event_id: int) -> RecyclingEvent | None:
    return db.query(RecyclingEvent).filter(RecyclingEvent.id == event_id).first()


def list_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> list[RecyclingEvent]:
    return (db.query(RecyclingEvent)
            .filter(RecyclingEvent.user_id == user_id)
            .order_by(RecyclingEvent.created_at.desc())
            .offset(skip).limit(limit).all())


def list_all(db: Session, skip: int = 0, limit: int = 100) -> list[RecyclingEvent]:
    return (db.query(RecyclingEvent)
            .order_by(RecyclingEvent.created_at.desc())
            .offset(skip).limit(limit).all())


def verify(db: Session, event_id: int) -> RecyclingEvent | None:
    event = get(db, event_id)
    if event:
        event.verified = True
        db.commit()
        db.refresh(event)
    return event


def delete(db: Session, event_id: int, user_id: int) -> bool:
    event = db.query(RecyclingEvent).filter(
        RecyclingEvent.id == event_id,
        RecyclingEvent.user_id == user_id
    ).first()
    if event:
        db.delete(event)
        db.commit()
        return True
    return False
