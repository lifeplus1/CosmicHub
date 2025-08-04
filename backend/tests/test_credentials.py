
import os
import json
from dotenv import load_dotenv

load_dotenv()

def test_firebase_credentials_loaded():
    creds = os.getenv("FIREBASE_CREDENTIALS")
    assert creds is not None, "FIREBASE_CREDENTIALS should be set in the environment."
    creds_json = json.loads(creds)
    assert "project_id" in creds_json, "FIREBASE_CREDENTIALS should contain a project_id."