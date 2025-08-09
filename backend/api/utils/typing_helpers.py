"""Typed helper wrappers to hide dynamically typed SDK calls from stricter checkers.
These functions provide explicit return / parameter types so route code avoids
"partially unknown" diagnostics from Firestore and Stripe libraries.
"""
from __future__ import annotations

from typing import Mapping, Any

from ...database import get_firestore_client


def update_subscription_doc(user_id: str, field_updates: Mapping[str, Any]) -> None:
    """Update subscription document with typed signature.
    Hides dynamic Firestore update() return type behind a None return for type safety.
    """
    db = get_firestore_client()
    db.collection("subscriptions").document(user_id).update(dict(field_updates)) # type: ignore


def get_stripe_account() -> dict[str, Any] | Any:
    """Retrieve Stripe account object (typed as dict|Any to suppress unknown)."""
    import stripe  # local import to avoid mandatory dependency at import time
    return stripe.Account.retrieve() # type: ignore


def cancel_stripe_subscription(subscription_id: str) -> None:
    """Set a Stripe subscription to cancel at period end."""
    import stripe
    stripe.Subscription.modify(subscription_id, cancel_at_period_end=True)


def reactivate_stripe_subscription(subscription_id: str) -> None:
    """Reactivate a Stripe subscription (unset cancel at period end)."""
    import stripe
    stripe.Subscription.modify(subscription_id, cancel_at_period_end=False)


def update_subscription_cancel_flag(user_id: str, cancel: bool) -> None:
    """Update local Firestore subscription cancellation flag with timestamp."""
    from datetime import datetime
    update_subscription_doc(user_id, {
        "cancel_at_period_end": cancel,
        "updated_at": datetime.now().isoformat()
    })

