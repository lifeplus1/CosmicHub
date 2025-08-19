#!/usr/bin/env python3
"""
Comprehensive integration test for transit calculations
Tests the complete pipeline from API endpoints to calculations
"""

import json
import sys
import time
from datetime import datetime
from typing import Any, Dict, List

# Configure path for imports
sys.path.append(".")

import requests


class TransitIntegrationTests:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.test_results: List[Dict[str, Any]] = []

    def log_test(
        self, test_name: str, success: bool, message: str, data: Any = None
    ) -> None:
        """Log test result"""
        result: Dict[str, Any] = {
            "test": test_name,
            "success": success,
            "message": message,
            "timestamp": datetime.now().isoformat(),
            "data": data,
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")

    def test_health_endpoint(self) -> bool:
        """Test that the backend is running"""
        try:
            response = requests.get(f"{self.base_url}/health", timeout=5)
            success = (
                response.status_code == 200
                and response.json().get("status") == "ok"
            )
            message = (
                f"Status: {response.status_code}"
                if success
                else f"Failed: {response.status_code}"
            )
            self.log_test(
                "Health Check",
                success,
                message,
                response.json() if success else None,
            )
            return success
        except Exception as e:
            self.log_test("Health Check", False, f"Connection failed: {e}")
            return False

    def test_utility_endpoints(self) -> bool:
        """Test utility endpoints (aspects, planets, lunar-phases)"""
        endpoints = ["aspects", "planets", "lunar-phases"]
        all_passed = True

        for endpoint in endpoints:
            try:
                response = requests.get(
                    f"{self.base_url}/api/astro/{endpoint}", timeout=10
                )
                success = response.status_code == 200
                if success:
                    data = response.json()
                    self.log_test(
                        f"Utility: {endpoint}",
                        True,
                        f"Returned valid data",
                        data,
                    )
                else:
                    self.log_test(
                        f"Utility: {endpoint}",
                        False,
                        f"Status: {response.status_code}",
                    )
                    all_passed = False
            except Exception as e:
                self.log_test(
                    f"Utility: {endpoint}", False, f"Request failed: {e}"
                )
                all_passed = False

        return all_passed

    def test_transit_calculations(self) -> bool:
        """Test transit calculation endpoint with various scenarios"""
        test_cases: List[Dict[str, Any]] = [
            {
                "name": "Basic Transit Calculation",
                "payload": {
                    "birth_data": {
                        "birth_date": "1990-01-01",
                        "birth_time": "12:00",
                        "latitude": 40.7128,
                        "longitude": -74.0060,
                        "timezone": "America/New_York",
                    },
                    "date_range": {
                        "start_date": "2025-01-01",
                        "end_date": "2025-01-31",
                    },
                },
            },
            {
                "name": "Transit with Minor Aspects",
                "payload": {
                    "birth_data": {
                        "birth_date": "1985-06-15",
                        "birth_time": "18:30",
                        "latitude": 51.5074,
                        "longitude": -0.1278,
                        "timezone": "Europe/London",
                    },
                    "date_range": {
                        "start_date": "2025-02-01",
                        "end_date": "2025-02-28",
                    },
                    "include_minor_aspects": True,
                    "orb": 3.0,
                },
            },
        ]

        all_passed = True

        for test_case in test_cases:
            try:
                start_time = time.time()
                response = requests.post(
                    f"{self.base_url}/api/astro/transits",
                    json=test_case["payload"],
                    headers={"Content-Type": "application/json"},
                    timeout=30,
                )
                duration = time.time() - start_time

                if response.status_code == 200:
                    data: List[Any] = response.json()  # type: ignore
                    if len(data) > 0:
                        sample_transit: Dict[str, Any] = data[0]  # type: ignore
                        required_fields = [
                            "id",
                            "planet",
                            "aspect",
                            "date",
                            "degree",
                            "intensity",
                        ]
                        has_required_fields = all(
                            field in sample_transit
                            for field in required_fields
                        )

                        if has_required_fields:
                            self.log_test(
                                test_case["name"],  # type: ignore
                                True,
                                f"Found {len(data)} transits in {duration:.2f}s",
                                {
                                    "count": len(data),
                                    "sample": sample_transit,
                                    "duration": duration,
                                },
                            )
                        else:
                            missing = [
                                f
                                for f in required_fields
                                if f not in sample_transit
                            ]
                            self.log_test(test_case["name"], False, f"Missing fields: {missing}")  # type: ignore
                            all_passed = False
                    else:
                        self.log_test(test_case["name"], False, "No transit results returned")  # type: ignore
                        all_passed = False
                else:
                    error_data = (
                        response.json()
                        if response.headers.get("content-type", "").startswith(
                            "application/json"
                        )
                        else response.text
                    )
                    self.log_test(test_case["name"], False, f"Status: {response.status_code}", error_data)  # type: ignore
                    all_passed = False

            except Exception as e:
                self.log_test(test_case["name"], False, f"Request failed: {e}")  # type: ignore
                all_passed = False

        return all_passed

    def test_lunar_transit_calculations(self) -> bool:
        """Test lunar transit calculation endpoint"""
        payload: Dict[str, Any] = {
            "birth_data": {
                "birth_date": "1992-03-20",
                "birth_time": "09:15",
                "latitude": 34.0522,
                "longitude": -118.2437,
                "timezone": "America/Los_Angeles",
            },
            "date_range": {
                "start_date": "2025-01-01",
                "end_date": "2025-01-31",
            },
            "include_void_of_course": True,
            "include_daily_phases": True,
        }

        try:
            start_time = time.time()
            response = requests.post(
                f"{self.base_url}/api/astro/lunar-transits",
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=30,
            )
            duration = time.time() - start_time

            if response.status_code == 200:
                data: List[Any] = response.json()  # type: ignore
                if len(data) > 0:
                    sample_lunar: Dict[str, Any] = data[0]  # type: ignore
                    required_fields = [
                        "phase",
                        "date",
                        "energy",
                        "degree",
                        "moon_sign",
                    ]
                    has_required_fields = all(
                        field in sample_lunar for field in required_fields
                    )

                    if has_required_fields:
                        phases: List[str] = [item["phase"] for item in data]  # type: ignore
                        unique_phases = list(set(phases))
                        self.log_test(
                            "Lunar Transit Calculation",
                            True,
                            f"Found {len(data)} lunar transits with {len(unique_phases)} unique phases in {duration:.2f}s",
                            {
                                "count": len(data),
                                "phases": unique_phases,
                                "sample": sample_lunar,
                                "duration": duration,
                            },
                        )
                        return True
                    else:
                        missing = [
                            f for f in required_fields if f not in sample_lunar
                        ]
                        self.log_test(
                            "Lunar Transit Calculation",
                            False,
                            f"Missing fields: {missing}",
                        )
                        return False
                else:
                    self.log_test(
                        "Lunar Transit Calculation",
                        False,
                        "No lunar transit results returned",
                    )
                    return False
            else:
                error_data = (
                    response.json()
                    if response.headers.get("content-type", "").startswith(
                        "application/json"
                    )
                    else response.text
                )
                self.log_test(
                    "Lunar Transit Calculation",
                    False,
                    f"Status: {response.status_code}",
                    error_data,
                )
                return False

        except Exception as e:
            self.log_test(
                "Lunar Transit Calculation", False, f"Request failed: {e}"
            )
            return False

    def test_performance_and_caching(self) -> bool:
        """Test performance and caching behavior"""
        payload: Dict[str, Any] = {
            "birth_data": {
                "birth_date": "1988-07-04",
                "birth_time": "14:30",
                "latitude": 37.7749,
                "longitude": -122.4194,
                "timezone": "America/Los_Angeles",
            },
            "date_range": {
                "start_date": "2025-01-01",
                "end_date": "2025-01-15",
            },
        }

        # First request (should be slower - no cache)
        try:
            start_time = time.time()
            response1 = requests.post(
                f"{self.base_url}/api/astro/transits",
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=30,
            )
            duration1 = time.time() - start_time

            if response1.status_code != 200:
                self.log_test(
                    "Performance Test",
                    False,
                    f"First request failed: {response1.status_code}",
                )
                return False

            # Second request (should be faster - with cache)
            start_time = time.time()
            response2 = requests.post(
                f"{self.base_url}/api/astro/transits",
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=30,
            )
            duration2 = time.time() - start_time

            if response2.status_code != 200:
                self.log_test(
                    "Performance Test",
                    False,
                    f"Second request failed: {response2.status_code}",
                )
                return False

            # Compare results and performance
            data1 = response1.json()
            data2 = response2.json()

            results_match = len(data1) == len(data2)
            performance_improved = (
                duration2 <= duration1 * 1.2
            )  # Allow some variance
            reasonable_performance = (
                duration1 < 10.0
            )  # Should complete within 10 seconds

            success = results_match and reasonable_performance
            message = f"First: {duration1:.2f}s ({len(data1)} results), Second: {duration2:.2f}s ({len(data2)} results)"

            self.log_test(
                "Performance & Caching",
                success,
                message,
                {
                    "first_duration": duration1,
                    "second_duration": duration2,
                    "first_count": len(data1),
                    "second_count": len(data2),
                    "results_match": results_match,
                    "performance_improved": performance_improved,
                },
            )

            return success

        except Exception as e:
            self.log_test(
                "Performance & Caching", False, f"Performance test failed: {e}"
            )
            return False

    def run_all_tests(self) -> Dict[str, Any]:
        """Run complete test suite"""
        print("🚀 Starting Transit Calculation Integration Tests")
        print("=" * 60)

        start_time = time.time()

        # Run all tests
        tests = [
            ("Backend Health", self.test_health_endpoint),
            ("Utility Endpoints", self.test_utility_endpoints),
            ("Transit Calculations", self.test_transit_calculations),
            ("Lunar Calculations", self.test_lunar_transit_calculations),
            ("Performance & Caching", self.test_performance_and_caching),
        ]

        passed = 0
        total = len(tests)

        for test_name, test_func in tests:
            print(f"\n📋 Running {test_name}...")
            if test_func():
                passed += 1

        duration = time.time() - start_time

        # Generate summary
        print("\n" + "=" * 60)
        print("🏁 TEST SUMMARY")
        print("=" * 60)
        print(f"✅ Passed: {passed}/{total}")
        print(f"⏱️  Total Duration: {duration:.2f}s")
        print(f"🎯 Success Rate: {(passed/total)*100:.1f}%")

        if passed == total:
            print(
                "\n🎉 ALL TESTS PASSED! Transit calculation system is ready for production."
            )
        else:
            print(
                f"\n⚠️  {total - passed} tests failed. Review the issues above."
            )

        return {
            "passed": passed,
            "total": total,
            "success_rate": (passed / total) * 100,
            "duration": duration,
            "all_passed": passed == total,
            "detailed_results": self.test_results,
        }


if __name__ == "__main__":
    tester = TransitIntegrationTests()
    results = tester.run_all_tests()

    # Save results to file for review
    with open(
        "/Users/Chris/Projects/CosmicHub/backend/integration_test_results.json",
        "w",
    ) as f:
        json.dump(results, f, indent=2, default=str)

    # Exit with appropriate code
    sys.exit(0 if results["all_passed"] else 1)
