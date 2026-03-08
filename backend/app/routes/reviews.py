"""routes/reviews.py — Review endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.crud import crud_review
from app.auth.dependencies import get_current_active_user
from app.schemas.review import ReviewCreate, ReviewRead
from app.models.user import User

router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.post("/", response_model=ReviewRead, status_code=201)
def create_review(payload: ReviewCreate, db: Session = Depends(get_db),
                  current_user: User = Depends(get_current_active_user)):
    review = crud_review.create(db, obj_in=payload, reviewer_id=current_user.id)
    crud_review.recalculate_user_rating(db, user_id=payload.reviewed_id)
    return review


@router.get("/user/{user_id}", response_model=list[ReviewRead])
def user_reviews(user_id: int, skip: int = 0, limit: int = 20,
                 db: Session = Depends(get_db)):
    return crud_review.get_by_target(db, target_id=user_id, skip=skip, limit=limit)


@router.get("/user/{user_id}/rating")
def user_rating(user_id: int, db: Session = Depends(get_db)):
    return {"user_id": user_id, "average_rating": crud_review.average_rating(db, user_id)}


@router.get("/{review_id}", response_model=ReviewRead)
def get_review(review_id: int, db: Session = Depends(get_db)):
    review = crud_review.get(db, review_id)
    if not review:
        raise HTTPException(404, "Review not found.")
    return review
