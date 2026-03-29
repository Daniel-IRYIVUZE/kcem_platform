"""routes/users.py — User profile & document management."""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.crud import crud_user
from app.auth.dependencies import get_current_active_user, require_admin
from app.schemas.user import UserRead, UserUpdate, DocumentUpload, DocumentRead
from app.utils.file_upload import save_upload, save_document_upload
from app.models.user import User, UserRole, UserStatus, DocumentType, UserDocument

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


@router.get("/me/documents", response_model=list[DocumentRead])
def get_my_documents(current_user: User = Depends(get_current_active_user),
                     db: Session = Depends(get_db)):
    """Return the authenticated user's submitted documents."""
    return crud_user.get_documents(db, user_id=current_user.id)


@router.post("/me/documents", response_model=DocumentRead, status_code=201)
def submit_document(payload: DocumentUpload, db: Session = Depends(get_db),
                    current_user: User = Depends(get_current_active_user)):
    doc = crud_user.add_document(db, user_id=current_user.id, obj_in=payload)
    return doc


@router.post("/me/documents/upload", response_model=DocumentRead, status_code=201)
def upload_document_file(
    doc_type: str = Query(..., description="Document type, e.g. rdb_certificate"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Upload a document file (PDF or image) and create a document record."""
    try:
        dtype = DocumentType(doc_type)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid doc_type: {doc_type}")

    file_url = save_document_upload(file, subfolder="documents")
    payload = DocumentUpload(
        doc_type=dtype,
        file_url=file_url,
        file_name=file.filename,
        notes=None
    )
    doc = crud_user.add_document(db, user_id=current_user.id, obj_in=payload)
    # Auto-approve RDB certificate uploads
    if dtype == "rdb_certificate":
        doc.status = "approved"
        db.commit()
        db.refresh(doc)
    return doc


@router.delete("/me/documents/{doc_id}", status_code=204)
def delete_my_document(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Delete one of the authenticated user's own documents."""
    doc = db.query(UserDocument).filter(
        UserDocument.id == doc_id,
        UserDocument.user_id == current_user.id,
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    db.delete(doc)
    db.commit()


# ── Admin endpoints ────────────────────────────────────────────────────────────

@router.get("", response_model=list[UserRead],
            dependencies=[Depends(require_admin)])
def list_users(role: str | None = None, status: str | None = None,
               skip: int = 0, limit: int = 20,
               db: Session = Depends(get_db)):
    from sqlalchemy.orm import Query as OrmQuery
    q: OrmQuery = db.query(User)
    if role:
        q = q.filter(User.role == UserRole(role))
    if status:
        q = q.filter(User.status == UserStatus(status))
    return q.offset(skip).limit(limit).all()


@router.get("/{user_id}", response_model=UserRead,
            dependencies=[Depends(require_admin)])
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = crud_user.get(db, user_id)
    if not user:
        raise HTTPException(404, "User not found.")
    return user


@router.put("/{user_id}", response_model=UserRead,
            dependencies=[Depends(require_admin)])
def update_user(user_id: int, payload: dict, db: Session = Depends(get_db)):
    """Admin: full update of a user record (name, email, phone, role, status, etc.)."""
    user = crud_user.admin_update(db, user_id=user_id, data=payload)
    if not user:
        raise HTTPException(404, "User not found.")
    return user


@router.delete("/{user_id}", status_code=204,
               dependencies=[Depends(require_admin)])
def delete_user(user_id: int, db: Session = Depends(get_db)):
    """Admin: permanently delete a user account."""
    user = crud_user.get(db, user_id)
    if not user:
        raise HTTPException(404, "User not found.")
    db.delete(user)
    db.commit()


@router.post("/{user_id}/approve", response_model=UserRead,
             dependencies=[Depends(require_admin)])
def approve_user(user_id: int, db: Session = Depends(get_db)):
    """Admin: approve / activate a user account."""
    user = crud_user.admin_update(db, user_id=user_id,
                                  data={"status": UserStatus.active, "is_verified": True})
    if not user:
        raise HTTPException(404, "User not found.")
    return user


@router.post("/{user_id}/suspend", response_model=UserRead,
             dependencies=[Depends(require_admin)])
def suspend_user(user_id: int, db: Session = Depends(get_db)):
    """Admin: suspend a user account."""
    user = crud_user.admin_update(db, user_id=user_id,
                                  data={"status": UserStatus.suspended})
    if not user:
        raise HTTPException(404, "User not found.")
    return user


