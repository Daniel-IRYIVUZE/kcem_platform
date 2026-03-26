"""crud/collection.py — Collection CRUD."""
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.collection import Collection, CollectionStatus, CollectionProof
from app.schemas.collection import CollectionCreate, CollectionUpdate


class CRUDCollection(CRUDBase[Collection, CollectionCreate, CollectionUpdate]):

    def get_by_driver(self, db: Session, driver_id: int, *, skip: int = 0, limit: int = 20) -> list[Collection]:
        return (db.query(Collection)
                .filter(Collection.driver_id == driver_id)
                .order_by(Collection.scheduled_date.asc())
                .offset(skip).limit(limit).all())

    def get_by_hotel(self, db: Session, hotel_id: int, *, skip: int = 0, limit: int = 20) -> list[Collection]:
        return (db.query(Collection)
                .filter(Collection.hotel_id == hotel_id)
                .order_by(Collection.scheduled_date.asc())
                .offset(skip).limit(limit).all())

    def get_by_recycler(self, db: Session, recycler_id: int, *, skip: int = 0, limit: int = 20) -> list[Collection]:
        return (db.query(Collection)
                .filter(Collection.recycler_id == recycler_id)
                .order_by(Collection.scheduled_date.asc())
                .offset(skip).limit(limit).all())

    # Ordered status progression for auto-advance
    _STATUS_NEXT = {
        CollectionStatus.scheduled: CollectionStatus.en_route,
        CollectionStatus.en_route:  CollectionStatus.arrived,
        CollectionStatus.arrived:   CollectionStatus.collected,
        CollectionStatus.collected: CollectionStatus.completed,
        CollectionStatus.verified:  CollectionStatus.completed,
    }

    def advance_status(self, db: Session, *, collection_id: int = None, collection: Collection = None,
                      new_status: CollectionStatus = None, notes: str = None,
                      actual_volume: float = None) -> Collection | None:
        """Advance collection status and update related timestamps.

        If *new_status* is not provided the method auto-advances:
        - When actual_volume is supplied the collection jumps straight to
          ``completed`` (driver recorded weight → job done).
        - Otherwise the next status in the linear progression is used.
        """
        # Get collection if only ID provided
        if collection_id and not collection:
            collection = self.get(db, collection_id)
            if not collection:
                return None

        if not collection:
            return None

        now = datetime.now(timezone.utc)

        # Auto-determine next status when caller did not specify one
        if new_status is None:
            if actual_volume is not None:
                # Recording weight means the driver has finished — mark complete
                new_status = CollectionStatus.completed
            else:
                new_status = self._STATUS_NEXT.get(collection.status, collection.status)

        collection.status = new_status
        if notes:
            collection.notes = notes
        if actual_volume is not None:
            collection.actual_volume = actual_volume

        if new_status == CollectionStatus.en_route:
            collection.started_at = now
        elif new_status == CollectionStatus.arrived:
            collection.arrived_at = now
        elif new_status == CollectionStatus.collected:
            collection.collected_at = now
        elif new_status == CollectionStatus.verified:
            pass  # verified is intermediate state
        elif new_status == CollectionStatus.completed:
            collection.completed_at = now

        db.commit()
        db.refresh(collection)
        return collection

    def add_proof(self, db: Session, *, collection_id: int, image_url: str,
                  description: str | None, uploaded_by: int) -> CollectionProof:
        proof = CollectionProof(
            collection_id=collection_id,
            image_url=image_url,
            description=description,
            uploaded_by=uploaded_by,
        )
        db.add(proof)
        db.commit()
        db.refresh(proof)
        return proof

    def count_by_status(self, db: Session) -> dict:
        from sqlalchemy import func
        rows = db.query(Collection.status, func.count(Collection.id))\
                 .group_by(Collection.status).all()
        return {r[0]: r[1] for r in rows}

    def assign_driver(self, db: Session, *, collection_id: int, driver_id: int, 
                      vehicle_id: int) -> Collection:
        """Assign driver and vehicle to collection."""
        collection = self.get(db, collection_id)
        if not collection:
            return None
        collection.driver_id = driver_id
        collection.vehicle_id = vehicle_id
        collection.status = CollectionStatus.scheduled
        db.commit()
        db.refresh(collection)
        return collection


crud_collection = CRUDCollection(Collection)
