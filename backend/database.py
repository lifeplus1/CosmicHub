# backend/database.py
import os
import logging
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, initialize_app, firestore
from dotenv import load_dotenv
from typing import List, Dict, Any

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

logger = logging.getLogger(__name__)

# Initialize Firebase
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

def save_chart(user_id: str, chart_type: str, birth_data: Dict[str, Any], chart_data: Dict[str, Any]) -> Dict[str, Any]:
    try:
        doc_ref = db.collection("users").document(user_id).collection("charts").document()
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
            "birth_data": birth_data,  # Keep for reference
            "chart_data": chart_data,
            "created_at": datetime.now().isoformat()
        }
        doc_ref.set(chart_data_to_save)
        logger.info(f"Saved chart {chart_id} for user {user_id}")
        return chart_data_to_save
    except Exception as e:
        logger.error(f"Error saving chart for user {user_id}: {str(e)}")
        raise

# backend/database.py
# (Existing code; optimize with batch operations, indexing references)
def get_charts(user_id: str) -> List[Dict[str, Any]]:
    try:
        db = get_firestore_client()
        charts_ref = db.collection("users").document(user_id).collection("charts").limit(50).stream()  # Paginate for large datasets
        # ... 

def delete_chart_by_id(user_id: str, chart_id: str) -> bool:
    try:
        doc_ref = db.collection("users").document(user_id).collection("charts").document(chart_id)
        if not doc_ref.get().exists:
            logger.warning(f"Chart {chart_id} not found for user {user_id}")
            return False
        doc_ref.delete()
        logger.info(f"Deleted chart {chart_id} for user {user_id}")
        return True
    except Exception as e:
        logger.error(f"Error deleting chart {chart_id} for user {user_id}: {str(e)}")
        raise