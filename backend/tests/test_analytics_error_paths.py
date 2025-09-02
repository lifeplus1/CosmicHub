import sqlite3
import pytest
from datetime import datetime, timezone
from pathlib import Path
from backend.analytics.custom_analytics import AnalyticsEvent, get_analytics_service

@pytest.mark.asyncio
async def test_invalid_event_type_handled(tmp_path: Path):
    db_path: Path = tmp_path / "analytics_error.db"
    svc = get_analytics_service(str(db_path))
    # Intentionally create an event with an unrecognized event string
    bad_event = AnalyticsEvent(
        event="UNKNOWN_EVENT",
        user_id="u1",
        session_id="sErr1",
        timestamp=int(datetime.now(tz=timezone.utc).timestamp()*1000),
        platform="web",
        properties={"foo":"bar"}
    )
    ok = await svc.track_event(bad_event)
    assert ok  # It should still insert; categorization may default
    with sqlite3.connect(str(db_path)) as conn:
        row = conn.execute("SELECT event_type FROM analytics_events WHERE session_id=?", ("sErr1",)).fetchone()
        assert row and row[0] == "UNKNOWN_EVENT"
