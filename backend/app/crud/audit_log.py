"""crud/audit_log.py — Audit log CRUD."""
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.audit_log import AuditLog
from app.schemas.audit_log import AuditLogCreate
from pydantic import BaseModel


class _NoUpdate(BaseModel):
    pass


class CRUDAuditLog(CRUDBase[AuditLog, AuditLogCreate, _NoUpdate]):

    def log(self, db: Session, *, user_id: int | None, action: str,
            resource_type: str, resource_id: int | None = None,
            detail: str | None = None, ip_address: str | None = None) -> AuditLog:
        entry = AuditLog(
            user_id=user_id,
            action=action,
            entity_type=resource_type,
            entity_id=resource_id,
            notes=detail,
            ip_address=ip_address,
            created_at=datetime.now(timezone.utc),
        )
        db.add(entry)
        db.commit()
        db.refresh(entry)
        return entry

    def get_by_user(self, db: Session, user_id: int, *,
                    skip: int = 0, limit: int = 50) -> list[AuditLog]:
        return (db.query(AuditLog)
                .filter(AuditLog.user_id == user_id)
                .order_by(AuditLog.created_at.desc())
                .offset(skip).limit(limit).all())

    def get_by_resource(self, db: Session, resource_type: str, resource_id: int) -> list[AuditLog]:
        return (db.query(AuditLog)
                .filter(AuditLog.entity_type == resource_type,
                        AuditLog.entity_id == resource_id)
                .order_by(AuditLog.created_at.desc()).all())

    def get_recent(self, db: Session, limit: int = 100) -> list[AuditLog]:
        return db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()


crud_audit_log = CRUDAuditLog(AuditLog)
