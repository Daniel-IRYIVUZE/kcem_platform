"""routes/auth.py — Authentication endpoints."""
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.database import get_db
from app.crud import crud_user, crud_audit_log
from app.auth.jwt import create_access_token, create_refresh_token, verify_refresh_token
from app.auth.dependencies import get_current_active_user
from app.auth.password import hash_password
from app.schemas.user import (
    UserCreate, UserRead, TokenResponse,
    PasswordResetRequest, PasswordResetConfirm,
)
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.get("/check-availability")
def check_availability(
    email: str | None = None,
    phone: str | None = None,
    full_name: str | None = None,
    db: Session = Depends(get_db),
):
    response: dict[str, dict] = {}

    if email is not None:
        normalized_email = email.strip().lower()
        if not normalized_email:
            response["email"] = {
                "value": normalized_email,
                "available": False,
                "message": "Email is required.",
            }
        else:
            exists = crud_user.get_by_email(db, normalized_email) is not None
            response["email"] = {
                "value": normalized_email,
                "available": not exists,
                "message": "Email already registered." if exists else "Email available.",
            }

    if phone is not None:
        normalized_phone = phone.strip()
        if normalized_phone == "":
            response["phone"] = {
                "value": normalized_phone,
                "available": True,
                "message": "Phone is optional.",
            }
        else:
            exists = crud_user.get_by_phone(db, normalized_phone) is not None
            response["phone"] = {
                "value": normalized_phone,
                "available": not exists,
                "message": "Phone already registered." if exists else "Phone available.",
            }

    if full_name is not None:
        normalized_name = full_name.strip()
        if not normalized_name:
            response["full_name"] = {
                "value": normalized_name,
                "available": False,
                "message": "Name is required.",
            }
        else:
            exists = crud_user.get_by_full_name(db, normalized_name) is not None
            response["full_name"] = {
                "value": normalized_name,
                "available": not exists,
                "message": "Name already exists." if exists else "Name available.",
            }

    return response


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    if crud_user.get_by_email(db, payload.email):
        raise HTTPException(status_code=409, detail="Email already registered.")
    phone = payload.phone.strip() if payload.phone else None
    if phone == "":
        phone = None
    if phone and crud_user.get_by_phone(db, phone):
        raise HTTPException(status_code=409, detail="Phone number already registered.")
    if phone is not None:
        payload.phone = phone
    try:
        user = crud_user.create_user(db, obj_in=payload)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Email or phone already registered.")
    crud_audit_log.log(db, user_id=user.id, action="register",
                       resource_type="user", resource_id=user.id)
    return user


@router.post("/login", response_model=TokenResponse)
def login(payload: dict, request: Request, db: Session = Depends(get_db)):
    """Accepts JSON: {email, password}"""
    email = payload.get("email", "")
    password = payload.get("password", "")
    user = crud_user.authenticate(db, email=email, password=password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials.")
    if user.status.value == "suspended":
        raise HTTPException(status_code=403, detail="Account suspended.")

    access = create_access_token(subject=str(user.id), role=user.role.value)
    refresh = create_refresh_token(subject=str(user.id))
    crud_user.store_refresh_token(db, user_id=user.id, token=refresh)
    crud_user.update_last_login(db, user_id=user.id)
    crud_audit_log.log(db, user_id=user.id, action="login", resource_type="user",
                       resource_id=user.id, ip_address=request.client.host if request.client else None)
    return TokenResponse(
        access_token=access,
        refresh_token=refresh,
        token_type="bearer",
        role=user.role.value,
        must_change_password=bool(getattr(user, 'must_change_password', False)),
        user=UserRead.model_validate(user),
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(payload: dict, db: Session = Depends(get_db)):
    token = payload.get("refresh_token", "")
    user_id_str = verify_refresh_token(token)
    if not user_id_str:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token.")
    user = crud_user.get(db, int(user_id_str))
    if not user or user.refresh_token != token:
        raise HTTPException(status_code=401, detail="Token revoked.")
    access = create_access_token(subject=str(user.id), role=user.role.value)
    new_refresh = create_refresh_token(subject=str(user.id))
    crud_user.store_refresh_token(db, user_id=user.id, token=new_refresh)
    return TokenResponse(
        access_token=access,
        refresh_token=new_refresh,
        token_type="bearer",
        role=user.role.value,
        must_change_password=bool(getattr(user, 'must_change_password', False)),
        user=UserRead.model_validate(user),
    )


@router.post("/logout", status_code=204)
def logout(current_user: User = Depends(get_current_active_user),
           db: Session = Depends(get_db)):
    crud_user.store_refresh_token(db, user_id=current_user.id, token=None)


@router.post("/forgot-password", status_code=200)
def forgot_password(payload: PasswordResetRequest, db: Session = Depends(get_db)):
    user = crud_user.get_by_email(db, payload.email)
    if user:
        import secrets
        token = secrets.token_urlsafe(32)
        crud_user.set_reset_token(db, user_id=user.id, token=token)
        # TODO: send email with reset link containing `token`
    return {"message": "If that email exists, a reset link has been sent."}


@router.post("/reset-password", status_code=200)
def reset_password(payload: PasswordResetConfirm, db: Session = Depends(get_db)):
    ok = crud_user.reset_password(db, token=payload.token, new_password=payload.new_password)
    if not ok:
        raise HTTPException(status_code=400, detail="Invalid or expired token.")
    return {"message": "Password reset successful."}


@router.post("/change-password", status_code=200)
def change_password(
    payload: dict,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Change password (used for first-login forced change or voluntary change)."""
    new_password = payload.get("new_password", "")
    if len(new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")
    crud_user.change_password(db, user=current_user, new_password=new_password)
    return {"message": "Password changed successfully."}


@router.get("/me", response_model=UserRead)
def me(current_user: User = Depends(get_current_active_user)):
    return current_user
