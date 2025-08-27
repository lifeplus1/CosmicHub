#!/usr/bin/env python3
"""Test API endpoint for Gene Keys line themes"""

import requests
from typing import TypedDict, Dict, Any, cast

class GeneKey(TypedDict, total=False):
    number: int
    line: int
    name: str
    shadow: str
    gift: str
    siddhi: str
    description: str
    keynote: str
    codon: str
    programming_partner: int
    sphere: str
    line_theme: str
    sphere_context: str

class GeneKeysResponse(TypedDict, total=False):
    gene_keys: Dict[str, GeneKey]

class RequestPayload(TypedDict):
    year: int
    month: int
    day: int
    hour: int
    minute: int
    latitude: float
    longitude: float
    timezone: str
    city: str

def test_gene_keys_api() -> None:
    url = "http://localhost:8000/calculate-gene-keys"
    data: RequestPayload = {
        "year": 1990,
        "month": 6,
        "day": 15,
        "hour": 14,
        "minute": 30,
        "latitude": 40.7128,
        "longitude": -74.0060,
        "timezone": "America/New_York",
        "city": "New York, NY"
    }
    
    try:
        response = requests.post(url, json=data)
        if response.status_code == 200:
            raw: Any = response.json()
            parsed = cast(GeneKeysResponse, raw)
            gene_keys: Dict[str, GeneKey] = parsed.get("gene_keys", {})  # type: ignore[arg-type]
            
            print('API Response - Gene Keys with Line Themes:')
            print('=' * 50)
            
            for sphere in ['iq', 'eq', 'sq']:
                if sphere in gene_keys:
                    sphere_data = gene_keys[sphere]
                    print(f'{sphere.upper()} Sphere:')
                    number = sphere_data.get("number")
                    name = sphere_data.get("name")
                    line = sphere_data.get("line")
                    line_theme = sphere_data.get("line_theme")
                    sphere_context = sphere_data.get("sphere_context")
                    print(f'  Gene Key: {number}')
                    print(f'  Name: {name}')
                    print(f'  Line: {line}')
                    print(f'  Line Theme: {line_theme}')
                    print(f'  Sphere Context: {sphere_context}')
                    print()
        else:
            print(f"API Error: {response.status_code}")
            print(response.text)
            
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to backend server. Make sure it's running on localhost:8000")
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    test_gene_keys_api()
