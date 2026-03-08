"""crud/transaction.py — Transaction CRUD."""
import uuid
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.transaction import Transaction, TransactionStatus, Payment
from app.schemas.transaction import PaymentCreate
from app.config import settings
from pydantic import BaseModel


class _TxCreate(BaseModel):
    pass  # created manually


class CRUDTransaction(CRUDBase[Transaction, _TxCreate, _TxCreate]):

    def create_for_bid(self, db: Session, *, listing_id: int, collection_id: int,
                       hotel_id: int, recycler_id: int,
                       gross_amount: float) -> Transaction:
        fee = round(gross_amount * settings.PLATFORM_FEE_PERCENT / 100, 2)
        tx = Transaction(
            listing_id=listing_id,
            collection_id=collection_id,
            hotel_id=hotel_id,
            recycler_id=recycler_id,
            reference=f"TXN-{uuid.uuid4().hex[:10].upper()}",
            gross_amount=gross_amount,
            platform_fee=fee,
            net_amount=round(gross_amount - fee, 2),
            status=TransactionStatus.pending,
        )
        db.add(tx)
        db.commit()
        db.refresh(tx)
        return tx

    def get_by_hotel(self, db: Session, hotel_id: int, *, skip: int = 0, limit: int = 20) -> list[Transaction]:
        return (db.query(Transaction)
                .filter(Transaction.hotel_id == hotel_id)
                .order_by(Transaction.created_at.desc())
                .offset(skip).limit(limit).all())

    def get_by_recycler(self, db: Session, recycler_id: int, *, skip: int = 0, limit: int = 20) -> list[Transaction]:
        return (db.query(Transaction)
                .filter(Transaction.recycler_id == recycler_id)
                .order_by(Transaction.created_at.desc())
                .offset(skip).limit(limit).all())

    def complete(self, db: Session, *, tx: Transaction) -> Transaction:
        from datetime import datetime, timezone
        tx.status = TransactionStatus.completed
        tx.completed_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(tx)
        return tx

    def add_payment(self, db: Session, *, obj_in: PaymentCreate) -> Payment:
        p = Payment(
            transaction_id=obj_in.transaction_id,
            amount=obj_in.amount,
            method=obj_in.method,
            phone_number=obj_in.phone_number,
        )
        db.add(p)
        db.commit()
        db.refresh(p)
        return p

    def revenue_total(self, db: Session) -> float:
        from sqlalchemy import func
        row = db.query(func.sum(Transaction.gross_amount)).filter(
            Transaction.status == TransactionStatus.completed
        ).scalar()
        return row or 0.0

    def platform_fees_total(self, db: Session) -> float:
        from sqlalchemy import func
        row = db.query(func.sum(Transaction.platform_fee)).filter(
            Transaction.status == TransactionStatus.completed
        ).scalar()
        return row or 0.0


crud_transaction = CRUDTransaction(Transaction)
