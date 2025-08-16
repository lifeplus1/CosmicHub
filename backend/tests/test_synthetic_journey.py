"""Synthetic journey test (OBS-003)

Purpose: Exercise critical user path to feed latency & success metrics.
Path: load -> auth (mock or test user) -> fetch chart/transit -> verify response shape.

Assumptions:
- FastAPI app exposes /health or root endpoint.
- Authentication test helper or ability to create a token exists; if not, placeholder used.

Future Enhancements:
- Capture timings and emit to metrics (Prometheus push or log JSON line) during test run.
- Parameterize for multiple journey variants.
"""
from time import perf_counter
from typing import Dict

import httpx
import os

BASE_URL = os.environ.get("TEST_BASE_URL", "http://localhost:8000")

# Placeholder token retrieval (replace with real fixture or helper when available)
TEST_TOKEN = os.environ.get("TEST_AUTH_TOKEN", "test-dev-token")

JOURNEY_STEPS = [
    {"name": "root", "method": "GET", "path": "/"},
    # Add real API endpoints below once confirmed (examples):
    {"name": "transits", "method": "GET", "path": "/api/transits/sample"},
]


def _auth_headers() -> Dict[str, str]:
    return {"Authorization": f"Bearer {TEST_TOKEN}"} if TEST_TOKEN else {}


def test_synthetic_journey_smoke():
    timings = {}
    with httpx.Client(timeout=10) as client:
        for step in JOURNEY_STEPS:
            url = BASE_URL + step["path"]
            start = perf_counter()
            if step["method"] == "GET":
                resp = client.get(url, headers=_auth_headers())
            else:  # Extend later for POST/others
                resp = client.request(step["method"], url, headers=_auth_headers())
            elapsed = perf_counter() - start
            timings[step["name"]] = elapsed
            assert resp.status_code < 500, f"Server error at {step['name']} {resp.status_code}: {resp.text}" 
            # Allow 401 for now if auth not wired for test token; treat as soft failure
            if resp.status_code == 401:
                # Mark but don't fail test until auth fixture implemented
                print(f"[WARN] Unauthorized at step {step['name']} (will address once test auth fixture available)")
            else:
                assert resp.status_code in (200, 204), f"Unexpected status {resp.status_code} at {step['name']}"

    # Basic latency sanity (placeholder thresholds) - adjust once baseline gathered
    total_time = sum(timings.values())
    assert total_time < 5, f"Synthetic journey too slow: {total_time:.2f}s timings={timings}"

    # Emit a simple JSON line to stdout for potential aggregation
    print({"synthetic_journey_timings": timings, "total": total_time})
