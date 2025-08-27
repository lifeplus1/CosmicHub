import os
import sqlite3
from datetime import datetime, timezone
from typing import Dict, Any, Optional, cast
from pathlib import Path
from backend.analytics.custom_analytics import AnalyticsEvent, EventType, get_analytics_service

DB_FILE = "test_analytics_tmp.db"

async def _track_sample(event_type: EventType, properties: Optional[Dict[str, Any]] = None):
    svc = get_analytics_service(DB_FILE)  # uses singleton with test db name
    ev = AnalyticsEvent(
        event=event_type.value,
        user_id="user123",
        session_id="sessA",
        timestamp=int(datetime.now(tz=timezone.utc).timestamp() * 1000),
        platform="web",
        properties=properties or {"chart_type": "natal"}
    )
    ok = await svc.track_event(ev)
    assert ok

async def test_track_and_metrics(tmp_path):  # type: ignore[override]
    tmp: Path = cast(Path, tmp_path)
    db_path = tmp / DB_FILE
    # ensure fresh singleton for isolated test DB
    if db_path.exists():
        os.remove(str(db_path))
    svc = get_analytics_service(str(db_path))

    await _track_sample(EventType.CHART_CALCULATION)
    await _track_sample(EventType.AI_INTERACTION, {"feature": "aiQuestions"})

    metrics = await svc.get_real_time_metrics()
    assert metrics["realTimeUsers"] >= 1
    astro = await svc.get_astrology_analytics("day")
    assert astro["chartCalculations"]["natal"] >= 1

    # DB row existence sanity
    with sqlite3.connect(str(db_path)) as conn:
        cnt = conn.execute("SELECT COUNT(*) FROM analytics_events").fetchone()[0]
        assert cnt >= 2
