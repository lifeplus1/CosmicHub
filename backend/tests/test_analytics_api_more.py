import json
import time
import sqlite3
from typing import Any, Dict, List, Set
import pytest
from fastapi.testclient import TestClient

from analytics.custom_analytics import get_analytics_service
from main import app

client = TestClient(app)


def test_conversion_funnel_endpoint():
    r = client.get('/api/analytics/conversion-funnel')
    assert r.status_code == 200
    data: Dict[str, Any] = r.json()
    for key in ['totalVisitors','signups','trialStarts','subscriptions','conversionRates']:
        assert key in data
    assert 'visitorToSignup' in data['conversionRates']


def test_performance_endpoint():
    r = client.get('/api/analytics/performance')
    assert r.status_code == 200
    body: Dict[str, Any] = r.json()
    assert 'averagePageLoadTime' in body and 'chartCalculationTimes' in body


def test_segments_endpoint():
    r = client.get('/api/analytics/segments')
    assert r.status_code == 200
    segs: List[Dict[str, Any]] = r.json()
    assert isinstance(segs, list) and len(segs) > 0
    required: Set[str] = {'id','name','criteria','users','conversionRate','averageLifetimeValue'}
    assert required.issubset(set(segs[0].keys()))


def test_track_endpoint_sanitizes_pii():
    svc = get_analytics_service()
    payload: Dict[str, Any] = {
        'event': 'chart_calculated',
        'user_id': 'pii-user',
        'session_id': 'pii-sess',
        'timestamp': int(time.time()*1000),
        'platform': 'web',
        'properties': { 'email': 'tester@example.com', 'ip_address': '203.0.113.10', 'chart_type': 'natal' }
    }
    r = client.post('/api/analytics/track', json=payload)
    assert r.status_code == 200
    # Background task should have executed; inspect DB
    with sqlite3.connect(svc.db_path) as conn:  # type: ignore[attr-defined]
        row = conn.execute("SELECT properties FROM analytics_events WHERE session_id='pii-sess' ORDER BY id DESC LIMIT 1").fetchone()
        assert row is not None
        props = json.loads(row[0])
        assert 'email' not in props
        assert 'ip_address' not in props
        assert props.get('email_domain') == 'example.com'


def test_session_summary_invalid_limit():
    r = client.get('/api/analytics/sessions/summary?limit=0')  # below ge=1
    assert r.status_code == 422


def test_health_check_failure(monkeypatch: pytest.MonkeyPatch):
    svc = get_analytics_service()
    async def boom():  # noqa: D401
        raise RuntimeError('forced')
    monkeypatch.setattr(svc, 'get_real_time_metrics', boom)
    r = client.get('/api/analytics/health')
    assert r.status_code == 503
    assert 'unhealthy' in r.json()['detail']