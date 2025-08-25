import sys
import types
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Mapping, TypedDict

import pytest

# Ensure project root is on path for 'backend' absolute import
ROOT = Path(__file__).resolve().parent.parent
PARENT = ROOT.parent
if str(PARENT) not in sys.path:
    sys.path.insert(0, str(PARENT))

import backend.api.stripe_integration as integ  # type: ignore  # noqa: E402


class FakeDoc:
    def __init__(self) -> None:
        self._data: Dict[str, Any] = {}
        self.exists = False

    def get(self) -> "FakeDoc":
        return self

    def set(
        self, value: Mapping[str, Any], merge: bool = False
    ) -> None:  # noqa: ARG002
        # Simulate write
        self._data.update(value)
        self.exists = True

    def update(self, value: Mapping[str, Any]) -> None:
        self._data.update(value)
        self.exists = True

    def to_dict(self) -> Dict[str, Any]:
        return dict(self._data)


class FakeCollection:
    def __init__(self) -> None:
        self.docs: Dict[str, FakeDoc] = {}

    def document(self, doc_id: str) -> FakeDoc:
        self.docs.setdefault(doc_id, FakeDoc())
        return self.docs[doc_id]


class FakeDB:
    def __init__(self) -> None:
        self.subs = FakeCollection()
        self.users = FakeCollection()

    def collection(self, name: str) -> Any:  # noqa: ANN401
        if name == "subscriptions":
            return self.subs
        if name == "users":
            return self.users
        return FakeCollection()


@pytest.fixture()
def fake_db() -> FakeDB:
    return FakeDB()


@pytest.fixture(autouse=True)
def patch_plans(monkeypatch: pytest.MonkeyPatch) -> Dict[str, Dict[str, Any]]:
    plans: Dict[str, Dict[str, Any]] = {
        "astro_premium": {
            "price_id": "price_test_premium",
            "features": ["f1"],
            "name": "Astro Premium",
            "price": 9.99,
        }
    }
    monkeypatch.setattr(integ, "SUBSCRIPTION_PLANS", plans)  # type: ignore[arg-type]  # noqa: E501
    return plans


@pytest.fixture(autouse=True)
def patch_stripe(monkeypatch: pytest.MonkeyPatch) -> None:
    stripe_mod = types.SimpleNamespace()
    # Customer.retrieve returns object with metadata firebase_uid
    setattr(stripe_mod, "Customer", types.SimpleNamespace(retrieve=lambda cid: types.SimpleNamespace(metadata={"firebase_uid": "user1"})))  # type: ignore[arg-type]  # noqa: E501
    monkeypatch.setattr(integ, "stripe", stripe_mod)  # type: ignore[arg-type]


class SubItemPrice(TypedDict):
    id: str


class SubItem(TypedDict):
    price: SubItemPrice


class SubItems(TypedDict):
    data: List[SubItem]


class SubscriptionPayload(
    TypedDict, total=False
):  # kept for structure reference only
    customer: str
    id: str
    status: str
    current_period_start: int
    current_period_end: int
    items: Dict[str, Any]


class InvoicePayload(
    TypedDict, total=False
):  # kept for structure reference only
    subscription: str


@pytest.mark.asyncio
async def test_handle_subscription_created(fake_db: FakeDB) -> None:
    now = int(datetime.now().timestamp())
    subscription: Dict[str, Any] = {
        "customer": "cus_123",
        "id": "sub_123",
        "status": "active",
        "current_period_start": now,
        "current_period_end": now + 3600,
        "items": {"data": [{"price": {"id": "price_test_premium"}}]},
    }
    await integ.handle_subscription_created(subscription, fake_db)
    sub_doc = fake_db.subs.document("user1").to_dict()
    assert sub_doc.get("stripe_subscription_id") == "sub_123"
    user_doc = fake_db.users.document("user1").to_dict()
    assert user_doc.get("subscription_status") == "active"


@pytest.mark.asyncio
async def test_handle_subscription_updated(fake_db: FakeDB) -> None:
    fake_db.subs.document("user1").set({"is_active": True})
    now = int(datetime.now().timestamp())
    subscription: Dict[str, Any] = {
        "customer": "cus_123",
        "id": "sub_123",
        "status": "past_due",
        "current_period_end": now + 7200,
        "items": {"data": [{"price": {"id": "price_test_premium"}}]},
    }
    await integ.handle_subscription_updated(subscription, fake_db)
    sub_doc = fake_db.subs.document("user1").to_dict()
    assert sub_doc.get("status") == "past_due"


@pytest.mark.asyncio
async def test_handle_subscription_cancelled(fake_db: FakeDB) -> None:
    subscription: Dict[str, Any] = {
        "customer": "cus_123",
        "id": "sub_123",
        "status": "canceled",
        "items": {"data": [{"price": {"id": "price_test_premium"}}]},
    }
    await integ.handle_subscription_cancelled(subscription, fake_db)
    sub_doc = fake_db.subs.document("user1").to_dict()
    assert sub_doc.get("is_active") is False
    user_doc = fake_db.users.document("user1").to_dict()
    assert user_doc.get("subscription_tier") == "free"


@pytest.mark.asyncio
async def test_handle_payment_succeeded_and_failed(fake_db: FakeDB) -> None:
    invoice: Dict[str, Any] = {"subscription": "sub_123"}
    # Just ensure no exceptions
    await integ.handle_payment_succeeded(invoice, fake_db)
    await integ.handle_payment_failed(invoice, fake_db)


@pytest.mark.asyncio
async def test_handle_webhook_invalid_signature(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    # Patch construct_event to raise signature error path
    class SignatureError(Exception):
        pass

    class FakeStripeErrorNamespace:
        SignatureVerificationError = SignatureError

    class FakeWebhook:
        @staticmethod
        def construct_event(
            payload: bytes, sig: str | None, secret: str | None
        ) -> Dict[str, Any]:  # noqa: D401, ANN001
            raise SignatureError("bad sig")

    fake_stripe = types.SimpleNamespace(
        Webhook=FakeWebhook, error=FakeStripeErrorNamespace()
    )
    monkeypatch.setattr(integ, "stripe", fake_stripe)  # type: ignore[arg-type]

    from fastapi import Request
    from starlette.datastructures import Headers

    class DummyRequest(Request):  # type: ignore[misc]
        def __init__(self) -> None:  # type: ignore[no-untyped-def]
            scope: Dict[str, Any] = {
                "type": "http",
                "method": "POST",
                "path": "/",
                "headers": [],
            }
            super().__init__(scope, receive=lambda: None)  # type: ignore[arg-type]  # noqa: E501

        async def body(self) -> bytes:  # noqa: D401
            return b"{}"

        @property
        def headers(self) -> Headers:  # type: ignore[override]
            return Headers({"stripe-signature": "sig"})

    req = DummyRequest()
    with pytest.raises(Exception) as exc:
        await integ.handle_stripe_webhook(req)
    assert "Invalid signature" in str(exc.value)
