#!/usr/bin/env python3
"""
Test script for Human Design and Gene Keys API endpoints
"""
import json
import requests
from datetime import datetime

# Backend URL
BASE_URL = "http://localhost:8000"

# Test birth data
test_birth_data = {
    "year": 1990,
    "month": 6,
    "day": 15,
    "hour": 14,
    "minute": 30,
    "city": "New York, NY",
    "timezone": "America/New_York",
    "lat": 40.7128,
    "lon": -74.0060
}

def test_human_design():
    """Test Human Design calculation endpoint"""
    print("Testing Human Design endpoint...")
    try:
        response = requests.post(f"{BASE_URL}/calculate-human-design", json=test_birth_data)
        if response.status_code == 200:
            data = response.json()
            print("✅ Human Design calculation successful!")
            print(f"Type: {data['human_design']['type']}")
            print(f"Strategy: {data['human_design']['strategy']}")
            print(f"Authority: {data['human_design']['authority']}")
            return True
        else:
            print(f"❌ Human Design failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Human Design error: {str(e)}")
        return False

def test_gene_keys():
    """Test Gene Keys calculation endpoint"""
    print("\nTesting Gene Keys endpoint...")
    try:
        response = requests.post(f"{BASE_URL}/calculate-gene-keys", json=test_birth_data)
        if response.status_code == 200:
            data = response.json()
            print("✅ Gene Keys calculation successful!")
            print(f"Life's Work: Gene Key {data['gene_keys']['life_work']['number']} - {data['gene_keys']['life_work']['name']}")
            print(f"Evolution: Gene Key {data['gene_keys']['evolution']['number']} - {data['gene_keys']['evolution']['name']}")
            return True
        else:
            print(f"❌ Gene Keys failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Gene Keys error: {str(e)}")
        return False

def test_gene_key_details():
    """Test Gene Key details endpoint"""
    print("\nTesting Gene Key details endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/gene-key/1")
        if response.status_code == 200:
            data = response.json()
            print("✅ Gene Key details successful!")
            print(f"Gene Key 1: {data['gene_key']['name']}")
            print(f"Shadow: {data['gene_key']['shadow']}")
            print(f"Gift: {data['gene_key']['gift']}")
            print(f"Siddhi: {data['gene_key']['siddhi']}")
            return True
        else:
            print(f"❌ Gene Key details failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Gene Key details error: {str(e)}")
        return False

def test_daily_contemplation():
    """Test daily contemplation endpoint"""
    print("\nTesting daily contemplation endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/daily-contemplation/1")
        if response.status_code == 200:
            data = response.json()
            print("✅ Daily contemplation successful!")
            print(f"Contemplation for Gene Key 1:")
            print(f"Focus: {data['contemplation']['focus']}")
            return True
        else:
            print(f"❌ Daily contemplation failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Daily contemplation error: {str(e)}")
        return False

def main():
    """Run all tests"""
    print("🧪 Testing Human Design & Gene Keys API Endpoints")
    print("=" * 50)
    
    results = []
    results.append(test_human_design())
    results.append(test_gene_keys())
    results.append(test_gene_key_details())
    results.append(test_daily_contemplation())
    
    print("\n" + "=" * 50)
    print(f"🎯 Test Results: {sum(results)}/{len(results)} passed")
    
    if all(results):
        print("🎉 All tests passed! Human Design & Gene Keys backend is working correctly.")
    else:
        print("⚠️  Some tests failed. Check the error messages above.")

if __name__ == "__main__":
    main()
