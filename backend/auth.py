# backend/auth.py
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth, initialize_app, credentials, _apps
import os
import json
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Firebase Admin SDK only if not already initialized
if not _apps:
    firebase_credentials = os.getenv("FIREBASE_CREDENTIALS")
    if not firebase_credentials:
        logger.error("FIREBASE_CREDENTIALS environment variable not set")
        raise Exception("FIREBASE_CREDENTIALS environment variable not set")
    try:
        # Parse JSON string from environment variable
        cred_dict = json.loads(firebase_credentials)
        initialize_app(credential=credentials.Certificate(cred_dict))
        logger.info("Firebase Admin SDK initialized successfully")
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse FIREBASE_CREDENTIALS: {str(e)}")
        raise Exception(f"Failed to parse FIREBASE_CREDENTIALS: {str(e)}")
    except Exception as e:
        logger.error(f"Failed to initialize Firebase: {str(e)}")
        raise Exception(f"Failed to initialize Firebase: {str(e)}")

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        decoded_token = auth.verify_id_token(token)
        logger.info(f"User authenticated: {decoded_token['uid']}")
        return decoded_token['uid']
    except Exception as e:
        logger.error(f"Invalid token: {str(e)}")
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")