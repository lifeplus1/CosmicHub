"""Smoke tests for security.py, settings.py, and startup behaviors."""

from __future__ import annotations

from typing import Any, Dict, cast

from fastapi.responses import JSONResponse

from security import (
    InputValidator,
    RateLimiter,
    SecurityHeaders,
    create_rate_limit_key,
)
from settings import get_settings, validate_settings


class DummyRequest:
    def __init__(
        self,
        headers: Dict[str, str] | None = None,
        client_host: str = "127.0.0.1",
    ):
        self.headers = headers or {}
        self.client = type("C", (), {"host": client_host})()


def test_rate_limiter_allows_within_window():
    rl = RateLimiter(max_requests=3, window_seconds=60)
    ident = "user:test"
    assert rl.is_allowed(ident)
    assert rl.is_allowed(ident)
    assert rl.is_allowed(ident)
    assert rl.is_allowed(ident) is False  # 4th should fail


def test_input_validator_email_and_birthdata():
    assert InputValidator.validate_email("user@example.com") is True
    bad = InputValidator.validate_email("not-an-email")
    assert bad is False
    birth: Dict[str, Any] = {
        "date": "2025-08-16",
        "time": "14:30",
        "location": {"lat": 40.0, "lng": -70.0, "name": "  NYC  "},
    }
    cleaned = InputValidator.validate_birth_data(birth)
    assert cleaned["location"]["name"] == "NYC"


def test_security_headers_added():
    resp = JSONResponse({"ok": True})
    resp = SecurityHeaders.add_security_headers(resp)
    for header in [
        "X-Content-Type-Options",
        "X-Frame-Options",
        "X-XSS-Protection",
        "Strict-Transport-Security",
        "Content-Security-Policy",
    ]:
        assert header in resp.headers


def test_create_rate_limit_key_user_hash_stable():
    req = DummyRequest()
    # Cast to satisfy static type expectations (matches subset of FastAPI Request interface)
    key1 = create_rate_limit_key(cast(Any, req), user_id="abc123")
    key2 = create_rate_limit_key(cast(Any, req), user_id="abc123")
    assert key1 == key2 and key1.startswith("user:")


def test_settings_validation():
    ok, errors = validate_settings()
    assert ok is True and errors == []
    s = get_settings()
    assert s.api_url.startswith("http")
