"""routes/inventory.py — Recycler inventory endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.crud import crud_inventory, crud_recycler
from app.auth.dependencies import get_current_active_user, require_role
from app.schemas.inventory import InventoryCreate, InventoryUpdate, InventoryRead
from app.models.user import User, UserRole

router = APIRouter(prefix="/inventory", tags=["Inventory"])
require_recycler_role = require_role(UserRole.recycler, UserRole.admin)


@router.get("/mine", response_model=list[InventoryRead],
            dependencies=[Depends(require_recycler_role)])
def my_inventory(skip: int = 0, limit: int = 50, db: Session = Depends(get_db),
                 current_user: User = Depends(get_current_active_user)):
    rec = crud_recycler.get_by_user(db, current_user.id)
    if not rec:
        return []
    return crud_inventory.get_by_recycler(db, rec.id, skip=skip, limit=limit)


@router.post("/", response_model=InventoryRead, status_code=201,
             dependencies=[Depends(require_recycler_role)])
def add_inventory(payload: InventoryCreate, db: Session = Depends(get_db),
                  current_user: User = Depends(get_current_active_user)):
    rec = crud_recycler.get_by_user(db, current_user.id)
    if not rec:
        raise HTTPException(400, "Recycler profile required.")
    return crud_inventory.create(db, obj_in=payload, recycler_id=rec.id)


@router.patch("/{item_id}", response_model=InventoryRead,
              dependencies=[Depends(require_recycler_role)])
def update_inventory(item_id: int, payload: InventoryUpdate,
                     db: Session = Depends(get_db),
                     current_user: User = Depends(get_current_active_user)):
    item = crud_inventory.get(db, item_id)
    if not item:
        raise HTTPException(404, "Item not found.")
    rec = crud_recycler.get_by_user(db, current_user.id)
    if not rec or item.recycler_id != rec.id:
        raise HTTPException(403, "Not your inventory item.")
    return crud_inventory.update(db, db_obj=item, obj_in=payload)


@router.patch("/{item_id}/adjust", response_model=InventoryRead,
              dependencies=[Depends(require_recycler_role)])
def adjust_quantity(item_id: int, payload: dict, db: Session = Depends(get_db),
                    current_user: User = Depends(get_current_active_user)):
    item = crud_inventory.get(db, item_id)
    if not item:
        raise HTTPException(404, "Item not found.")
    return crud_inventory.adjust_quantity(db, item_id=item_id, delta=payload.get("delta", 0))


@router.delete("/{item_id}", status_code=204,
               dependencies=[Depends(require_recycler_role)])
def delete_inventory(item_id: int, db: Session = Depends(get_db),
                     current_user: User = Depends(get_current_active_user)):
    item = crud_inventory.get(db, item_id)
    if not item:
        raise HTTPException(404, "Item not found.")
    crud_inventory.remove(db, id=item_id)
