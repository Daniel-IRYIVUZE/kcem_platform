"""models/user.py — User, Role and Document models."""
import enum
from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime,
    ForeignKey, Text, Enum as SAEnum
)
from sqlalchemy.orm import relationship
from app.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class UserRole(str, enum.Enum):
    admin      = "admin"
    business   = "business"   # hotel
    recycler   = "recycler"
    driver     = "driver"
    individual = "individual"


class UserStatus(str, enum.Enum):
    active    = "active"
    inactive  = "inactive"
    suspended = "suspended"
    pending   = "pending"


class Role(Base):
    __tablename__ = "roles"

    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String(50), unique=True, nullable=False)
    description = Column(Text)
    created_at  = Column(DateTime(timezone=True), default=utc_now)

    # Relationships
    users = relationship("User", back_populates="role_obj")


class User(Base):
    __tablename__ = "users"

    id                    = Column(Integer, primary_key=True, index=True)
    email                 = Column(String(255), unique=True, index=True, nullable=False)
    phone                 = Column(String(20), unique=True, index=True, nullable=True)
    full_name             = Column(String(255), nullable=False)
    password_hash         = Column(String(255), nullable=False)
    role                  = Column(SAEnum(UserRole), nullable=False, default=UserRole.individual)
    role_id               = Column(Integer, ForeignKey("roles.id"), nullable=True)
    status                = Column(SAEnum(UserStatus), default=UserStatus.pending)
    is_verified           = Column(Boolean, default=False)
    is_email_verified     = Column(Boolean, default=False)
    avatar_url            = Column(String(500), nullable=True)
    refresh_token         = Column(Text, nullable=True)
    must_change_password  = Column(Boolean, default=False)
    reset_token           = Column(String(255), nullable=True)
    reset_token_expires   = Column(DateTime(timezone=True), nullable=True)
    email_verify_token    = Column(String(255), nullable=True)
    last_login            = Column(DateTime(timezone=True), nullable=True)
    created_at            = Column(DateTime(timezone=True), default=utc_now)
    updated_at            = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    # Relationships
    role_obj       = relationship("Role", back_populates="users")
    hotel          = relationship("Hotel", back_populates="user", uselist=False)
    recycler       = relationship("Recycler", back_populates="user", uselist=False)
    driver         = relationship("Driver", back_populates="user", uselist=False)
    documents      = relationship("UserDocument", foreign_keys="[UserDocument.user_id]", back_populates="user", cascade="all, delete-orphan")
    notifications  = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    sent_messages  = relationship("Message", foreign_keys="Message.sender_id", back_populates="sender")
    audit_logs     = relationship("AuditLog", back_populates="user")
    green_scores   = relationship("GreenScore", back_populates="user")
    blog_posts     = relationship("BlogPost", back_populates="author", cascade="all, delete-orphan")


class DocumentType(str, enum.Enum):
    business_license  = "business_license"
    id_card           = "id_card"
    tax_certificate   = "tax_certificate"
    environmental_permit = "environmental_permit"
    driver_license    = "driver_license"
    vehicle_insurance = "vehicle_insurance"
    rdb_certificate   = "rdb_certificate"  # New doc type
    other             = "other"


class DocumentStatus(str, enum.Enum):
    pending  = "pending"
    approved = "approved"
    rejected = "rejected"


class UserDocument(Base):
    __tablename__ = "user_documents"

    id          = Column(Integer, primary_key=True, index=True)
    user_id     = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    doc_type    = Column(SAEnum(DocumentType), nullable=False)
    file_url    = Column(String(500), nullable=False)
    file_name   = Column(String(255))
    status      = Column(SAEnum(DocumentStatus), default=DocumentStatus.pending)
    notes       = Column(Text, nullable=True)
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    created_at  = Column(DateTime(timezone=True), default=utc_now)
    updated_at  = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    # Relationships
    user     = relationship("User", foreign_keys=[user_id], back_populates="documents")
    reviewer = relationship("User", foreign_keys=[reviewed_by])
