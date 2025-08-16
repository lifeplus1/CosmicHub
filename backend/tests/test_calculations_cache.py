"""Tests for calculations router cache utilities."""
from __future__ import annotations
import time
import sys, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
if str(root) not in sys.path:
    sys.path.insert(0, str(root))
from api.routers.calculations import (
    cache_chart_result,
    get_cached_chart,
    clear_expired_cache,
    generate_cache_key,
    BirthData,
)


def _sample_birth() -> BirthData:
    return BirthData(
        year=1990, month=6, day=15, hour=12, minute=0,
        city="Test", timezone="UTC", lat=0.0, lon=0.0
    )


def test_cache_store_and_retrieve():
    data = _sample_birth()
    key = generate_cache_key(data)
    payload: dict[str, object] = {"planets": {}, "houses": {}, "aspects": []}
    cache_chart_result(key, payload, ttl=1)
    cached = get_cached_chart(key)
    assert cached == payload
    # After expiry
    time.sleep(1.1)
    assert get_cached_chart(key) is None


def test_clear_expired_cache_counts():
    data = _sample_birth()
    key = generate_cache_key(data, "chart")
    cache_chart_result(key, {"x": 1}, ttl=0)
    time.sleep(0.05)
    removed = clear_expired_cache()
    assert removed >= 1
