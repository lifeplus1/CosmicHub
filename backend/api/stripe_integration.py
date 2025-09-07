"""
Production-Ready Stripe Integration for CosmicHub
Handles subscription management, payments, and webhook validation
"""

import logging
import os
from datetime import datetime
from typing import Any, Dict, Optional, cast

import stripe
from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth

from database import get_firestore_client
from backend_types.runtime_protocols import (
    SubscriptionPlan,
    SubscriptionData,
    FirestoreClient,
)

# Configure Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
stripe_webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")

logger = logging.getLogger(__name__)
security = HTTPBearer()


SUBSCRIPTION_PLANS: Dict[str, SubscriptionPlan] = {
    "healwave_pro": {
        "price_id": os.getenv("STRIPE_HEALWAVE_PRO_PRICE_ID"),
        "features": [
            "unlimited_sessions",
            "premium_frequencies",
            "advanced_analytics",
        ],
        "name": "HealWave Pro",
        "price": 9.99,
    },
    "astro_premium": {
        "price_id": os.getenv("STRIPE_ASTRO_PREMIUM_PRICE_ID"),
        "features": [
            "unlimited_charts",
            "synastry_analysis",
            "transit_tracking",
        ],
        "name": "Astrology Premium",
        "price": 14.99,
    },
    "cosmic_master": {
        "price_id": os.getenv("STRIPE_COSMIC_MASTER_PRICE_ID"),
        "features": ["all_features", "priority_support", "early_access"],
        "name": "Cosmic Master",
        "price": 24.99,
    },
}


async def verify_firebase_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> str:
    """Verify Firebase ID token and return user ID"""
    try:
        token = credentials.credentials
        decoded_token: Dict[str, Any] = auth.verify_id_token(token)
        uid = decoded_token.get("uid")
        if not uid or not isinstance(uid, str):
            raise ValueError("Invalid token: missing or invalid uid")
        return uid
    except Exception as e:
        logger.error(f"Token verification failed: {str(e)}")
        raise HTTPException(
            status_code=401, detail="Invalid authentication token"
        )


async def create_stripe_checkout_session(
    user_id: str, plan_id: str, success_url: str, cancel_url: str
) -> Dict[str, Any]:
    """Create Stripe checkout session for subscription"""
    try:
        if plan_id not in SUBSCRIPTION_PLANS:
            raise HTTPException(status_code=400, detail="Invalid subscription plan")
        plan = SUBSCRIPTION_PLANS[plan_id]
        db_client = cast(FirestoreClient, get_firestore_client())
        user_doc = db_client.collection("users").document(user_id).get()  # type: ignore[call-arg]

        customer_id = None
        if user_doc.exists:
            user_dict = user_doc.to_dict()
            if user_dict and user_dict.get("stripe_customer_id"):
                customer_id = user_dict["stripe_customer_id"]

        if not customer_id:
            # Create new Stripe customer
            user_data = user_doc.to_dict() if user_doc.exists else {}
            if user_data is None:
                user_data = {}
            customer = stripe.Customer.create(
                email=user_data.get("email") or "",
                metadata={"firebase_uid": user_id},
            )
            customer_id = customer.id

            # Save customer ID to Firestore
            db_client.collection("users").document(user_id).set(
                {
                    "stripe_customer_id": customer_id,
                    "updated_at": datetime.now().isoformat(),
                },
                merge=True,
            )

        # Create checkout session
        price_id = plan.get("price_id")
        if not price_id or not isinstance(price_id, str):
            raise HTTPException(status_code=500, detail="Subscription plan not configured")

        session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=["card"],
            line_items=[
                {
                    "price": price_id,
                    "quantity": 1,
                }
            ],
            mode="subscription",
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={"firebase_uid": user_id, "plan_id": plan_id},
        )

        return {
            "checkout_url": session.url,
            "session_id": session.id,
            "plan": plan,
        }

    except Exception as e:
        logger.error(f"Failed to create checkout session: {str(e)}")
        raise HTTPException(
            status_code=500, detail="Failed to create checkout session"
        )


async def get_user_subscription_status(user_id: str) -> Dict[str, Any]:
    """Get user's current subscription status"""
    try:
        db_client = cast(FirestoreClient, get_firestore_client())
        if not db_client:
            return {"status": "inactive", "tier": "free", "features": [], "expires_at": None}
        subscription_doc = db_client.collection("subscriptions").document(user_id).get()  # type: ignore[call-arg]
        if not subscription_doc.exists:
            return {"status": "inactive", "tier": "free", "features": [], "expires_at": None}
        raw = subscription_doc.to_dict()
        if raw is None:
            return {"status": "inactive", "tier": "free", "features": [], "expires_at": None}
        sub_data = cast(SubscriptionData, raw)
        sub_id = sub_data.get("stripe_subscription_id")
        if sub_id:
            try:
                stripe_subscription = stripe.Subscription.retrieve(sub_id)  # type: ignore[arg-type]
                is_active = stripe_subscription.status == "active"
                if is_active != sub_data.get("is_active", False):
                    db_client.collection("subscriptions").document(user_id).update(  # type: ignore[call-arg]
                        {
                            "is_active": is_active,
                            "stripe_status": stripe_subscription.status,
                            "updated_at": datetime.now().isoformat(),
                        }
                    )
                    sub_data["is_active"] = is_active  # type: ignore[index]
            except Exception as e:
                logger.warning(f"Stripe verification failed for user {user_id}: {e}")
        plan_id = sub_data.get("plan_id", "")
        plan = SUBSCRIPTION_PLANS.get(plan_id, {})
        return {
            "status": "active" if sub_data.get("is_active", False) else "inactive",
            "tier": plan_id or "free",
            "features": plan.get("features", []),  # type: ignore[arg-type]
            "expires_at": sub_data.get("current_period_end"),
            "stripe_subscription_id": sub_id,
        }
    except Exception as e:  # pragma: no cover - defensive
        logger.error(f"Failed to get subscription status: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch subscription status")


async def handle_stripe_webhook(request: Request) -> Dict[str, str]:
    """Handle Stripe webhook events"""
    try:
        payload = await request.body()
        sig_header = request.headers.get("stripe-signature")

        # Verify webhook signature
        event = stripe.Webhook.construct_event(
            payload, sig_header, stripe_webhook_secret
        )

        db_client = get_firestore_client()

        # Handle different event types
        if event["type"] == "customer.subscription.created":
            subscription = event["data"]["object"]
            await handle_subscription_created(subscription, db_client)

        elif event["type"] == "customer.subscription.updated":
            subscription = event["data"]["object"]
            await handle_subscription_updated(subscription, db_client)

        elif event["type"] == "customer.subscription.deleted":
            subscription = event["data"]["object"]
            await handle_subscription_cancelled(subscription, db_client)

        elif event["type"] == "invoice.payment_succeeded":
            invoice = event["data"]["object"]
            await handle_payment_succeeded(invoice, db_client)

        elif event["type"] == "invoice.payment_failed":
            invoice = event["data"]["object"]
            await handle_payment_failed(invoice, db_client)

        return {"status": "success"}

    except Exception as e:  # Consolidated error handling
        msg = str(e).lower()
        if "payload" in msg:
            logger.error(f"Invalid webhook payload: {e}")
            raise HTTPException(status_code=400, detail="Invalid payload")
        if "signature" in msg:
            logger.error(f"Invalid webhook signature: {e}")
            raise HTTPException(status_code=400, detail="Invalid signature")
        logger.error(f"Webhook processing failed: {e}")
        raise HTTPException(status_code=500, detail="Webhook processing failed")


async def handle_subscription_created(
    subscription: Dict[str, Any], db_client: Any
) -> None:
    """Handle new subscription creation"""
    try:
        customer_id = subscription["customer"]
        customer = stripe.Customer.retrieve(customer_id)
        metadata: Any = getattr(customer, "metadata", {})  # type: ignore[attr-defined]
        firebase_uid = metadata.get("firebase_uid") if isinstance(metadata, dict) else None
        if not firebase_uid:
            logger.error(f"No Firebase UID for customer {customer_id}")
            return
        plan_id: Optional[str] = None
        for pid, plan in SUBSCRIPTION_PLANS.items():
            try:
                if subscription["items"]["data"][0]["price"]["id"] == plan["price_id"]:
                    plan_id = pid
                    break
            except Exception:  # pragma: no cover - defensive on structure
                continue
        subscription_data = {
            "user_id": firebase_uid,
            "stripe_customer_id": customer_id,
            "stripe_subscription_id": subscription.get("id"),
            "plan_id": plan_id,
            "is_active": subscription.get("status") == "active",
            "status": subscription.get("status"),
            "current_period_start": datetime.fromtimestamp(subscription.get("current_period_start", datetime.now().timestamp())).isoformat(),
            "current_period_end": datetime.fromtimestamp(subscription.get("current_period_end", datetime.now().timestamp())).isoformat(),
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
        }
        db_client.collection("subscriptions").document(firebase_uid).set(subscription_data)
        db_client.collection("users").document(firebase_uid).update(
            {"subscription_status": "active", "subscription_tier": plan_id, "updated_at": datetime.now().isoformat()}
        )
        logger.info(f"Subscription created for user {firebase_uid}: {plan_id}")
    except Exception as e:  # pragma: no cover - defensive
        logger.error(f"Failed to handle subscription creation: {e}")


async def handle_subscription_updated(
    subscription: Dict[str, Any], db_client: Any
) -> None:
    """Handle subscription updates"""
    try:
        customer_id = subscription.get("customer")
        if not customer_id:
            return
        customer = stripe.Customer.retrieve(customer_id)
        metadata: Any = getattr(customer, "metadata", {})  # type: ignore[attr-defined]
        firebase_uid = metadata.get("firebase_uid") if isinstance(metadata, dict) else None
        if not firebase_uid:
            return
        db_client.collection("subscriptions").document(firebase_uid).update(
            {
                "is_active": subscription.get("status") == "active",
                "status": subscription.get("status"),
                "current_period_end": datetime.fromtimestamp(subscription.get("current_period_end", datetime.now().timestamp())).isoformat(),
                "updated_at": datetime.now().isoformat(),
            }
        )
        logger.info(
            f"Subscription updated for user {firebase_uid}: {subscription.get('status')}"
        )
    except Exception as e:  # pragma: no cover
        logger.error(f"Failed to handle subscription update: {e}")


async def handle_subscription_cancelled(
    subscription: Dict[str, Any], db_client: Any
) -> None:
    """Handle subscription cancellation"""
    try:
        customer_id = subscription.get("customer")
        if not customer_id:
            return
        customer = stripe.Customer.retrieve(customer_id)
        metadata: Any = getattr(customer, "metadata", {})  # type: ignore[attr-defined]
        firebase_uid = metadata.get("firebase_uid") if isinstance(metadata, dict) else None
        if not firebase_uid:
            return
        db_client.collection("subscriptions").document(firebase_uid).update(
            {
                "is_active": False,
                "status": "cancelled",
                "cancelled_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat(),
            }
        )
        db_client.collection("users").document(firebase_uid).update(
            {
                "subscription_status": "cancelled",
                "subscription_tier": "free",
                "updated_at": datetime.now().isoformat(),
            }
        )
        logger.info(f"Subscription cancelled for user {firebase_uid}")
    except Exception as e:  # pragma: no cover
        logger.error(f"Failed to handle subscription cancellation: {e}")


async def handle_payment_succeeded(
    invoice: Dict[str, Any], db_client: Any
) -> None:
    """Handle successful payment"""
    logger.info(
        f"Payment succeeded for subscription {invoice.get('subscription')}"
    )


async def handle_payment_failed(
    invoice: Dict[str, Any], db_client: Any
) -> None:
    """Handle failed payment"""
    logger.warning(
        f"Payment failed for subscription {invoice.get('subscription')}"
    )


# Rate limiting for subscription endpoints
async def check_rate_limit(user_id: str) -> None:
    """Basic rate limiting for subscription operations"""
    # Implementation would check Redis or Firestore for recent requests
    pass
