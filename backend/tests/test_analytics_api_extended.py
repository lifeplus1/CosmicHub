import time
import sqlite3
from typing import Generator, Dict, Any, Optional
import pytest
from fastapi.testclient import TestClient

from analytics.custom_analytics import get_analytics_service, PrivacyCompliantAnalytics
from main import app

client = TestClient(app)


@pytest.fixture(autouse=True)
def isolated_service(tmp_path, monkeypatch) -> Generator[None, None, None]:  # type: ignore
    """Provide an isolated analytics DB per test by swapping singleton."""
    test_db = tmp_path / "api_ext.db"  # type: ignore[operator]
    svc = PrivacyCompliantAnalytics(str(test_db))  # type: ignore[arg-type]
    # Swap singleton
    import analytics.custom_analytics as ca  # type: ignore
    prev = ca._analytics_instance  # type: ignore[attr-defined]
    ca._analytics_instance = svc  # type: ignore[attr-defined]
    yield
    ca._analytics_instance = prev  # type: ignore[attr-defined]


def _insert_event(event: str, session: str, user: Optional[str] = None, props: Optional[Dict[str, Any]] = None) -> None:
    svc = get_analytics_service()
    ts = int(time.time() * 1000)
    from analytics.custom_analytics import AnalyticsEvent  # local import to avoid circular
    evt = AnalyticsEvent(
        event=event,
        user_id=user,
        session_id=session,
        timestamp=ts,
        platform='web',
        properties=props or {}
    )
    assert svc._track_event_sync(evt)  # type: ignore[attr-defined]


def test_track_endpoint_persists_event():
    payload: Dict[str, Any] = {
        "event": "chart_calculated",
        "user_id": "u123",
        "session_id": "s1",
        "timestamp": int(time.time() * 1000),
        "platform": "web",
        "properties": {"chart_type": "natal"}
    }
    r = client.post('/api/analytics/track', json=payload)
    assert r.status_code == 200
    svc = get_analytics_service()
    with sqlite3.connect(svc.db_path) as conn:  # type: ignore[attr-defined]
        count = conn.execute("SELECT COUNT(*) FROM analytics_events WHERE session_id='s1'").fetchone()[0]
    assert count == 1


def test_realtime_metrics_after_events():
    _insert_event('chart_calculated', 'sessA', 'userA', { 'chart_type': 'natal'})
    _insert_event('ai_interaction', 'sessA', 'userA', { 'feature': 'aiQuestions'})
    r = client.get('/api/analytics/realtime')
    assert r.status_code == 200
    data = r.json()
    assert data['chartCalculationsPerMinute'] >= 1
    assert data['aiInteractionsPerHour'] >= 1


def test_session_summary_pagination():
    for i in range(7):
        _insert_event('page_view', f'sess{i}', 'userP', {})
    r = client.get('/api/analytics/sessions/summary?limit=5')
    assert r.status_code == 200
    sessions = r.json()['sessions']
    assert len(sessions) == 5


def test_daily_metrics_after_events():
    _insert_event('chart_calculated', 'sessDaily', 'userD', { 'chart_type': 'natal'})
    _insert_event('ai_interaction', 'sessDaily', 'userD', { 'feature': 'aiQuestions'})
    r = client.get('/api/analytics/daily')
    assert r.status_code == 200
    metrics = r.json()['metrics']
    # Accept metrics existing even if zero, but ensure keys present
    assert 'chart_calculations' in metrics
    assert 'ai_interactions' in metrics


def test_delete_nonexistent_user():
    r = client.delete('/api/analytics/user-data/does-not-exist')
    assert r.status_code == 200
    msg = r.json()['message']
    assert 'Deleted 0 events' in msg


def test_invalid_track_payload():
    bad: Dict[str, Any] = {
        "event": "chart_calculated",
        "user_id": "u1",
        "session_id": "sBad",
        # timestamp omitted
        "platform": "web",
        "properties": {}
    }
    r = client.post('/api/analytics/track', json=bad)
    assert r.status_code == 422