"""Tests for salt backend adapter selection."""

from utils.salt_backend import InMemorySaltBackend, get_salt_backend


def test_default_backend_memory(monkeypatch):  # type: ignore[no-untyped-def]
    monkeypatch.delenv("SALT_BACKEND", raising=False)  # type: ignore[attr-defined]  # noqa: E501
    b = get_salt_backend(refresh=True)
    assert isinstance(b, InMemorySaltBackend)


def test_firestore_flag_falls_back(monkeypatch):  # type: ignore[no-untyped-def]  # noqa: E501
    monkeypatch.setenv("SALT_BACKEND", "firestore")  # type: ignore[attr-defined]  # noqa: E501
    b = get_salt_backend(refresh=True)
    # Still memory until Firestore implemented
    assert isinstance(b, InMemorySaltBackend)
