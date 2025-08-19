# backend/api/routers/subscriptions.py
from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, Request

from api.models.subscription import CheckoutSession
from api.services.stripe_service import (
    create_stripe_session,  # type: ignore  # if dynamic
)
from auth import get_current_user

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])


@router.post("/checkout")
async def create_checkout_session(
    session: CheckoutSession,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    try:
        checkout_session = create_stripe_session(
            current_user["email"], session.price_id
        )
        return {"sessionId": checkout_session.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/webhook")
async def stripe_webhook(request: Request):
    # Implement signature verification for security
    # Use Firestore batch updates for robustness
    return {"status": "received"}
