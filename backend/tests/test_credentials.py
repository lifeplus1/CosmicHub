# test_credentials.py
import os
import json
from dotenv import load_dotenv

load_dotenv()
creds = os.getenv("FIREBASE_CREDENTIALS")
print(json.loads(creds).get("project_id"))