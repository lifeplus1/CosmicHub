import sys
from pathlib import Path
from typing import Any, Dict

ROOT = Path(__file__).resolve().parent.parent
PARENT = ROOT.parent
if str(PARENT) not in sys.path:
    sys.path.insert(0, str(PARENT))

import pytest  # noqa: E402
from fastapi import HTTPException  # noqa: E402

from astro.calculations.transits_clean import calculate_transits, calculate_lunar_transits, TransitCalculationRequest, LunarTransitRequest  # noqa: E402


def _base_birth() -> Dict[str, Any]:
    return {
        "birth_date": "1990-01-01",
        "birth_time": "00:00:00",
        "latitude": 0.0,
        "longitude": 0.0,
        "timezone": "UTC",
    }


@pytest.mark.asyncio
async def test_transits_date_range_exceeds_limit() -> None:
    payload: Dict[str, Any] = {
        "birth_data": _base_birth(),
        "date_range": {
            "start_date": "1990-01-01",
            "end_date": "1992-01-01",
        },  # > 365 days
        "include_minor_aspects": False,
        "include_asteroids": False,
        "orb": 2.0,
    }
    
    # Mock background tasks
    from fastapi import BackgroundTasks
    mock_background_tasks = BackgroundTasks()
    
    # Create request object
    transit_request = TransitCalculationRequest(**payload)
    
    # Direct async call should raise HTTPException
    with pytest.raises(HTTPException) as exc_info:
        await calculate_transits(transit_request, mock_background_tasks)
    
    assert exc_info.value.status_code == 400
    assert "cannot exceed" in str(exc_info.value.detail).lower()


@pytest.mark.asyncio
async def test_lunar_transits_date_range_exceeds_limit() -> None:
    payload: Dict[str, Any] = {
        "birth_data": _base_birth(),
        "date_range": {
            "start_date": "1990-01-01",
            "end_date": "1991-05-01",
        },  # > 90 days
        "include_void_of_course": False,
        "include_daily_phases": True,
    }
    
    # Mock background tasks
    from fastapi import BackgroundTasks
    mock_background_tasks = BackgroundTasks()
    
    # Create request object
    lunar_request = LunarTransitRequest(**payload)
    
    # Direct async call should raise HTTPException
    with pytest.raises(HTTPException) as exc_info:
        await calculate_lunar_transits(lunar_request, mock_background_tasks)
    
    assert exc_info.value.status_code == 400
    assert "cannot exceed" in str(exc_info.value.detail).lower()


@pytest.mark.asyncio
async def test_minor_aspects_toggle(monkeypatch: pytest.MonkeyPatch) -> None:
    # For deterministic behavior monkeypatch calculate_aspect to yield a minor aspect in range  # noqa: E501
    from astro.calculations import transits_clean as tc

    calls = {"count": 0}

    def fake_calculate_aspect(
        pos1: float, pos2: float, orb: float = 2.0
    ) -> Dict[str, Any]:  # noqa: D401
        # always return a minor aspect so filtering matters
        calls["count"] += 1
        return {
            "aspect": "semi-square",
            "angle": 45.0,
            "orb": 0.5,
            "intensity": 80.0,
            "energy": "tension",
            "type": "minor",
        }

    monkeypatch.setattr(tc, "calculate_aspect", fake_calculate_aspect)

    # Mock background tasks
    from fastapi import BackgroundTasks
    mock_background_tasks = BackgroundTasks()

    base_payload: Dict[str, Any] = {
        "birth_data": _base_birth(),
        "date_range": {"start_date": "1990-01-01", "end_date": "1990-01-02"},
        "include_asteroids": False,
        "orb": 2.0,
    }

    # Without minor aspects
    payload_no_minor: Dict[str, Any] = dict(
        base_payload, include_minor_aspects=False
    )
    transit_request_1 = TransitCalculationRequest(**payload_no_minor)
    data1 = await calculate_transits(transit_request_1, mock_background_tasks)
    assert (
        all(item.aspect != "semi-square" for item in data1)  # type: ignore
        or len(data1) == 0
    )

    # With minor aspects
    payload_minor: Dict[str, Any] = dict(
        base_payload, include_minor_aspects=True
    )
    transit_request_2 = TransitCalculationRequest(**payload_minor)
    data2 = await calculate_transits(transit_request_2, mock_background_tasks)
    assert any(item.aspect == "semi-square" for item in data2)  # type: ignore
    assert calls["count"] > 0
