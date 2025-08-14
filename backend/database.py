# backend/database.py
import os
import logging
from datetime import datetime, timedelta
import json
from uuid import uuid4
import firebase_admin
from firebase_admin import credentials, initialize_app, firestore # type: ignore
from google.cloud.firestore import Query  # type: ignore
from dotenv import load_dotenv
from typing import List, Dict, Any, Optional, cast
from functools import lru_cache
import asyncio
from concurrent.futures import ThreadPoolExecutor

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

logger = logging.getLogger(__name__)

# Type aliases for better type safety
ChartData = Dict[str, Any]
BirthData = Dict[str, Any]
UserStats = Dict[str, Any]

use_memory_db = False
db = None  # type: ignore

# Initialize Firebase with performance optimizations or fallback to memory store in dev
try:
    try:
        firebase_admin.get_app()  # type: ignore[misc]
        logger.info("Firebase app already initialized")
        db = firestore.client()
    except ValueError:
        # Prefer FIREBASE_CREDENTIALS JSON if available (matches auth.py)
        creds_json = os.getenv("FIREBASE_CREDENTIALS")
        if creds_json:
            try:
                cred_dict = json.loads(creds_json)
                cred = credentials.Certificate(cred_dict)  # type: ignore[misc]
                initialize_app(cred)
                logger.info("Firebase app initialized successfully via FIREBASE_CREDENTIALS JSON")
                db = firestore.client()
            except Exception as e:
                logger.error(f"Failed to initialize Firebase from FIREBASE_CREDENTIALS: {e}")
                raise
        else:
            private_key = os.getenv("FIREBASE_PRIVATE_KEY")
            if private_key:
                cred = credentials.Certificate({  # type: ignore[misc]
                    "type": "service_account",
                    "project_id": os.getenv("FIREBASE_PROJECT_ID"),
                    "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID"),
                    "private_key": private_key.replace("\\n", "\n"),
                    "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
                    "client_id": os.getenv("FIREBASE_CLIENT_ID"),
                    "auth_uri": os.getenv("FIREBASE_AUTH_URI"),
                    "token_uri": os.getenv("FIREBASE_TOKEN_URI"),
                    "auth_provider_x509_cert_url": os.getenv("FIREBASE_AUTH_PROVIDER_X509_CERT_URL"),
                    "client_x509_cert_url": os.getenv("FIREBASE_CLIENT_X509_CERT_URL"),
                    "universe_domain": os.getenv("FIREBASE_UNIVERSE_DOMAIN")
                })
                initialize_app(cred)
                logger.info("Firebase app initialized successfully")
                db = firestore.client()
            else:
                # No credentials available
                env = os.getenv("DEPLOY_ENVIRONMENT", "development").lower()
                allow_mock = os.getenv("ALLOW_MOCK_AUTH", "1" if env != "production" else "0")
                if allow_mock in ("1", "true", "yes") and env != "production":
                    use_memory_db = True
                    logger.warning("Firestore credentials not found. Using in-memory database (development only).")
                else:
                    raise ValueError("FIREBASE_PRIVATE_KEY not set")
except Exception as e:
    # If anything unexpected happens, only allow fallback in non-production
    env = os.getenv("DEPLOY_ENVIRONMENT", "development").lower()
    if env != "production":
        use_memory_db = True
        logger.warning(f"Falling back to in-memory database due to error: {str(e)}")
    else:
        logger.error(f"Firebase initialization failed: {str(e)}")
        raise

# In-memory data store structure: { user_id: { chart_id: chart_data } }
memory_store: Dict[str, Dict[str, ChartData]] = {}

# Performance: Thread pool for concurrent operations
executor = ThreadPoolExecutor(max_workers=4)

@lru_cache(maxsize=128)
def get_firestore_client():
    """Cached Firestore client for performance (None if using memory DB)."""
    return db if not use_memory_db else None

def save_chart(user_id: str, chart_type: str, birth_data: BirthData, chart_data: ChartData) -> ChartData:
    """Optimized chart saving with validation"""
    try:
        birth_date = f"{birth_data['year']}-{birth_data['month']:02d}-{birth_data['day']:02d}"
        birth_time = f"{birth_data['hour']:02d}:{birth_data['minute']:02d}"
        if use_memory_db:
            chart_id = str(uuid4())
            chart_data_to_save: ChartData = {
                "id": chart_id,
                "name": birth_data.get('city', 'Chart') + f" {birth_date}",
                "birth_date": birth_date,
                "birth_time": birth_time,
                "birth_location": birth_data.get('city', 'Unknown'),
                "chart_type": chart_type,
                "birth_data": birth_data,
                "chart_data": chart_data,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            }
            memory_store.setdefault(user_id, {})[chart_id] = chart_data_to_save
            logger.info(f"[MEMORY_DB] Saved chart {chart_id} for user {user_id}")
            return chart_data_to_save
        else:
            db_client = get_firestore_client()
            assert db_client is not None
            doc_ref = db_client.collection("users").document(user_id).collection("charts").document()  # type: ignore[misc]
            chart_id: str = cast(str, doc_ref.id)  # type: ignore[misc]
            chart_data_to_save: ChartData = {
                "id": chart_id,
                "name": birth_data.get('city', 'Chart') + f" {birth_date}",
                "birth_date": birth_date,
                "birth_time": birth_time,
                "birth_location": birth_data.get('city', 'Unknown'),
                "chart_type": chart_type,
                "birth_data": birth_data,
                "chart_data": chart_data,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            }
            doc_ref.set(chart_data_to_save)  # type: ignore[misc]
            logger.info(f"Saved chart {chart_id} for user {user_id}")
            return chart_data_to_save
    except Exception as e:
        logger.error(f"Error saving chart for user {user_id}: {str(e)}")
        raise

def get_charts(user_id: str, limit: int = 50, start_after: Optional[str] = None) -> List[ChartData]:
    """Optimized chart retrieval with pagination and caching"""
    try:
        if use_memory_db:
            charts_map = memory_store.get(user_id, {})
            charts_list = list(charts_map.values())
            charts_list.sort(key=lambda c: c.get('created_at', ''), reverse=True)
            if start_after:
                # naive pagination: drop until start_after id
                try:
                    idx = next(i for i, c in enumerate(charts_list) if c.get('id') == start_after)
                    charts_list = charts_list[idx+1:]
                except StopIteration:
                    pass
            result = charts_list[:limit]
            logger.info(f"[MEMORY_DB] Retrieved {len(result)} charts for user {user_id}")
            return result
        else:
            db_client = get_firestore_client()
            assert db_client is not None
            query = db_client.collection("users").document(user_id).collection("charts").order_by("created_at", direction=Query.DESCENDING).limit(limit)  # type: ignore[misc]
            if start_after:
                last_doc = db_client.collection("users").document(user_id).collection("charts").document(start_after).get()  # type: ignore[misc]
                if last_doc.exists:  # type: ignore[misc]
                    query = query.start_after(last_doc)  # type: ignore[misc]
            charts: List[ChartData] = []
            for doc in query.stream():  # type: ignore
                chart_data: ChartData = cast(ChartData, doc.to_dict())  # type: ignore
                chart_data['id'] = cast(str, doc.id)  # type: ignore
                charts.append(chart_data)
            logger.info(f"Retrieved {len(charts)} charts for user {user_id}")
            return charts
    except Exception as e:
        logger.error(f"Error retrieving charts for user {user_id}: {str(e)}")
        return []

def delete_chart_by_id(user_id: str, chart_id: str) -> bool:
    """Optimized chart deletion with validation"""
    try:
        if use_memory_db:
            user_charts = memory_store.get(user_id, {})
            if chart_id not in user_charts:
                logger.warning(f"[MEMORY_DB] Chart {chart_id} not found for user {user_id}")
                return False
            del user_charts[chart_id]
            logger.info(f"[MEMORY_DB] Deleted chart {chart_id} for user {user_id}")
            return True
        else:
            db_client = get_firestore_client()
            assert db_client is not None
            doc_ref = db_client.collection("users").document(user_id).collection("charts").document(chart_id)  # type: ignore[misc]
            if not doc_ref.get().exists:  # type: ignore[misc]
                logger.warning(f"Chart {chart_id} not found for user {user_id}")
                return False
            doc_ref.delete()  # type: ignore[misc]
            logger.info(f"Deleted chart {chart_id} for user {user_id}")
            return True
    except Exception as e:
        logger.error(f"Error deleting chart {chart_id} for user {user_id}: {str(e)}")
        raise

def batch_save_charts(user_id: str, charts_data: List[Dict[str, Any]]) -> List[str]:
    """Performance: Batch operations for multiple chart saves"""
    try:
        if use_memory_db:
            ids: List[str] = []
            for chart_data in charts_data:
                chart_id = str(uuid4())
                ids.append(chart_id)
                to_save: Dict[str, Any] = {
                    **chart_data,
                    "id": chart_id,
                    "created_at": datetime.now().isoformat(),
                    "updated_at": datetime.now().isoformat()
                }
                memory_store.setdefault(user_id, {})[chart_id] = to_save
            logger.info(f"[MEMORY_DB] Batch saved {len(ids)} charts for user {user_id}")
            return ids
        else:
            db_client = get_firestore_client()
            assert db_client is not None
            batch = db_client.batch()
            chart_ids: List[str] = []
            for chart_data in charts_data:
                doc_ref = db_client.collection("users").document(user_id).collection("charts").document()  # type: ignore[misc]
                chart_id = doc_ref.id  # type: ignore[misc]
                chart_ids.append(chart_id)  # type: ignore[misc]
                chart_data_to_save: Dict[str, Any] = {
                    **chart_data,
                    "id": chart_id,
                    "created_at": datetime.now().isoformat(),
                    "updated_at": datetime.now().isoformat()
                }
                batch.set(doc_ref, chart_data_to_save)  # type: ignore[misc]
            batch.commit()  # type: ignore[misc]
            logger.info(f"Batch saved {len(chart_ids)} charts for user {user_id}")
            return chart_ids
    except Exception as e:
        logger.error(f"Error batch saving charts for user {user_id}: {str(e)}")
        raise

def get_user_stats(user_id: str) -> UserStats:
    """Performance: Aggregated user statistics with caching"""
    try:
        if use_memory_db:
            charts_map = memory_store.get(user_id, {})
            chart_count = len(charts_map)
            thirty_days_ago = datetime.now() - timedelta(days=30)
            def is_recent(c: ChartData) -> bool:
                try:
                    ts = c.get('created_at')
                    if ts and isinstance(ts, str):
                        return datetime.fromisoformat(ts) >= thirty_days_ago
                    return False
                except Exception:
                    return False
            recent_count = sum(1 for c in charts_map.values() if is_recent(c))
            stats: UserStats = {
                "user_id": user_id,
                "total_charts": chart_count,
                "recent_charts": recent_count,
                "last_accessed": datetime.now().isoformat()
            }
            return stats
        else:
            db_client = get_firestore_client()
            assert db_client is not None
            charts_ref = db_client.collection("users").document(user_id).collection("charts")  # type: ignore[misc]
            chart_count = len(list(charts_ref.stream()))  # type: ignore[misc]
            thirty_days_ago = datetime.now() - timedelta(days=30)
            recent_charts = charts_ref.where("created_at", ">=", thirty_days_ago.isoformat()).stream()  # type: ignore[misc]
            recent_count = len(list(recent_charts))  # type: ignore[misc]
            stats: UserStats = {
                "user_id": user_id,
                "total_charts": chart_count,
                "recent_charts": recent_count,
                "last_accessed": datetime.now().isoformat()
            }
            db_client.collection("users").document(user_id).set({  # type: ignore[misc]
                "stats": stats,
                "stats_updated": datetime.now().isoformat()
            }, merge=True)
            return stats
    except Exception as e:
        logger.error(f"Error getting stats for user {user_id}: {str(e)}")
        return {"user_id": user_id, "total_charts": 0, "recent_charts": 0}

async def async_get_multiple_charts(user_ids: List[str]) -> Dict[str, List[ChartData]]:
    """Performance: Async batch retrieval for multiple users"""
    loop = asyncio.get_event_loop()
    
    async def get_user_charts(user_id: str) -> tuple[str, List[ChartData]]:
        charts = await loop.run_in_executor(executor, get_charts, user_id)
        return user_id, charts
    
    tasks = [get_user_charts(user_id) for user_id in user_ids]
    results = await asyncio.gather(*tasks)
    
    return dict(results)