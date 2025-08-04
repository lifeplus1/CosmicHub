
from typing import TypedDict, List, Dict, Any, Optional
import logging

# TypedDict for aspect data
class AspectData(TypedDict, total=False):
    point1: str
    point2: str
    aspect: str
    orb: float
    point1_position: float
    point2_position: float
    point1_sign: str
    point2_sign: str
    point1_house: int
    point2_house: int

logger = logging.getLogger(__name__)

def get_zodiac_sign(degree: float) -> str:
    signs = [
        "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
        "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
    ]
    sign = int(degree // 30)
    deg = degree % 30
    return f"{deg:.2f}° {signs[sign]}"

def get_house_for_planet(position: float, houses: List[Dict[str, Any]]) -> int:
    for i in range(len(houses)):
        start = houses[i]["cusp"]
        end = houses[(i + 1) % len(houses)]["cusp"]
        if start < end:
            if start <= position < end:
                return i + 1
        else:
            if position >= start or position < end:
                return i + 1
    return 1

def calculate_aspects(
    planets: Dict[str, Dict[str, Any]],
    houses: Optional[List[Dict[str, Any]]] = None
) -> List[AspectData]:
    logger.debug(f"Calculating aspects for planets: {planets}")
    try:
        aspects: List[AspectData] = []
        # Add major and minor aspects
        aspect_types = [
            (0, "Conjunction", 10.0),
            (30, "Semisextile", 2.0),
            (45, "Semisquare", 2.0),
            (60, "Sextile", 6.0),
            (72, "Quintile", 2.0),
            (90, "Square", 8.0),
            (120, "Trine", 8.0),
            (135, "Sesquiquadrate", 2.0),
            (150, "Quincunx", 2.0),
            (180, "Opposition", 10.0)
        ]
        planet_names = list(planets.keys())

        for i, planet1 in enumerate(planet_names):
            for planet2 in planet_names[i+1:]:
                pos1 = planets[planet1]["position"]
                pos2 = planets[planet2]["position"]
                angle = abs((pos1 - pos2 + 180) % 360 - 180)

                for aspect_angle, aspect_name, orb in aspect_types:
                    if abs(angle - aspect_angle) <= orb or abs(angle - (360 - aspect_angle)) <= orb:
                        aspect: AspectData = {
                            "point1": planet1,
                            "point2": planet2,
                            "aspect": aspect_name,
                            "orb": min(abs(angle - aspect_angle), abs(angle - (360 - aspect_angle))),
                            "point1_position": pos1,
                            "point2_position": pos2
                        }
                        if houses:
                            aspect["point1_sign"] = get_zodiac_sign(pos1)
                            aspect["point2_sign"] = get_zodiac_sign(pos2)
                            aspect["point1_house"] = get_house_for_planet(pos1, houses)
                            aspect["point2_house"] = get_house_for_planet(pos2, houses)
                        aspects.append(aspect)

        logger.debug(f"Aspects calculated: {aspects}")
        return aspects
    except Exception as e:
        logger.error(f"Error in aspect calculation: {str(e)}", exc_info=True)
        raise ValueError(f"Error in aspect calculation: {str(e)}")