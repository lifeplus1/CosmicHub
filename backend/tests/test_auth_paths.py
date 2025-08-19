import sys
from pathlib import Path
from typing import Any, Dict

import pytest
from fastapi import HTTPException

# Ensure project root on path
ROOT = Path(__file__).resolve().parent.parent
PARENT = ROOT.parent
if str(PARENT) not in sys.path:
    sys.path.insert(0, str(PARENT))

import backend.auth as authmod  # type: ignore


class DummyCred:
    def __init__(self, token: str) -> None:
        self.scheme = "Bearer"
        self.credentials = token


@pytest.mark.asyncio
async def test_get_current_user_mock_mode(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(authmod, "firebase_available", False)
    user = await authmod.get_current_user(credentials=None)  # type: ignore[arg-type]
    assert user["uid"] == "dev-user"


@pytest.mark.asyncio
async def test_get_current_user_verify_failure(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(authmod, "firebase_available", True)
    monkeypatch.setattr(authmod, "_in_test_mode", lambda: False)

    class FakeAuth:
        @staticmethod
        def verify_id_token(token: str) -> Dict[str, Any]:  # noqa: D401
            raise Exception("BadToken")

    monkeypatch.setattr(authmod, "auth", FakeAuth)  # type: ignore[arg-type]
    cred = DummyCred("badtoken")
    with pytest.raises(HTTPException) as exc:
        await authmod.get_current_user(credentials=cred)  # type: ignore[arg-type]
    assert exc.value.status_code == 401
    assert "Authentication failed" in exc.value.detail


@pytest.mark.asyncio
async def test_get_current_user_success(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(authmod, "firebase_available", True)
    monkeypatch.setattr(authmod, "_in_test_mode", lambda: False)

    class FakeAuth:
        @staticmethod
        def verify_id_token(token: str) -> Dict[str, Any]:  # noqa: D401
            return {"uid": "real-user"}

    monkeypatch.setattr(authmod, "auth", FakeAuth)  # type: ignore[arg-type]
    cred = DummyCred("goodtoken")
    user = await authmod.get_current_user(credentials=cred)  # type: ignore[arg-type]
    assert user["uid"] == "real-user"
