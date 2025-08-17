"""API tests for salt management endpoints."""
from fastapi.testclient import TestClient

from main import app
from utils.salt_storage import get_salt_storage, SaltStorage

client = TestClient(app)


def _reset_storage() -> SaltStorage:
    # Access the singleton and wipe memory store for isolation
    storage = get_salt_storage()
    storage.memory_store.clear()
    return storage


def test_status_empty():
    _reset_storage()
    resp = client.get("/api/admin/salts/status")
    assert resp.status_code == 200
    data = resp.json()
    assert data["users_due_for_rotation"] == 0
    assert data["globals_due_for_rotation"] == 0
    assert data["due_users"] == []
    assert data["due_globals"] == []
    assert data["storage_type"] in ("memory", "firestore")


def test_user_rotation_flow():
    storage = _reset_storage()

    # Create initial salt via background rotation (force create)
    r = client.post("/api/admin/salts/rotate/user/test_user?force=true")
    assert r.status_code == 200
    # Background task executes after response; ensure state by creating directly if missing
    if storage.get_user_salt("test_user") is None:
        storage.create_user_salt("test_user")

    # Trigger rotation now that salt exists
    r2 = client.post("/api/admin/salts/rotate/user/test_user")
    assert r2.status_code == 200
    data2 = r2.json()
    assert data2["had_existing_salt"] is True

    # Audit endpoint should show rotation metadata (rotation_count possibly 0 or 1 depending timing)
    audit = client.get("/api/admin/salts/audit/test_user")
    assert audit.status_code == 200
    a = audit.json()
    assert a["user_id"] == "test_user"
    assert a["has_salt"] is True
    assert "created_at" in a
    assert "last_rotated" in a


def test_batch_rotation():
    storage = _reset_storage()
    # Seed some salts due by manipulating next_rotation
    uids = ["u1", "u2", "u3"]
    for uid in uids:
        storage.create_user_salt(uid)
        storage.memory_store[uid]["next_rotation"] = "1970-01-01T00:00:00+00:00"
    storage.create_global_salt("events")
    storage.memory_store["global_events"]["next_rotation"] = "1970-01-01T00:00:00+00:00"

    resp = client.post("/api/admin/salts/rotate/batch")
    assert resp.status_code == 200
    d = resp.json()
    assert d["users_to_rotate"] == len(uids)
    assert d["globals_to_rotate"] == 1


def test_pseudonymize_dev_guard():
    _reset_storage()
    # Missing dev flag -> forbidden
    bad = client.post("/api/admin/salts/dev/pseudonymize", json={"user_id": "u1", "identifier": "abc"})
    assert bad.status_code == 403

    ok = client.post(
        "/api/admin/salts/dev/pseudonymize",
        json={"user_id": "u1", "identifier": "abc", "enable_dev_mode": True},
    )
    assert ok.status_code == 200
    body = ok.json()
    assert body["user_id"] == "u1"
    assert body["user_pseudonym"]
    assert body["analytics_pseudonym"]
