import os
import logging
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth, credentials, initialize_app
from dotenv import load_dotenv
import firebase_admin

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Initialize Firebase Admin SDK using FIREBASE_CREDENTIALS as a single JSON string
import json
if not firebase_admin._apps:
    try:
        cred_json = os.getenv("FIREBASE_CREDENTIALS")
        if not cred_json:
            logger.error("FIREBASE_CREDENTIALS environment variable not set")
            raise Exception("FIREBASE_CREDENTIALS environment variable not set")
        cred_dict = json.loads(cred_json)
        cred = credentials.Certificate(cred_dict)
        initialize_app(cred)
        logger.info("Firebase Admin SDK initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize Firebase: {str(e)}")
        raise ValueError(f"Failed to initialize Firebase: {str(e)}")

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token.get('uid')
        if not uid:
            logger.error("No UID found in decoded token")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: No UID found",
                headers={"WWW-Authenticate": "Bearer"},
            )
        logger.info(f"User authenticated: {uid}")
        return uid
    except auth.InvalidIdTokenError:
        logger.error("Invalid Firebase ID token")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except auth.ExpiredIdTokenError:
        logger.error("Firebase ID token expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"Token verification failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token verification failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )