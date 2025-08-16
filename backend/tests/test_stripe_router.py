import types
import sys
from pathlib import Path
from datetime import datetime
from types import ModuleType
from typing import Any, Dict, Generator, Mapping, TypedDict

# Ensure project root (one level up) is on sys.path so 'backend' absolute imports resolve when stripe_integration re-imports.
ROOT = Path(__file__).resolve().parent.parent
PARENT = ROOT.parent
if str(PARENT) not in sys.path:
    sys.path.insert(0, str(PARENT))

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

# Dynamically load stripe_router module to avoid relative import traversal issues when running tests standalone.
from backend.api.routers import stripe_router as sr  # type: ignore


@pytest.fixture(scope="module")
def test_app() -> FastAPI:
    """Create a dedicated FastAPI app mounting only the stripe router for isolated tests."""
    app = FastAPI()
    app.include_router(sr.router)  # mount /stripe endpoints

    # Override auth dependency to avoid firebase
    async def fake_verify_token():  # returns deterministic user id
        return "test-user"

    # Dependency override: replace the verify_firebase_token used in Depends
    app.dependency_overrides[sr.verify_firebase_token] = fake_verify_token
    return app


@pytest.fixture()
def client(test_app: FastAPI) -> Generator[TestClient, None, None]:
    yield TestClient(test_app)


class _Plan(TypedDict):
    price_id: str
    features: list[str]
    name: str
    price: float


@pytest.fixture(autouse=True)
def patch_subscription_plans(monkeypatch: pytest.MonkeyPatch) -> Dict[str, _Plan]:
    """Provide deterministic subscription plans with known price IDs for matching in verification logic."""
    plans: Dict[str, _Plan] = {
        "astro_premium": {
            "price_id": "price_test_premium",
            "features": ["feature_a", "feature_b"],
            "name": "Astro Premium",
            "price": 9.99,
        },
        "astro_premium_monthly": {
            "price_id": "price_test_premium_monthly",
            "features": ["feature_a"],
            "name": "Astro Premium Monthly",
            "price": 0.99,
        },
        "cosmic_master": {
            "price_id": "price_test_master",
            "features": ["feature_c"],
            "name": "Cosmic Master",
            "price": 19.99,
        },
        "cosmic_master_monthly": {
            "price_id": "price_test_master_monthly",
            "features": ["feature_c"],
            "name": "Cosmic Master Monthly",
            "price": 2.99,
        },
    }
    monkeypatch.setattr(sr, "SUBSCRIPTION_PLANS", plans)  # type: ignore[arg-type]
    # Also patch original integration dict reference (imported object) if present
    try:
        import backend.api.stripe_integration as integ  # type: ignore
    except Exception:
        integ = None  # type: ignore
    else:  # only patch if import succeeded
        monkeypatch.setattr(integ, "SUBSCRIPTION_PLANS", plans)  # type: ignore[arg-type]
    return plans


def test_get_plans(client: TestClient) -> None:
    resp = client.get("/stripe/plans")
    assert resp.status_code == 200
    data = resp.json()
    assert data["currency"] == "USD"
    # Ensure price_id not leaked (sanitized)
    assert "price_id" not in str(data)


def test_create_checkout_session_success(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    async def fake_create_checkout_session(user_id: str, plan_id: str, success_url: str, cancel_url: str) -> Dict[str, Any]:
        return {
            "checkout_url": f"https://stripe.test/checkout/{plan_id}",
            "session_id": "sess_123",
            "plan": sr.SUBSCRIPTION_PLANS.get(plan_id, {}),
        }

    monkeypatch.setattr(sr, "create_stripe_checkout_session", fake_create_checkout_session)

    payload: Dict[str, Any] = {
        "tier": "premium",
        "userId": "ignored",  # actual id from dependency override
        "isAnnual": True,
        "successUrl": "https://example.com/success",
        "cancelUrl": "https://example.com/cancel",
    }
    resp = client.post("/stripe/create-checkout-session", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["checkout_url"].startswith("https://stripe.test/checkout/")
    assert data["session_id"] == "sess_123"


def test_create_checkout_session_invalid_tier(client: TestClient) -> None:
    payload: Dict[str, Any] = {
        "tier": "unknown",
        "userId": "ignored",
        "isAnnual": False,
        "successUrl": "https://example.com/success",
        "cancelUrl": "https://example.com/cancel",
    }
    resp = client.post("/stripe/create-checkout-session", json=payload)
    assert resp.status_code == 400


def test_subscription_status(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    async def fake_status(user_id: str) -> Dict[str, Any]:
        return {
            "status": "active",
            "tier": "astro_premium",
            "features": ["feature_a"],
            "expires_at": "2099-01-01T00:00:00",
            "stripe_subscription_id": "sub_123",
        }

    monkeypatch.setattr(sr, "get_user_subscription_status", fake_status)
    resp = client.get("/stripe/subscription-status")
    assert resp.status_code == 200
    assert resp.json()["status"] == "active"


def test_cancel_and_reactivate_subscription(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    # Provide active status for cancel path and inactive for reactivate path via mutable store
    state = {"active": True}

    async def fake_status(user_id: str) -> Dict[str, Any]:  # toggles before each endpoint call
        return {
            "status": "active" if state["active"] else "inactive",
            "tier": "astro_premium",
            "features": ["feature_a"],
            "expires_at": None,
            "stripe_subscription_id": "sub_123",
        }

    monkeypatch.setattr(sr, "get_user_subscription_status", fake_status)
    monkeypatch.setattr(sr, "cancel_stripe_subscription", lambda sub_id: None)  # type: ignore[arg-type]
    monkeypatch.setattr(sr, "reactivate_stripe_subscription", lambda sub_id: None)  # type: ignore[arg-type]
    monkeypatch.setattr(sr, "update_subscription_cancel_flag", lambda user_id, flag: None)  # type: ignore[arg-type]

    # Cancel
    resp_cancel = client.post("/stripe/cancel-subscription")
    assert resp_cancel.status_code == 200
    assert resp_cancel.json()["status"] == "cancelled"

    # Flip active flag to False to simulate stored status after cancel
    state["active"] = False
    resp_reactivate = client.post("/stripe/reactivate-subscription")
    assert resp_reactivate.status_code == 200
    assert resp_reactivate.json()["status"] == "reactivated"


def test_health_endpoint(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(sr, "get_stripe_account", lambda: {"id": "acct_test"})
    resp = client.get("/stripe/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"
    assert data["stripe_connected"] is True


def test_webhook_handler(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    called = {"handled": False}

    async def fake_handle(request: Any) -> Dict[str, str]:  # signature matches expected call
        called["handled"] = True
        return {"status": "success"}

    monkeypatch.setattr(sr, "handle_stripe_webhook", fake_handle)  # type: ignore[arg-type]
    resp = client.post("/stripe/webhook", content="{}", headers={"stripe-signature": "sig"})
    # Should accept immediately with received status regardless of processing outcome
    assert resp.status_code == 200
    assert resp.json()["status"] == "received"


def _make_session(metadata_uid: str, payment_status: str = "paid") -> types.SimpleNamespace:
    obj = types.SimpleNamespace()
    obj.metadata = {"firebase_uid": metadata_uid}
    obj.payment_status = payment_status
    obj.subscription = "sub_123"
    obj.customer = "cus_123"
    return obj


def _make_subscription(price_id: str) -> types.SimpleNamespace:
    price = types.SimpleNamespace(id=price_id)
    item = types.SimpleNamespace(price=price)
    items = types.SimpleNamespace(data=[item])
    return types.SimpleNamespace(
        items=items,
        status="active",
        current_period_start=int(datetime.now().timestamp()),
        current_period_end=int(datetime.now().timestamp()) + 3600,
    )


def test_verify_session_success(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    import sys
    # Build fake stripe module with required functions/classes
    stripe_mod = ModuleType("stripe")
    checkout_ns = types.SimpleNamespace(Session=types.SimpleNamespace(retrieve=lambda sid: _make_session("test-user")))  # type: ignore[arg-type]
    subscription_ns = types.SimpleNamespace(retrieve=lambda sid: _make_subscription("price_test_premium"))  # type: ignore[arg-type]
    setattr(stripe_mod, "checkout", checkout_ns)
    setattr(stripe_mod, "Subscription", subscription_ns)
    sys.modules["stripe"] = stripe_mod  # type: ignore[assignment]

    # Patch Firestore client used inside verification (provide minimal interface)
    class FakeDoc:
        def __init__(self) -> None:
            self._data: Dict[str, Any] = {}
            self.exists = False
        def get(self) -> "FakeDoc":
            return self
        def set(self, value: Mapping[str, Any], merge: bool = False) -> None:  # noqa: ARG002
            self._data.update(value)
        def update(self, value: Mapping[str, Any]) -> None:
            self._data.update(value)
        def to_dict(self) -> Dict[str, Any]:
            return dict(self._data)

    class FakeCollection:
        def __init__(self) -> None:
            self.docs: Dict[str, FakeDoc] = {"test-user": FakeDoc()}
        def document(self, doc_id: str) -> FakeDoc:
            self.docs.setdefault(doc_id, FakeDoc())
            return self.docs[doc_id]

    class FakeDB:
        def __init__(self) -> None:
            self._subs = FakeCollection()
            self._users = FakeCollection()
        def collection(self, name: str) -> Any:  # return type intentionally Any for Firestore mimic
            if name == "subscriptions":
                return self._subs
            if name == "users":
                return self._users
            return FakeCollection()

    monkeypatch.setattr("backend.database.get_firestore_client", lambda: FakeDB())

    resp = client.post("/stripe/verify-session", json={"sessionId": "sess_123"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["subscription"]["tier"].startswith("astro_premium")


def test_verify_session_user_mismatch(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    import sys
    stripe_mod = ModuleType("stripe")
    checkout_ns = types.SimpleNamespace(Session=types.SimpleNamespace(retrieve=lambda sid: _make_session("other-user")))  # type: ignore[arg-type]
    subscription_ns = types.SimpleNamespace(retrieve=lambda sid: _make_subscription("price_test_premium"))  # type: ignore[arg-type]
    setattr(stripe_mod, "checkout", checkout_ns)
    setattr(stripe_mod, "Subscription", subscription_ns)
    sys.modules["stripe"] = stripe_mod  # type: ignore[assignment]
    monkeypatch.setattr("backend.database.get_firestore_client", lambda: None)
    resp = client.post("/stripe/verify-session", json={"sessionId": "sess_123"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is False
    assert "does not belong" in data["message"].lower()
