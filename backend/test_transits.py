#!/usr/bin/env python3
"""Test script for transit calculations via API"""

import sys

# Simple test to verify the backend server is working
def test_backend_import():
    """Test that we can import our transit module"""
    try:
        sys.path.append('.')
        from astro.calculations.transits_clean import router
        print("✓ Transit module imported successfully")
        print(f"✓ Router has {len(router.routes)} routes")
        
        # List the available routes
        for route in router.routes:
            print(f"  - {getattr(route, 'methods', 'N/A')} {getattr(route, 'path', 'N/A')}")  # type: ignore
            
        return True
    except Exception as e:
        print(f"✗ Import failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_swisseph():
    """Test SwissEph library"""
    try:
        import swisseph as swe  # type: ignore
        print(f"✓ SwissEph version: {swe.version}")  # type: ignore
        
        # Test basic calculation
        jd = swe.julday(2025, 1, 1, 12.0)  # type: ignore
        print(f"✓ Julian day calculation: {jd}")
        
        # Test planet calculation
        result, _ = swe.calc(jd, swe.SUN)  # type: ignore
        print(f"✓ Sun position on 2025-01-01: {result[0]:.2f}° longitude")  # type: ignore
        
        return True
    except Exception as e:
        print(f"✗ SwissEph test failed: {e}")
        return False

if __name__ == "__main__":
    print("=== Transit Calculation Backend Tests ===\n")
    
    print("1. Testing SwissEph library...")
    swisseph_ok = test_swisseph()
    
    print("\n2. Testing transit module import...")
    import_ok = test_backend_import()
    
    print(f"\n=== Test Results ===")
    print(f"SwissEph: {'✓ PASS' if swisseph_ok else '✗ FAIL'}")
    print(f"Transit Module: {'✓ PASS' if import_ok else '✗ FAIL'}")
    
    if swisseph_ok and import_ok:
        print("\n✓ Backend is ready for API testing!")
        print("Next step: Start the FastAPI server and test endpoints")
    else:
        print("\n✗ Backend has issues that need to be resolved")
