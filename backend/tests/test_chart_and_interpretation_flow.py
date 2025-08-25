import os
from typing import Any
import asyncio

# Ensure test mode and tracing disabled BEFORE importing application modules
os.environ.setdefault("TEST_MODE", "1")
os.environ.setdefault("ENABLE_TRACING", "false")
os.environ.setdefault("ALLOW_MOCK_AUTH", "1")
os.environ.setdefault("ALLOW_MOCK_DB", "1")
os.environ.setdefault("PYTHONASYNCIODEBUG", "0")

# Explicitly set a fresh event loop policy to avoid reuse issues that can hang with TestClient in strict mode (Python 3.13 + pytest-asyncio)
try:
    asyncio.set_event_loop_policy(asyncio.DefaultEventLoopPolicy())  # type: ignore[arg-type]
except Exception:
    pass

from fastapi import status  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from main import app  # noqa: E402


def test_chart_save_and_interpretation_flow(monkeypatch: Any):  # type: ignore[no-any-unimported]  # noqa: E501
    """End-to-end (sync via TestClient): save chart then request interpretation; ensures 404 then success after save."""  # noqa: E501
    monkeypatch.setenv(
        "TEST_MODE", "1"
    )  # Use mock auth  # type: ignore[attr-defined]
    monkeypatch.setenv(
        "ENABLE_TRACING", "false"
    )  # Disable OTLP exporter noise  # type: ignore[attr-defined]
    monkeypatch.setenv(
        "INTERPRETATION_CACHE_TTL", "120"
    )  # shorter TTL for tests

    # Monkeypatch firebase auth verify to return a deterministic user for unified charts router  # noqa: E501
    try:
        from firebase_admin import auth as fb_auth  # type: ignore

        monkeypatch.setattr(fb_auth, "verify_id_token", lambda token: {"uid": "dev-user"})  # type: ignore[attr-defined]  # noqa: E501
    except Exception:
        pass

    client = TestClient(app)

    # Minimal valid SaveChartRequest payload

    # 404 expected for missing chart
    resp_missing = client.post(
        "/api/interpretations/generate",
        json={
            "chartId": "non-existent",
            "userId": "dev-user",
            "type": "natal",
            "interpretation_level": "advanced",
        },
        headers={"Authorization": "Bearer test"},
    )
    assert resp_missing.status_code == status.HTTP_404_NOT_FOUND

    # Save chart
    resp_save = client.post(
        "/api/charts/save",
        json={
            "planets": [
                {
                    "name": "Sun",
                    "sign": "Leo",
                    "degree": 15.25,
                    "house": 5,
                    "aspects": [],
                }
            ],
            "asteroids": [],
            "angles": [
                {"name": "Ascendant", "sign": "Aries", "degree": 12.33}
            ],
            "houses": [
                {
                    "number": 1,
                    "sign": "Aries",
                    "cusp": 12.33,
                    "planets": ["Sun"],
                }
            ],
            "aspects": [
                {
                    "planet1": "Sun",
                    "planet2": "Mercury",
                    "type": "Conjunction",
                    "orb": 2.5,
                    "applying": True,
                }
            ],
        },
        headers={"Authorization": "Bearer test"},
    )
    assert resp_save.status_code == status.HTTP_200_OK, resp_save.text
    chart_id = resp_save.json()["chart_id"]
    assert resp_save.json()["version"] == "1.0.0"

    # Generate interpretation
    resp_interp = client.post(
        "/api/interpretations/generate",
        json={
            "chartId": chart_id,
            "userId": "dev-user",
            "type": "natal",
            "interpretation_level": "advanced",
        },
        headers={"Authorization": "Bearer test"},
    )
    assert resp_interp.status_code == status.HTTP_200_OK
    data = resp_interp.json()
    assert data["success"] is True
    assert data["data"][0]["chartId"] == chart_id
    assert data["data"][0]["version"] == "1.0.0"

    # Cached path
    resp_interp_cached = client.post(
        "/api/interpretations/generate",
        json={
            "chartId": chart_id,
            "userId": "dev-user",
            "type": "natal",
            "interpretation_level": "advanced",
        },
        headers={"Authorization": "Bearer test"},
    )
    assert resp_interp_cached.status_code == status.HTTP_200_OK
    cached_message = resp_interp_cached.json()["message"].lower()
    assert "cache" in cached_message
    cached_payload = resp_interp_cached.json()["data"][0]
    assert cached_payload["schemaVersion"] == "1.0.0"
