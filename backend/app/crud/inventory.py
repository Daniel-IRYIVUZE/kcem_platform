"""crud/inventory.py — Inventory CRUD."""
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.inventory import InventoryItem
from app.schemas.inventory import InventoryCreate, InventoryUpdate


class CRUDInventory(CRUDBase[InventoryItem, InventoryCreate, InventoryUpdate]):

    def get_by_recycler(self, db: Session, recycler_id: int, *,
                        skip: int = 0, limit: int = 50) -> list[InventoryItem]:
        return (db.query(InventoryItem)
                .filter(InventoryItem.recycler_id == recycler_id)
                .offset(skip).limit(limit).all())

    def adjust_quantity(self, db: Session, item_id: int, delta: float) -> InventoryItem | None:
        item = db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
        if item:
            item.current_stock = max(0.0, (item.current_stock or 0.0) + delta)
            db.commit()
            db.refresh(item)
        return item

    def get_by_waste_type(self, db: Session, recycler_id: int, waste_type: str) -> InventoryItem | None:
        return (db.query(InventoryItem)
                .filter(InventoryItem.recycler_id == recycler_id,
                        InventoryItem.material_type == waste_type)
                .first())


crud_inventory = CRUDInventory(InventoryItem)
