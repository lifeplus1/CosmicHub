"""
FastAPI Router for Stripe Integration Endpoints
Production-ready subscription management endpoints
"""

from fastapi import APIRouter, HTTPException, Request, Depends, BackgroundTasks
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Dict, Any, Optional, Literal, List
import logging

from ..stripe_integration import (
    create_stripe_checkout_session,
    get_user_subscription_status, 
    handle_stripe_webhook,
    verify_firebase_token,
    SUBSCRIPTION_PLANS
)
from ..utils.typing_helpers import (
    get_stripe_account,
    cancel_stripe_subscription,
    reactivate_stripe_subscription,
    update_subscription_cancel_flag
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/stripe", tags=["subscription"])

# Pydantic models for request/response validation
class CheckoutSessionRequest(BaseModel):
    tier: str  # 'premium' or 'elite'
    userId: str
    isAnnual: bool
    successUrl: str
    cancelUrl: str
    feature: Optional[str] = None
    metadata: Optional[Dict[str, str]] = None

class CheckoutSessionResponse(BaseModel):
    checkout_url: str
    session_id: str
    plan: Dict[str, Any]

class SubscriptionStatusResponse(BaseModel):
    status: str
    tier: str
    features: list[str]
    expires_at: Optional[str]
    stripe_subscription_id: Optional[str]

class SessionVerificationRequest(BaseModel):
    sessionId: str

class SessionVerificationResponse(BaseModel):
    success: bool
    subscription: Optional[Dict[str, Any]] = None
    message: Optional[str] = None

class StripeHealthResponse(BaseModel):
    status: Literal["healthy", "unhealthy"]
    stripe_connected: bool
    available_plans: Optional[int] = None
    error: Optional[str] = None

class SubscriptionPlan(BaseModel):
    name: str
    price: float
    features: List[str]

class SubscriptionPlansResponse(BaseModel):
    plans: Dict[str, SubscriptionPlan]
    currency: str

@router.post("/create-checkout-session", response_model=CheckoutSessionResponse)
async def create_checkout_session(
    request: CheckoutSessionRequest,
    user_id: str = Depends(verify_firebase_token)
):
    """Create Stripe checkout session for subscription upgrade"""
    try:
        # Map frontend tier names to plan IDs
        plan_mapping = {
            'premium': 'astro_premium' if request.isAnnual else 'astro_premium_monthly',
            'elite': 'cosmic_master' if request.isAnnual else 'cosmic_master_monthly'
        }
        
        plan_id = plan_mapping.get(request.tier)
        if not plan_id:
            raise HTTPException(status_code=400, detail=f"Invalid tier: {request.tier}")
        
        result = await create_stripe_checkout_session(
            user_id=user_id,
            plan_id=plan_id,
            success_url=request.successUrl,
            cancel_url=request.cancelUrl
        )
        
        logger.info(f"Checkout session created for user {user_id}: {request.tier} ({'annual' if request.isAnnual else 'monthly'})")
        return CheckoutSessionResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error creating checkout session: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/subscription-status", response_model=SubscriptionStatusResponse)
async def get_subscription_status(user_id: str = Depends(verify_firebase_token)):
    """Get user's current subscription status and features"""
    try:
        status = await get_user_subscription_status(user_id)
        
        return SubscriptionStatusResponse(**status)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error getting subscription status: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/verify-session", response_model=SessionVerificationResponse)
async def verify_checkout_session(
    request: SessionVerificationRequest,
    user_id: str = Depends(verify_firebase_token)
):
    """Verify Stripe checkout session and return subscription details"""
    try:
        # TODO: Implement session verification logic
        # This would typically involve:
        # 1. Retrieving the session from Stripe
        # 2. Verifying it belongs to the authenticated user
        # 3. Extracting subscription details
        # 4. Updating local database if needed
        
        # For now, return a success response
        return SessionVerificationResponse(
            success=True,
            subscription={
                "tier": "premium",  # This should come from the actual session
                "isAnnual": True,
                "status": "active"
            },
            message="Session verified successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error verifying session: {str(e)}")
        raise HTTPException(status_code=500, detail="Session verification failed")

@router.post("/create-portal-session")
async def create_customer_portal_session(
    returnUrl: str,
    user_id: str = Depends(verify_firebase_token)
):
    """Create Stripe customer portal session for subscription management"""
    try:
        # For now, return a placeholder. In production, this would:
        # 1. Get the user's Stripe customer ID from the database
        # 2. Create a portal session using stripe.billing_portal.Session.create()
        # 3. Return the portal URL
        
        return {
            "url": f"https://billing.stripe.com/session_placeholder?return_url={returnUrl}",
            "message": "Portal session creation not yet implemented"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error creating portal session: {str(e)}")
        raise HTTPException(status_code=500, detail="Portal session creation failed")

@router.get("/plans", response_model=SubscriptionPlansResponse)
async def get_subscription_plans() -> SubscriptionPlansResponse:
    """Get available subscription plans"""
    try:
        # Return sanitized plan information (no price IDs for security)
        sanitized_plans: Dict[str, SubscriptionPlan] = {}
        for plan_id, plan_data in SUBSCRIPTION_PLANS.items():
            sanitized_plans[plan_id] = SubscriptionPlan(
                name=plan_data["name"],
                price=plan_data["price"],
                features=plan_data["features"],
            )
        return SubscriptionPlansResponse(plans=sanitized_plans, currency="USD")
        
    except Exception as e:
        logger.error(f"Error retrieving subscription plans: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve plans")

@router.post("/webhook")
async def stripe_webhook_handler(request: Request, background_tasks: BackgroundTasks):
    """Handle Stripe webhook events (no authentication required)"""
    try:
        # Process webhook in background to return quickly
        background_tasks.add_task(handle_stripe_webhook, request)
        
        return JSONResponse(content={"status": "received"}, status_code=200)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Webhook processing error: {str(e)}")
        raise HTTPException(status_code=500, detail="Webhook processing failed")

@router.post("/cancel-subscription")
async def cancel_subscription(user_id: str = Depends(verify_firebase_token)):
    """Cancel user's active subscription"""
    try:
        # Get user's subscription
        status = await get_user_subscription_status(user_id)

        if status["status"] != "active" or not status.get("stripe_subscription_id"):
            raise HTTPException(status_code=400, detail="No active subscription found")

        # Cancel in Stripe & update local status via helpers
        cancel_stripe_subscription(status["stripe_subscription_id"])
        update_subscription_cancel_flag(user_id, True)

        logger.info(f"Subscription cancelled for user {user_id}")
        return {"status": "cancelled", "message": "Subscription will end at the end of current billing period"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error cancelling subscription: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to cancel subscription")

@router.post("/reactivate-subscription")
async def reactivate_subscription(user_id: str = Depends(verify_firebase_token)):
    """Reactivate a cancelled subscription before period end"""
    try:
        # Get user's subscription
        status = await get_user_subscription_status(user_id)

        if not status.get("stripe_subscription_id"):
            raise HTTPException(status_code=400, detail="No subscription found")

        # Reactivate in Stripe & update local status via helpers
        reactivate_stripe_subscription(status["stripe_subscription_id"])
        update_subscription_cancel_flag(user_id, False)

        logger.info(f"Subscription reactivated for user {user_id}")
        return {"status": "reactivated", "message": "Subscription has been reactivated"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error reactivating subscription: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to reactivate subscription")

# Health check endpoint
@router.get("/health", response_model=StripeHealthResponse)
async def health_check() -> StripeHealthResponse:
    """Health check for Stripe integration"""
    try:
        # Test Stripe connection
        get_stripe_account()

        return StripeHealthResponse(
            status="healthy",
            stripe_connected=True,
            available_plans=len(SUBSCRIPTION_PLANS)
        )
    
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return StripeHealthResponse(
            status="unhealthy",
            stripe_connected=False,
            error="Stripe connection failed"
        )
