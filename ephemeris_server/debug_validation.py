#!/usr/bin/env python3
"""
Debug script to test ephemeris server validation.
"""
import sys
import os
sys.path.insert(0, '/Users/Chris/Projects/CosmicHub/ephemeris_server')

import json
from fastapi.testclient import TestClient

# Import using absolute imports
from models import CalculationRequest

# Test the Pydantic model directly
print("Testing Pydantic model directly...")
try:
    req = CalculationRequest(julian_day=2451545.0, planet="sun")
    print(f"✅ Valid request: {req}")
except Exception as e:
    print(f"❌ Invalid request: {e}")

try:
    req = CalculationRequest(julian_day=2451545.0, planet="invalidplanet")
    print(f"✅ Valid request: {req}")
except Exception as e:
    print(f"❌ Invalid request: {e}")

print("\nTesting API endpoint...")
# Now test the endpoint - need to fix imports first
