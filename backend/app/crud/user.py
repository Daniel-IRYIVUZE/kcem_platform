"""crud/user.py — User CRUD operations."""
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.user import User, UserRole, UserStatus, UserDocument, DocumentStatus
from app.schemas.user import UserCreate, UserUpdate, UserAdminUpdate, DocumentUpload
from app.auth.password import hash_password, verify_password


class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):

    def get_by_email(self, db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email.lower()).first()

    def get_by_phone(self, db: Session, phone: str) -> Optional[User]:
        return db.query(User).filter(User.phone == phone).first()

    def create_user(self, db: Session, *, obj_in: UserCreate) -> User:
        db_obj = User(
            email=obj_in.email.lower(),
            full_name=obj_in.full_name,
            phone=obj_in.phone,
            password_hash=hash_password(obj_in.password),
            role=obj_in.role,
            status=UserStatus.pending,
            email_verify_token=secrets.token_urlsafe(32),
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def authenticate(self, db: Session, *, email: str, password: str) -> Optional[User]:
        user = self.get_by_email(db, email)
        if not user:
            return None
        if not verify_password(password, user.password_hash):
            return None
        return user

    def update_last_login(self, db: Session, *, user_id: int) -> None:
        db.query(User).filter(User.id == user_id).update(
            {"last_login": datetime.now(timezone.utc), "status": UserStatus.active}
        )
        db.commit()

    def verify_email(self, db: Session, *, token: str) -> Optional[User]:
        user = db.query(User).filter(User.email_verify_token == token).first()
        if not user:
            return None
        user.is_email_verified = True
        user.email_verify_token = None
        user.status = UserStatus.active
        db.commit()
        db.refresh(user)
        return user

    def set_reset_token(self, db: Session, *, user_id: int, token: str) -> None:
        db.query(User).filter(User.id == user_id).update({
            "reset_token": token,
            "reset_token_expires": datetime.now(timezone.utc) + timedelta(hours=1),
        })
        db.commit()

    def reset_password(self, db: Session, *, token: str, new_password: str) -> bool:
        user = db.query(User).filter(
            User.reset_token == token,
            User.reset_token_expires > datetime.now(timezone.utc),
        ).first()
        if not user:
            return False
        user.password_hash = hash_password(new_password)
        user.reset_token = None
        user.reset_token_expires = None
        db.commit()
        return True

    def store_refresh_token(self, db: Session, *, user_id: int, token: str | None) -> None:
        db.query(User).filter(User.id == user_id).update({"refresh_token": token})
        db.commit()

    def admin_update(self, db: Session, *, user_id: int, data: dict) -> Optional[User]:
        user = self.get(db, user_id)
        if not user:
            return None
        for k, v in data.items():
            setattr(user, k, v)
        db.commit()
        db.refresh(user)
        return user

    def list_by_role(self, db: Session, role: UserRole, skip: int = 0, limit: int = 20) -> list[User]:
        return db.query(User).filter(User.role == role).offset(skip).limit(limit).all()

    def search(self, db: Session, *, query: str, skip: int = 0, limit: int = 20) -> list[User]:
        pattern = f"%{query}%"
        return (
            db.query(User)
            .filter(
                (User.full_name.ilike(pattern)) |
                (User.email.ilike(pattern)) |
                (User.phone.ilike(pattern))
            )
            .offset(skip).limit(limit).all()
        )

    # ── Documents ────────────────────────────────────────────────────────────
    def add_document(self, db: Session, *, user_id: int, obj_in: "DocumentUpload") -> UserDocument:
        doc = UserDocument(
            user_id=user_id,
            doc_type=obj_in.doc_type,
            file_url=getattr(obj_in, 'file_url', ''),
            file_name=getattr(obj_in, 'file_name', None),
            notes=obj_in.notes,
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)
        return doc

    def review_document(self, db: Session, *, doc_id: int, status: str, notes: str | None = None) -> Optional[UserDocument]:
        doc = db.query(UserDocument).filter(UserDocument.id == doc_id).first()
        if not doc:
            return None
        doc.status = DocumentStatus(status)
        doc.reviewed_at = datetime.now(timezone.utc)
        if notes:
            doc.notes = notes
        db.commit()
        db.refresh(doc)
        return doc


crud_user = CRUDUser(User)
