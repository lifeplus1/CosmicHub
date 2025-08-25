"""
Quick debug script to test the Firebase auth service directly
"""

import asyncio
import os

# Set test environment
os.environ["TEST_MODE"] = "1"
os.environ["FIREBASE_AUTH_TIMEOUT"] = "2.0"

async def test_firebase_auth_service():  # noqa: E302
    from utils.firebase_auth_service import verify_firebase_token

    print("🔍 Testing Firebase auth service directly...")

    try:
        result = await verify_firebase_token("test_token_direct")
        print(f"✅ Direct auth test successful: {result['uid']}")

        # Test the charts dependency function
        print("🔍 Testing charts dependency function...")
        from api.charts import verify_id_token_dependency

        # This is a synchronous function
        result2 = verify_id_token_dependency("Bearer test_charts_dependency")
        print(f"✅ Charts dependency test successful: {result2['uid']}")

        print("🎉 All tests passed - Firebase auth service is working!")

    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_firebase_auth_service())
