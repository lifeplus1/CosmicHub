import json
import sqlite3
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Dict, Any
import pytest

from backend.analytics.custom_analytics import AnalyticsEvent, EventType, get_analytics_service

# Helpers

def _mk_event(event_type: EventType, session: str, user: str = "userX", props: Dict[str, Any] | None = None, ts: int | None = None) -> AnalyticsEvent:
    return AnalyticsEvent(
        event=event_type.value,
        user_id=user,
        session_id=session,
        timestamp= ts if ts is not None else int(datetime.now(tz=timezone.utc).timestamp() * 1000),
        platform="web",
        properties= props or {}
    )

@pytest.mark.asyncio
async def test_event_anonymization(tmp_path: Path):
    db_path: Path = tmp_path / "analytics_anonymize.db"
    svc = get_analytics_service(str(db_path))
    ev = _mk_event(EventType.CHART_CALCULATION, "sessAnon", props={
        "ip_address": "203.0.113.42",
        "email": "person@example.com",
        "chart_type": "natal"
    })
    ok = await svc.track_event(ev)
    assert ok
    with sqlite3.connect(str(db_path)) as conn:
        row = conn.execute("SELECT properties FROM analytics_events ORDER BY id DESC LIMIT 1").fetchone()
        assert row is not None
        props = json.loads(row[0])
        assert "ip_address" not in props
        assert "email" not in props
        assert props.get("email_domain") == "example.com"

@pytest.mark.asyncio
async def test_session_page_view_counts(tmp_path: Path):
    db_path: Path = tmp_path / "analytics_session.db"
    svc = get_analytics_service(str(db_path))
    # Two page views + one AI interaction
    for evt in [EventType.PAGE_VIEW, EventType.PAGE_VIEW, EventType.AI_INTERACTION]:
        ok = await svc.track_event(_mk_event(evt, "sess1"))
        assert ok
    with sqlite3.connect(str(db_path)) as conn:
        row = conn.execute("SELECT page_views, events_count FROM user_sessions WHERE session_id = ?", ("sess1",)).fetchone()
        assert row is not None
        page_views, events_count = row
        assert page_views == 2
        assert events_count == 3

@pytest.mark.asyncio
async def test_cleanup_old_data(tmp_path: Path):
    db_path: Path = tmp_path / "analytics_cleanup.db"
    svc = get_analytics_service(str(db_path))
    old_ts = int((datetime.now(tz=timezone.utc) - timedelta(days=5)).timestamp() * 1000)
    new_ts = int(datetime.now(tz=timezone.utc).timestamp() * 1000)
    ok_old = await svc.track_event(_mk_event(EventType.AI_INTERACTION, "sessOld", ts=old_ts))
    ok_new = await svc.track_event(_mk_event(EventType.AI_INTERACTION, "sessNew", ts=new_ts))
    assert ok_old and ok_new
    # Retain only events within last 1 day
    await svc.cleanup_old_data(retention_days=1)
    with sqlite3.connect(str(db_path)) as conn:
        rows = conn.execute("SELECT COUNT(*) FROM analytics_events").fetchone()[0]
        assert rows == 1  # only new event remains
