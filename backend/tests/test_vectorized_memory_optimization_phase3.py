"""
Test suite for Phase 3 Memory Optimization features.
"""

import gc
import os
import sys
import time

import numpy as np
import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from utils.vectorized_memory_optimization import (
    ArrayMemoryPool,
    MemoryMonitor,
    MemoryOptimizedVectorizedCalculator,
    get_global_memory_pool,
    memory_optimized_processing,
)


class TestArrayMemoryPool:
    """Test the array memory pool functionality."""

    def setup_method(self):
        """Set up test environment."""
        self.pool = ArrayMemoryPool()
        # Clear any existing pools
        self.pool.force_cleanup()

    def test_array_pooling_basic(self):
        """Test basic array allocation and reuse."""
        shape = (10, 10)

        # Get array from pool
        array1 = self.pool.get_array(shape)
        assert array1.shape == shape
        assert array1.dtype == np.float64

        # Return array to pool
        success = self.pool.return_array(array1)
        assert success == True

        # Get array again - should be same array reused
        array2 = self.pool.get_array(shape)
        assert array2.shape == shape

        # Arrays should be the same object (reused)
        assert array2 is array1

    def test_temp_array_context_manager(self):
        """Test temporary array context manager."""
        shape = (5, 5)

        with self.pool.get_temp_array(shape) as temp_array:
            assert temp_array.shape == shape
            temp_array.fill(42)
            assert np.all(temp_array == 42)

        # After context, array should be returned to pool
        # Get same shape again to verify it was recycled
        with self.pool.get_temp_array(shape) as temp_array2:
            # Should be cleared (filled with zeros)
            assert np.all(temp_array2 == 0)

    def test_memory_pool_stats(self):
        """Test memory pool statistics tracking."""
        initial_stats = self.pool.pool.get_stats()

        # Allocate some arrays
        arrays = []
        for i in range(3):
            array = self.pool.get_array((i + 1, i + 1))
            arrays.append(array)

        # Return arrays to pool
        for array in arrays:
            self.pool.return_array(array)

        # Get arrays again (should be reused)
        for i in range(3):
            reused_array = self.pool.get_array((i + 1, i + 1))

        final_stats = self.pool.pool.get_stats()
        assert (
            final_stats["arrays_allocated"]
            >= initial_stats["arrays_allocated"]
        )
        assert final_stats["arrays_reused"] > initial_stats["arrays_reused"]


class TestMemoryOptimizedVectorizedCalculator:
    """Test the memory-optimized vectorized calculator."""

    def setup_method(self):
        """Set up test environment."""
        self.calculator = MemoryOptimizedVectorizedCalculator(
            chunk_size=5, enable_memory_pooling=True
        )

    def test_memory_usage_estimation(self):
        """Test memory usage estimation."""
        estimates = self.calculator.estimate_memory_usage(
            num_charts1=100, num_charts2=50, num_planets=10
        )

        assert "base_memory_mb" in estimates
        assert "chunked_memory_mb" in estimates
        assert "memory_savings_mb" in estimates
        assert "memory_savings_percent" in estimates

        # Chunked processing should use less memory
        assert estimates["chunked_memory_mb"] < estimates["base_memory_mb"]
        assert estimates["memory_savings_mb"] > 0
        assert estimates["memory_savings_percent"] > 0

    def test_large_batch_processing_simulation(self):
        """Test large batch processing with memory optimization."""
        # Create simulated chart data
        chart_pairs = []
        for i in range(10):  # Small batch for testing
            chart1 = {
                f"Planet{j}": float((i * 30 + j * 40) % 360) for j in range(10)
            }
            chart2 = {
                f"Planet{j}": float((i * 35 + j * 45) % 360) for j in range(10)
            }
            chart_pairs.append((chart1, chart2))

        progress_updates = []

        def progress_callback(progress, current, total):
            progress_updates.append((progress, current, total))

        # Process with memory optimization
        results = self.calculator.calculate_large_batch_aspects(
            chart_pairs, progress_callback=progress_callback
        )

        assert len(results) == len(chart_pairs)
        assert len(progress_updates) > 0  # Should have progress updates

        # Final progress should be 100%
        final_progress = progress_updates[-1][0] if progress_updates else 0
        assert final_progress == 100.0

    def test_chunked_processing_memory_efficiency(self):
        """Test that chunked processing uses less memory."""
        # Create larger dataset for memory testing
        charts1 = []
        charts2 = []

        for i in range(20):  # Create 20 charts each
            chart1 = {
                f"Planet{j}": float((i * 25 + j * 15) % 360) for j in range(10)
            }
            chart2 = {
                f"Planet{j}": float((i * 30 + j * 20) % 360) for j in range(10)
            }
            charts1.append(chart1)
            charts2.append(chart2)

        # Test memory estimates
        estimates = self.calculator.estimate_memory_usage(
            num_charts1=len(charts1), num_charts2=len(charts2)
        )

        # Memory savings should be significant
        assert estimates["memory_savings_percent"] > 50  # At least 50% savings


class TestMemoryMonitor:
    """Test memory monitoring functionality."""

    def test_memory_monitoring(self):
        """Test basic memory monitoring."""
        monitor = MemoryMonitor()

        # Start monitoring
        monitor.start_monitoring()
        start_stats = monitor.get_memory_stats()

        # Allocate some memory
        large_array = np.random.rand(1000, 1000)  # ~8MB

        # Update peak memory
        monitor.update_peak()

        # Get final stats
        final_stats = monitor.get_memory_stats()

        # Should track memory increase
        if final_stats["current_memory_mb"] > 0:  # Only if psutil is available
            assert (
                final_stats["peak_memory_mb"] >= final_stats["start_memory_mb"]
            )

        # Clean up
        del large_array
        gc.collect()


class TestMemoryOptimizedContextManager:
    """Test the memory optimized processing context manager."""

    def test_context_manager_basic(self):
        """Test basic context manager functionality."""
        with memory_optimized_processing(
            chunk_size=10, enable_pooling=True
        ) as (calculator, monitor):
            assert isinstance(calculator, MemoryOptimizedVectorizedCalculator)
            assert isinstance(monitor, MemoryMonitor)

            # Test that calculator is configured correctly
            assert calculator.chunk_size == 10
            assert calculator.enable_memory_pooling == True

    def test_context_manager_cleanup(self):
        """Test that context manager properly cleans up."""
        initial_memory = 0
        final_memory = 0

        try:
            import psutil

            process = psutil.Process()
            initial_memory = process.memory_info().rss

            with memory_optimized_processing() as (calculator, monitor):
                # Allocate some arrays
                for i in range(5):
                    with calculator.memory_pool.get_temp_array((100, 100)):
                        pass

            # After context, memory should be cleaned up
            gc.collect()
            time.sleep(0.1)  # Allow cleanup
            final_memory = process.memory_info().rss

            # Memory usage should not have grown significantly
            memory_growth = (final_memory - initial_memory) / (
                1024 * 1024
            )  # MB
            assert memory_growth < 50  # Less than 50MB growth

        except ImportError:
            # Skip memory checks if psutil not available
            pass


class TestIntegrationWithVectorizedCalculations:
    """Test integration with existing vectorized calculations."""

    def test_memory_optimized_aspect_calculations(self):
        """Test memory-optimized aspect calculations."""
        with memory_optimized_processing(chunk_size=5) as (
            calculator,
            monitor,
        ):
            # Create test chart pairs
            chart_pairs = []
            for i in range(8):
                chart1 = {
                    "Sun": float(i * 45) % 360,
                    "Moon": float(i * 60) % 360,
                    "Mercury": float(i * 30) % 360,
                    "Venus": float(i * 90) % 360,
                    "Mars": float(i * 120) % 360,
                    "Jupiter": float(i * 150) % 360,
                    "Saturn": float(i * 180) % 360,
                    "Uranus": float(i * 210) % 360,
                    "Neptune": float(i * 240) % 360,
                    "Pluto": float(i * 270) % 360,
                }
                chart2 = {
                    "Sun": float((i + 1) * 35) % 360,
                    "Moon": float((i + 1) * 50) % 360,
                    "Mercury": float((i + 1) * 25) % 360,
                    "Venus": float((i + 1) * 85) % 360,
                    "Mars": float((i + 1) * 115) % 360,
                    "Jupiter": float((i + 1) * 145) % 360,
                    "Saturn": float((i + 1) * 175) % 360,
                    "Uranus": float((i + 1) * 205) % 360,
                    "Neptune": float((i + 1) * 235) % 360,
                    "Pluto": float((i + 1) * 265) % 360,
                }
                chart_pairs.append((chart1, chart2))

            # Process with memory optimization
            results = calculator.calculate_large_batch_aspects(chart_pairs)

            assert len(results) == len(chart_pairs)

            # Verify we got valid aspect matrices
            for result in results:
                assert result is not None
                assert len(result) == 10  # 10 planets
                assert all(len(row) == 10 for row in result)  # 10x10 matrix

            # Get memory statistics
            memory_stats = monitor.get_memory_stats()
            if memory_stats["current_memory_mb"] > 0:
                print(f"Memory usage: {memory_stats}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
