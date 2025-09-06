#!/usr/bin/env python3
"""
Test script to verify FastAPI spiritual endpoints work with proper data structures
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from fastapi.testclient import TestClient
from fastapi import FastAPI

# Import the spiritual routers directly
from api.routers.spiritual_ai import router as spiritual_ai_router

def test_synthesize_endpoint():
    """Test that the synthesize endpoint works with proper astrology data"""
    
    # Create test app
    app = FastAPI()
    app.include_router(spiritual_ai_router)
    
    # Proper astrology data structure following the Type Bridge pattern
    sample_astrology_data = {
        "planets": {
            "sun": {
                "position": 285.6,
                "sign": "capricorn", 
                "degree": 15.6,
                "house": "4",
                "retrograde": False
            },
            "moon": {
                "position": 125.3,
                "sign": "leo",
                "degree": 5.3, 
                "house": "11",
                "retrograde": False
            },
            "mercury": {
                "position": 275.8,
                "sign": "capricorn",
                "degree": 5.8,
                "house": "4", 
                "retrograde": True
            }
        },
        "houses": {
            "house_1": {
                "cusp": 155.23,
                "sign": "virgo",
                "degree": 5.23,
                "ruler": "mercury"
            },
            "house_4": {
                "cusp": 268.15,
                "sign": "sagittarius", 
                "degree": 28.15,
                "ruler": "jupiter"
            },
            "house_11": {
                "cusp": 105.33,
                "sign": "cancer",
                "degree": 15.33,
                "ruler": "moon"
            }
        },
        "aspects": [
            {
                "planet1": "sun",
                "planet2": "moon", 
                "type": "trine",
                "orb": 2.5,
                "applying": "applying"
            },
            {
                "planet1": "mercury",
                "planet2": "sun",
                "type": "conjunction", 
                "orb": 1.2,
                "applying": "separating"
            }
        ],
        "angles": {
            "ascendant": 155.23,
            "midheaven": 88.15,
            "descendant": 335.23,
            "imumcoeli": 268.15
        },
        "birth_data": {
            "year": 1990,
            "month": 1,
            "day": 15,
            "hour": 14,
            "minute": 30,
            "city": "New York",
            "latitude": 40.7128,
            "longitude": -74.0060,
            "timezone": "America/New_York"
        },
        "metadata": {
            "house_system": "placidus",
            "zodiac_system": "tropical",
            "calculation_time": "2025-09-04T18:00:00Z"
        }
    }
    
    # Test data with proper structure
    test_data = {
        "astrology_data": sample_astrology_data,
        "user_context": {
            "spiritual_interests": ["astrology", "meditation"],
            "experience_level": "intermediate"
        }
    }
    
    with TestClient(app) as client:
        response = client.post("/spiritual-ai/synthesize", json=test_data)
        print(f"✅ Spiritual AI Synthesize: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"   Themes: {result.get('unified_themes', [])}")
            print(f"   Confidence: {result.get('synthesis_confidence', 0)}")
        else:
            print(f"❌ Error: {response.text}")

    print("✅ Synthesize endpoint test completed!")

if __name__ == "__main__":
    test_synthesize_endpoint()
