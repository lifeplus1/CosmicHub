#!/usr/bin/env python3
"""
Debug script to isolate the hanging issue in the chart save flow.
"""
import os
import asyncio
os.environ["TEST_MODE"] = "1"
os.environ["ENABLE_TRACING"] = "false"

async def test_astro_service():
    """Test just the AstroService initialization"""
    print("1. Testing AstroService initialization...")
    from api.services.astro_service import get_astro_service
    
    astro_service = await get_astro_service()
    print(f"   AstroService created: {type(astro_service)}")
    print(f"   Cache type: {type(astro_service.redis_cache)}")
    
    # Test cache operation
    print("2. Testing cache operation...")
    test_data = {"test": "data"}
    try:
        result = await asyncio.wait_for(
            astro_service.cache_chart_data("test_chart_123", test_data),
            timeout=5.0
        )
        print(f"   Cache result: {result}")
    except asyncio.TimeoutError:
        print("   Cache operation timed out!")
    except Exception as e:
        print(f"   Cache operation failed: {e}")

async def test_save_endpoint():
    """Test the save endpoint logic"""
    print("3. Testing save endpoint...")
    
    # Mock chart data similar to the test
    from api.charts import ChartData, Planet, House, Aspect, Angle
    
    chart_data = ChartData(
        planets=[
            Planet(
                name="Sun",
                sign="Leo", 
                degree=15.25,
                house=5,
                aspects=[]
            )
        ],
        asteroids=[],
        angles=[Angle(name="Ascendant", sign="Aries", degree=12.33)],
        houses=[
            House(
                number=1,
                sign="Aries", 
                cusp=12.33,
                planets=["Sun"]
            )
        ],
        aspects=[
            Aspect(
                planet1="Sun",
                planet2="Mercury",
                type="Conjunction", 
                orb=2.5,
                applying=True
            )
        ]
    )
    
    print(f"   Chart data created: {len(chart_data.planets)} planets")
    
    # Test serialization
    print("4. Testing serialization...")
    from api.utils.serialization import ChartData as SerializedChartData, serialize_data
    
    serialized_model = SerializedChartData(
        planets=[
            {
                "name": p.name,
                "sign": p.sign,
                "degree": p.degree,
                "position": p.degree,
                "house": p.house if p.house is not None else "",
            }
            for p in chart_data.planets
        ],
        houses=[
            {
                "number": h.number,
                "sign": h.sign,
                "cusp": h.cusp,
            }
            for h in chart_data.houses
        ],
        aspects=[
            {
                "planet1": a.planet1,
                "planet2": a.planet2,
                "type": a.type,
                "orb": a.orb,
                "applying": str(a.applying).lower() if a.applying is not None else "",
            }
            for a in chart_data.aspects
        ],
        asteroids=None,
        angles=[
            {
                "name": ang.name,
                "sign": ang.sign,
                "degree": ang.degree,
                "position": ang.degree,
            }
            for ang in chart_data.angles
        ] if chart_data.angles else None,
    )
    
    print(f"   Serialized model created")
    
    # Test serialize_data function
    serialized_json = serialize_data(serialized_model)
    print(f"   Serialized JSON length: {len(serialized_json)}")

async def main():
    """Run all tests"""
    try:
        await test_astro_service()
        await test_save_endpoint()
        print("\n✅ All tests completed successfully!")
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
