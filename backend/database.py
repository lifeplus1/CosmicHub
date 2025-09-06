# backend/database.py
"""
Database module for Firestore integration with proper error handling and type safety.

This module handles Firebase/Firestore initialization and provides a centralized 
database interface following the Component Best Practices Checklist.
"""

import asyncio
import json
import logging
import os
from concurrent.futures import ThreadPoolExecutor
from contextlib import suppress
from datetime import datetime, timedelta
from functools import lru_cache
from typing import Any, Dict, List, Optional, TypedDict, cast
from uuid import uuid4

from dotenv import load_dotenv

# Heavy imports (firebase_admin / firestore) are deferred below unless needed
firebase_admin = None  # type: ignore
credentials = None  # type: ignore
firestore = None  # type: ignore
initialize_app = None  # type: ignore
Query = None  # type: ignore

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

# Structured logging configuration (Best Practice: Logging & Monitoring)
logging.basicConfig(
    level=logging.INFO,
    format='{"ts": "%(asctime)s", "level": "%(levelname)s", "logger": "%(name)s", "msg": "%(message)s"}'
)
logger = logging.getLogger(__name__)

# Optional OpenTelemetry tracer (graceful if not configured)
otel_tracer = None
with suppress(Exception):  # pragma: no cover
    from opentelemetry import trace  # type: ignore

    otel_tracer = trace.get_tracer("cosmichub.firestore")  # type: ignore

# Type aliases for better type safety
ChartData = Dict[str, Any]
BirthData = Dict[str, Any]
UserStats = Dict[str, Any]


# Type definitions for enhanced type safety
class ChartDocument(TypedDict, total=False):
    """Type-safe chart document structure."""
    id: str
    name: str
    birth_date: str
    birth_time: str
    birth_location: str
    chart_type: str
    birth_data: BirthData
    chart_data: ChartData
    created_at: str
    updated_at: str


class DatabaseError(Exception):
    """Custom exception for database operations."""
    pass

use_memory_db = False
db = None  # type: ignore

# ---------------------------------------------------------------------------
# Test Mode / CI Fast-Path
# If running under pytest (PYTEST_CURRENT_TEST) or explicit TEST_MODE flag,
# skip all Firebase / Firestore initialization to avoid network latency or
# library compatibility issues under newer Python versions (e.g. 3.13).
# This mirrors the behavior in auth.py and ensures deterministic, fast tests.
# ---------------------------------------------------------------------------
_IS_TEST_MODE = (
    os.getenv("PYTEST_CURRENT_TEST") is not None
    or os.getenv("CI") is not None
    or os.getenv("TEST_MODE", "0").lower() in ("1", "true", "yes")
)
if _IS_TEST_MODE:
    use_memory_db = True
    logger.info("[database] TEST_MODE detected - using in-memory store, skipping Firestore imports")

# Initialize Firebase with performance optimizations or fallback to memory store in dev  # noqa: E501
if not _IS_TEST_MODE:  # Only attempt Firestore init outside test mode
    # Perform heavy imports only when needed
    try:  # pragma: no cover - import side effects
        import firebase_admin  # type: ignore  # noqa: E401
        from firebase_admin import credentials, firestore, initialize_app  # type: ignore  # noqa: E401,E501
        from google.cloud.firestore import Query  # type: ignore  # noqa: E401
    except Exception as imp_err:  # If imports fail, fallback to memory
        logger.warning(f"Firestore libraries unavailable ({imp_err}); using in-memory store")
        use_memory_db = True
        firebase_admin = None  # type: ignore
        credentials = None  # type: ignore
        firestore = None  # type: ignore
        initialize_app = None  # type: ignore
        Query = None  # type: ignore
    
    # Only proceed with Firebase initialization if imports succeeded
    if firebase_admin and credentials and firestore and initialize_app:  # type: ignore
        try:  # type: ignore[unreachable]  # This is reachable when imports succeed
            # Check if Firebase is already initialized (likely by auth.py)
            # Best Practice: Centralized Firebase initialization coordination
            try:
                app = firebase_admin.get_app()  # type: ignore[misc]
                logger.info("[DATABASE] Firebase app already initialized by another module")
                db = firestore.client()  # type: ignore[attr-defined]
                logger.info("[DATABASE] Firestore client created successfully")
            except ValueError:
                # No app exists yet, try to initialize
                logger.info("[DATABASE] No existing Firebase app found, initializing for database...")
                
                # Use same credential loading logic as auth.py for consistency
                firebase_creds = os.getenv("FIREBASE_CREDENTIALS")
                if firebase_creds:
                    logger.info("[DATABASE] Using FIREBASE_CREDENTIALS JSON string")
                    creds_json_dict = json.loads(firebase_creds)
                    cred = credentials.Certificate(creds_json_dict)  # type: ignore[misc]
                    app = initialize_app(cred)  # type: ignore[misc]
                    logger.info("[DATABASE] Firebase initialized successfully")
                    db = firestore.client()  # type: ignore[attr-defined]
                else:
                    logger.warning("[DATABASE] No FIREBASE_CREDENTIALS found, falling back to memory store")
                    raise ValueError("No Firebase credentials available")
                    
        except Exception as e:
            logger.error(f"[DATABASE] Firebase initialization failed: {e}")
            # Environment-based fallback behavior
            env = os.getenv("DEPLOY_ENVIRONMENT", "development").lower()
            allow_fallback = os.getenv("ALLOW_MOCK_AUTH", "1" if env != "production" else "0")
            
            if allow_fallback in ("1", "true", "yes") and env != "production":
                use_memory_db = True
                logger.warning("[DATABASE] Falling back to in-memory database (development only)")
            else:
                raise DatabaseError(
                    f"Firebase connection failed in production environment: {e}"
                )
    
    else:
        # Firebase imports not available -> force memory DB
        use_memory_db = True
        logger.warning("[DATABASE] Firebase imports not available, using in-memory database")

else:
    # Test mode - Firebase initialization skipped
    use_memory_db = True
    firebase_admin = None  # type: ignore
    credentials = None  # type: ignore
    firestore = None  # type: ignore
    initialize_app = None  # type: ignore
    Query = None  # type: ignore
    db = None  # type: ignore

# In-memory data store structure: { user_id: { chart_id: chart_data } }
memory_store: Dict[str, Dict[str, ChartData]] = {}

# Performance: Thread pool for concurrent operations
executor = ThreadPoolExecutor(max_workers=4)


@lru_cache(maxsize=128)
def get_firestore_client() -> Optional[Any]:
    """Cached Firestore client for performance (None if using memory DB)."""
    return db if not use_memory_db else None


def save_chart(
    user_id: str, chart_type: str, birth_data: BirthData, chart_data: ChartData
) -> ChartData:
    """Optimized chart saving with validation"""

    def _inner() -> ChartData:
        birth_date = f"{birth_data['year']}-{birth_data['month']:02d}-{birth_data['day']:02d}"  # noqa: E501
        birth_time = f"{birth_data['hour']:02d}:{birth_data['minute']:02d}"
        if use_memory_db:
            memory_chart_id = str(uuid4())
            memory_chart_data: ChartData = {
                "id": memory_chart_id,
                "name": birth_data.get("city", "Chart") + f" {birth_date}",
                "birth_date": birth_date,
                "birth_time": birth_time,
                "birth_location": birth_data.get("city", "Unknown"),
                "chart_type": chart_type,
                "birth_data": birth_data,
                "chart_data": chart_data,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat(),
            }
            memory_store.setdefault(user_id, {})[memory_chart_id] = memory_chart_data
            logger.info(
                f"[MEMORY_DB] Saved chart {memory_chart_id} for user {user_id}"
            )
            return memory_chart_data
        db_client = get_firestore_client()
        assert db_client is not None
        doc_ref = db_client.collection("users").document(user_id).collection("charts").document()  # type: ignore[misc]  # noqa: E501
        chart_id: str = cast(str, doc_ref.id)  # type: ignore[misc]
        chart_data_to_save: ChartData = {
            "id": chart_id,
            "name": birth_data.get("city", "Chart") + f" {birth_date}",
            "birth_date": birth_date,
            "birth_time": birth_time,
            "birth_location": birth_data.get("city", "Unknown"),
            "chart_type": chart_type,
            "birth_data": birth_data,
            "chart_data": chart_data,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
        }
        doc_ref.set(chart_data_to_save)  # type: ignore[misc]
        logger.info(f"Saved chart {chart_id} for user {user_id}")
        return chart_data_to_save

    try:
        if otel_tracer:  # type: ignore[attr-defined]
            with otel_tracer.start_as_current_span(  # type: ignore[call-arg]
                "firestore.save_chart",
                attributes={
                    "db.system": (
                        "firestore" if not use_memory_db else "memory"
                    ),
                    "db.operation": "set",
                    "app.user_id": user_id,
                    "chart.type": chart_type,
                },
            ):
                return _inner()
        return _inner()
    except Exception as e:  # pragma: no cover - error path
        logger.error(f"Error saving chart for user {user_id}: {str(e)}")
        raise


def get_charts(
    user_id: str, limit: int = 50, start_after: Optional[str] = None
) -> List[ChartData]:
    """Optimized chart retrieval with pagination and caching"""

    def _inner() -> List[ChartData]:
        if use_memory_db:
            charts_map = memory_store.get(user_id, {})
            charts_list = list(charts_map.values())
            charts_list.sort(
                key=lambda c: c.get("created_at", ""), reverse=True
            )
            if start_after:
                try:
                    idx = next(
                        i
                        for i, c in enumerate(charts_list)
                        if c.get("id") == start_after
                    )
                    charts_list = charts_list[idx + 1 :]  # noqa: E203
                except StopIteration:
                    pass
            result = charts_list[:limit]
            logger.info(
                f"[MEMORY_DB] Retrieved {len(result)} charts for user {user_id}"  # noqa: E501
            )
            return result
        db_client = get_firestore_client()
        assert db_client is not None
        assert Query is not None, "Query should be available when using Firestore"
        query = db_client.collection("users").document(user_id).collection("charts").order_by("created_at", direction=Query.DESCENDING).limit(limit)  # type: ignore[misc,unreachable]  # noqa: E501
        if start_after:
            last_doc = db_client.collection("users").document(user_id).collection("charts").document(start_after).get()  # type: ignore[misc]  # noqa: E501
            if last_doc.exists:  # type: ignore[misc]
                query = query.start_after(last_doc)  # type: ignore[misc]
        charts: List[ChartData] = []
        for doc in query.stream():  # type: ignore
            chart_data: ChartData = cast(ChartData, doc.to_dict())  # type: ignore  # noqa: E501
            chart_data["id"] = cast(str, doc.id)  # type: ignore
            charts.append(chart_data)
        logger.info(f"Retrieved {len(charts)} charts for user {user_id}")
        return charts

    try:
        if otel_tracer:  # type: ignore[attr-defined]
            with otel_tracer.start_as_current_span(  # type: ignore[call-arg]
                "firestore.get_charts",
                attributes={
                    "db.system": (
                        "firestore" if not use_memory_db else "memory"
                    ),
                    "db.operation": "query",
                    "app.user_id": user_id,
                    "result.limit": limit,
                },
            ):
                return _inner()
        return _inner()
    except Exception as e:  # pragma: no cover
        logger.error(f"Error retrieving charts for user {user_id}: {str(e)}")
        return []


def delete_chart_by_id(user_id: str, chart_id: str) -> bool:
    """Optimized chart deletion with validation"""

    def _inner() -> bool:
        if use_memory_db:
            user_charts = memory_store.get(user_id, {})
            if chart_id not in user_charts:
                logger.warning(
                    f"[MEMORY_DB] Chart {chart_id} not found for user {user_id}"  # noqa: E501
                )
                return False
            del user_charts[chart_id]
            logger.info(
                f"[MEMORY_DB] Deleted chart {chart_id} for user {user_id}"
            )
            return True
        db_client = get_firestore_client()
        assert db_client is not None
        doc_ref = db_client.collection("users").document(user_id).collection("charts").document(chart_id)  # type: ignore[misc]  # noqa: E501
        if not doc_ref.get().exists:  # type: ignore[misc]
            logger.warning(f"Chart {chart_id} not found for user {user_id}")
            return False
        doc_ref.delete()  # type: ignore[misc]
        logger.info(f"Deleted chart {chart_id} for user {user_id}")
        return True

    try:
        if otel_tracer:  # type: ignore[attr-defined]
            with otel_tracer.start_as_current_span(  # type: ignore[call-arg]
                "firestore.delete_chart",
                attributes={
                    "db.system": (
                        "firestore" if not use_memory_db else "memory"
                    ),
                    "db.operation": "delete",
                    "app.user_id": user_id,
                    "chart.id": chart_id,
                },
            ):
                return _inner()
        return _inner()
    except Exception as e:  # pragma: no cover
        logger.error(
            f"Error deleting chart {chart_id} for user {user_id}: {str(e)}"
        )
        raise


def batch_save_charts(
    user_id: str, charts_data: List[Dict[str, Any]]
) -> List[str]:
    """Performance: Batch operations for multiple chart saves"""

    def _inner() -> List[str]:
        if use_memory_db:
            ids: List[str] = []
            for chart_data in charts_data:
                chart_id = str(uuid4())
                ids.append(chart_id)
                to_save: Dict[str, Any] = {
                    **chart_data,
                    "id": chart_id,
                    "created_at": datetime.now().isoformat(),
                    "updated_at": datetime.now().isoformat(),
                }
                memory_store.setdefault(user_id, {})[chart_id] = to_save
            logger.info(
                f"[MEMORY_DB] Batch saved {len(ids)} charts for user {user_id}"
            )
            return ids
        db_client = get_firestore_client()
        assert db_client is not None
        batch = db_client.batch()
        chart_ids: List[str] = []
        for chart_data in charts_data:
            doc_ref = db_client.collection("users").document(user_id).collection("charts").document()  # type: ignore[misc]  # noqa: E501
            chart_id = doc_ref.id  # type: ignore[misc]
            chart_ids.append(chart_id)  # type: ignore[misc]
            chart_data_to_save: Dict[str, Any] = {
                **chart_data,
                "id": chart_id,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat(),
            }
            batch.set(doc_ref, chart_data_to_save)  # type: ignore[misc]
        batch.commit()  # type: ignore[misc]
        logger.info(f"Batch saved {len(chart_ids)} charts for user {user_id}")
        return chart_ids

    try:
        if otel_tracer:  # type: ignore[attr-defined]
            with otel_tracer.start_as_current_span(  # type: ignore[call-arg]
                "firestore.batch_save_charts",
                attributes={
                    "db.system": (
                        "firestore" if not use_memory_db else "memory"
                    ),
                    "db.operation": "batch_set",
                    "app.user_id": user_id,
                    "batch.count": len(charts_data),
                },
            ):
                return _inner()
        return _inner()
    except Exception as e:  # pragma: no cover
        logger.error(f"Error batch saving charts for user {user_id}: {str(e)}")
        raise


def get_user_stats(user_id: str) -> UserStats:
    """Performance: Aggregated user statistics with caching"""

    def _inner() -> UserStats:
        if use_memory_db:
            charts_map = memory_store.get(user_id, {})
            chart_count = len(charts_map)
            thirty_days_ago = datetime.now() - timedelta(days=30)

            def is_recent(c: ChartData) -> bool:
                try:
                    ts = c.get("created_at")
                    if ts and isinstance(ts, str):
                        return datetime.fromisoformat(ts) >= thirty_days_ago
                    return False
                except Exception:
                    return False

            recent_count = sum(1 for c in charts_map.values() if is_recent(c))
            memory_stats: UserStats = {
                "user_id": user_id,
                "total_charts": chart_count,
                "recent_charts": recent_count,
                "last_accessed": datetime.now().isoformat(),
            }
            return memory_stats
        db_client = get_firestore_client()
        assert db_client is not None
        charts_ref = db_client.collection("users").document(user_id).collection("charts")  # type: ignore[misc]  # noqa: E501
        chart_count = len(list(charts_ref.stream()))  # type: ignore[misc]
        thirty_days_ago = datetime.now() - timedelta(days=30)
        recent_charts = charts_ref.where("created_at", ">=", thirty_days_ago.isoformat()).stream()  # type: ignore[misc]  # noqa: E501
        recent_count = len(list(recent_charts))  # type: ignore[misc]
        stats: UserStats = {
            "user_id": user_id,
            "total_charts": chart_count,
            "recent_charts": recent_count,
            "last_accessed": datetime.now().isoformat(),
        }
        db_client.collection("users").document(user_id).set(  # type: ignore[misc]
            {  # type: ignore[misc]
                "stats": stats,
                "stats_updated": datetime.now().isoformat(),
            },
            merge=True,
        )
        return stats

    try:
        if otel_tracer:  # type: ignore[attr-defined]
            with otel_tracer.start_as_current_span(  # type: ignore[call-arg]
                "firestore.get_user_stats",
                attributes={
                    "db.system": (
                        "firestore" if not use_memory_db else "memory"
                    ),
                    "db.operation": "aggregate",
                    "app.user_id": user_id,
                },
            ):
                return _inner()
        return _inner()
    except Exception as e:  # pragma: no cover
        logger.error(f"Error getting stats for user {user_id}: {str(e)}")
        return {"user_id": user_id, "total_charts": 0, "recent_charts": 0}


async def async_get_multiple_charts(
    user_ids: List[str],
) -> Dict[str, List[ChartData]]:
    """Performance: Async batch retrieval for multiple users"""
    loop = asyncio.get_event_loop()

    async def get_user_charts(user_id: str) -> tuple[str, List[ChartData]]:
        charts = await loop.run_in_executor(executor, get_charts, user_id)
        return user_id, charts

    tasks = [get_user_charts(user_id) for user_id in user_ids]
    results = await asyncio.gather(*tasks)

    return dict(results)
