"""auth/dependencies.py — FastAPI security dependencies."""
from typing import Callable
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth.jwt import verify_access_token
from app.models.user import User, UserRole, UserStatus

bearer_scheme = HTTPBearer(auto_error=False)

CREDENTIALS_EXCEPTION = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Invalid or expired token",
    headers={"WWW-Authenticate": "Bearer"},
)

FORBIDDEN_EXCEPTION = HTTPException(
    status_code=status.HTTP_403_FORBIDDEN,
    detail="Insufficient permissions",
)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Extract and validate user from Bearer JWT."""
    if not credentials:
        raise CREDENTIALS_EXCEPTION

    payload = verify_access_token(credentials.credentials)
    if not payload:
        raise CREDENTIALS_EXCEPTION

    user_id = payload.get("sub")
    if not user_id:
        raise CREDENTIALS_EXCEPTION

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise CREDENTIALS_EXCEPTION
    return user


def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Ensure user is not suspended/inactive."""
    if current_user.status == UserStatus.suspended:
        raise HTTPException(status_code=403, detail="Account suspended")
    return current_user


def require_role(*roles: UserRole) -> Callable:
    """Factory: returns a dependency that enforces role membership."""
    def _check(current_user: User = Depends(get_current_active_user)) -> User:
        if current_user.role not in roles:
            raise FORBIDDEN_EXCEPTION
        return current_user
    return _check


# Pre-built role guard callables (use with Depends() in routes)
require_admin     = require_role(UserRole.admin)
require_business  = require_role(UserRole.business, UserRole.admin)
require_recycler  = require_role(UserRole.recycler, UserRole.admin)
require_driver    = require_role(UserRole.driver, UserRole.admin)
require_any_auth  = get_current_active_user
