# backend/astro/calculations/ephemeris.py
"""
Ephemeris calculations module - Updated to use remote ephemeris server.

This module now proxies ephemeris calculations to the dedicated ephemeris server
for improved performance, scalability, and modularity.
"""

import os
import logging
import asyncio
from typing import Dict, Final, Any
from utils.ephemeris_client import (
    get_planetary_positions as remote_get_planetary_positions,
    calculate_single_position,
    PlanetPosition as RemotePlanetPosition,
    EphemerisClient
)

logger = logging.getLogger(__name__)

# Type-safe constants for planetary bodies (kept for backward compatibility)
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

# Legacy type definition for backward compatibility
class PlanetPosition(dict):
    """Legacy planet position type for backward compatibility."""
    
    def __init__(self, position: float, retrograde: bool):
        super().__init__()
        self['position'] = position
        self['retrograde'] = retrograde
    
    @property
    def position(self) -> float:
        return self['position']
    
    @property
    def retrograde(self) -> bool:
        return self['retrograde']

# Global variable to track if ephemeris has been initialized (kept for compatibility)
_ephemeris_initialized = True  # Always True for remote client

def init_ephemeris() -> None:
    """
    Initialize ephemeris (no-op for remote client).
    Kept for backward compatibility.
    """
    global _ephemeris_initialized
    if _ephemeris_initialized:
        return
        
    logger.debug("Ephemeris client initialization (remote mode)")
    _ephemeris_initialized = True

# Initialize ephemeris when module is imported
init_ephemeris()

def get_planetary_positions(julian_day: float) -> Dict[str, PlanetPosition]:
    """
    Calculate planetary positions for given Julian Day.
    
    This function maintains backward compatibility while using the remote ephemeris server.
    
    Args:
        julian_day: Julian Day Number as float
        
    Returns:
        Dictionary with planet names as keys and position data as values.
        Each planet entry contains 'position' (degrees) and 'retrograde' (boolean).
    """
    logger.debug(f"Calculating planetary positions for JD: {julian_day} (remote)")
    
    try:
        # Use async client in sync context
        loop = None
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
        
        # Get positions from remote server
        remote_positions = loop.run_until_complete(
            remote_get_planetary_positions(julian_day)
        )
        
        # Convert to legacy format for backward compatibility
        positions = {}
        for planet, remote_pos in remote_positions.items():
            positions[planet] = PlanetPosition(
                position=remote_pos.position,
                retrograde=remote_pos.retrograde
            )
        
        logger.debug(f"Remote planetary positions: {len(positions)} planets calculated")
        return positions
        
    except Exception as e:
        logger.error(f"Error in remote planetary positions: {str(e)}", exc_info=True)
        return {}  # Fallback to empty dict

async def get_planetary_positions_async(julian_day: float) -> Dict[str, PlanetPosition]:
    """
    Async version of get_planetary_positions for better performance.
    
    Args:
        julian_day: Julian Day Number as float
        
    Returns:
        Dictionary with planet names as keys and position data as values.
    """
    logger.debug(f"Calculating planetary positions async for JD: {julian_day}")
    
    try:
        # Get positions from remote server
        remote_positions = await remote_get_planetary_positions(julian_day)
        
        # Convert to legacy format for backward compatibility
        positions = {}
        for planet, remote_pos in remote_positions.items():
            positions[planet] = PlanetPosition(
                position=remote_pos.position,
                retrograde=remote_pos.retrograde
            )
        
        logger.debug(f"Remote planetary positions async: {len(positions)} planets calculated")
        return positions
        
    except Exception as e:
        logger.error(f"Error in async planetary positions: {str(e)}", exc_info=True)
        return {}  # Fallback to empty dict

def calculate_planet_position(julian_day: float, planet: str) -> Dict[str, Any]:
    """
    Calculate position for a single planet.
    
    Args:
        julian_day: Julian Day Number
        planet: Planet name
        
    Returns:
        Dictionary with position and retrograde status, or empty dict on error
    """
    logger.debug(f"Calculating position for {planet} at JD: {julian_day} (remote)")
    
    try:
        # Use async client in sync context
        loop = None
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
        
        # Get position from remote server
        remote_position = loop.run_until_complete(
            calculate_single_position(julian_day, planet)
        )
        
        if remote_position:
            result = {
                'position': remote_position.position,
                'retrograde': remote_position.retrograde
            }
            logger.debug(f"Remote position for {planet}: {result}")
            return result
        else:
            logger.warning(f"No position returned for {planet}")
            return {}
            
    except Exception as e:
        logger.error(f"Error calculating position for {planet}: {str(e)}", exc_info=True)
        return {}

async def calculate_planet_position_async(julian_day: float, planet: str) -> Dict[str, Any]:
    """
    Async version of calculate_planet_position for better performance.
    
    Args:
        julian_day: Julian Day Number
        planet: Planet name
        
    Returns:
        Dictionary with position and retrograde status, or empty dict on error
    """
    logger.debug(f"Calculating position async for {planet} at JD: {julian_day}")
    
    try:
        # Get position from remote server
        remote_position = await calculate_single_position(julian_day, planet)
        
        if remote_position:
            result = {
                'position': remote_position.position,
                'retrograde': remote_position.retrograde
            }
            logger.debug(f"Remote position async for {planet}: {result}")
            return result
        else:
            logger.warning(f"No position returned for {planet}")
            return {}
            
    except Exception as e:
        logger.error(f"Error calculating async position for {planet}: {str(e)}", exc_info=True)
        return {}

async def health_check() -> bool:
    """
    Check if the ephemeris service is healthy and accessible.
    
    Returns:
        True if service is healthy, False otherwise
    """
    try:
        async with EphemerisClient() as client:
            health_data = await client.health_check()
            return health_data.get('status') == 'healthy'
    except Exception as e:
        logger.error(f"Ephemeris health check failed: {e}")
        return False