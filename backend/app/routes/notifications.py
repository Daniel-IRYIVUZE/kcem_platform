"""routes/notifications.py — Notification endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.crud import crud_notification
from app.auth.dependencies import get_current_active_user
from app.schemas.notification import NotificationRead
from app.models.user import User

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=list[NotificationRead])
def get_notifications(skip: int = 0, limit: int = 30,
                      db: Session = Depends(get_db),
                      current_user: User = Depends(get_current_active_user)):
    return crud_notification.get_for_user(db, user_id=current_user.id,
                                          skip=skip, limit=limit)


@router.get("/unread-count")
def unread_count(db: Session = Depends(get_db),
                 current_user: User = Depends(get_current_active_user)):
    return {"count": crud_notification.unread_count(db, user_id=current_user.id)}


@router.post("/{notif_id}/read", status_code=200)
def mark_read(notif_id: int, db: Session = Depends(get_db),
              current_user: User = Depends(get_current_active_user)):
    notif = crud_notification.mark_read(db, notif_id=notif_id, user_id=current_user.id)
    if notif is None:
        raise HTTPException(404, "Notification not found.")
    return {"ok": True}


@router.post("/read-all", status_code=200)
def mark_all_read(db: Session = Depends(get_db),
                  current_user: User = Depends(get_current_active_user)):
    count = crud_notification.mark_all_read(db, user_id=current_user.id)
    return {"marked": count}
