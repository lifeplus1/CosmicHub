"""Targeted tests for utils.ephemeris_client (non-network portions)."""
from __future__ import annotations
import pytest
import os
import utils.ephemeris_client as ec


def test_ephemeris_client_context_methods_exist():
    assert hasattr(ec.EphemerisClient, "__aenter__")
    assert hasattr(ec.EphemerisClient, "__aexit__")


@pytest.mark.asyncio
async def test_ephemeris_client_minimal_async_usage():
    os.environ["API_KEY"] = "test-key"
    client = ec.EphemerisClient(api_key="test-key")
    async with client as c:
        assert c is client
