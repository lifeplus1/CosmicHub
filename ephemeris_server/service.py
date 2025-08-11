import swisseph as swe  # type: ignore
import os
import logging
import redis  # type: ignore
import json
from typing import Dict, Optional, Final

from models import PlanetPosition

logger = logging.getLogger(__name__)

# Type-safe constants for planetary bodies
SUN: Final[int] = 0
MOON: Final[int] = 1  
MERCURY: Final[int] = 2
VENUS: Final[int] = 3
MARS: Final[int] = 4
JUPITER: Final[int] = 5
SATURN: Final[int] = 6
URANUS: Final[int] = 7
NEPTUNE: Final[int] = 8
PLUTO: Final[int] = 9
CHIRON: Final[int] = 15
CERES: Final[int] = 17
PALLAS: Final[int] = 18
JUNO: Final[int] = 19
VESTA: Final[int] = 20

# Mapping of planet names to Swiss Ephemeris body constants
PLANET_MAPPING: Final[Dict[str, int]] = {
    "sun": SUN,
    "moon": MOON,
    "mercury": MERCURY,
    "venus": VENUS,
    "mars": MARS,
    "jupiter": JUPITER,
    "saturn": SATURN,
    "uranus": URANUS,
    "neptune": NEPTUNE,
    "pluto": PLUTO,
    "chiron": CHIRON,
    "ceres": CERES,
    "pallas": PALLAS,
    "juno": JUNO,
    "vesta": VESTA,
}

class EphemerisService:
    """Service for calculating planetary positions using Swiss Ephemeris."""
    
    def __init__(self, redis_url: Optional[str] = None, cache_ttl: int = 3600):
        """
        Initialize the ephemeris service.
        
        Args:
            redis_url: Redis connection URL for caching
            cache_ttl: Cache time-to-live in seconds (default 1 hour)
        """
        self.cache_ttl = cache_ttl
        self.redis_client = None
        self._ephemeris_initialized = False
        
        # Initialize Redis if URL provided
        if redis_url:
            try:
                self.redis_client = redis.from_url(redis_url, decode_responses=True)  # type: ignore[attr-defined]
                # Test connection
                self.redis_client.ping()  # type: ignore[attr-defined]
                logger.info("Redis connection established successfully")
            except Exception as e:
                logger.warning(f"Redis connection failed: {e}. Continuing without cache.")
                self.redis_client = None
        
        # Initialize ephemeris
        self._init_ephemeris()
    
    def _init_ephemeris(self) -> None:
        """Initialize Swiss Ephemeris with proper path."""
        if self._ephemeris_initialized:
            return
            
        logger.info("Initializing Swiss Ephemeris")
        try:
            # Set ephemeris path from environment or default
            ephe_path = os.getenv('EPHE_PATH', '/app/ephe')
            
            logger.info(f"Setting ephemeris path to: {ephe_path}")
            logger.info(f"Path exists: {os.path.exists(ephe_path)}")
            
            if os.path.exists(ephe_path):
                files = os.listdir(ephe_path)
                logger.info(f"Ephemeris files found: {files}")
            
            # Set the ephemeris path
            swe.set_ephe_path(ephe_path)  # type: ignore[attr-defined]
            self._ephemeris_initialized = True
            
            logger.info("Swiss Ephemeris initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing ephemeris: {str(e)}", exc_info=True)
            raise ValueError(f"Error initializing ephemeris: {str(e)}")
    
    def _get_cache_key(self, julian_day: float, planet: str) -> str:
        """Generate cache key for planetary position."""
        return f"ephe:{planet}:{julian_day:.6f}"
    
    def _get_from_cache(self, cache_key: str) -> Optional[PlanetPosition]:
        """Get planetary position from cache."""
        if not self.redis_client:
            return None
            
        try:
            cached_data = self.redis_client.get(cache_key)  # type: ignore[attr-defined]
            if cached_data:
                data = json.loads(str(cached_data))  # Convert to string to ensure type safety
                return PlanetPosition(**data)
        except Exception as e:
            logger.warning(f"Cache read error: {e}")
        
        return None
    
    def _set_cache(self, cache_key: str, position: PlanetPosition) -> None:
        """Set planetary position in cache."""
        if not self.redis_client:
            return
            
        try:
            data = position.model_dump()
            self.redis_client.setex(  # type: ignore[attr-defined]
                cache_key, 
                self.cache_ttl, 
                json.dumps(data)
            )
        except Exception as e:
            logger.warning(f"Cache write error: {e}")
    
    def calculate_position(self, julian_day: float, planet: str) -> PlanetPosition:
        """
        Calculate planetary position for given Julian Day and planet.
        
        Args:
            julian_day: Julian Day Number
            planet: Planet name (must be in PLANET_MAPPING)
            
        Returns:
            PlanetPosition with position and retrograde status
            
        Raises:
            ValueError: If planet name is invalid or calculation fails
        """
        # Validate planet name
        planet_lower = planet.lower()
        if planet_lower not in PLANET_MAPPING:
            valid_planets = list(PLANET_MAPPING.keys())
            raise ValueError(f"Invalid planet '{planet}'. Valid planets: {valid_planets}")
        
        # Check cache first
        cache_key = self._get_cache_key(julian_day, planet_lower)
        cached_position = self._get_from_cache(cache_key)
        if cached_position:
            logger.debug(f"Cache hit for {planet_lower} at JD {julian_day}")
            return cached_position
        
        # Ensure ephemeris is initialized
        self._init_ephemeris()
        
        logger.debug(f"Calculating position for {planet_lower} at JD {julian_day}")
        
        try:
            body = PLANET_MAPPING[planet_lower]
            
            # Calculate position with speed flag to get retrograde status
            flags = swe.FLG_SWIEPH | swe.FLG_SPEED  # type: ignore[attr-defined]
            result = swe.calc_ut(julian_day, body, flags)  # type: ignore[attr-defined]
            
            # Check for errors
            if result[0][0] < 0:  # type: ignore[index]
                raise ValueError(f"Swiss Ephemeris calculation error for {planet_lower}")
            
            # Extract position and speed (for retrograde determination)
            position_deg = float(result[0][0])  # type: ignore[index] # Longitude in degrees
            speed = float(result[0][3])  # type: ignore[index] # Speed in degrees per day
            retrograde = speed < 0
            
            planet_position = PlanetPosition(
                position=position_deg,
                retrograde=retrograde
            )
            
            # Cache the result
            self._set_cache(cache_key, planet_position)
            
            logger.debug(f"Calculated {planet_lower}: {position_deg:.6f}° (retrograde: {retrograde})")
            return planet_position
            
        except Exception as e:
            logger.error(f"Error calculating position for {planet_lower}: {str(e)}", exc_info=True)
            raise ValueError(f"Calculation failed for {planet_lower}: {str(e)}")
    
    def calculate_multiple_positions(self, julian_day: float, planets: list[str]) -> Dict[str, PlanetPosition]:
        """
        Calculate positions for multiple planets at once.
        
        Args:
            julian_day: Julian Day Number
            planets: List of planet names
            
        Returns:
            Dictionary mapping planet names to their positions
        """
        results: Dict[str, PlanetPosition] = {}
        for planet in planets:
            try:
                results[planet.lower()] = self.calculate_position(julian_day, planet)
            except ValueError as e:
                logger.error(f"Failed to calculate position for {planet}: {e}")
                # Skip failed calculations rather than failing the entire batch
                continue
        
        return results
    
    def get_supported_planets(self) -> list[str]:
        """Get list of supported planet names."""
        return list(PLANET_MAPPING.keys())
    
    def is_healthy(self) -> bool:
        """Check if the service is healthy and ready to serve requests."""
        try:
            # Test basic ephemeris calculation
            test_jd = 2451545.0  # J2000.0
            self.calculate_position(test_jd, "sun")
            return True
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return False
