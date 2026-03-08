"""routes/auth.py — Authentication endpoints."""
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.crud import crud_user, crud_audit_log
from app.auth.jwt import create_access_token, create_refresh_token, verify_refresh_token
from app.auth.dependencies import get_current_active_user
from app.schemas.user import (
    UserCreate, UserRead, TokenResponse,
    PasswordResetRequest, PasswordResetConfirm,
)
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    if crud_user.get_by_email(db, payload.email):
        raise HTTPException(status_code=409, detail="Email already registered.")
    user = crud_user.create_user(db, obj_in=payload)
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


@router.get("/me", response_model=UserRead)
def me(current_user: User = Depends(get_current_active_user)):
    return current_user
