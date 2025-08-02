import swisseph as swe
import logging

logger = logging.getLogger(__name__)

def calculate_aspects(planets: dict) -> list:
    logger.debug(f"Calculating aspects for planets: {planets}")
    try:
        aspects = []
        aspect_types = [
            (0, "Conjunction", 10.0),
            (60, "Sextile", 6.0),
            (90, "Square", 8.0),
            (120, "Trine", 8.0),
            (180, "Opposition", 10.0)
        ]
        planet_names = list(planets.keys())

        for i, planet1 in enumerate(planet_names):
            for planet2 in planet_names[i+1:]:
                pos1 = planets[planet1]["position"]  # Extract position from dict
                pos2 = planets[planet2]["position"]  # Extract position from dict
                angle = abs((pos1 - pos2 + 180) % 360 - 180)
                
                for aspect_angle, aspect_name, orb in aspect_types:
                    if abs(angle - aspect_angle) <= orb or abs(angle - (360 - aspect_angle)) <= orb:
                        aspects.append({
                            "point1": planet1,
                            "point2": planet2,
                            "aspect": aspect_name,
                            "orb": min(abs(angle - aspect_angle), abs(angle - (360 - aspect_angle)))
                        })

        logger.debug(f"Aspects calculated: {aspects}")
        return aspects
    except Exception as e:
        logger.error(f"Error in aspect calculation: {str(e)}", exc_info=True)
        raise ValueError(f"Error in aspect calculation: {str(e)}")