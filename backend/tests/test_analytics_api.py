import time
import pytest
from typing import Generator
from _pytest.monkeypatch import MonkeyPatch  # type: ignore
from fastapi.testclient import TestClient
from analytics.custom_analytics import get_analytics_service, AnalyticsEvent
from main import app

client = TestClient(app)

@pytest.fixture(autouse=True)
def enable_test_mode(monkeypatch: MonkeyPatch) -> Generator[None, None, None]:
    """Automatically set TEST_MODE env for all analytics API tests."""
    monkeypatch.setenv('TEST_MODE', '1')
    yield


def test_realtime_metrics_empty():
    r = client.get('/api/analytics/realtime')
    assert r.status_code == 200
    body = r.json()
    assert 'realTimeUsers' in body


def test_track_and_realtime_updates():
    svc = get_analytics_service('test_analytics.db')
    ts = int(time.time()*1000)
    evt = AnalyticsEvent(
        event='chart_calculated',
        user_id='user123',
        session_id='sess1',
        timestamp=ts,
        platform='web',
        properties={'chart_type':'natal'}
    )
    # Track directly (sync) for determinism
    assert svc._track_event_sync(evt) is True  # type: ignore[attr-defined]

    r = client.get('/api/analytics/realtime')
    assert r.status_code == 200
    data = r.json()
    assert data['chartCalculationsPerMinute'] >= 0


def test_daily_metrics_endpoint():
    r = client.get('/api/analytics/daily')
    assert r.status_code == 200
    assert 'metrics' in r.json()


def test_session_summary_endpoint():
    r = client.get('/api/analytics/sessions/summary?limit=5')
    assert r.status_code == 200
    body = r.json()
    assert 'sessions' in body


def test_delete_user_data():
    svc = get_analytics_service()
    ts = int(time.time()*1000)
    for i in range(3):
        evt = AnalyticsEvent(
            event='ai_interaction',
            user_id='del-user',
            session_id=f's-del-{i}',
            timestamp=ts + i,
            platform='web',
            properties={'feature':'aiQuestions'}
        )
        assert svc._track_event_sync(evt)  # type: ignore[attr-defined]
    r = client.delete('/api/analytics/user-data/del-user')
    assert r.status_code == 200
    msg = r.json()['message']
    assert 'Deleted' in msg and 'del-user' in msg


def test_consent_endpoint():
    r = client.post('/api/analytics/consent', json={
        'user_id': 'u1', 'consent_type': 'analytics', 'granted': True, 'consent_version': 'v1'
    })
    assert r.status_code == 200
    body = r.json()
    assert body['success'] is True
    assert 'updated' in body['message']


def test_cleanup_endpoint():
    r = client.post('/api/analytics/cleanup?retention_days=1')
    assert r.status_code == 200
    body = r.json()
    assert body['success'] is True
    assert 'Data cleanup initiated' in body['message']


def test_astrology_invalid_timeframe():
    r = client.get('/api/analytics/astrology?timeframe=century')
    assert r.status_code == 400
    assert 'Invalid timeframe' in r.json()['detail']


def test_health_check():
    r = client.get('/api/analytics/health')
    assert r.status_code == 200
    body = r.json()
    assert body['status'] == 'healthy'
