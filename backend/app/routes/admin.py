"""routes/admin.py — Admin dashboard endpoints."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.crud import crud_listing, crud_collection, crud_transaction, crud_audit_log
from app.auth.dependencies import require_admin
from app.models.user import User, UserRole
from app.models.listing import ListingStatus
from app.services.green_score_service import leaderboard

router = APIRouter(prefix="/admin", tags=["Admin"],
                   dependencies=[Depends(require_admin)])


@router.get("/stats")
def platform_stats(db: Session = Depends(get_db)):
    def count_role(role: UserRole) -> int:
        return db.query(User).filter(User.role == role).count()

    return {
        "users": {
            "total": db.query(User).count(),
            "hotels": count_role(UserRole.business),
            "recyclers": count_role(UserRole.recycler),
            "drivers": count_role(UserRole.driver),
            "individuals": count_role(UserRole.individual),
        },
        "listings": {
            "total": crud_listing.count(db),
            "open": crud_listing.count_by_status(db, ListingStatus.open),
            "completed": crud_listing.count_by_status(db, ListingStatus.completed),
        },
        "collections": {
            "total": crud_collection.count(db),
        },
        "revenue": {
            "total": crud_transaction.revenue_total(db),
            "platform_fees": crud_transaction.platform_fees_total(db),
        },
    }


@router.get("/audit-logs")
def audit_logs(limit: int = 100, db: Session = Depends(get_db)):
    return crud_audit_log.get_recent(db, limit=limit)


@router.get("/green-leaderboard")
def green_leaderboard(limit: int = 10, db: Session = Depends(get_db)):
    return leaderboard(db, limit=limit)
