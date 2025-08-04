# Overwrite database.py with corrected Firebase initialization
import os
import firebase_admin
from firebase_admin import credentials, firestore


# Load Firebase credentials from FIREBASE_CREDENTIALS as a single JSON string
import json
cred_json = os.getenv("FIREBASE_CREDENTIALS")
if not cred_json:
    raise Exception("FIREBASE_CREDENTIALS environment variable not set")
cred_dict = json.loads(cred_json)

# Initialize Firebase only if not already initialized
if not firebase_admin._apps:
    cred = credentials.Certificate(cred_dict)
    firebase_admin.initialize_app(cred)

# Initialize Firestore client
db = firestore.client()

# Example function to save chart data
def save_chart(user_id: str, chart_data: dict):
    doc_ref = db.collection("users").document(user_id).collection("charts").document()
    doc_ref.set(chart_data)
    return doc_ref.id

# Example function to retrieve charts
def get_charts(user_id: str):
    charts_ref = db.collection("users").document(user_id).collection("charts").stream()
    return [chart.to_dict() for chart in charts_ref]