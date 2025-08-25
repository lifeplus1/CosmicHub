"""Tests for explicit reload endpoint in salt management API.

Fixed version: Direct async calls to avoid TestClient hanging with async endpoints
"""

from datetime import datetime
from unittest.mock import MagicMock
import pytest

from api.salt_management import reload_salt_system, get_user_salt_audit
from utils.salt_backend import get_salt_backend
from utils.salt_storage import get_salt_storage


@pytest.mark.asyncio
async def test_reload_applies_env_intervals(monkeypatch):  # type: ignore[no-untyped-def]  # noqa: E501
    storage = get_salt_storage()
    storage.memory_store.clear()
    monkeypatch.setenv("USER_SALT_ROTATION_DAYS", "45")  # type: ignore[attr-defined]  # noqa: E501
    monkeypatch.setenv("GLOBAL_SALT_ROTATION_DAYS", "10")  # type: ignore[attr-defined]  # noqa: E501
    
    # Mock admin user
    mock_user = MagicMock()
    
    # Direct async call to reload endpoint
    r = await reload_salt_system(mock_user)
    
    assert r.rotation_intervals["user_days"] == 45
    assert r.rotation_intervals["global_days"] == 10
    
    # Ensure backend refresh occurred
    backend = get_salt_backend()
    # Create user salt then verify next_rotation interval approximates 45 days
    backend.create_user_salt("u1")
    
    # Direct async call to audit endpoint
    audit_r = await get_user_salt_audit("u1", mock_user)
    
    # next_rotation should be ~45 days from created_at
    created_at = audit_r.created_at
    next_rotation = audit_r.next_rotation
    
    assert created_at is not None
    assert next_rotation is not None
    
    created = datetime.fromisoformat(created_at)
    next_rot = datetime.fromisoformat(next_rotation)
    delta = next_rot - created
    assert 44 <= delta.days <= 46
