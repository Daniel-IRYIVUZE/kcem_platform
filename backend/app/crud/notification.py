"""crud/notification.py — Notification CRUD."""
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.notification import Notification, NotificationType
from app.schemas.notification import NotificationRead
from pydantic import BaseModel


class _NotifCreate(BaseModel):
    user_id: int
    type: NotificationType
    title: str
    body: str
    link: str | None = None
    meta_data: str | None = None


class CRUDNotification(CRUDBase[Notification, _NotifCreate, _NotifCreate]):

    def push(self, db: Session, *, user_id: int, notif_type: NotificationType,
             title: str, body: str, link: str | None = None) -> Notification:
        n = Notification(user_id=user_id, type=notif_type, title=title, body=body, link=link)
        db.add(n)
        db.commit()
        db.refresh(n)
        return n

    def get_for_user(self, db: Session, user_id: int, *, skip: int = 0, limit: int = 30) -> list[Notification]:
        return (db.query(Notification)
                .filter(Notification.user_id == user_id)
                .order_by(Notification.created_at.desc())
                .offset(skip).limit(limit).all())

    def mark_read(self, db: Session, *, notif_id: int, user_id: int) -> Notification | None:
        n = db.query(Notification).filter(
            Notification.id == notif_id, Notification.user_id == user_id
        ).first()
        if n:
            n.is_read = True
            db.commit()
        return n

    def mark_all_read(self, db: Session, *, user_id: int) -> int:
        count = db.query(Notification).filter(
            Notification.user_id == user_id, Notification.is_read == False
        ).update({"is_read": True})
        db.commit()
        return count

    def unread_count(self, db: Session, user_id: int) -> int:
        return db.query(Notification).filter(
            Notification.user_id == user_id, Notification.is_read == False
        ).count()


crud_notification = CRUDNotification(Notification)
