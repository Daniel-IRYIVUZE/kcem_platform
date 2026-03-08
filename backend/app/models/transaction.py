"""models/transaction.py — Transaction and Payment models."""
import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, Text, String, Enum as SAEnum
from sqlalchemy.orm import relationship
from app.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class TransactionStatus(str, enum.Enum):
    pending   = "pending"
    completed = "completed"
    failed    = "failed"
    refunded  = "refunded"
    disputed  = "disputed"


class PaymentMethod(str, enum.Enum):
    mobile_money  = "mobile_money"
    bank_transfer = "bank_transfer"
    platform      = "platform"           # internal platform credit


class Transaction(Base):
    __tablename__ = "transactions"

    id                  = Column(Integer, primary_key=True, index=True)
    listing_id          = Column(Integer, ForeignKey("waste_listings.id"), nullable=True)
    collection_id       = Column(Integer, ForeignKey("collections.id"), nullable=True)
    hotel_id            = Column(Integer, ForeignKey("hotels.id"), nullable=True)
    recycler_id         = Column(Integer, ForeignKey("recyclers.id"), nullable=True)
    reference           = Column(String(100), unique=True, nullable=False)
    gross_amount        = Column(Float, nullable=False)    # total bid amount (RWF)
    platform_fee        = Column(Float, default=0.0)       # platform cut (RWF)
    net_amount          = Column(Float, nullable=False)    # hotel receives
    status              = Column(SAEnum(TransactionStatus), default=TransactionStatus.pending)
    payment_method      = Column(SAEnum(PaymentMethod), default=PaymentMethod.mobile_money)
    description         = Column(Text, nullable=True)
    meta_data           = Column(Text, nullable=True)      # JSON for extra fields
    completed_at        = Column(DateTime(timezone=True), nullable=True)
    created_at          = Column(DateTime(timezone=True), default=utc_now)
    updated_at          = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    # Relationships
    listing    = relationship("WasteListing", back_populates="transaction")
    collection = relationship("Collection", back_populates="transaction")
    payments   = relationship("Payment", back_populates="transaction", cascade="all, delete-orphan")


class PaymentStatus(str, enum.Enum):
    initiated  = "initiated"
    processing = "processing"
    succeeded  = "succeeded"
    failed     = "failed"


class Payment(Base):
    __tablename__ = "payments"

    id               = Column(Integer, primary_key=True, index=True)
    transaction_id   = Column(Integer, ForeignKey("transactions.id", ondelete="CASCADE"), nullable=False)
    payer_user_id    = Column(Integer, ForeignKey("users.id"), nullable=True)
    payee_user_id    = Column(Integer, ForeignKey("users.id"), nullable=True)
    amount           = Column(Float, nullable=False)
    currency         = Column(String(10), default="RWF")
    method           = Column(SAEnum(PaymentMethod), default=PaymentMethod.mobile_money)
    status           = Column(SAEnum(PaymentStatus), default=PaymentStatus.initiated)
    provider_ref     = Column(String(255), nullable=True)   # mobile money transaction ID
    phone_number     = Column(String(20), nullable=True)
    failure_reason   = Column(Text, nullable=True)
    processed_at     = Column(DateTime(timezone=True), nullable=True)
    created_at       = Column(DateTime(timezone=True), default=utc_now)
    updated_at       = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    # Relationships
    transaction = relationship("Transaction", back_populates="payments")
