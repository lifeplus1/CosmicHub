#!/usr/bin/env python3
import requests
from typing import Dict, Any

def test_backend() -> None:
    base_url = "http://localhost:8001"
    
    print("🧪 Testing CosmicHub Backend API")
    print(f"📍 Base URL: {base_url}")
    print("-" * 50)
    
    # Test 1: Health endpoint
    try:
        print("1. Testing health endpoint...")
        response = requests.get(f"{base_url}/health")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text}")
        print(f"   Headers: {dict(response.headers)}")
        print("   ✅ Health check passed\n")
    except Exception as e:
        print(f"   ❌ Health check failed: {e}\n")
    
    # Test 2: CORS headers with Origin
    try:
        print("2. Testing CORS headers...")
        headers = {
            'Origin': 'http://localhost:5175',
            'Access-Control-Request-Method': 'GET'
        }
        response = requests.get(f"{base_url}/health", headers=headers)
        print(f"   Status: {response.status_code}")
        cors_header = response.headers.get('Access-Control-Allow-Origin', 'Not found')
        print(f"   CORS Allow-Origin: {cors_header}")
        if cors_header != 'Not found':
            print("   ✅ CORS headers present\n")
        else:
            print("   ❌ CORS headers missing\n")
    except Exception as e:
        print(f"   ❌ CORS test failed: {e}\n")
    
    # Test 3: Human Design endpoint
    try:
        print("3. Testing Human Design calculation...")
        test_data: Dict[str, Any] = {
            'birth_date': '1990-01-01',
            'birth_time': '12:00',
            'birth_location': 'New York, NY',
            'latitude': 40.7128,
            'longitude': -74.0060,
            'timezone': 'America/New_York'
        }
        
        response = requests.post(
            f"{base_url}/calculate-human-design", 
            json=test_data,
            headers={'Origin': 'http://localhost:5175'}
        )
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Type: {data.get('type', 'Unknown')}")
            print(f"   Strategy: {data.get('strategy', 'Unknown')}")
            print("   ✅ Human Design calculation passed\n")
        else:
            print(f"   Response: {response.text}")
            print("   ❌ Human Design calculation failed\n")
    except Exception as e:
        print(f"   ❌ Human Design test failed: {e}\n")

if __name__ == "__main__":
    test_backend()
