"""
Ephemeris API router for proxying requests to the dedicated ephemeris server.

This router provides endpoints for the frontend to access ephemeris calculations
through the backend, which then forwards requests to the ephemeris microservice.
"""

import logging
from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException, status

from utils.ephemeris_client import EphemerisClient, EphemerisClientError

from ..models.ephemeris import (
    BatchCalculationRequest,
    BatchCalculationResponse,
    CalculationRequest,
    CalculationResponse,
    EphemerisHealthResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ephemeris", tags=["ephemeris"])


@router.get("/health", response_model=EphemerisHealthResponse)
async def health_check():
    """
    Check ephemeris service health.

    Returns:
        Health status of the ephemeris service
    """
    try:
        async with EphemerisClient() as client:
            health_data = await client.health_check()
            return EphemerisHealthResponse(**health_data)
    except EphemerisClientError as e:
        logger.error(f"Ephemeris health check failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Ephemeris service unavailable: {str(e)}",
        )
    except Exception as e:
        logger.error(f"Unexpected error in health check: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )


@router.post("/calculate", response_model=CalculationResponse)
async def calculate_position(request: CalculationRequest):
    """
    Calculate planetary position for given Julian Day and planet.

    Args:
        request: Calculation request with julian_day and planet

    Returns:
        Calculation response with position data
    """
    try:
        async with EphemerisClient() as client:
            result = await client.calculate_position(
                request.julian_day, request.planet
            )
            return CalculationResponse(**result.model_dump())
    except EphemerisClientError as e:
        logger.error(f"Ephemeris calculation failed: {e}")
        if "Invalid planet" in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Ephemeris service error: {str(e)}",
            )
    except Exception as e:
        logger.error(f"Unexpected error in calculation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )


@router.post("/calculate/batch", response_model=BatchCalculationResponse)
async def calculate_batch_positions(request: BatchCalculationRequest):
    """
    Calculate multiple planetary positions in batch.

    Args:
        request: Batch calculation request with list of calculations

    Returns:
        Batch calculation response with results
    """
    try:
        async with EphemerisClient() as client:
            # Convert Pydantic models to client models - use import directly
            from utils.ephemeris_client import (
                CalculationRequest as ClientCalculationRequest,
            )

            calculations = [
                ClientCalculationRequest(
                    julian_day=calc.julian_day, planet=calc.planet
                )
                for calc in request.calculations
            ]

            result = await client.calculate_batch_positions(calculations)
            return BatchCalculationResponse(**result.model_dump())
    except EphemerisClientError as e:
        logger.error(f"Ephemeris batch calculation failed: {e}")
        if "exceeds maximum" in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Ephemeris service error: {str(e)}",
            )
    except Exception as e:
        logger.error(f"Unexpected error in batch calculation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )


@router.get("/planets", response_model=List[str])
async def get_supported_planets():
    """
    Get list of supported planets/celestial bodies.

    Returns:
        List of supported planet names
    """
    try:
        async with EphemerisClient() as client:
            planets = await client.get_supported_planets()
            return planets
    except EphemerisClientError as e:
        logger.error(f"Failed to get supported planets: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Ephemeris service error: {str(e)}",
        )
    except Exception as e:
        logger.error(f"Unexpected error getting planets: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )


@router.get("/positions/{julian_day}", response_model=Dict[str, Any])
async def get_all_planetary_positions(julian_day: float) -> Dict[str, Any]:
    """
    Get all planetary positions for a specific Julian Day.

    Args:
        julian_day: Julian Day Number

    Returns:
        Dictionary with planet names as keys and position data as values
    """
    try:
        async with EphemerisClient() as client:
            # Get list of supported planets
            planets = await client.get_supported_planets()

            # Create batch request for all planets
            from utils.ephemeris_client import (
                CalculationRequest as ClientCalculationRequest,
            )

            calculations = [
                ClientCalculationRequest(julian_day=julian_day, planet=planet)
                for planet in planets
            ]

            batch_result = await client.calculate_batch_positions(calculations)

            # Convert to dictionary format
            positions: Dict[str, Dict[str, Any]] = {}
            for result in batch_result.results:
                positions[result.planet] = {
                    "position": result.position.position,
                    "retrograde": result.position.retrograde,
                }

            return_data: Dict[str, Any] = {
                "julian_day": julian_day,
                "positions": positions,
                "calculation_time": batch_result.calculation_time,
            }

            return return_data
    except EphemerisClientError as e:
        logger.error(f"Failed to get all planetary positions: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Ephemeris service error: {str(e)}",
        )
    except Exception as e:
        logger.error(f"Unexpected error getting all positions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )
