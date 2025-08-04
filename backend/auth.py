import os
import logging
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth, initialize_app  # type: ignore
import firebase_admin.credentials
from dotenv import load_dotenv
import firebase_admin

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Initialize Firebase Admin SDK using FIREBASE_CREDENTIALS as a single JSON string
import json
try:
    firebase_admin.get_app()  # type: ignore
except ValueError:
    try:
        # First try to use FIREBASE_CREDENTIALS (JSON string)
        firebase_creds = os.getenv("FIREBASE_CREDENTIALS")
        if firebase_creds:
            cred_dict = json.loads(firebase_creds)
            cred = firebase_admin.credentials.Certificate(cred_dict)
        else:
            # Fallback to individual environment variables
            # Get private key and handle newline replacement safely
            private_key = os.getenv("FIREBASE_PRIVATE_KEY")
            formatted_private_key = private_key.replace('\\n', '\n') if private_key else None
            
            cred_dict: dict[str, str | None] = {
                "type": "service_account",
                "project_id": os.getenv("FIREBASE_PROJECT_ID"),
                "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID"),
                "private_key": formatted_private_key,
                "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
                "client_id": os.getenv("FIREBASE_CLIENT_ID"),
                "auth_uri": os.getenv("FIREBASE_AUTH_URI"),
                "token_uri": os.getenv("FIREBASE_TOKEN_URI"),
                "auth_provider_x509_cert_url": os.getenv("FIREBASE_AUTH_PROVIDER_X509_CERT_URL"),
                "client_x509_cert_url": os.getenv("FIREBASE_CLIENT_X509_CERT_URL"),
                "universe_domain": os.getenv("FIREBASE_UNIVERSE_DOMAIN"),
            }
            missing = [k for k, v in cred_dict.items() if not v]
            if missing:
                logger.error(f"Missing Firebase credential fields: {missing}")
                raise ValueError(f"Missing Firebase credential fields: {missing}")
            cred = firebase_admin.credentials.Certificate(cred_dict)
        
        initialize_app(cred)
        logger.info("Firebase Admin SDK initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize Firebase: {str(e)}")
        raise ValueError(f"Failed to initialize Firebase: {str(e)}")

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        if not token:
            logger.error("No token provided")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="No authentication token provided",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Verify the Firebase ID token
        from typing import Any, Dict, Optional
        decoded_token: Dict[str, Any] = auth.verify_id_token(token)  # type: ignore
        uid: Optional[str] = decoded_token.get('uid')  # type: ignore
        
        if not uid:
            logger.error("No UID found in decoded token")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: No UID found",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        logger.info(f"User authenticated: {uid}")
        return str(uid)  # type: ignore
        
    except auth.ExpiredIdTokenError as e:
        logger.error(f"Firebase ID token expired: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired - please refresh and try again",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except auth.RevokedIdTokenError as e:
        logger.error(f"Firebase ID token revoked: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token revoked - please login again",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except auth.InvalidIdTokenError as e:
        logger.error(f"Invalid Firebase ID token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"Token verification failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )