"""
Integration test for vectorized synastry calculations
Tests the complete flow from API request to vectorized calculation
"""

import sys
from fastapi.testclient import TestClient

# Add backend to path
sys.path.append('/Users/Chris/Projects/CosmicHub')

def test_vectorized_synastry_integration():
    """Test that vectorized synastry calculations work end-to-end."""
    
    # Import the FastAPI app and create test client
    from backend.main import app
    client = TestClient(app)
    
    # Prepare test data
    test_request: dict[str, dict[str, object]] = {
        "person1": {
            "date": "1990-06-15",
            "time": "14:30",
            "city": "New York",
            "country": "USA",
            "latitude": 40.7128,
            "longitude": -74.0060,
            "timezone": "America/New_York",
            "datetime": "1990-06-15T14:30:00-04:00"
        },
        "person2": {
            "date": "1985-12-20",
            "time": "09:15",
            "city": "Los Angeles",
            "country": "USA",
            "latitude": 34.0522,
            "longitude": -118.2437,
            "timezone": "America/Los_Angeles",
            "datetime": "1985-12-20T09:15:00-08:00"
        }
    }
    
    # Test traditional calculation
    print("Testing traditional synastry calculation...")
    response_traditional = client.post(
        "/synastry/calculate-synastry?use_vectorized=false",
        json=test_request
    )
    
    # Test vectorized calculation
    print("Testing vectorized synastry calculation...")
    response_vectorized = client.post(
        "/synastry/calculate-synastry?use_vectorized=true",
        json=test_request
    )
    
    # Validate both responses
    assert response_traditional.status_code == 200
    assert response_vectorized.status_code == 200
    
    traditional_data = response_traditional.json()
    vectorized_data = response_vectorized.json()
    
    # Validate response structure
    required_fields = ['compatibility_analysis', 'interaspects', 'house_overlays', 'composite_chart', 'summary']
    
    for field in required_fields:
        assert field in traditional_data, f"Missing field {field} in traditional response"
        assert field in vectorized_data, f"Missing field {field} in vectorized response"
    
    # Validate that both methods produce similar results
    # (exact match not expected due to floating point precision)
    traditional_score = traditional_data['compatibility_analysis']['overall_score']
    vectorized_score = vectorized_data['compatibility_analysis']['overall_score']
    
    score_difference = abs(traditional_score - vectorized_score)
    assert score_difference < 5.0, f"Score difference too large: {score_difference}"
    
    print(f"✅ Traditional score: {traditional_score}")
    print(f"✅ Vectorized score: {vectorized_score}")
    print(f"✅ Score difference: {score_difference} (acceptable)")
    
    print("\n🎉 Integration test passed!")
    print("   ✅ Both traditional and vectorized endpoints working")
    print("   ✅ Response structure validated")
    print("   ✅ Results are consistent between methods")
    print("   ✅ Ready for Phase 2 - Advanced testing and optimization")

if __name__ == "__main__":
    try:
        test_vectorized_synastry_integration()
    except Exception as e:
        print(f"❌ Integration test failed: {e}")
        import traceback
        traceback.print_exc()
