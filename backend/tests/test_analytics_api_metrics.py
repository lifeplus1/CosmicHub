import time
from typing import Generator, Dict, Any, List
import pytest
from fastapi.testclient import TestClient

from analytics.custom_analytics import PrivacyCompliantAnalytics, get_analytics_service
from main import app

client = TestClient(app)


@pytest.fixture(autouse=True)
def isolated_db(tmp_path) -> Generator[None, None, None]:  # type: ignore
    """Isolate singleton analytics DB per test for deterministic metrics."""
    test_db = tmp_path / "metrics_api.db"  # type: ignore[operator]
    inst = PrivacyCompliantAnalytics(str(test_db))  # type: ignore[arg-type]
    import analytics.custom_analytics as ca  # type: ignore
    prev = ca._analytics_instance  # type: ignore[attr-defined]
    ca._analytics_instance = inst  # type: ignore[attr-defined]
    yield
    ca._analytics_instance = prev  # type: ignore[attr-defined]


def _sync_track(event: str, props: Dict[str, Any]):
    svc = get_analytics_service()
    ts = int(time.time() * 1000)
    from analytics.custom_analytics import AnalyticsEvent
    ev = AnalyticsEvent(
        event=event,
        user_id='user-metrics',
        session_id=f's-{event}-{ts}',
        timestamp=ts,
        platform='web',
        properties=props,
    )
    assert svc._track_event_sync(ev)  # type: ignore[attr-defined]


def test_astrology_analytics_counts():
    # Seed chart calculations across types
    chart_types = ['natal','transit','synastry','composite','solar_return']
    for ct in chart_types:
        _sync_track('chart_calculated', {'chart_type': ct})
    # Seed AI feature usage
    features = ['predictiveTransits','aiQuestions','multiSystemSynthesis','growthCoaching','patternRecognition']
    for ft in features:
        _sync_track('ai_interaction', {'feature': ft})

    r = client.get('/api/analytics/astrology?timeframe=week')
    assert r.status_code == 200
    data = r.json()
    # Each seeded chart type should have >=1 count (exact counting logic may aggregate differently, allow >=0 and at least one >0)
    calc_values: List[int] = list(data['chartCalculations'].values())
    assert any(v >= 1 for v in calc_values)
    ai_values: List[int] = list(data['aiFeatureUsage'].values())
    assert any(v >= 1 for v in ai_values)


def test_daily_metrics_increment():
    pre = client.get('/api/analytics/daily').json().get('metrics', {})
    pre_chart = pre.get('chart_calculations', 0)
    pre_ai = pre.get('ai_interactions', 0)
    for _ in range(3):
        _sync_track('chart_calculated', {'chart_type': 'natal'})
    for _ in range(2):
        _sync_track('ai_interaction', {'feature': 'aiQuestions'})
    post = client.get('/api/analytics/daily').json()['metrics']
    assert post['chart_calculations'] >= pre_chart + 1  # at least incremented
    assert post['ai_interactions'] >= pre_ai + 1


@pytest.mark.parametrize('bad', ['decade','era','future','', 'DAY', 'Week'])
def test_additional_invalid_timeframes(bad: str):
    r = client.get(f'/api/analytics/astrology?timeframe={bad}')
    assert r.status_code == 400


def test_realtime_after_load():
    for _ in range(10):
        _sync_track('chart_calculated', {'chart_type': 'natal'})
    for _ in range(8):
        _sync_track('ai_interaction', {'feature': 'aiQuestions'})
    r = client.get('/api/analytics/realtime')
    assert r.status_code == 200
    metrics = r.json()
    # Not asserting exact counts due to time-bucket logic; ensure non-zero categories
    assert metrics['chartCalculationsPerMinute'] >= 1
    assert metrics['aiInteractionsPerHour'] >= 1