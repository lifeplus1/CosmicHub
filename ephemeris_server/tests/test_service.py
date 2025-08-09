import pytest
from unittest.mock import Mock, patch, MagicMock
from ephemeris_server.service import EphemerisService, PLANET_MAPPING
from ephemeris_server.models import PlanetPosition


class TestEphemerisService:
    """Test cases for the EphemerisService class."""
    
    @pytest.fixture
    def mock_redis(self):
        """Mock Redis client for testing."""
        redis_mock = Mock()
        redis_mock.ping.return_value = True
        redis_mock.get.return_value = None
        redis_mock.setex.return_value = True
        return redis_mock
    
    @pytest.fixture
    def mock_swisseph(self):
        """Mock Swiss Ephemeris module for testing."""
        with patch('ephemeris_server.service.swe') as swe_mock:
            swe_mock.set_ephe_path = Mock()
            swe_mock.calc_ut = Mock(return_value=[[123.456, 0, 0, 0.5], None])
            swe_mock.FLG_SWIEPH = 2
            swe_mock.FLG_SPEED = 256
            yield swe_mock
    
    def test_service_initialization_no_redis(self, mock_swisseph):
        """Test service initialization without Redis."""
        with patch('os.path.exists', return_value=True), \
             patch('os.listdir', return_value=['test.se1']):
            service = EphemerisService()
            
        assert service.redis_client is None
        assert service._ephemeris_initialized is True
        mock_swisseph.set_ephe_path.assert_called_once()
    
    def test_service_initialization_with_redis(self, mock_swisseph, mock_redis):
        """Test service initialization with Redis."""
        with patch('redis.from_url', return_value=mock_redis), \
             patch('os.path.exists', return_value=True), \
             patch('os.listdir', return_value=['test.se1']):
            service = EphemerisService(redis_url='redis://localhost:6379')
            
        assert service.redis_client is not None
        mock_redis.ping.assert_called_once()
    
    def test_service_initialization_redis_failure(self, mock_swisseph):
        """Test service initialization with Redis connection failure."""
        with patch('redis.from_url', side_effect=Exception("Connection failed")), \
             patch('os.path.exists', return_value=True), \
             patch('os.listdir', return_value=['test.se1']):
            service = EphemerisService(redis_url='redis://localhost:6379')
            
        assert service.redis_client is None
    
    def test_calculate_position_success(self, mock_swisseph):
        """Test successful planetary position calculation."""
        with patch('os.path.exists', return_value=True), \
             patch('os.listdir', return_value=['test.se1']):
            service = EphemerisService()
            
        result = service.calculate_position(2451545.0, "sun")
        
        assert isinstance(result, PlanetPosition)
        assert result.position == 123.456
        assert result.retrograde is False  # speed is positive (0.5)
        mock_swisseph.calc_ut.assert_called_once()
    
    def test_calculate_position_retrograde(self, mock_swisseph):
        """Test planetary position calculation for retrograde planet."""
        # Mock negative speed for retrograde motion
        mock_swisseph.calc_ut.return_value = [[123.456, 0, 0, -0.5], None]
        
        with patch('os.path.exists', return_value=True), \
             patch('os.listdir', return_value=['test.se1']):
            service = EphemerisService()
            
        result = service.calculate_position(2451545.0, "mercury")
        
        assert result.retrograde is True  # speed is negative (-0.5)
    
    def test_calculate_position_invalid_planet(self, mock_swisseph):
        """Test calculation with invalid planet name."""
        with patch('os.path.exists', return_value=True), \
             patch('os.listdir', return_value=['test.se1']):
            service = EphemerisService()
            
        with pytest.raises(ValueError, match="Invalid planet"):
            service.calculate_position(2451545.0, "invalidplanet")
    
    def test_calculate_position_swisseph_error(self, mock_swisseph):
        """Test calculation when Swiss Ephemeris returns error."""
        # Mock error condition (negative position)
        mock_swisseph.calc_ut.return_value = [[-1, 0, 0, 0.5], None]
        
        with patch('os.path.exists', return_value=True), \
             patch('os.listdir', return_value=['test.se1']):
            service = EphemerisService()
            
        with pytest.raises(ValueError, match="Calculation failed"):
            service.calculate_position(2451545.0, "sun")
    
    def test_calculate_position_with_cache_hit(self, mock_swisseph, mock_redis):
        """Test calculation with cache hit."""
        # Mock cached data
        cached_data = '{"position": 100.0, "retrograde": true}'
        mock_redis.get.return_value = cached_data
        
        with patch('redis.from_url', return_value=mock_redis), \
             patch('os.path.exists', return_value=True), \
             patch('os.listdir', return_value=['test.se1']):
            service = EphemerisService(redis_url='redis://localhost:6379')
            
        result = service.calculate_position(2451545.0, "sun")
        
        assert result.position == 100.0
        assert result.retrograde is True
        # Swiss Ephemeris should not be called due to cache hit
        mock_swisseph.calc_ut.assert_not_called()
    
    def test_calculate_position_cache_miss(self, mock_swisseph, mock_redis):
        """Test calculation with cache miss."""
        mock_redis.get.return_value = None  # Cache miss
        
        with patch('redis.from_url', return_value=mock_redis), \
             patch('os.path.exists', return_value=True), \
             patch('os.listdir', return_value=['test.se1']):
            service = EphemerisService(redis_url='redis://localhost:6379')
            
        result = service.calculate_position(2451545.0, "sun")
        
        # Should calculate and cache the result
        mock_swisseph.calc_ut.assert_called_once()
        mock_redis.setex.assert_called_once()
    
    def test_calculate_multiple_positions(self, mock_swisseph):
        """Test calculating multiple planetary positions."""
        with patch('os.path.exists', return_value=True), \
             patch('os.listdir', return_value=['test.se1']):
            service = EphemerisService()
            
        planets = ["sun", "moon", "mercury"]
        results = service.calculate_multiple_positions(2451545.0, planets)
        
        assert len(results) == 3
        assert "sun" in results
        assert "moon" in results
        assert "mercury" in results
        assert mock_swisseph.calc_ut.call_count == 3
    
    def test_calculate_multiple_positions_with_error(self, mock_swisseph):
        """Test calculating multiple positions with one invalid planet."""
        with patch('os.path.exists', return_value=True), \
             patch('os.listdir', return_value=['test.se1']):
            service = EphemerisService()
            
        planets = ["sun", "invalidplanet", "moon"]
        results = service.calculate_multiple_positions(2451545.0, planets)
        
        # Should skip invalid planet but continue with others
        assert len(results) == 2
        assert "sun" in results
        assert "moon" in results
        assert "invalidplanet" not in results
    
    def test_get_supported_planets(self, mock_swisseph):
        """Test getting list of supported planets."""
        with patch('os.path.exists', return_value=True), \
             patch('os.listdir', return_value=['test.se1']):
            service = EphemerisService()
            
        planets = service.get_supported_planets()
        
        assert isinstance(planets, list)
        assert len(planets) == len(PLANET_MAPPING)
        assert "sun" in planets
        assert "moon" in planets
        assert "pluto" in planets
    
    def test_is_healthy_success(self, mock_swisseph):
        """Test health check when service is healthy."""
        with patch('os.path.exists', return_value=True), \
             patch('os.listdir', return_value=['test.se1']):
            service = EphemerisService()
            
        assert service.is_healthy() is True
        mock_swisseph.calc_ut.assert_called_once()
    
    def test_is_healthy_failure(self, mock_swisseph):
        """Test health check when service has issues."""
        mock_swisseph.calc_ut.side_effect = Exception("Calculation error")
        
        with patch('os.path.exists', return_value=True), \
             patch('os.listdir', return_value=['test.se1']):
            service = EphemerisService()
            
        assert service.is_healthy() is False
    
    def test_cache_key_generation(self, mock_swisseph):
        """Test cache key generation."""
        with patch('os.path.exists', return_value=True), \
             patch('os.listdir', return_value=['test.se1']):
            service = EphemerisService()
            
        key = service._get_cache_key(2451545.0, "sun")
        expected = "ephe:sun:2451545.000000"
        assert key == expected
    
    def test_ephemeris_path_from_env(self, mock_swisseph):
        """Test ephemeris path setting from environment variable."""
        custom_path = "/custom/ephe/path"
        
        with patch('os.getenv', return_value=custom_path), \
             patch('os.path.exists', return_value=True), \
             patch('os.listdir', return_value=['test.se1']):
            service = EphemerisService()
            
        mock_swisseph.set_ephe_path.assert_called_with(custom_path)
