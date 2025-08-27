import time
from typing import Generator
import pytest
from fastapi.testclient import TestClient

from analytics.custom_analytics import PrivacyCompliantAnalytics, get_analytics_service, AnalyticsEvent
from main import app

client = TestClient(app)


@pytest.fixture(autouse=True)
def isolated_service(tmp_path) -> Generator[None, None, None]:  # type: ignore
    """Isolated DB so session duration math is deterministic."""
    test_db = tmp_path / "session_duration.db"  # type: ignore[operator]
    inst = PrivacyCompliantAnalytics(str(test_db))  # type: ignore[arg-type]
    import analytics.custom_analytics as ca  # type: ignore
    prev = ca._analytics_instance  # type: ignore[attr-defined]
    ca._analytics_instance = inst  # type: ignore[attr-defined]
    yield
    ca._analytics_instance = prev  # type: ignore[attr-defined]


def _track(ts_ms: int, session: str):
    svc = get_analytics_service()
    evt = AnalyticsEvent(
        event='page_view',
        user_id='dur-user',
        session_id=session,
        timestamp=ts_ms,
        platform='web',
        properties={}
    )
    assert svc._track_event_sync(evt)  # type: ignore[attr-defined]


def test_average_session_duration_in_astrology_analytics():
    base = int(time.time() * 1000)
    # Simulate a session with a few page views spaced 5s apart (<30m so duration accumulates)
    for i in range(4):
        _track(base + i * 5000, 'sess-dur-1')
    # Finalize (optional) by ending session to ensure end_time set
    svc = get_analytics_service()
    assert svc._end_session_sync('sess-dur-1')  # type: ignore[attr-defined]

    r = client.get('/api/analytics/astrology?timeframe=week')
    assert r.status_code == 200
    data = r.json()
    avg = data['userPreferences']['averageSessionDuration']
    # We expect at least 15s span (3 gaps of 5s => 15000ms) allowing for processing variability
    assert avg >= 14000
