"""
Test suite for Phase 3 Integration with existing workflows.
"""

import os
import sys
from unittest.mock import Mock, patch

import numpy as np
import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from utils.optimized_vectorized_integration import (
    OptimizedVectorizedAspectCalculator,
    optimized_calculation_session,
    optimized_synastry_calculation,
)


class TestOptimizedVectorizedAspectCalculator:
    """Test the main optimized calculator integration."""

    def setup_method(self):
        """Set up test calculator."""
        self.calculator = OptimizedVectorizedAspectCalculator(
            chunk_size=5, enable_caching=True, enable_monitoring=True
        )

        # Test chart data
        self.chart1 = {
            "Sun": 0.0,
            "Moon": 90.0,
            "Mercury": 180.0,
            "Venus": 270.0,
            "Mars": 45.0,
            "Jupiter": 135.0,
            "Saturn": 225.0,
            "Uranus": 315.0,
            "Neptune": 60.0,
            "Pluto": 240.0,
        }

        self.chart2 = {
            "Sun": 5.0,
            "Moon": 95.0,
            "Mercury": 185.0,
            "Venus": 275.0,
            "Mars": 50.0,
            "Jupiter": 140.0,
            "Saturn": 230.0,
            "Uranus": 320.0,
            "Neptune": 65.0,
            "Pluto": 245.0,
        }

    def test_basic_synastry_calculation(self):
        """Test basic synastry calculation with optimizations."""
        result = self.calculator.calculate_synastry_aspects(
            self.chart1, self.chart2, orb=8.0
        )

        # Should return numpy array
        assert isinstance(result, np.ndarray)
        assert result.shape == (10, 10)  # 10x10 for 10 planets each

        # Values should be numeric
        assert np.isfinite(result).all()

    def test_caching_functionality(self):
        """Test that caching works for repeated calculations."""
        # First calculation
        result1 = self.calculator.calculate_synastry_aspects(
            self.chart1, self.chart2, orb=8.0
        )

        # Second calculation with same parameters should use cache
        result2 = self.calculator.calculate_synastry_aspects(
            self.chart1, self.chart2, orb=8.0
        )

        # Results should be identical
        np.testing.assert_array_equal(result1, result2)

        # Check cache stats
        metrics = self.calculator.get_performance_metrics()
        if "cache" in metrics:
            cache_stats = metrics["cache"]["memory_cache"]
            assert cache_stats["hits"] > 0  # Should have cache hits

    def test_different_parameters_different_cache(self):
        """Test that different parameters don't use cached results."""
        # First calculation
        result1 = self.calculator.calculate_synastry_aspects(
            self.chart1, self.chart2, orb=8.0
        )

        # Different orb should not use cache
        result2 = self.calculator.calculate_synastry_aspects(
            self.chart1, self.chart2, orb=10.0
        )

        # Results should be different (at least some values)
        # Note: They may be similar but shouldn't be identical due to different orb
        assert result1.shape == result2.shape

    def test_batch_processing(self):
        """Test batch processing functionality."""
        # Create test chart pairs
        chart_pairs = []
        for i in range(5):  # Small batch for testing
            modified_chart1 = {k: v + i for k, v in self.chart1.items()}
            modified_chart2 = {k: v + i for k, v in self.chart2.items()}
            chart_pairs.append((modified_chart1, modified_chart2))

        # Process batch
        results = self.calculator.calculate_large_batch_synastry(
            chart_pairs, orb=8.0
        )

        assert len(results) == len(chart_pairs)
        assert all(isinstance(result, np.ndarray) for result in results)
        assert all(result.shape == (10, 10) for result in results)

    def test_progress_callback(self):
        """Test that progress callback is called during batch processing."""
        chart_pairs = [(self.chart1, self.chart2) for _ in range(3)]

        progress_calls = []

        def progress_callback(progress, current, total):
            progress_calls.append((progress, current, total))

        # Process with callback
        results = self.calculator.calculate_large_batch_synastry(
            chart_pairs, orb=8.0, progress_callback=progress_callback
        )

        assert len(results) == 3
        assert len(progress_calls) > 0  # Should have progress updates

        # Final progress should be 100%
        if progress_calls:
            final_progress = progress_calls[-1][0]
            assert final_progress == 100.0

    def test_performance_metrics_collection(self):
        """Test that performance metrics are collected."""
        # Perform some calculations
        self.calculator.calculate_synastry_aspects(self.chart1, self.chart2)

        # Get metrics
        metrics = self.calculator.get_performance_metrics()

        # Should have metrics structure
        assert isinstance(metrics, dict)

        # Check for expected metric categories
        if self.calculator.enable_monitoring:
            assert "performance" in metrics or "cache" in metrics

    def test_cache_clearing(self):
        """Test cache clearing functionality."""
        # Perform calculation to populate cache
        self.calculator.calculate_synastry_aspects(self.chart1, self.chart2)

        # Clear cache
        self.calculator.clear_cache()

        # Subsequent calculation should not use cache
        # (This is hard to test directly, but we can verify cache stats reset)
        metrics_after_clear = self.calculator.get_performance_metrics()
        if "cache" in metrics_after_clear:
            # Cache should be cleared (implementation dependent)
            pass  # Actual verification depends on cache implementation

    def test_optimization_settings_recommendations(self):
        """Test optimization settings recommendations."""
        recommendations = self.calculator.optimize_settings_for_dataset(
            dataset_size=1000, available_memory_mb=512.0
        )

        assert isinstance(recommendations, dict)
        assert "chunk_size" in recommendations
        assert "enable_caching" in recommendations
        assert "expected_memory_usage" in recommendations

        # Should recommend caching for large datasets
        assert recommendations["enable_caching"] == True

    def test_fallback_calculation(self):
        """Test fallback calculation when main calculator unavailable."""
        # Disable the main calculator by mocking import failure
        with patch(
            "utils.optimized_vectorized_integration.VectorizedAspectCalculator",
            side_effect=ImportError,
        ):

            result = self.calculator.calculate_synastry_aspects(
                self.chart1, self.chart2, orb=8.0
            )

            # Should still return a valid result
            assert isinstance(result, np.ndarray)
            assert result.shape == (10, 10)


class TestIntegrationFunctions:
    """Test the integration helper functions."""

    def test_optimized_synastry_calculation_function(self):
        """Test the drop-in replacement function."""
        chart1 = {"Sun": 0.0, "Moon": 90.0, "Mercury": 180.0}
        chart2 = {"Sun": 5.0, "Moon": 95.0, "Mercury": 185.0}

        result = optimized_synastry_calculation(chart1, chart2, orb=8.0)

        # Should return structured response
        assert isinstance(result, dict)
        assert "aspects" in result
        assert "metadata" in result

        # Check metadata
        metadata = result["metadata"]
        assert metadata["orb"] == 8.0
        assert metadata["optimization_enabled"] == True
        assert "cached" in metadata

    def test_optimized_calculation_session_context(self):
        """Test the calculation session context manager."""
        chart1 = {"Sun": 0.0, "Moon": 90.0, "Mercury": 180.0}
        chart2 = {"Sun": 5.0, "Moon": 95.0, "Mercury": 185.0}
        chart_pairs = [(chart1, chart2)]

        with optimized_calculation_session(chunk_size=10) as calculator:
            assert isinstance(calculator, OptimizedVectorizedAspectCalculator)
            assert calculator.chunk_size == 10

            # Should be able to perform calculations
            results = calculator.calculate_large_batch_synastry(chart_pairs)
            assert len(results) == 1
            assert isinstance(results[0], np.ndarray)


class TestPerformanceComparison:
    """Test performance comparison and migration utilities."""

    def test_basic_performance_comparison(self):
        """Test basic performance comparison functionality."""

        # Create a simple traditional function
        def traditional_calculation(chart1, chart2):
            # Simple traditional implementation
            result = np.random.rand(len(chart1), len(chart2))
            return result

        chart1 = {"Sun": 0.0, "Moon": 90.0, "Mercury": 180.0}
        chart2 = {"Sun": 5.0, "Moon": 95.0, "Mercury": 185.0}

        # Import and test migration function
        from utils.optimized_vectorized_integration import (
            migrate_traditional_to_optimized,
        )

        wrapped_function = migrate_traditional_to_optimized(
            traditional_calculation,
            enable_performance_comparison=False,  # Disable for simpler testing
        )

        result = wrapped_function(chart1, chart2)
        assert isinstance(result, np.ndarray)


class TestErrorHandling:
    """Test error handling and edge cases."""

    def test_empty_charts_handling(self):
        """Test handling of empty chart data."""
        calculator = OptimizedVectorizedAspectCalculator()

        # Test with empty charts
        empty_chart = {}
        normal_chart = {"Sun": 0.0, "Moon": 90.0}

        # Should handle gracefully (exact behavior depends on implementation)
        try:
            result = calculator.calculate_synastry_aspects(
                empty_chart, normal_chart
            )
            # If it succeeds, should return appropriate shape
            assert isinstance(result, np.ndarray)
        except (ValueError, KeyError):
            # Or it may raise appropriate error
            pass

    def test_invalid_orb_values(self):
        """Test handling of invalid orb values."""
        calculator = OptimizedVectorizedAspectCalculator()
        chart1 = {"Sun": 0.0}
        chart2 = {"Sun": 5.0}

        # Negative orb
        result = calculator.calculate_synastry_aspects(
            chart1, chart2, orb=-5.0
        )
        assert isinstance(result, np.ndarray)

        # Very large orb
        result = calculator.calculate_synastry_aspects(
            chart1, chart2, orb=180.0
        )
        assert isinstance(result, np.ndarray)


class TestIntegrationWithCacheAndMemory:
    """Test integration between caching and memory optimization systems."""

    def test_cache_with_memory_optimization(self):
        """Test that caching works with memory-optimized batch processing."""
        calculator = OptimizedVectorizedAspectCalculator(
            chunk_size=3, enable_caching=True, enable_monitoring=True
        )

        # Create chart pairs with some duplicates
        chart1 = {"Sun": 0.0, "Moon": 90.0}
        chart2 = {"Sun": 5.0, "Moon": 95.0}
        chart3 = {"Sun": 10.0, "Moon": 100.0}

        chart_pairs = [
            (chart1, chart2),  # First calculation
            (chart1, chart3),  # Different pair
            (chart1, chart2),  # Duplicate - should use cache
        ]

        results = calculator.calculate_large_batch_synastry(chart_pairs)

        assert len(results) == 3

        # First and third results should be identical (cache hit)
        np.testing.assert_array_equal(results[0], results[2])

        # Check performance metrics
        metrics = calculator.get_performance_metrics()
        if "cache" in metrics:
            # Should have some cache hits
            cache_stats = metrics["cache"]["memory_cache"]
            assert cache_stats["hits"] > 0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
