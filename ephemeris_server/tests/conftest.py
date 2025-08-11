import pytest
import os
from unittest.mock import Mock, patch
from fastapi.testclient import TestClient
from typing import Dict, Generator

from ephemeris_server.main import app
from ephemeris_server.service import EphemerisService
from ephemeris_server.models import PlanetPosition, CalculationRequest, BatchCalculationRequest


@pytest.fixture
def test_api_key() -> str:
    """Test API key for authentication."""
    return "test-api-key-12345"


@pytest.fixture
def mock_env_vars(test_api_key: str) -> Generator[None, None, None]:
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
def auth_headers(test_api_key: str) -> Dict[str, str]:
    """Authorization headers for API requests."""
    return {"Authorization": f"Bearer {test_api_key}"}


@pytest.fixture
def client(mock_env_vars: Generator[None, None, None]) -> Generator[TestClient, None, None]:
    """Test client for FastAPI app."""
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def mock_ephemeris_service() -> Mock:
    """Mock ephemeris service for testing."""
    service = Mock(spec=EphemerisService)
    service.is_healthy.return_value = True
    service.get_supported_planets.return_value = [
        "sun", "moon", "mercury", "venus", "mars", 
        "jupiter", "saturn", "uranus", "neptune", "pluto"
    ]
    return service


@pytest.fixture
def sample_planet_position() -> PlanetPosition:
    """Sample planet position data for testing."""
    from ephemeris_server.models import PlanetPosition
    return PlanetPosition(position=123.456, retrograde=False)


@pytest.fixture
def sample_calculation_request() -> CalculationRequest:
    """Sample calculation request for testing."""
    from ephemeris_server.models import CalculationRequest
    return CalculationRequest(julian_day=2451545.0, planet="sun")


@pytest.fixture
def sample_batch_request() -> BatchCalculationRequest:
    """Sample batch calculation request for testing."""
    from ephemeris_server.models import BatchCalculationRequest, CalculationRequest
    return BatchCalculationRequest(
        calculations=[
            CalculationRequest(julian_day=2451545.0, planet="sun"),
            CalculationRequest(julian_day=2451545.0, planet="moon"),
            CalculationRequest(julian_day=2451545.0, planet="mercury")
        ]
    )
