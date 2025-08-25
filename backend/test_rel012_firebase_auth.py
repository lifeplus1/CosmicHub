"""
Test for REL-012: Firebase Auth Dependency Timeout Investigation

This test verifies that the new Firebase Auth service resolves the timeout
issues that were occurring during test execution.
"""

import asyncio
import os
import time
from typing import Any, Dict
from unittest.mock import patch
import pytest

# Set test environment before any imports
os.environ["TEST_MODE"] = "1"
os.environ["FIREBASE_AUTH_TIMEOUT"] = "2.0"  # 2 second timeout for testing
os.environ["FIREBASE_AUTH_FAILURE_THRESHOLD"] = "2"  # Lower threshold for testing

from utils.firebase_auth_service import (
    FirebaseAuthService,
    FirebaseAuthConfig,
    get_firebase_auth_service,
    verify_firebase_token,
)
from utils.circuit_breaker import CircuitBreakerError


class TestFirebaseAuthService:
    """Test cases for Firebase Auth service with timeout and circuit breaker protection"""

    def setup_method(self):
        """Reset singleton for each test"""
        # Clear the global singleton using public API
        from utils.firebase_auth_service import (
            configure_firebase_auth_service,
            FirebaseAuthConfig
        )
        configure_firebase_auth_service(FirebaseAuthConfig())

    @pytest.mark.asyncio
    async def test_mock_auth_in_test_environment(self):
        """Test that auth service uses mock authentication in test environment"""
        service = FirebaseAuthService()

        # Should be in test mode (checking via health status instead of private attr)
        health = service.get_health_status()
        assert health["test_mode"] is True

        # Verify token should return mock data without Firebase calls
        result = await service.verify_id_token("test_token")

        assert result["uid"] == "test_token"
        assert result["email"] == "test_token@test.com"
        assert result["email_verified"] is True
        assert "firebase" in result

    @pytest.mark.asyncio
    async def test_timeout_protection_when_firebase_unavailable(self):
        """Test that timeout protection works when Firebase is unavailable"""
        # Use environment variable to simulate non-test environment
        original_test_mode = os.environ.get("TEST_MODE")
        os.environ["TEST_MODE"] = "0"  # Disable test mode

        try:
            config = FirebaseAuthConfig()
            config.timeout = 1.0  # Very short timeout for testing

            service = FirebaseAuthService(config)

            # Mock Firebase admin to be available but slow
            def slow_verify(token: str) -> Dict[str, Any]:
                time.sleep(5)  # Simulate slow Firebase response
                return {"uid": token}

            with patch('firebase_admin.get_app'):
                with patch('firebase_admin.auth.verify_id_token',
                    side_effect=slow_verify):

                    start_time = time.time()

                    with pytest.raises(asyncio.TimeoutError):
                        await service.verify_id_token("test_token")

                    # Should timeout quickly, not take 5+ seconds
                    elapsed = time.time() - start_time
                    assert elapsed < 2.0, f"Should timeout quickly, but took {elapsed}s"

        finally:
            # Restore original test mode
            if original_test_mode:
                os.environ["TEST_MODE"] = original_test_mode
            else:
                os.environ.pop("TEST_MODE", None)

    @pytest.mark.asyncio
    async def test_circuit_breaker_protection(self):
        """Test that circuit breaker opens after repeated failures"""
        # Use environment variable to simulate non-test environment
        original_test_mode = os.environ.get("TEST_MODE")
        os.environ["TEST_MODE"] = "0"  # Disable test mode

        try:
            config = FirebaseAuthConfig()
            config.failure_threshold = 2  # Open circuit after 2 failures
            config.timeout = 1.0

            service = FirebaseAuthService(config)

            # Mock Firebase admin to be available but always fail
            with patch('firebase_admin.get_app'):
                with patch('firebase_admin.auth.verify_id_token',
                    side_effect=Exception("Firebase error")):

                    # First failure
                    with pytest.raises(Exception):
                        await service.verify_id_token("test_token")

                    # Second failure should open circuit
                    with pytest.raises(Exception):
                        await service.verify_id_token("test_token")

                    # Third call should be rejected by circuit breaker
                    with pytest.raises(CircuitBreakerError):
                        await service.verify_id_token("test_token")

        finally:
            # Restore original test mode
            if original_test_mode:
                os.environ["TEST_MODE"] = original_test_mode
            else:
                os.environ.pop("TEST_MODE", None)

    @pytest.mark.asyncio
    async def test_convenience_function(self):
        """Test the convenience function works correctly"""
        # Should use mock auth in test environment
        result = await verify_firebase_token("convenience_test")

        assert result["uid"] == "convenience_test"
        assert result["email"] == "convenience_test@test.com"

    def test_health_status_reporting(self):
        """Test that health status includes all relevant information"""
        service = FirebaseAuthService()

        health = service.get_health_status()

        assert health["service"] == "firebase_auth"
        assert health["test_mode"] is True
        assert "config" in health
        assert "timeout" in health["config"]
        assert "circuit_breaker_enabled" in health["config"]

    @pytest.mark.asyncio
    async def test_bearer_token_parsing(self):
        """Test that Bearer token prefixes are handled correctly"""
        service = FirebaseAuthService()

        # Test with Bearer prefix
        result = await service.verify_id_token("Bearer test_user")
        assert result["uid"] == "test_user"

        # Test without Bearer prefix
        result = await service.verify_id_token("test_user_2")
        assert result["uid"] == "test_user_2"

    @pytest.mark.asyncio
    async def test_singleton_pattern(self):
        """Test that get_firebase_auth_service returns singleton instance"""
        service1 = get_firebase_auth_service()
        service2 = get_firebase_auth_service()

        assert service1 is service2  # Same instance

    @pytest.mark.asyncio
    async def test_performance_improvement(self):
        """
        Test that the new auth service completes quickly in test environment.

        This is the main test for REL-012 - ensuring we no longer have
        10+ second hangs during test execution.
        """
        start_time = time.time()

        # Perform multiple auth operations
        for i in range(5):
            result = await verify_firebase_token(f"perf_test_{i}")
            assert result["uid"] == f"perf_test_{i}"

        elapsed = time.time() - start_time

        # All 5 operations should complete in well under 1 second
        assert elapsed < 1.0, f"Auth operations too slow: {elapsed}s (should be <1s)"

        print(f"✅ Performance test passed: 5 auth operations in {elapsed:.3f}s")


@pytest.mark.asyncio
async def test_integration_with_charts_endpoint():
    """
    Integration test to verify the charts endpoint no longer hangs.
    This directly addresses the original REL-012 issue.
    """
    from fastapi.testclient import TestClient
    from main import app

    client = TestClient(app)

    start_time = time.time()

    # This is the exact request that was hanging before
    minimal_payload: Dict[str, Any] = {
        "planets": [{"name": "Sun", "sign": "Leo", "degree": 15.0, "house": 1, "aspects": []}],
        "asteroids": [],
        "angles": [],
        "houses": [{"number": 1, "sign": "Leo", "cusp": 15.0, "planets": []}],
        "aspects": []
    }

    response = client.post(
        "/api/charts/save",
        json=minimal_payload,
        headers={"Authorization": "Bearer integration_test"},
    )

    elapsed = time.time() - start_time

    # Should complete quickly without hanging
    assert elapsed < 5.0, f"Request took too long: {elapsed}s (should be <5s)"

    # Should get a response (success or auth error, but not a timeout)
    assert response.status_code in [200, 401], f"Unexpected status: {response.status_code}"

    print(f"✅ Integration test passed: Request completed in {elapsed:.3f}s")


if __name__ == "__main__":
    # Run the performance test directly for quick verification


    async def main():
        test_service = TestFirebaseAuthService()
        test_service.setup_method()
        await test_service.test_performance_improvement()

        print("Running integration test...")
        await test_integration_with_charts_endpoint()

        print("🎉 All REL-012 tests passed!")

    asyncio.run(main())
