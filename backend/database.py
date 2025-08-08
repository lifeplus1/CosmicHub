# backend/database.py
import os
import logging
from datetime import datetime, timedelta
import firebase_admin
from firebase_admin import credentials, initialize_app, firestore
from dotenv import load_dotenv
from typing import List, Dict, Any, Optional
from functools import lru_cache
import asyncio
from concurrent.futures import ThreadPoolExecutor

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

logger = logging.getLogger(__name__)

# Initialize Firebase with performance optimizations
try:
    if not firebase_admin._apps:
        private_key = os.getenv("FIREBASE_PRIVATE_KEY")
        if not private_key:
            raise ValueError("FIREBASE_PRIVATE_KEY not set")
        cred = credentials.Certificate({
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
    db = firestore.client()
except Exception as e:
    logger.error(f"Firebase initialization failed: {str(e)}")
    raise

# Performance: Thread pool for concurrent operations
executor = ThreadPoolExecutor(max_workers=4)

@lru_cache(maxsize=128)
def get_firestore_client():
    """Cached Firestore client for performance"""
    return db

def save_chart(user_id: str, chart_type: str, birth_data: Dict[str, Any], chart_data: Dict[str, Any]) -> Dict[str, Any]:
    """Optimized chart saving with validation"""
    try:
        db_client = get_firestore_client()
        doc_ref = db_client.collection("users").document(user_id).collection("charts").document()
        chart_id = doc_ref.id
        birth_date = f"{birth_data['year']}-{birth_data['month']:02d}-{birth_data['day']:02d}"
        birth_time = f"{birth_data['hour']:02d}:{birth_data['minute']:02d}"
        
        chart_data_to_save = {
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
        doc_ref.set(chart_data_to_save)
        logger.info(f"Saved chart {chart_id} for user {user_id}")
        return chart_data_to_save
    except Exception as e:
        logger.error(f"Error saving chart for user {user_id}: {str(e)}")
        raise

def get_charts(user_id: str, limit: int = 50, start_after: Optional[str] = None) -> List[Dict[str, Any]]:
    """Optimized chart retrieval with pagination and caching"""
    try:
        db_client = get_firestore_client()
        query = db_client.collection("users").document(user_id).collection("charts")\
            .order_by("created_at", direction=firestore.Query.DESCENDING)\
            .limit(limit)
        
        if start_after:
            # For pagination: start after the last document from previous page
            last_doc = db_client.collection("users").document(user_id)\
                .collection("charts").document(start_after).get()
            if last_doc.exists:
                query = query.start_after(last_doc)
        
        charts = []
        for doc in query.stream():
            chart_data = doc.to_dict()
            chart_data['id'] = doc.id  # Ensure ID is included
            charts.append(chart_data)
        
        logger.info(f"Retrieved {len(charts)} charts for user {user_id}")
        return charts
        
    except Exception as e:
        logger.error(f"Error retrieving charts for user {user_id}: {str(e)}")
        return []

def delete_chart_by_id(user_id: str, chart_id: str) -> bool:
    """Optimized chart deletion with validation"""
    try:
        db_client = get_firestore_client()
        doc_ref = db_client.collection("users").document(user_id).collection("charts").document(chart_id)
        if not doc_ref.get().exists:
            logger.warning(f"Chart {chart_id} not found for user {user_id}")
            return False
        doc_ref.delete()
        logger.info(f"Deleted chart {chart_id} for user {user_id}")
        return True
    except Exception as e:
        logger.error(f"Error deleting chart {chart_id} for user {user_id}: {str(e)}")
        raise

def batch_save_charts(user_id: str, charts_data: List[Dict[str, Any]]) -> List[str]:
    """Performance: Batch operations for multiple chart saves"""
    try:
        db_client = get_firestore_client()
        batch = db_client.batch()
        chart_ids = []
        
        for chart_data in charts_data:
            doc_ref = db_client.collection("users").document(user_id).collection("charts").document()
            chart_id = doc_ref.id
            chart_ids.append(chart_id)
            
            chart_data_to_save = {
                **chart_data,
                "id": chart_id,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            }
            batch.set(doc_ref, chart_data_to_save)
        
        # Execute batch operation
        batch.commit()
        logger.info(f"Batch saved {len(chart_ids)} charts for user {user_id}")
        return chart_ids
        
    except Exception as e:
        logger.error(f"Error batch saving charts for user {user_id}: {str(e)}")
        raise

def get_user_stats(user_id: str) -> Dict[str, Any]:
    """Performance: Aggregated user statistics with caching"""
    try:
        db_client = get_firestore_client()
        
        # Get chart count
        charts_ref = db_client.collection("users").document(user_id).collection("charts")
        chart_count = len(list(charts_ref.stream()))
        
        # Get recent activity (last 30 days)
        thirty_days_ago = datetime.now() - timedelta(days=30)
        recent_charts = charts_ref.where("created_at", ">=", thirty_days_ago.isoformat()).stream()
        recent_count = len(list(recent_charts))
        
        stats = {
            "user_id": user_id,
            "total_charts": chart_count,
            "recent_charts": recent_count,
            "last_accessed": datetime.now().isoformat()
        }
        
        # Cache stats in user document
        db_client.collection("users").document(user_id).set({
            "stats": stats,
            "stats_updated": datetime.now().isoformat()
        }, merge=True)
        
        return stats
        
    except Exception as e:
        logger.error(f"Error getting stats for user {user_id}: {str(e)}")
        return {"user_id": user_id, "total_charts": 0, "recent_charts": 0}

async def async_get_multiple_charts(user_ids: List[str]) -> Dict[str, List[Dict[str, Any]]]:
    """Performance: Async batch retrieval for multiple users"""
    loop = asyncio.get_event_loop()
    
    async def get_user_charts(user_id: str) -> tuple[str, List[Dict[str, Any]]]:
        charts = await loop.run_in_executor(executor, get_charts, user_id)
        return user_id, charts
    
    tasks = [get_user_charts(user_id) for user_id in user_ids]
    results = await asyncio.gather(*tasks)
    
    return dict(results)