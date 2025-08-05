# This file makes the astro directory a Python package.
from fastapi import APIRouter, Depends, HTTPException
from typing import Any
from ..models.subscription import CheckoutSession
from ..services.stripe_service import create_stripe_session
from ...auth import get_current_user

router = APIRouter()

async def create_checkout_session(session: CheckoutSession, user: dict[str, Any] = Depends(get_current_user)):
    try:
        checkout_session = create_stripe_session(user["email"], session.price_id)
        return {"sessionId": checkout_session.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from fastapi import Request

@router.post("/webhook")
async def stripe_webhook(request: Request):
    # TODO: Implement webhook to update Firestore (e.g., set is_premium on subscription success)
    # Verify webhook signature and handle events like subscription.created
    return {"status": "received"}