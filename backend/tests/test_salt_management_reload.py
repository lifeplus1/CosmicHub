"""Tests for explicit reload endpoint in salt management API."""

from fastapi.testclient import TestClient

from main import app
from utils.salt_backend import get_salt_backend
from utils.salt_storage import get_salt_storage

client = TestClient(app)


def test_reload_applies_env_intervals(monkeypatch):  # type: ignore[no-untyped-def]
    storage = get_salt_storage()
    storage.memory_store.clear()
    monkeypatch.setenv("USER_SALT_ROTATION_DAYS", "45")  # type: ignore[attr-defined]
    monkeypatch.setenv("GLOBAL_SALT_ROTATION_DAYS", "10")  # type: ignore[attr-defined]
    # Call reload endpoint to apply overrides
    r = client.post("/api/admin/salts/reload")
    assert r.status_code == 200
    body = r.json()
    assert body["rotation_intervals"]["user_days"] == 45
    assert body["rotation_intervals"]["global_days"] == 10
    # Ensure backend refresh occurred
    backend = get_salt_backend()
    # Create user salt then verify next_rotation interval approximates 45 days
    backend.create_user_salt("u1")
    audit = client.get("/api/admin/salts/audit/u1")
    assert audit.status_code == 200
    data = audit.json()
    # next_rotation should be ~45 days from created_at
    from datetime import datetime

    created = datetime.fromisoformat(data["created_at"])  # type: ignore[arg-type]
    next_rot = datetime.fromisoformat(data["next_rotation"])  # type: ignore[arg-type]
    delta = next_rot - created
    assert 44 <= delta.days <= 46
