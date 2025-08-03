# backend/database.py
from firebase_admin import firestore
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

db = firestore.client()

def save_user_profile(user_id: str, profile: dict):
    try:
        db.collection('users').document(user_id).set(profile, merge=True)
        logger.info(f'Saved profile for user {user_id}')
    except Exception as e:
        logger.error(f'Failed to save profile for user {user_id}: {str(e)}')
        raise

def save_chart(user_id: str, chart_data: dict):
    try:
        db.collection('users').document(user_id).collection('charts').add(chart_data)
        logger.info(f'Saved chart for user {user_id}')
    except Exception as e:
        logger.error(f'Failed to save chart for user {user_id}: {str(e)}')
        raise