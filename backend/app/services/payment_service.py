"""services/payment_service.py — Mobile money payment stub (MTN / Airtel Rwanda)."""
from __future__ import annotations
import uuid
from enum import Enum
from dataclasses import dataclass


class MobileProvider(str, Enum):
    mtn = "MTN_MOMO"
    airtel = "AIRTEL_MONEY"


@dataclass
class PaymentResult:
    success: bool
    provider_ref: str
    message: str


def initiate_mobile_payment(
    *,
    phone_number: str,
    amount_rwf: float,
    provider: MobileProvider = MobileProvider.mtn,
    reference: str | None = None,
    description: str = "EcoTrade Rwanda payment",
) -> PaymentResult:
    """
    Stub — replace with real MTN MoMo / Airtel Money SDK calls in production.
    Returns a mock successful result for development.
    """
    ref = reference or f"MOB-{uuid.uuid4().hex[:8].upper()}"
    # TODO: integrate MTN MoMo API or Airtel API when credentials available
    return PaymentResult(
        success=True,
        provider_ref=ref,
        message=f"[MOCK] {provider.value} payment of RWF {amount_rwf:,.0f} to {phone_number} initiated.",
    )


def verify_mobile_payment(provider_ref: str, provider: MobileProvider = MobileProvider.mtn) -> bool:
    """Stub — always returns True in development."""
    # TODO: query provider API with provider_ref
    return True
