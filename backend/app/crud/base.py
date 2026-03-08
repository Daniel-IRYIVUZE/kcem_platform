"""crud/base.py — Generic CRUD base class."""
from typing import Generic, TypeVar, Type, Any
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import Base

ModelType  = TypeVar("ModelType", bound=Base)
CreateType = TypeVar("CreateType", bound=BaseModel)
UpdateType = TypeVar("UpdateType", bound=BaseModel)


class CRUDBase(Generic[ModelType, CreateType, UpdateType]):
    def __init__(self, model: Type[ModelType]):
        self.model = model

    def get(self, db: Session, id: int) -> ModelType | None:
        return db.query(self.model).filter(self.model.id == id).first()

    def get_multi(self, db: Session, *, skip: int = 0, limit: int = 20) -> list[ModelType]:
        return db.query(self.model).offset(skip).limit(limit).all()

    def count(self, db: Session) -> int:
        return db.query(self.model).count()

    def create(self, db: Session, *, obj_in: CreateType, **extra: Any) -> ModelType:
        data = obj_in.model_dump(exclude_unset=True)
        data.update(extra)
        db_obj = self.model(**data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(self, db: Session, *, db_obj: ModelType, obj_in: UpdateType | dict) -> ModelType:
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, *, id: int) -> ModelType | None:
        obj = db.query(self.model).get(id)
        if obj:
            db.delete(obj)
            db.commit()
        return obj
