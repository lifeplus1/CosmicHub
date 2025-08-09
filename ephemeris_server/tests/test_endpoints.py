import pytest
from unittest.mock import Mock, patch
from fastapi import status


class TestEphemerisEndpoints:
    """Test cases for ephemeris API endpoints."""
    
    def test_health_check_healthy(self, client, auth_headers, mock_ephemeris_service):
        """Test health check endpoint when service is healthy."""
        with patch('ephemeris_server.main.ephemeris_service', mock_ephemeris_service):
            response = client.get("/health")
            
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "healthy"
        assert data["ephemeris_initialized"] is True
        assert "timestamp" in data
    
    def test_health_check_unhealthy(self, client, auth_headers):
        """Test health check endpoint when service is unhealthy."""
        mock_service = Mock()
        mock_service.is_healthy.return_value = False
        
        with patch('ephemeris_server.main.ephemeris_service', mock_service):
            response = client.get("/health")
            
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "unhealthy"
        assert data["ephemeris_initialized"] is False
    
    def test_health_check_no_service(self, client, auth_headers):
        """Test health check endpoint when service is not initialized."""
        with patch('ephemeris_server.main.ephemeris_service', None):
            response = client.get("/health")
            
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "unhealthy"
        assert data["ephemeris_initialized"] is False
    
    def test_calculate_position_success(self, client, auth_headers, mock_ephemeris_service, sample_planet_position):
        """Test successful planetary position calculation."""
        mock_ephemeris_service.calculate_position.return_value = sample_planet_position
        
        with patch('ephemeris_server.main.ephemeris_service', mock_ephemeris_service):
            response = client.post(
                "/calculate",
                json={"julian_day": 2451545.0, "planet": "sun"},
                headers=auth_headers
            )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["planet"] == "sun"
        assert data["julian_day"] == 2451545.0
        assert data["position"]["position"] == 123.456
        assert data["position"]["retrograde"] is False
        assert "calculation_time" in data
    
    def test_calculate_position_invalid_planet(self, client, auth_headers, mock_ephemeris_service):
        """Test calculation with invalid planet name."""
        mock_ephemeris_service.calculate_position.side_effect = ValueError("Invalid planet")
        
        with patch('ephemeris_server.main.ephemeris_service', mock_ephemeris_service):
            response = client.post(
                "/calculate",
                json={"julian_day": 2451545.0, "planet": "invalidplanet"},
                headers=auth_headers
            )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Invalid planet" in response.json()["detail"]
    
    def test_calculate_position_no_auth(self, client):
        """Test calculation without authentication."""
        response = client.post(
            "/calculate",
            json={"julian_day": 2451545.0, "planet": "sun"}
        )
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
    
    def test_calculate_position_invalid_auth(self, client):
        """Test calculation with invalid API key."""
        response = client.post(
            "/calculate",
            json={"julian_day": 2451545.0, "planet": "sun"},
            headers={"Authorization": "Bearer invalid-key"}
        )
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_batch_calculation_success(self, client, auth_headers, mock_ephemeris_service, sample_planet_position):
        """Test successful batch planetary position calculation."""
        mock_ephemeris_service.calculate_position.return_value = sample_planet_position
        
        batch_request = {
            "calculations": [
                {"julian_day": 2451545.0, "planet": "sun"},
                {"julian_day": 2451545.0, "planet": "moon"}
            ]
        }
        
        with patch('ephemeris_server.main.ephemeris_service', mock_ephemeris_service):
            response = client.post(
                "/calculate/batch",
                json=batch_request,
                headers=auth_headers
            )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data["results"]) == 2
        assert data["results"][0]["planet"] == "sun"
        assert data["results"][1]["planet"] == "moon"
        assert "calculation_time" in data
    
    def test_batch_calculation_oversized(self, client, auth_headers):
        """Test batch calculation with too many requests."""
        batch_request = {
            "calculations": [{"julian_day": 2451545.0, "planet": "sun"}] * 100  # Exceed max batch size
        }
        
        response = client.post(
            "/calculate/batch",
            json=batch_request,
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "exceeds maximum" in response.json()["detail"]
    
    def test_get_supported_planets(self, client, auth_headers, mock_ephemeris_service):
        """Test getting list of supported planets."""
        with patch('ephemeris_server.main.ephemeris_service', mock_ephemeris_service):
            response = client.get("/planets", headers=auth_headers)
        
        assert response.status_code == status.HTTP_200_OK
        planets = response.json()
        assert isinstance(planets, list)
        assert "sun" in planets
        assert "moon" in planets
    
    def test_get_ephemeris_file_not_found(self, client, auth_headers):
        """Test requesting non-existent ephemeris file."""
        response = client.get("/ephemeris/nonexistent.se1", headers=auth_headers)
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_get_ephemeris_file_invalid_filename(self, client, auth_headers):
        """Test requesting ephemeris file with invalid filename (directory traversal)."""
        response = client.get("/ephemeris/../etc/passwd", headers=auth_headers)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Invalid filename" in response.json()["detail"]
    
    @pytest.mark.parametrize("invalid_filename", [
        "../test.se1",
        "subdir/test.se1",
        "test\\file.se1"
    ])
    def test_get_ephemeris_file_security(self, client, auth_headers, invalid_filename):
        """Test ephemeris file endpoint security against various invalid filenames."""
        response = client.get(f"/ephemeris/{invalid_filename}", headers=auth_headers)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
