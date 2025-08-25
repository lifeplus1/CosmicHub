#!/usr/bin/env python3
"""Debug test to isolate the hanging issue"""

import os
import sys
from typing import Dict, Any

sys.path.insert(0, '/Users/Chris/Projects/CosmicHub/backend')

# Set test environment
os.environ["TEST_MODE"] = "1"
os.environ["ENABLE_TRACING"] = "false"
os.environ["INTERPRETATION_CACHE_TTL"] = "120"
os.environ["DISABLE_CSRF"] = "1"  # Disable CSRF for testing
os.environ["DEPLOY_ENVIRONMENT"] = "test"  # Explicitly set test environment

from fastapi.testclient import TestClient  # noqa: E402
from main import app  # noqa: E402

def test_interpretation_debug():  # noqa: E302
    print("=== Starting debug test ===")

    try:
        client = TestClient(app)
        print("✓ TestClient created")

        # Test chart save first
        print("🔍 Testing chart save...")
        save_payload: Dict[str, Any] = {
            "planets": [
                {
                    "name": "Sun",
                    "sign": "Leo",
                    "degree": 15.25,
                    "house": 5,
                    "aspects": [],
                }
            ],
            "asteroids": [],
            "angles": [
                {"name": "Ascendant", "sign": "Aries", "degree": 12.33}
            ],
            "houses": [
                {
                    "number": 1,
                    "sign": "Aries",
                    "cusp": 12.33,
                    "planets": ["Sun"],
                }
            ],
            "aspects": [
                {
                    "planet1": "Sun",
                    "planet2": "Mercury",
                    "type": "Conjunction",
                    "orb": 2.5,
                    "applying": True,
                }
            ],
        }

        resp_save = client.post(
            "/api/charts/save",
            json=save_payload,
            headers={"Authorization": "Bearer test"},
        )
        print(f"✓ Chart save response: {resp_save.status_code}")

        if resp_save.status_code != 200:
            print(f"❌ Save failed: {resp_save.text}")
            return

        chart_id = resp_save.json()["chart_id"]
        print(f"✓ Chart ID: {chart_id}")

        # Test interpretation generation
        print("🔍 Testing interpretation generation...")
        interp_payload: Dict[str, Any] = {
            "chartId": chart_id,
            "userId": "dev-user",
            "type": "natal",
            "interpretation_level": "basic",  # Use basic to simplify
        }

        print("📤 Sending interpretation request...")
        resp_interp = client.post(
            "/api/interpretations/generate",
            json=interp_payload,
            headers={"Authorization": "Bearer test"},
            timeout=10,  # Add timeout
        )
        print(f"✓ Interpretation response: {resp_interp.status_code}")

        if resp_interp.status_code == 200:
            data = resp_interp.json()
            print(f"✓ Success: {data.get('message', 'No message')}")
        else:
            print(f"❌ Failed: {resp_interp.text}")

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":  # noqa: E305
    test_interpretation_debug()
