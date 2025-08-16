from typing import Dict, Any
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PARENT = ROOT.parent
if str(PARENT) not in sys.path:
    sys.path.insert(0, str(PARENT))

import pytest
from fastapi.testclient import TestClient

from backend.main import app

client = TestClient(app)


def _base_birth() -> Dict[str, Any]:
    return {"birth_date":"1990-01-01","birth_time":"00:00:00","latitude":0.0,"longitude":0.0,"timezone":"UTC"}


def test_transits_date_range_exceeds_limit() -> None:
    payload: Dict[str, Any] = {
        "birth_data": _base_birth(),
        "date_range": {"start_date": "1990-01-01", "end_date": "1992-01-01"},  # > 365 days
        "include_minor_aspects": False,
        "include_asteroids": False,
        "orb": 2.0,
    }
    r = client.post("/api/astro/transits", json=payload)
    assert r.status_code == 400
    assert "cannot exceed" in r.json()["detail"].lower()


def test_lunar_transits_date_range_exceeds_limit() -> None:
    payload: Dict[str, Any] = {
        "birth_data": _base_birth(),
        "date_range": {"start_date": "1990-01-01", "end_date": "1991-05-01"},  # > 90 days
        "include_void_of_course": False,
        "include_daily_phases": True,
    }
    r = client.post("/api/astro/lunar-transits", json=payload)
    assert r.status_code == 400
    assert "cannot exceed" in r.json()["detail"].lower()


def test_minor_aspects_toggle(monkeypatch: pytest.MonkeyPatch) -> None:
    # For deterministic behavior monkeypatch calculate_aspect to yield a minor aspect in range
    from astro.calculations import transits_clean as tc

    calls = {"count": 0}

    def fake_calculate_aspect(pos1: float, pos2: float, orb: float = 2.0) -> Dict[str, Any]:  # noqa: D401
        # always return a minor aspect so filtering matters
        calls["count"] += 1
        return {"aspect": "semi-square", "angle": 45.0, "orb": 0.5, "intensity": 80.0, "energy": "tension", "type": "minor"}

    monkeypatch.setattr(tc, "calculate_aspect", fake_calculate_aspect)

    base_payload: Dict[str, Any] = {
        "birth_data": _base_birth(),
        "date_range": {"start_date": "1990-01-01", "end_date": "1990-01-02"},
        "include_asteroids": False,
        "orb": 2.0,
    }

    # Without minor aspects
    payload_no_minor: Dict[str, Any] = dict(base_payload, include_minor_aspects=False)
    r1 = client.post("/api/astro/transits", json=payload_no_minor)
    assert r1.status_code == 200
    data1 = r1.json()
    assert all(item["aspect"] != "semi-square" for item in data1) or len(data1) == 0

    # With minor aspects
    payload_minor: Dict[str, Any] = dict(base_payload, include_minor_aspects=True)
    r2 = client.post("/api/astro/transits", json=payload_minor)
    assert r2.status_code == 200
    data2 = r2.json()
    assert any(item["aspect"] == "semi-square" for item in data2)
    assert calls["count"] > 0
