import stripe
from os import getenv

stripe.api_key = getenv("STRIPE_SECRET_KEY")

def create_stripe_session(email: str, price_id: str):
    return stripe.checkout.Session.create(
        customer_email=email,
        payment_method_types=["card"],
        line_items=[{"price": price_id, "quantity": 1}],
        mode="subscription",
        success_url="https://healwave.yourdomain.com/success",
        cancel_url="https://healwave.yourdomain.com/cancel",
    )
