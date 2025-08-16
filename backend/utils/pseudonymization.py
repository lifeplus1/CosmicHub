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
def pseudonymize(identifier: str, salt: Optional[bytes] = None) -> str:
    if not isinstance(identifier, str):  # defensive
        identifier = str(identifier)
    if salt is None:
        salt = secrets.token_bytes(32)
    pepper = _get_pepper()
    h = hashlib.sha256()
    h.update(salt)
    h.update(identifier.encode("utf-8"))
    h.update(pepper)
    return h.hexdigest()

def generate_salt() -> bytes:
    return secrets.token_bytes(32)

__all__ = ["pseudonymize", "generate_salt"]
