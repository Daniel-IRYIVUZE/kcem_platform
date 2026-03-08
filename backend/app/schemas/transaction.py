"""schemas/transaction.py"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.models.transaction import TransactionStatus, PaymentMethod, PaymentStatus


class TransactionCreate(BaseModel):
    listing_id:     Optional[int] = None
    collection_id:  Optional[int] = None
    hotel_id:       Optional[int] = None
    recycler_id:    Optional[int] = None
    gross_amount:   float
    payment_method: PaymentMethod = PaymentMethod.mobile_money
    description:    Optional[str] = None


class TransactionRead(BaseModel):
    id:             int
    listing_id:     Optional[int]
    collection_id:  Optional[int]
    hotel_id:       Optional[int]
    recycler_id:    Optional[int]
    reference:      str
    gross_amount:   float
    platform_fee:   float
    net_amount:     float
    status:         TransactionStatus
    payment_method: PaymentMethod
    description:    Optional[str]
    completed_at:   Optional[datetime]
    created_at:     datetime

    model_config = {"from_attributes": True}


class PaymentCreate(BaseModel):
    transaction_id: int
    amount:         float
    method:         PaymentMethod = PaymentMethod.mobile_money
    phone_number:   Optional[str] = None


class PaymentRead(BaseModel):
    id:             int
    transaction_id: int
    amount:         float
    currency:       str
    method:         PaymentMethod
    status:         PaymentStatus
    provider_ref:   Optional[str]
    phone_number:   Optional[str]
    failure_reason: Optional[str]
    processed_at:   Optional[datetime]
    created_at:     datetime

    model_config = {"from_attributes": True}
