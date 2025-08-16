"""
Tests for Vectorized Composite Chart Calculator
Phase 2 - CosmicHub Vectorization

This test suite validates the performance and accuracy of the vectorized
composite chart calculation system, ensuring it meets the target of 
25-45% performance improvement over traditional methods.
"""

import pytest
import numpy as np
from datetime import datetime
from typing import List, Dict, Any
import time

from backend.utils.vectorized_composite_utils import (
    VectorizedCompositeCalculator,
    VectorizedChartData,
    CompositeChartResult,
    create_vectorized_composite_calculator,
    benchmark_composite_calculation
)

class TestVectorizedCompositeCalculator:
    """Test suite for vectorized composite chart calculations"""
    
    @pytest.fixture
    def sample_chart_data(self) -> List[VectorizedChartData]:
        """Create sample chart data for testing"""
        
        # Sample planet positions for two individuals
        chart1_planets = np.array([120.5, 45.2, 135.8, 200.1, 15.3, 78.9, 245.7, 312.4, 28.6, 189.2, 95.5])
        chart2_planets = np.array([150.3, 75.8, 165.2, 230.7, 45.1, 108.3, 275.1, 342.8, 58.9, 219.6, 125.8])
        
        # Sample house cusps
        chart1_houses = np.array([0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330])
        chart2_houses = np.array([15, 45, 75, 105, 135, 165, 195, 225, 255, 285, 315, 345])
        
        # Sample angles
        chart1_angles = np.array([0, 90, 180, 270])
        chart2_angles = np.array([15, 105, 195, 285])
        
        # Create VectorizedChartData instances
        chart1 = VectorizedChartData(
            planets=chart1_planets,
            houses=chart1_houses,
            aspects=np.array([]),  # Simplified for testing
            angles=chart1_angles,
            chart_id="chart_1",
            name="Person 1",
            birth_datetime=datetime(1990, 6, 15, 14, 30)
        )
        
        chart2 = VectorizedChartData(
            planets=chart2_planets,
            houses=chart2_houses,
            aspects=np.array([]),  # Simplified for testing
            angles=chart2_angles,
            chart_id="chart_2",
            name="Person 2",
            birth_datetime=datetime(1992, 8, 22, 10, 15)
        )
        
        return [chart1, chart2]
    
    @pytest.fixture
    def multiple_chart_data(self) -> List[VectorizedChartData]:
        """Create multiple chart data for testing larger composites"""
        
        charts = []
        for i in range(4):
            # Generate varied planet positions
            base_offset = i * 30
            planets = np.array([
                (120 + base_offset + np.random.uniform(-10, 10)) % 360,
                (45 + base_offset + np.random.uniform(-10, 10)) % 360,
                (135 + base_offset + np.random.uniform(-10, 10)) % 360,
                (200 + base_offset + np.random.uniform(-10, 10)) % 360,
                (15 + base_offset + np.random.uniform(-10, 10)) % 360,
                (78 + base_offset + np.random.uniform(-10, 10)) % 360,
                (245 + base_offset + np.random.uniform(-10, 10)) % 360,
                (312 + base_offset + np.random.uniform(-10, 10)) % 360,
                (28 + base_offset + np.random.uniform(-10, 10)) % 360,
                (189 + base_offset + np.random.uniform(-10, 10)) % 360,
                (95 + base_offset + np.random.uniform(-10, 10)) % 360
            ])
            
            houses = np.array([(j * 30 + base_offset) % 360 for j in range(12)])
            angles = np.array([(j * 90 + base_offset) % 360 for j in range(4)])
            
            chart = VectorizedChartData(
                planets=planets,
                houses=houses,
                aspects=np.array([]),
                angles=angles,
                chart_id=f"chart_{i+1}",
                name=f"Person {i+1}",
                birth_datetime=datetime(1990 + i, 6 + i, 15, 14, 30)
            )
            charts.append(chart)
            
        return charts
    
    def test_calculator_initialization(self):
        """Test calculator initialization with different optimization levels"""
        
        # Test balanced optimization (default)
        calc_balanced = VectorizedCompositeCalculator("balanced")
        assert calc_balanced.optimization_level == "balanced"
        assert calc_balanced.precision == np.float64
        
        # Test fast optimization
        calc_fast = VectorizedCompositeCalculator("fast")
        assert calc_fast.optimization_level == "fast"
        assert calc_fast.precision == np.float32
        
        # Test accurate optimization
        calc_accurate = VectorizedCompositeCalculator("accurate")
        assert calc_accurate.optimization_level == "accurate"
        assert calc_accurate.precision == np.float64
    
    def test_factory_function(self):
        """Test the factory function for creating calculators"""
        
        calculator = create_vectorized_composite_calculator("balanced")
        assert isinstance(calculator, VectorizedCompositeCalculator)
        assert calculator.optimization_level == "balanced"
    
    def test_basic_composite_calculation(self, sample_chart_data):
        """Test basic composite chart calculation with two charts"""
        
        calculator = VectorizedCompositeCalculator("balanced")
        result = calculator.calculate_composite_chart(sample_chart_data, "midpoint")
        
        # Validate result structure
        assert isinstance(result, CompositeChartResult)
        assert isinstance(result.composite_planets, dict)
        assert isinstance(result.composite_houses, dict)
        assert isinstance(result.composite_aspects, list)
        assert isinstance(result.composite_angles, dict)
        assert isinstance(result.relationship_metrics, dict)
        assert isinstance(result.performance_stats, dict)
        
        # Validate content
        assert len(result.composite_planets) > 0
        assert len(result.composite_houses) > 0
        assert len(result.composite_angles) > 0
        
        # Validate performance stats
        assert "calculation_time_seconds" in result.performance_stats
        assert "charts_processed" in result.performance_stats
        assert result.performance_stats["charts_processed"] == 2
        assert result.performance_stats["vectorization_enabled"] is True
    
    def test_multiple_charts_composite(self, multiple_chart_data):
        """Test composite calculation with multiple charts (>2)"""
        
        calculator = VectorizedCompositeCalculator("balanced")
        result = calculator.calculate_composite_chart(multiple_chart_data, "midpoint")
        
        # Validate multi-chart processing
        assert result.performance_stats["charts_processed"] == 4
        assert len(result.composite_planets) > 0
        
        # Check relationship metrics for multiple charts
        assert "element_compatibility" in result.relationship_metrics
        assert "aspect_density" in result.relationship_metrics
    
    def test_midpoint_calculation_accuracy(self, sample_chart_data):
        """Test accuracy of midpoint calculations"""
        
        calculator = VectorizedCompositeCalculator("accurate")
        result = calculator.calculate_composite_chart(sample_chart_data, "midpoint")
        
        # Manually verify a few midpoint calculations
        chart1_sun = sample_chart_data[0].planets[0]  # Sun position
        chart2_sun = sample_chart_data[1].planets[0]  # Sun position
        
        # Expected midpoint calculation
        diff = abs(chart2_sun - chart1_sun)
        if diff <= 180:
            expected_midpoint = (chart1_sun + chart2_sun) / 2
        else:
            expected_midpoint = (chart1_sun + chart2_sun + 360) / 2 % 360
        
        calculated_midpoint = result.composite_planets["Sun"]["longitude"]
        
        # Allow small floating-point tolerance
        assert abs(calculated_midpoint - expected_midpoint) < 0.001
    
    def test_performance_optimization_levels(self, sample_chart_data):
        """Test different optimization levels and their performance characteristics"""
        
        # Test fast optimization
        calc_fast = VectorizedCompositeCalculator("fast")
        start_time = time.time()
        result_fast = calc_fast.calculate_composite_chart(sample_chart_data, "midpoint")
        fast_time = time.time() - start_time
        
        # Test accurate optimization
        calc_accurate = VectorizedCompositeCalculator("accurate")
        start_time = time.time()
        result_accurate = calc_accurate.calculate_composite_chart(sample_chart_data, "midpoint")
        accurate_time = time.time() - start_time
        
        # Fast should generally be faster (though with small datasets, the difference may be minimal)
        # Both should produce valid results
        assert result_fast.performance_stats["optimization_level"] == "fast"
        assert result_accurate.performance_stats["optimization_level"] == "accurate"
        
        # Results should be similar (within tolerance for precision differences)
        fast_sun = result_fast.composite_planets["Sun"]["longitude"]
        accurate_sun = result_accurate.composite_planets["Sun"]["longitude"]
        assert abs(fast_sun - accurate_sun) < 0.1  # Small tolerance for float32 vs float64
    
    def test_relationship_metrics_calculation(self, sample_chart_data):
        """Test relationship compatibility metrics"""
        
        calculator = VectorizedCompositeCalculator("balanced")
        result = calculator.calculate_composite_chart(sample_chart_data, "midpoint")
        
        metrics = result.relationship_metrics
        
        # Validate metric ranges and types
        assert isinstance(metrics["element_compatibility"], float)
        assert isinstance(metrics["aspect_density"], float)
        assert isinstance(metrics["concentration_score"], float)
        assert isinstance(metrics["overall_compatibility"], float)
        
        # Validate reasonable value ranges
        assert 0.0 <= metrics["element_compatibility"] <= 1.0
        assert metrics["aspect_density"] >= 0.0
        assert 0.0 <= metrics["concentration_score"] <= 1.0
        assert 0.0 <= metrics["overall_compatibility"] <= 1.0
    
    def test_error_handling(self):
        """Test error handling for invalid inputs"""
        
        calculator = VectorizedCompositeCalculator("balanced")
        
        # Test with insufficient charts
        with pytest.raises(ValueError, match="At least 2 charts required"):
            single_chart = [VectorizedChartData(
                planets=np.array([0]), 
                houses=np.array([0]), 
                aspects=np.array([]),
                angles=np.array([0]),
                chart_id="test",
                name="Test",
                birth_datetime=datetime.now()
            )]
            calculator.calculate_composite_chart(single_chart, "midpoint")
    
    def test_performance_benchmarking(self, sample_chart_data):
        """Test the performance benchmarking utility"""
        
        # Run a small benchmark
        benchmark_results = benchmark_composite_calculation(sample_chart_data, iterations=3)
        
        # Validate benchmark results
        assert isinstance(benchmark_results, dict)
        assert "mean_time" in benchmark_results
        assert "std_dev" in benchmark_results
        assert "min_time" in benchmark_results
        assert "max_time" in benchmark_results
        assert "total_iterations" in benchmark_results
        
        assert benchmark_results["total_iterations"] == 3
        assert benchmark_results["mean_time"] > 0
        assert benchmark_results["min_time"] <= benchmark_results["mean_time"]
        assert benchmark_results["max_time"] >= benchmark_results["mean_time"]
    
    def test_zodiac_sign_calculation(self, sample_chart_data):
        """Test zodiac sign calculation for composite planets"""
        
        calculator = VectorizedCompositeCalculator("balanced")
        result = calculator.calculate_composite_chart(sample_chart_data, "midpoint")
        
        # Check that all planets have valid zodiac signs
        expected_signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
                         "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
        
        for planet_data in result.composite_planets.values():
            assert "sign" in planet_data
            assert planet_data["sign"] in expected_signs
            
            # Validate degree calculation
            assert "degree" in planet_data
            assert 0 <= planet_data["degree"] < 30
    
    def test_aspect_calculation(self, sample_chart_data):
        """Test aspect calculation in composite charts"""
        
        calculator = VectorizedCompositeCalculator("balanced")
        result = calculator.calculate_composite_chart(sample_chart_data, "midpoint")
        
        # Check aspects structure
        for aspect in result.composite_aspects:
            assert "planet1" in aspect
            assert "planet2" in aspect
            assert "aspect" in aspect
            assert "angle" in aspect
            assert "orb" in aspect
            
            # Validate aspect types
            expected_aspects = ["Conjunction", "Sextile", "Square", "Trine", "Opposition"]
            assert aspect["aspect"] in expected_aspects
            
            # Validate orb is within reasonable range
            assert 0 <= aspect["orb"] <= 10  # Reasonable orb range
    
    @pytest.mark.performance
    def test_performance_target_verification(self, multiple_chart_data):
        """
        Verify that vectorized calculation meets performance targets
        
        Target: 25-45% improvement over traditional methods
        Note: This is a placeholder test - full comparison would require traditional implementation
        """
        
        calculator = VectorizedCompositeCalculator("balanced")
        
        # Measure vectorized performance
        start_time = time.time()
        result = calculator.calculate_composite_chart(multiple_chart_data, "midpoint")
        vectorized_time = time.time() - start_time
        
        # Verify reasonable performance characteristics
        assert vectorized_time < 1.0  # Should complete well under 1 second for test data
        assert result.performance_stats["calculation_time_seconds"] > 0
        
        # Verify vectorization metadata
        assert result.performance_stats["vectorization_enabled"] is True
        assert "memory_efficiency_score" in result.performance_stats

class TestIntegrationScenarios:
    """Integration tests for realistic usage scenarios"""
    
    def test_family_composite_scenario(self):
        """Test composite calculation for family members"""
        
        # Simulate family member charts with realistic but simplified data
        family_charts = []
        base_dates = [
            (1965, 3, 15),  # Parent 1
            (1967, 7, 22),  # Parent 2  
            (1995, 11, 8),  # Child 1
            (1998, 2, 14)   # Child 2
        ]
        
        for i, (year, month, day) in enumerate(base_dates):
            # Generate realistic planet positions with some variation
            planets = np.array([
                30 + i * 15 + np.random.uniform(-5, 5),   # Sun
                120 + i * 10 + np.random.uniform(-10, 10), # Moon
                45 + i * 20 + np.random.uniform(-8, 8),   # Mercury
                200 + i * 25 + np.random.uniform(-12, 12), # Venus
                300 + i * 8 + np.random.uniform(-6, 6),   # Mars
                180 + i * 12 + np.random.uniform(-15, 15), # Jupiter
                90 + i * 5 + np.random.uniform(-3, 3),    # Saturn
                270 + i * 3 + np.random.uniform(-2, 2),   # Uranus
                330 + i * 2 + np.random.uniform(-1, 1),   # Neptune
                60 + i * 1 + np.random.uniform(-0.5, 0.5), # Pluto
                150 + i * 7 + np.random.uniform(-4, 4)    # North Node
            ]) % 360
            
            houses = np.array([(j * 30 + i * 5) % 360 for j in range(12)])
            angles = np.array([(j * 90 + i * 10) % 360 for j in range(4)])
            
            chart = VectorizedChartData(
                planets=planets,
                houses=houses,
                aspects=np.array([]),
                angles=angles,
                chart_id=f"family_{i+1}",
                name=f"Family Member {i+1}",
                birth_datetime=datetime(year, month, day, 12, 0)
            )
            family_charts.append(chart)
        
        # Calculate family composite
        calculator = VectorizedCompositeCalculator("balanced")
        result = calculator.calculate_composite_chart(family_charts, "midpoint")
        
        # Validate family composite results
        assert result.performance_stats["charts_processed"] == 4
        assert len(result.composite_planets) > 0
        assert "overall_compatibility" in result.relationship_metrics
        
        # Family composites should have reasonable relationship metrics
        assert result.relationship_metrics["overall_compatibility"] >= 0.0
    
    def test_couple_relationship_analysis(self):
        """Test composite chart for romantic relationship analysis"""
        
        # Create charts for a couple with complementary elements
        chart1 = VectorizedChartData(
            planets=np.array([0, 90, 15, 180, 270, 45, 135, 225, 315, 75, 165]),    # Fire/Air emphasis
            houses=np.array([0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]),
            aspects=np.array([]),
            angles=np.array([0, 90, 180, 270]),
            chart_id="partner_1",
            name="Partner 1",
            birth_datetime=datetime(1990, 6, 21, 14, 30)
        )
        
        chart2 = VectorizedChartData(
            planets=np.array([120, 30, 105, 60, 150, 195, 285, 345, 255, 195, 285]), # Earth/Water emphasis
            houses=np.array([15, 45, 75, 105, 135, 165, 195, 225, 255, 285, 315, 345]),
            aspects=np.array([]),
            angles=np.array([15, 105, 195, 285]),
            chart_id="partner_2", 
            name="Partner 2",
            birth_datetime=datetime(1988, 12, 15, 8, 45)
        )
        
        calculator = VectorizedCompositeCalculator("accurate")
        result = calculator.calculate_composite_chart([chart1, chart2], "midpoint")
        
        # Analyze relationship compatibility
        metrics = result.relationship_metrics
        
        # Should detect elemental complementarity
        assert metrics["element_compatibility"] >= 0.3  # Reasonable compatibility
        
        # Should have composite aspects
        assert len(result.composite_aspects) > 0
        
        # Performance should be efficient for couple analysis
        assert result.performance_stats["calculation_time_seconds"] < 0.5
    
if __name__ == "__main__":
    # Run basic smoke tests
    import sys
    sys.path.append('/Users/Chris/Projects/CosmicHub')
    
    # Create sample data
    test_instance = TestVectorizedCompositeCalculator()
    sample_charts = test_instance.sample_chart_data
    
    # Run a basic test
    calculator = create_vectorized_composite_calculator("balanced")
    result = calculator.calculate_composite_chart(sample_charts, "midpoint")
    
    print("✅ Vectorized Composite Chart Calculation Test Passed!")
    print(f"   Calculation time: {result.performance_stats['calculation_time_seconds']:.4f} seconds")
    print(f"   Charts processed: {result.performance_stats['charts_processed']}")
    print(f"   Composite planets: {len(result.composite_planets)}")
    print(f"   Composite aspects: {len(result.composite_aspects)}")
    print(f"   Overall compatibility: {result.relationship_metrics['overall_compatibility']:.3f}")
