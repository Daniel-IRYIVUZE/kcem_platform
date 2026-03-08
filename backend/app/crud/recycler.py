"""crud/recycler.py — Recycler company CRUD."""
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.recycler import Recycler
from app.schemas.recycler import RecyclerCreate, RecyclerUpdate


class CRUDRecycler(CRUDBase[Recycler, RecyclerCreate, RecyclerUpdate]):

    def get_by_user(self, db: Session, user_id: int) -> Recycler | None:
        return db.query(Recycler).filter(Recycler.user_id == user_id).first()

    def get_verified(self, db: Session, *, skip: int = 0, limit: int = 20) -> list[Recycler]:
        return (db.query(Recycler)
                .filter(Recycler.is_verified == True)
                .offset(skip).limit(limit).all())

    def update_fleet_count(self, db: Session, recycler_id: int, count: int) -> Recycler | None:
        rec = db.query(Recycler).filter(Recycler.id == recycler_id).first()
        if rec:
            rec.fleet_size = count
            db.commit()
            db.refresh(rec)
        return rec

    def increment_collection_count(self, db: Session, recycler_id: int) -> None:
        """No-op placeholder — collection count derived from relationship."""
        pass


crud_recycler = CRUDRecycler(Recycler)
