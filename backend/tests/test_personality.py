"""
Tests for astro/calculations/personality.py
"""
import pytest
from astro.calculations.personality import (
    get_personality_traits,
    get_sun_sign
)


class TestPersonalityTraits:
    """Test personality traits calculation"""
    
    def test_get_personality_traits_aries(self):
        """Test personality traits for Aries"""
        chart = {
            "planets": {
                "sun": {
                    "position": 15.0  # 15 degrees = Aries
                }
            }
        }
        
        result = get_personality_traits(chart)
        
        assert isinstance(result, dict)
        assert 'sun_sign' in result
        assert 'traits' in result
        assert result['sun_sign'] == 'Aries'
        assert 'Bold' in result['traits']
    
    def test_get_personality_traits_leo(self):
        """Test personality traits for Leo"""
        chart = {
            "planets": {
                "sun": {
                    "position": 135.0  # 135 degrees = Leo (4th sign * 30 + 15)
                }
            }
        }
        
        result = get_personality_traits(chart)
        
        assert isinstance(result, dict)
        assert result['sun_sign'] == 'Leo'
        assert 'Confident' in result['traits']
    
    def test_get_personality_traits_pisces(self):
        """Test personality traits for Pisces"""
        chart = {
            "planets": {
                "sun": {
                    "position": 345.0  # 345 degrees = Pisces (11th sign * 30 + 15)
                }
            }
        }
        
        result = get_personality_traits(chart)
        
        assert isinstance(result, dict)
        assert result['sun_sign'] == 'Pisces'
        assert 'Empathetic' in result['traits']
    
    def test_get_personality_traits_invalid_chart(self):
        """Test personality traits with invalid chart data"""
        invalid_chart: dict[str, dict[str, dict[str, float]]] = {
            "planets": {
                "sun": {}  # Missing position
            }
        }
        
        with pytest.raises(Exception):
            get_personality_traits(invalid_chart)
    
    def test_get_personality_traits_missing_sun(self):
        """Test personality traits with missing sun data"""
        invalid_chart: dict[str, dict[str, dict[str, float]]] = {
            "planets": {}  # Missing sun
        }
        
        with pytest.raises(Exception):
            get_personality_traits(invalid_chart)


class TestSunSignCalculation:
    """Test sun sign calculation from position"""
    
    def test_get_sun_sign_aries(self):
        """Test Aries sun sign calculation"""
        # Aries: 0-30 degrees
        assert get_sun_sign(0.0) == 'Aries'
        assert get_sun_sign(15.0) == 'Aries'
        assert get_sun_sign(29.9) == 'Aries'
    
    def test_get_sun_sign_taurus(self):
        """Test Taurus sun sign calculation"""
        # Taurus: 30-60 degrees
        assert get_sun_sign(30.0) == 'Taurus'
        assert get_sun_sign(45.0) == 'Taurus'
        assert get_sun_sign(59.9) == 'Taurus'
    
    def test_get_sun_sign_gemini(self):
        """Test Gemini sun sign calculation"""
        # Gemini: 60-90 degrees
        assert get_sun_sign(60.0) == 'Gemini'
        assert get_sun_sign(75.0) == 'Gemini'
        assert get_sun_sign(89.9) == 'Gemini'
    
    def test_get_sun_sign_cancer(self):
        """Test Cancer sun sign calculation"""
        # Cancer: 90-120 degrees
        assert get_sun_sign(90.0) == 'Cancer'
        assert get_sun_sign(105.0) == 'Cancer'
        assert get_sun_sign(119.9) == 'Cancer'
    
    def test_get_sun_sign_leo(self):
        """Test Leo sun sign calculation"""
        # Leo: 120-150 degrees
        assert get_sun_sign(120.0) == 'Leo'
        assert get_sun_sign(135.0) == 'Leo'
        assert get_sun_sign(149.9) == 'Leo'
    
    def test_get_sun_sign_virgo(self):
        """Test Virgo sun sign calculation"""
        # Virgo: 150-180 degrees
        assert get_sun_sign(150.0) == 'Virgo'
        assert get_sun_sign(165.0) == 'Virgo'
        assert get_sun_sign(179.9) == 'Virgo'
    
    def test_get_sun_sign_libra(self):
        """Test Libra sun sign calculation"""
        # Libra: 180-210 degrees
        assert get_sun_sign(180.0) == 'Libra'
        assert get_sun_sign(195.0) == 'Libra'
        assert get_sun_sign(209.9) == 'Libra'
    
    def test_get_sun_sign_scorpio(self):
        """Test Scorpio sun sign calculation"""
        # Scorpio: 210-240 degrees
        assert get_sun_sign(210.0) == 'Scorpio'
        assert get_sun_sign(225.0) == 'Scorpio'
        assert get_sun_sign(239.9) == 'Scorpio'
    
    def test_get_sun_sign_sagittarius(self):
        """Test Sagittarius sun sign calculation"""
        # Sagittarius: 240-270 degrees
        assert get_sun_sign(240.0) == 'Sagittarius'
        assert get_sun_sign(255.0) == 'Sagittarius'
        assert get_sun_sign(269.9) == 'Sagittarius'
    
    def test_get_sun_sign_capricorn(self):
        """Test Capricorn sun sign calculation"""
        # Capricorn: 270-300 degrees
        assert get_sun_sign(270.0) == 'Capricorn'
        assert get_sun_sign(285.0) == 'Capricorn'
        assert get_sun_sign(299.9) == 'Capricorn'
    
    def test_get_sun_sign_aquarius(self):
        """Test Aquarius sun sign calculation"""
        # Aquarius: 300-330 degrees
        assert get_sun_sign(300.0) == 'Aquarius'
        assert get_sun_sign(315.0) == 'Aquarius'
        assert get_sun_sign(329.9) == 'Aquarius'
    
    def test_get_sun_sign_pisces(self):
        """Test Pisces sun sign calculation"""
        # Pisces: 330-360 degrees
        assert get_sun_sign(330.0) == 'Pisces'
        assert get_sun_sign(345.0) == 'Pisces'
        assert get_sun_sign(359.9) == 'Pisces'
    
    def test_get_sun_sign_wraparound(self):
        """Test sun sign calculation with degree wraparound"""
        # Test values > 360 degrees
        assert get_sun_sign(360.0) == 'Aries'  # 360 % 360 = 0
        assert get_sun_sign(375.0) == 'Aries'  # 375 % 360 = 15
        assert get_sun_sign(390.0) == 'Taurus'  # 390 % 360 = 30
    
    def test_get_sun_sign_negative_degrees(self):
        """Test sun sign calculation with negative degrees"""
        # Python's modulo handles negative numbers correctly
        assert get_sun_sign(-15.0) == 'Pisces'  # -15 % 360 = 345 (11th sign)
        assert get_sun_sign(-30.0) == 'Pisces'  # -30 % 360 = 330 (11th sign - Pisces)


class TestPersonalityEdgeCases:
    """Test edge cases and error handling"""
    
    def test_boundary_degrees(self):
        """Test sun sign calculation at exact boundaries"""
        # Test exact degree boundaries
        assert get_sun_sign(0.0) == 'Aries'
        assert get_sun_sign(30.0) == 'Taurus'
        assert get_sun_sign(60.0) == 'Gemini'
        assert get_sun_sign(90.0) == 'Cancer'
        assert get_sun_sign(120.0) == 'Leo'
        assert get_sun_sign(150.0) == 'Virgo'
        assert get_sun_sign(180.0) == 'Libra'
        assert get_sun_sign(210.0) == 'Scorpio'
        assert get_sun_sign(240.0) == 'Sagittarius'
        assert get_sun_sign(270.0) == 'Capricorn'
        assert get_sun_sign(300.0) == 'Aquarius'
        assert get_sun_sign(330.0) == 'Pisces'
    
    def test_very_large_degrees(self):
        """Test sun sign calculation with very large degree values"""
        # Test with multiple full rotations
        assert get_sun_sign(720.0) == 'Aries'  # 720 % 360 = 0
        assert get_sun_sign(1080.0) == 'Aries'  # 1080 % 360 = 0
        assert get_sun_sign(1095.0) == 'Aries'  # 1095 % 360 = 15
    
    def test_all_zodiac_signs_covered(self):
        """Test that all 12 zodiac signs are returned"""
        expected_signs = [
            "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
            "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
        ]
        
        from typing import Set

        actual_signs: Set[str] = set()
        
        # Test one degree from each sign
        for i in range(12):
            degree = i * 30 + 15  # Middle of each sign
            sign = get_sun_sign(degree)
            actual_signs.add(sign)
        
        assert actual_signs == set(expected_signs)
