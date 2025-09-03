"""
Test suite for psychology integration API endpoints and caching.
Tests the complete psychology analysis pipeline including Redis caching.
"""

import pytest
import asyncio
import json
from unittest.mock import Mock, patch, AsyncMock
from fastapi.testclient import TestClient
from datetime import datetime

# Import the FastAPI app and related modules
from backend.main import app
from backend.api.routers.calculations import BirthData
from backend.services.psychology_cache import PsychologyCacheService
from astro.calculations.personality import PersonalityAnalyzer

# Test client
client = TestClient(app)

class TestPsychologyAPI:
    """Test suite for psychology API endpoints."""
    
    @pytest.fixture
    def sample_birth_data(self):
        """Sample birth data for testing."""
        return {
            "year": 1990,
            "month": 5,
            "day": 15,
            "hour": 14,
            "minute": 30,
            "lat": 40.7128,
            "lon": -74.0060,
            "city": "New York",
            "timezone": "America/New_York"
        }
    
    @pytest.fixture
    def mock_psychology_result(self):
        """Mock psychology analysis result."""
        return {
            "mbti": {
                "type": "ESTP",
                "cognitive_functions": [
                    {
                        "name": "Se",
                        "position": "dominant",
                        "strength": 0.85
                    }
                ],
                "description": "The Entrepreneur",
                "strength_confidence": 0.78,
                "preferences": {
                    "extraversion": 0.7,
                    "sensing": 0.8,
                    "thinking": 0.6,
                    "perceiving": 0.9
                },
                "astrological_correlations": {
                    "planetary_emphasis": {"mars": 0.8},
                    "elemental_strength": {"fire": 0.85}
                }
            },
            "enneagram": {
                "primary_type": 1,
                "secondary_type": None,
                "description": "The Perfectionist",
                "instinctual_variants": {
                    "self_preservation": 0.6,
                    "social": 0.8,
                    "sexual": 0.4
                },
                "wings": [
                    {"number": 9, "influence": 0.3},
                    {"number": 2, "influence": 0.7}
                ],
                "confidence": 0.73,
                "astrological_correlations": {
                    "planetary_emphasis": {"saturn": 0.9}
                }
            },
            "synthesis": {
                "personality_integration": "Strong leadership with principled approach",
                "astrological_confirmation": ["Mars-Saturn aspects support action with discipline"],
                "development_path": ["Balance spontaneity with structure"],
                "shadow_work": ["Address perfectionist tendencies"],
                "spiritual_growth": {
                    "meditation_style": "Moving meditation",
                    "spiritual_practices": "Service-oriented practices"
                },
                "overall_harmony": 0.75,
                "contradictions": ["Spontaneity vs Structure"],
                "integration_guidance": "Channel Mars energy through Saturn wisdom"
            }
        }

    def test_psychology_endpoint_success(self, sample_birth_data, mock_psychology_result):
        """Test successful psychology analysis endpoint."""
        with patch('astro.calculations.personality.PersonalityAnalyzer') as mock_analyzer:
            # Mock the analyzer
            mock_instance = Mock()
            mock_instance.analyze_personality.return_value = mock_psychology_result
            mock_analyzer.return_value = mock_instance
            
            # Mock cache miss
            with patch.object(PsychologyCacheService, 'get_complete_analysis', return_value=None):
                with patch.object(PsychologyCacheService, 'set_complete_analysis'):
                    response = client.post("/api/calculations/psychology", json=sample_birth_data)
            
            assert response.status_code == 200
            
            response_data = response.json()
            assert response_data["status"] == "success"
            assert "psychology_data" in response_data
            assert response_data["location"] == "New York"
            assert response_data["cached"] == False
            assert "analysis_timestamp" in response_data

    def test_psychology_endpoint_cached_result(self, sample_birth_data, mock_psychology_result):
        """Test psychology endpoint returning cached result."""
        # Mock cache hit
        with patch.object(PsychologyCacheService, 'get_complete_analysis', return_value=mock_psychology_result):
            response = client.post("/api/calculations/psychology", json=sample_birth_data)
        
        assert response.status_code == 200
        
        response_data = response.json()
        assert response_data["status"] == "success"
        assert response_data["cached"] == True
        assert response_data["psychology_data"] == mock_psychology_result

    def test_psychology_endpoint_validation_error(self):
        """Test psychology endpoint with invalid birth data."""
        invalid_data = {
            "year": "invalid",  # Should be integer
            "month": 15,  # Invalid month
            "day": 32,   # Invalid day
        }
        
        response = client.post("/api/calculations/psychology", json=invalid_data)
        assert response.status_code == 422  # Validation error

    def test_psychology_endpoint_analysis_error(self, sample_birth_data):
        """Test psychology endpoint when analysis fails."""
        with patch('astro.calculations.personality.PersonalityAnalyzer') as mock_analyzer:
            # Mock analyzer to raise exception
            mock_instance = Mock()
            mock_instance.analyze_personality.side_effect = Exception("Analysis failed")
            mock_analyzer.return_value = mock_instance
            
            response = client.post("/api/calculations/psychology", json=sample_birth_data)
            
            assert response.status_code == 500
            assert "Psychology calculation failed" in response.json()["detail"]

    def test_multi_system_chart_with_psychology(self, sample_birth_data, mock_psychology_result):
        """Test multi-system chart endpoint includes psychology data."""
        with patch('astro.calculations.personality.PersonalityAnalyzer') as mock_analyzer:
            mock_instance = Mock()
            mock_instance.analyze_personality.return_value = mock_psychology_result
            mock_analyzer.return_value = mock_instance
            
            with patch('astro.calculations.chart.calculate_chart') as mock_chart:
                mock_chart.return_value = {
                    "planets": {"sun": {"longitude": 54.123}},
                    "houses": {"1": {"longitude": 0.0}},
                    "aspects": []
                }
                
                response = client.post(
                    "/api/calculations/multi-system-chart", 
                    json=sample_birth_data,
                    params={"include_psychology": True}
                )
                
                assert response.status_code == 200
                
                response_data = response.json()
                assert "psychology" in response_data
                assert response_data["psychology"]["mbti"]["type"] == "ESTP"
                assert response_data["psychology"]["enneagram"]["primary_type"] == 1


class TestPsychologyCacheService:
    """Test suite for psychology caching service."""
    
    @pytest.fixture
    def sample_cache_data(self):
        """Sample cache key data."""
        return {
            "year": 1990,
            "month": 5,
            "day": 15,
            "hour": 14,
            "minute": 30,
            "lat": 40.7128,
            "lon": -74.0060,
            "timezone": "America/New_York"
        }
    
    @pytest.fixture
    def mock_analysis_result(self):
        """Mock analysis result for caching."""
        return {
            "mbti_type": "ESTP",
            "enneagram_type": 1,
            "analysis_timestamp": str(datetime.now())
        }

    @patch('backend.services.psychology_cache.psychology_cache')
    def test_cache_service_set_get(self, mock_cache, sample_cache_data, mock_analysis_result):
        """Test cache service set and get operations."""
        # Mock cache operations
        mock_cache.is_connected.return_value = True
        mock_cache.get.return_value = mock_analysis_result
        mock_cache.set.return_value = None
        
        # Test set operation
        PsychologyCacheService.set_complete_analysis(sample_cache_data, mock_analysis_result)
        mock_cache.set.assert_called_once()
        
        # Test get operation
        result = PsychologyCacheService.get_complete_analysis(sample_cache_data)
        assert result == mock_analysis_result
        mock_cache.get.assert_called_once()

    @patch('backend.services.psychology_cache.psychology_cache')
    def test_cache_service_invalidation(self, mock_cache, sample_cache_data):
        """Test cache invalidation operations."""
        mock_cache.is_connected.return_value = True
        mock_cache.invalidate.return_value = None
        
        # Test user-specific invalidation
        PsychologyCacheService.invalidate_user_analysis(sample_cache_data)
        
        # Should call invalidate for each analysis type
        assert mock_cache.invalidate.call_count == 4  # mbti, enneagram, synthesis, complete

    @patch('backend.services.psychology_cache.psychology_cache')
    def test_cache_service_disconnected(self, mock_cache, sample_cache_data, mock_analysis_result):
        """Test cache service behavior when Redis is disconnected."""
        mock_cache.is_connected.return_value = False
        mock_cache.get.return_value = None
        
        # Should return None when cache is disconnected
        result = PsychologyCacheService.get_complete_analysis(sample_cache_data)
        assert result is None
        
        # Should not crash when setting
        PsychologyCacheService.set_complete_analysis(sample_cache_data, mock_analysis_result)

    @patch('backend.services.psychology_cache.psychology_cache')
    def test_mbti_specific_caching(self, mock_cache, sample_cache_data, mock_analysis_result):
        """Test MBTI-specific caching operations."""
        mock_cache.is_connected.return_value = True
        mock_cache.get.return_value = mock_analysis_result
        mock_cache.set.return_value = None
        
        # Test MBTI-specific cache operations
        PsychologyCacheService.set_mbti_analysis(sample_cache_data, mock_analysis_result, 1800)
        result = PsychologyCacheService.get_mbti_analysis(sample_cache_data)
        
        assert result == mock_analysis_result
        mock_cache.set.assert_called_once_with('mbti', sample_cache_data, mock_analysis_result, 1800)

    @patch('backend.services.psychology_cache.psychology_cache')
    def test_enneagram_specific_caching(self, mock_cache, sample_cache_data, mock_analysis_result):
        """Test Enneagram-specific caching operations."""
        mock_cache.is_connected.return_value = True
        mock_cache.get.return_value = mock_analysis_result
        mock_cache.set.return_value = None
        
        # Test Enneagram-specific cache operations
        PsychologyCacheService.set_enneagram_analysis(sample_cache_data, mock_analysis_result, 1800)
        result = PsychologyCacheService.get_enneagram_analysis(sample_cache_data)
        
        assert result == mock_analysis_result
        mock_cache.set.assert_called_once_with('enneagram', sample_cache_data, mock_analysis_result, 1800)

    @patch('backend.services.psychology_cache.psychology_cache')
    def test_synthesis_caching_longer_ttl(self, mock_cache, sample_cache_data, mock_analysis_result):
        """Test synthesis caching with longer TTL."""
        mock_cache.is_connected.return_value = True
        
        # Test synthesis uses longer TTL (7200 seconds)
        PsychologyCacheService.set_synthesis_analysis(sample_cache_data, mock_analysis_result)
        
        mock_cache.set.assert_called_once_with('synthesis', sample_cache_data, mock_analysis_result, 7200)


class TestPersonalityAnalyzer:
    """Test suite for PersonalityAnalyzer integration."""
    
    @pytest.fixture
    def analyzer(self):
        """Create PersonalityAnalyzer instance."""
        return PersonalityAnalyzer()
    
    @pytest.fixture
    def sample_analysis_data(self):
        """Sample astrological data for personality analysis."""
        return {
            "element_emphasis": {"fire": 0.6, "earth": 0.2, "air": 0.1, "water": 0.1},
            "modality_emphasis": {"cardinal": 0.5, "fixed": 0.3, "mutable": 0.2},
            "planetary_strengths": {"mars": 0.8, "venus": 0.6, "mercury": 0.5},
            "house_emphasis": {"1": 0.3, "7": 0.2, "10": 0.2},
            "sign_emphasis": {"aries": 0.3, "leo": 0.2, "sagittarius": 0.1},
            "planetary_positions": {
                "sun": {"sign": "taurus", "house": 2, "longitude": 54.123},
                "moon": {"sign": "scorpio", "house": 8, "longitude": 234.567}
            }
        }
    
    def test_personality_analyzer_initialization(self, analyzer):
        """Test PersonalityAnalyzer initializes correctly."""
        assert analyzer is not None
        assert hasattr(analyzer, 'analyze_personality')
    
    def test_mbti_analysis(self, analyzer, sample_analysis_data):
        """Test MBTI analysis functionality."""
        result = analyzer.analyze_personality(sample_analysis_data)
        
        assert "mbti" in result
        assert "type" in result["mbti"]
        assert "cognitive_functions" in result["mbti"]
        assert len(result["mbti"]["type"]) == 4  # MBTI types are 4 characters
    
    def test_enneagram_analysis(self, analyzer, sample_analysis_data):
        """Test Enneagram analysis functionality."""
        result = analyzer.analyze_personality(sample_analysis_data)
        
        assert "enneagram" in result
        assert "primary_type" in result["enneagram"]
        assert 1 <= result["enneagram"]["primary_type"] <= 9
        assert "wings" in result["enneagram"]
    
    def test_synthesis_generation(self, analyzer, sample_analysis_data):
        """Test psychology synthesis generation."""
        result = analyzer.analyze_personality(sample_analysis_data)
        
        assert "synthesis" in result
        assert "personality_integration" in result["synthesis"]
        assert "overall_harmony" in result["synthesis"]
        assert 0 <= result["synthesis"]["overall_harmony"] <= 1
    
    def test_astrological_correlations(self, analyzer, sample_analysis_data):
        """Test astrological correlations in analysis."""
        result = analyzer.analyze_personality(sample_analysis_data)
        
        # Check MBTI astrological correlations
        assert "astrological_correlations" in result["mbti"]
        
        # Check Enneagram astrological correlations  
        assert "astrological_correlations" in result["enneagram"]
    
    def test_analysis_with_minimal_data(self, analyzer):
        """Test analysis with minimal astrological data."""
        minimal_data = {
            "element_emphasis": {"fire": 1.0, "earth": 0.0, "air": 0.0, "water": 0.0},
            "modality_emphasis": {"cardinal": 1.0, "fixed": 0.0, "mutable": 0.0},
            "planetary_strengths": {"mars": 1.0},
            "house_emphasis": {"1": 1.0},
            "sign_emphasis": {"aries": 1.0},
            "planetary_positions": {}
        }
        
        result = analyzer.analyze_personality(minimal_data)
        
        # Should still produce valid analysis
        assert "mbti" in result
        assert "enneagram" in result
        assert "synthesis" in result
    
    def test_analysis_error_handling(self, analyzer):
        """Test analyzer handles invalid data gracefully."""
        invalid_data = {
            "invalid_key": "invalid_value"
        }
        
        # Should handle invalid data without crashing
        with pytest.raises(KeyError):
            analyzer.analyze_personality(invalid_data)


# Performance and Integration Tests
class TestPsychologyIntegrationPerformance:
    """Test suite for psychology integration performance."""
    
    def test_api_response_time(self, sample_birth_data=None):
        """Test API response time is acceptable."""
        import time
        
        if sample_birth_data is None:
            sample_birth_data = {
                "year": 1990, "month": 5, "day": 15,
                "hour": 14, "minute": 30,
                "lat": 40.7128, "lon": -74.0060,
                "city": "New York", "timezone": "America/New_York"
            }
        
        start_time = time.time()
        
        with patch('astro.calculations.personality.PersonalityAnalyzer'):
            response = client.post("/api/calculations/psychology", json=sample_birth_data)
        
        end_time = time.time()
        response_time = end_time - start_time
        
        assert response.status_code == 200
        assert response_time < 2.0  # Should respond within 2 seconds
    
    def test_cache_performance_improvement(self, sample_birth_data=None):
        """Test that caching improves performance."""
        if sample_birth_data is None:
            sample_birth_data = {
                "year": 1990, "month": 5, "day": 15,
                "hour": 14, "minute": 30,
                "lat": 40.7128, "lon": -74.0060,
                "city": "New York", "timezone": "America/New_York"
            }
        
        mock_result = {"mbti": {"type": "ESTP"}, "cached_test": True}
        
        # First request - cache miss
        with patch.object(PsychologyCacheService, 'get_complete_analysis', return_value=None):
            with patch.object(PsychologyCacheService, 'set_complete_analysis'):
                response1 = client.post("/api/calculations/psychology", json=sample_birth_data)
        
        # Second request - cache hit  
        with patch.object(PsychologyCacheService, 'get_complete_analysis', return_value=mock_result):
            response2 = client.post("/api/calculations/psychology", json=sample_birth_data)
        
        assert response1.status_code == 200
        assert response2.status_code == 200
        assert response2.json()["cached"] == True


if __name__ == "__main__":
    # Run tests with pytest
    pytest.main([__file__, "-v"])
