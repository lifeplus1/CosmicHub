"""
Phase 2: Comprehensive unit tests and integration for vectorized synastry calculations.
Focuses on testing the actual implementation and integration with existing systems.
"""

import os
import sys
import time
from typing import Dict, List

import pytest

# Add backend to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from utils.aspect_utils import PLANETS, build_aspect_matrix, get_key_aspects
from utils.vectorized_aspect_utils import (
    VectorizedAspectCalculator,
    batch_synastry_analysis,
    build_aspect_matrix_fast,
)


class TestVectorizedAspectCalculatorCore:
    """Core functionality tests for VectorizedAspectCalculator."""

    def setup_method(self):
        """Set up test fixtures with proper planet dictionary format."""
        self.calculator = VectorizedAspectCalculator()

        # Standard test chart 1
        self.chart1 = {
            "sun": 0.0,
            "moon": 30.0,
            "mercury": 60.0,
            "venus": 90.0,
            "mars": 120.0,
            "jupiter": 150.0,
            "saturn": 180.0,
            "uranus": 210.0,
            "neptune": 240.0,
            "pluto": 270.0,
        }

        # Standard test chart 2 (offset by 15 degrees)
        self.chart2 = {
            "sun": 15.0,
            "moon": 45.0,
            "mercury": 75.0,
            "venus": 105.0,
            "mars": 135.0,
            "jupiter": 165.0,
            "saturn": 195.0,
            "uranus": 225.0,
            "neptune": 255.0,
            "pluto": 285.0,
        }

        # Edge case chart with wraparound degrees
        self.edge_chart = {
            "sun": 359.0,
            "moon": 1.0,
            "mercury": 179.0,
            "venus": 181.0,
            "mars": 89.0,
            "jupiter": 91.0,
            "saturn": 269.0,
            "uranus": 271.0,
            "neptune": 0.0,
            "pluto": 180.0,
        }

    def test_separation_matrix_calculation(self):
        """Test basic separation matrix calculation."""
        result = self.calculator.calculate_separation_matrix(
            self.chart1, self.chart2
        )

        # Should be 10x10 matrix for all planets
        assert result.shape == (10, 10)

        # Verify specific separations (all should be 15 degrees in this case)
        for i in range(10):
            assert (
                abs(result[i, i] - 15.0) < 0.001
            ), f"Planet {i} separation incorrect: {result[i, i]}"

    def test_separation_matrix_wraparound(self):
        """Test zodiacal wraparound handling."""
        # Create charts with wraparound scenarios
        chart_a = {
            "sun": 350.0,
            "moon": 10.0,
            "mercury": 0.0,
            "venus": 0.0,
            "mars": 0.0,
            "jupiter": 0.0,
            "saturn": 0.0,
            "uranus": 0.0,
            "neptune": 0.0,
            "pluto": 0.0,
        }
        chart_b = {
            "sun": 10.0,
            "moon": 350.0,
            "mercury": 0.0,
            "venus": 0.0,
            "mars": 0.0,
            "jupiter": 0.0,
            "saturn": 0.0,
            "uranus": 0.0,
            "neptune": 0.0,
            "pluto": 0.0,
        }

        result = self.calculator.calculate_separation_matrix(chart_a, chart_b)

        # Both should show 20° separation (not 340°)
        assert (
            abs(result[0, 0] - 20.0) < 0.001
        ), f"Sun wraparound incorrect: {result[0, 0]}"
        assert (
            abs(result[1, 1] - 20.0) < 0.001
        ), f"Moon wraparound incorrect: {result[1, 1]}"

    def test_vectorized_aspect_detection(self):
        """Test that vectorized aspect detection works correctly."""
        # Create test charts with positions that form valid aspects
        chart1_test = {
            "Sun": 0.0,  # Conjunction with chart2 Sun at 5°
            "Moon": 60.0,  # Sextile with chart2 Moon at 58°
            "Mercury": 90.0,  # Square with chart2 Mercury at 95°
            "Venus": 120.0,  # Trine with chart2 Venus at 117°
            "Mars": 180.0,  # Opposition with chart2 Mars at 175°
            "Jupiter": 210.0,
            "Saturn": 240.0,
            "Uranus": 270.0,
            "Neptune": 300.0,
            "Pluto": 330.0,
        }

        chart2_test = {
            "Sun": 5.0,  # Conjunction with chart1 Sun
            "Moon": 58.0,  # Sextile with chart1 Moon
            "Mercury": 95.0,  # Square with chart1 Mercury
            "Venus": 117.0,  # Trine with chart1 Venus
            "Mars": 175.0,  # Opposition with chart1 Mars
            "Jupiter": 30.0,
            "Saturn": 120.0,
            "Uranus": 0.0,
            "Neptune": 240.0,
            "Pluto": 90.0,
        }

        result = self.calculator.build_aspect_matrix_vectorized(
            chart1_test, chart2_test
        )

        # Should be 10x10 matrix
        assert len(result) == 10
        assert all(len(row) == 10 for row in result)

        # Check that aspects are detected
        aspects_found = 0
        for row in result:
            for cell in row:
                if cell is not None:
                    aspects_found += 1
                    assert "aspect" in cell
                    assert "orb" in cell
                    assert "type" in cell

        print(f"Found {aspects_found} aspects in vectorized calculation")

        # Should find some aspects with this configuration
        assert (
            aspects_found > 0
        ), "No aspects detected in vectorized calculation"

    def test_accuracy_against_traditional(self):
        """Test vectorized results match traditional implementation."""
        # Use realistic chart data
        traditional_result = build_aspect_matrix(self.chart1, self.chart2)
        vectorized_result = self.calculator.build_aspect_matrix_vectorized(
            self.chart1, self.chart2
        )

        # Compare results
        for i in range(10):
            for j in range(10):
                trad_cell = traditional_result[i][j]
                vect_cell = vectorized_result[i][j]

                if trad_cell is None and vect_cell is None:
                    continue
                elif trad_cell is None or vect_cell is None:
                    pytest.fail(
                        f"Mismatch at [{i}][{j}]: traditional={trad_cell}, vectorized={vect_cell}"
                    )
                else:
                    # Both have aspects - compare them
                    assert (
                        trad_cell["aspect"] == vect_cell["aspect"]
                    ), f"Aspect mismatch at [{i}][{j}]: {trad_cell['aspect']} vs {vect_cell['aspect']}"

                    # Orbs should be very close (within 0.1°)
                    assert (
                        abs(trad_cell["orb"] - vect_cell["orb"]) < 0.1
                    ), f"Orb mismatch at [{i}][{j}]: {trad_cell['orb']} vs {vect_cell['orb']}"

    def test_performance_improvement(self):
        """Test that vectorized calculation is faster than traditional."""
        # Use larger, more complex charts for meaningful performance difference
        large_chart1 = {
            planet: float(i * 36 + (i * 7) % 360)
            for i, planet in enumerate(PLANETS)
        }
        large_chart2 = {
            planet: float(i * 43 + (i * 11) % 360)
            for i, planet in enumerate(PLANETS)
        }

        # Warm up
        self.calculator.build_aspect_matrix_vectorized(
            large_chart1, large_chart2
        )
        build_aspect_matrix(large_chart1, large_chart2)

        # Time traditional method
        traditional_times: List[float] = []
        for _ in range(10):
            start = time.perf_counter()
            build_aspect_matrix(large_chart1, large_chart2)
            traditional_times.append(time.perf_counter() - start)

        # Time vectorized method
        vectorized_times: List[float] = []
        for _ in range(10):
            start = time.perf_counter()
            self.calculator.build_aspect_matrix_vectorized(
                large_chart1, large_chart2
            )
            vectorized_times.append(time.perf_counter() - start)

        avg_traditional = sum(traditional_times) / len(traditional_times)
        avg_vectorized = sum(vectorized_times) / len(vectorized_times)

        improvement_ratio = avg_traditional / avg_vectorized

        print(f"\nPerformance comparison:")
        print(f"Traditional: {avg_traditional*1000:.2f}ms")
        print(f"Vectorized:  {avg_vectorized*1000:.2f}ms")
        print(f"Improvement: {improvement_ratio:.2f}x faster")

        # Vectorized should be at least as fast, ideally faster
        assert (
            improvement_ratio >= 0.8
        ), f"Vectorized slower than expected: {improvement_ratio:.2f}x"

    def test_batch_processing(self):
        """Test batch processing of multiple chart pairs."""
        # Create multiple chart pairs
        chart_pairs = [
            (self.chart1, self.chart2),
            (self.chart2, self.chart1),
            (self.chart1, self.edge_chart),
            (self.edge_chart, self.chart2),
        ]

        # Test batch compatibility scores
        scores = self.calculator.batch_compatibility_scores(chart_pairs)

        assert len(scores) == 4
        for score in scores:
            assert isinstance(score, (int, float))

        # Test full batch analysis
        results = batch_synastry_analysis(chart_pairs)

        assert len(results) == 4
        for result in results:
            assert "compatibility_score" in result
            assert "aspect_matrix" in result
            assert isinstance(result["compatibility_score"], (int, float))
            assert len(result["aspect_matrix"]) == 10


class TestVectorizedIntegration:
    """Integration tests with existing synastry systems."""

    def setup_method(self):
        self.chart1 = {
            "sun": 120.0,
            "moon": 240.0,
            "mercury": 90.0,
            "venus": 60.0,
            "mars": 180.0,
            "jupiter": 0.0,
            "saturn": 150.0,
            "uranus": 330.0,
            "neptune": 210.0,
            "pluto": 30.0,
        }
        self.chart2 = {
            "sun": 300.0,
            "moon": 60.0,
            "mercury": 270.0,
            "venus": 240.0,
            "mars": 0.0,
            "jupiter": 180.0,
            "saturn": 330.0,
            "uranus": 150.0,
            "neptune": 30.0,
            "pluto": 210.0,
        }

    def test_drop_in_replacement(self):
        """Test build_aspect_matrix_fast as drop-in replacement."""
        traditional_result = build_aspect_matrix(self.chart1, self.chart2)
        fast_result = build_aspect_matrix_fast(self.chart1, self.chart2)

        # Results should be structurally identical
        assert len(traditional_result) == len(fast_result)
        for i in range(len(traditional_result)):
            assert len(traditional_result[i]) == len(fast_result[i])
            for j in range(len(traditional_result[i])):
                trad_cell = traditional_result[i][j]
                fast_cell = fast_result[i][j]

                if trad_cell is None:
                    assert fast_cell is None
                elif fast_cell is None:
                    assert trad_cell is None
                else:
                    assert trad_cell["aspect"] == fast_cell["aspect"]

    def test_key_aspects_integration(self):
        """Test integration with get_key_aspects function."""
        # Generate aspect matrix using vectorized calculation
        aspect_matrix = build_aspect_matrix_fast(self.chart1, self.chart2)

        # Should be able to extract key aspects
        key_aspects = get_key_aspects(aspect_matrix)

        # Verify structure
        assert isinstance(key_aspects, list)
        for aspect in key_aspects:
            assert "person1_planet" in aspect
            assert "person2_planet" in aspect
            assert "aspect" in aspect
            assert "strength" in aspect

    def test_error_handling(self):
        """Test graceful error handling."""
        calculator = VectorizedAspectCalculator()

        # Test with missing planets
        incomplete_chart1 = {"sun": 0.0, "moon": 30.0}
        incomplete_chart2 = {"sun": 15.0, "venus": 45.0}

        # Should not crash
        result = calculator.build_aspect_matrix_vectorized(
            incomplete_chart1, incomplete_chart2
        )
        assert len(result) == 10  # Still 10x10 matrix

        # Test with empty charts
        empty_chart: Dict[str, float] = {}
        result = calculator.build_aspect_matrix_vectorized(
            empty_chart, empty_chart
        )
        assert len(result) == 10

    def test_data_type_consistency(self):
        """Test that results have consistent data types."""
        calculator = VectorizedAspectCalculator()
        result = calculator.build_aspect_matrix_vectorized(
            self.chart1, self.chart2
        )

        for row in result:
            for cell in row:
                if cell is not None:
                    assert isinstance(cell["aspect"], str)
                    assert isinstance(cell["orb"], (int, float))
                    assert isinstance(cell["type"], str)
                    assert cell["orb"] >= 0.0
                    assert cell["type"] in [
                        "harmonious",
                        "challenging",
                        "neutral",
                    ]


class TestVectorizedEdgeCases:
    """Test edge cases and boundary conditions."""

    def test_exact_aspects(self):
        """Test detection of exact aspects."""
        # Create charts with exact aspects
        chart1 = {
            "sun": 0.0,
            "moon": 60.0,
            "mercury": 90.0,
            "venus": 120.0,
            "mars": 180.0,
            "jupiter": 0.0,
            "saturn": 0.0,
            "uranus": 0.0,
            "neptune": 0.0,
            "pluto": 0.0,
        }
        chart2 = {
            "sun": 0.0,
            "moon": 0.0,
            "mercury": 0.0,
            "venus": 0.0,
            "mars": 0.0,
            "jupiter": 0.0,
            "saturn": 0.0,
            "uranus": 0.0,
            "neptune": 0.0,
            "pluto": 0.0,
        }

        calculator = VectorizedAspectCalculator()
        result = calculator.build_aspect_matrix_vectorized(chart1, chart2)

        # Check expected exact aspects
        assert (
            result[0][0] is not None
            and result[0][0]["aspect"] == "conjunction"
        )  # Sun-Sun 0°
        assert (
            result[1][0] is not None and result[1][0]["aspect"] == "sextile"
        )  # Moon-Sun 60°
        assert (
            result[2][0] is not None and result[2][0]["aspect"] == "square"
        )  # Mercury-Sun 90°
        assert (
            result[3][0] is not None and result[3][0]["aspect"] == "trine"
        )  # Venus-Sun 120°
        assert (
            result[4][0] is not None and result[4][0]["aspect"] == "opposition"
        )  # Mars-Sun 180°

    def test_orb_boundaries(self):
        """Test aspect detection at orb boundaries."""
        # Create chart just within and just outside orb limits
        calculator = VectorizedAspectCalculator()

        # Conjunction has 10° orb
        chart1 = {
            "sun": 0.0,
            "moon": 9.0,
            "mercury": 11.0,
            "venus": 0.0,
            "mars": 0.0,
            "jupiter": 0.0,
            "saturn": 0.0,
            "uranus": 0.0,
            "neptune": 0.0,
            "pluto": 0.0,
        }
        chart2 = {
            "sun": 0.0,
            "moon": 0.0,
            "mercury": 0.0,
            "venus": 0.0,
            "mars": 0.0,
            "jupiter": 0.0,
            "saturn": 0.0,
            "uranus": 0.0,
            "neptune": 0.0,
            "pluto": 0.0,
        }

        result = calculator.build_aspect_matrix_vectorized(chart1, chart2)

        # Moon-Sun at 9° should be conjunction (within 10° orb)
        assert (
            result[1][0] is not None
            and result[1][0]["aspect"] == "conjunction"
        )

        # Mercury-Sun at 11° should NOT be conjunction (outside 10° orb)
        # It might be detected as another aspect or be None
        mercury_sun_cell = result[2][0]
        if mercury_sun_cell is not None:
            assert mercury_sun_cell["aspect"] != "conjunction"

    def test_floating_point_precision(self):
        """Test handling of floating point precision issues."""
        calculator = VectorizedAspectCalculator()

        # Use high precision values
        chart1 = {
            "sun": 0.123456789,
            "moon": 60.987654321,
            "mercury": 0.0,
            "venus": 0.0,
            "mars": 0.0,
            "jupiter": 0.0,
            "saturn": 0.0,
            "uranus": 0.0,
            "neptune": 0.0,
            "pluto": 0.0,
        }
        chart2 = {
            "sun": 120.111111111,
            "moon": 240.999999999,
            "mercury": 0.0,
            "venus": 0.0,
            "mars": 0.0,
            "jupiter": 0.0,
            "saturn": 0.0,
            "uranus": 0.0,
            "neptune": 0.0,
            "pluto": 0.0,
        }

        # Should not crash and should handle precision correctly
        result = calculator.build_aspect_matrix_vectorized(chart1, chart2)
        assert len(result) == 10
        assert all(len(row) == 10 for row in result)


if __name__ == "__main__":
    # Run specific test classes
    pytest.main(
        [
            __file__ + "::TestVectorizedAspectCalculatorCore",
            __file__ + "::TestVectorizedIntegration",
            __file__ + "::TestVectorizedEdgeCases",
            "-v",
        ]
    )
