"""schemas/user.py — User Pydantic schemas."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, field_validator
from app.models.user import UserRole, UserStatus, DocumentType, DocumentStatus


# ── Auth ──────────────────────────────────────────────────────────────────────
class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = 3600
    role: Optional[str] = None
    must_change_password: bool = False
    user: "UserRead"


class PasswordReset(BaseModel):
    email: EmailStr

# Alias used in auth routes
PasswordResetRequest = PasswordReset


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


# ── User CRUD ─────────────────────────────────────────────────────────────────
class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    phone: Optional[str] = None
    role: UserRole = UserRole.individual

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone:     Optional[str] = None
    email:     Optional[EmailStr] = None
    avatar_url: Optional[str] = None


class UserAdminUpdate(BaseModel):
    full_name:   Optional[str] = None
    phone:       Optional[str] = None
    role:        Optional[UserRole] = None
    status:      Optional[UserStatus] = None
    is_verified: Optional[bool] = None


class UserRead(BaseModel):
    id:               int
    email:            str
    full_name:        str
    phone:            Optional[str]
    role:             UserRole
    status:           UserStatus
    is_verified:      bool
    is_email_verified: bool
    avatar_url:       Optional[str]
    last_login:       Optional[datetime]
    created_at:       datetime
    must_change_password: bool = False

    model_config = {"from_attributes": True}


class UserListRead(BaseModel):
    id:          int
    email:       str
    full_name:   str
    role:        UserRole
    status:      UserStatus
    is_verified: bool
    created_at:  datetime

    model_config = {"from_attributes": True}


# ── Documents ─────────────────────────────────────────────────────────────────
class DocumentUpload(BaseModel):
    doc_type: DocumentType
    file_url: str = ""
    file_name: Optional[str] = None
    notes: Optional[str] = None


class DocumentRead(BaseModel):
    id:          int
    user_id:     int
    doc_type:    DocumentType
    file_url:    str
    file_name:   Optional[str]
    status:      DocumentStatus
    notes:       Optional[str]
    reviewed_at: Optional[datetime]
    created_at:  datetime

    model_config = {"from_attributes": True}
