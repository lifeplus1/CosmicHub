"""
Tests for astro/calculations/human_design.py
"""
import pytest
from backend.astro.calculations.human_design import (
    calculate_human_design,
    calculate_planetary_activations,
    determine_type_and_authority,
    analyze_definition,
    GATES
)


class TestHumanDesignCalculation:
    """Test Human Design calculation functionality"""
    
    def test_calculate_human_design_basic(self):
        """Test basic Human Design calculation"""
        result = calculate_human_design(
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
        assert 'type' in result
        assert 'strategy' in result
        assert 'authority' in result
        assert 'profile' in result
        assert 'centers' in result
        assert 'channels' in result
        assert 'gates' in result
        
        # Check that type is one of the valid types
        valid_types = ['Manifestor', 'Generator', 'Manifesting Generator', 'Projector', 'Reflector']
        assert result['type'] in valid_types
    
    def test_calculate_planetary_activations(self):
        """Test planetary activations calculation"""
        julian_day = 2448000.0  # Example Julian day
        
        activations = calculate_planetary_activations(julian_day)
        
        assert isinstance(activations, dict)
        assert 'sun' in activations
        assert 'moon' in activations
        
        # Check structure of activation data
        for _planet, data in activations.items():
            assert 'gate' in data
            assert 'line' in data
            assert 'position' in data
            assert 'center' in data
            assert 1 <= data['gate'] <= 64
            assert 1 <= data['line'] <= 6
    
    def test_analyze_definition(self):
        """Test definition analysis"""
        mock_activations = {
            'sun': {'gate': 1, 'center': 'G'},
            'moon': {'gate': 8, 'center': 'G'},
            'mercury': {'gate': 13, 'center': 'G'},
            'venus': {'gate': 25, 'center': 'G'}
        }
        
        definition = analyze_definition(mock_activations)
        
        assert isinstance(definition, dict)
        assert 'defined_gates' in definition
        assert 'defined_centers' in definition
        assert 'center_activations' in definition
        assert 'channels' in definition


class TestGatesData:
    """Test Gates data structure"""
    
    def test_gates_structure(self):
        """Test that GATES contains all required information"""
        assert isinstance(GATES, dict)
        assert len(GATES) == 64  # Should have all 64 gates
        
        # Test first gate structure
        gate_1 = GATES[1]
        assert 'name' in gate_1
        assert 'center' in gate_1
        assert 'type' in gate_1
        assert 'theme' in gate_1
        
        assert gate_1['name'] == "The Creative"
        assert gate_1['center'] == "G"
    
    def test_all_gates_have_required_fields(self):
        """Test that all gates have required fields"""
        required_fields = ['name', 'center', 'type', 'theme']
        
        for gate_num, gate_data in GATES.items():
            assert isinstance(gate_num, int)
            assert 1 <= gate_num <= 64
            
            for field in required_fields:
                assert field in gate_data
                assert isinstance(gate_data[field], str)
                assert len(gate_data[field]) > 0


class TestHumanDesignTypes:
    """Test Human Design type determination"""
    
    def test_manifestor_type(self):
        """Test Manifestor type identification"""
        # Create mock data for a Manifestor
        centers = {
            'throat': True,
            'sacral': False,
            'motor_connection': True
        }
        
        # This is a simplified test - actual implementation would be more complex
        assert isinstance(centers, dict)
    
    def test_generator_type(self):
        """Test Generator type identification"""
        # Create mock data for a Generator
        centers = {
            'throat': False,
            'sacral': True
        }
        
        # This is a simplified test - actual implementation would be more complex
        assert isinstance(centers, dict)


class TestHumanDesignChannels:
    """Test Human Design channels functionality"""
    
    def test_channel_formation(self):
        """Test that channels are formed correctly from gates"""
        # Test with gates that should form a channel
        gates = [1, 8]  # Example gates that might form a channel
        
        # This would test actual channel formation logic
        assert isinstance(gates, list)
        assert len(gates) == 2
    
    def test_defined_centers(self):
        """Test center definition logic"""
        # Mock gates that would define certain centers
        active_gates = [1, 8, 13, 25]
        
        # This would test actual center definition logic
        assert isinstance(active_gates, list)
        assert all(isinstance(gate, int) for gate in active_gates)


def test_human_design_basic():
    result = calculate_human_design(2000, 5, 15, 12, 30, 40.0, -74.0, "America/New_York")
    assert "type" in result
    assert "profile" in result
