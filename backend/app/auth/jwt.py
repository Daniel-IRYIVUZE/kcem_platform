"""auth/jwt.py — Token creation and verification."""
from datetime import datetime, timedelta, timezone
from typing import Optional
import jwt
from app.config import settings


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def create_access_token(subject: str | int, role: str, extra: dict | None = None) -> str:
    """Create a signed JWT access token."""
    expire = _utc_now() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": str(subject),
        "role": role,
        "type": "access",
        "iat": _utc_now(),
        "exp": expire,
    }
    if extra:
        payload.update(extra)
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(subject: str | int) -> str:
    """Create a signed JWT refresh token (long-lived)."""
    expire = _utc_now() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {
        "sub": str(subject),
        "type": "refresh",
        "iat": _utc_now(),
        "exp": expire,
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def _decode_token(token: str) -> dict:
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])


def verify_access_token(token: str) -> Optional[dict]:
    """Decode and verify access token. Returns payload or None."""
    try:
        payload = _decode_token(token)
        if payload.get("type") != "access":
            return None
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def verify_refresh_token(token: str) -> Optional[str]:
    """Decode and verify refresh token. Returns user_id (sub) or None."""
    try:
        payload = _decode_token(token)
        if payload.get("type") != "refresh":
            return None
        return payload.get("sub")
    except jwt.InvalidTokenError:
        return None
