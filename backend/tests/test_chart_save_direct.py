"""
Direct test of chart save and interpretation flow without TestClient.
This bypasses the TestClient hanging issue by calling the functions directly.
"""
import os
import pytest

# Set test environment before any imports
os.environ["TEST_MODE"] = "1"
os.environ["ENABLE_TRACING"] = "false"
os.environ["INTERPRETATION_CACHE_TTL"] = "120"


@pytest.mark.asyncio
async def test_chart_save_and_interpretation_flow_direct():  
    """End-to-end test using direct function calls instead of TestClient."""
    # Import the functions we need to test directly
    from api.charts import save_chart_unified, ChartData, Planet, Angle, House, Aspect
    from api.interpretations import generate_interpretation_endpoint, GenerateInterpretationRequest
    from api.services.astro_service import AstroService

    # Mock auth token
    mock_token = {"uid": "dev-user"}
    
    # Create test chart data
    chart_data = ChartData(
        planets=[
            Planet(
                name="Sun",
                sign="Leo",
                degree=15.25,
                house=5,
                aspects=[],
            )
        ],
        asteroids=[],
        angles=[Angle(name="Ascendant", sign="Aries", degree=12.33)],
        houses=[
            House(
                number=1,
                sign="Aries",
                cusp=12.33,
                planets=["Sun"],
            )
        ],
        aspects=[
            Aspect(
                planet1="Sun",
                planet2="Mercury",
                type="Conjunction",
                orb=2.5,
                applying=True,
            )
        ],
    )

    # Test save chart directly
    astro_service = AstroService()
    resp_save = await save_chart_unified(chart_data, mock_token, astro_service)
    
    assert resp_save["status"] == "success"
    chart_id = resp_save["chart_id"]
    assert resp_save["version"] == "1.0.0"
    print(f"✅ Chart saved successfully with ID: {chart_id}")

    # Test that interpretation fails for missing chart first
    interp_request_missing = GenerateInterpretationRequest(
        chartId="non-existent",
        userId="dev-user",
        type="natal",
        interpretation_level="advanced",
    )
    
    # This should raise an HTTPException
    from fastapi import HTTPException
    try:
        await generate_interpretation_endpoint(interp_request_missing, mock_token, astro_service)
        assert False, "Should have raised HTTPException for missing chart"
    except HTTPException as e:
        assert e.status_code == 404
        assert "not found" in str(e.detail).lower()
        print("✅ Missing chart properly returns 404")

    # Test interpretation generation with saved chart
    interp_request = GenerateInterpretationRequest(
        chartId=chart_id,
        userId="dev-user", 
        type="natal",
        interpretation_level="advanced",
    )
    
    resp_interp = await generate_interpretation_endpoint(interp_request, mock_token, astro_service)
    assert resp_interp.success is True
    assert resp_interp.data[0].chartId == chart_id
    assert resp_interp.data[0].version == "1.0.0"
    print("✅ Interpretation generated successfully")

    # Test cached path
    resp_interp_cached = await generate_interpretation_endpoint(interp_request, mock_token, astro_service)
    assert resp_interp_cached.success is True
    assert resp_interp_cached.message and "cache" in resp_interp_cached.message.lower()
    assert resp_interp_cached.data[0].schemaVersion == "1.0.0"
    print("✅ Cached interpretation retrieved successfully")
    
    print("🎉 All tests passed!")
