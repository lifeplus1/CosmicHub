#!/usr/bin/env python3
"""
Quick test script to check if the charts endpoint is working
"""

import requests
import json

def test_charts_endpoint():
    url = "http://localhost:8000/api/charts/"
    headers = {
        "Authorization": "Bearer test-token",
        "Content-Type": "application/json"
    }
    
    try:
        print("Testing charts endpoint...")
        response = requests.get(url, headers=headers, timeout=5)
        print(f"Status Code: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            print("✅ Success!")
            try:
                data = response.json()
                print(f"Response data: {json.dumps(data, indent=2)}")
            except json.JSONDecodeError:
                print(f"Response text: {response.text}")
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")

if __name__ == "__main__":
    test_charts_endpoint()
