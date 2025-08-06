def test_human_design_invalid_data():
    """Test Human Design endpoint with invalid data (missing fields)"""
    bad_data = {"year": 1990}  # Missing required fields
    response = requests.post(f"{BASE_URL}/calculate-human-design", json=bad_data)
    assert response.status_code != 200, "Expected failure for invalid data"

def test_gene_keys_invalid_data():
    """Test Gene Keys endpoint with invalid data (missing fields)"""
    bad_data = {"year": 1990}
    response = requests.post(f"{BASE_URL}/calculate-gene-keys", json=bad_data)
    assert response.status_code != 200, "Expected failure for invalid data"

def test_gene_key_details_not_found():
    """Test Gene Key details endpoint for non-existent gene key"""
    response = requests.get(f"{BASE_URL}/gene-key/9999")
    assert response.status_code == 404 or response.status_code == 400, "Should return 404 or 400 for missing gene key"

def test_daily_contemplation_not_found():
    """Test daily contemplation endpoint for non-existent gene key"""
    response = requests.get(f"{BASE_URL}/daily-contemplation/9999")
    assert response.status_code == 404 or response.status_code == 400, "Should return 404 or 400 for missing gene key"

def test_human_design_edge_case():
    """Test Human Design endpoint with edge case data (leap year, extreme lat/lon)"""
    edge_data = {
        "year": 2000,
        "month": 2,
        "day": 29,
        "hour": 23,
        "minute": 59,
        "city": "Ushuaia, Argentina",
        "timezone": "America/Argentina/Ushuaia",
        "lat": -54.8019,
        "lon": -68.3030
    }
    response = requests.post(f"{BASE_URL}/calculate-human-design", json=edge_data)
    assert response.status_code == 200, f"Edge case failed: {response.status_code} - {response.text}"
#!/usr/bin/env python3
"""
Test script for Human Design and Gene Keys API endpoints
"""
import requests

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
        assert response.status_code == 200, f"❌ Human Design failed: {response.status_code} - {response.text}"
        data = response.json()
        print("✅ Human Design calculation successful!")
        print(f"Type: {data['human_design']['type']}")
        print(f"Strategy: {data['human_design']['strategy']}")
        print(f"Authority: {data['human_design']['authority']}")
    except Exception as e:
        assert False, f"❌ Human Design error: {str(e)}"

def test_gene_keys():
    """Test Gene Keys calculation endpoint"""
    print("\nTesting Gene Keys endpoint...")
    try:
        response = requests.post(f"{BASE_URL}/calculate-gene-keys", json=test_birth_data)
        assert response.status_code == 200, f"❌ Gene Keys failed: {response.status_code} - {response.text}"
        data = response.json()
        print("✅ Gene Keys calculation successful!")
        print(f"Life's Work: Gene Key {data['gene_keys']['life_work']['number']} - {data['gene_keys']['life_work']['name']}")
        print(f"Evolution: Gene Key {data['gene_keys']['evolution']['number']} - {data['gene_keys']['evolution']['name']}")
    except Exception as e:
        assert False, f"❌ Gene Keys error: {str(e)}"

def test_gene_key_details():
    """Test Gene Key details endpoint"""
    print("\nTesting Gene Key details endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/gene-key/1")
        assert response.status_code == 200, f"❌ Gene Key details failed: {response.status_code} - {response.text}"
        data = response.json()
        print("✅ Gene Key details successful!")
        print(f"Gene Key 1: {data['gene_key']['name']}")
        print(f"Shadow: {data['gene_key']['shadow']}")
        print(f"Gift: {data['gene_key']['gift']}")
        print(f"Siddhi: {data['gene_key']['siddhi']}")
    except Exception as e:
        assert False, f"❌ Gene Key details error: {str(e)}"

def test_daily_contemplation():
    """Test daily contemplation endpoint"""
    print("\nTesting daily contemplation endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/daily-contemplation/1")
        assert response.status_code == 200, f"❌ Daily contemplation failed: {response.status_code} - {response.text}"
        data = response.json()
        print("✅ Daily contemplation successful!")
        print(f"Contemplation for Gene Key 1:")
        print(f"Focus: {data['contemplation']['focus']}")
    except Exception as e:
        assert False, f"❌ Daily contemplation error: {str(e)}"

## Removed main() runner and all() logic; only pytest-compatible test functions remain
