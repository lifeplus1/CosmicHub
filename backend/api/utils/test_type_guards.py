"""
Tests for the type_guards module
"""

import json
import unittest

from .type_guards import (
    get_astrology_data_type,
    is_angle,
    is_aspect,
    is_asteroid,
    is_astrology_chart,
    is_astrology_data,
    is_house,
    is_numerology_data,
    is_planet,
    is_user_profile,
    safe_parse_astrology_chart,
    validate_astrology_chart,
)


class TestTypeGuards(unittest.TestCase):
    """Test cases for the type_guards module"""

    def setUp(self):
        """Set up test fixtures"""
        self.valid_planet = {
            "name": "Sun",
            "sign": "Leo",
            "degree": 15.25,
            "position": 135.25,
            "house": "5",
            "retrograde": False,
            "aspects": [],
        }

        self.valid_house = {
            "house": 1,
            "number": 1,
            "sign": "Aries",
            "degree": 0,
            "cusp": 0,
            "ruler": "Mars",
        }

        self.valid_aspect = {
            "planet1": "Sun",
            "planet2": "Moon",
            "type": "Trine",
            "orb": 5.0,
            "applying": "true",
        }

        self.valid_asteroid = {
            "name": "Ceres",
            "sign": "Virgo",
            "degree": 10.0,
            "house": "6",
        }

        self.valid_angle = {
            "name": "Ascendant",
            "sign": "Aries",
            "degree": 0,
            "position": 0,
        }

        # Create a valid chart with all required elements
        self.valid_chart = {
            "planets": [self.valid_planet],
            "houses": [self.valid_house] * 12,  # 12 houses
            "aspects": [self.valid_aspect],
            "asteroids": [self.valid_asteroid],
            "angles": [self.valid_angle],
        }

        self.valid_profile = {
            "userId": "user123",
            "birthData": {
                "date": "1990-01-01",
                "time": "12:00",
                "location": "New York, NY",
            },
        }

        self.valid_numerology = {
            "lifePath": 7,
            "destiny": 9,
            "personalYear": 3,
        }

    def test_is_planet(self):
        """Test the is_planet function"""
        self.assertTrue(is_planet(self.valid_planet))
        self.assertFalse(is_planet({}))
        self.assertFalse(is_planet(None))
        self.assertFalse(is_planet("not a planet"))

        # Test with missing required field
        invalid_planet = self.valid_planet.copy()
        del invalid_planet["name"]
        self.assertFalse(is_planet(invalid_planet))

        # Test with wrong type
        invalid_planet = self.valid_planet.copy()
        invalid_planet["degree"] = "15.25"  # Should be a number
        self.assertFalse(is_planet(invalid_planet))

    def test_is_house(self):
        """Test the is_house function"""
        self.assertTrue(is_house(self.valid_house))
        self.assertFalse(is_house({}))

        # Test with missing required field
        invalid_house = self.valid_house.copy()
        del invalid_house["sign"]
        self.assertFalse(is_house(invalid_house))

    def test_is_aspect(self):
        """Test the is_aspect function"""
        self.assertTrue(is_aspect(self.valid_aspect))
        self.assertFalse(is_aspect({}))

        # Test with missing required field
        invalid_aspect = self.valid_aspect.copy()
        del invalid_aspect["orb"]
        self.assertFalse(is_aspect(invalid_aspect))

    def test_is_asteroid(self):
        """Test the is_asteroid function"""
        self.assertTrue(is_asteroid(self.valid_asteroid))
        self.assertFalse(is_asteroid({}))

        # Test with missing required field
        invalid_asteroid = self.valid_asteroid.copy()
        del invalid_asteroid["house"]
        self.assertFalse(is_asteroid(invalid_asteroid))

    def test_is_angle(self):
        """Test the is_angle function"""
        self.assertTrue(is_angle(self.valid_angle))
        self.assertFalse(is_angle({}))

        # Test with missing required field
        invalid_angle = self.valid_angle.copy()
        del invalid_angle["position"]
        self.assertFalse(is_angle(invalid_angle))

    def test_is_astrology_chart(self):
        """Test the is_astrology_chart function"""
        self.assertTrue(is_astrology_chart(self.valid_chart))
        self.assertFalse(is_astrology_chart({}))

        # Test with missing required field
        invalid_chart = self.valid_chart.copy()
        del invalid_chart["planets"]
        self.assertFalse(is_astrology_chart(invalid_chart))

        # Test with invalid nested data
        invalid_chart = self.valid_chart.copy()
        invalid_chart["planets"] = ["not a planet"]
        self.assertFalse(is_astrology_chart(invalid_chart))

    def test_is_user_profile(self):
        """Test the is_user_profile function"""
        self.assertTrue(is_user_profile(self.valid_profile))
        self.assertFalse(is_user_profile({}))

        # Test with missing required field
        invalid_profile = self.valid_profile.copy()
        del invalid_profile["userId"]
        self.assertFalse(is_user_profile(invalid_profile))

        # Test with invalid birthData
        invalid_profile = self.valid_profile.copy()
        invalid_profile["birthData"] = "not an object"
        self.assertFalse(is_user_profile(invalid_profile))

    def test_is_numerology_data(self):
        """Test the is_numerology_data function"""
        self.assertTrue(is_numerology_data(self.valid_numerology))
        self.assertFalse(is_numerology_data({}))

        # Test with missing required field
        invalid_numerology = self.valid_numerology.copy()
        del invalid_numerology["lifePath"]
        self.assertFalse(is_numerology_data(invalid_numerology))

        # Test with wrong type
        invalid_numerology = self.valid_numerology.copy()
        invalid_numerology["destiny"] = "9"  # Should be a number
        self.assertFalse(is_numerology_data(invalid_numerology))

    def test_get_astrology_data_type(self):
        """Test the get_astrology_data_type function"""
        self.assertEqual(
            get_astrology_data_type(self.valid_chart), "AstrologyChart"
        )
        self.assertEqual(
            get_astrology_data_type(self.valid_profile), "UserProfile"
        )
        self.assertEqual(
            get_astrology_data_type(self.valid_numerology), "NumerologyData"
        )
        self.assertEqual(get_astrology_data_type({}), "Unknown")
        self.assertEqual(get_astrology_data_type(None), "Unknown")

    def test_validate_astrology_chart(self):
        """Test the validate_astrology_chart function"""
        # Valid chart should return empty list
        self.assertEqual(validate_astrology_chart(self.valid_chart), [])

        # Missing planets should return error
        invalid_chart = self.valid_chart.copy()
        del invalid_chart["planets"]
        errors = validate_astrology_chart(invalid_chart)
        self.assertTrue(any("planets" in error for error in errors))

        # Wrong number of houses should return error
        invalid_chart = self.valid_chart.copy()
        invalid_chart["houses"] = [self.valid_house] * 10  # Only 10 houses
        errors = validate_astrology_chart(invalid_chart)
        self.assertTrue(any("12 houses" in error for error in errors))

        # Invalid planet should return error
        invalid_chart = self.valid_chart.copy()
        invalid_chart["planets"] = [{"name": "Sun"}]  # Missing required fields
        errors = validate_astrology_chart(invalid_chart)
        self.assertTrue(any("Invalid planet" in error for error in errors))

    def test_safe_parse_astrology_chart(self):
        """Test the safe_parse_astrology_chart function"""
        # Valid JSON should parse successfully
        json_string = json.dumps(self.valid_chart)
        result = safe_parse_astrology_chart(json_string)
        self.assertTrue(result.is_valid)
        self.assertEqual(result.errors, [])
        self.assertIsNotNone(result.chart)

        # Invalid JSON should return error
        result = safe_parse_astrology_chart("not valid json")
        self.assertFalse(result.is_valid)
        self.assertIsNotNone(result.errors)
        self.assertIsNone(result.chart)

        # Valid JSON but invalid chart should return validation errors
        invalid_chart = self.valid_chart.copy()
        del invalid_chart["planets"]
        json_string = json.dumps(invalid_chart)
        result = safe_parse_astrology_chart(json_string)
        self.assertFalse(result.is_valid)
        self.assertTrue(any("planets" in error for error in result.errors))
        self.assertIsNone(result.chart)

    def test_is_astrology_data(self):
        """Test the is_astrology_data function"""
        self.assertTrue(is_astrology_data(self.valid_chart))
        self.assertTrue(is_astrology_data(self.valid_profile))
        self.assertTrue(is_astrology_data(self.valid_numerology))
        self.assertFalse(is_astrology_data({}))
        self.assertFalse(is_astrology_data(None))
        self.assertFalse(is_astrology_data("not astrology data"))


if __name__ == "__main__":
    unittest.main()
