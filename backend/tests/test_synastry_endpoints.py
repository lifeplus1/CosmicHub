"""Async integration-style tests for synastry advanced endpoints.

Uses direct async function invocation (no TestClient) to avoid the
auto-xfail marker applied to TestClient usage in this project.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import List

import pytest

from backend.routers.synastry import (  # type: ignore
    AdvancedSynastryRequest,
    BirthData,
    SynastryTimingRequest,
    SynastryComparisonRequest,
    SynastryComparisonInput,
    calculate_synastry_advanced,
    synastry_timing,
    synastry_compare,
)


def build_birth(dt: datetime) -> BirthData:
    tz = dt.tzinfo or timezone.utc
    return BirthData(
    year=dt.year,
    month=dt.month,
    day=dt.day,
    hour=dt.hour,
    minute=dt.minute,
        date=dt.strftime("%Y-%m-%d"),
        time=dt.strftime("%H:%M"),
        city="Test City",
        country="Testland",
        latitude=40.0,
        longitude=-74.0,
        timezone="UTC",
        datetime=dt.astimezone(tz).isoformat(),
    )


@pytest.mark.asyncio
async def test_calculate_synastry_advanced_basic_fields() -> None:
    p1 = build_birth(datetime(1990, 5, 4, 12, 0, tzinfo=timezone.utc))
    p2 = build_birth(datetime(1992, 7, 10, 6, 30, tzinfo=timezone.utc))
    req = AdvancedSynastryRequest(
        person1=p1,
        person2=p2,
        include_aspects=True,
        include_house_overlays=True,
    )
    resp = await calculate_synastry_advanced(req)
    assert resp.success is True
    analysis = resp.analysis
    assert analysis.analysis_level in {"basic", "intermediate", "advanced", "professional"}
    comp = analysis.compatibility_scores.model_dump()
    for key in [
        "overall_score",
        "romantic_score",
        "emotional_score",
        "mental_score",
        "physical_score",
        "spiritual_score",
        "communication_score",
        "conflict_resolution_score",
    ]:
        assert key in comp


@pytest.mark.asyncio
async def test_synastry_timing_endpoint_defaults() -> None:
    req = SynastryTimingRequest(
        current_phase="growth",
        next_phase="transformation",
        transition_period="2-3 months",
    )
    resp = await synastry_timing(req)
    assert resp.success is True
    assert resp.current_timing.current_phase == "growth"
    assert resp.current_timing.next_phase == "transformation"
    assert isinstance(resp.significant_transits, list)


@pytest.mark.asyncio
async def test_synastry_compare_ranking_logic() -> None:
    comparisons: List[SynastryComparisonInput] = [
        SynastryComparisonInput(
            person1_id="A",
            person2_id="B",
            match_score=82.5,
            sun_compatibility=80,
            moon_compatibility=78,
            venus_mars_compatibility=85,
            mercury_compatibility=79,
            growth_potential=80.0,
        ),
        SynastryComparisonInput(
            person1_id="A",
            person2_id="C",
            match_score=91.0,
            sun_compatibility=90,
            moon_compatibility=88,
            venus_mars_compatibility=89,
            mercury_compatibility=87,
            growth_potential=88.0,
        ),
        SynastryComparisonInput(
            person1_id="A",
            person2_id="D",
            match_score=77.0,
            sun_compatibility=70,
            moon_compatibility=72,
            venus_mars_compatibility=75,
            mercury_compatibility=74,
            growth_potential=70.0,
        ),
    ]
    req = SynastryComparisonRequest(base_person_id="A", comparisons=comparisons)
    resp = await synastry_compare(req)
    assert resp.success is True
    assert resp.ranking == ["C", "B", "D"], resp.ranking
    assert len(resp.comparisons) == 3
