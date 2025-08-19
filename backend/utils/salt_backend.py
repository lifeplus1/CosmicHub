"""Salt backend abstraction (persistence adapter scaffold).

Provides a protocol that enables swapping in different storage implementations
(memory today, Firestore/DB later) without changing API or pseudonymization logic.

Usage:
    from utils.salt_backend import get_salt_backend
    backend = get_salt_backend()
    backend.get_user_salt("user123")

Environment Variable Switch:
    SALT_BACKEND=memory (default)
    SALT_BACKEND=firestore (placeholder implementation currently)

Future Backends (planned):
    - FirestoreSaltBackend (durable, multi-instance)
    - RedisCachedFirestoreBackend (read-cache + durable write-through)
    - SQLSaltBackend (Postgres with transactional rotations)
"""

from __future__ import annotations

import os
from typing import Any, Dict, List, Optional, Protocol, runtime_checkable

from .salt_storage import BatchRotateResult, SaltStorage, get_salt_storage


@runtime_checkable
class SaltBackendProtocol(Protocol):
    """Minimal contract shared by all salt backends."""

    # User salts
    def get_user_salt(
        self, user_id: str
    ) -> Optional[bytes]: ...  # noqa: D401,E701
    def create_user_salt(
        self, user_id: str, salt: Optional[bytes] = None
    ) -> bytes: ...  # noqa
    def rotate_user_salt(self, user_id: str) -> bytes: ...  # noqa
    def get_or_create_user_salt(self, user_id: str) -> bytes: ...  # noqa

    # Global salts
    def get_global_salt(
        self, salt_type: str = "events"
    ) -> Optional[bytes]: ...  # noqa
    def create_global_salt(
        self, salt_type: str = "events", salt: Optional[bytes] = None
    ) -> bytes: ...  # noqa
    def get_or_create_global_salt(
        self, salt_type: str = "events"
    ) -> bytes: ...  # noqa

    # Rotation queries / batch
    def get_salts_due_for_rotation(self) -> Dict[str, List[str]]: ...  # noqa
    async def batch_rotate_salts(
        self, user_ids: List[str], global_types: List[str]
    ) -> BatchRotateResult: ...  # noqa


class InMemorySaltBackend(SaltBackendProtocol):
    """Adapter around existing in-memory SaltStorage for protocol compliance."""

    def __init__(self, storage: Optional[SaltStorage] = None):
        self._storage = storage or get_salt_storage()

    # Delegate methods
    def get_user_salt(self, user_id: str) -> Optional[bytes]:
        return self._storage.get_user_salt(user_id)

    def create_user_salt(
        self, user_id: str, salt: Optional[bytes] = None
    ) -> bytes:
        return self._storage.create_user_salt(user_id, salt)

    def rotate_user_salt(self, user_id: str) -> bytes:
        return self._storage.rotate_user_salt(user_id)

    def get_or_create_user_salt(self, user_id: str) -> bytes:
        return self._storage.get_or_create_user_salt(user_id)

    def get_global_salt(self, salt_type: str = "events") -> Optional[bytes]:
        return self._storage.get_global_salt(salt_type)

    def create_global_salt(
        self, salt_type: str = "events", salt: Optional[bytes] = None
    ) -> bytes:
        return self._storage.create_global_salt(salt_type, salt)

    def get_or_create_global_salt(self, salt_type: str = "events") -> bytes:
        return self._storage.get_or_create_global_salt(salt_type)

    def get_salts_due_for_rotation(self) -> Dict[str, List[str]]:
        return self._storage.get_salts_due_for_rotation()

    async def batch_rotate_salts(
        self, user_ids: List[str], global_types: List[str]
    ) -> BatchRotateResult:
        return await self._storage.batch_rotate_salts(user_ids, global_types)


class FirestoreSaltBackend(
    SaltBackendProtocol
):  # pragma: no cover - until real impl
    """Firestore-backed salt storage (currently emulated with in-memory delegate).

    Implementation strategy (future):
      * Collection: salts (document id = user_id or global_<type>)
      * Fields: salt (hex), created_at, last_rotated, rotation_count, next_rotation, previous_salt_hash, salt_type
      * Indexed queries for next_rotation <= now (rotation jobs)
      * Transactions for rotation to avoid concurrent overwrite
      * Optional envelope encryption (KMS) for salt field

    Current behavior:
      * If google.cloud.firestore is unavailable, or feature flag FIRESTORE_SALTS_EMULATE=1, uses in-memory SaltStorage delegate.
      * Exposes same API so callers are agnostic.
    """

    def __init__(self) -> None:
        self._emulated = False
        self._delegate: Optional[SaltStorage] = None
        use_emulate = os.getenv("FIRESTORE_SALTS_EMULATE", "1") == "1"
        try:
            if use_emulate:
                raise ImportError("Emulation forced")
            import google.cloud.firestore  # type: ignore

            # Placeholder: real client wiring deferred.
            self._client: Any = google.cloud.firestore.Client()  # type: ignore[attr-defined]
            # Mark unimplemented operations by raising when used.
            self._emulated = False
        except Exception:
            # Fallback to memory delegate
            self._delegate = get_salt_storage()
            self._emulated = True

    # Helper to route to delegate or raise
    def _ensure_delegate(self) -> SaltStorage:
        if self._delegate is None:
            # Real implementation not yet available
            raise NotImplementedError(
                "Firestore operations not implemented yet"
            )
        return self._delegate

    # User salts
    def get_user_salt(self, user_id: str) -> Optional[bytes]:
        return self._ensure_delegate().get_user_salt(user_id)

    def create_user_salt(
        self, user_id: str, salt: Optional[bytes] = None
    ) -> bytes:
        return self._ensure_delegate().create_user_salt(user_id, salt)

    def rotate_user_salt(self, user_id: str) -> bytes:
        return self._ensure_delegate().rotate_user_salt(user_id)

    def get_or_create_user_salt(self, user_id: str) -> bytes:
        return self._ensure_delegate().get_or_create_user_salt(user_id)

    # Global salts
    def get_global_salt(self, salt_type: str = "events") -> Optional[bytes]:
        return self._ensure_delegate().get_global_salt(salt_type)

    def create_global_salt(
        self, salt_type: str = "events", salt: Optional[bytes] = None
    ) -> bytes:
        return self._ensure_delegate().create_global_salt(salt_type, salt)

    def get_or_create_global_salt(self, salt_type: str = "events") -> bytes:
        return self._ensure_delegate().get_or_create_global_salt(salt_type)

    # Queries / batch
    def get_salts_due_for_rotation(self) -> Dict[str, List[str]]:
        return self._ensure_delegate().get_salts_due_for_rotation()

    async def batch_rotate_salts(
        self, user_ids: List[str], global_types: List[str]
    ) -> BatchRotateResult:
        return await self._ensure_delegate().batch_rotate_salts(
            user_ids, global_types
        )


# Singleton cache for adapter
_backend_singleton: Optional[SaltBackendProtocol] = None


def get_salt_backend(refresh: bool = False) -> SaltBackendProtocol:
    global _backend_singleton
    if _backend_singleton is not None and not refresh:
        return _backend_singleton
    kind = os.getenv("SALT_BACKEND", "memory").lower()
    if kind == "firestore":
        # Fall back to memory until Firestore implementation is ready
        _backend_singleton = InMemorySaltBackend()
    else:
        _backend_singleton = InMemorySaltBackend()
    return _backend_singleton


def backend_storage_type(backend: SaltBackendProtocol) -> str:
    if isinstance(backend, InMemorySaltBackend):
        return "memory"
    if isinstance(backend, FirestoreSaltBackend):  # type: ignore[arg-type]
        return "firestore"  # Currently unused (fallback maps to memory)
    return backend.__class__.__name__.lower()


__all__ = [
    "SaltBackendProtocol",
    "InMemorySaltBackend",
    "FirestoreSaltBackend",
    "get_salt_backend",
    "backend_storage_type",
]
