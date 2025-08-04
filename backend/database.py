# backend/database.py
import os
from firebase_admin import credentials, initialize_app, firestore
import logging

logger = logging.getLogger(__name__)

# Initialize Firebase with individual environment variables
try:
    cred = credentials.Certificate({
    "type": "service_account",
    "project_id": os.getenv("FIREBASE_PROJECT_ID"),
    "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID"),
    "private_key": os.getenv("FIREBASE_PRIVATE_KEY").replace("\\n", "\n"),
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
    logger.error(f"Error initializing Firebase: {str(e)}", exc_info=True)
    raise Exception(f"Failed to initialize Firebase: {str(e)}")

def save_chart(user_id: str, chart_type: str, birth_data: dict, chart_data: dict):
    try:
        doc_ref = db.collection("users").document(user_id).collection("charts").document()
        doc_ref.set({
            "chart_type": chart_type,
            "birth_data": birth_data,
            "chart_data": chart_data,
            "created_at": firestore.SERVER_TIMESTAMP
        })
        logger.debug(f"Saved chart for user {user_id}: {doc_ref.id}")
        return {"id": doc_ref.id, "chart_type": chart_type, "birth_data": birth_data, "chart_data": chart_data}
    except Exception as e:
        logger.error(f"Error saving chart for user {user_id}: {str(e)}", exc_info=True)
        raise

def get_charts(user_id: str):
    try:
        charts_ref = db.collection("users").document(user_id).collection("charts").stream()
        charts = [chart.to_dict() for chart in charts_ref]
        logger.debug(f"Retrieved {len(charts)} charts for user {user_id}")
        return charts
    except Exception as e:
        logger.error(f"Error retrieving charts for user {user_id}: {str(e)}", exc_info=True)
        raise