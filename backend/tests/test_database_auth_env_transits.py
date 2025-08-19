import importlib
import sys
from datetime import datetime

import pytest


def test_database_memory_fallback(monkeypatch: pytest.MonkeyPatch):
    """Force memory DB mode and exercise save/get/delete/batch/stats functions."""
    monkeypatch.setenv("DEPLOY_ENVIRONMENT", "development")
    monkeypatch.setenv("FIREBASE_PRIVATE_KEY", "")
    
    # Import database module after environment setup
    importlib.reload(sys.modules["backend.database"])  # type: ignore[arg-type]
    import backend.database as dbmod

    user = "mem-user"
    chart = dbmod.save_chart(
        user,
        "natal",
        {
            "year": 2020,
            "month": 1,
            "day": 1,
            "hour": 0,
            "minute": 0,
            "city": "X",
        },
        {"planets": {}},
    )
    charts = dbmod.get_charts(user)
    assert charts and charts[0]["id"] == chart["id"]
    stats = dbmod.get_user_stats(user)
    assert stats["total_charts"] >= 1
    deleted = dbmod.delete_chart_by_id(user, chart["id"])
    assert deleted is True


def test_database_batch_and_async(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setenv("DEPLOY_ENVIRONMENT", "development")
    import backend.database as dbmod

    user = "batch-user"
    ids = dbmod.batch_save_charts(
        user,
        [
            {
                "name": "A",
                "birth_date": "2020-01-01",
                "birth_time": "00:00",
                "birth_location": "X",
                "chart_type": "natal",
                "birth_data": {},
                "chart_data": {},
            },
            {
                "name": "B",
                "birth_date": "2020-01-02",
                "birth_time": "00:00",
                "birth_location": "Y",
                "chart_type": "natal",
                "birth_data": {},
                "chart_data": {},
            },
        ],
    )
    assert len(ids) == 2
    import asyncio

    res = asyncio.run(dbmod.async_get_multiple_charts([user]))
    assert user in res and len(res[user]) >= 2


@pytest.mark.asyncio
async def test_auth_negative_no_token(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setenv("ALLOW_MOCK_AUTH", "0")
    monkeypatch.setenv("DEPLOY_ENVIRONMENT", "production")
    monkeypatch.delenv("FIREBASE_CREDENTIALS", raising=False)
    # Import should raise ValueError because credentials missing in production with mock disabled
    if "backend.auth" in sys.modules:
        del sys.modules["backend.auth"]
    with pytest.raises(ValueError):
        import backend.auth  # type: ignore  # noqa: F401


def test_settings_invalid_values(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setenv("API_URL", "ftp://invalid")
    monkeypatch.setenv("DATABASE_URL", "sqlite:///bad")
    monkeypatch.setenv("REDIS_URL", "http://bad")
    monkeypatch.setenv("RATE_LIMIT_MAX", "-5")
    with pytest.raises(Exception):
        import backend.settings as st  # noqa: F401

        st.settings  # type: ignore


def test_transits_helper_functions(monkeypatch: pytest.MonkeyPatch):
    from astro.calculations import transits_clean as tc

    monkeypatch.setattr(tc, "swe_available", False)
    monkeypatch.setattr(tc, "swe", None)
    now = datetime(2024, 1, 1, 12, 0)
    jd = tc.julian_day(now)
    assert isinstance(jd, float)
    pos, retro = tc.calculate_planet_position(jd, 3)
    assert 0 <= pos < 360 and retro is False
    aspect = tc.calculate_aspect(10.0, 12.0, orb=3.0)
    assert aspect is not None and "aspect" in aspect
    phase = tc.calculate_lunar_phase(0.0, 10.0)
    assert phase["phase"] in (
        "new_moon",
        "waxing_crescent",
        "first_quarter",
        "waxing_gibbous",
        "full_moon",
        "waning_gibbous",
        "last_quarter",
        "waning_crescent",
    )
    sign = tc.get_moon_sign(25.0)
    assert sign == "Aries"


def test_transits_endpoints_small_range(monkeypatch: pytest.MonkeyPatch):
    from fastapi.testclient import TestClient

    from backend.main import app

    client = TestClient(app)
    payload: dict[str, object] = {
        "birth_data": {
            "birth_date": "1990-01-01",
            "birth_time": "00:00:00",
            "latitude": 0.0,
            "longitude": 0.0,
            "timezone": "UTC",
        },
        "date_range": {"start_date": "1990-01-01", "end_date": "1990-01-03"},
        "include_minor_aspects": False,
        "include_asteroids": False,
        "orb": 2.0,
    }
    r = client.post("/api/astro/transits", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list) and len(data) <= 500  # type: ignore[arg-type]

    lunar_payload: dict[str, object] = {
        "birth_data": payload["birth_data"],
        "date_range": {"start_date": "1990-01-01", "end_date": "1990-01-02"},
        "include_void_of_course": False,
        "include_daily_phases": True,
    }
    r2 = client.post("/api/astro/lunar-transits", json=lunar_payload)
    assert r2.status_code == 200
    assert len(r2.json()) == 2
