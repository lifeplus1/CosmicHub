"""
FastAPI Router for Stripe Integration Endpoints
Production-ready subscription management endpoints
"""

import logging
from contextlib import suppress
from typing import Any, Dict, List, Literal, Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from ..stripe_integration import (
    SUBSCRIPTION_PLANS,
    create_stripe_checkout_session,
    get_user_subscription_status,
    handle_stripe_webhook,
    verify_firebase_token,
)
from ..utils.typing_helpers import (
    cancel_stripe_subscription,
    get_stripe_account,
    reactivate_stripe_subscription,
    update_subscription_cancel_flag,
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


@router.post(
    "/create-checkout-session", response_model=CheckoutSessionResponse
)
async def create_checkout_session(
    request: CheckoutSessionRequest,
    user_id: str = Depends(verify_firebase_token),
):
    """Create Stripe checkout session for subscription upgrade"""
    try:
        # Map frontend tier names to plan IDs
        plan_mapping = {
            "premium": (
                "astro_premium"
                if request.isAnnual
                else "astro_premium_monthly"
            ),
            "elite": (
                "cosmic_master"
                if request.isAnnual
                else "cosmic_master_monthly"
            ),
        }

        plan_id = plan_mapping.get(request.tier)
        if not plan_id:
            raise HTTPException(
                status_code=400, detail=f"Invalid tier: {request.tier}"
            )

        result = await create_stripe_checkout_session(
            user_id=user_id,
            plan_id=plan_id,
            success_url=request.successUrl,
            cancel_url=request.cancelUrl,
        )

        logger.info(
            f"Checkout session created for user {user_id}: {request.tier} ({'annual' if request.isAnnual else 'monthly'})"  # noqa: E501
        )
        return CheckoutSessionResponse(**result)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error creating checkout session: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/subscription-status", response_model=SubscriptionStatusResponse)
async def get_subscription_status(
    user_id: str = Depends(verify_firebase_token),
):
    """Get user's current subscription status and features"""
    # Optional tracing span
    tracer = None
    with suppress(Exception):
        from opentelemetry import trace  # type: ignore

        tracer = trace.get_tracer("cosmichub.backend.stripe")
    span_cm = (
        tracer.start_as_current_span(
            "get_subscription_status", attributes={"user.id": user_id}
        )
        if tracer
        else suppress()
    )
    with span_cm:  # type: ignore
        try:
            status = await get_user_subscription_status(user_id)
            return SubscriptionStatusResponse(**status)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(
                f"Unexpected error getting subscription status: {str(e)}"
            )
            raise HTTPException(
                status_code=500, detail="Internal server error"
            )


@router.post("/verify-session", response_model=SessionVerificationResponse)
async def verify_checkout_session(
    request: SessionVerificationRequest,
    user_id: str = Depends(verify_firebase_token),
):
    """Verify Stripe checkout session and return subscription details"""
    try:
        from datetime import datetime

        import stripe

        from backend.database import get_firestore_client

        # 1. Retrieve the session from Stripe
        session = stripe.checkout.Session.retrieve(request.sessionId)

        # 2. Verify it belongs to the authenticated user
        metadata = session.metadata or {}
        session_firebase_uid = metadata.get("firebase_uid")
        if session_firebase_uid != user_id:
            logger.warning(
                f"Session {request.sessionId} verification failed: user mismatch"  # noqa: E501
            )
            return SessionVerificationResponse(
                success=False,
                message="Session does not belong to authenticated user",
            )

        # Check if session was successful
        if session.payment_status != "paid":
            return SessionVerificationResponse(
                success=False,
                message=f"Payment not completed. Status: {session.payment_status}",  # noqa: E501
            )

        # 3. Extract subscription details
        subscription_id = session.subscription
        if not subscription_id:
            return SessionVerificationResponse(
                success=False, message="No subscription found in session"
            )

        # Get subscription details from Stripe
        stripe_subscription = stripe.Subscription.retrieve(
            str(subscription_id)
        )

        # Find plan details by matching price ID
        plan_id = None
        plan_data = None
        if (
            hasattr(stripe_subscription, "items")
            and stripe_subscription.items.data
        ):
            price_id = stripe_subscription.items.data[0].price.id

            for pid, plan in SUBSCRIPTION_PLANS.items():
                if plan["price_id"] == price_id:
                    plan_id = pid
                    plan_data = plan
                    break

        if not plan_id or not plan_data:
            logger.error(f"Unknown price ID in subscription")  # noqa: F541
            return SessionVerificationResponse(
                success=False, message="Unknown subscription plan"
            )

        # 4. Update local database if needed
        db_client = get_firestore_client()

        # Check if subscription already exists in our database
        subscription_doc = db_client.collection("subscriptions").document(user_id).get()  # type: ignore  # noqa: E501

        # Get subscription timestamps safely
        current_period_start = getattr(
            stripe_subscription, "current_period_start", None
        )
        current_period_end = getattr(
            stripe_subscription, "current_period_end", None
        )

        subscription_data_dict: Dict[str, Any] = {
            "user_id": user_id,
            "stripe_customer_id": (
                str(session.customer) if session.customer else ""
            ),
            "stripe_subscription_id": str(subscription_id),
            "plan_id": plan_id,
            "is_active": stripe_subscription.status == "active",
            "status": str(stripe_subscription.status),
            "updated_at": datetime.now().isoformat(),
        }

        # Add timestamp fields if available
        if current_period_start:
            subscription_data_dict["current_period_start"] = (
                datetime.fromtimestamp(int(current_period_start)).isoformat()
            )
        if current_period_end:
            subscription_data_dict["current_period_end"] = (
                datetime.fromtimestamp(int(current_period_end)).isoformat()
            )

        # Add created_at if this is a new subscription
        if not subscription_doc.exists:  # type: ignore
            subscription_data_dict["created_at"] = datetime.now().isoformat()

        # Save/update subscription in Firestore using type-safe wrapper
        db_client.collection("subscriptions").document(user_id).set(subscription_data_dict, merge=True)  # type: ignore  # noqa: E501

        # Update user document using type-safe wrapper
        user_update_dict: Dict[str, Any] = {
            "subscription_status": (
                "active"
                if stripe_subscription.status == "active"
                else str(stripe_subscription.status)
            ),
            "subscription_tier": plan_id,
            "updated_at": datetime.now().isoformat(),
        }

        if session.customer:
            user_update_dict["stripe_customer_id"] = str(session.customer)

        db_client.collection("users").document(user_id).update(user_update_dict)  # type: ignore  # noqa: E501

        # Determine if it's an annual plan (based on plan naming convention)
        is_annual = "monthly" not in plan_id

        logger.info(
            f"Session {request.sessionId} verified successfully for user {user_id}: {plan_id}"  # noqa: E501
        )

        subscription_response: Dict[str, Any] = {
            "tier": plan_id,
            "isAnnual": is_annual,
            "status": str(stripe_subscription.status),
            "features": plan_data["features"],
            "stripe_subscription_id": str(subscription_id),
        }

        # Add expiration date if available
        if current_period_end:
            subscription_response["expires_at"] = datetime.fromtimestamp(
                int(current_period_end)
            ).isoformat()

        return SessionVerificationResponse(
            success=True,
            subscription=subscription_response,
            message="Session verified and subscription activated successfully",
        )

    except Exception as stripe_err:
        # Handle Stripe-specific errors
        if "stripe" in str(type(stripe_err)).lower():
            logger.error(
                f"Stripe error verifying session {request.sessionId}: {str(stripe_err)}"  # noqa: E501
            )
            return SessionVerificationResponse(
                success=False, message="Failed to verify session with Stripe"
            )
        # Re-raise HTTPExceptions
        if isinstance(stripe_err, HTTPException):
            raise stripe_err
        # Handle other unexpected errors
        logger.error(
            f"Unexpected error verifying session {request.sessionId}: {str(stripe_err)}"  # noqa: E501
        )
        raise HTTPException(
            status_code=500, detail="Session verification failed"
        )


@router.post("/create-portal-session")
async def create_customer_portal_session(
    returnUrl: str, user_id: str = Depends(verify_firebase_token)
):
    """Create Stripe customer portal session for subscription management"""
    try:
        # For now, return a placeholder. In production, this would:
        # 1. Get the user's Stripe customer ID from the database
        # 2. Create a portal session using stripe.billing_portal.Session.create()  # noqa: E501
        # 3. Return the portal URL

        return {
            "url": f"https://billing.stripe.com/session_placeholder?return_url={returnUrl}",  # noqa: E501
            "message": "Portal session creation not yet implemented",
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error creating portal session: {str(e)}")
        raise HTTPException(
            status_code=500, detail="Portal session creation failed"
        )


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
async def stripe_webhook_handler(
    request: Request, background_tasks: BackgroundTasks
):
    """Handle Stripe webhook events (no authentication required)"""
    try:
        # Process webhook in background to return quickly
        background_tasks.add_task(handle_stripe_webhook, request)

        return JSONResponse(content={"status": "received"}, status_code=200)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Webhook processing error: {str(e)}")
        raise HTTPException(
            status_code=500, detail="Webhook processing failed"
        )


@router.post("/cancel-subscription")
async def cancel_subscription(user_id: str = Depends(verify_firebase_token)):
    """Cancel user's active subscription"""
    try:
        # Get user's subscription
        status = await get_user_subscription_status(user_id)

        if status["status"] != "active" or not status.get(
            "stripe_subscription_id"
        ):
            raise HTTPException(
                status_code=400, detail="No active subscription found"
            )

        # Cancel in Stripe & update local status via helpers
        cancel_stripe_subscription(status["stripe_subscription_id"])
        update_subscription_cancel_flag(user_id, True)

        logger.info(f"Subscription cancelled for user {user_id}")
        return {
            "status": "cancelled",
            "message": "Subscription will end at the end of current billing period",  # noqa: E501
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error cancelling subscription: {str(e)}")
        raise HTTPException(
            status_code=500, detail="Failed to cancel subscription"
        )


@router.post("/reactivate-subscription")
async def reactivate_subscription(
    user_id: str = Depends(verify_firebase_token),
):
    """Reactivate a cancelled subscription before period end"""
    try:
        # Get user's subscription
        status = await get_user_subscription_status(user_id)

        if not status.get("stripe_subscription_id"):
            raise HTTPException(
                status_code=400, detail="No subscription found"
            )

        # Reactivate in Stripe & update local status via helpers
        reactivate_stripe_subscription(status["stripe_subscription_id"])
        update_subscription_cancel_flag(user_id, False)

        logger.info(f"Subscription reactivated for user {user_id}")
        return {
            "status": "reactivated",
            "message": "Subscription has been reactivated",
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error reactivating subscription: {str(e)}")
        raise HTTPException(
            status_code=500, detail="Failed to reactivate subscription"
        )


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
            available_plans=len(SUBSCRIPTION_PLANS),
        )

    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return StripeHealthResponse(
            status="unhealthy",
            stripe_connected=False,
            error="Stripe connection failed",
        )
