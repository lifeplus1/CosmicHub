# Test script for synastry backend integration
import asyncio

import httpx


async def test_synastry_endpoint():
    """Test the synastry calculation endpoint."""

    # Sample birth data
    test_data = {
        "person1": {
            "date": "1990-01-01",
            "time": "12:00",
            "city": "New York",
            "country": "USA",
            "latitude": 40.7128,
            "longitude": -74.0060,
            "timezone": "America/New_York",
            "datetime": "1990-01-01T12:00:00-05:00",
        },
        "person2": {
            "date": "1992-05-15",
            "time": "14:30",
            "city": "Los Angeles",
            "country": "USA",
            "latitude": 34.0522,
            "longitude": -118.2437,
            "timezone": "America/Los_Angeles",
            "datetime": "1992-05-15T14:30:00-08:00",
        },
    }

    async with httpx.AsyncClient() as client:
        try:
            print("Testing synastry endpoint...")
            response = await client.post(
                "http://localhost:8000/api/calculate-synastry",
                json=test_data,
                timeout=30.0,
            )

            print(f"Status: {response.status_code}")

            if response.status_code == 200:
                result = response.json()
                print("✅ Synastry calculation successful!")
                print(
                    f"Overall compatibility: {result['compatibility_analysis']['overall_score']}"  # noqa: E501
                )
                print(f"Number of interaspects: {len(result['interaspects'])}")
                print(
                    f"Number of house overlays: {len(result['house_overlays'])}"  # noqa: E501
                )
                print(
                    f"Relationship purpose: {result['composite_chart']['relationship_purpose']}"  # noqa: E501
                )
                return True
            else:
                print(f"❌ Error: {response.status_code}")
                print(response.text)
                return False

        except Exception as e:
            print(f"❌ Exception: {str(e)}")
            return False


if __name__ == "__main__":
    success = asyncio.run(test_synastry_endpoint())
    if success:
        print("\n🎉 Synastry backend integration test passed!")
    else:
        print("\n💥 Synastry backend integration test failed!")
