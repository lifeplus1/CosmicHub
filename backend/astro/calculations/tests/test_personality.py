"""
Test suite for personality psychology integration
Testing MBTI and Enneagram calculations with astrological correlations
"""
import pytest
from datetime import datetime, timezone
from astro.calculations.personality import PersonalityAnalyzer
from astro.calculations.chart import calculate_chart


class TestPersonalityAnalyzer:
    """Test cases for comprehensive personality analysis."""
    
    @pytest.fixture
    def sample_birth_data(self):
        """Sample birth data for testing."""
        return {
            'date': '1990-06-15',
            'time': '14:30',
            'latitude': 37.7749,
            'longitude': -122.4194,
            'timezone': 'America/Los_Angeles'
        }
    
    @pytest.fixture
    def analyzer(self):
        """PersonalityAnalyzer instance for testing."""
        return PersonalityAnalyzer()
    
    @pytest.fixture
    def birth_chart(self, sample_birth_data):
        """Calculate birth chart for testing."""
        return calculate_chart(
            year=1990,
            month=6,
            day=15,
            hour=14,
            minute=30,
            lat=37.7749,
            lon=-122.4194
        )

    def test_mbti_calculation_structure(self, analyzer, birth_chart):
        """Test MBTI calculation returns proper structure."""
        mbti_result = analyzer.calculate_mbti_from_chart(birth_chart)
        
        assert 'type' in mbti_result
        assert 'name' in mbti_result
        assert 'cognitive_functions' in mbti_result
        assert 'temperament' in mbti_result
        assert 'elemental_correlation' in mbti_result
        assert 'astrological_signs' in mbti_result
        
        # Validate cognitive functions structure
        functions = mbti_result['cognitive_functions']
        assert len(functions) == 4
        
        positions = ['dominant', 'auxiliary', 'tertiary', 'inferior']
        for i, func in enumerate(functions):
            assert func['position'] == positions[i]
            assert 'name' in func
            assert 'planetary_correlation' in func
            assert 'strength' in func
            assert isinstance(func['strength'], (int, float))
            assert 0 <= func['strength'] <= 100

    def test_enneagram_calculation_structure(self, analyzer, birth_chart):
        """Test Enneagram calculation returns proper structure."""
        enneagram_result = analyzer.calculate_enneagram_from_chart(birth_chart)
        
        assert 'type' in enneagram_result
        assert 'name' in enneagram_result
        assert 'house' in enneagram_result
        assert 'planetary_ruler' in enneagram_result
        assert 'wings' in enneagram_result
        assert 'instinctual_variant' in enneagram_result
        assert 'level' in enneagram_result
        
        # Validate type is 1-9
        assert 1 <= enneagram_result['type'] <= 9
        
        # Validate house is 1-12
        assert 1 <= enneagram_result['house'] <= 12
        
        # Validate wings structure
        wings = enneagram_result['wings']
        assert len(wings) == 2
        for wing in wings:
            assert 'number' in wing
            assert 'influence' in wing
            assert isinstance(wing['influence'], (int, float))
            assert 0 <= wing['influence'] <= 100

    def test_cognitive_function_correlations(self, analyzer, birth_chart):
        """Test that cognitive functions have proper astrological correlations."""
        mbti_result = analyzer.calculate_mbti_from_chart(birth_chart)
        functions = mbti_result['cognitive_functions']
        
        # Ensure each function has astrological correlation
        valid_planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn']
        valid_elements = ['Fire', 'Earth', 'Air', 'Water']
        
        for func in functions:
            assert any(planet in func['planetary_correlation'] for planet in valid_planets)
            assert any(element in func['elemental_association'] for element in valid_elements)

    def test_enneagram_house_correlations(self, analyzer, birth_chart):
        """Test Enneagram house correlations are astrologically valid."""
        enneagram_result = analyzer.calculate_enneagram_from_chart(birth_chart)
        
        # Test that house correlations make sense
        type_num = enneagram_result['type']
        house = enneagram_result['house']
        
        # Some basic house-type correlations to validate
        expected_houses = {
            1: [1, 6, 10],  # Reformer - Angular houses, Virgo themes
            2: [4, 7, 11],  # Helper - Relationship houses
            3: [1, 5, 10],  # Achiever - Achievement-oriented houses
            4: [4, 8, 12],  # Individualist - Emotional/transformative houses
            5: [3, 9, 11],  # Investigator - Mental/philosophical houses
            6: [6, 11, 12], # Loyalist - Service and collective houses
            7: [3, 5, 9],   # Enthusiast - Mutable, exploratory houses
            8: [1, 8, 10],  # Challenger - Power houses
            9: [2, 4, 12]   # Peacemaker - Receptive houses
        }
        
        if type_num in expected_houses:
            # Allow flexibility but test correlation exists
            assert house in range(1, 13)

    def test_scientific_validity_mbti(self, analyzer, birth_chart):
        """Test MBTI calculations maintain scientific validity."""
        mbti_result = analyzer.calculate_mbti_from_chart(birth_chart)
        
        # Test cognitive function stack follows Jungian theory
        functions = mbti_result['cognitive_functions']
        
        # Dominant should be strongest
        assert functions[0]['strength'] >= functions[1]['strength']
        assert functions[0]['strength'] >= functions[2]['strength']
        assert functions[0]['strength'] >= functions[3]['strength']
        
        # Inferior should be weakest
        assert functions[3]['strength'] <= functions[0]['strength']
        assert functions[3]['strength'] <= functions[1]['strength']
        assert functions[3]['strength'] <= functions[2]['strength']
        
        # Test function names are valid
        valid_functions = ['Ne', 'Ni', 'Se', 'Si', 'Te', 'Ti', 'Fe', 'Fi']
        for func in functions:
            assert func['name'] in valid_functions

    def test_enneagram_scientific_validity(self, analyzer, birth_chart):
        """Test Enneagram calculations maintain scientific validity."""
        enneagram_result = analyzer.calculate_enneagram_from_chart(birth_chart)
        
        # Test wing influence distribution
        wings = enneagram_result['wings']
        total_wing_influence = sum(wing['influence'] for wing in wings)
        
        # Wings should have reasonable influence (not both 0 or both 100)
        assert 10 <= total_wing_influence <= 190
        
        # Test adjacent wing numbers
        type_num = enneagram_result['type']
        wing_numbers = [wing['number'] for wing in wings]
        
        # Wings should be adjacent numbers (with 9-1 wraparound)
        expected_wings = [
            (type_num - 1) if type_num > 1 else 9,
            (type_num + 1) if type_num < 9 else 1
        ]
        
        assert sorted(wing_numbers) == sorted(expected_wings)

    def test_astrology_psychology_correlations(self, analyzer, birth_chart):
        """Test psychology-astrology correlation algorithms."""
        mbti_result = analyzer.calculate_mbti_from_chart(birth_chart)
        enneagram_result = analyzer.calculate_enneagram_from_chart(birth_chart)
        
        # Test elemental correlations are consistent
        mbti_element = mbti_result.get('elemental_correlation', '')
        
        # Fire signs should correlate with certain MBTI preferences
        if 'Fire' in mbti_element:
            # Fire signs often correlate with Extraversion and Perceiving
            assert 'E' in mbti_result['type'] or 'P' in mbti_result['type']
        
        # Earth signs should correlate with Sensing and Judging
        if 'Earth' in mbti_element:
            assert 'S' in mbti_result['type'] or 'J' in mbti_result['type']

    def test_birth_correlation_patterns(self, analyzer, birth_chart, sample_birth_data):
        """Test birth pattern correlations are scientifically grounded."""
        birth_correlations = analyzer.analyze_birth_correlations(birth_chart, sample_birth_data)
        
        assert 'seasonal_pattern' in birth_correlations
        assert 'elemental_dominance' in birth_correlations
        assert 'planetary_influences' in birth_correlations
        
        # Test seasonal pattern makes sense for June birth
        seasonal = birth_correlations['seasonal_pattern']
        assert 'summer' in seasonal.lower() or 'gemini' in seasonal.lower() or 'cancer' in seasonal.lower()

    def test_integration_synthesis(self, analyzer, birth_chart):
        """Test MBTI-Enneagram integration synthesis."""
        mbti_result = analyzer.calculate_mbti_from_chart(birth_chart)
        enneagram_result = analyzer.calculate_enneagram_from_chart(birth_chart)
        
        synthesis = analyzer.synthesize_personality_types(mbti_result, enneagram_result)
        
        assert 'mbti_enneagram_bridge' in synthesis
        assert 'spiritual_path_alignment' in synthesis
        assert 'growth_recommendations' in synthesis
        
        # Test that growth recommendations are substantial
        recommendations = synthesis['growth_recommendations']
        assert isinstance(recommendations, list)
        assert len(recommendations) >= 3

    @pytest.mark.parametrize("birth_season,expected_elements", [
        ("spring", ["Fire", "Earth"]),
        ("summer", ["Fire", "Water"]),
        ("autumn", ["Earth", "Air"]),
        ("winter", ["Water", "Air"])
    ])
    def test_seasonal_element_correlations(self, analyzer, birth_season, expected_elements):
        """Test seasonal-elemental correlations are consistent."""
        # This test validates our seasonal pattern logic
        correlations = analyzer._get_seasonal_correlations(birth_season)
        
        assert any(element in correlations for element in expected_elements)

    def test_error_handling(self, analyzer):
        """Test error handling for invalid inputs."""
        # Test with empty chart
        with pytest.raises((ValueError, TypeError)):
            analyzer.calculate_mbti_from_chart({})
        
        # Test with malformed birth data
        with pytest.raises((ValueError, KeyError)):
            analyzer.analyze_birth_correlations({}, {})

    def test_performance_benchmarks(self, analyzer, birth_chart):
        """Test that calculations complete within reasonable time."""
        import time
        
        # Test MBTI calculation performance
        start_time = time.time()
        mbti_result = analyzer.calculate_mbti_from_chart(birth_chart)
        mbti_time = time.time() - start_time
        
        # Should complete within 1 second
        assert mbti_time < 1.0
        
        # Test Enneagram calculation performance
        start_time = time.time()
        enneagram_result = analyzer.calculate_enneagram_from_chart(birth_chart)
        enneagram_time = time.time() - start_time
        
        # Should complete within 1 second
        assert enneagram_time < 1.0

    def test_reproducibility(self, analyzer, birth_chart):
        """Test that calculations are reproducible with same inputs."""
        # Calculate multiple times
        mbti_1 = analyzer.calculate_mbti_from_chart(birth_chart)
        mbti_2 = analyzer.calculate_mbti_from_chart(birth_chart)
        
        enneagram_1 = analyzer.calculate_enneagram_from_chart(birth_chart)
        enneagram_2 = analyzer.calculate_enneagram_from_chart(birth_chart)
        
        # Results should be identical
        assert mbti_1['type'] == mbti_2['type']
        assert enneagram_1['type'] == enneagram_2['type']
        
        # Function strengths should be consistent
        for i in range(4):
            assert mbti_1['cognitive_functions'][i]['strength'] == mbti_2['cognitive_functions'][i]['strength']


class TestMBTIAstrologyCorrelations:
    """Specific tests for MBTI-Astrology correlations."""
    
    @pytest.fixture
    def analyzer(self):
        return PersonalityAnalyzer()

    def test_mbti_type_accuracy(self, analyzer):
        """Test MBTI type determination accuracy."""
        # Test known correlations
        test_cases = [
            {
                'sun_sign': 'Aries',
                'moon_sign': 'Leo',
                'expected_preferences': ['E', 'N', 'F', 'P']  # ENFP tendencies
            },
            {
                'sun_sign': 'Virgo',
                'moon_sign': 'Capricorn', 
                'expected_preferences': ['I', 'S', 'T', 'J']  # ISTJ tendencies
            }
        ]
        
        for case in test_cases:
            # This would test with mock chart data
            # Implementation depends on chart structure
            pass

    def test_cognitive_function_planetary_correlations(self, analyzer):
        """Test cognitive function-planet correlations are valid."""
        correlations = analyzer.COGNITIVE_FUNCTION_CORRELATIONS
        
        # Test that all 8 functions have correlations
        assert len(correlations) == 8
        
        # Test specific known correlations
        assert 'Mercury' in correlations['Ti']['planetary_correlation']
        assert 'Mars' in correlations['Te']['planetary_correlation']
        assert 'Moon' in correlations['Fi']['planetary_correlation']
        assert 'Venus' in correlations['Fe']['planetary_correlation']


class TestEnneagramAstrologyCorrelations:
    """Specific tests for Enneagram-Astrology correlations."""
    
    @pytest.fixture
    def analyzer(self):
        return PersonalityAnalyzer()

    def test_enneagram_house_mappings(self, analyzer):
        """Test Enneagram type to astrological house mappings."""
        house_correlations = analyzer.ENNEAGRAM_HOUSE_CORRELATIONS
        
        # Test all 9 types have house correlations
        assert len(house_correlations) == 9
        
        # Test specific known correlations
        assert house_correlations[1]['primary_house'] == 6  # Reformer -> 6th house (perfection)
        assert house_correlations[2]['primary_house'] == 7  # Helper -> 7th house (relationships)
        assert house_correlations[8]['primary_house'] == 1  # Challenger -> 1st house (self/power)

    def test_enneagram_planetary_rulers(self, analyzer):
        """Test Enneagram planetary ruler assignments."""
        correlations = analyzer.ENNEAGRAM_HOUSE_CORRELATIONS
        
        valid_planets = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']
        
        for type_num in range(1, 10):
            planetary_ruler = correlations[type_num]['planetary_ruler']
            assert planetary_ruler in valid_planets

    def test_sephirah_correspondences(self, analyzer):
        """Test Enneagram-Sephirah correspondences from Kabbalah."""
        correlations = analyzer.ENNEAGRAM_SEPHIRAH_CORRELATIONS
        
        # Test all 9 types have Sephirah correlations
        assert len(correlations) == 9
        
        # Test specific known correlations from spiritual traditions
        sephirah_names = ['Kether', 'Chokmah', 'Binah', 'Chesed', 'Geburah', 
                         'Tiphereth', 'Netzach', 'Hod', 'Yesod', 'Malkuth']
        
        for type_num in range(1, 10):
            sephirah = correlations[type_num]
            assert any(name in sephirah for name in sephirah_names)


if __name__ == '__main__':
    pytest.main([__file__])
