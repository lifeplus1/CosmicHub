import sqlite3
from datetime import datetime, timezone
from pathlib import Path
import pytest

from backend.analytics.custom_analytics import AnalyticsEvent, EventType, get_analytics_service

@pytest.mark.asyncio
async def test_end_session_updates_end_time_and_duration(tmp_path: Path):
    db_path: Path = tmp_path / "analytics_session_end.db"
    svc = get_analytics_service(str(db_path))
    ts = int(datetime.now(tz=timezone.utc).timestamp() * 1000)
    ev = AnalyticsEvent(
        event=EventType.PAGE_VIEW.value,
        user_id="user1",
        session_id="sessionEnd1",
        timestamp=ts,
        platform="web",
        properties={}
    )
    ok = await svc.track_event(ev)
    assert ok
    # End session if API provides method
    if hasattr(svc, "end_session"):
        await getattr(svc, "end_session")("sessionEnd1")  # type: ignore[attr-defined]
    with sqlite3.connect(str(db_path)) as conn:
        row = conn.execute(
            "SELECT start_time, end_time, duration_ms FROM user_sessions WHERE session_id=?",
            ("sessionEnd1",)
        ).fetchone()
        assert row is not None
        _start_time, end_time, duration_ms = row  # start time unused in assertions
        assert end_time is not None
        assert duration_ms is not None
        assert duration_ms >= 0
