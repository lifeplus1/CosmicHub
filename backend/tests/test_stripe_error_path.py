import sys
from pathlib import Path
from typing import Any, Dict
import pytest
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient

ROOT = Path(__file__).resolve().parent.parent
PARENT = ROOT.parent
if str(PARENT) not in sys.path:
    sys.path.insert(0, str(PARENT))

from backend.api.routers import stripe_router as sr  # type: ignore


@pytest.fixture(scope="module")
def app() -> FastAPI:  # noqa: D401
    app = FastAPI()
    app.include_router(sr.router)
    async def fake_verify_token() -> str:  # noqa: D401
        return "user-test"
    app.dependency_overrides[sr.verify_firebase_token] = fake_verify_token
    return app


@pytest.fixture()
def client(app: FastAPI):  # noqa: D401
    return TestClient(app)


def test_checkout_session_internal_error(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    async def failing_create(user_id: str, plan_id: str, success_url: str, cancel_url: str) -> Dict[str, Any]:  # noqa: D401
        raise HTTPException(status_code=500, detail="Failed to create checkout session")
    monkeypatch.setattr(sr, "create_stripe_checkout_session", failing_create)
    payload: Dict[str, Any] = {
        "tier": "premium",
        "userId": "ignored",
        "isAnnual": True,
        "successUrl": "https://example.com/success",
        "cancelUrl": "https://example.com/cancel",
    }
    resp = client.post("/stripe/create-checkout-session", json=payload)
    assert resp.status_code == 500
    assert "failed" in resp.json()["detail"].lower()
