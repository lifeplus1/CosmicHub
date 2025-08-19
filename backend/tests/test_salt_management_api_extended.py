"""Extended tests for salt management API covering additional edge cases.

These complement `test_salt_management_api.py` focusing on:
 - Env flag SALT_BACKEND=firestore fallback behavior
 - Rotation interval env overrides reflected in status
 - Force create user rotation path
 - Missing user audit returns 404
 - Batch rotation when nothing due
 - Global salt rotation endpoint
"""

from fastapi.testclient import TestClient

from main import app
from utils.salt_backend import get_salt_backend
from utils.salt_storage import SaltStorage, get_salt_storage

client = TestClient(app)


def _reset_storage() -> SaltStorage:  # shared helper mirroring base test file
    storage = get_salt_storage()
    storage.memory_store.clear()
    return storage


def test_status_storage_type_firestone_env(monkeypatch):  # type: ignore[no-untyped-def]
    _reset_storage()
    monkeypatch.setenv("SALT_BACKEND", "firestore")  # type: ignore[attr-defined]
    # Refresh backend so env is respected for new instance
    get_salt_backend(refresh=True)
    r = client.get("/api/admin/salts/status")
    assert r.status_code == 200
    body = r.json()
    # Fallback still memory until real Firestore
    assert body["storage_type"] == "memory"


def test_status_rotation_intervals_env_override(monkeypatch):  # type: ignore[no-untyped-def]
    _reset_storage()
    monkeypatch.setenv("USER_SALT_ROTATION_DAYS", "60")  # type: ignore[attr-defined]
    monkeypatch.setenv("GLOBAL_SALT_ROTATION_DAYS", "15")  # type: ignore[attr-defined]
    # Force backend refresh so intervals captured
    get_salt_backend(refresh=True)
    r = client.get("/api/admin/salts/status")
    assert r.status_code == 200
    body = r.json()
    assert body["rotation_intervals"]["user_days"] == 60
    assert body["rotation_intervals"]["global_days"] == 15


def test_force_create_user_rotation():  # type: ignore[no-untyped-def]
    storage = _reset_storage()
    assert storage.get_user_salt("force_user") is None
    r = client.post("/api/admin/salts/rotate/user/force_user?force=true")
    assert r.status_code == 200
    # Background task has run; salt should now exist
    assert storage.get_user_salt("force_user") is not None


def test_audit_missing_user_404():  # type: ignore[no-untyped-def]
    _reset_storage()
    r = client.get("/api/admin/salts/audit/missing_user")
    assert r.status_code == 404


def test_batch_rotation_nothing_due():  # type: ignore[no-untyped-def]
    _reset_storage()
    r = client.post("/api/admin/salts/rotate/batch")
    assert r.status_code == 200
    body = r.json()
    assert body["users_to_rotate"] == 0
    assert body["globals_to_rotate"] == 0


def test_global_salt_rotation():  # type: ignore[no-untyped-def]
    storage = _reset_storage()
    assert storage.get_global_salt("events") is None
    r = client.post("/api/admin/salts/rotate/global/events")
    assert r.status_code == 200
    # After background task, global salt should exist
    assert storage.get_global_salt("events") is not None
