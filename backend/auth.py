# backend/auth.py
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth, initialize_app, credentials, _apps  # Import _apps
import os
import json

# Initialize Firebase Admin SDK only if not already initialized
if not _apps:  # Check if any Firebase apps exist
    firebase_credentials = os.getenv("FIREBASE_CREDENTIALS")
    if firebase_credentials:
        try:
            # Parse JSON string from environment variable
            cred_dict = json.loads(firebase_credentials)
            initialize_app(credential=credentials.Certificate(cred_dict))
        except json.JSONDecodeError as e:
            raise Exception(f"Failed to parse FIREBASE_CREDENTIALS: {str(e)}")
        except Exception as e:
            raise Exception(f"Failed to initialize Firebase: {str(e)}")
    else:
        raise Exception("FIREBASE_CREDENTIALS environment variable not set")

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        decoded_token = auth.verify_id_token(token)
        return decoded_token['uid']
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")