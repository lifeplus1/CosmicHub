import pytest
import os
from unittest.mock import Mock, patch
from fastapi.testclient import TestClient

from ephemeris_server.main import app
from ephemeris_server.service import EphemerisService


@pytest.fixture
def test_api_key():
    """Test API key for authentication."""
    return "test-api-key-12345"


@pytest.fixture
def mock_env_vars(test_api_key):
    """Mock environment variables for testing."""
    with patch.dict(os.environ, {
        'API_KEY': test_api_key,
        'EPHE_PATH': '/app/ephe',
        'REDIS_URL': 'redis://localhost:6379',
        'CACHE_TTL': '3600',
        'MAX_BATCH_SIZE': '50'
    }):
        yield


@pytest.fixture
def auth_headers(test_api_key):
    """Authorization headers for API requests."""
    return {"Authorization": f"Bearer {test_api_key}"}


@pytest.fixture
def client(mock_env_vars):
    """Test client for FastAPI app."""
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def mock_ephemeris_service():
    """Mock ephemeris service for testing."""
    service = Mock(spec=EphemerisService)
    service.is_healthy.return_value = True
    service.get_supported_planets.return_value = [
        "sun", "moon", "mercury", "venus", "mars", 
        "jupiter", "saturn", "uranus", "neptune", "pluto"
    ]
    return service


@pytest.fixture
def sample_planet_position():
    """Sample planet position data for testing."""
    from ephemeris_server.models import PlanetPosition
    return PlanetPosition(position=123.456, retrograde=False)


@pytest.fixture
def sample_calculation_request():
    """Sample calculation request for testing."""
    from ephemeris_server.models import CalculationRequest
    return CalculationRequest(julian_day=2451545.0, planet="sun")


@pytest.fixture
def sample_batch_request():
    """Sample batch calculation request for testing."""
    from ephemeris_server.models import BatchCalculationRequest, CalculationRequest
    return BatchCalculationRequest(
        calculations=[
            CalculationRequest(julian_day=2451545.0, planet="sun"),
            CalculationRequest(julian_day=2451545.0, planet="moon"),
            CalculationRequest(julian_day=2451545.0, planet="mercury")
        ]
    )
