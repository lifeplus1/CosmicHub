"""
Tests for astro/calculations/chart.py
"""
import pytest
from backend.astro.calculations.chart import (
    validate_inputs,
    calculate_chart,
    calculate_multi_system_chart,
    get_location
)


class TestValidateInputs:
    """Test input validation for chart calculations"""
    
    def test_valid_inputs(self):
        """Test valid input parameters."""
        assert validate_inputs(1990, 5, 15, 14, 30, 40.7128, -74.0060, city="New York") is True
    
    def test_invalid_year_too_early(self):
        """Test that years before 1900 are rejected"""
        with pytest.raises(ValueError, match="Year 1899 must be between 1900 and 2100"):
            validate_inputs(1899, 5, 15, 14, 30)
    
    def test_invalid_year_too_late(self):
        """Test that years after 2100 are rejected"""
        with pytest.raises(ValueError, match="Year 2101 must be between 1900 and 2100"):
            validate_inputs(2101, 5, 15, 14, 30)
    
    def test_invalid_month(self):
        """Test that invalid months are rejected"""
        with pytest.raises(ValueError, match="Month 13 must be between 1 and 12"):
            validate_inputs(1990, 13, 15, 14, 30)
        
        with pytest.raises(ValueError, match="Month 0 must be between 1 and 12"):
            validate_inputs(1990, 0, 15, 14, 30)
    
    def test_invalid_day(self):
        """Test that invalid days are rejected"""
        with pytest.raises(ValueError, match="Day 32 must be between 1 and 31"):
            validate_inputs(1990, 5, 32, 14, 30)
        
        with pytest.raises(ValueError, match="Day 0 must be between 1 and 31"):
            validate_inputs(1990, 5, 0, 14, 30)
    
    def test_invalid_hour(self):
        """Test that invalid hours are rejected"""
        with pytest.raises(ValueError, match="Hour 24 must be between 0 and 23"):
            validate_inputs(1990, 5, 15, 24, 30)
        
        with pytest.raises(ValueError, match="Hour -1 must be between 0 and 23"):
            validate_inputs(1990, 5, 15, -1, 30)
    
    def test_invalid_minute(self):
        """Test that invalid minutes are rejected"""
        with pytest.raises(ValueError, match="Minute 60 must be between 0 and 59"):
            validate_inputs(1990, 5, 15, 14, 60)
        
        with pytest.raises(ValueError, match="Minute -1 must be between 0 and 59"):
            validate_inputs(1990, 5, 15, 14, -1)
    
    def test_invalid_latitude(self):
        """Test that invalid latitudes are rejected"""
        with pytest.raises(ValueError, match="Latitude 91 must be between -90 and 90"):
            validate_inputs(1990, 5, 15, 14, 30, lat=91)
        
        with pytest.raises(ValueError, match="Latitude -91 must be between -90 and 90"):
            validate_inputs(1990, 5, 15, 14, 30, lat=-91)
    
    def test_invalid_longitude(self):
        """Test that invalid longitudes are rejected"""
        with pytest.raises(ValueError, match="Longitude 181 must be between -180 and 180"):
            validate_inputs(1990, 5, 15, 14, 30, lon=181)
        
        with pytest.raises(ValueError, match="Longitude -181 must be between -180 and 180"):
            validate_inputs(1990, 5, 15, 14, 30, lon=-181)
    
    def test_invalid_date_february_30(self):
        """Test that impossible dates are rejected"""
        with pytest.raises(ValueError, match="Invalid date"):
            validate_inputs(1990, 2, 30, 14, 30)


class TestCalculateChart:
    """Test chart calculation functionality"""
    
    def test_basic_chart_calculation(self):
        """Test basic chart calculation with valid inputs"""
        result = calculate_chart(
            year=1990,
            month=5,
            day=15,
            hour=14,
            minute=30,
            lat=40.7128,
            lon=-74.0060,
            timezone="America/New_York"
        )
        
        assert isinstance(result, dict)
        assert 'planets' in result
        assert 'houses' in result
        assert 'aspects' in result
        
        # Check that we have the expected planets
        expected_planets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn']
        for planet in expected_planets:
            assert planet in result['planets']
            assert 'position' in result['planets'][planet]
    
    def test_chart_calculation_with_city(self):
        """Test chart calculation using city name"""
        result = calculate_chart(
            year=1990,
            month=5,
            day=15,
            hour=14,
            minute=30,
            city="New York"
        )
        
        assert isinstance(result, dict)
        assert 'planets' in result
    
    def test_validate_inputs_valid(self):
        assert validate_inputs(2000, 5, 15, 12, 30, 40.0, -74.0, "America/New_York", "New York") is True

    def test_validate_inputs_invalid_year(self):
        with pytest.raises(ValueError):
            validate_inputs(1800, 5, 15, 12, 30, 40.0, -74.0, "America/New_York", "New York")


class TestMultiSystemChart:
    """Test multi-system chart calculation"""
    
    def test_multi_system_chart_basic(self):
        """Test basic multi-system chart calculation"""
        result = calculate_multi_system_chart(
            year=1990,
            month=5,
            day=15,
            hour=14,
            minute=30,
            lat=40.7128,
            lon=-74.0060,
            timezone="America/New_York"
        )
        
        assert isinstance(result, dict)
        assert 'western_tropical' in result
        assert 'vedic_sidereal' in result
        
        # Check western system has required components
        assert 'planets' in result['western_tropical']
        assert 'houses' in result['western_tropical']
        
        # Check vedic system has required components
        assert 'planets' in result['vedic_sidereal']
        assert 'houses' in result['vedic_sidereal']


class TestLocationData:
    """Test location data retrieval"""
    
    @pytest.mark.slow
    def test_get_location_with_city(self):
        """Test getting location data with city name (slow test due to geocoding)"""
        result = get_location("London")
        
        assert isinstance(result, dict)
        assert 'latitude' in result
        assert 'longitude' in result
        assert 'timezone' in result
        assert isinstance(result['latitude'], float)
        assert isinstance(result['longitude'], float)
