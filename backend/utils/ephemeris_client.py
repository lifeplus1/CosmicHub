"""
Ephemeris client for communicating with the dedicated ephemeris server.

This module provides async HTTP client functionality to fetch planetary positions
and ephemeris data from the remote ephemeris server, with Redis caching support.
"""

import json
import logging
import os
from datetime import datetime
from types import TracebackType
from typing import Any, Dict, List, Optional, Type

import httpx
import redis.asyncio as redis  # type: ignore
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)


class PlanetPosition(BaseModel):
    """Position data for a planetary body."""

    position: float = Field(..., description="Position in degrees")
    retrograde: bool = Field(
        ..., description="Whether the planet is retrograde"
    )


class CalculationRequest(BaseModel):
    """Request model for planetary position calculation."""

    julian_day: float = Field(..., description="Julian Day Number")
    planet: str = Field(..., description="Planet name")


class CalculationResponse(BaseModel):
    """Response model for planetary position calculation."""

    planet: str = Field(..., description="Planet name")
    julian_day: float = Field(..., description="Julian Day Number")
    position: PlanetPosition = Field(..., description="Position data")
    calculation_time: datetime = Field(
        ..., description="UTC time of calculation"
    )


class BatchCalculationRequest(BaseModel):
    """Request model for batch planetary position calculations."""

    calculations: List[CalculationRequest] = Field(
        ..., description="List of calculations"
    )


class BatchCalculationResponse(BaseModel):
    """Response model for batch planetary position calculations."""

    results: List[CalculationResponse] = Field(
        ..., description="List of calculation results"
    )
    calculation_time: datetime = Field(
        ..., description="UTC time of batch calculation"
    )


class EphemerisClientError(Exception):
    """Custom exception for ephemeris client errors."""

    pass


class EphemerisClient:
    """
    Async HTTP client for the ephemeris server with caching support.
    """

    def __init__(
        self,
        server_url: Optional[str] = None,
        api_key: Optional[str] = None,
        redis_url: Optional[str] = None,
        timeout: float = 30.0,
        cache_ttl: int = 3600,
    ):
        """
        Initialize the ephemeris client.

        Args:
            server_url: Ephemeris server URL (defaults to env var EPHEMERIS_SERVER_URL)
            api_key: API key for authentication (defaults to env var API_KEY)
            redis_url: Redis URL for caching (defaults to env var REDIS_URL)
            timeout: HTTP request timeout in seconds
            cache_ttl: Cache TTL in seconds
        """
        self.server_url = server_url or os.getenv(
            "EPHEMERIS_SERVER_URL", "http://localhost:8001"
        )
        self.api_key = api_key or os.getenv("API_KEY")
        self.timeout = timeout
        self.cache_ttl = cache_ttl

        if not self.api_key:
            raise EphemerisClientError(
                "API key is required for ephemeris server authentication"
            )

        # Setup HTTP client
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        # Setup Redis client for caching
        self.redis_client = None
        if redis_url:
            try:
                self.redis_client = redis.from_url(redis_url, decode_responses=True)  # type: ignore[attr-defined]
                logger.info("Redis client initialized for ephemeris caching")
            except Exception as e:
                logger.warning(f"Failed to initialize Redis client: {e}")

    async def __aenter__(self) -> "EphemerisClient":
        """Async context manager entry."""
        self.http_client = httpx.AsyncClient(timeout=self.timeout)
        return self

    async def __aexit__(
        self,
        exc_type: Optional[Type[BaseException]],
        exc_val: Optional[BaseException],
        exc_tb: Optional[TracebackType],
    ) -> None:
        """Async context manager exit."""
        await self.http_client.aclose()
        if self.redis_client:
            await self.redis_client.close()

    def _get_cache_key(self, endpoint: str, params: str) -> str:
        """Generate cache key for request."""
        return f"ephe_client:{endpoint}:{params}"

    async def _get_from_cache(
        self, cache_key: str
    ) -> Optional[Dict[str, Any]]:
        """Get response from cache."""
        if not self.redis_client:
            return None

        try:
            cached_data = await self.redis_client.get(cache_key)
            if cached_data:
                return json.loads(cached_data)
        except Exception as e:
            logger.warning(f"Cache read error: {e}")

        return None

    async def _set_cache(self, cache_key: str, data: Dict[str, Any]) -> None:
        """Set response in cache."""
        if not self.redis_client:
            return

        try:
            await self.redis_client.setex(
                cache_key,
                self.cache_ttl,
                json.dumps(data, default=str),  # Handle datetime serialization
            )
        except Exception as e:
            logger.warning(f"Cache write error: {e}")

    async def _make_request(
        self, method: str, endpoint: str, **kwargs: Any
    ) -> Dict[str, Any]:
        """Make HTTP request to ephemeris server."""
        url = f"{self.server_url}{endpoint}"

        try:
            response = await self.http_client.request(
                method=method,
                url=url,
                headers=self.headers,
                **kwargs,  # type: ignore[arg-type]
            )
            response.raise_for_status()
            return response.json()

        except httpx.HTTPStatusError as e:
            logger.error(
                f"HTTP error {e.response.status_code}: {e.response.text}"
            )
            raise EphemerisClientError(
                f"HTTP {e.response.status_code}: {e.response.text}"
            )
        except httpx.RequestError as e:
            logger.error(f"Request error: {e}")
            raise EphemerisClientError(f"Request failed: {e}")
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            raise EphemerisClientError(f"Unexpected error: {e}")

    async def health_check(self) -> Dict[str, Any]:
        """Check ephemeris server health."""
        return await self._make_request("GET", "/health")

    async def calculate_position(
        self, julian_day: float, planet: str
    ) -> CalculationResponse:
        """
        Calculate planetary position for given Julian Day and planet.

        Args:
            julian_day: Julian Day Number
            planet: Planet name

        Returns:
            CalculationResponse with position data
        """
        # Check cache first
        cache_key = self._get_cache_key(
            "calculate", f"{julian_day}:{planet.lower()}"
        )
        cached_data = await self._get_from_cache(cache_key)

        if cached_data:
            logger.debug(f"Cache hit for {planet} at JD {julian_day}")
            return CalculationResponse(**cached_data)

        # Make API request
        request_data = CalculationRequest(julian_day=julian_day, planet=planet)
        response_data = await self._make_request(
            "POST", "/calculate", json=request_data.model_dump()
        )

        result = CalculationResponse(**response_data)

        # Cache the result
        await self._set_cache(cache_key, result.model_dump())

        logger.debug(
            f"Calculated {planet} position: {result.position.position:.6f}°"
        )
        return result

    async def calculate_batch_positions(
        self, calculations: List[CalculationRequest]
    ) -> BatchCalculationResponse:
        """
        Calculate multiple planetary positions in batch.

        Args:
            calculations: List of calculation requests

        Returns:
            BatchCalculationResponse with results
        """
        request_data = BatchCalculationRequest(calculations=calculations)
        response_data = await self._make_request(
            "POST", "/calculate/batch", json=request_data.model_dump()
        )

        result = BatchCalculationResponse(**response_data)

        # Cache individual results
        for calc_result in result.results:
            cache_key = self._get_cache_key(
                "calculate", f"{calc_result.julian_day}:{calc_result.planet}"
            )
            await self._set_cache(cache_key, calc_result.model_dump())

        logger.debug(f"Batch calculated {len(result.results)} positions")
        return result

    async def get_supported_planets(self) -> List[str]:
        """Get list of supported planets from ephemeris server."""
        response = await self._make_request("GET", "/planets")
        # The response should be a list of strings
        if isinstance(response, list):
            return response  # type: ignore[return-value]
        else:
            # If the response is wrapped in a dict, extract the list
            return response.get("planets", [])  # type: ignore[return-value]

    async def fetch_ephemeris_data(self, filename: str) -> bytes:
        """
        Fetch ephemeris file data from server.

        Args:
            filename: Name of the ephemeris file

        Returns:
            Raw file data as bytes
        """
        url = f"{self.server_url}/ephemeris/{filename}"

        try:
            response = await self.http_client.get(url, headers=self.headers)
            response.raise_for_status()
            return response.content

        except httpx.HTTPStatusError as e:
            logger.error(
                f"HTTP error fetching {filename}: {e.response.status_code}"
            )
            raise EphemerisClientError(
                f"Failed to fetch {filename}: HTTP {e.response.status_code}"
            )
        except Exception as e:
            logger.error(f"Error fetching {filename}: {e}")
            raise EphemerisClientError(f"Failed to fetch {filename}: {e}")


# Convenience functions for backward compatibility
async def get_planetary_positions(
    julian_day: float,
) -> Dict[str, PlanetPosition]:
    """
    Get all planetary positions for a given Julian Day.
    This function provides backward compatibility with the existing ephemeris module.

    Args:
        julian_day: Julian Day Number

    Returns:
        Dictionary with planet names as keys and PlanetPosition as values
    """
    planets = [
        "sun",
        "moon",
        "mercury",
        "venus",
        "mars",
        "jupiter",
        "saturn",
        "uranus",
        "neptune",
        "pluto",
        "chiron",
        "ceres",
        "pallas",
        "juno",
        "vesta",
    ]

    async with EphemerisClient() as client:
        calculations = [
            CalculationRequest(julian_day=julian_day, planet=planet)
            for planet in planets
        ]

        try:
            batch_response = await client.calculate_batch_positions(
                calculations
            )

            result: Dict[str, PlanetPosition] = {}
            for calc_result in batch_response.results:
                result[calc_result.planet] = calc_result.position

            return result

        except Exception as e:
            logger.error(f"Error getting planetary positions: {e}")
            # Return empty dict as fallback (matches original behavior)
            return {}


async def calculate_single_position(
    julian_day: float, planet: str
) -> Optional[PlanetPosition]:
    """
    Calculate position for a single planet.

    Args:
        julian_day: Julian Day Number
        planet: Planet name

    Returns:
        PlanetPosition or None if calculation fails
    """
    try:
        async with EphemerisClient() as client:
            result = await client.calculate_position(julian_day, planet)
            return result.position
    except Exception as e:
        logger.error(f"Error calculating position for {planet}: {e}")
        return None
