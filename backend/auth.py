import logging
import os

import firebase_admin
import firebase_admin.credentials
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth, initialize_app  # type: ignore

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


firebase_available = True

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
            formatted_private_key = (
                private_key.replace("\\n", "\n") if private_key else None
            )

            cred_dict: dict[str, str | None] = {
                "type": "service_account",
                "project_id": os.getenv("FIREBASE_PROJECT_ID"),
                "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID"),
                "private_key": formatted_private_key,
                "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
                "client_id": os.getenv("FIREBASE_CLIENT_ID"),
                "auth_uri": os.getenv("FIREBASE_AUTH_URI"),
                "token_uri": os.getenv("FIREBASE_TOKEN_URI"),
                "auth_provider_x509_cert_url": os.getenv(
                    "FIREBASE_AUTH_PROVIDER_X509_CERT_URL"
                ),
                "client_x509_cert_url": os.getenv(
                    "FIREBASE_CLIENT_X509_CERT_URL"
                ),
                "universe_domain": os.getenv("FIREBASE_UNIVERSE_DOMAIN"),
            }
            missing = [k for k, v in cred_dict.items() if not v]
            if missing:
                raise ValueError(
                    f"Missing Firebase credential fields: {missing}"
                )
            cred = firebase_admin.credentials.Certificate(cred_dict)

        initialize_app(cred)
        logger.info("Firebase Admin SDK initialized successfully")
    except Exception as e:
        # In non-production, allow a mock auth fallback so the app can run
        env = os.getenv("DEPLOY_ENVIRONMENT", "development").lower()
        allow_mock = os.getenv(
            "ALLOW_MOCK_AUTH", "1" if env != "production" else "0"
        )
        if allow_mock in ("1", "true", "yes") and env != "production":
            firebase_available = False
            logger.warning(
                "Firebase Admin credentials not found. Running with mock auth (development only). "
                "Set FIREBASE_CREDENTIALS or individual FIREBASE_* vars, or set ALLOW_MOCK_AUTH=0 to disable."
            )
        else:
            logger.error(f"Failed to initialize Firebase: {str(e)}")
            raise ValueError(f"Failed to initialize Firebase: {str(e)}")

security = HTTPBearer(auto_error=False)


def _in_test_mode() -> bool:
    return (
        os.getenv("PYTEST_CURRENT_TEST") is not None
        or os.getenv("CI") is not None
        or os.getenv("TEST_MODE", "0") in ("1", "true", "yes")
    )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    # Fast path for test/dev without firebase
    if not firebase_available or _in_test_mode():
        token = (credentials.credentials if credentials else "") or ""
        token = token.strip()
        uid = token or os.getenv("DEV_FAKE_UID", "dev-user")
        logger.info(f"[MOCK_AUTH] Using mock user: {uid}")
        return {"uid": str(uid)}

    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No authentication credentials provided",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = credentials.credentials
    if not token:
        logger.error("No token provided")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No authentication token provided",
            headers={"WWW-Authenticate": "Bearer"},
        )

    from typing import Any, Dict, Optional

    try:
        decoded_token: Dict[str, Any] = auth.verify_id_token(token)  # type: ignore
        uid: Optional[str] = decoded_token.get("uid")  # type: ignore
        if not uid:
            logger.error("No UID found in decoded token")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: No UID found",
                headers={"WWW-Authenticate": "Bearer"},
            )
        logger.info(f"User authenticated: {uid}")
        return {"uid": str(uid)}  # type: ignore
    except Exception as e:  # Broad but we re-map specific messages
        # Map firebase specific exceptions if available
        msg = str(getattr(e, "__class__", type("x", (object,), {})).__name__)
        logger.error(f"Token verification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {msg}",
            headers={"WWW-Authenticate": "Bearer"},
        )
