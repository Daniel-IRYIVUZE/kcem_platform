"""routes/transactions.py — Transaction & payment endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.crud import crud_transaction, crud_hotel, crud_recycler
from app.auth.dependencies import get_current_active_user, require_admin, require_role
from app.schemas.transaction import TransactionCreate, TransactionRead, PaymentCreate
from app.models.user import User, UserRole
from app.services.notification_service import notify_payment_received

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.get("/mine", response_model=list[TransactionRead])
def my_transactions(skip: int = 0, limit: int = 20, db: Session = Depends(get_db),
                    current_user: User = Depends(get_current_active_user)):
    if current_user.role == UserRole.business:
        hotel = crud_hotel.get_by_user(db, current_user.id)
        return crud_transaction.get_by_hotel(db, hotel.id, skip=skip, limit=limit) if hotel else []
    if current_user.role == UserRole.recycler:
        rec = crud_recycler.get_by_user(db, current_user.id)
        return crud_transaction.get_by_recycler(db, rec.id, skip=skip, limit=limit) if rec else []
    return []


@router.get("/{transaction_id}", response_model=TransactionRead)
def get_transaction(transaction_id: int, db: Session = Depends(get_db),
                    _: User = Depends(get_current_active_user)):
    tx = crud_transaction.get(db, transaction_id)
    if not tx:
        raise HTTPException(404, "Transaction not found.")
    return tx


@router.post("/{transaction_id}/pay", status_code=200)
def add_payment(transaction_id: int, payload: PaymentCreate,
                db: Session = Depends(get_db),
                current_user: User = Depends(get_current_active_user)):
    tx = crud_transaction.get(db, transaction_id)
    if not tx:
        raise HTTPException(404, "Transaction not found.")
    payment = crud_transaction.add_payment(db, obj_in=payload)
    # complete transaction after payment
    tx = crud_transaction.complete(db, tx=tx)
    notify_payment_received(db, user_id=tx.recycler.user_id,
                            amount=tx.net_amount, transaction_id=tx.id)
    return payment


# ── Admin ──────────────────────────────────────────────────────────────────

@router.patch("/{transaction_id}/status", response_model=TransactionRead,
              dependencies=[Depends(require_admin)])
def admin_update_transaction_status(transaction_id: int,
                                    payload: dict,
                                    db: Session = Depends(get_db)):
    """Admin: update a transaction's status (e.g. complete, dispute, refund)."""
    from app.models.transaction import TransactionStatus
    tx = crud_transaction.get(db, transaction_id)
    if not tx:
        raise HTTPException(404, "Transaction not found.")
    new_status = payload.get("status")
    if not new_status:
        raise HTTPException(400, "status field is required.")
    try:
        tx.status = TransactionStatus(new_status)
    except ValueError:
        raise HTTPException(400, f"Invalid status '{new_status}'.")
    if new_status == "completed" and not tx.completed_at:
        from datetime import datetime, timezone
        tx.completed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(tx)
    return tx


@router.get("/", response_model=list[TransactionRead],
            dependencies=[Depends(require_admin)])
def list_all_transactions(skip: int = 0, limit: int = 50,
                          db: Session = Depends(get_db)):
    return crud_transaction.get_multi(db, skip=skip, limit=limit)


@router.get("/stats/revenue", dependencies=[Depends(require_admin)])
def revenue_stats(db: Session = Depends(get_db)):
    return {
        "total_revenue": crud_transaction.revenue_total(db),
        "total_platform_fees": crud_transaction.platform_fees_total(db),
    }
