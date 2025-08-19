"""Pseudonymization utilities for analytics and logging.

Implements salted + peppered SHA-256 hashing with optional provided salt.
Integrates with salt storage system for automatic salt management.
"""

from __future__ import annotations

import hashlib
import os
import secrets
from functools import lru_cache
from typing import Optional

PEPPER_ENV = "PSEUDONYM_PEPPER"
DEFAULT_PEPPER = b"change-me-in-env"


def _get_pepper() -> bytes:
    val = os.getenv(PEPPER_ENV)
    if not val:
        return DEFAULT_PEPPER
    try:
        if (
            all(c in "0123456789abcdefABCDEF" for c in val)
            and len(val) % 2 == 0
        ):
            return bytes.fromhex(val)
    except Exception:
        pass
    return val.encode("utf-8")


@lru_cache(maxsize=2048)
def pseudonymize(
    identifier: str | int | float | bytes, salt: Optional[bytes] = None
) -> str:
    """Return a deterministic pseudonym hash.

    Accepts broader primitive types (int/float/bytes) to reduce caller errors.
    Non-bytes are coerced to UTF-8 encoded string before hashing. The function
    remains cacheable because the key is the argument tuple; widening types
    does not change semantics for identical logical identifiers.
    """
    if salt is None:
        salt = secrets.token_bytes(32)
    pepper = _get_pepper()
    h = hashlib.sha256()
    h.update(salt)
    # Normalize identifier to bytes
    if isinstance(identifier, bytes):
        ident_bytes = identifier
    else:
        ident_bytes = str(identifier).encode("utf-8")
    h.update(ident_bytes)
    h.update(pepper)
    return h.hexdigest()


def generate_salt() -> bytes:
    """Generate a cryptographically secure random salt."""
    return secrets.token_bytes(32)


def pseudonymize_user_data(
    user_id: str, identifier: str | int | float | bytes
) -> str:
    """Pseudonymize data using user-specific salt from storage.

    This function automatically retrieves (or creates) a salt for the user
    from the salt storage system, ensuring consistent pseudonymization
    across the application.

    Args:
        user_id: User identifier to get salt for
        identifier: Data to pseudonymize

    Returns:
        Pseudonymized hash string
    """
    try:
        # Import here to avoid circular imports
        from .salt_storage import get_salt_storage

        storage = get_salt_storage()
        user_salt = storage.get_or_create_user_salt(user_id)
        return pseudonymize(identifier, user_salt)
    except ImportError:
        # Fallback to regular pseudonymization if salt storage is not available
        return pseudonymize(identifier)


def pseudonymize_analytics_data(
    identifier: str | int | float | bytes, event_type: str = "events"
) -> str:
    """Pseudonymize analytics data using global salt.

    This function uses a global salt for analytics events, allowing
    aggregation while maintaining privacy.

    Args:
        identifier: Data to pseudonymize
        event_type: Type of event/analytics (used to select appropriate salt)

    Returns:
        Pseudonymized hash string
    """
    try:
        # Import here to avoid circular imports
        from .salt_storage import get_salt_storage

        storage = get_salt_storage()
        global_salt = storage.get_or_create_global_salt(event_type)
        return pseudonymize(identifier, global_salt)
    except ImportError:
        # Fallback to regular pseudonymization if salt storage is not available
        return pseudonymize(identifier)


__all__ = [
    "pseudonymize",
    "generate_salt",
    "pseudonymize_user_data",
    "pseudonymize_analytics_data",
]
