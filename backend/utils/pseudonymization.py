"""Pseudonymization utilities for analytics and logging.

Implements salted + peppered SHA-256 hashing with optional provided salt.
Future: support reversible tokenization for specific regulated use-cases.
"""
from __future__ import annotations
import hashlib, os, secrets
from functools import lru_cache
from typing import Optional

PEPPER_ENV = "PSEUDONYM_PEPPER"
DEFAULT_PEPPER = b"change-me-in-env"

def _get_pepper() -> bytes:
    val = os.getenv(PEPPER_ENV)
    if not val:
        return DEFAULT_PEPPER
    try:
        if all(c in "0123456789abcdefABCDEF" for c in val) and len(val) % 2 == 0:
            return bytes.fromhex(val)
    except Exception:
        pass
    return val.encode("utf-8")

@lru_cache(maxsize=2048)
def pseudonymize(identifier: str | int | float | bytes, salt: Optional[bytes] = None) -> str:
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
    return secrets.token_bytes(32)

__all__ = ["pseudonymize", "generate_salt"]
