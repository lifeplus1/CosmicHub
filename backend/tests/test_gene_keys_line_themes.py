"""Tests for Gene Keys line themes (IQ/EQ/SQ spheres).

Uses FastAPI TestClient for in-process testing (no external server needed).
"""

from __future__ import annotations

from typing import Any, Dict, TypedDict

import pytest
from fastapi.testclient import TestClient

from main import app  # FastAPI application

client = TestClient(app)


class GeneKey(TypedDict, total=False):
    number: int
    line: int
    name: str
    line_theme: str
    sphere_context: str


class RequestPayload(TypedDict):
    year: int
    month: int
    day: int
    hour: int
    minute: int
    lat: float
    lon: float
    timezone: str
    city: str


def _assert_gene_key_fields(sphere: str, data: Dict[str, Any]) -> None:
    assert "number" in data and isinstance(data["number"], int)
    assert (
        "line" in data
        and isinstance(data["line"], int)
        and 1 <= data["line"] <= 6
    )
    assert data.get("line_theme") not in (
        None,
        "",
    ), f"Missing line_theme for {sphere}"
    assert data.get("sphere_context") not in (
        None,
        "",
    ), f"Missing sphere_context for {sphere}"


def test_gene_keys_line_themes_basic() -> None:
    """Basic response includes line theme + sphere context for IQ/EQ/SQ."""
    payload: RequestPayload = {
        "year": 1990,
        "month": 6,
        "day": 15,
        "hour": 14,
        "minute": 30,
        # Provide lat/lon so geocoding is not required
        "lat": 40.7128,
        "lon": -74.0060,
        "timezone": "America/New_York",
        "city": "New York",
    }

    resp = client.post("/calculate-gene-keys", json=payload)
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert "gene_keys" in body, "gene_keys missing from response"
    gene_keys = body["gene_keys"]

    for sphere in ("iq", "eq", "sq"):
        assert sphere in gene_keys, f"{sphere} missing in gene_keys"
        _assert_gene_key_fields(sphere, gene_keys[sphere])


def test_gene_keys_line_themes_idempotent_same_input() -> None:
    """Calling endpoint twice with same input should produce consistent line/theme values."""  # noqa: E501
    payload: RequestPayload = {
        "year": 1990,
        "month": 6,
        "day": 15,
        "hour": 14,
        "minute": 30,
        "lat": 40.7128,
        "lon": -74.0060,
        "timezone": "America/New_York",
        "city": "New York",
    }

    first = client.post("/calculate-gene-keys", json=payload)
    second = client.post("/calculate-gene-keys", json=payload)
    assert first.status_code == 200 and second.status_code == 200
    gk1 = first.json()["gene_keys"]
    gk2 = second.json()["gene_keys"]
    for sphere in ("iq", "eq", "sq"):
        assert (
            gk1[sphere]["number"] == gk2[sphere]["number"]
        ), f"Gene Key number changed for {sphere}"
        assert (
            gk1[sphere]["line"] == gk2[sphere]["line"]
        ), f"Line changed for {sphere}"
        assert (
            gk1[sphere]["line_theme"] == gk2[sphere]["line_theme"]
        ), f"Line theme changed for {sphere}"


@pytest.mark.parametrize(
    "payload",
    [
        {  # Morning
            "year": 1985,
            "month": 1,
            "day": 5,
            "hour": 9,
            "minute": 12,
            "lat": 34.0522,
            "lon": -118.2437,
            "timezone": "America/Los_Angeles",
            "city": "Los Angeles",
        },
        {  # Evening
            "year": 2001,
            "month": 11,
            "day": 23,
            "hour": 20,
            "minute": 45,
            "lat": 51.5074,
            "lon": -0.1278,
            "timezone": "Europe/London",
            "city": "London",
        },
        {  # Near midnight
            "year": 1999,
            "month": 12,
            "day": 31,
            "hour": 23,
            "minute": 55,
            "lat": 35.6895,
            "lon": 139.6917,
            "timezone": "Asia/Tokyo",
            "city": "Tokyo",
        },
    ],
)
def test_gene_keys_line_themes_multiple_cases(
    payload: Dict[str, Any],
) -> None:  # payload matches RequestPayload shape
    """Multiple payloads still produce valid line themes & contexts for IQ/EQ/SQ."""  # noqa: E501
    resp = client.post("/calculate-gene-keys", json=payload)
    assert resp.status_code == 200, resp.text
    gene_keys = resp.json()["gene_keys"]
    for sphere in ("iq", "eq", "sq"):
        assert sphere in gene_keys, f"{sphere} missing"
        _assert_gene_key_fields(sphere, gene_keys[sphere])
