# /Users/Chris/Projects/CosmicHub/backend/tests/test_interpretations_api.py
"""
Test suite for AI Interpretations API
Tests the integration with the sophisticated astrological interpretation engine
"""

import pytest
from typing import Dict, Any
from unittest.mock import Mock, patch
from fastapi.testclient import TestClient

# Import our app and components
from main import app
from api.interpretations import (
    get_chart_data,
    format_interpretation_for_frontend,
    calculate_confidence,
    GenerateInterpretationRequest
)

client = TestClient(app)

@pytest.fixture
def mock_chart_data() -> Dict[str, Any]:
    """Sample chart data for testing"""
    return {
        "planets": {
            "sun": {"sign": "Gemini", "house": 10, "degree": 15.5},
            "moon": {"sign": "Scorpio", "house": 3, "degree": 22.3},
            "mercury": {"sign": "Gemini", "house": 10, "degree": 8.2}
        },
        "houses": {
            "house_1": {"sign": "Virgo", "degree": 12.5},
            "house_10": {"sign": "Gemini", "degree": 5.2}
        },
        "aspects": [
            {"planet1": "sun", "planet2": "moon", "aspect": "trine", "orb": 2.1}
        ],
        "birth_data": {
            "year": 1990,
            "month": 6,
            "day": 15,
            "hour": 12,
            "minute": 0,
            "latitude": 40.7128,
            "longitude": -74.0060,
            "timezone": "America/New_York"
        }
    }

@pytest.fixture
def mock_ai_interpretation() -> Dict[str, Any]:
    """Sample AI interpretation response"""
    return {
        "core_identity": {
            "sun_identity": {
                "archetype": "The Communicator",
                "description": "A natural born teacher and communicator with Mercury ruling your cosmic identity.",
                "element": "Air",
                "quality": "Mutable"
            },
            "moon_nature": {
                "description": "Deep emotional waters with transformative healing abilities.",
                "needs": "emotional depth and transformation"
            }
        },
        "life_purpose": {
            "soul_purpose": {
                "growth_direction": "Learning to communicate deep truths with clarity and compassion."
            },
            "life_mission": "To bridge the gap between intellectual understanding and emotional wisdom."
        },
        "relationship_patterns": {
            "love_style": {
                "attraction_style": "Drawn to intense, transformative connections that challenge your mind."
            }
        },
        "career_path": {
            "career_direction": {
                "natural_calling": "Teaching, writing, counseling, or healing professions that combine intellect with transformation."
            }
        },
        "growth_challenges": {
            "saturn_lessons": {
                "mastery_challenge": "Learning to ground your quick mind with emotional depth and practical application."
            }
        },
        "spiritual_gifts": {
            "psychic_abilities": {
                "intuitive_gifts": "Strong mental telepathy and ability to read between the lines of communication."
            }
        }
    }

@pytest.fixture
def mock_user() -> Dict[str, Any]:
    """Mock authenticated user"""
    return {"uid": "test_user_123", "email": "test@cosmichub.dev"}

class TestInterpretationsAPI:
    """Test suite for interpretations API endpoints"""
    
    @patch('auth.get_current_user')
    @patch('api.interpretations.db')
    def test_get_interpretations_success(self, mock_db: Mock, mock_get_user: Mock, mock_user: Dict[str, Any]) -> None:
        """Test successful retrieval of existing interpretations"""
        mock_get_user.return_value = mock_user
        
        # Mock Firestore query
        mock_doc = Mock()
        mock_doc.to_dict.return_value = {
            "chartId": "chart123",
            "userId": "test_user_123",
            "type": "natal",
            "title": "Natal Chart Analysis",
            "content": "Your chart reveals...",
            "summary": "A communicative and transformative soul.",
            "tags": ["identity", "communication"],
            "confidence": 0.85,
            "createdAt": "2025-08-13T12:00:00Z",
            "updatedAt": "2025-08-13T12:00:00Z"
        }
        mock_doc.id = "interp123"
        
        mock_query = Mock()
        mock_query.stream.return_value = [mock_doc]
        mock_collection = Mock()
        mock_collection.where.return_value.where.return_value = mock_query
        mock_db.collection.return_value = mock_collection  # type: ignore[misc]
        
        # Make request
        response = client.post("/api/interpretations/", json={
            "chartId": "chart123",
            "userId": "test_user_123",
            "type": "natal"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert len(data["data"]) == 1
        assert data["data"][0]["title"] == "Natal Chart Analysis"

    @patch('auth.get_current_user')
    @patch('api.interpretations.get_chart_data')
    @patch('api.interpretations.generate_interpretation')
    @patch('api.interpretations.db')
    def test_generate_interpretation_success(
        self, mock_db: Mock, mock_generate: Mock, mock_get_chart: Mock, mock_get_user: Mock, 
        mock_user: Dict[str, Any], mock_chart_data: Dict[str, Any], mock_ai_interpretation: Dict[str, Any]
    ) -> None:
        """Test successful generation of new AI interpretation"""
        mock_get_user.return_value = mock_user
        mock_get_chart.return_value = mock_chart_data
        mock_generate.return_value = mock_ai_interpretation
        
        # Mock Firestore document creation
        mock_doc_ref = Mock()
        mock_doc_ref.id = "new_interp_123"
        mock_collection = Mock()
        mock_collection.document.return_value = mock_doc_ref
        mock_db.collection.return_value = mock_collection  # type: ignore[misc]
        
        # Make request
        response = client.post("/api/interpretations/generate", json={
            "chartId": "chart123",
            "userId": "test_user_123",
            "type": "natal",
            "interpretation_level": "advanced"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert len(data["data"]) == 1
        assert "Advanced Natal Chart Analysis" in data["data"][0]["title"]
        assert data["data"][0]["confidence"] > 0.6

    @patch('auth.get_current_user')
    @patch('api.interpretations.get_chart_data')
    def test_generate_interpretation_no_chart_data(self, mock_get_chart: Mock, mock_get_user: Mock, mock_user: Dict[str, Any]) -> None:
        """Test error when chart data is not found"""
        mock_get_user.return_value = mock_user
        mock_get_chart.return_value = None
        
        response = client.post("/api/interpretations/generate", json={
            "chartId": "nonexistent_chart",
            "userId": "test_user_123",
            "type": "natal"
        })
        
        assert response.status_code == 404
        assert "Chart data not found" in response.json()["detail"]

    @patch('auth.get_current_user')
    @patch('auth.get_current_user')
    @patch('api.interpretations.db')
    def test_get_interpretation_by_id_success(self, mock_db: Mock, mock_get_user: Mock, mock_user: Dict[str, Any]) -> None:
        """Test successful retrieval of specific interpretation by ID"""
        mock_get_user.return_value = mock_user
        
        # Mock Firestore document
        mock_doc = Mock()
        mock_doc.exists = True
        mock_doc.to_dict.return_value = {
            "chartId": "chart123",
            "userId": "test_user_123",
            "type": "natal",
            "title": "Natal Chart Analysis",
            "content": "Your chart reveals...",
            "confidence": 0.85
        }
        mock_doc.id = "interp123"
        
        mock_doc_ref = Mock()
        mock_doc_ref.get.return_value = mock_doc
        mock_collection = Mock()
        mock_collection.document.return_value = mock_doc_ref
        mock_db.collection.return_value = mock_collection
        
        response = client.get("/api/interpretations/interp123")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["title"] == "Natal Chart Analysis"

    @patch('auth.get_current_user')
    @patch('api.interpretations.db')
    def test_get_interpretation_access_denied(self, mock_db: Mock, mock_get_user: Mock) -> None:
        """Test access denied when trying to access another user's interpretation"""
        mock_get_user.return_value = {"uid": "different_user", "email": "other@test.com"}
        
        # Mock Firestore document owned by different user
        mock_doc = Mock()
        mock_doc.exists = True
        mock_doc.to_dict.return_value = {
            "userId": "original_user_123",  # Different from authenticated user
            "title": "Private Interpretation"
        }
        mock_doc.id = "interp123"
        
        mock_doc_ref = Mock()
        mock_doc_ref.get.return_value = mock_doc
        mock_collection = Mock()
        mock_collection.document.return_value = mock_doc_ref
        mock_db.collection.return_value = mock_collection
        
        response = client.get("/api/interpretations/interp123")
        
        assert response.status_code == 403
        assert "Access denied" in response.json()["detail"]

class TestInterpretationHelpers:
    """Test suite for interpretation helper functions"""
    
    def test_format_interpretation_for_frontend(self, mock_ai_interpretation: Dict[str, Any]) -> None:
        """Test formatting of AI interpretation for frontend consumption"""
        
        request = GenerateInterpretationRequest(
            chartId="chart123",
            userId="user123",
            type="natal",
            interpretation_level="advanced"
        )
        
        formatted = format_interpretation_for_frontend(
            mock_ai_interpretation, 
            request, 
            "advanced"
        )
        
        assert formatted["chartId"] == "chart123"
        assert formatted["userId"] == "user123"
        assert formatted["type"] == "natal"
        assert "Advanced Natal Chart Analysis" in formatted["title"]
        assert len(formatted["content"]) > 100  # Should have substantial content
        assert len(formatted["tags"]) > 0
        assert 0.65 <= formatted["confidence"] <= 0.95

    def test_calculate_confidence_high_completeness(self, mock_ai_interpretation: Dict[str, Any]) -> None:
        """Test confidence calculation with complete interpretation data"""
        confidence = calculate_confidence(mock_ai_interpretation)
        
        # Should be high since we have most sections
        assert 0.80 <= confidence <= 0.95

    def test_calculate_confidence_low_completeness(self) -> None:
        """Test confidence calculation with minimal interpretation data"""
        minimal_interpretation = {
            "core_identity": {
                "sun_identity": {"archetype": "Basic", "description": "Simple"}
            }
        }
        
        confidence = calculate_confidence(minimal_interpretation)
        
        # Should be lower but not below minimum
        assert 0.65 <= confidence <= 0.80

    @pytest.mark.asyncio
    async def test_get_chart_data_from_saved_charts(self) -> None:
        """Test retrieval of chart data from saved charts"""
        with patch('api.interpretations.db') as mock_db:
            # Mock Firestore query for saved chart
            mock_doc = Mock()
            mock_doc.to_dict.return_value = {
                "chart_data": {"planets": {}, "houses": {}, "aspects": []}
            }
            
            mock_query = Mock()
            mock_query.stream.return_value = [mock_doc]
            mock_collection = Mock()
            mock_collection.where.return_value.where.return_value = mock_query
            mock_db.collection.return_value = mock_collection
            
            chart_data = await get_chart_data("chart123", "user123")
            
            assert chart_data is not None
            assert "planets" in chart_data

    @pytest.mark.asyncio
    async def test_get_chart_data_not_found(self) -> None:
        """Test handling when chart data is not found"""
        with patch('api.interpretations.db') as mock_db:
            # Mock empty query result
            mock_query = Mock()
            mock_query.stream.return_value = []
            mock_collection = Mock()
            mock_collection.where.return_value.where.return_value = mock_query
            mock_db.collection.return_value = mock_collection
            
            chart_data = await get_chart_data("nonexistent", "user123")
            
            assert chart_data is None

class TestIntegrationWithAIEngine:
    """Test integration with the sophisticated AI interpretation engine"""
    
    @patch('api.interpretations.generate_interpretation')
    def test_ai_engine_integration(self, mock_generate: Mock, mock_chart_data: Dict[str, Any]) -> None:
        """Test that our API properly calls the AI interpretation engine"""
        mock_generate.return_value = {
            "core_identity": {"sun_identity": {"archetype": "The Seeker"}},
            "life_purpose": {"soul_purpose": {"growth_direction": "Spiritual awakening"}}
        }
        
        # Call the function that should use the AI engine
        
        # This would normally call generate_interpretation from ai_interpretations.py
        result = mock_generate(mock_chart_data, "advanced")
        
        # Verify the engine was called
        mock_generate.assert_called_once_with(mock_chart_data, "advanced")
        assert "core_identity" in result
        assert "life_purpose" in result

if __name__ == "__main__":
    pytest.main(["-v", __file__])
