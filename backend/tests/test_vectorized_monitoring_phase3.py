"""
Phase 3: Test suite for vectorized performance monitoring.

This test suite validates the performance monitoring framework for vectorized operations.  # noqa: E501
"""

import os
import sys
import time

import numpy as np
import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from utils.vectorized_aspect_utils import VectorizedAspectCalculator  # noqa: E501, E402
from utils.vectorized_monitoring import (  # noqa: E402
    PerformanceMetrics,
    VectorizedPerformanceMonitor,
    get_performance_monitor,
)


class TestVectorizedPerformanceMonitor:
    """Test suite for VectorizedPerformanceMonitor."""

    def setup_method(self):
        """Set up test environment."""
        self.monitor = VectorizedPerformanceMonitor(
            enable_detailed_logging=False
        )
        self.calculator = VectorizedAspectCalculator()

    def test_performance_metrics_creation(self):
        """Test PerformanceMetrics data class."""
        metrics = PerformanceMetrics(
            operation_name="test_op",
            start_time=1000.0,
            end_time=1001.0,
            duration_ms=1000.0,
            memory_before_mb=100.0,
            memory_after_mb=110.0,
            memory_delta_mb=10.0,
            num_calculations=5,
        )

        assert metrics.operation_name == "test_op"
        assert metrics.duration_seconds == 1.0
        assert metrics.calculations_per_second == 5.0
        assert metrics.memory_efficiency_mb_per_calc == 2.0
        assert metrics.success == True  # noqa: E712

    def test_operation_timing(self):
        """Test basic operation timing."""
        with self.monitor.time_operation(
            "test_operation", num_calculations=3
        ) as context:
            time.sleep(0.01)  # Simulate work
            context.add_metric("custom_metric", "test_value")

        # Check that metrics were recorded
        assert len(self.monitor.metrics_history) == 1

        metrics = self.monitor.metrics_history[0]
        assert metrics.operation_name == "test_operation"
        assert metrics.num_calculations == 3
        assert metrics.duration_ms > 10  # At least 10ms from sleep
        assert metrics.success == True  # noqa: E712
        assert metrics.additional_data["custom_metric"] == "test_value"

    def test_operation_with_exception(self):
        """Test operation timing with exception handling."""
        with pytest.raises(ValueError):
            with self.monitor.time_operation("failing_operation") as context:  # noqa: E501, F841
                raise ValueError("Test error")

        # Check that metrics were still recorded
        assert len(self.monitor.metrics_history) == 1

        metrics = self.monitor.metrics_history[0]
        assert metrics.operation_name == "failing_operation"
        assert metrics.success == False  # noqa: E712
        assert metrics.error_message == "Test error"

    def test_memory_usage_tracking(self):
        """Test memory usage tracking."""
        # Create some data to use memory
        with self.monitor.time_operation(
            "memory_test", num_calculations=1
        ) as context:
            large_array = np.random.rand(1000, 1000)  # ~8MB array
            context.add_array_info("test_array", large_array)

        metrics = self.monitor.metrics_history[0]
        assert metrics.memory_delta_mb >= 0  # Should have used some memory
        assert "test_array_shape" in metrics.additional_data
        assert "test_array_size_mb" in metrics.additional_data

    def test_baseline_establishment(self):
        """Test that baselines are established and updated."""
        # Run same operation multiple times
        for i in range(5):
            with self.monitor.time_operation(
                "baseline_test", num_calculations=10
            ):
                time.sleep(0.001)  # Consistent small delay

        # Check that baseline was established
        assert "baseline_test" in self.monitor.operation_baselines
        baseline = self.monitor.operation_baselines["baseline_test"]
        assert baseline["sample_count"] == 5
        assert baseline["avg_duration_ms"] > 0

    def test_performance_regression_detection(self):
        """Test performance regression detection."""
        # Establish baseline with fast operations
        for i in range(5):
            with self.monitor.time_operation(
                "regression_test", num_calculations=1
            ):
                time.sleep(0.001)

        # Now run slower operations
        for i in range(3):
            with self.monitor.time_operation(
                "regression_test", num_calculations=1
            ):
                time.sleep(0.01)  # 10x slower

        # Should detect regression
        regression = self.monitor.detect_performance_regression(
            "regression_test", threshold_factor=2.0
        )
        assert regression is not None
        assert regression["duration_regression"] == True  # noqa: E712
        assert regression["operation_name"] == "regression_test"

    def test_performance_report_generation(self):
        """Test performance report generation."""
        # Generate some test data
        with self.monitor.time_operation("report_test", num_calculations=5):
            time.sleep(0.005)

        with self.monitor.time_operation("report_test", num_calculations=10):
            time.sleep(0.003)

        # Generate report
        report = self.monitor.generate_performance_report("report_test")

        assert report["total_operations"] == 2
        assert report["successful_operations"] == 2
        assert report["success_rate_percent"] == 100.0
        assert "duration_statistics" in report
        assert "memory_statistics" in report
        assert "throughput_statistics" in report
        assert report["duration_statistics"]["avg_ms"] > 0

    def test_comprehensive_report(self):
        """Test comprehensive report for all operations."""
        # Run different operations
        with self.monitor.time_operation("op1", num_calculations=5):
            pass

        with self.monitor.time_operation("op2", num_calculations=3):
            pass

        report = self.monitor.generate_performance_report()
        assert report["total_operations"] == 2
        assert "operation_baselines" in report

    def test_metrics_export_json(self, tmp_path):
        """Test exporting metrics to JSON."""
        # Generate test data
        with self.monitor.time_operation("export_test", num_calculations=2):
            time.sleep(0.001)

        export_file = tmp_path / "metrics.json"
        self.monitor.export_metrics(export_file, format_type="json")

        assert export_file.exists()

        # Verify export content
        import json

        with open(export_file) as f:
            data = json.load(f)

        assert "export_timestamp" in data
        assert "metrics" in data
        assert len(data["metrics"]) == 1
        assert data["metrics"][0]["operation_name"] == "export_test"

    def test_metrics_export_csv(self, tmp_path):
        """Test exporting metrics to CSV."""
        # Generate test data
        with self.monitor.time_operation("csv_test", num_calculations=1):
            pass

        export_file = tmp_path / "metrics.csv"
        self.monitor.export_metrics(export_file, format_type="csv")

        assert export_file.exists()

        # Verify CSV content
        import csv

        with open(export_file, "r") as f:
            reader = csv.DictReader(f)
            rows = list(reader)

        assert len(rows) == 1
        assert rows[0]["operation_name"] == "csv_test"

    def test_metrics_retention(self):
        """Test that old metrics are cleaned up."""
        # Create monitor with very short retention
        short_monitor = VectorizedPerformanceMonitor(
            enable_detailed_logging=False,
            metrics_retention_hours=0.001,  # ~3.6 seconds
        )

        # Add a metric
        with short_monitor.time_operation("retention_test"):
            pass

        assert len(short_monitor.metrics_history) == 1

        # Wait for retention to expire
        time.sleep(0.004)

        # Add another metric (should trigger cleanup)
        with short_monitor.time_operation("retention_test2"):
            pass

        # First metric should be cleaned up
        assert len(short_monitor.metrics_history) == 1
        assert (
            short_monitor.metrics_history[0].operation_name
            == "retention_test2"
        )


class TestVectorizedAspectCalculatorWithMonitoring:
    """Test integration of monitoring with vectorized aspect calculations."""

    def setup_method(self):
        """Set up test environment."""
        self.monitor = get_performance_monitor()
        self.calculator = VectorizedAspectCalculator()
        # Clear previous metrics
        self.monitor.metrics_history.clear()

    def test_monitored_aspect_calculation(self):
        """Test monitoring of vectorized aspect calculations."""
        chart1 = {
            "Sun": 0.0,
            "Moon": 60.0,
            "Mercury": 90.0,
            "Venus": 120.0,
            "Mars": 180.0,
            "Jupiter": 210.0,
            "Saturn": 240.0,
            "Uranus": 270.0,
            "Neptune": 300.0,
            "Pluto": 330.0,
        }
        chart2 = {
            "Sun": 5.0,
            "Moon": 58.0,
            "Mercury": 95.0,
            "Venus": 117.0,
            "Mars": 175.0,
            "Jupiter": 30.0,
            "Saturn": 120.0,
            "Uranus": 0.0,
            "Neptune": 240.0,
            "Pluto": 90.0,
        }

        with self.monitor.time_operation(
            "vectorized_aspect_calculation", num_calculations=100
        ) as context:
            # Calculate separation matrix
            separations = self.calculator.calculate_separation_matrix(
                chart1, chart2
            )
            context.add_array_info("separations", separations)

            # Build aspect matrix
            aspects = self.calculator.build_aspect_matrix_vectorized(
                chart1, chart2
            )
            context.add_metric("num_aspects_found", np.count_nonzero(aspects))

        # Verify monitoring worked
        assert len(self.monitor.metrics_history) >= 1

        latest_metrics = self.monitor.metrics_history[-1]
        assert latest_metrics.operation_name == "vectorized_aspect_calculation"
        assert latest_metrics.success == True  # noqa: E712
        assert "separations_shape" in latest_metrics.additional_data
        assert "num_aspects_found" in latest_metrics.additional_data

    def test_batch_processing_monitoring(self):
        """Test monitoring of batch processing operations."""
        # Create multiple chart pairs
        chart_pairs = []
        for i in range(5):
            chart1 = {
                planet: float(i * 10 + j * 30) % 360
                for j, planet in enumerate(
                    [
                        "Sun",
                        "Moon",
                        "Mercury",
                        "Venus",
                        "Mars",
                        "Jupiter",
                        "Saturn",
                        "Uranus",
                        "Neptune",
                        "Pluto",
                    ]
                )
            }
            chart2 = {
                planet: float((i + 1) * 15 + j * 25) % 360
                for j, planet in enumerate(
                    [
                        "Sun",
                        "Moon",
                        "Mercury",
                        "Venus",
                        "Mars",
                        "Jupiter",
                        "Saturn",
                        "Uranus",
                        "Neptune",
                        "Pluto",
                    ]
                )
            }
            chart_pairs.append((chart1, chart2))

        with self.monitor.time_operation(
            "batch_aspect_calculation", num_calculations=len(chart_pairs)
        ) as context:
            results = []
            for chart1, chart2 in chart_pairs:
                result = self.calculator.build_aspect_matrix_vectorized(
                    chart1, chart2
                )
                results.append(result)

            context.add_metric("total_chart_pairs", len(chart_pairs))
            context.add_metric(
                "avg_aspects_per_pair",
                sum(np.count_nonzero(r) for r in results) / len(results),
            )

        # Verify batch monitoring
        latest_metrics = self.monitor.metrics_history[-1]
        assert latest_metrics.operation_name == "batch_aspect_calculation"
        assert latest_metrics.num_calculations == 5
        assert "total_chart_pairs" in latest_metrics.additional_data
        assert "avg_aspects_per_pair" in latest_metrics.additional_data

    def test_performance_comparison_monitoring(self):
        """Test monitoring of performance comparisons between methods."""
        chart1 = {f"Planet{i}": float(i * 30) for i in range(10)}
        chart2 = {f"Planet{i}": float(i * 35) for i in range(10)}

        # Monitor vectorized calculation
        with self.monitor.time_operation(
            "vectorized_method", num_calculations=1
        ):
            vectorized_result = self.calculator.build_aspect_matrix_vectorized(  # noqa: E501, F841
                chart1, chart2
            )

        # Monitor traditional method (if available)
        try:
            from utils.aspect_utils import PLANETS, build_aspect_matrix

            with self.monitor.time_operation(
                "traditional_method", num_calculations=1
            ):
                traditional_result = build_aspect_matrix(  # noqa: F841
                    chart1, chart2, PLANETS[: len(chart1)]
                )

        except ImportError:
            # Skip if traditional method not available
            pass

        # Generate comparison report
        report = self.monitor.generate_performance_report()
        assert report["total_operations"] >= 1


if __name__ == "__main__":
    pytest.main([__file__])
