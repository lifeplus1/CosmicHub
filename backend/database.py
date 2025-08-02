import os
import json
from datetime import datetime
from firebase_admin import firestore

db = firestore.client()

def save_chart(uid, chart_type, birth_data, chart_data):
    document = {
        "user_id": uid,
        "type": chart_type,
        "birth_data": birth_data,
        "chart_data": chart_data,
        "created_at": firestore.SERVER_TIMESTAMP
    }
    doc_ref = db.collection("users").document(uid).collection("charts").add(document)
    return {"id": doc_ref[1].id, "message": "Chart saved successfully"}

def get_charts(uid):
    charts_ref = db.collection("users").document(uid).collection("charts")
    charts = charts_ref.stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in charts]