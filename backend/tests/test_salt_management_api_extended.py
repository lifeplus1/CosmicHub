"""Extended tests for salt management API covering additional edge cases.

These complement `test_salt_management_api.py` focusing on:
 - Env flag SALT_BACKEND=firestore fallback behavior
 - Rotation interval env overrides reflected in status
 - Force create user rotation path
 - Missing user audit returns 404
 - Batch rotation when nothing due
 - Global salt rotation endpoint

Fixed version: Direct async calls to avoid TestClient hanging with async endpoints
"""

import asyncio
from unittest.mock import MagicMock
import pytest

from api.salt_management import (
    get_salt_status,
    rotate_user_salt,
    get_user_salt_audit,
    rotate_batch_salts,
    rotate_global_salt
)
from utils.salt_backend import get_salt_backend
from utils.salt_storage import SaltStorage, get_salt_storage


def _reset_storage() -> SaltStorage:  # shared helper mirroring base test file
    storage = get_salt_storage()
    storage.memory_store.clear()
    return storage


@pytest.mark.asyncio
async def test_status_storage_type_firestone_env(monkeypatch):  # type: ignore[no-untyped-def]  # noqa: E501
    _reset_storage()
    monkeypatch.setenv("SALT_BACKEND", "firestore")  # type: ignore[attr-defined]  # noqa: E501
    # Refresh backend so env is respected for new instance
    get_salt_backend(refresh=True)
    
    # Mock admin user
    mock_user = MagicMock()
    
    r = await get_salt_status(mock_user)
    
    # Fallback still memory until real Firestore
    assert r.storage_type == "memory"


@pytest.mark.asyncio
async def test_status_rotation_intervals_env_override(monkeypatch):  # type: ignore[no-untyped-def]  # noqa: E501
    _reset_storage()
    monkeypatch.setenv("USER_SALT_ROTATION_DAYS", "60")  # type: ignore[attr-defined]  # noqa: E501
    monkeypatch.setenv("GLOBAL_SALT_ROTATION_DAYS", "15")  # type: ignore[attr-defined]  # noqa: E501
    # Force backend refresh so intervals captured
    get_salt_backend(refresh=True)
    
    # Mock admin user
    mock_user = MagicMock()
    
    r = await get_salt_status(mock_user)
    
    assert r.rotation_intervals["user_days"] == 60
    assert r.rotation_intervals["global_days"] == 15


@pytest.mark.asyncio
async def test_force_create_user_rotation():  # type: ignore[no-untyped-def]
    storage = _reset_storage()
    assert storage.get_user_salt("force_user") is None
    
    # Mock admin user and background tasks
    mock_user = MagicMock()
    
    # Create a real BackgroundTasks instance that executes immediately for testing
    from fastapi import BackgroundTasks
    background_tasks = BackgroundTasks()
    
    r = await rotate_user_salt("force_user", background_tasks, force=True, user=mock_user)
    
    # Execute the background tasks immediately for testing
    for task in background_tasks.tasks:
        if hasattr(task, 'func') and hasattr(task, 'args') and hasattr(task, 'kwargs'):
            if asyncio.iscoroutinefunction(task.func):
                await task.func(*task.args, **task.kwargs)
            else:
                task.func(*task.args, **task.kwargs)
    
    assert r.user_id == "force_user"
    # Background task has run; salt should now exist
    assert storage.get_user_salt("force_user") is not None


@pytest.mark.asyncio
async def test_audit_missing_user_404():  # type: ignore[no-untyped-def]
    _reset_storage()
    
    # Mock admin user
    mock_user = MagicMock()
    
    # This should raise HTTPException with 404
    with pytest.raises(Exception) as exc_info:
        await get_user_salt_audit("missing_user", mock_user)
        
    # Check that it contains the expected error
    assert "not found" in str(exc_info.value) or "404" in str(exc_info.value)


@pytest.mark.asyncio
async def test_batch_rotation_nothing_due():  # type: ignore[no-untyped-def]
    _reset_storage()
    
    # Mock admin user and background tasks
    mock_user = MagicMock()
    mock_background_tasks = MagicMock()
    
    r = await rotate_batch_salts(mock_background_tasks, mock_user)
    
    assert r.users_to_rotate == 0
    assert r.globals_to_rotate == 0


@pytest.mark.asyncio
async def test_global_salt_rotation():  # type: ignore[no-untyped-def]
    storage = _reset_storage()
    assert storage.get_global_salt("events") is None
    
    # Mock admin user
    mock_user = MagicMock()
    
    # Create a real BackgroundTasks instance that executes immediately for testing
    from fastapi import BackgroundTasks
    background_tasks = BackgroundTasks()
    
    # Call with the specific salt type "events"
    r = await rotate_global_salt("events", background_tasks, mock_user)
    
    # Execute the background tasks immediately for testing
    for task in background_tasks.tasks:
        if hasattr(task, 'func') and hasattr(task, 'args') and hasattr(task, 'kwargs'):
            if asyncio.iscoroutinefunction(task.func):
                await task.func(*task.args, **task.kwargs)
            else:
                task.func(*task.args, **task.kwargs)
    
    # After background task, global salt should exist
    assert storage.get_global_salt("events") is not None
    assert r.salt_type == "events"
    assert "initiated" in r.message  # The message says "rotation initiated"
