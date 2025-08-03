# backend/auth.py
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth, initialize_app
import os

# Initialize Firebase Admin SDK (only once)
if not len(getattr(auth, '_apps', {})):  # Check if already initialized
    firebase_credentials = os.getenv("FIREBASE_CREDENTIALS")
    if firebase_credentials:
        initialize_app(credential=auth.Certificate(firebase_credentials))
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