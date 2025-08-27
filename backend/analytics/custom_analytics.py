"""
Custom Analytics Backend System
Privacy-compliant analytics storage and processing for CosmicHub
"""

from datetime import datetime, timedelta
from typing import Dict, Optional, Any, Sequence, TypeVar
import json
from dataclasses import dataclass
from enum import Enum
import sqlite3
import time
import asyncio
import logging
# Removed unused 'os' import to satisfy lint/type checks

class EventType(Enum):
    CHART_CALCULATION = "chart_calculated"
    AI_INTERACTION = "ai_interaction"
    MOBILE_EVENT = "mobile_event"
    BUSINESS_EVENT = "business_event"
    PAGE_VIEW = "page_view"
    USER_ACTION = "user_action"

@dataclass
class AnalyticsEvent:
    event: str
    user_id: Optional[str]
    session_id: str
    timestamp: int
    platform: str
    properties: Dict[str, Any]

T = TypeVar('T')

logger = logging.getLogger(__name__)
logger.addHandler(logging.NullHandler())

class PrivacyCompliantAnalytics:
    """Thread-safe-ish lightweight analytics layer.

    NOTE: Uses sqlite3 sync driver; public async methods offload work via asyncio.to_thread
    to avoid blocking the event loop.
    """

    def __init__(self, db_path: str = "analytics.db"):
        self.db_path = db_path
        # Rolling window for response time metrics
        self._recent_response_times: list[int] = []
        self._max_response_samples = 500
        self.init_database()
    
    def init_database(self):
        """Initialize SQLite database with analytics tables and pragmas"""
        with sqlite3.connect(self.db_path) as conn:
            try:
                conn.execute("PRAGMA journal_mode=WAL;")
                conn.execute("PRAGMA synchronous=NORMAL;")
                conn.execute("PRAGMA temp_store=MEMORY;")
                conn.execute("PRAGMA cache_size=-16000;")  # ~16MB
            except Exception:
                pass
            conn.execute("""
                CREATE TABLE IF NOT EXISTS analytics_events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    event_type TEXT NOT NULL,
                    user_id TEXT,
                    session_id TEXT NOT NULL,
                    timestamp INTEGER NOT NULL,
                    platform TEXT NOT NULL,
                    properties TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            conn.execute("""
                CREATE TABLE IF NOT EXISTS user_sessions (
                    session_id TEXT PRIMARY KEY,
                    user_id TEXT,
                    start_time INTEGER NOT NULL,
                    end_time INTEGER,
                    platform TEXT NOT NULL,
                    page_views INTEGER DEFAULT 0,
                    events_count INTEGER DEFAULT 0,
                    last_event_time INTEGER,
                    total_duration_ms INTEGER DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            conn.execute("""
                CREATE TABLE IF NOT EXISTS daily_metrics (
                    date DATE PRIMARY KEY,
                    total_users INTEGER DEFAULT 0,
                    total_sessions INTEGER DEFAULT 0,
                    chart_calculations INTEGER DEFAULT 0,
                    ai_interactions INTEGER DEFAULT 0,
                    mobile_sessions INTEGER DEFAULT 0,
                    subscription_conversions INTEGER DEFAULT 0,
                    error_count INTEGER DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Create indexes for performance
            conn.execute("CREATE INDEX IF NOT EXISTS idx_events_timestamp ON analytics_events(timestamp)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_events_user_id ON analytics_events(user_id)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_events_session_id ON analytics_events(session_id)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id)")
            
            conn.commit()

    async def track_event(self, event: AnalyticsEvent) -> bool:
        """Store analytics event with privacy compliance (non-blocking)."""
        return await asyncio.to_thread(self._track_event_sync, event)

    def _track_event_sync(self, event: AnalyticsEvent) -> bool:
        try:
            event = self._anonymize_event(event)
            with sqlite3.connect(self.db_path, check_same_thread=False) as conn:
                conn.execute("PRAGMA journal_mode=WAL;")
                conn.execute(
                    """
                    INSERT INTO analytics_events 
                    (event_type, user_id, session_id, timestamp, platform, properties)
                    VALUES (?, ?, ?, ?, ?, ?)
                """,
                    (
                        event.event,
                        event.user_id,
                        event.session_id,
                        event.timestamp,
                        event.platform,
                        json.dumps(event.properties),
                    ),
                )
                self._update_session(conn, event)
                self._update_daily_metrics(conn, event)
                conn.commit()
            return True
        except Exception as e:  # pragma: no cover - defensive
            logger.error("Error tracking event", exc_info=e)
            return False

    def _anonymize_event(self, event: AnalyticsEvent) -> AnalyticsEvent:
        """Apply privacy rules to event data"""
        # Remove or hash sensitive data
        if 'ip_address' in event.properties:
            del event.properties['ip_address']
        
        if 'email' in event.properties:
            # Only store domain, not full email
            email = event.properties['email']
            if '@' in email:
                event.properties['email_domain'] = email.split('@')[1]
            del event.properties['email']
        
        return event

    def _update_session(self, conn: sqlite3.Connection, event: AnalyticsEvent):
        """Upsert session row and maintain rolling total duration (gaps >30m ignored)."""
        existing = conn.execute(
            "SELECT start_time, last_event_time, total_duration_ms FROM user_sessions WHERE session_id = ?",
            (event.session_id,)
        ).fetchone()
        total_duration_ms = 0
        if existing:
            _start_time, last_event_time, prev_total = existing  # _start_time unused
            if last_event_time:
                gap = event.timestamp - last_event_time
                if gap < 30 * 60 * 1000:  # <30m counts toward duration
                    total_duration_ms = (prev_total or 0) + gap
                else:
                    total_duration_ms = (prev_total or 0)
            else:
                total_duration_ms = prev_total or 0
        conn.execute(
            """
            INSERT INTO user_sessions (session_id, user_id, start_time, platform, page_views, events_count, last_event_time, total_duration_ms)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(session_id) DO UPDATE SET
                user_id=excluded.user_id,
                page_views=CASE WHEN excluded.page_views > user_sessions.page_views THEN excluded.page_views ELSE user_sessions.page_views END,
                events_count=user_sessions.events_count + 1,
                last_event_time=excluded.last_event_time,
                end_time=CASE WHEN excluded.last_event_time > COALESCE(user_sessions.end_time, 0) THEN excluded.last_event_time ELSE user_sessions.end_time END,
                total_duration_ms=?
            """,
            (
                event.session_id,
                event.user_id,
                event.timestamp,
                event.platform,
                1 if event.event == EventType.PAGE_VIEW.value else 0,
                1,
                event.timestamp,
                total_duration_ms,
                total_duration_ms,
            )
        )

    def _update_daily_metrics(self, conn: sqlite3.Connection, event: AnalyticsEvent):
        """Update daily aggregated metrics"""
        date = datetime.fromtimestamp(event.timestamp / 1000).date()
        
        # Get current metrics for the day
        result = conn.execute(
            "SELECT * FROM daily_metrics WHERE date = ?",
            (date,)
        ).fetchone()
        
        if result:
            # Update existing metrics
            updates: Dict[str, int] = {}
            if event.event == EventType.CHART_CALCULATION.value:
                updates['chart_calculations'] = (result[3] or 0) + 1
            elif event.event == EventType.AI_INTERACTION.value:
                updates['ai_interactions'] = (result[4] or 0) + 1
            elif event.event == EventType.MOBILE_EVENT.value:
                updates['mobile_sessions'] = (result[5] or 0) + 1
            elif 'subscription' in event.event:
                updates['subscription_conversions'] = (result[6] or 0) + 1
            elif 'error' in event.event:
                updates['error_count'] = (result[7] or 0) + 1
            
            if updates:
                set_clause = ', '.join(f"{k} = ?" for k in updates.keys())
                # Ensure parameter sequence is typed as Sequence[Any]
                values: Sequence[Any] = list(updates.values()) + [date]
                conn.execute(f"UPDATE daily_metrics SET {set_clause} WHERE date = ?", tuple(values))
        else:
            # Insert new daily metrics
            metrics = {
                'total_users': 1 if event.user_id else 0,
                'total_sessions': 0,
                'chart_calculations': 1 if event.event == EventType.CHART_CALCULATION.value else 0,
                'ai_interactions': 1 if event.event == EventType.AI_INTERACTION.value else 0,
                'mobile_sessions': 1 if event.event == EventType.MOBILE_EVENT.value else 0,
                'subscription_conversions': 1 if 'subscription' in event.event else 0,
                'error_count': 1 if 'error' in event.event else 0,
            }
            
            conn.execute("""
                INSERT INTO daily_metrics 
                (date, total_users, total_sessions, chart_calculations, 
                 ai_interactions, mobile_sessions, subscription_conversions, error_count)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (date, *metrics.values()))

    async def get_real_time_metrics(self) -> Dict[str, Any]:
        """Get current real-time metrics"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                # Active users in last hour
                hour_ago = int((datetime.now() - timedelta(hours=1)).timestamp() * 1000)
                
                active_users = conn.execute("""
                    SELECT COUNT(DISTINCT user_id) FROM analytics_events 
                    WHERE timestamp > ? AND user_id IS NOT NULL
                """, (hour_ago,)).fetchone()[0] or 0
                
                # Chart calculations per minute (last 10 minutes)
                ten_min_ago = int((datetime.now() - timedelta(minutes=10)).timestamp() * 1000)
                
                chart_calculations = conn.execute("""
                    SELECT COUNT(*) FROM analytics_events 
                    WHERE timestamp > ? AND event_type = ?
                """, (ten_min_ago, EventType.CHART_CALCULATION.value)).fetchone()[0] or 0
                
                # AI interactions per hour
                ai_interactions = conn.execute("""
                    SELECT COUNT(*) FROM analytics_events 
                    WHERE timestamp > ? AND event_type = ?
                """, (hour_ago, EventType.AI_INTERACTION.value)).fetchone()[0] or 0
                
                # Mobile app sessions today
                today_start = int(datetime.now().replace(hour=0, minute=0, second=0, microsecond=0).timestamp() * 1000)
                
                mobile_sessions = conn.execute("""
                    SELECT COUNT(DISTINCT session_id) FROM analytics_events 
                    WHERE timestamp > ? AND platform IN ('mobile', 'pwa')
                """, (today_start,)).fetchone()[0] or 0
                
                # Error rate (last hour)
                total_events = conn.execute("""
                    SELECT COUNT(*) FROM analytics_events WHERE timestamp > ?
                """, (hour_ago,)).fetchone()[0] or 1
                
                error_events = conn.execute("""
                    SELECT COUNT(*) FROM analytics_events 
                    WHERE timestamp > ? AND event_type LIKE '%error%'
                """, (hour_ago,)).fetchone()[0] or 0
                
                # Average session duration (recent sessions today)
                avg_session_duration = conn.execute(
                    """
                    SELECT AVG(total_duration_ms) FROM (
                        SELECT total_duration_ms FROM user_sessions
                        WHERE last_event_time > ? AND total_duration_ms > 0
                        ORDER BY last_event_time DESC LIMIT 100
                    )
                    """,
                    (today_start,)
                ).fetchone()[0] or 0

                avg_response_time = 0
                if self._recent_response_times:
                    avg_response_time = sum(self._recent_response_times) / len(self._recent_response_times)

                return {
                    'realTimeUsers': active_users,
                    'chartCalculationsPerMinute': chart_calculations,
                    'aiInteractionsPerHour': ai_interactions,
                    'mobileAppSessions': mobile_sessions,
                    'subscriptionConversions': 0,  # Placeholder
                    'errorRate': error_events / total_events,
                    'averageResponseTime': avg_response_time,
                    'averageSessionDurationMs': avg_session_duration
                }
        except Exception as e:
            logger.error("Error getting real-time metrics", exc_info=e)
            return {
                'realTimeUsers': 0,
                'chartCalculationsPerMinute': 0,
                'aiInteractionsPerHour': 0,
                'mobileAppSessions': 0,
                'subscriptionConversions': 0,
                'errorRate': 0.0,
                'averageResponseTime': 0,
                'averageSessionDurationMs': 0
            }

    async def get_astrology_analytics(self, timeframe: str = 'week') -> Dict[str, Any]:
        """Get astrology-specific analytics"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                # Calculate timeframe
                if timeframe == 'day':
                    since = int((datetime.now() - timedelta(days=1)).timestamp() * 1000)
                elif timeframe == 'week':
                    since = int((datetime.now() - timedelta(weeks=1)).timestamp() * 1000)
                elif timeframe == 'month':
                    since = int((datetime.now() - timedelta(days=30)).timestamp() * 1000)
                else:  # year
                    since = int((datetime.now() - timedelta(days=365)).timestamp() * 1000)
                
                # Chart calculations by type
                chart_calculations: Dict[str, int] = {}
                for chart_type in ['natal', 'transit', 'synastry', 'composite', 'solar_return']:
                    count = conn.execute("""
                        SELECT COUNT(*) FROM analytics_events 
                        WHERE timestamp > ? AND event_type = ? 
                        AND JSON_EXTRACT(properties, '$.chart_type') = ?
                    """, (since, EventType.CHART_CALCULATION.value, chart_type)).fetchone()[0] or 0
                    chart_calculations[chart_type] = count
                
                # AI feature usage
                ai_features: Dict[str, int] = {}
                for feature in ['predictiveTransits', 'aiQuestions', 'multiSystemSynthesis', 'growthCoaching', 'patternRecognition']:
                    count = conn.execute("""
                        SELECT COUNT(*) FROM analytics_events 
                        WHERE timestamp > ? AND event_type = ? 
                        AND JSON_EXTRACT(properties, '$.feature') = ?
                    """, (since, EventType.AI_INTERACTION.value, feature)).fetchone()[0] or 0
                    ai_features[feature] = count
                # Average session duration over timeframe (exclude zero durations)
                avg_session_duration = conn.execute(
                    """
                    SELECT AVG(total_duration_ms) FROM user_sessions
                    WHERE last_event_time > ? AND total_duration_ms > 0
                    """,
                    (since,)
                ).fetchone()[0] or 0
                
                return {
                    'chartCalculations': chart_calculations,
                    'aiFeatureUsage': ai_features,
                    'userPreferences': {
                        'favoriteChartTypes': ['natal'],  # Would calculate from actual data
                        'preferredAstrologySystem': 'western',
                        'aiInteractionFrequency': sum(ai_features.values()),
                        'averageSessionDuration': avg_session_duration
                    }
                }
        except Exception as e:
            logger.error("Error getting astrology analytics", exc_info=e)
            return {
                'chartCalculations': {
                    'natal': 0, 'transit': 0, 'synastry': 0, 
                    'composite': 0, 'solar_return': 0
                },
                'aiFeatureUsage': {
                    'predictiveTransits': 0, 'aiQuestions': 0, 
                    'multiSystemSynthesis': 0, 'growthCoaching': 0, 
                    'patternRecognition': 0
                },
                'userPreferences': {
                    'favoriteChartTypes': [],
                    'preferredAstrologySystem': 'western',
                    'aiInteractionFrequency': 0,
                    'averageSessionDuration': 0
                }
            }

    async def cleanup_old_data(self, retention_days: int = 365):
        """Clean up old analytics data according to privacy policy"""
        cutoff = int((datetime.now() - timedelta(days=retention_days)).timestamp() * 1000)
        
        with sqlite3.connect(self.db_path) as conn:
            # Delete old events
            deleted_events = conn.execute(
                "DELETE FROM analytics_events WHERE timestamp < ?", 
                (cutoff,)
            ).rowcount
            
            # Delete old sessions
            deleted_sessions = conn.execute(
                "DELETE FROM user_sessions WHERE start_time < ?", 
                (cutoff,)
            ).rowcount
            
            conn.commit()
            
            logger.info("Cleaned up %s old events and %s old sessions", deleted_events, deleted_sessions)

    # --- Session management ---
    async def end_session(self, session_id: str) -> bool:
        """Mark a session as ended and finalize duration.

        If total_duration_ms already tracked incrementally, we keep it; otherwise we compute
        a simple (last_event_time - start_time) if both are present.
        """
        return await asyncio.to_thread(self._end_session_sync, session_id)

    def _end_session_sync(self, session_id: str) -> bool:
        try:
            with sqlite3.connect(self.db_path, check_same_thread=False) as conn:
                row = conn.execute(
                    "SELECT start_time, end_time, last_event_time, total_duration_ms FROM user_sessions WHERE session_id = ?",
                    (session_id,)
                ).fetchone()
                if not row:
                    return False
                start_time, end_time, last_event_time, total_duration_ms = row
                # If already ended, nothing to do
                if end_time:
                    return True
                now_ms = int(time.time() * 1000)
                final_end = last_event_time or now_ms
                if total_duration_ms is None or total_duration_ms == 0:
                    if start_time and final_end and final_end >= start_time:
                        total_duration_ms = final_end - start_time
                    else:
                        total_duration_ms = 0
                conn.execute(
                    "UPDATE user_sessions SET end_time = ?, total_duration_ms = ? WHERE session_id = ?",
                    (final_end, total_duration_ms, session_id)
                )
                conn.commit()
                return True
        except Exception as e:  # pragma: no cover - defensive
            logger.error("Error ending session", exc_info=e)
            return False

    # --- Performance instrumentation helper ---
    def record_response_time(self, duration_ms: int):
        """Record an API response time (ms) into rolling window."""
        self._recent_response_times.append(int(duration_ms))
        if len(self._recent_response_times) > self._max_response_samples:
            self._recent_response_times = self._recent_response_times[-self._max_response_samples:]

    def get_daily_metrics(self, date: Optional[str] = None) -> Dict[str, Any]:
        """Fetch aggregated daily metrics row as dict."""
        if not date:
            date = datetime.now().astimezone().date().isoformat()
        with sqlite3.connect(self.db_path) as conn:
            row = conn.execute("SELECT * FROM daily_metrics WHERE date = ?", (date,)).fetchone()
            if not row:
                return {}
            return {
                'date': row[0],
                'total_users': row[1],
                'total_sessions': row[2],
                'chart_calculations': row[3],
                'ai_interactions': row[4],
                'mobile_sessions': row[5],
                'subscription_conversions': row[6],
                'error_count': row[7],
                'created_at': row[8]
            }

    def delete_user_data(self, user_id: str) -> Dict[str, Any]:
        """Delete/anonymize all user-related analytics data (GDPR)."""
        with sqlite3.connect(self.db_path) as conn:
            events_deleted = conn.execute("DELETE FROM analytics_events WHERE user_id = ?", (user_id,)).rowcount
            sessions_deleted = conn.execute("DELETE FROM user_sessions WHERE user_id = ?", (user_id,)).rowcount
            conn.commit()
        return {'eventsDeleted': events_deleted, 'sessionsDeleted': sessions_deleted}

# Singleton instance
_analytics_instance: Optional[PrivacyCompliantAnalytics] = None

def get_analytics_service(db_path: str = "analytics.db") -> PrivacyCompliantAnalytics:
    global _analytics_instance
    if _analytics_instance is None or (_analytics_instance and _analytics_instance.db_path != db_path):
        _analytics_instance = PrivacyCompliantAnalytics(db_path)
    return _analytics_instance

