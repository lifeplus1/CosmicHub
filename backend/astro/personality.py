import logging

logger = logging.getLogger(__name__)

def get_personality_traits(chart: dict) -> dict:
    logger.debug(f"Analyzing personality for chart: {chart}")
    try:
        sun_sign = get_sun_sign(chart["planets"]["sun"]["position"])
        traits = {
            "Aries": "Bold, ambitious, competitive",
            "Taurus": "Stable, practical, sensual",
            "Gemini": "Curious, adaptable, communicative",
            "Cancer": "Emotional, nurturing, intuitive",
            "Leo": "Confident, charismatic, leadership-oriented",
            "Virgo": "Analytical, meticulous, service-oriented",
            "Libra": "Diplomatic, charming, balanced",
            "Scorpio": "Intense, passionate, transformative",
            "Sagittarius": "Adventurous, optimistic, philosophical",
            "Capricorn": "Disciplined, responsible, ambitious",
            "Aquarius": "Innovative, independent, humanitarian",
            "Pisces": "Empathetic, imaginative, spiritual"
        }
        return {
            "sun_sign": sun_sign,
            "traits": traits.get(sun_sign, "Unknown")
        }
    except Exception as e:
        logger.error(f"Error in personality analysis: {str(e)}", exc_info=True)
        raise ValueError(f"Error in personality analysis: {str(e)}")

def get_sun_sign(position: float) -> str:
    zodiac_signs = [
        "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
        "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
    ]
    sign_index = int(position % 360 / 30)
    return zodiac_signs[sign_index]