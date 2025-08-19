"""Salt storage service (clean minimal version).

This replaces a previously corrupted refactor. Provides the subset of
functionality required by the admin salt management API:
 - Per-user salt creation, retrieval, rotation
 - Global salt creation, retrieval
 - Batch rotation helper
 - Query salts due for rotation

Implementation is in-memory by default; Firestore hooks can be re-added
incrementally later. The interface is intentionally small and typed.
"""

from __future__ import annotations

import logging
import os
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional, TypedDict, cast

from .pseudonymization import generate_salt

logger = logging.getLogger(__name__)


class BatchRotateResult(TypedDict):
    users_rotated: int
    globals_rotated: int
    errors: List[str]
    start_time: str
    end_time: str


class SaltStorage:
    """Minimal salt storage with rotation logic (memory + intervals).

    Added for legacy test compatibility:
      * `_get_current_time` wrapper (tests patch it).
      * Optional `db_client` arg for error path tests (non-memory ops stubbed).
    """

    def __init__(self, use_memory: bool = True, db_client: Any = None):
        self.use_memory = use_memory
        self.db_client = db_client
        self.memory_store: Dict[str, Dict[str, Any]] = {}
        self.user_salt_interval_days = int(
            os.getenv("USER_SALT_ROTATION_DAYS", "90")
        )
        self.global_salt_interval_days = int(
            os.getenv("GLOBAL_SALT_ROTATION_DAYS", "30")
        )

    # Legacy shim
    def _get_current_time(self) -> datetime:  # pragma: no cover
        return self._now()

    # Helpers
    def _now(self) -> datetime:
        return datetime.now(timezone.utc)

    # User salts
    def get_user_salt(self, user_id: str) -> Optional[bytes]:
        if self.use_memory:
            rec = self.memory_store.get(user_id)
            if rec and rec.get("salt"):
                try:
                    return bytes.fromhex(str(rec["salt"]))
                except ValueError:
                    return None
            return None
        if not self.db_client:
            return None
        try:  # pragma: no cover
            doc_ref = self.db_client.collection("salts").document(user_id)
            doc = doc_ref.get()
            if getattr(doc, "exists", False):  # type: ignore[attr-defined]
                data = doc.to_dict()  # type: ignore[call-arg]
                if isinstance(data, dict):
                    data_typed = cast(Dict[str, Any], data)
                    hex_salt = data_typed.get("salt")
                    if isinstance(hex_salt, str):
                        return bytes.fromhex(hex_salt)
        except Exception:
            return None
        return None

    def get_or_create_user_salt(self, user_id: str) -> bytes:
        existing = self.get_user_salt(user_id)
        if existing is not None:
            return existing
        return self.create_user_salt(user_id)

    def create_user_salt(
        self, user_id: str, salt: Optional[bytes] = None
    ) -> bytes:
        if salt is None:
            salt = generate_salt()
        now = self._get_current_time()
        self.memory_store[user_id] = {
            "salt": salt.hex(),
            "created_at": now.isoformat(),
            "last_rotated": now.isoformat(),
            "rotation_count": 0,
            "next_rotation": (
                now + timedelta(days=self.user_salt_interval_days)
            ).isoformat(),
        }
        return salt

    def rotate_user_salt(self, user_id: str) -> bytes:
        old = self.get_user_salt(user_id)
        new = generate_salt()
        now = self._get_current_time()
        rec = self.memory_store.get(user_id, {})
        count = int(rec.get("rotation_count", 0)) + 1
        rec.update(
            {
                "salt": new.hex(),
                "last_rotated": now.isoformat(),
                "rotation_count": count,
                "next_rotation": (
                    now + timedelta(days=self.user_salt_interval_days)
                ).isoformat(),
            }
        )
        if old:
            rec["previous_salt_hash"] = old.hex()[:16]
        self.memory_store[user_id] = rec
        return new

    # Global salts
    def get_global_salt(self, salt_type: str = "events") -> Optional[bytes]:
        return self.get_user_salt(f"global_{salt_type}")

    def create_global_salt(
        self, salt_type: str = "events", salt: Optional[bytes] = None
    ) -> bytes:
        if salt is None:
            salt = generate_salt()
        now = self._get_current_time()
        key = f"global_{salt_type}"
        self.memory_store[key] = {
            "salt": salt.hex(),
            "created_at": now.isoformat(),
            "last_rotated": now.isoformat(),
            "rotation_count": 0,
            "next_rotation": (
                now + timedelta(days=self.global_salt_interval_days)
            ).isoformat(),
            "salt_type": salt_type,
        }
        return salt

    def get_or_create_global_salt(self, salt_type: str = "events") -> bytes:
        existing = self.get_global_salt(salt_type)
        if existing is not None:
            return existing
        return self.create_global_salt(salt_type)

    # Queries
    def get_salts_due_for_rotation(self) -> Dict[str, List[str]]:
        now = self._get_current_time()
        if now.tzinfo is None:  # safety: ensure aware
            now = now.replace(tzinfo=timezone.utc)
        due_users: List[str] = []
        due_globals: List[str] = []
        for key, rec in self.memory_store.items():
            nxt_str = rec.get("next_rotation")
            if not nxt_str:
                continue
            try:
                nxt = datetime.fromisoformat(str(nxt_str))
                if nxt.tzinfo is None:  # legacy data may be naive
                    nxt = nxt.replace(tzinfo=timezone.utc)
            except Exception:
                continue
            if now >= nxt:
                if key.startswith("global_"):
                    due_globals.append(key[len("global_") :])
                else:
                    due_users.append(key)
        return {"users": due_users, "globals": due_globals}

    # Batch
    async def batch_rotate_salts(
        self, user_ids: List[str], global_types: List[str]
    ) -> BatchRotateResult:
        start = self._get_current_time().isoformat()
        users_rotated = 0
        globals_rotated = 0
        errors: List[str] = []
        for uid in user_ids:
            try:
                self.rotate_user_salt(uid)
                users_rotated += 1
            except Exception as exc:  # pragma: no cover
                errors.append(f"user {uid}: {exc}")
        for g in global_types:
            try:
                self.create_global_salt(g)
                globals_rotated += 1
            except Exception as exc:  # pragma: no cover
                errors.append(f"global {g}: {exc}")
        end = self._now().isoformat()
        return BatchRotateResult(
            users_rotated=users_rotated,
            globals_rotated=globals_rotated,
            errors=errors,
            start_time=start,
            end_time=end,
        )


_default_storage: Optional[SaltStorage] = None


def get_salt_storage() -> SaltStorage:
    global _default_storage
    if _default_storage is None:
        _default_storage = SaltStorage()
    return _default_storage


def reset_salt_storage() -> None:
    """Reset the singleton so env var overrides take effect (test support)."""
    global _default_storage
    _default_storage = None


__all__ = ["SaltStorage", "get_salt_storage", "reset_salt_storage"]
