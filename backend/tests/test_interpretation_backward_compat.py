from _pytest.monkeypatch import MonkeyPatch
from unittest.mock import MagicMock, patch
from typing import Dict, Any, Optional
import pytest

from api.charts import save_chart_unified, ChartData, Planet, Angle, House
from api.interpretations import generate_interpretation_endpoint, GenerateInterpretationRequest


@pytest.mark.asyncio
async def test_interpretation_backward_compat(monkeypatch: MonkeyPatch):
    monkeypatch.setenv("TEST_MODE", "1")
    monkeypatch.setenv("ENABLE_METRICS", "false")
    monkeypatch.setenv("ENABLE_TRACING", "false")

    # Mock user and astro service with proper async methods
    mock_user = {"uid": "dev-user", "email": "test@test.com"}
    mock_astro_service = MagicMock()
    
    # Make async methods actually async
    async def mock_get_cached_data(key):  # type: ignore
        return None  # No cache initially
        
    async def mock_get_chart_data(chart_id: str) -> Optional[Dict[str, Any]]:
        return {
            "planets": {
                "sun": {"sign": "Leo", "degree": 5.0, "house": 5}
            },
            "houses": {"house_1": {"sign": "Aries", "cusp": 12.33}},
            "angles": {"ascendant": {"sign": "Aries", "degree": 12.33}},
            "aspects": []
        }
        
    async def mock_cache_serialized_data(key, data, expire_seconds=None):  # type: ignore
        return True
        
    mock_astro_service.get_cached_data = mock_get_cached_data
    mock_astro_service.get_chart_data = mock_get_chart_data
    mock_astro_service.cache_serialized_data = mock_cache_serialized_data

    # Create chart data using proper Pydantic models
    chart_data = ChartData(
        planets=[
            Planet(
                name="Sun",
                sign="Leo",
                degree=5.0,
                house=5,
                aspects=[],
            )
        ],
        asteroids=[],
        angles=[
            Angle(name="Ascendant", sign="Aries", degree=12.33)
        ],
        houses=[
            House(
                number=1,
                sign="Aries",
                cusp=12.33,
                planets=["Sun"],
            )
        ],
        aspects=[],
    )

    # Direct async call to save chart
    save_resp = await save_chart_unified(
        chart_data, mock_user, mock_astro_service
    )
    chart_id = save_resp["chart_id"]

    # Direct async call to generate interpretation
    interp_req = GenerateInterpretationRequest(
        chartId=chart_id, 
        userId="dev-user", 
        type="natal"
    )
    
    with patch("api.interpretations.generate_interpretation") as mock_generate:
        mock_generate.return_value = {
            "core_identity": {
                "sun_identity": {
                    "archetype": "The Leader",
                    "description": "Leo Sun test interpretation"
                }
            }
        }
        
        interp_resp = await generate_interpretation_endpoint(
            interp_req, mock_user, mock_astro_service
        )
        
    assert interp_resp.success is True

    # Second call should also work (basic backward compatibility test)
    interp_resp2 = await generate_interpretation_endpoint(
        interp_req, mock_user, mock_astro_service
    )
    assert interp_resp2.success is True
    payload = interp_resp2.data[0]
    # Check version fields are set properly
    assert hasattr(payload, 'version')
    assert hasattr(payload, 'schemaVersion')
