"""
Unit tests for personality psychology integration
Tests the core psychology calculation functions
"""
import pytest
from astro.calculations.personality import PersonalityAnalyzer


class TestPersonalityAnalyzerBasics:
    """Test basic functionality of PersonalityAnalyzer."""
    
    @pytest.fixture
    def analyzer(self):
        """PersonalityAnalyzer instance for testing."""
        return PersonalityAnalyzer()

    def test_analyzer_initialization(self, analyzer):
        """Test that PersonalityAnalyzer initializes properly."""
        assert analyzer is not None
        assert hasattr(analyzer, 'MBTI_TYPES')
        assert hasattr(analyzer, 'ENNEAGRAM_TYPES')
        assert hasattr(analyzer, 'COGNITIVE_FUNCTION_CORRELATIONS')
        assert hasattr(analyzer, 'ENNEAGRAM_HOUSE_CORRELATIONS')

    def test_mbti_types_data_structure(self, analyzer):
        """Test MBTI types data structure is complete."""
        mbti_types = analyzer.MBTI_TYPES
        
        # Test all 16 types exist
        expected_types = [
            'INTJ', 'INTP', 'ENTJ', 'ENTP',
            'INFJ', 'INFP', 'ENFJ', 'ENFP', 
            'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
            'ISTP', 'ISFP', 'ESTP', 'ESFP'
        ]
        
        assert len(mbti_types) == 16
        for mbti_type in expected_types:
            assert mbti_type in mbti_types
            type_data = mbti_types[mbti_type]
            assert 'name' in type_data
            assert 'temperament' in type_data
            assert 'cognitive_functions' in type_data
            assert 'elemental_correlation' in type_data

    def test_enneagram_types_data_structure(self, analyzer):
        """Test Enneagram types data structure is complete."""
        enneagram_types = analyzer.ENNEAGRAM_TYPES
        
        # Test all 9 types exist
        assert len(enneagram_types) == 9
        for type_num in range(1, 10):
            assert type_num in enneagram_types
            type_data = enneagram_types[type_num]
            assert 'name' in type_data
            assert 'description' in type_data
            assert 'core_motivation' in type_data
            assert 'basic_fear' in type_data

    def test_cognitive_function_correlations(self, analyzer):
        """Test cognitive function astrological correlations."""
        correlations = analyzer.COGNITIVE_FUNCTION_CORRELATIONS
        
        # Test all 8 cognitive functions
        expected_functions = ['Ne', 'Ni', 'Se', 'Si', 'Te', 'Ti', 'Fe', 'Fi']
        
        assert len(correlations) == 8
        for func in expected_functions:
            assert func in correlations
            func_data = correlations[func]
            assert 'planetary_correlation' in func_data
            assert 'elemental_association' in func_data
            assert 'description' in func_data

    def test_enneagram_house_correlations(self, analyzer):
        """Test Enneagram-astrological house correlations."""
        correlations = analyzer.ENNEAGRAM_HOUSE_CORRELATIONS
        
        # Test all 9 types have house correlations
        assert len(correlations) == 9
        for type_num in range(1, 10):
            assert type_num in correlations
            house_data = correlations[type_num]
            assert 'primary_house' in house_data
            assert 'planetary_ruler' in house_data
            assert 'element' in house_data
            
            # Validate house is 1-12
            assert 1 <= house_data['primary_house'] <= 12

    def test_get_mbti_from_preferences(self, analyzer):
        """Test MBTI type determination from preferences."""
        # Test with clear preferences
        preferences = {'E': 75, 'N': 80, 'F': 85, 'P': 70}
        result = analyzer._get_mbti_from_preferences(preferences)
        
        assert result == 'ENFP'
        
        # Test with opposite preferences
        preferences = {'I': 75, 'S': 80, 'T': 85, 'J': 70}
        result = analyzer._get_mbti_from_preferences(preferences)
        
        assert result == 'ISTJ'

    def test_calculate_cognitive_function_strength(self, analyzer):
        """Test cognitive function strength calculations."""
        # Mock some astrological data
        mock_planetary_strengths = {
            'Mercury': 75,
            'Mars': 60,
            'Moon': 80,
            'Venus': 70
        }
        
        # Test Ti (Mercury correlation)
        strength = analyzer._calculate_cognitive_function_strength('Ti', mock_planetary_strengths)
        assert isinstance(strength, (int, float))
        assert 0 <= strength <= 100

    def test_determine_enneagram_from_houses(self, analyzer):
        """Test Enneagram type determination from house emphases."""
        # Mock house emphases (stronger houses)
        house_strengths = {i: 50 for i in range(1, 13)}
        house_strengths[1] = 85  # Strong 1st house
        house_strengths[8] = 80  # Strong 8th house
        
        enneagram_type = analyzer._determine_enneagram_from_houses(house_strengths)
        
        assert isinstance(enneagram_type, int)
        assert 1 <= enneagram_type <= 9

    def test_calculate_wing_influences(self, analyzer):
        """Test wing influence calculations."""
        # Test for Type 1 (should have wings 9 and 2)
        wings = analyzer._calculate_wing_influences(1, {'Venus': 70, 'Mars': 60})
        
        assert len(wings) == 2
        wing_numbers = [wing['number'] for wing in wings]
        assert 9 in wing_numbers  # Type 1's wings
        assert 2 in wing_numbers
        
        for wing in wings:
            assert 'influence' in wing
            assert 0 <= wing['influence'] <= 100

    def test_synthesize_types_basic(self, analyzer):
        """Test basic type synthesis functionality."""
        mock_mbti = {
            'type': 'ENFP',
            'cognitive_functions': [
                {'name': 'Ne', 'position': 'dominant'},
                {'name': 'Fi', 'position': 'auxiliary'}
            ]
        }
        
        mock_enneagram = {
            'type': 7,
            'name': 'Enthusiast',
            'wings': [{'number': 6}, {'number': 8}]
        }
        
        synthesis = analyzer.synthesize_personality_types(mock_mbti, mock_enneagram)
        
        assert 'mbti_enneagram_bridge' in synthesis
        assert 'spiritual_path_alignment' in synthesis
        assert 'growth_recommendations' in synthesis
        
        recommendations = synthesis['growth_recommendations']
        assert isinstance(recommendations, list)
        assert len(recommendations) > 0

    def test_seasonal_correlations(self, analyzer):
        """Test seasonal pattern correlations."""
        # Test different seasons
        spring_correlation = analyzer._get_seasonal_correlations('spring')
        assert 'growth' in spring_correlation.lower() or 'fire' in spring_correlation.lower()
        
        winter_correlation = analyzer._get_seasonal_correlations('winter') 
        assert 'water' in winter_correlation.lower() or 'introspection' in winter_correlation.lower()

    def test_validation_functions(self, analyzer):
        """Test input validation functions."""
        # Test valid MBTI type
        assert analyzer._is_valid_mbti_type('ENFP') is True
        assert analyzer._is_valid_mbti_type('INVALID') is False
        
        # Test valid Enneagram type
        assert analyzer._is_valid_enneagram_type(5) is True
        assert analyzer._is_valid_enneagram_type(10) is False
        assert analyzer._is_valid_enneagram_type(0) is False

    def test_error_handling(self, analyzer):
        """Test error handling for edge cases."""
        # Test with None inputs
        with pytest.raises((ValueError, TypeError)):
            analyzer._get_mbti_from_preferences(None)
        
        # Test with invalid preferences
        with pytest.raises((ValueError, KeyError)):
            analyzer._get_mbti_from_preferences({'X': 50, 'Y': 60})

    def test_cognitive_function_stacks(self, analyzer):
        """Test cognitive function stack generation."""
        for mbti_type in analyzer.MBTI_TYPES:
            functions = analyzer.MBTI_TYPES[mbti_type]['cognitive_functions']
            
            # Should have 4 functions
            assert len(functions) == 4
            
            # Check positions
            positions = [func['position'] for func in functions]
            expected_positions = ['dominant', 'auxiliary', 'tertiary', 'inferior']
            assert positions == expected_positions
            
            # Check function names are valid
            valid_functions = ['Ne', 'Ni', 'Se', 'Si', 'Te', 'Ti', 'Fe', 'Fi']
            for func in functions:
                assert func['name'] in valid_functions

    def test_enneagram_wing_logic(self, analyzer):
        """Test Enneagram wing adjacency logic."""
        for type_num in range(1, 10):
            expected_wings = analyzer._get_adjacent_types(type_num)
            
            # Should have exactly 2 wings
            assert len(expected_wings) == 2
            
            # Test specific cases
            if type_num == 1:
                assert 9 in expected_wings and 2 in expected_wings
            elif type_num == 9:
                assert 8 in expected_wings and 1 in expected_wings
            else:
                assert (type_num - 1) in expected_wings
                assert (type_num + 1) in expected_wings


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
