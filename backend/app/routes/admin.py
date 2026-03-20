"""routes/admin.py — Admin dashboard endpoints."""
import json
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Response, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app.crud import crud_listing, crud_collection, crud_transaction, crud_audit_log
from app.auth.dependencies import require_admin
from app.models.user import User, UserRole
from app.models.listing import ListingStatus, WasteListing
from app.models.system_settings import SystemSettings
from app.schemas.listing import ListingRead, ListingUpdate
from app.services.green_score_service import leaderboard
from app.utils.file_upload import save_upload

router = APIRouter(prefix="/admin", tags=["Admin"],
                   dependencies=[Depends(require_admin)])

DEFAULT_SETTINGS: dict[str, Any] = {
    "platformName": "EcoTrade Rwanda",
    "platformFeePercent": 10,
    "minBidAmount": 5000,
    "listingExpiryDays": 30,
    "maintenanceMode": False,
    "emailNotifications": True,
    "smsNotifications": True,
    "autoApproveListings": False,
    "requireIDVerification": True,
    "currency": "RWF",
    "country": "Rwanda",
    "supportEmail": "support@ecotrade.rw",
    "supportPhone": "+250 780 162 164",
}
MAX_LISTING_IMAGES = 5


def _deserialize_setting(value: str | None) -> Any:
    if value is None:
        return None
    try:
        return json.loads(value)
    except Exception:
        return value


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


@router.get("/smtp-status")
def smtp_status():
    """Return current SMTP configuration status (no credentials exposed)."""
    from app.config import settings
    return {
        "configured": settings.is_email_configured,
        "smtp_host": settings.SMTP_HOST or None,
        "smtp_port": settings.SMTP_PORT,
        "smtp_user": settings.SMTP_USER or None,
        "email_from": settings.EMAIL_FROM or None,
        "email_from_name": settings.EMAIL_FROM_NAME,
        "use_tls": settings.EMAIL_USE_TLS,
        "admin_email": settings.ADMIN_EMAIL or None,
    }


@router.post("/smtp-test")
def smtp_test():
    """Send a test email to ADMIN_EMAIL to verify SMTP is working."""
    from app.config import settings
    from app.services.email_service import send_email
    if not settings.is_email_configured:
        raise HTTPException(400, "SMTP is not configured. Set SMTP_USER, SMTP_PASSWORD and EMAIL_FROM in .env then restart the server.")
    target = settings.ADMIN_EMAIL or settings.EMAIL_FROM
    sent = send_email(
        to_email=target,
        subject="EcoTrade Rwanda — SMTP Test",
        html_body="""
        <div style="font-family:Arial,sans-serif;padding:32px;background:#f0fdf4;border-radius:12px;">
          <h2 style="color:#0891b2;">✅ SMTP is working!</h2>
          <p style="color:#475569;">Your EcoTrade Rwanda email configuration is correct.
          Transactional emails (driver reminders, bid notifications, support tickets) will be delivered.</p>
          <p style="color:#94a3b8;font-size:12px;">© EcoTrade Rwanda</p>
        </div>
        """,
        text_body="EcoTrade Rwanda SMTP test — if you received this, email delivery is working correctly.",
    )
    if not sent:
        raise HTTPException(500, "SMTP connection failed. Check your credentials in .env and restart the server.")
    return {"success": True, "message": f"Test email sent to {target}"}


@router.get("/audit-logs")
def audit_logs(limit: int = 200, db: Session = Depends(get_db)):
    logs = crud_audit_log.get_recent(db, limit=limit)
    return [
        {
            "id": log.id,
            "user_id": log.user_id,
            "action": log.action,
            "entity_type": log.entity_type,
            "entity_id": log.entity_id,
            "notes": log.notes,
            "ip_address": log.ip_address,
            "created_at": log.created_at.isoformat() if log.created_at else None,
            "user": {
                "full_name": log.user.full_name,
                "email": log.user.email,
            } if log.user else None,
        }
        for log in logs
    ]


@router.get("/green-leaderboard")
def green_leaderboard(limit: int = 10, db: Session = Depends(get_db)):
    return leaderboard(db, limit=limit)


@router.get("/settings")
def get_platform_settings(db: Session = Depends(get_db)):
    settings = DEFAULT_SETTINGS.copy()
    rows = db.query(SystemSettings).all()
    for row in rows:
        if row.key in settings:
            settings[row.key] = _deserialize_setting(row.value)
    return settings


@router.put("/settings")
def save_platform_settings(payload: dict[str, Any], db: Session = Depends(get_db)):
    import logging
    logger = logging.getLogger("settings_update")
    updated_keys = []
    for key, value in payload.items():
        if key not in DEFAULT_SETTINGS:
            logger.warning(f"Ignored unknown setting: {key}")
            continue
        row = db.query(SystemSettings).filter(SystemSettings.key == key).first()
        encoded = json.dumps(value)
        if row:
            row.value = encoded
            logger.info(f"Updated setting: {key} -> {value}")
        else:
            db.add(SystemSettings(key=key, value=encoded, is_public=False))
            logger.info(f"Created setting: {key} -> {value}")
        updated_keys.append(key)
    db.commit()
    logger.info(f"Settings update committed. Keys: {updated_keys}")
    return get_platform_settings(db)


@router.get("/listings", response_model=list[ListingRead])
def admin_list_listings(status: str | None = None, skip: int = 0, limit: int = 500,
                        db: Session = Depends(get_db)):
    q = db.query(WasteListing)
    if status and status != "all":
        try:
            parsed_status = ListingStatus(status)
            q = q.filter(WasteListing.status == parsed_status)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail="Invalid listing status.") from exc
    return q.order_by(WasteListing.created_at.desc()).offset(skip).limit(limit).all()


@router.patch("/listings/{listing_id}", response_model=ListingRead)
def admin_update_listing(listing_id: int, payload: ListingUpdate, db: Session = Depends(get_db)):
    listing = crud_listing.get(db, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found.")
    return crud_listing.update(db, db_obj=listing, obj_in=payload)


@router.delete("/listings/{listing_id}", status_code=204)
def admin_delete_listing(listing_id: int, db: Session = Depends(get_db)):
    listing = crud_listing.get(db, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found.")
    crud_listing.remove(db, id=listing.id)
    return Response(status_code=204)


@router.post("/listings/{listing_id}/images", status_code=201)
def admin_upload_listing_image(listing_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    listing = crud_listing.get(db, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found.")
    if len(listing.images) >= MAX_LISTING_IMAGES:
        raise HTTPException(status_code=400, detail=f"Each listing can have at most {MAX_LISTING_IMAGES} images.")

    url = save_upload(file, subfolder="listings")
    img = crud_listing.add_image(db, listing_id=listing.id, url=url)

    listing.image_url = url
    db.add(listing)
    db.commit()

    return img


@router.patch("/listings/{listing_id}/images/{image_id}/primary", status_code=200)
def admin_set_primary_listing_image(listing_id: int, image_id: int, db: Session = Depends(get_db)):
    listing = crud_listing.get(db, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found.")

    image = crud_listing.set_primary_image(db, listing=listing, image_id=image_id)
    if not image:
        raise HTTPException(status_code=404, detail="Image not found.")
    return image


@router.delete("/listings/{listing_id}/images/{image_id}", status_code=204)
def admin_delete_listing_image(listing_id: int, image_id: int, db: Session = Depends(get_db)):
    listing = crud_listing.get(db, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found.")

    removed = crud_listing.remove_image(db, listing=listing, image_id=image_id)
    if not removed:
        return Response(status_code=204)
    return Response(status_code=204)
