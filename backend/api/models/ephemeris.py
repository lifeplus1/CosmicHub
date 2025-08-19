"""
Pydantic models for ephemeris API endpoints.

These models define the request and response schemas for the ephemeris API,
ensuring type safety and validation for planetary position calculations.
"""

from datetime import datetime
from typing import List

from pydantic import BaseModel, Field


class PlanetPosition(BaseModel):
    """Position data for a planetary body."""

    position: float = Field(..., description="Position in degrees")
    retrograde: bool = Field(
        ..., description="Whether the planet is retrograde"
    )


class CalculationRequest(BaseModel):
    """Request model for planetary position calculation."""

    julian_day: float = Field(..., description="Julian Day Number")
    planet: str = Field(
        ..., description="Planet name (e.g., 'sun', 'moon', 'mercury')"
    )


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
        ..., description="List of calculations to perform"
    )


class BatchCalculationResponse(BaseModel):
    """Response model for batch planetary position calculations."""

    results: List[CalculationResponse] = Field(
        ..., description="List of calculation results"
    )
    calculation_time: datetime = Field(
        ..., description="UTC time of batch calculation"
    )


class EphemerisHealthResponse(BaseModel):
    """Response model for ephemeris health check."""

    status: str = Field(..., description="Service status")
    timestamp: datetime = Field(..., description="Health check timestamp")
    ephemeris_initialized: bool = Field(
        ..., description="Whether ephemeris is properly initialized"
    )
