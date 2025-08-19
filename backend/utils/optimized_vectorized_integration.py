"""
Integration module for Phase 3 optimizations with existing vectorized calculations.

This module provides seamless integration of memory optimization and caching
into the main application workflows.
"""

import logging
from contextlib import contextmanager
from typing import Any, Callable, Dict, List, Optional, Tuple

import numpy as np

from utils.vectorized_caching import (
    ChartDataHasher,
    TieredCacheManager,
    get_global_cache_manager,
)
from utils.vectorized_memory_optimization import (
    MemoryOptimizedVectorizedCalculator,
    memory_optimized_processing,
)
from utils.vectorized_monitoring import VectorizedPerformanceMonitor

# Expose a module-level symbol for VectorizedAspectCalculator so tests can patch
# it (tests patch 'utils.optimized_vectorized_integration.VectorizedAspectCalculator').
try:
    from astro.calculations import VectorizedAspectCalculator  # type: ignore
except Exception:
    VectorizedAspectCalculator = None

logger = logging.getLogger(__name__)


class OptimizedVectorizedAspectCalculator:
    """
    Enhanced vectorized calculator with integrated memory optimization and caching.

    This class combines all Phase 3 optimizations:
    - Memory-efficient chunked processing
    - Intelligent caching of results
    - Performance monitoring and metrics
    - Graceful fallback to traditional calculations
    """

    def __init__(
        self,
        chunk_size: int = 100,
        enable_memory_pooling: bool = True,
        enable_caching: bool = True,
        enable_monitoring: bool = True,
        cache_manager: Optional[TieredCacheManager] = None,
    ):
        """
        Initialize the optimized calculator.

        Args:
            chunk_size: Size of chunks for memory-efficient processing
            enable_memory_pooling: Whether to use array memory pooling
            enable_caching: Whether to cache calculation results
            enable_monitoring: Whether to collect performance metrics
            cache_manager: Custom cache manager (uses global if None)
        """

        # Initialize components
        self.memory_calculator = MemoryOptimizedVectorizedCalculator(
            chunk_size=chunk_size, enable_memory_pooling=enable_memory_pooling
        )

        self.performance_monitor = (
            VectorizedPerformanceMonitor() if enable_monitoring else None
        )

        self.cache_manager = cache_manager or (
            get_global_cache_manager() if enable_caching else None
        )

        self.enable_caching = enable_caching
        self.enable_monitoring = enable_monitoring

        # Settings
        self.chunk_size = chunk_size

        logger.info(
            f"Initialized OptimizedVectorizedAspectCalculator with "
            f"chunk_size={chunk_size}, caching={enable_caching}, "
            f"monitoring={enable_monitoring}"
        )

    def _get_cache_key_data(
        self, chart1: Dict[str, float], chart2: Dict[str, float]
    ) -> Tuple[str, str]:
        """Generate cache key data for chart pair."""
        if not self.enable_caching:
            return "", ""

        hasher = ChartDataHasher()
        chart1_hash = hasher.hash_chart(chart1)
        chart2_hash = hasher.hash_chart(chart2)
        return chart1_hash, chart2_hash

    def calculate_synastry_aspects(
        self,
        chart1: Dict[str, float],
        chart2: Dict[str, float],
        orb: float = 8.0,
        aspects: Optional[List[str]] = None,
    ) -> np.ndarray:
        """
        Calculate synastry aspects between two charts with full optimization.

        Args:
            chart1: First chart planetary positions
            chart2: Second chart planetary positions
            orb: Orb tolerance for aspects
            aspects: List of aspects to calculate (default: major aspects)

        Returns:
            Aspect matrix as numpy array
        """

        if aspects is None:
            aspects = [
                "conjunction",
                "opposition",
                "trine",
                "square",
                "sextile",
            ]

        operation_name = "synastry_aspects"

        # Try cache first
        if self.enable_caching and self.cache_manager:
            chart1_hash, chart2_hash = self._get_cache_key_data(chart1, chart2)

            cached_result = self.cache_manager.get(
                operation_name,
                chart_data=chart1,  # Use first chart as primary key
                chart2_hash=chart2_hash,
                orb=orb,
                aspects=aspects,
            )

            if cached_result is not None:
                logger.debug("Cache hit for synastry calculation")
                return cached_result

        # Calculate with monitoring
        if self.enable_monitoring and self.performance_monitor:
            with self.performance_monitor.time_operation(operation_name):
                result = self._compute_synastry_aspects(
                    chart1, chart2, orb, aspects
                )

                # Log completion (metrics are automatically logged by the monitor)
                logger.debug("Synastry calculation completed with monitoring")
        else:
            result = self._compute_synastry_aspects(
                chart1, chart2, orb, aspects
            )

        # Cache result
        if self.enable_caching and self.cache_manager:
            chart1_hash, chart2_hash = self._get_cache_key_data(chart1, chart2)
            self.cache_manager.put(
                result,
                operation_name,
                chart_data=chart1,
                chart2_hash=chart2_hash,
                orb=orb,
                aspects=aspects,
            )
            logger.debug("Cached synastry calculation result")

        return result

    def _compute_synastry_aspects(
        self,
        chart1: Dict[str, float],
        chart2: Dict[str, float],
        orb: float,
        aspects: List[str],
    ) -> np.ndarray:
        """Internal method to compute synastry aspects."""
        try:
            # Use existing vectorized calculation
            from astro.calculations import VectorizedAspectCalculator

            calculator = VectorizedAspectCalculator()
            return calculator.build_aspect_matrix(chart1, chart2, orb)

        except ImportError:
            logger.warning(
                "VectorizedAspectCalculator not available, using fallback"
            )
            return self._fallback_aspect_calculation(chart1, chart2, orb)

    def _fallback_aspect_calculation(
        self, chart1: Dict[str, float], chart2: Dict[str, float], orb: float
    ) -> np.ndarray:
        """Fallback aspect calculation method."""
        # Simple implementation for when main calculator is not available
        planets1 = list(chart1.keys())
        planets2 = list(chart2.keys())

        matrix = np.zeros((len(planets1), len(planets2)))

        for i, planet1 in enumerate(planets1):
            for j, planet2 in enumerate(planets2):
                pos1 = chart1[planet1]
                pos2 = chart2[planet2]

                # Calculate angular separation
                diff = abs(pos1 - pos2)
                diff = min(diff, 360 - diff)  # Handle wraparound

                # Check for major aspects
                if diff <= orb:  # Conjunction
                    matrix[i, j] = 1
                elif abs(diff - 60) <= orb:  # Sextile
                    matrix[i, j] = 2
                elif abs(diff - 90) <= orb:  # Square
                    matrix[i, j] = 3
                elif abs(diff - 120) <= orb:  # Trine
                    matrix[i, j] = 4
                elif abs(diff - 180) <= orb:  # Opposition
                    matrix[i, j] = 5

        return matrix

    def calculate_large_batch_synastry(
        self,
        chart_pairs: List[Tuple[Dict[str, float], Dict[str, float]]],
        orb: float = 8.0,
        progress_callback: Optional[Callable] = None,
    ) -> List[np.ndarray]:
        """
        Calculate synastry for large batches with memory optimization.

        Args:
            chart_pairs: List of (chart1, chart2) tuples
            orb: Orb tolerance for aspects
            progress_callback: Optional callback for progress updates

        Returns:
            List of aspect matrices
        """

        operation_name = "batch_synastry"
        total_pairs = len(chart_pairs)

        logger.info(
            f"Starting batch synastry calculation for {total_pairs} chart pairs"
        )

        # Use memory-optimized processing
        with memory_optimized_processing(
            chunk_size=self.chunk_size,
            enable_pooling=self.memory_calculator.enable_memory_pooling,
        ) as (calculator, monitor):

            if self.enable_monitoring and self.performance_monitor:
                with self.performance_monitor.time_operation(operation_name):
                    results = self._process_batch_with_caching(
                        chart_pairs, orb, progress_callback, calculator
                    )
            else:
                results = self._process_batch_with_caching(
                    chart_pairs, orb, progress_callback, calculator
                )

            # Log final memory stats (MemoryMonitor may use different key names)
            memory_stats = monitor.get_memory_stats()
            current_mb = memory_stats.get(
                "current_memory_mb",
                memory_stats.get("memory_increase_mb", 0.0),
            )
            peak_mb = memory_stats.get(
                "peak_memory_mb",
                memory_stats.get("peak_increase_mb", current_mb),
            )
            logger.info(
                f"Batch processing completed. Memory used: {current_mb:.2f}MB, "
                f"Peak: {peak_mb:.2f}MB"
            )

            return results

    def _process_batch_with_caching(
        self,
        chart_pairs: List[Tuple[Dict[str, float], Dict[str, float]]],
        orb: float,
        progress_callback: Optional[Callable],
        memory_calculator,
    ) -> List[np.ndarray]:
        """Process batch with caching support."""
        results = []
        cache_hits = 0

        for i, (chart1, chart2) in enumerate(chart_pairs):
            # Check cache first
            cached_result = None
            if self.enable_caching and self.cache_manager:
                chart1_hash, chart2_hash = self._get_cache_key_data(
                    chart1, chart2
                )
                cached_result = self.cache_manager.get(
                    "synastry_aspects",
                    chart_data=chart1,
                    chart2_hash=chart2_hash,
                    orb=orb,
                )

            if cached_result is not None:
                results.append(cached_result)
                cache_hits += 1
            else:
                # Calculate new result
                result = self.calculate_synastry_aspects(chart1, chart2, orb)
                results.append(result)

            # Progress callback
            if progress_callback:
                progress = (i + 1) / len(chart_pairs) * 100
                progress_callback(progress, i + 1, len(chart_pairs))

        cache_hit_rate = (
            (cache_hits / len(chart_pairs)) * 100 if chart_pairs else 0
        )
        logger.info(
            f"Batch processing: {cache_hits}/{len(chart_pairs)} cache hits ({cache_hit_rate:.1f}%)"
        )

        return results

    def get_performance_metrics(self) -> Dict[str, Any]:
        """Get comprehensive performance metrics."""
        metrics = {}

        if self.enable_monitoring and self.performance_monitor:
            # Performance monitoring provides logging, but we can include basic stats
            metrics["monitoring_enabled"] = True
            metrics["performance"] = {
                "operations_monitored": (
                    len(self.performance_monitor.metrics_history)
                    if hasattr(self.performance_monitor, "metrics_history")
                    else 0
                )
            }

        if self.enable_caching and self.cache_manager:
            metrics["cache"] = self.cache_manager.get_stats()

        # Memory calculator metrics
        if hasattr(self.memory_calculator, "get_stats"):
            metrics["memory"] = self.memory_calculator.get_stats()

        return metrics

    def clear_cache(self):
        """Clear the calculation cache."""
        if self.enable_caching and self.cache_manager:
            self.cache_manager.clear_all()
            logger.info("Calculation cache cleared")

    def optimize_settings_for_dataset(
        self, dataset_size: int, available_memory_mb: float
    ) -> Dict[str, Any]:
        """
        Suggest optimal settings for a given dataset size and memory constraints.

        Args:
            dataset_size: Number of chart pairs to process
            available_memory_mb: Available memory in MB

        Returns:
            Dictionary with suggested settings
        """

        # Calculate memory requirements
        estimates = self.memory_calculator.estimate_memory_usage(
            num_charts1=dataset_size, num_charts2=dataset_size
        )

        # Suggest chunk size based on memory constraints
        suggested_chunk_size = self.chunk_size
        if estimates["base_memory_mb"] > available_memory_mb:
            # Reduce chunk size to fit in memory
            memory_ratio = available_memory_mb / estimates["base_memory_mb"]
            suggested_chunk_size = max(10, int(self.chunk_size * memory_ratio))

        recommendations = {
            "chunk_size": suggested_chunk_size,
            "enable_caching": dataset_size
            > 100,  # Cache beneficial for larger datasets
            "enable_memory_pooling": dataset_size
            > 50,  # Pooling beneficial for medium+ datasets
            "expected_memory_usage": estimates,
            "cache_hit_rate_estimate": min(
                80.0, dataset_size / 10
            ),  # Rough estimate
        }

        return recommendations


# Integration functions for existing API endpoints


def optimized_synastry_calculation(
    chart1: Dict[str, float],
    chart2: Dict[str, float],
    orb: float = 8.0,
    use_caching: bool = True,
) -> Dict[str, Any]:
    """
    Drop-in replacement for synastry calculations with Phase 3 optimizations.

    Args:
        chart1: First chart data
        chart2: Second chart data
        orb: Orb tolerance
        use_caching: Whether to use caching

    Returns:
        Dictionary with aspects and metadata
    """

    calculator = OptimizedVectorizedAspectCalculator(
        enable_caching=use_caching, enable_monitoring=True
    )

    # Calculate aspects
    aspect_matrix = calculator.calculate_synastry_aspects(chart1, chart2, orb)

    # Get performance metrics
    metrics = calculator.get_performance_metrics()

    return {
        "aspects": aspect_matrix,
        "metadata": {
            "orb": orb,
            "cached": "cache" in metrics
            and metrics["cache"]["memory_cache"]["hits"] > 0,
            "performance": metrics.get("performance", {}),
            "optimization_enabled": True,
        },
    }


@contextmanager
def optimized_calculation_session(
    chunk_size: int = 100,
    enable_caching: bool = True,
    enable_monitoring: bool = True,
):
    """
    Context manager for optimized calculation sessions.

    Usage:
        with optimized_calculation_session() as calculator:
            results = calculator.calculate_large_batch_synastry(chart_pairs)
            metrics = calculator.get_performance_metrics()
    """

    calculator = OptimizedVectorizedAspectCalculator(
        chunk_size=chunk_size,
        enable_caching=enable_caching,
        enable_monitoring=enable_monitoring,
    )

    try:
        yield calculator
    finally:
        # Cleanup and log final metrics
        if enable_monitoring:
            metrics = calculator.get_performance_metrics()
            if "cache" in metrics:
                cache_stats = metrics["cache"]["memory_cache"]
                logger.info(
                    f"Session complete: {cache_stats['hits']} cache hits, "
                    f"{cache_stats['hit_rate']:.1f}% hit rate"
                )


# Utility functions for migration from traditional calculations


def migrate_traditional_to_optimized(
    traditional_function: Callable, enable_performance_comparison: bool = False
):
    """
    Decorator to migrate traditional calculation functions to optimized versions.

    Args:
        traditional_function: Original function to wrap
        enable_performance_comparison: Whether to compare performance

    Returns:
        Wrapped function with optimizations
    """

    def wrapper(*args, **kwargs):
        calculator = OptimizedVectorizedAspectCalculator()

        if enable_performance_comparison:
            # Run both versions and compare
            import time

            start_time = time.time()
            traditional_result = traditional_function(*args, **kwargs)
            traditional_time = time.time() - start_time

            start_time = time.time()
            # Extract chart data from args/kwargs for optimized calculation
            if len(args) >= 2:
                optimized_result = calculator.calculate_synastry_aspects(
                    args[0], args[1]
                )
            else:
                optimized_result = traditional_result  # Fallback
            optimized_time = time.time() - start_time

            speedup = (
                traditional_time / optimized_time
                if optimized_time > 0
                else 1.0
            )

            logger.info(
                f"Performance comparison - Traditional: {traditional_time:.3f}s, "
                f"Optimized: {optimized_time:.3f}s, Speedup: {speedup:.2f}x"
            )

            return optimized_result
        else:
            # Just use optimized version
            if (
                len(args) >= 2
                and isinstance(args[0], dict)
                and isinstance(args[1], dict)
            ):
                return calculator.calculate_synastry_aspects(args[0], args[1])
            else:
                return traditional_function(*args, **kwargs)

    return wrapper


if __name__ == "__main__":
    # Example usage
    calculator = OptimizedVectorizedAspectCalculator()

    # Test charts
    chart1 = {"Sun": 0.0, "Moon": 90.0, "Mercury": 180.0}
    chart2 = {"Sun": 5.0, "Moon": 95.0, "Mercury": 185.0}

    # Single calculation
    result = calculator.calculate_synastry_aspects(chart1, chart2)
    print(f"Aspect calculation result shape: {result.shape}")

    # Get metrics
    metrics = calculator.get_performance_metrics()
    print(f"Performance metrics: {metrics}")
