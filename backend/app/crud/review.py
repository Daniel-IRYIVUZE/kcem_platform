"""crud/review.py — Review CRUD."""
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.review import Review
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewUpdate


class CRUDReview(CRUDBase[Review, ReviewCreate, ReviewUpdate]):

    def get_by_target(self, db: Session, target_id: int, *,
                      skip: int = 0, limit: int = 20) -> list[Review]:
        return (db.query(Review)
                .filter(Review.reviewed_id == target_id)
                .order_by(Review.created_at.desc())
                .offset(skip).limit(limit).all())

    def get_by_reviewer(self, db: Session, reviewer_id: int) -> list[Review]:
        return db.query(Review).filter(Review.reviewer_id == reviewer_id).all()

    def get_by_collection(self, db: Session, collection_id: int) -> list[Review]:
        return db.query(Review).filter(Review.collection_id == collection_id).all()

    def average_rating(self, db: Session, target_id: int) -> float:
        from sqlalchemy import func
        result = (db.query(func.avg(Review.rating))
                  .filter(Review.reviewed_id == target_id).scalar())
        return round(float(result), 2) if result else 0.0

    def recalculate_user_rating(self, db: Session, user_id: int) -> None:
        avg = self.average_rating(db, user_id)
        db.query(User).filter(User.id == user_id).update({"rating": avg})
        db.commit()


crud_review = CRUDReview(Review)
