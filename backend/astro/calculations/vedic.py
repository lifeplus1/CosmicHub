# backend/astro/calculations/vedic.py
import swisseph as swe
import logging
from typing import Dict, Any, Final, Tuple, List

# Type-safe constants for swisseph bodies
SUN: Final[int] = 0
MOON: Final[int] = 1
MERCURY: Final[int] = 2
VENUS: Final[int] = 3
MARS: Final[int] = 4
JUPITER: Final[int] = 5
SATURN: Final[int] = 6
MEAN_NODE: Final[int] = 10

# Type-safe constants for swisseph flags
FLG_SWIEPH: Final[int] = 2
FLG_SPEED: Final[int] = 256
SIDM_LAHIRI: Final[int] = 1

logger = logging.getLogger(__name__)

# Vedic astrology constants
VEDIC_SIGNS = [
    "Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya",
    "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena"
]

VEDIC_NAKSHATRAS = [
    {"name": "Ashwini", "lord": "Ketu", "symbol": "Horse's head", "nature": "Light"},
    {"name": "Bharani", "lord": "Venus", "symbol": "Yoni", "nature": "Fierce"},
    {"name": "Krittika", "lord": "Sun", "symbol": "Razor", "nature": "Mixed"},
    {"name": "Rohini", "lord": "Moon", "symbol": "Ox cart", "nature": "Fixed"},
    {"name": "Mrigashira", "lord": "Mars", "symbol": "Deer's head", "nature": "Soft"},
    {"name": "Ardra", "lord": "Rahu", "symbol": "Teardrop", "nature": "Sharp"},
    {"name": "Punarvasu", "lord": "Jupiter", "symbol": "Bow and quiver", "nature": "Moveable"},
    {"name": "Pushya", "lord": "Saturn", "symbol": "Cow's udder", "nature": "Light"},
    {"name": "Ashlesha", "lord": "Mercury", "symbol": "Serpent", "nature": "Sharp"},
    {"name": "Magha", "lord": "Ketu", "symbol": "Palanquin", "nature": "Fierce"},
    {"name": "Purva Phalguni", "lord": "Venus", "symbol": "Hammock", "nature": "Fierce"},
    {"name": "Uttara Phalguni", "lord": "Sun", "symbol": "Bed", "nature": "Fixed"},
    {"name": "Hasta", "lord": "Moon", "symbol": "Hand", "nature": "Light"},
    {"name": "Chitra", "lord": "Mars", "symbol": "Pearl", "nature": "Soft"},
    {"name": "Swati", "lord": "Rahu", "symbol": "Coral", "nature": "Moveable"},
    {"name": "Vishakha", "lord": "Jupiter", "symbol": "Triumphal arch", "nature": "Mixed"},
    {"name": "Anuradha", "lord": "Saturn", "symbol": "Lotus", "nature": "Soft"},
    {"name": "Jyeshtha", "lord": "Mercury", "symbol": "Earring", "nature": "Sharp"},
    {"name": "Mula", "lord": "Ketu", "symbol": "Tied roots", "nature": "Sharp"},
    {"name": "Purva Ashadha", "lord": "Venus", "symbol": "Fan", "nature": "Fierce"},
    {"name": "Uttara Ashadha", "lord": "Sun", "symbol": "Elephant tusk", "nature": "Fixed"},
    {"name": "Shravana", "lord": "Moon", "symbol": "Ear", "nature": "Moveable"},
    {"name": "Dhanishta", "lord": "Mars", "symbol": "Drum", "nature": "Moveable"},
    {"name": "Shatabhisha", "lord": "Rahu", "symbol": "Empty circle", "nature": "Moveable"},
    {"name": "Purva Bhadrapada", "lord": "Jupiter", "symbol": "Sword", "nature": "Fierce"},
    {"name": "Uttara Bhadrapada", "lord": "Saturn", "symbol": "Twin", "nature": "Fixed"},
    {"name": "Revati", "lord": "Mercury", "symbol": "Fish", "nature": "Soft"}
]

def get_ayanamsa(julian_day: float) -> float:
    """Calculate the ayanamsa (precession correction) for Vedic astrology"""
    try:
        # Using Lahiri ayanamsa (most commonly used)
        set_sidmode = getattr(swe, 'set_sidmode', None)
        get_ayanamsa_ut = getattr(swe, 'get_ayanamsa_ut', None)
        
        if set_sidmode and get_ayanamsa_ut:
            set_sidmode(SIDM_LAHIRI)
            ayanamsa: float = get_ayanamsa_ut(julian_day)
            logger.debug(f"Ayanamsa for JD {julian_day}: {ayanamsa}")
            return ayanamsa
        else:
            logger.warning("Swiss Ephemeris functions not available")
            return 24.0  # Default approximation
    except Exception as e:
        logger.error(f"Error calculating ayanamsa: {str(e)}")
        return 24.0  # Default approximation

def get_vedic_sign(tropical_position: float, ayanamsa: float) -> str:
    """Convert tropical position to sidereal (Vedic) sign"""
    sidereal_position = (tropical_position - ayanamsa) % 360
    sign_index = int(sidereal_position // 30)
    degree = sidereal_position % 30
    return f"{degree:.2f}° {VEDIC_SIGNS[sign_index]}"

def get_nakshatra(tropical_position: float, ayanamsa: float) -> Dict[str, Any]:
    """Calculate nakshatra (lunar mansion) for a position"""
    sidereal_position = (tropical_position - ayanamsa) % 360
    nakshatra_index = int(sidereal_position / 13.333333)  # 360/27 = 13.33...
    nakshatra_degree = (sidereal_position % 13.333333)
    
    if nakshatra_index >= 27:
        nakshatra_index = 26
    
    nakshatra = VEDIC_NAKSHATRAS[nakshatra_index]
    pada = int(nakshatra_degree / 3.333333) + 1  # Each nakshatra has 4 padas
    
    return {
        "name": nakshatra["name"],
        "lord": nakshatra["lord"],
        "symbol": nakshatra["symbol"],
        "nature": nakshatra["nature"],
        "pada": pada,
        "degree": f"{nakshatra_degree:.2f}°"
    }

def calculate_vedic_planets(julian_day: float) -> Dict[str, Any]:
    """Calculate Vedic planetary positions with nakshatras"""
    try:
        ayanamsa = get_ayanamsa(julian_day)
        calc_ut = getattr(swe, 'calc_ut', None)
        
        if not calc_ut:
            logger.error("Swiss Ephemeris calc_ut function not available")
            return {"ayanamsa": 0, "planets": {}}
        
        planets: Dict[str, int] = {
            "sun": SUN,
            "moon": MOON,
            "mercury": MERCURY,
            "venus": VENUS,
            "mars": MARS,
            "jupiter": JUPITER,
            "saturn": SATURN,
            "rahu": MEAN_NODE,  # North Node (Rahu)
            "ketu": -1,  # Will calculate as South Node (180° from Rahu)
        }
        
        vedic_positions: Dict[str, Dict[str, Any]] = {}
        
        for name, body in planets.items():
            if name == "ketu":
                # Calculate Ketu as opposite of Rahu
                rahu_data = vedic_positions.get("rahu", {})
                rahu_pos = float(rahu_data.get("tropical_position", 0))
                tropical_pos: float = (rahu_pos + 180) % 360
            else:
                pos = calc_ut(julian_day, body, FLG_SWIEPH | FLG_SPEED)
                if pos[0][0] < 0:
                    logger.error(f"Error calculating {name}: {pos[0][0]}")
                    continue
                tropical_pos: float = float(pos[0][0])
            
            vedic_positions[name] = {
                "tropical_position": tropical_pos,
                "sidereal_position": (tropical_pos - ayanamsa) % 360,
                "vedic_sign": get_vedic_sign(tropical_pos, ayanamsa),
                "nakshatra": get_nakshatra(tropical_pos, ayanamsa)
            }
        
        return {
            "ayanamsa": ayanamsa,
            "planets": vedic_positions
        }
        
    except Exception as e:
        logger.error(f"Error in Vedic calculations: {str(e)}")
        return {"ayanamsa": 0, "planets": {}}

def calculate_vedic_houses(julian_day: float, lat: float, lon: float) -> Dict[str, Any]:
    """Calculate Vedic house cusps (sidereal)"""
    try:
        ayanamsa = get_ayanamsa(julian_day)
        houses_ex = getattr(swe, 'houses_ex', None)
        
        if not houses_ex:
            logger.error("Swiss Ephemeris houses_ex function not available")
            return {"houses": [], "angles": {}}
        
        # Calculate tropical houses first
        houses: Tuple[List[float], List[float]] = houses_ex(julian_day, lat, lon, b'P')  # Placidus system
        house_cusps: List[float] = houses[0]
        ascendant: float = houses[1][0]
        mc: float = houses[1][1]
        
        # Convert to sidereal
        vedic_houses: List[Dict[str, Any]] = []
        for i, cusp in enumerate(house_cusps):
            cusp_float: float = float(cusp)
            sidereal_cusp: float = (cusp_float - ayanamsa) % 360
            vedic_houses.append({
                "house": i + 1,
                "cusp": sidereal_cusp,
                "vedic_sign": get_vedic_sign(cusp_float, ayanamsa)
            })
        
        vedic_angles: Dict[str, float] = {
            "ascendant": (float(ascendant) - ayanamsa) % 360,
            "mc": (float(mc) - ayanamsa) % 360,
            "descendant": ((float(ascendant) + 180) - ayanamsa) % 360,
            "ic": ((float(mc) + 180) - ayanamsa) % 360
        }
        
        return {
            "houses": vedic_houses,
            "angles": vedic_angles
        }
        
    except Exception as e:
        logger.error(f"Error calculating Vedic houses: {str(e)}")
        return {"houses": [], "angles": {}}

def get_vedic_chart_analysis(vedic_data: Dict[str, Any]) -> Dict[str, Any]:
    """Provide basic Vedic chart analysis"""
    try:
        planets = vedic_data.get("planets", {})
        
        # Find moon sign (Rashi)
        moon_data = planets.get("moon", {})
        moon_sign = moon_data.get("vedic_sign", "").split()[-1] if moon_data else "Unknown"
        
        # Find moon nakshatra
        moon_nakshatra = moon_data.get("nakshatra", {}).get("name", "Unknown") if moon_data else "Unknown"
        
        # Find ascendant sign
        houses = vedic_data.get("houses", {})
        asc_sign = "Unknown"
        if houses and "angles" in houses:
            asc_pos = houses["angles"].get("ascendant", 0)
            sign_index = int(asc_pos // 30)
            asc_sign = VEDIC_SIGNS[sign_index] if sign_index < len(VEDIC_SIGNS) else "Unknown"
        
        return {
            "moon_sign": moon_sign,
            "moon_nakshatra": moon_nakshatra,
            "ascendant_sign": asc_sign,
            "birth_star": moon_nakshatra,
            "analysis": f"Moon in {moon_sign} ({moon_nakshatra} nakshatra), Ascendant in {asc_sign}"
        }
        
    except Exception as e:
        logger.error(f"Error in Vedic analysis: {str(e)}")
        return {"moon_sign": "Unknown", "moon_nakshatra": "Unknown", "ascendant_sign": "Unknown"}
