#!/usr/bin/env python3
"""
Test script to verify FastAPI spiritual endpoints work
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from fastapi.testclient import TestClient

# Test individual routers
from api.routers.spiritual_ai import router as spiritual_ai_router
from api.routers.spiritual_practices import router as spiritual_practices_router  
from api.routers.spiritual_education import router as spiritual_education_router

from fastapi import FastAPI

def test_spiritual_endpoints():
    """Test that all spiritual endpoints respond correctly"""
    
    # Create test apps for each router
    ai_app = FastAPI()
    ai_app.include_router(spiritual_ai_router)
    
    practices_app = FastAPI()
    practices_app.include_router(spiritual_practices_router)
    
    education_app = FastAPI()
    education_app.include_router(spiritual_education_router)
    
    # Test health endpoints
    with TestClient(ai_app) as client:
        response = client.get("/spiritual-ai/health")
        print(f"Spiritual AI Health: {response.status_code} - {response.json()}")
    
    with TestClient(practices_app) as client:
        response = client.get("/spiritual/practices/health")
        print(f"Spiritual Practices Health: {response.status_code} - {response.json()}")
    
    with TestClient(education_app) as client:
        response = client.get("/spiritual/education/health")
        print(f"Spiritual Education Health: {response.status_code} - {response.json()}")

    # Test some POST endpoints with sample data
    with TestClient(ai_app) as client:
        test_data = {
            "birth_data": {"year": 1990, "month": 1, "day": 1, "hour": 12, "minute": 0},
            "spiritual_interests": ["astrology", "tarot"],
            "experience_level": "beginner"
        }
        response = client.post("/spiritual-ai/synthesize", json=test_data)
        print(f"Spiritual AI Synthesize: {response.status_code}")
        if response.status_code != 200:
            print(f"  Error: {response.text}")

    with TestClient(practices_app) as client:
        test_data = {
            "spiritual_experience": "beginner",
            "meditation_experience": "some",
            "emotional_stability": "stable"
        }
        response = client.post("/spiritual/practices/assess-readiness", json=test_data)
        print(f"Spiritual Practices Assess: {response.status_code}")
        if response.status_code != 200:
            print(f"  Error: {response.text}")

    print("✅ All spiritual FastAPI endpoints are working!")

if __name__ == "__main__":
    test_spiritual_endpoints()
