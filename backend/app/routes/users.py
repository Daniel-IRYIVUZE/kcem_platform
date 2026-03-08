"""routes/users.py — User profile & document management."""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.crud import crud_user
from app.auth.dependencies import get_current_active_user, require_admin
from app.schemas.user import UserRead, UserUpdate, DocumentUpload
from app.utils.file_upload import save_upload
from app.models.user import User, UserRole

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserRead)
def get_me(current_user: User = Depends(get_current_active_user)):
    return current_user


@router.patch("/me", response_model=UserRead)
def update_me(payload: UserUpdate, db: Session = Depends(get_db),
              current_user: User = Depends(get_current_active_user)):
    return crud_user.update(db, db_obj=current_user, obj_in=payload)


@router.post("/me/avatar", response_model=UserRead)
def upload_avatar(file: UploadFile = File(...), db: Session = Depends(get_db),
                  current_user: User = Depends(get_current_active_user)):
    url = save_upload(file, subfolder="avatars")
    return crud_user.update(db, db_obj=current_user, obj_in={"avatar_url": url})


@router.post("/me/documents", status_code=201)
def submit_document(payload: DocumentUpload, db: Session = Depends(get_db),
                    current_user: User = Depends(get_current_active_user)):
    doc = crud_user.add_document(db, user_id=current_user.id, obj_in=payload)
    return doc


# ── Admin endpoints ────────────────────────────────────────────────────────────

@router.get("/", response_model=list[UserRead],
            dependencies=[Depends(require_admin)])
def list_users(role: str | None = None, skip: int = 0, limit: int = 20,
               db: Session = Depends(get_db)):
    if role:
        return crud_user.list_by_role(db, role=UserRole(role), skip=skip, limit=limit)
    return crud_user.get_multi(db, skip=skip, limit=limit)


@router.get("/search", response_model=list[UserRead],
            dependencies=[Depends(require_admin)])
def search_users(q: str, db: Session = Depends(get_db)):
    return crud_user.search(db, query=q)


@router.get("/{user_id}", response_model=UserRead,
            dependencies=[Depends(require_admin)])
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = crud_user.get(db, user_id)
    if not user:
        raise HTTPException(404, "User not found.")
    return user


@router.patch("/{user_id}/status", response_model=UserRead,
              dependencies=[Depends(require_admin)])
def update_user_status(user_id: int, payload: dict, db: Session = Depends(get_db)):
    user = crud_user.admin_update(db, user_id=user_id, data=payload)
    if not user:
        raise HTTPException(404, "User not found.")
    return user


@router.patch("/{user_id}/documents/{doc_id}", dependencies=[Depends(require_admin)])
def review_document(user_id: int, doc_id: int, payload: dict,
                    db: Session = Depends(get_db)):
    doc = crud_user.review_document(db, doc_id=doc_id, status=payload["status"],
                                    notes=payload.get("notes"))
    if not doc:
        raise HTTPException(404, "Document not found.")
    return doc
