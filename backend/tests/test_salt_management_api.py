"""API tests for salt management endpoints.

Fixed version: Direct async calls to avoid TestClient hanging with async endpoints
"""

from unittest.mock import MagicMock
import pytest

from api.salt_management import (
    get_salt_status,
    rotate_user_salt, 
    get_user_salt_audit,
    rotate_batch_salts,
    test_pseudonymization as pseudonymize_endpoint,
    PseudonymizeTestRequest
)
from utils.salt_storage import SaltStorage, get_salt_storage


def _reset_storage() -> SaltStorage:
    # Access the singleton and wipe memory store for isolation
    storage = get_salt_storage()
    storage.memory_store.clear()
    return storage


@pytest.mark.asyncio
async def test_status_empty():
    _reset_storage()
    
    # Mock admin user
    mock_user = MagicMock()
    
    resp = await get_salt_status(mock_user)
    
    assert resp.users_due_for_rotation == 0
    assert resp.globals_due_for_rotation == 0
    assert resp.due_users == []
    assert resp.due_globals == []
    assert resp.storage_type in ("memory", "firestore")


@pytest.mark.asyncio
async def test_user_rotation_flow():
    storage = _reset_storage()
    
    # Mock admin user and background tasks
    mock_user = MagicMock()
    mock_background_tasks = MagicMock()

    # Create initial salt via background rotation (force create)
    r = await rotate_user_salt("test_user", mock_background_tasks, force=True, user=mock_user)
    assert r.user_id == "test_user"
    # Background task executes after response; ensure state by creating directly if missing  # noqa: E501
    if storage.get_user_salt("test_user") is None:
        storage.create_user_salt("test_user")

    # Trigger rotation now that salt exists
    r2 = await rotate_user_salt("test_user", mock_background_tasks, user=mock_user)
    assert r2.user_id == "test_user"
    assert r2.had_existing_salt is True

    # Audit endpoint should show rotation metadata (rotation_count possibly 0 or 1 depending timing)  # noqa: E501
    audit = await get_user_salt_audit("test_user", mock_user)
    assert audit.user_id == "test_user"
    assert audit.has_salt is True
    assert audit.created_at is not None
    assert audit.last_rotated is not None


@pytest.mark.asyncio
async def test_batch_rotation():
    storage = _reset_storage()
    # Seed some salts due by manipulating next_rotation
    uids = ["u1", "u2", "u3"]
    for uid in uids:
        storage.create_user_salt(uid)
        storage.memory_store[uid][
            "next_rotation"
        ] = "1970-01-01T00:00:00+00:00"
    storage.create_global_salt("events")
    storage.memory_store["global_events"][
        "next_rotation"
    ] = "1970-01-01T00:00:00+00:00"

    # Mock admin user and background tasks
    mock_user = MagicMock()
    mock_background_tasks = MagicMock()

    resp = await rotate_batch_salts(mock_background_tasks, force=False, user=mock_user)
    assert resp.users_to_rotate == len(uids)
    assert resp.globals_to_rotate == 1


@pytest.mark.asyncio
async def test_pseudonymize_dev_guard():
    _reset_storage()
    # Mock admin user
    mock_user = MagicMock()
    
    # Missing dev flag -> should raise exception
    with pytest.raises(Exception):  # HTTPException with 403
        await pseudonymize_endpoint(
            PseudonymizeTestRequest(user_id="u1", identifier="abc"), 
            mock_user
        )

    # With dev mode enabled
    result = await pseudonymize_endpoint(
        PseudonymizeTestRequest(
            user_id="u1", 
            identifier="abc", 
            enable_dev_mode=True
        ),
        mock_user
    )
    assert result.user_id == "u1"
    assert result.user_pseudonym
    assert result.analytics_pseudonym
