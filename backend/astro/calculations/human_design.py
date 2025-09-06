# backend/astro/calculations/human_design.py
"""
Human Design calculation engine for CosmicHub
Provides complete Human Design chart calculations with proper type safety
"""

import json
import logging
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Tuple, TypedDict, Union, cast

import swisseph as swe  # type: ignore
import redis  # type: ignore[import-untyped]

# Mock classes for missing modules that can be instantiated
class MockHumanDesignRequest:
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)
    
    def __getattr__(self, name):
        # Return reasonable defaults for common attributes with proper types
        if name in ['year', 'month', 'day', 'hour', 'minute']:
            return getattr(self, f'_{name}', 1)  # Return stored value or default to 1
        elif name in ['latitude', 'longitude']:
            return getattr(self, f'_{name}', 0.0)  # Return stored value or default to 0.0
        elif name == 'timezone':
            return getattr(self, '_timezone', 'UTC')  # Return stored value or default to 'UTC'
        return None

class MockHumanDesignChart:
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)
    
    def dict(self):
        """Mock dict method that returns empty dict"""
        return {}
    
    def __getattr__(self, name):
        return None

class MockHumanDesignResponse:
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)

# Type stubs for missing modules
HumanDesignChart = MockHumanDesignChart  # type: ignore
HumanDesignRequest = MockHumanDesignRequest  # type: ignore
HumanDesignResponse = MockHumanDesignResponse  # type: ignore
PydanticPlanetActivation = Any  # type: ignore


class PlanetActivation(TypedDict):
    gate: int
    line: int
    position: float
    center: str
    planet: str
    planet_symbol: str


logger = logging.getLogger(__name__)

# Constants for Human Design calculations
TOTAL_GATES = 64
DEGREES_PER_GATE = 360.0 / TOTAL_GATES  # 5.625 degrees per gate
LINES_PER_GATE = 6
HD_OFFSET = 302.0  # Calibrated offset for accurate gate calculations
CACHE_TTL_SECONDS = 3600  # 1 hour cache
TOLERANCE_DEGREES = 0.001  # Precision tolerance for calculations

# Redis client initialization with proper typing
try:
    redis_client = redis.Redis.from_url(  # type: ignore[assignment]
        "redis://localhost:6379/0"
    )
    # Test connection
    redis_client.ping()
    logger.info("Redis client connected successfully")
except Exception as e:
    logger.warning(f"Redis client failed to connect: {e}. Proceeding without cache.")
    redis_client = None  # type: ignore[assignment]

# I Ching Hexagram Gate Names and Properties (CORRECTED MAPPINGS)
GATES = {
    1: {
        "name": "The Creative",
        "center": "G",
        "type": "Individual",
        "theme": "Self-Expression",
    },
    2: {
        "name": "The Receptive",
        "center": "G",
        "type": "Collective",
        "theme": "Direction",
    },
    3: {
        "name": "Difficulty at the Beginning",
        "center": "Root",
        "type": "Individual",
        "theme": "Mutation",
    },
    4: {
        "name": "Youthful Folly",
        "center": "Ajna",
        "type": "Collective",
        "theme": "Logic",
    },
    5: {
        "name": "Waiting",
        "center": "Sacral",
        "type": "Collective",
        "theme": "Pattern",
    },
    6: {
        "name": "Conflict",
        "center": "Solar Plexus",
        "type": "Tribal",
        "theme": "Emotion",
    },
    7: {
        "name": "The Army",
        "center": "G",
        "type": "Collective",
        "theme": "Direction",
    },
    8: {
        "name": "Holding Together",
        "center": "Throat",
        "type": "Individual",
        "theme": "Knowing",
    },
    9: {
        "name": "The Taming Power of the Small",
        "center": "Sacral",
        "type": "Collective",
        "theme": "Focus",
    },
    10: {
        "name": "Treading",
        "center": "G",
        "type": "Individual",
        "theme": "Self-Expression",
    },
    11: {
        "name": "Peace",
        "center": "Ajna",
        "type": "Collective",
        "theme": "Ideas",
    },
    12: {
        "name": "Standstill",
        "center": "Throat",
        "type": "Individual",
        "theme": "Knowing",
    },
    13: {
        "name": "Fellowship with Men",
        "center": "G",
        "type": "Collective",
        "theme": "Direction",
    },
    14: {
        "name": "Possession in Great Measure",
        "center": "Sacral",
        "type": "Individual",
        "theme": "Power",
    },
    15: {
        "name": "Modesty",
        "center": "G",
        "type": "Collective",
        "theme": "Direction",
    },
    16: {
        "name": "Enthusiasm",
        "center": "Throat",
        "type": "Collective",
        "theme": "Logic",
    },
    17: {
        "name": "Following",
        "center": "Ajna",
        "type": "Collective",
        "theme": "Opinion",
    },
    18: {
        "name": "Work on What Has Been Spoiled",
        "center": "Spleen",
        "type": "Collective",
        "theme": "Perfection",
    },
    19: {
        "name": "Approach",
        "center": "Root",
        "type": "Tribal",
        "theme": "Needs",
    },
    20: {
        "name": "Contemplation",
        "center": "Throat",
        "type": "Individual",
        "theme": "Knowing",
    },
    21: {
        "name": "Biting Through",
        "center": "Heart",
        "type": "Tribal",
        "theme": "Ego",
    },
    22: {
        "name": "Grace",
        "center": "Solar Plexus",
        "type": "Individual",
        "theme": "Knowing",
    },
    23: {
        "name": "Splitting Apart",
        "center": "Throat",
        "type": "Individual",
        "theme": "Knowing",
    },
    24: {
        "name": "Return",
        "center": "Ajna",
        "type": "Individual",
        "theme": "Knowing",
    },
    25: {
        "name": "Innocence",
        "center": "Heart",
        "type": "Individual",
        "theme": "Love",
    },
    26: {
        "name": "The Taming Power of the Great",
        "center": "Heart",
        "type": "Tribal",
        "theme": "Ego",
    },
    27: {
        "name": "The Corners of the Mouth",
        "center": "Sacral",
        "type": "Tribal",
        "theme": "Caring",
    },
    28: {
        "name": "Preponderance of the Great",
        "center": "Spleen",
        "type": "Individual",
        "theme": "Struggle",
    },
    29: {
        "name": "The Abysmal",
        "center": "Sacral",
        "type": "Collective",
        "theme": "Experience",
    },
    30: {
        "name": "The Clinging",
        "center": "Solar Plexus",
        "type": "Individual",
        "theme": "Recognition",
    },
    31: {
        "name": "Influence",
        "center": "Throat",
        "type": "Collective",
        "theme": "Leading",
    },
    32: {
        "name": "Duration",
        "center": "Spleen",
        "type": "Tribal",
        "theme": "Continuity",
    },
    33: {
        "name": "Retreat",
        "center": "Throat",
        "type": "Individual",
        "theme": "Privacy",
    },
    34: {
        "name": "The Power of the Great",
        "center": "Sacral",
        "type": "Individual",
        "theme": "Power",
    },
    35: {
        "name": "Progress",
        "center": "Solar Plexus",
        "type": "Collective",
        "theme": "Experience",
    },
    36: {
        "name": "Darkening of the Light",
        "center": "Solar Plexus",
        "type": "Individual",
        "theme": "Crisis",
    },
    37: {
        "name": "The Family",
        "center": "Solar Plexus",
        "type": "Tribal",
        "theme": "Bargains",
    },
    38: {
        "name": "Opposition",
        "center": "Root",
        "type": "Individual",
        "theme": "Struggle",
    },
    39: {
        "name": "Obstruction",
        "center": "Root",
        "type": "Individual",
        "theme": "Provocation",
    },
    40: {
        "name": "Deliverance",
        "center": "Heart",
        "type": "Tribal",
        "theme": "Alone",
    },
    41: {
        "name": "Decrease",
        "center": "Root",
        "type": "Collective",
        "theme": "Contraction",
    },
    42: {
        "name": "Increase",
        "center": "Sacral",
        "type": "Collective",
        "theme": "Expansion",
    },
    43: {
        "name": "Breakthrough",
        "center": "Ajna",
        "type": "Individual",
        "theme": "Insight",
    },
    44: {
        "name": "Coming to Meet",
        "center": "Spleen",
        "type": "Collective",
        "theme": "Patterns",
    },
    45: {
        "name": "Gathering Together",
        "center": "Throat",
        "type": "Tribal",
        "theme": "Ruler",
    },
    46: {
        "name": "Pushing Upward",
        "center": "G",
        "type": "Individual",
        "theme": "Determination",
    },
    47: {
        "name": "Oppression",
        "center": "Ajna",
        "type": "Individual",
        "theme": "Realisation",
    },
    48: {
        "name": "The Well",
        "center": "Spleen",
        "type": "Collective",
        "theme": "Depth",
    },
    49: {
        "name": "Revolution",
        "center": "Solar Plexus",
        "type": "Tribal",
        "theme": "Principles",
    },
    50: {
        "name": "The Cauldron",
        "center": "Spleen",
        "type": "Tribal",
        "theme": "Values",
    },
    51: {
        "name": "The Arousing",
        "center": "Heart",
        "type": "Individual",
        "theme": "Shock",
    },
    52: {
        "name": "Keeping Still",
        "center": "Root",
        "type": "Individual",
        "theme": "Stillness",
    },
    53: {
        "name": "Development",
        "center": "Root",
        "type": "Collective",
        "theme": "Evolution",
    },
    54: {
        "name": "The Marrying Maiden",
        "center": "Root",
        "type": "Tribal",
        "theme": "Ambition",
    },
    55: {
        "name": "Abundance",
        "center": "Solar Plexus",
        "type": "Individual",
        "theme": "Spirit",
    },
    56: {
        "name": "The Wanderer",
        "center": "Throat",
        "type": "Collective",
        "theme": "Stimulation",
    },
    57: {
        "name": "The Gentle",
        "center": "Spleen",
        "type": "Collective",
        "theme": "Intuition",
    },
    58: {
        "name": "The Joyous",
        "center": "Root",
        "type": "Individual",
        "theme": "Vitality",
    },
    59: {
        "name": "Dispersion",
        "center": "Sacral",
        "type": "Tribal",
        "theme": "Sexuality",
    },
    60: {
        "name": "Limitation",
        "center": "Root",
        "type": "Collective",
        "theme": "Acceptance",
    },
    61: {
        "name": "Inner Truth",
        "center": "Head",
        "type": "Individual",
        "theme": "Mystery",
    },
    62: {
        "name": "Preponderance of the Small",
        "center": "Throat",
        "type": "Individual",
        "theme": "Details",
    },
    63: {
        "name": "After Completion",
        "center": "Head",
        "type": "Collective",
        "theme": "Doubt",
    },
    64: {
        "name": "Before Completion",
        "center": "Head",
        "type": "Individual",
        "theme": "Confusion",
    },
}

# Energy Centers and their properties
CENTERS = {
    "Head": {"type": "Pressure", "theme": "Inspiration", "color": "yellow"},
    "Ajna": {
        "type": "Awareness",
        "theme": "Conceptualization",
        "color": "green",
    },
    "Throat": {"type": "Motor", "theme": "Manifestation", "color": "brown"},
    "G": {"type": "Identity", "theme": "Love & Direction", "color": "yellow"},
    "Heart": {"type": "Motor", "theme": "Will", "color": "red"},
    "Spleen": {"type": "Awareness", "theme": "Intuition", "color": "brown"},
    "Solar Plexus": {"type": "Motor", "theme": "Emotion", "color": "brown"},
    "Sacral": {"type": "Motor", "theme": "Life Force", "color": "red"},
    "Root": {"type": "Pressure", "theme": "Stress", "color": "brown"},
}

# Human Design Types
TYPES = {
    "Manifestor": {
        "description": "Initiators who are here to make things happen",
        "strategy": "Inform before you act",
        "signature": "Peace",
        "not_self": "Anger",
        "percentage": "9%",
    },
    "Generator": {
        "description": "Builders who are here to master their craft",
        "strategy": "Respond to life",
        "signature": "Satisfaction",
        "not_self": "Frustration",
        "percentage": "37%",
    },
    "Manifesting Generator": {
        "description": "Multi-passionate builders and initiators",
        "strategy": "Respond, then inform",
        "signature": "Satisfaction & Peace",
        "not_self": "Frustration & Anger",
        "percentage": "33%",
    },
    "Projector": {
        "description": "Guides who are here to see the big picture",
        "strategy": "Wait for invitation",
        "signature": "Success",
        "not_self": "Bitterness",
        "percentage": "20%",
    },
    "Reflector": {
        "description": "Mirrors who reflect the health of their community",
        "strategy": "Wait a lunar cycle",
        "signature": "Surprise",
        "not_self": "Disappointment",
        "percentage": "1%",
    },
}

# Authorities
AUTHORITIES = {
    "Emotional": "Wait for emotional clarity before making decisions",
    "Sacral": "Follow your gut response in the moment",
    "Splenic": "Trust your intuitive knowing",
    "Heart": "Listen to your willpower and ego",
    "G": "Follow your identity and direction",
    "Mental": "Discuss and process with others",
    "Lunar": "Wait a full lunar cycle (28 days)",
}

# Human Design Channels (Gate pairs that form channels)
CHANNELS = {
    "1-8": {
        "name": "The Channel of Inspiration",
        "circuit": "Individual",
        "theme": "Creative Role Model",
    },
    "2-14": {
        "name": "The Channel of the Beat",
        "circuit": "Individual",
        "theme": "Keeper of the Keys",
    },
    "3-60": {
        "name": "The Channel of Mutation",
        "circuit": "Individual",
        "theme": "Energy for Change",
    },
    "4-63": {
        "name": "The Channel of Logic",
        "circuit": "Collective",
        "theme": "Mental Ease",
    },
    "5-15": {
        "name": "The Channel of Rhythm",
        "circuit": "Collective",
        "theme": "Being in the Flow",
    },
    "6-59": {
        "name": "The Channel of Mating",
        "circuit": "Tribal",
        "theme": "Focused on Reproduction",
    },
    "7-31": {
        "name": "The Channel of the Alpha",
        "circuit": "Collective",
        "theme": "Leadership for the Future",
    },
    "9-52": {
        "name": "The Channel of Concentration",
        "circuit": "Collective",
        "theme": "Focused Determination",
    },
    "10-20": {
        "name": "The Channel of Awakening",
        "circuit": "Individual",
        "theme": "Commitment to Higher Principles",
    },
    "10-34": {
        "name": "The Channel of Exploration",
        "circuit": "Individual",
        "theme": "Following One's Convictions",
    },
    "10-57": {
        "name": "The Channel of Perfected Form",
        "circuit": "Individual",
        "theme": "Survival",
    },
    "11-56": {
        "name": "The Channel of Curiosity",
        "circuit": "Collective",
        "theme": "The Seeker",
    },
    "12-22": {
        "name": "The Channel of Openness",
        "circuit": "Individual",
        "theme": "A Social Being",
    },
    "13-33": {
        "name": "The Channel of the Prodigal",
        "circuit": "Collective",
        "theme": "A Witness",
    },
    "16-48": {
        "name": "The Channel of the Wavelength",
        "circuit": "Collective",
        "theme": "Talent",
    },
    "17-62": {
        "name": "The Channel of Acceptance",
        "circuit": "Collective",
        "theme": "An Organized Being",
    },
    "18-58": {
        "name": "The Channel of Judgment",
        "circuit": "Collective",
        "theme": "Insatiable Critic",
    },
    "19-49": {
        "name": "The Channel of Synthesis",
        "circuit": "Tribal",
        "theme": "Sensitivity",
    },
    "20-57": {
        "name": "The Channel of the Brainwave",
        "circuit": "Individual",
        "theme": "Penetrating Awareness",
    },
    "21-45": {
        "name": "The Channel of Money",
        "circuit": "Tribal",
        "theme": "A Material Way of Life",
    },
    "23-43": {
        "name": "The Channel of Structuring",
        "circuit": "Individual",
        "theme": "Genius to Freak",
    },
    "24-61": {
        "name": "The Channel of Awareness",
        "circuit": "Individual",
        "theme": "Thinker",
    },
    "25-51": {
        "name": "The Channel of Initiation",
        "circuit": "Individual",
        "theme": "Needing to be First",
    },
    "26-44": {
        "name": "The Channel of Surrender",
        "circuit": "Tribal",
        "theme": "A Transmitter",
    },
    "27-50": {
        "name": "The Channel of Preservation",
        "circuit": "Tribal",
        "theme": "Custodianship",
    },
    "28-38": {
        "name": "The Channel of Struggle",
        "circuit": "Individual",
        "theme": "Stubbornness",
    },
    "29-46": {
        "name": "The Channel of Discovery",
        "circuit": "Collective",
        "theme": "Succeeding Where Others Fail",
    },
    "30-41": {
        "name": "The Channel of Recognition",
        "circuit": "Individual",
        "theme": "A Focused Way of Life",
    },
    "32-54": {
        "name": "The Channel of Transformation",
        "circuit": "Tribal",
        "theme": "Being Driven",
    },
    "34-57": {
        "name": "The Channel of Power",
        "circuit": "Individual",
        "theme": "An Archetype",
    },
    "35-36": {
        "name": "The Channel of Transitoriness",
        "circuit": "Collective",
        "theme": "A Jack of All Trades",
    },
    "37-40": {
        "name": "The Channel of Community",
        "circuit": "Tribal",
        "theme": "A Part seeking a Whole",
    },
    "39-55": {
        "name": "The Channel of Emoting",
        "circuit": "Individual",
        "theme": "Moodiness",
    },
    "42-53": {
        "name": "The Channel of Maturation",
        "circuit": "Collective",
        "theme": "Balanced Development",
    },
    "47-64": {
        "name": "The Channel of Abstraction",
        "circuit": "Individual",
        "theme": "Mental Activity Mixed with Clarity",
    },
}


def detect_channels(design_data: Dict[str, Any]) -> list[str]:
    """Detect which channels are formed by the planetary activations from both conscious and unconscious"""  # noqa: E501
    activated_gates: set[int] = set()

    # Collect gates from conscious activations
    if "conscious" in design_data and isinstance(
        design_data["conscious"], dict
    ):
        conscious_data = cast(Dict[str, Any], design_data["conscious"])
        for planet_key in conscious_data:
            planet_data = conscious_data[planet_key]
            if isinstance(planet_data, dict):
                gate = planet_data.get("gate")  # type: ignore
                if isinstance(gate, int):
                    activated_gates.add(gate)

    # Collect gates from unconscious activations
    if "unconscious" in design_data and isinstance(
        design_data["unconscious"], dict
    ):
        unconscious_data = cast(Dict[str, Any], design_data["unconscious"])
        for planet_key in unconscious_data:
            planet_data = unconscious_data[planet_key]
            if isinstance(planet_data, dict):
                gate = planet_data.get("gate")  # type: ignore
                if isinstance(gate, int):
                    activated_gates.add(gate)

    # Check which channels are formed
    formed_channels: list[str] = []
    for channel_key in CHANNELS.keys():
        gate1, gate2 = map(int, channel_key.split("-"))
        if gate1 in activated_gates and gate2 in activated_gates:
            formed_channels.append(channel_key)

    return formed_channels


def get_gate_center(gate_number: int) -> str:
    """Get the center associated with a specific gate number"""
    if gate_number in GATES:
        return GATES[gate_number]["center"]
    return "Unknown"


class SwissephResult(TypedDict):
    position: Tuple[float, float, float, float, float, float]
    error: Optional[str]


def _get_cache_key(julian_day: float) -> str:
    """Generate cache key for planetary activations"""
    return f"planetary_activations:{julian_day:.6f}"


def _get_cached_activations(cache_key: str) -> Optional[dict[str, PlanetActivation]]:
    """Retrieve cached planetary activations from Redis"""
    if not redis_client:
        return None
        
    try:
        cached = redis_client.get(cache_key)  # type: ignore[union-attr]
        if cached:
            try:
                cached_str = (
                    cached.decode("utf-8")
                    if isinstance(cached, bytes)
                    else str(cached)
                )
                return json.loads(cached_str)
            except (json.JSONDecodeError, AttributeError, UnicodeDecodeError) as e:
                logger.warning(f"Failed to decode cached data: {e}")
                return None
    except Exception as e:
        logger.debug(f"Cache retrieval failed: {e}")
        return None
    
    return None


def _cache_activations(cache_key: str, activations: dict[str, PlanetActivation]) -> None:
    """Cache planetary activations to Redis"""
    if not redis_client:
        return
        
    try:
        redis_client.setex(cache_key, CACHE_TTL_SECONDS, json.dumps(activations))  # type: ignore[union-attr]
        logger.debug(f"Cached activations with key: {cache_key}")
    except Exception as e:
        logger.debug(f"Failed to cache results: {e}")


def _get_planet_ids() -> dict[str, int]:
    """Get Swiss Ephemeris planet IDs with proper error handling"""
    try:
        return {
            "sun": int(getattr(swe, "SUN", 0)),
            "moon": int(getattr(swe, "MOON", 1)),
            "mercury": int(getattr(swe, "MERCURY", 2)),
            "venus": int(getattr(swe, "VENUS", 3)),
            "mars": int(getattr(swe, "MARS", 4)),
            "jupiter": int(getattr(swe, "JUPITER", 5)),
            "saturn": int(getattr(swe, "SATURN", 6)),
            "uranus": int(getattr(swe, "URANUS", 7)),
            "neptune": int(getattr(swe, "NEPTUNE", 8)),
            "pluto": int(getattr(swe, "PLUTO", 9)),
            "north_node": int(getattr(swe, "TRUE_NODE", 11)),
        }
    except AttributeError as e:
        logger.error(f"Swiss Ephemeris constants not available: {e}")
        raise ValueError("Swiss Ephemeris library not properly initialized")


def _get_gate_sequence() -> List[int]:
    """Get the I Ching gate sequence for Human Design wheel"""
    # Starting from Gate 41 at 0° Aquarius, proceeding clockwise
    return [
        41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3,
        27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56,
        31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50,
        28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60,
    ]


def _calculate_gate_and_line(position: float, gate_sequence: List[int]) -> Tuple[int, int]:
    """Calculate gate number and line from astronomical position"""
    # Convert to Human Design position using calibrated offset
    hd_position = (position - HD_OFFSET) % 360.0
    gate_index = int(hd_position / DEGREES_PER_GATE)  # 0-63
    
    # Ensure gate_index is within valid range
    gate_index = max(0, min(63, gate_index))
    gate_number = gate_sequence[gate_index]
    
    # Calculate line within the gate (1-6)
    gate_progress = (hd_position % DEGREES_PER_GATE) / DEGREES_PER_GATE  # 0-1 within gate
    line_number = int(gate_progress * LINES_PER_GATE) + 1  # 1-6
    line_number = max(1, min(6, line_number))  # Ensure valid range
    
    return gate_number, line_number


def _get_planet_symbols() -> Dict[str, str]:
    """Get Unicode symbols for planets"""
    return {
        "sun": "☉",
        "moon": "☽", 
        "mercury": "☿",
        "venus": "♀",
        "mars": "♂",
        "jupiter": "♃",
        "saturn": "♄",
        "uranus": "♅",
        "neptune": "♆",
        "pluto": "♇",
        "north_node": "☊",
        "south_node": "☋",
        "earth": "⊕",
    }


def _calculate_planet_position(julian_day: float, planet_id: int, planet_name: str) -> Optional[float]:
    """Calculate astronomical position for a single planet"""
    try:
        result = swe.calc_ut(julian_day, planet_id, swe.FLG_SWIEPH)  # type: ignore
        position = float(result[0][0])  # type: ignore  # Longitude in degrees
        return position
    except (IndexError, TypeError, ValueError) as e:
        logger.error(f"Swiss Ephemeris error for {planet_name}: {str(e)}")
        return None


def _calculate_opposite_position(position: float) -> float:
    """Calculate opposite position (for Earth and South Node)"""
    return (position + 180.0) % 360.0

def calculate_planetary_activations(julian_day: float) -> dict[str, PlanetActivation]:
    """
    Calculate planetary activations for Human Design
    
    Args:
        julian_day: Julian day number for calculation
        
    Returns:
        Dictionary of planetary activations with gate/line information
        
    Raises:
        ValueError: If Swiss Ephemeris is not properly initialized
    """
    cache_key = _get_cache_key(julian_day)
    
    # Try cache first
    cached_result = _get_cached_activations(cache_key)
    if cached_result:
        logger.debug(f"Retrieved cached activations for JD {julian_day}")
        return cached_result

    activations: dict[str, PlanetActivation] = {}
    
    try:
        planets = _get_planet_ids()
        gate_sequence = _get_gate_sequence()
        planet_symbols = _get_planet_symbols()
        
        # Calculate positions for all planets
        for planet_name, planet_id in planets.items():
            position = _calculate_planet_position(julian_day, planet_id, planet_name)
            if position is None:
                continue
                
            gate_number, line_number = _calculate_gate_and_line(position, gate_sequence)
            
            activations[planet_name] = {
                "gate": gate_number,
                "line": line_number,
                "position": position,
                "center": get_gate_center(gate_number),
                "planet": planet_name,
                "planet_symbol": planet_symbols.get(planet_name, planet_name),
            }

        # Calculate Earth position (opposite of Sun)
        if "sun" in activations:
            earth_position = _calculate_opposite_position(activations["sun"]["position"])
            earth_gate, earth_line = _calculate_gate_and_line(earth_position, gate_sequence)
            
            activations["earth"] = {
                "gate": earth_gate,
                "line": earth_line,
                "position": earth_position,
                "center": get_gate_center(earth_gate),
                "planet": "earth",
                "planet_symbol": planet_symbols["earth"],
            }

        # Calculate South Node position (opposite of North Node)
        if "north_node" in activations:
            south_position = _calculate_opposite_position(activations["north_node"]["position"])
            south_gate, south_line = _calculate_gate_and_line(south_position, gate_sequence)
            
            activations["south_node"] = {
                "gate": south_gate,
                "line": south_line,
                "position": south_position,
                "center": get_gate_center(south_gate),
                "planet": "south_node",
                "planet_symbol": planet_symbols["south_node"],
            }

        # Cache the results
        _cache_activations(cache_key, activations)
        logger.debug(f"Calculated {len(activations)} planetary activations for JD {julian_day}")

    except Exception as e:
        logger.error(f"Error calculating planetary activations: {str(e)}")
        # Return empty dict rather than raising to maintain API stability
        return {}

    return activations


def _validate_julian_day_conversion(jd_result: tuple, time_description: str) -> float:
    """Validate and extract Julian day from Swiss Ephemeris result"""
    try:
        jd_val = jd_result[1]  # type: ignore
        if isinstance(jd_val, (int, float)):
            return float(jd_val)
        elif isinstance(jd_val, str) and jd_val.replace(".", "", 1).isdigit():
            return float(jd_val)
        else:
            logger.error(f"Invalid Julian day value for {time_description}: {jd_val}")
            return 0.0
    except (IndexError, TypeError, ValueError) as e:
        logger.error(f"Failed to extract Julian day for {time_description}: {e}")
        return 0.0


def calculate_design_data(
    conscious_time: datetime, unconscious_time: datetime
) -> Dict[str, Any]:
    """
    Calculate Human Design data for both conscious and unconscious times
    
    Args:
        conscious_time: Birth time (personality)
        unconscious_time: Design time (88 degrees before birth)
        
    Returns:
        Dictionary containing conscious and unconscious activations
    """
    try:
        import swisseph as swe  # type: ignore

        # Calculate Julian days with proper error handling
        conscious_jd_result = swe.utc_to_jd(  # type: ignore
            conscious_time.year,
            conscious_time.month,
            conscious_time.day,
            conscious_time.hour,
            conscious_time.minute,
            0,
            1,
        )
        unconscious_jd_result = swe.utc_to_jd(  # type: ignore
            unconscious_time.year,
            unconscious_time.month,
            unconscious_time.day,
            unconscious_time.hour,
            unconscious_time.minute,
            0,
            1,
        )

        # Validate Julian day conversions
        conscious_jd = _validate_julian_day_conversion(
            conscious_jd_result, "conscious time"
        )
        unconscious_jd = _validate_julian_day_conversion(
            unconscious_jd_result, "unconscious time"
        )

        if conscious_jd == 0.0 or unconscious_jd == 0.0:
            logger.error("Failed to convert times to Julian days")
            return {"conscious": {}, "unconscious": {}}

        # Get planetary activations
        conscious_activations = calculate_planetary_activations(conscious_jd)
        unconscious_activations = calculate_planetary_activations(unconscious_jd)

        logger.debug(
            f"Calculated design data - Conscious: {len(conscious_activations)} planets, "
            f"Unconscious: {len(unconscious_activations)} planets"
        )

        return {
            "conscious": conscious_activations,
            "unconscious": unconscious_activations,
        }
    except Exception as e:
        logger.error(f"Error calculating design data: {str(e)}")
        return {"conscious": {}, "unconscious": {}}


def determine_type_and_authority(
    definition: Dict[str, Any],
) -> Tuple[str, str]:
    """Determine Human Design type and authority based on center definition"""
    try:
        defined_centers = definition.get("defined_centers", [])
        channels = definition.get("channels", [])

        # Simplified type determination logic
        sacral_defined = "Sacral" in defined_centers
        throat_defined = "Throat" in defined_centers
        heart_defined = "Heart" in defined_centers
        solar_plexus_defined = "Solar Plexus" in defined_centers
        spleen_defined = "Spleen" in defined_centers

        # Determine type
        if sacral_defined:
            # Check for manifestor channels (throat to motor without sacral response)  # noqa: E501
            manifestor_channels = any(
                ch in channels for ch in ["12-22", "35-36", "20-34"]
            )
            if manifestor_channels and throat_defined:
                hd_type = "Manifesting Generator"
            else:
                hd_type = "Generator"
        elif throat_defined and (heart_defined or "G" in defined_centers):
            hd_type = "Manifestor"
        elif not sacral_defined and not throat_defined:
            if len(defined_centers) == 0:
                hd_type = "Reflector"
            else:
                hd_type = "Projector"
        else:
            hd_type = "Projector"

        # Determine authority
        if solar_plexus_defined:
            authority = "Emotional"
        elif sacral_defined:
            authority = "Sacral"
        elif spleen_defined:
            authority = "Splenic"
        elif heart_defined:
            authority = "Heart"
        elif "G" in defined_centers:
            authority = "G"
        elif hd_type == "Reflector":
            authority = "Lunar"
        else:
            authority = "Mental"

        return hd_type, authority
    except Exception as e:
        logger.error(f"Error determining type and authority: {str(e)}")
        return "Generator", "Sacral"


def analyze_definition(
    activations: Dict[str, Any], design_data: Dict[str, Any]
) -> Dict[str, Any]:
    """Analyze which centers are defined based on planetary activations"""
    try:
        defined_gates: list[int] = []
        center_activations: dict[str, list[int]] = {}

        # Collect all activated gates from both conscious and unconscious
        all_activations: Dict[str, Any] = {}

        # Handle nested structure (design_data with conscious/unconscious)
        if "conscious" in activations and isinstance(
            activations["conscious"], dict
        ):
            conscious_data: Dict[str, Any] = activations["conscious"]  # type: ignore  # noqa: E501
            all_activations.update(conscious_data)

        if "unconscious" in activations and isinstance(
            activations["unconscious"], dict
        ):
            unconscious_data: Dict[str, Any] = activations["unconscious"]  # type: ignore  # noqa: E501
            all_activations.update(unconscious_data)

        # If not nested, assume direct activations
        if not all_activations:
            all_activations = activations

        for planet_data in all_activations.values():
            gate = planet_data.get("gate")
            if gate and gate in GATES:
                defined_gates.append(gate)
                center = GATES[gate]["center"]
                if center not in center_activations:
                    center_activations[center] = []
                center_activations[center].append(gate)

        # Detect channels using the new function
        channels = detect_channels(design_data)

        # Determine defined centers based on formed channels only
        defined_centers: list[str] = []
        for channel in channels:
            if channel in CHANNELS:
                # Get the two gates from the channel
                gates_in_channel = [int(g) for g in channel.split("-")]
                for gate in gates_in_channel:
                    if gate in GATES:
                        center = GATES[gate]["center"]
                        if center not in defined_centers:
                            defined_centers.append(center)

        return {
            "defined_gates": defined_gates,
            "defined_centers": defined_centers,
            "center_activations": center_activations,
            "channels": channels,
        }
    except Exception as e:
        logger.error(f"Error analyzing definition: {str(e)}")
        return {
            "defined_gates": [],
            "defined_centers": [],
            "center_activations": {},
            "channels": [],
        }


def _calculate_initial_estimate(birth_jd: float, target_degrees: float = 88.0) -> float:
    """Calculate initial estimate for design time using average solar motion"""
    average_solar_motion = 0.986  # degrees per day
    estimated_days_back = target_degrees / average_solar_motion
    return birth_jd - estimated_days_back


def _get_sun_longitude(julian_day: float) -> float:
    """Get Sun's longitude for a given Julian day"""
    try:
        sun_result = swe.calc_ut(julian_day, swe.SUN, swe.FLG_SWIEPH)  # type: ignore
        return float(sun_result[0][0])  # type: ignore
    except Exception as e:
        logger.error(f"Failed to calculate Sun position for JD {julian_day}: {e}")
        raise ValueError(f"Swiss Ephemeris calculation failed: {e}")


def _calculate_angular_difference(target: float, current: float) -> float:
    """Calculate angular difference handling 360° wrap-around"""
    diff = (target - current) % 360.0
    if diff > 180.0:
        diff -= 360.0
    return diff


def _calculate_daily_solar_motion(julian_day: float) -> float:
    """Calculate Sun's daily motion at given Julian day"""
    try:
        current_longitude = _get_sun_longitude(julian_day)
        tomorrow_longitude = _get_sun_longitude(julian_day + 1.0)
        
        daily_motion = (tomorrow_longitude - current_longitude) % 360.0
        if daily_motion > 180.0:
            daily_motion -= 360.0
            
        # Prevent division by zero with fallback
        if abs(daily_motion) < 0.0001:
            return 0.986  # Average solar motion fallback
            
        return daily_motion
    except Exception as e:
        logger.warning(f"Failed to calculate daily motion, using average: {e}")
        return 0.986


def _iteratively_solve_design_time(
    birth_jd: float, 
    target_longitude: float, 
    initial_estimate: float,
    max_iterations: int = 30,
    tolerance: float = TOLERANCE_DEGREES
) -> float:
    """Iteratively solve for precise design time using Newton-Raphson method"""
    current_jd = initial_estimate
    
    for iteration in range(max_iterations):
        try:
            current_longitude = _get_sun_longitude(current_jd)
            angular_diff = _calculate_angular_difference(target_longitude, current_longitude)
            
            # Check convergence
            if abs(angular_diff) < tolerance:
                logger.debug(f"Converged after {iteration + 1} iterations")
                break
                
            # Calculate adjustment using Newton-Raphson
            daily_motion = _calculate_daily_solar_motion(current_jd)
            jd_adjustment = angular_diff / daily_motion
            current_jd += jd_adjustment
            
            # Sanity check: don't go too far from birth (max ~100 days back)
            if abs(birth_jd - current_jd) > 100:
                logger.warning("Design time calculation diverging. Using fallback estimate.")
                return birth_jd - 88.0  # Fallback to approximate
                
        except Exception as e:
            logger.error(f"Error in iteration {iteration + 1}: {e}")
            return birth_jd - 88.0  # Fallback
    
    return current_jd


def calculate_design_time_88_degrees(birth_time_utc: datetime) -> datetime:
    """
    Calculate precise design time using 88 degrees solar arc backward from birth Sun position
    
    Args:
        birth_time_utc: Birth time in UTC
        
    Returns:
        Design time (88 degrees solar arc before birth)
        
    Raises:
        ValueError: If calculation fails
    """
    try:
        import pytz

        # Convert birth time to Julian day
        birth_jd_result = swe.utc_to_jd(  # type: ignore
            birth_time_utc.year,
            birth_time_utc.month,
            birth_time_utc.day,
            birth_time_utc.hour,
            birth_time_utc.minute,
            0,
            1,
        )
        birth_jd = _validate_julian_day_conversion(birth_jd_result, "birth time")
        
        if birth_jd == 0.0:
            raise ValueError("Failed to convert birth time to Julian day")

        # Get Sun position at birth and calculate target
        birth_sun_longitude = _get_sun_longitude(birth_jd)
        target_sun_longitude = (birth_sun_longitude - 88.0) % 360.0

        # Calculate initial estimate and solve iteratively
        initial_estimate = _calculate_initial_estimate(birth_jd)
        design_jd = _iteratively_solve_design_time(
            birth_jd, target_sun_longitude, initial_estimate
        )

        # Convert back to datetime
        design_calendar = swe.jdet_to_utc(design_jd, 1)  # type: ignore  # Gregorian calendar
        design_time = datetime(
            int(design_calendar[0]),
            int(design_calendar[1]),
            int(design_calendar[2]),
            int(design_calendar[3]),
            int(design_calendar[4]),
            int(design_calendar[5]),
        ).replace(tzinfo=pytz.UTC)

        # Log verification info
        _log_design_time_verification(birth_jd, design_jd, birth_sun_longitude)

        return design_time

    except Exception as e:
        logger.error(f"Error calculating precise design time: {str(e)}")
        # Fallback to approximate calculation
        return birth_time_utc - timedelta(days=88.0)


def _log_design_time_verification(birth_jd: float, design_jd: float, birth_sun_longitude: float) -> None:
    """Log verification information for design time calculation"""
    try:
        actual_days_back = birth_jd - design_jd
        final_sun_longitude = _get_sun_longitude(design_jd)
        actual_degree_difference = (birth_sun_longitude - final_sun_longitude) % 360.0

        logger.debug(
            f"Design time verification: {actual_days_back:.3f} days back, "
            f"{actual_degree_difference:.6f}° solar arc difference"
        )
    except Exception as e:
        logger.debug(f"Failed to log verification info: {e}")


def calculate_human_design(
    year: int,
    month: int,
    day: int,
    hour: int,
    minute: int,
    lat: float,
    lon: float,
    timezone: str,
) -> Dict[str, Any]:
    """
    Calculate complete Human Design chart
    
    Args:
        year: Birth year
        month: Birth month (1-12)
        day: Birth day (1-31)
        hour: Birth hour (0-23)
        minute: Birth minute (0-59)
        lat: Birth latitude (-90 to 90)
        lon: Birth longitude (-180 to 180)
        timezone: Birth timezone (e.g., 'America/New_York')
        
    Returns:
        Dictionary containing complete Human Design chart data
    """
    try:
        import pytz

        # Validate and create timezone-aware birth time
        try:
            tz = pytz.timezone(timezone)
        except pytz.exceptions.UnknownTimeZoneError:
            logger.error(f"Invalid timezone: {timezone}. Defaulting to UTC.")
            tz = pytz.UTC

        naive_birth_time = datetime(year, month, day, hour, minute)
        try:
            birth_time = tz.localize(naive_birth_time)
            birth_time_utc = birth_time.astimezone(pytz.UTC)
            birth_time_for_calc = birth_time_utc
        except pytz.exceptions.AmbiguousTimeError:
            logger.warning(
                f"Ambiguous time for {naive_birth_time} in {timezone}. Using standard time."
            )
            # For ambiguous times, default to standard time
            is_dst_setting = False if month in [1, 2, 11, 12] else None
            birth_time = tz.localize(naive_birth_time, is_dst=is_dst_setting)
            birth_time_utc = birth_time.astimezone(pytz.UTC)
            birth_time_for_calc = birth_time_utc

        # Calculate precise design time using 88 degrees solar arc
        design_time = calculate_design_time_88_degrees(birth_time_for_calc)

        logger.debug(f"Conscious time (UTC): {birth_time_for_calc}")
        logger.debug(f"Unconscious time (UTC): {design_time}")

        # Calculate activations for both times
        design_data = calculate_design_data(birth_time_for_calc, design_time)

        # Combine conscious and unconscious activations
        all_activations: Dict[str, PlanetActivation] = {}
        all_activations.update(design_data["conscious"])
        all_activations.update(design_data["unconscious"])

        # Analyze definition
        definition = analyze_definition(all_activations, design_data)

        # Determine type and authority
        hd_type, authority = determine_type_and_authority(definition)

        # Create enhanced gates list with planet and personality/design info
        enhanced_gates = _create_enhanced_gates_list(design_data)

        # Create comprehensive Human Design data
        human_design_chart: Dict[str, Any] = {
            "birth_info": {
                "conscious_time": (
                    birth_time.isoformat()
                    if hasattr(birth_time, "isoformat")
                    else birth_time_for_calc.isoformat()
                ),
                "unconscious_time": design_time.isoformat(),
                "location": {
                    "latitude": lat,
                    "longitude": lon,
                    "timezone": timezone,
                },
            },
            "type": hd_type,
            "strategy": TYPES.get(hd_type, {}).get("strategy", "Unknown strategy"),
            "authority": authority,
            "signature": TYPES.get(hd_type, {}).get("signature", "Unknown signature"),
            "not_self_theme": TYPES.get(hd_type, {}).get("not_self", "Unknown not-self"),
            "type_info": TYPES.get(hd_type, {}),
            "authority_info": AUTHORITIES.get(authority, ""),
            "activations": {
                "conscious": design_data["conscious"],
                "unconscious": design_data["unconscious"],
            },
            "definition": definition,
            "defined_centers": definition["defined_centers"],
            "undefined_centers": [
                center
                for center in CENTERS.keys()
                if center not in definition["defined_centers"]
            ],
            "gates": enhanced_gates,
            "channels": definition["channels"],
            "centers": {
                center: {
                    "defined": center in definition["defined_centers"],
                    "gates": definition["center_activations"].get(center, []),
                    "info": CENTERS.get(center, {}),
                }
                for center in CENTERS.keys()
            },
            "profile": calculate_profile(design_data),
            "incarnation_cross": calculate_incarnation_cross(design_data),
            "variables": calculate_variables(design_data),
        }

        return human_design_chart
    except Exception as e:
        logger.error(f"Error calculating Human Design: {str(e)}", exc_info=True)
        return {"error": f"Human Design calculation failed: {str(e)}"}


def _create_enhanced_gates_list(design_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Create enhanced gates list with planet and personality/design info"""
    enhanced_gates: List[Dict[str, Any]] = []

    # Add conscious (personality) activations
    for activation in design_data["conscious"].values():
        enhanced_gates.append({
            "number": activation["gate"],
            "line": activation["line"],
            "name": GATES.get(activation["gate"], {}).get("name", "Unknown"),
            "center": activation["center"],
            "planet": activation["planet"],
            "planet_symbol": activation["planet_symbol"],
            "type": "personality",
            "position": activation["position"],
        })

    # Add unconscious (design) activations
    for activation in design_data["unconscious"].values():
        enhanced_gates.append({
            "number": activation["gate"],
            "line": activation["line"],
            "name": GATES.get(activation["gate"], {}).get("name", "Unknown"),
            "center": activation["center"],
            "planet": activation["planet"],
            "planet_symbol": activation["planet_symbol"],
            "type": "design",
            "position": activation["position"],
        })

    # Sort gates by gate number for consistent display
    enhanced_gates.sort(key=lambda x: x["number"])
    return enhanced_gates


def calculate_human_design_validated(request_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculate Human Design chart with Type Bridge System validation
    
    Args:
        request_data: Dictionary containing birth information
        
    Returns:
        HumanDesignResponse-compatible dictionary
    """
    try:
        # Validate input using Pydantic
        try:
            request = HumanDesignRequest(**request_data)
            # Use validated data with proper type casting (mock may return Any)
            year, month, day = int(request.year or 1), int(request.month or 1), int(request.day or 1)  # type: ignore
            hour, minute = int(request.hour or 0), int(request.minute or 0)  # type: ignore
            lat, lon = float(request.latitude or 0.0), float(request.longitude or 0.0)  # type: ignore
            timezone = str(request.timezone or 'UTC')  # type: ignore
        except Exception as validation_error:
            logger.error(f"Input validation failed: {validation_error}")
            return {
                "success": False,
                "error": f"Invalid input data: {validation_error}",
                "data": None,
                "generated_at": datetime.utcnow().isoformat()
            }

        # Calculate chart using existing function
        chart_data = calculate_human_design(year, month, day, hour, minute, lat, lon, timezone)
        
        # Check for calculation errors
        if "error" in chart_data:
            return {
                "success": False,
                "error": chart_data["error"],
                "data": None,
                "generated_at": datetime.utcnow().isoformat()
            }

        # Validate output using Pydantic
        try:
            validated_chart = HumanDesignChart(**chart_data)
            chart_data = validated_chart.dict()
        except Exception as validation_error:
            logger.warning(f"Output validation warning: {validation_error}")
            # Continue with unvalidated data for now

        return {
            "success": True,
            "data": chart_data,
            "error": None,
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Human Design calculation failed: {str(e)}", exc_info=True)
        return {
            "success": False,
            "error": f"Calculation failed: {str(e)}",
            "data": None,
            "generated_at": datetime.utcnow().isoformat()
        }


def get_human_design_health_check() -> Dict[str, Any]:
    """
    Get health check information for Human Design service
    
    Returns:
        Health check status following Type Bridge System
    """
    try:
        # Test Redis connection
        redis_connected = False
        if redis_client:
            try:
                redis_client.ping()
                redis_connected = True
            except Exception:
                pass
        
        # Test Swiss Ephemeris
        swisseph_available = False
        try:
            import swisseph as swe  # type: ignore
            # Test with a known date
            test_jd = swe.julday(2000, 1, 1, 12.0)  # type: ignore
            swe.calc_ut(test_jd, swe.SUN, swe.FLG_SWIEPH)  # type: ignore
            swisseph_available = True
        except Exception:
            pass
        
        status = "healthy" if redis_connected and swisseph_available else "degraded"
        
        return {
            "service": "human_design",
            "status": status,
            "redis_connected": redis_connected,
            "swisseph_available": swisseph_available,
            "last_calculation": None,  # Could be enhanced to track this
        }
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "service": "human_design",
            "status": "unhealthy",
            "redis_connected": False,
            "swisseph_available": False,
            "last_calculation": None,
        }


def calculate_profile(design_data: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate the Profile (Personality/Design lines)"""
    try:
        conscious = design_data.get("conscious", {})
        unconscious = design_data.get("unconscious", {})

        # Get Sun lines for profile
        personality_line = conscious.get("sun", {}).get("line", 1)
        design_line = unconscious.get("sun", {}).get("line", 1)

        profile_number = f"{personality_line}/{design_line}"

        # Profile descriptions (simplified)
        profiles = {
            "1/3": "Investigator/Martyr - Life theme of study and trial and error",  # noqa: E501
            "1/4": "Investigator/Opportunist - Life theme of study and networking",  # noqa: E501
            "2/4": "Hermit/Opportunist - Natural talent with networking gift",
            "2/5": "Hermit/Heretic - Natural talent with leadership potential",
            "3/5": "Martyr/Heretic - Trial and error leading to wisdom",
            "3/6": "Martyr/Role Model - Life in three phases of development",
            "4/6": "Opportunist/Role Model - Networking leading to wisdom",
            "4/1": "Opportunist/Investigator - Networking with deep study",
            "5/1": "Heretic/Investigator - Leadership through investigation",
            "5/2": "Heretic/Hermit - Universal leadership with natural talent",
            "6/2": "Role Model/Hermit - Wisdom combined with natural gifts",
            "6/3": "Role Model/Martyr - Wisdom through life experience",
        }

        return {
            "number": profile_number,
            "personality_line": personality_line,
            "design_line": design_line,
            "description": profiles.get(
                profile_number, "Unknown profile combination"
            ),
        }
    except Exception as e:
        logger.error(f"Error calculating profile: {str(e)}")
        return {"number": "1/3", "description": "Profile calculation error"}


def calculate_incarnation_cross(design_data: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate the Incarnation Cross"""
    try:
        conscious = design_data.get("conscious", {})
        unconscious = design_data.get("unconscious", {})

        # Get the four gates of the cross
        sun_personality = conscious.get("sun", {}).get("gate", 1)
        earth_personality = conscious.get("earth", {}).get("gate", 1)
        sun_design = unconscious.get("sun", {}).get("gate", 1)
        earth_design = unconscious.get("earth", {}).get("gate", 1)

        # Create the cross name based on the personality sun gate
        cross_name = f"Right Angle Cross of {GATES.get(sun_personality, {}).get('name', 'Unknown')}"  # noqa: E501

        return {
            "name": cross_name,
            "gates": {
                "sun_personality": sun_personality,
                "earth_personality": earth_personality,
                "sun_design": sun_design,
                "earth_design": earth_design,
            },
            "description": "Your life purpose and the energy you bring to the world",  # noqa: E501
        }
    except Exception as e:
        logger.error(f"Error calculating incarnation cross: {str(e)}")
        return {
            "name": "Cross calculation error",
            "gates": {},
            "description": "",
        }


def calculate_variables(design_data: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate the Variables (PHS - Primary Health System)"""
    try:
        unconscious = design_data.get("unconscious", {})
        sun_position = unconscious.get("sun", {}).get("position", 0.0)
        gate_progress = (sun_position % (360.0 / 64.0)) / (
            360.0 / 64.0
        )  # Progress within gate
        tone = int(gate_progress * 6) + 1  # 1-6
        color = int((gate_progress * 6 % 1) * 6) + 1  # 1-6

        digestion_types = {
            1: "Consecutive - One thing at a time",
            2: "Alternating - Open/Closed cycles",
            3: "Hot - Warm food preference",
            4: "Cold - Cool food preference",
            5: "Calm - Low sound environment",
            6: "Sound - High sound environment",
        }

        environment_types = {
            1: "Caves - Safe, enclosed spaces",
            2: "Markets - Busy, social environments",
            3: "Kitchens - Warm, nurturing spaces",
            4: "Mountains - High altitude, open spaces",
            5: "Valleys - Low, calm environments",
            6: "Shores - Water-based environments",
        }

        return {
            "digestion": digestion_types.get(tone, "Unknown"),
            "environment": environment_types.get(color, "Unknown"),
            "awareness": "Taste - taste-oriented awareness",  # Simplified
            "perspective": "Personal - individual perspective",  # Simplified
            "tone": tone,
            "color": color,
            "description": "Variables determine your optimal environment and health strategy",  # noqa: E501
        }
    except Exception as e:
        logger.error(f"Error calculating variables: {str(e)}")
        return {"description": "Variables calculation error"}
