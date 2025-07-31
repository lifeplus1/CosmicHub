import logging

logger = logging.getLogger(__name__)

def calculate_aspects(planets: dict) -> list:
    logger.debug(f"Calculating aspects for planets: {planets}")
    try:
        aspects = []
        for p1, pos1 in planets.items():
            for p2, pos2 in planets.items():
                if p1 < p2:  # Avoid duplicate pairs
                    diff = abs(float(pos1) - float(pos2))
                    if diff > 180:
                        diff = 360 - diff
                    if 0 <= diff <= 5:  # Relaxed orb for conjunction
                        aspects.append({"point1": p1, "point2": p2, "aspect": "conjunction", "orb": float(diff)})
                    elif 175 <= diff <= 185:  # Relaxed orb for opposition
                        aspects.append({"point1": p1, "point2": p2, "aspect": "opposition", "orb": float(abs(180 - diff))})
                    elif 58 <= diff <= 62:  # Sextile
                        aspects.append({"point1": p1, "point2": p2, "aspect": "sextile", "orb": float(abs(60 - diff))})
                    elif 88 <= diff <= 92:  # Square
                        aspects.append({"point1": p1, "point2": p2, "aspect": "square", "orb": float(abs(90 - diff))})
                    elif 118 <= diff <= 122:  # Trine
                        aspects.append({"point1": p1, "point2": p2, "aspect": "trine", "orb": float(abs(120 - diff))})
        logger.debug(f"Aspects: {aspects}")
        return aspects
    except Exception as e:
        logger.error(f"Error in aspect calculation: {str(e)}", exc_info=True)
        raise ValueError(f"Error in aspect calculation: {str(e)}")