# backend/api/bridges/__init__.py
"""
Type Bridge System for CosmicHub Backend APIs
Centralized type-safe conversion between raw engine data and API response types
"""

from .tcm_type_bridge import (
    TCMTypeBridge,
    to_analytics_flat_schema,
    BridgeError,
    VALID_ELEMENTS,
    DEFAULT_ELEMENTAL_BALANCE,
)

from .astrology_type_bridge import (
    AstrologyTypeBridge,
    safe_convert_chart,
    safe_validate_birth_data
)

from .psychology_type_bridge import (
    PsychologyTypeBridge
)

from .synastry_type_bridge import (
    SynastryTypeBridge
)

__all__ = [
    # TCM System Bridges
    'TCMTypeBridge',
    'to_analytics_flat_schema',
    'BridgeError',
    'VALID_ELEMENTS',
    'DEFAULT_ELEMENTAL_BALANCE',
    
    # Astrology System Bridges
    'AstrologyTypeBridge', 
    'safe_convert_chart',
    'safe_validate_birth_data',
    
    # Psychology System Bridges
    'PsychologyTypeBridge',
    
    # Synastry System Bridges
    'SynastryTypeBridge',
]

# Version info
__version__ = "1.0.0"
__author__ = "CosmicHub Development Team"
__description__ = "Type-safe bridges for astrological and TCM calculation systems"
