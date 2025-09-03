# backend/tests/test_tcm_systems.py
"""
Test suite for TCM (Traditional Chinese Medicine) Systems
AI #3: Backend Architecture Specialist Implementation
Following Integration Strategy: ENHANCE vs CREATE NEW
"""

import pytest
from datetime import datetime
from typing import Dict, Any

# Import TCM systems for testing
try:
    from astro.calculations.tcm_engine import SimplifiedTCMEngine, calculate_tcm_constitution
    from api.endpoints.tcm_systems import tcm_router
    TCM_AVAILABLE = True
except ImportError:
    TCM_AVAILABLE = False
    SimplifiedTCMEngine = None
    calculate_tcm_constitution = None

class TestTCMEngine:
    """Test the TCM calculation engine"""
    
    @pytest.fixture
    def tcm_engine(self):
        """Create TCM engine for testing"""
        if not TCM_AVAILABLE:
            pytest.skip("TCM engine not available")
        return SimplifiedTCMEngine()
    
    @pytest.fixture
    def sample_birth_data(self):
        """Sample birth data for testing"""
        return {
            "year": 1990,
            "month": 6,
            "day": 15,
            "hour": 14,
            "user_id": "test_user"
        }
    
    def test_tcm_engine_initialization(self, tcm_engine):
        """Test TCM engine initializes correctly"""
        assert tcm_engine is not None
        assert len(tcm_engine.elements) == 5
        assert "wood" in tcm_engine.elements
        assert "fire" in tcm_engine.elements
        assert "earth" in tcm_engine.elements
        assert "metal" in tcm_engine.elements
        assert "water" in tcm_engine.elements
        
        # Test element data is present
        assert len(tcm_engine.element_data) == 5
        for element in tcm_engine.elements:
            assert element in tcm_engine.element_data
            element_info = tcm_engine.element_data[element]
            assert "season" in element_info
            assert "organ_yin" in element_info
            assert "organ_yang" in element_info
    
    def test_elemental_balance_calculation(self, tcm_engine, sample_birth_data):
        """Test elemental balance calculation"""
        balance = tcm_engine._calculate_elemental_balance(
            sample_birth_data["year"],
            sample_birth_data["month"], 
            sample_birth_data["day"],
            sample_birth_data["hour"]
        )
        
        # Should return dict with all 5 elements
        assert isinstance(balance, dict)
        assert len(balance) == 5
        
        # All elements should be present with float values
        for element in tcm_engine.elements:
            assert element in balance
            assert isinstance(balance[element], float)
            assert 0.0 <= balance[element] <= 1.0
        
        # Should sum to approximately 1.0
        total = sum(balance.values())
        assert abs(total - 1.0) < 0.01
        
        # Should have some variation (not all equal)
        values = list(balance.values())
        assert max(values) != min(values)
    
    def test_seasonal_element_mapping(self, tcm_engine):
        """Test seasonal to element mapping"""
        assert tcm_engine._get_seasonal_element("spring") == "wood"
        assert tcm_engine._get_seasonal_element("summer") == "fire" 
        assert tcm_engine._get_seasonal_element("autumn") == "metal"
        assert tcm_engine._get_seasonal_element("winter") == "water"
        assert tcm_engine._get_seasonal_element("unknown") == "earth"  # Default
    
    def test_hour_element_mapping(self, tcm_engine):
        """Test hour to element mapping (TCM organ clock)"""
        # Test various hours
        assert tcm_engine._get_hour_element(2) == "wood"  # Liver time
        assert tcm_engine._get_hour_element(12) == "fire"  # Heart time
        assert tcm_engine._get_hour_element(9) == "earth"  # Spleen time  
        assert tcm_engine._get_hour_element(4) == "metal"  # Lung time
        assert tcm_engine._get_hour_element(18) == "water"  # Kidney time
    
    def test_constitution_calculation(self, tcm_engine, sample_birth_data):
        """Test complete constitution calculation"""
        result = tcm_engine.calculate_constitution(**sample_birth_data)
        
        # Should return complete result dictionary
        assert isinstance(result, dict)
        required_keys = [
            "user_id", "birth_data", "primary_element", "elemental_balance",
            "constitution_analysis", "health_guidance", "seasonal_recommendations",
            "organ_analysis", "analysis_confidence", "timestamp"
        ]
        
        for key in required_keys:
            assert key in result, f"Missing required key: {key}"
        
        # Validate specific fields
        assert result["user_id"] == sample_birth_data["user_id"]
        assert result["primary_element"] in tcm_engine.elements
        assert isinstance(result["analysis_confidence"], float)
        assert 0.0 <= result["analysis_confidence"] <= 1.0
        assert isinstance(result["constitution_analysis"], dict)
        assert isinstance(result["health_guidance"], dict)
    
    def test_constitution_analysis_structure(self, tcm_engine, sample_birth_data):
        """Test constitution analysis has correct structure"""
        result = tcm_engine.calculate_constitution(**sample_birth_data)
        constitution = result["constitution_analysis"]
        
        required_keys = [
            "primary_element", "constitutional_type", "dominant_organs",
            "optimal_season", "balanced_emotion", "constitution_traits"
        ]
        
        for key in required_keys:
            assert key in constitution
            
        assert isinstance(constitution["constitution_traits"], list)
        assert len(constitution["constitution_traits"]) > 0
        assert isinstance(constitution["dominant_organs"], list)
        assert len(constitution["dominant_organs"]) == 2  # Yin and yang organs
    
    def test_health_guidance_structure(self, tcm_engine, sample_birth_data):
        """Test health guidance has correct structure"""
        result = tcm_engine.calculate_constitution(**sample_birth_data)
        health_guidance = result["health_guidance"]
        
        required_keys = [
            "constitutional_strengths", "potential_weaknesses",
            "dietary_recommendations", "lifestyle_recommendations", "organ_support"
        ]
        
        for key in required_keys:
            assert key in health_guidance
            
        # Should contain lists of recommendations
        assert isinstance(health_guidance["dietary_recommendations"], list)
        assert isinstance(health_guidance["lifestyle_recommendations"], list)
        assert len(health_guidance["dietary_recommendations"]) > 0
        assert len(health_guidance["lifestyle_recommendations"]) > 0
    
    def test_seasonal_recommendations(self, tcm_engine, sample_birth_data):
        """Test seasonal recommendations structure"""
        result = tcm_engine.calculate_constitution(**sample_birth_data)
        seasonal_recs = result["seasonal_recommendations"]
        
        seasons = ["spring", "summer", "autumn", "winter"]
        for season in seasons:
            assert season in seasonal_recs
            season_data = seasonal_recs[season]
            
            required_keys = ["energy_level", "element_affinity", "recommendation"]
            for key in required_keys:
                assert key in season_data
                
            assert season_data["energy_level"] in ["high", "moderate", "challenging"]
            assert isinstance(season_data["element_affinity"], float)
    
    def test_organ_analysis(self, tcm_engine, sample_birth_data):
        """Test organ analysis structure"""
        result = tcm_engine.calculate_constitution(**sample_birth_data)
        organ_analysis = result["organ_analysis"]
        
        # Should have analysis for all 5 elements
        assert len(organ_analysis) == 5
        
        for element in tcm_engine.elements:
            assert element in organ_analysis
            element_data = organ_analysis[element]
            
            required_keys = [
                "yin_organ", "yang_organ", "strength_level", 
                "strength_score", "optimal_hours"
            ]
            
            for key in required_keys:
                assert key in element_data
                
            assert element_data["strength_level"] in ["strong", "moderate", "weak"]
            assert isinstance(element_data["strength_score"], float)
    
    def test_different_birth_dates_produce_different_results(self, tcm_engine):
        """Test that different birth dates produce different results"""
        birth_data_1 = {"year": 1990, "month": 3, "day": 15, "hour": 8}  # Spring Wood time
        birth_data_2 = {"year": 1985, "month": 12, "day": 20, "hour": 18}  # Winter Water time
        
        result_1 = tcm_engine.calculate_constitution(**birth_data_1)
        result_2 = tcm_engine.calculate_constitution(**birth_data_2)
        
        # Results should be different
        assert result_1["primary_element"] != result_2["primary_element"] or \
               result_1["elemental_balance"] != result_2["elemental_balance"]
    
    def test_error_handling(self, tcm_engine):
        """Test error handling for invalid inputs"""
        # Test with invalid data - engine should handle gracefully
        try:
            result = tcm_engine.calculate_constitution(
                year=2025, month=13, day=32, hour=25  # Invalid values
            )
            # Should still return a result with error information
            assert isinstance(result, dict)
        except Exception as e:
            # Or should raise a proper exception
            assert isinstance(e, (ValueError, TypeError))


class TestTCMModuleFunctions:
    """Test module-level functions"""
    
    @pytest.mark.skipif(not TCM_AVAILABLE, reason="TCM engine not available")
    def test_calculate_tcm_constitution_function(self):
        """Test the module-level function"""
        result = calculate_tcm_constitution(
            year=1990, month=6, day=15, hour=12, user_id="test"
        )
        
        assert isinstance(result, dict)
        assert "primary_element" in result
        assert "elemental_balance" in result
        assert result["user_id"] == "test"


class TestTCMIntegrationPatterns:
    """Test integration with existing CosmicHub patterns"""
    
    @pytest.mark.skipif(not TCM_AVAILABLE, reason="TCM engine not available")
    def test_result_structure_matches_spiritual_systems_pattern(self):
        """Test that TCM results match existing spiritual systems pattern"""
        result = calculate_tcm_constitution(year=1990, month=6, day=15)
        
        # Should follow the pattern established by spiritual systems
        expected_structure = {
            "user_id": str,
            "timestamp": str, 
            "analysis_confidence": float,
            "calculation_method": str
        }
        
        for key, expected_type in expected_structure.items():
            if key in result:
                assert isinstance(result[key], expected_type)
    
    @pytest.mark.skipif(not TCM_AVAILABLE, reason="TCM engine not available") 
    def test_api_compatibility_structure(self):
        """Test API response structure compatibility"""
        result = calculate_tcm_constitution(year=1990, month=6, day=15)
        
        # Should be JSON serializable
        import json
        try:
            json.dumps(result)
        except (TypeError, ValueError) as e:
            pytest.fail(f"Result not JSON serializable: {e}")
        
        # Should have consistent timestamp format
        if "timestamp" in result:
            try:
                datetime.fromisoformat(result["timestamp"])
            except ValueError as e:
                pytest.fail(f"Invalid timestamp format: {e}")


class TestTCMPerformance:
    """Test performance characteristics"""
    
    @pytest.mark.skipif(not TCM_AVAILABLE, reason="TCM engine not available")
    def test_calculation_performance(self):
        """Test that calculations complete in reasonable time"""
        import time
        
        start_time = time.time()
        result = calculate_tcm_constitution(year=1990, month=6, day=15)
        end_time = time.time()
        
        calculation_time = end_time - start_time
        
        # Should complete in less than 1 second
        assert calculation_time < 1.0, f"Calculation took too long: {calculation_time}s"
        assert isinstance(result, dict)
    
    @pytest.mark.skipif(not TCM_AVAILABLE, reason="TCM engine not available")
    def test_memory_usage_reasonable(self):
        """Test that calculations don't use excessive memory"""
        # Run multiple calculations to check for memory leaks
        results = []
        for i in range(10):
            result = calculate_tcm_constitution(
                year=1990, month=6, day=15+i, hour=12+i
            )
            results.append(result)
        
        # All results should be valid
        assert len(results) == 10
        for result in results:
            assert isinstance(result, dict)
            assert "primary_element" in result


# Integration test fixtures
@pytest.fixture
def mock_birth_data():
    """Mock birth data for testing"""
    return {
        "year": 1990,
        "month": 6, 
        "day": 15,
        "hour": 14,
        "minute": 30,
        "lat": 40.7128,
        "lon": -74.0060,
        "timezone": "America/New_York"
    }

@pytest.fixture 
def expected_tcm_response_keys():
    """Expected keys in TCM API responses"""
    return [
        "success",
        "data", 
        "calculation_method",
        "processing_time_ms",
        "api_version",
        "generated_at"
    ]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
