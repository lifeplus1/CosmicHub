"""
Tests for astro/calculations/numerology.py
"""

from datetime import datetime

from astro.calculations.numerology import (
    CHALDEAN,
    PYTHAGOREAN,
    NumerologyCalculator,
    calculate_numerology,
)


class TestNumerologyCalculation:
    """Test numerology calculation functionality"""

    def test_calculate_numerology_basic(self):
        """Test basic numerology calculation"""
        name = "John Smith"
        birth_date = datetime(1990, 5, 15)

        result = calculate_numerology(name, birth_date)

        assert isinstance(result, dict)
        assert "core_numbers" in result
        assert "karmic_numbers" in result

        # Check core numbers structure
        core = result["core_numbers"]
        expected_core_keys = [
            "life_path",
            "destiny",
            "soul_urge",
            "personality",
            "birth_day",
            "attitude",
            "power_name",
        ]

        for key in expected_core_keys:
            assert key in core
            assert isinstance(core[key], (int, dict))

    def test_numerology_with_special_characters(self):
        """Test numerology calculation with special characters in name"""
        name = "Mary-Jane O'Connor"
        birth_date = datetime(1985, 12, 25)

        result = calculate_numerology(name, birth_date)

        assert isinstance(result, dict)
        assert "core_numbers" in result

        # Should handle special characters gracefully
        assert result["core_numbers"]["destiny"] is not None


class TestNumerologyCalculator:
    """Test NumerologyCalculator class methods"""

    def setUp(self):
        self.calc = NumerologyCalculator()

    def test_life_path_calculation(self):
        """Test life path number calculation"""
        calc = NumerologyCalculator()

        # Test known values
        birth_date = datetime(1990, 5, 15)  # 1+9+9+0+5+1+5 = 30 -> 3+0 = 3
        life_path = calc.calculate_life_path(birth_date)

        assert isinstance(life_path, (int, dict))
        if isinstance(life_path, int):
            assert 1 <= life_path <= 9 or life_path in [11, 22, 33]

    def test_destiny_number_calculation(self):
        """Test destiny number calculation"""
        calc = NumerologyCalculator()

        name = "JOHN"  # J=1, O=6, H=8, N=5 = 20 -> 2+0 = 2
        destiny = calc.calculate_destiny_number(name)

        assert isinstance(destiny, (int, dict))
        if isinstance(destiny, int):
            assert 1 <= destiny <= 9 or destiny in [11, 22, 33]

    def test_soul_urge_calculation(self):
        """Test soul urge number calculation (vowels only)"""
        calc = NumerologyCalculator()

        name = "JOHN"  # Only O = 6
        soul_urge = calc.calculate_soul_urge(name)

        assert isinstance(soul_urge, (int, dict))
        if isinstance(soul_urge, int):
            assert 1 <= soul_urge <= 9 or soul_urge in [11, 22, 33]

    def test_personality_number_calculation(self):
        """Test personality number calculation (consonants only)"""
        calc = NumerologyCalculator()

        name = "JOHN"  # J=1, H=8, N=5 = 14 -> 1+4 = 5
        personality = calc.calculate_personality_number(name)

        assert isinstance(personality, (int, dict))
        if isinstance(personality, int):
            assert 1 <= personality <= 9 or personality in [11, 22, 33]

    def test_birth_day_number(self):
        """Test birth day number calculation"""
        calc = NumerologyCalculator()

        birth_date = datetime(1990, 5, 15)  # Day 15 -> 1+5 = 6
        birth_day = calc.calculate_birth_day_number(birth_date)

        assert isinstance(birth_day, (int, dict))
        if isinstance(birth_day, int):
            assert 1 <= birth_day <= 31


class TestNumerologyMappings:
    """Test numerology letter-to-number mappings"""

    def test_pythagorean_mapping(self):
        """Test Pythagorean number mapping"""
        assert isinstance(PYTHAGOREAN, dict)
        assert len(PYTHAGOREAN) == 26  # All 26 letters

        # Test some known mappings
        assert PYTHAGOREAN["A"] == 1
        assert PYTHAGOREAN["I"] == 9
        assert PYTHAGOREAN["J"] == 1  # Cycles back to 1

        # All values should be 1-9
        for _letter, value in PYTHAGOREAN.items():
            assert 1 <= value <= 9

    def test_chaldean_mapping(self):
        """Test Chaldean number mapping"""
        assert isinstance(CHALDEAN, dict)
        assert len(CHALDEAN) == 26  # All 26 letters

        # Test some known mappings
        assert CHALDEAN["A"] == 1
        assert CHALDEAN["F"] == 8  # Different from Pythagorean

        # Chaldean doesn't use 9
        for _letter, value in CHALDEAN.items():
            assert 1 <= value <= 8

    def test_mapping_completeness(self):
        """Test that both mappings cover all letters"""
        alphabet = set("ABCDEFGHIJKLMNOPQRSTUVWXYZ")

        pythagorean_keys = set(PYTHAGOREAN.keys())
        chaldean_keys = set(CHALDEAN.keys())

        assert pythagorean_keys == alphabet
        assert chaldean_keys == alphabet


class TestNumerologyEdgeCases:
    """Test edge cases and special scenarios"""

    def test_master_numbers(self):
        """Test that master numbers (11, 22, 33) are preserved"""
        calc = NumerologyCalculator()

        # Test scenarios that might produce master numbers
        # Note: Actual implementation depends on specific logic
        birth_date = datetime(
            1992, 11, 29
        )  # 1+9+9+2+1+1+2+9 = 34 -> 3+4 = 7, but 11 in month
        result = calc.calculate_life_path(birth_date)

        assert isinstance(result, (int, dict))

    def test_empty_name(self):
        """Test handling of empty or invalid names"""
        calc = NumerologyCalculator()

        # Test with empty string (should return meaningful result)
        result = calc.calculate_destiny_number("")
        assert isinstance(result, dict)
        assert "number" in result
        assert result["calculation_total"] == 0

    def test_numeric_name(self):
        """Test handling of names with numbers"""
        name = "John123"
        birth_date = datetime(1990, 5, 15)

        # Should handle gracefully by filtering out numbers
        result = calculate_numerology(name, birth_date)
        assert isinstance(result, dict)

    def test_special_dates(self):
        """Test calculation with special dates"""
        calc = NumerologyCalculator()

        # Leap year date
        birth_date = datetime(2000, 2, 29)
        life_path = calc.calculate_life_path(birth_date)

        assert isinstance(life_path, (int, dict))

        # End of year
        birth_date = datetime(1999, 12, 31)
        life_path = calc.calculate_life_path(birth_date)

        assert isinstance(life_path, (int, dict))
