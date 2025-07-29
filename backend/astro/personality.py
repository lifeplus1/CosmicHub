# In backend/astro/personality.py
import logging

logger = logging.getLogger(__name__)

def get_personality_traits(chart_data: dict) -> dict:
    logger.debug(f"Calculating personality traits for chart: {chart_data}")
    try:
        sun_sign = int(chart_data["planets"]["sun"] // 30)
        signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
        traits = {
            "Aries": "Bold, ambitious, competitive",
            "Taurus": "Stable, practical, sensual",
            "Gemini": "Curious, adaptable, communicative",
            "Cancer": "Nurturing, intuitive, emotional",
            "Leo": "Confident, charismatic, dramatic",
            "Virgo": "Analytical, practical, detail-oriented",
            "Libra": "Diplomatic, charming, balanced",
            "Scorpio": "Intense, passionate, secretive",
            "Sagittarius": "Adventurous, optimistic, philosophical",
            "Capricorn": "Ambitious, disciplined, practical",
            "Aquarius": "Innovative, independent, humanitarian",
            "Pisces": "Compassionate, imaginative, intuitive"
        }
        return {"sun_sign": signs[sun_sign], "traits": traits[signs[sun_sign]]}
    except Exception as e:
        logger.error(f"Error in personality traits: {str(e)}", exc_info=True)
        raise ValueError(f"Error in personality calculation: {str(e)}")