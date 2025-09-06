import logging
import os
from typing import Any, Dict, Optional, TypedDict

import firebase_admin
import firebase_admin.credentials
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth, initialize_app  # type: ignore


class UserData(TypedDict):
    """Type-safe user data structure."""
    uid: str


class FirebaseConfig(TypedDict):
    """Type-safe Firebase configuration structure."""
    type: str
    project_id: str
    private_key_id: str
    private_key: str
    client_email: str
    client_id: str
    auth_uri: str
    token_uri: str
    auth_provider_x509_cert_url: str
    client_x509_cert_url: str
    universe_domain: str

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

# Set up structured logging (Best Practice: Logging & Monitoring)
logging.basicConfig(
    level=logging.INFO,
    format='{"ts": "%(asctime)s", "level": "%(levelname)s", "logger": "%(name)s", "msg": "%(message)s"}'
)
logger = logging.getLogger(__name__)

# Global Firebase availability flag
firebase_available: bool = True

# Skip Firebase initialization entirely in test mode to avoid any hanging issues
def _is_test_mode() -> bool:
    """
    Check if running in test mode.
    
    Returns:
        bool: True if in test mode, False otherwise
    """
    return (
        os.getenv("PYTEST_CURRENT_TEST") is not None
        or os.getenv("CI") is not None
        or os.getenv("TEST_MODE", "0") in ("1", "true", "yes")
    )

if _is_test_mode():
    firebase_available = False
    logger.info("Running in test mode - skipping Firebase initialization")
else:
    # Initialize Firebase Admin SDK using FIREBASE_CREDENTIALS as a single
    # JSON string
    import json  # noqa: E402

    logger.info(f"[INIT_DEBUG] Starting Firebase initialization, firebase_available={firebase_available}")
    
    try:
        firebase_admin.get_app()  # type: ignore
        logger.info("[INIT_DEBUG] Firebase app already exists")
    except ValueError:
        logger.info("[INIT_DEBUG] No existing Firebase app, creating new one")
        try:
            # First try to use FIREBASE_CREDENTIALS (JSON string)
            firebase_creds = os.getenv("FIREBASE_CREDENTIALS")
            if firebase_creds:
                logger.info("[INIT_DEBUG] Using FIREBASE_CREDENTIALS JSON string")
                creds_json_dict = json.loads(firebase_creds)
                cred = firebase_admin.credentials.Certificate(creds_json_dict)
            else:
                logger.info("[INIT_DEBUG] Using individual environment variables")
                # Fallback to individual environment variables
                # Get private key and handle newline replacement safely
                private_key: Optional[str] = os.getenv("FIREBASE_PRIVATE_KEY")
                formatted_private_key: Optional[str] = (
                    private_key.replace("\\n", "\n") if private_key else None
                )

                cred_dict: FirebaseConfig = {
                    "type": "service_account",
                    "project_id": os.getenv("FIREBASE_PROJECT_ID", ""),
                    "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID", ""),
                    "private_key": formatted_private_key or "",
                    "client_email": os.getenv("FIREBASE_CLIENT_EMAIL", ""),
                    "client_id": os.getenv("FIREBASE_CLIENT_ID", ""),
                    "auth_uri": os.getenv("FIREBASE_AUTH_URI", ""),
                    "token_uri": os.getenv("FIREBASE_TOKEN_URI", ""),
                    "auth_provider_x509_cert_url": os.getenv(
                        "FIREBASE_AUTH_PROVIDER_X509_CERT_URL", ""
                    ),
                    "client_x509_cert_url": os.getenv(
                        "FIREBASE_CLIENT_X509_CERT_URL", ""
                    ),
                    "universe_domain": os.getenv("FIREBASE_UNIVERSE_DOMAIN", ""),
                }
                missing = [k for k, v in cred_dict.items() if not v]
                if missing:
                    raise ValueError(
                        f"Missing Firebase credential fields: {missing}"
                    )
                cred = firebase_admin.credentials.Certificate(cred_dict)

            initialize_app(cred)
            logger.info("Firebase Admin SDK initialized successfully")
            logger.info(f"[INIT_DEBUG] After successful init, firebase_available={firebase_available}")
        except Exception as e:
            logger.error(f"[INIT_DEBUG] Firebase initialization failed: {e}")
            # Enhanced security: explicit validation of environment settings
            env: str = os.getenv("DEPLOY_ENVIRONMENT", "development").lower()
            allow_mock_env: str = os.getenv("ALLOW_MOCK_AUTH", "")
            
            # Security Best Practice: Never default to allowing mock auth
            # Only enable if explicitly set AND not in production
            is_mock_explicitly_allowed: bool = (
                allow_mock_env.lower() in ("1", "true", "yes") and 
                env != "production"
            )
            
            logger.info(
                f"[SECURITY_AUDIT] env={env}, allow_mock_setting='{allow_mock_env}', "
                f"explicit_permission={is_mock_explicitly_allowed}"
            )
            
            if is_mock_explicitly_allowed:
                firebase_available = False
                logger.warning(
                    "[SECURITY] Firebase initialization failed. Running with mock auth "
                    "(development only). Set FIREBASE_CREDENTIALS or individual "
                    "FIREBASE_* vars, or set ALLOW_MOCK_AUTH=0 to disable."
                )
                logger.info("[INIT_DEBUG] Set firebase_available=False due to exception + mock allowed")
            else:
                error_msg = f"Firebase initialization failed and mock auth disabled: {str(e)}"
                logger.error(f"[SECURITY] {error_msg}")
                raise ValueError(error_msg)
    
    logger.info(f"[INIT_DEBUG] Final firebase_available state: {firebase_available}")

security = HTTPBearer(auto_error=False)


def _in_test_mode() -> bool:
    """
    Check if running in test mode (duplicate check for clarity).
    
    Returns:
        bool: True if in test mode, False otherwise
    """
    return _is_test_mode()


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> UserData:
    """
    Get current user from Firebase token or mock auth.
    
    Args:
        credentials: Optional HTTP Bearer token credentials
        
    Returns:
        UserData: User data with UID
        
    Raises:
        HTTPException: If authentication fails
    """
    # Structured logging for security audit trail
    auth_context = {
        "firebase_available": firebase_available,
        "test_mode": _in_test_mode(),
        "allow_mock_setting": os.getenv('ALLOW_MOCK_AUTH', ''),
        "deploy_env": os.getenv('DEPLOY_ENVIRONMENT', ''),
        "has_credentials": credentials is not None
    }
    
    logger.info(f"[AUTH_AUDIT] Authentication attempt: {auth_context}")
    
    # Fast path for test/dev without firebase
    if not firebase_available or _in_test_mode():
        mock_token: str = (credentials.credentials if credentials else "") or ""
        mock_token = mock_token.strip()
        uid: str = mock_token or os.getenv("DEV_FAKE_UID", "dev-user")
        
        logger.warning(f"[MOCK_AUTH] Using mock authentication for user: {uid[:8]}...")
        return UserData(uid=uid)

    if not credentials:
        logger.warning("[AUTH_FAILURE] No authentication credentials provided")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No authentication credentials provided",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    token: str = credentials.credentials
    if not token:
        logger.error("[AUTH_FAILURE] Empty token provided")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No authentication token provided",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        # Firebase token verification with type safety
        decoded_token: Dict[str, Any] = auth.verify_id_token(token)  # type: ignore[misc]
        user_uid: Any = decoded_token.get("uid")  # type: ignore[misc,no-redef]
        
        if not user_uid or not isinstance(user_uid, str):
            logger.error("[AUTH_FAILURE] No valid UID found in decoded token")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: No UID found",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        # Security: Log successful auth without exposing full UID
        logger.info(f"[AUTH_SUCCESS] Token validated for user: {user_uid[:8]}...")
        return UserData(uid=str(user_uid))
        
    except Exception as e:
        # Enhanced error handling with structured logging
        error_type = type(e).__name__
        logger.error(f"[AUTH_FAILURE] Token verification failed: {error_type} - {str(e)}")
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {error_type}",
            headers={"WWW-Authenticate": "Bearer"},
        )
