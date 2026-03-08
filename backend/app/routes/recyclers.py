"""routes/recyclers.py — Recycler company endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.crud import crud_recycler
from app.auth.dependencies import get_current_active_user, require_role
from app.schemas.recycler import RecyclerCreate, RecyclerUpdate, RecyclerRead
from app.models.user import User, UserRole

router = APIRouter(prefix="/recyclers", tags=["Recyclers"])
require_recycler_role = require_role(UserRole.recycler, UserRole.admin)


@router.post("/", response_model=RecyclerRead, status_code=201,
             dependencies=[Depends(require_recycler_role)])
def create_recycler(payload: RecyclerCreate, db: Session = Depends(get_db),
                    current_user: User = Depends(get_current_active_user)):
    if crud_recycler.get_by_user(db, current_user.id):
        raise HTTPException(409, "Recycler profile already exists.")
    return crud_recycler.create(db, obj_in=payload, user_id=current_user.id)


@router.get("/me", response_model=RecyclerRead,
            dependencies=[Depends(require_recycler_role)])
def my_recycler(db: Session = Depends(get_db),
                current_user: User = Depends(get_current_active_user)):
    rec = crud_recycler.get_by_user(db, current_user.id)
    if not rec:
        raise HTTPException(404, "No recycler profile found.")
    return rec


@router.patch("/me", response_model=RecyclerRead,
              dependencies=[Depends(require_recycler_role)])
def update_recycler(payload: RecyclerUpdate, db: Session = Depends(get_db),
                    current_user: User = Depends(get_current_active_user)):
    rec = crud_recycler.get_by_user(db, current_user.id)
    if not rec:
        raise HTTPException(404, "No recycler profile found.")
    return crud_recycler.update(db, db_obj=rec, obj_in=payload)


@router.get("/", response_model=list[RecyclerRead])
def list_recyclers(verified_only: bool = False, skip: int = 0, limit: int = 20,
                   db: Session = Depends(get_db)):
    if verified_only:
        return crud_recycler.get_verified(db, skip=skip, limit=limit)
    return crud_recycler.get_multi(db, skip=skip, limit=limit)


@router.get("/{recycler_id}", response_model=RecyclerRead)
def get_recycler(recycler_id: int, db: Session = Depends(get_db)):
    rec = crud_recycler.get(db, recycler_id)
    if not rec:
        raise HTTPException(404, "Recycler not found.")
    return rec
