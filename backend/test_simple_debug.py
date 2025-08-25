import os
import time
from typing import Dict, Any

# Set test environment
os.environ["TEST_MODE"] = "1"
os.environ["ENABLE_TRACING"] = "false"
os.environ["INTERPRETATION_CACHE_TTL"] = "120"
os.environ["DISABLE_CSRF"] = "1"  # Disable CSRF for testing
os.environ["DEPLOY_ENVIRONMENT"] = "test"  # Explicitly set test environment
os.environ["REDIS_URL"] = "redis://127.0.0.1:9999"  # Use non-existent Redis for testing

print("=== Simple Debug Test (REL-012 Fixed) ===")

from fastapi.testclient import TestClient
from main import app

def test_simple():
    try:
        client = TestClient(app)
        print("✓ TestClient created")

        # Test with minimal payload first
        print("🔍 Testing minimal chart save...")
        minimal_payload: Dict[str, Any] = {
            "planets": [{"name": "Sun", "sign": "Leo", "degree": 15.0, "house": 1, "aspects": []}],
            "asteroids": [],
            "angles": [],
            "houses": [{"number": 1, "sign": "Leo", "cusp": 15.0, "planets": []}],
            "aspects": []
        }

        print("🔍 About to make POST request...")

        start_time = time.time()

        # Make the request (should not timeout anymore with our fix)
        resp = client.post(
            "/api/charts/save",
            json=minimal_payload,
            headers={"Authorization": "Bearer test_rel012_fix"},
        )

        elapsed = time.time() - start_time
        print(f"✅ Response received in {elapsed:.3f}s (status: {resp.status_code})")

        if elapsed > 5.0:
            print(f"⚠️  Request took {elapsed:.3f}s - longer than expected but completed")
        else:
            print(f"🎉 REL-012 SUCCESS: Request completed quickly in {elapsed:.3f}s")

        if resp.status_code == 200:
            print(f"✅ Success: {resp.json()}")
        else:
            print(f"⚠️  Response: {resp.status_code} - {resp.text[:200]}")

    except Exception as e:
        print(f"❌ Test error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_simple()
