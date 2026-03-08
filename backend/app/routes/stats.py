"""routes/stats.py — Public aggregate stats endpoint (no auth required)."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.user import User, UserRole, UserStatus
from app.models.listing import WasteListing
from app.models.transaction import Transaction

router = APIRouter(prefix="/stats", tags=["Stats"])


@router.get("/", summary="Public platform statistics")
def get_platform_stats(db: Session = Depends(get_db)):
    """Return aggregate stats for the platform — no authentication required."""

    hotels = db.query(func.count(User.id)).filter(
        User.role == UserRole.business, User.status == UserStatus.active
    ).scalar() or 0

    recyclers = db.query(func.count(User.id)).filter(
        User.role == UserRole.recycler, User.status == UserStatus.active
    ).scalar() or 0

    drivers = db.query(func.count(User.id)).filter(
        User.role == UserRole.driver, User.status == UserStatus.active
    ).scalar() or 0

    total_volume_kg = db.query(func.coalesce(func.sum(WasteListing.volume), 0)).scalar() or 0
    total_listings = db.query(func.count(WasteListing.id)).scalar() or 0
    total_transactions = db.query(func.count(Transaction.id)).scalar() or 0
    total_revenue = db.query(func.coalesce(func.sum(Transaction.gross_amount), 0)).scalar() or 0

    return {
        "hotels": hotels,
        "recyclers": recyclers,
        "drivers": drivers,
        "total_volume_kg": float(total_volume_kg),
        "total_listings": total_listings,
        "total_transactions": total_transactions,
        "total_revenue_rwf": float(total_revenue),
    }


@router.get("/recent-activity", summary="Recent platform activity feed")
def get_recent_activity(limit: int = 8, db: Session = Depends(get_db)):
    """Return the most recent listing activity for the live impact ticker."""
    recent = (
        db.query(WasteListing)
        .order_by(WasteListing.created_at.desc())
        .limit(limit)
        .all()
    )

    activities = []
    for listing in recent:
        hotel_name = listing.hotel.hotel_name if listing.hotel else "A hotel"
        # waste_type may be an enum — get its .value string
        waste_type = listing.waste_type.value if hasattr(listing.waste_type, "value") else str(listing.waste_type)
        activities.append({
            "type": "hotel",
            "name": hotel_name,
            "action": "listed",
            "waste": f"{int(listing.volume)} kg {waste_type}",
            "created_at": listing.created_at.isoformat() if listing.created_at else None,
        })

    return activities
