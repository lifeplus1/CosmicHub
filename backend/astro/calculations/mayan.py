# backend/astro/calculations/mayan.py
import logging
from datetime import datetime, timedelta
from typing import Dict, Any

logger = logging.getLogger(__name__)

# Mayan day signs (20 day cycle)
MAYAN_DAY_SIGNS = [
    {"name": "Imix", "symbol": "🐊", "meaning": "Crocodile", "element": "East", "color": "Red"},
    {"name": "Ik", "symbol": "🌬️", "meaning": "Wind", "element": "North", "color": "White"},
    {"name": "Akbal", "symbol": "🌙", "meaning": "Night", "element": "West", "color": "Blue"},
    {"name": "Kan", "symbol": "🌽", "meaning": "Corn", "element": "South", "color": "Yellow"},
    {"name": "Chicchan", "symbol": "🐍", "meaning": "Serpent", "element": "East", "color": "Red"},
    {"name": "Cimi", "symbol": "💀", "meaning": "Death", "element": "North", "color": "White"},
    {"name": "Manik", "symbol": "🤚", "meaning": "Hand", "element": "West", "color": "Blue"},
    {"name": "Lamat", "symbol": "⭐", "meaning": "Star", "element": "South", "color": "Yellow"},
    {"name": "Muluc", "symbol": "💧", "meaning": "Water", "element": "East", "color": "Red"},
    {"name": "Oc", "symbol": "🐕", "meaning": "Dog", "element": "North", "color": "White"},
    {"name": "Chuen", "symbol": "🐒", "meaning": "Monkey", "element": "West", "color": "Blue"},
    {"name": "Eb", "symbol": "🌿", "meaning": "Grass", "element": "South", "color": "Yellow"},
    {"name": "Ben", "symbol": "🌱", "meaning": "Reed", "element": "East", "color": "Red"},
    {"name": "Ix", "symbol": "🐆", "meaning": "Jaguar", "element": "North", "color": "White"},
    {"name": "Men", "symbol": "🦅", "meaning": "Eagle", "element": "West", "color": "Blue"},
    {"name": "Cib", "symbol": "🕯️", "meaning": "Candle", "element": "South", "color": "Yellow"},
    {"name": "Caban", "symbol": "🌍", "meaning": "Earth", "element": "East", "color": "Red"},
    {"name": "Etznab", "symbol": "🗡️", "meaning": "Flint", "element": "North", "color": "White"},
    {"name": "Cauac", "symbol": "⛈️", "meaning": "Storm", "element": "West", "color": "Blue"},
    {"name": "Ahau", "symbol": "☀️", "meaning": "Lord", "element": "South", "color": "Yellow"}
]

# Mayan numbers (1-13 cycle)
MAYAN_NUMBERS = {
    1: {"name": "Hun", "meaning": "Unity, Foundation"},
    2: {"name": "Ca", "meaning": "Duality, Challenge"},
    3: {"name": "Ox", "meaning": "Action, Expression"},
    4: {"name": "Can", "meaning": "Form, Definition"},
    5: {"name": "Ho", "meaning": "Radiance, Core"},
    6: {"name": "Uac", "meaning": "Flow, Rhythm"},
    7: {"name": "Uuc", "meaning": "Reflection, Attunement"},
    8: {"name": "Uaxac", "meaning": "Justice, Modeling"},
    9: {"name": "Bolon", "meaning": "Patience, Intention"},
    10: {"name": "Lahun", "meaning": "Manifestation, Production"},
    11: {"name": "Buluc", "meaning": "Resolution, Liberation"},
    12: {"name": "Lahca", "meaning": "Dedication, Cooperation"},
    13: {"name": "Oxlahun", "meaning": "Transcendence, Presence"}
}

# Mayan year bearers (4 year cycle)
MAYAN_YEAR_BEARERS = ["Ik", "Manik", "Eb", "Caban"]

# Day sign characteristics
DAY_SIGN_TRAITS = {
    "Imix": "Nurturing, protective, primal source energy. Natural healers and mothers.",
    "Ik": "Communication, breath of life, divine inspiration. Natural communicators and messengers.",
    "Akbal": "Inner wisdom, contemplation, house of dreams. Natural psychics and dreamers.",
    "Kan": "Abundance, fertility, life force. Natural providers and farmers.",
    "Chicchan": "Life force, kundalini energy, instinctual power. Natural shamans.",
    "Cimi": "Death and rebirth, transformation, release. Natural transformers.",
    "Manik": "Accomplishment, tools, healing hands. Natural healers and craftspeople.",
    "Lamat": "Harmony, creativity, arts. Natural artists and harmonizers.",
    "Muluc": "Emotional depth, purification, flow. Natural emotionally intuitive people.",
    "Oc": "Loyalty, friendship, unconditional love. Natural guides and loyal friends.",
    "Chuen": "Playfulness, artistry, time weaving. Natural artists and time keepers.",
    "Eb": "Service, devotion, spiritual warrior. Natural servants and spiritual warriors.",
    "Ben": "Personal growth, family, home. Natural counselors and family builders.",
    "Ix": "Feminine power, earth magic, natural wisdom. Natural earth keepers.",
    "Men": "Global consciousness, planetary mind, vision. Natural visionaries.",
    "Cib": "Ancient wisdom, spiritual warrior, earth wisdom. Natural wisdom keepers.",
    "Caban": "Earth force, synchronicity, evolution. Natural earth connectors.",
    "Etznab": "Truth, clarity, mirror of reality. Natural truth speakers.",
    "Cauac": "Transformation, catalyst, thunder being. Natural catalysts for change.",
    "Ahau": "Solar consciousness, enlightenment, mastery. Natural solar masters."
}

def calculate_mayan_date(year: int, month: int, day: int) -> int:
    """Calculate days since Mayan calendar correlation (August 11, 3114 BCE)"""
    # Using GMT correlation constant (584,283)
    # This represents days from Mayan calendar start to Gregorian calendar start
    
    try:
        birth_date = datetime(year, month, day)
        # January 1, 1 CE in Julian Day Number
        epoch_date = datetime(1, 1, 1)
        
        # Calculate Julian Day Number approximation
        days_since_epoch = (birth_date - epoch_date).days
        
        # Add correlation constant to get Mayan Long Count
        mayan_correlation = 584283  # GMT correlation
        total_days = days_since_epoch + mayan_correlation + 1948320  # Adjustment
        
        return total_days
        
    except Exception as e:
        logger.error(f"Error calculating Mayan date: {str(e)}")
        return 0

def get_mayan_day_sign(total_days: int) -> Dict[str, Any]:
    """Get Mayan day sign from total days"""
    day_sign_index = total_days % 20
    return MAYAN_DAY_SIGNS[day_sign_index]

def get_mayan_number(total_days: int) -> Dict[str, Any]:
    """Get Mayan sacred number (1-13) from total days"""
    number = (total_days % 13) + 1
    return {
        "number": number,
        "name": MAYAN_NUMBERS[number]["name"],
        "meaning": MAYAN_NUMBERS[number]["meaning"]
    }

def get_mayan_year_bearer(year: int) -> str:
    """Get Mayan year bearer (one of 4 day signs that can start a year)"""
    # Simplified calculation - actual Mayan year bearer calculation is more complex
    year_bearer_index = (year - 1) % 4
    return MAYAN_YEAR_BEARERS[year_bearer_index]

def calculate_mayan_long_count(total_days: int) -> Dict[str, int]:
    """Calculate Mayan Long Count date"""
    # Long Count uses base-20 system with specific cycle lengths
    # 1 day = 1 kin
    # 20 days = 1 uinal (month)
    # 360 days = 1 tun (year)
    # 7200 days = 1 katun (20 tuns)
    # 144000 days = 1 baktun (20 katuns)
    
    baktun = total_days // 144000
    remaining = total_days % 144000
    
    katun = remaining // 7200
    remaining = remaining % 7200
    
    tun = remaining // 360
    remaining = remaining % 360
    
    uinal = remaining // 20
    kin = remaining % 20
    
    return {
        "baktun": baktun,
        "katun": katun,
        "tun": tun,
        "uinal": uinal,
        "kin": kin
    }

def get_mayan_calendar_round(total_days: int) -> Dict[str, Any]:
    """Calculate the 260-day sacred calendar position"""
    sacred_day = total_days % 260
    
    day_sign = get_mayan_day_sign(total_days)
    number = get_mayan_number(total_days)
    
    return {
        "sacred_day": sacred_day + 1,  # 1-260
        "day_sign": day_sign,
        "number": number,
        "full_name": f"{number['number']} {day_sign['name']}",
        "galactic_signature": f"{number['number']} {day_sign['name']} - {day_sign['meaning']}"
    }

def get_mayan_wavespell(total_days: int) -> Dict[str, Any]:
    """Calculate Mayan Wavespell (13-day cycle)"""
    wavespell_day = (total_days % 13) + 1
    
    wavespell_positions = {
        1: {"name": "Magnetic", "purpose": "Attract", "power": "Unify"},
        2: {"name": "Lunar", "purpose": "Polarize", "power": "Challenge"},
        3: {"name": "Electric", "purpose": "Activate", "power": "Bond"},
        4: {"name": "Self-Existing", "purpose": "Define", "power": "Form"},
        5: {"name": "Overtone", "purpose": "Empower", "power": "Command"},
        6: {"name": "Rhythmic", "purpose": "Organize", "power": "Balance"},
        7: {"name": "Resonant", "purpose": "Channel", "power": "Attune"},
        8: {"name": "Galactic", "purpose": "Harmonize", "power": "Model"},
        9: {"name": "Solar", "purpose": "Pulse", "power": "Realize"},
        10: {"name": "Planetary", "purpose": "Perfect", "power": "Produce"},
        11: {"name": "Spectral", "purpose": "Dissolve", "power": "Release"},
        12: {"name": "Crystal", "purpose": "Dedicate", "power": "Cooperate"},
        13: {"name": "Cosmic", "purpose": "Endure", "power": "Transcend"}
    }
    
    return {
        "position": wavespell_day,
        "tone": wavespell_positions[wavespell_day],
        "description": f"Day {wavespell_day} of 13-day cycle focused on {wavespell_positions[wavespell_day]['purpose'].lower()}"
    }

def calculate_mayan_astrology(year: int, month: int, day: int) -> Dict[str, Any]:
    """Calculate complete Mayan astrology reading"""
    try:
        total_days = calculate_mayan_date(year, month, day)
        
        if total_days <= 0:
            return {"error": "Invalid date calculation"}
        
        # Get all Mayan calendar components
        day_sign = get_mayan_day_sign(total_days)
        sacred_number = get_mayan_number(total_days)
        calendar_round = get_mayan_calendar_round(total_days)
        long_count = calculate_mayan_long_count(total_days)
        wavespell = get_mayan_wavespell(total_days)
        year_bearer = get_mayan_year_bearer(year)
        
        # Get personality traits
        day_sign_name = day_sign["name"]
        traits = DAY_SIGN_TRAITS.get(day_sign_name, "Unknown traits")
        
        return {
            "galactic_signature": calendar_round["galactic_signature"],
            "day_sign": {
                "name": day_sign["name"],
                "symbol": day_sign["symbol"],
                "meaning": day_sign["meaning"],
                "element": day_sign["element"],
                "color": day_sign["color"],
                "traits": traits
            },
            "sacred_number": sacred_number,
            "calendar_round": calendar_round,
            "long_count": {
                "date": f"{long_count['baktun']}.{long_count['katun']}.{long_count['tun']}.{long_count['uinal']}.{long_count['kin']}",
                "breakdown": long_count
            },
            "wavespell": wavespell,
            "year_bearer": {
                "sign": year_bearer,
                "meaning": f"Year carried by the energy of {year_bearer}"
            },
            "life_purpose": f"As a {sacred_number['number']} {day_sign['name']}, your purpose is to embody {sacred_number['meaning'].lower()} while expressing {day_sign['meaning'].lower()} energy.",
            "spiritual_guidance": f"Your {wavespell['tone']['name']} tone indicates you are here to {wavespell['tone']['purpose'].lower()} and {wavespell['tone']['power'].lower()}.",
            "compatibility_signs": get_compatible_mayan_signs(day_sign_name),
            "power_days": get_mayan_power_days(day_sign_name, sacred_number['number'])
        }
        
    except Exception as e:
        logger.error(f"Error in Mayan astrology calculation: {str(e)}")
        return {"error": "Calculation failed", "details": str(e)}

def get_compatible_mayan_signs(day_sign: str) -> Dict[str, str]:
    """Get compatible Mayan day signs"""
    # Simplified compatibility based on elemental harmony
    compatibility_map = {
        "Imix": {"high": "Muluc", "medium": "Akbal"},
        "Ik": {"high": "Chuen", "medium": "Etznab"},
        "Akbal": {"high": "Cauac", "medium": "Imix"},
        "Kan": {"high": "Ahau", "medium": "Lamat"},
        "Chicchan": {"high": "Cimi", "medium": "Ben"},
        "Cimi": {"high": "Oc", "medium": "Chicchan"},
        "Manik": {"high": "Ix", "medium": "Eb"},
        "Lamat": {"high": "Men", "medium": "Kan"},
        "Muluc": {"high": "Imix", "medium": "Caban"},
        "Oc": {"high": "Cimi", "medium": "Chuen"},
        "Chuen": {"high": "Ik", "medium": "Oc"},
        "Eb": {"high": "Cib", "medium": "Manik"},
        "Ben": {"high": "Chicchan", "medium": "Cauac"},
        "Ix": {"high": "Manik", "medium": "Caban"},
        "Men": {"high": "Lamat", "medium": "Ahau"},
        "Cib": {"high": "Eb", "medium": "Etznab"},
        "Caban": {"high": "Muluc", "medium": "Ix"},
        "Etznab": {"high": "Ik", "medium": "Cib"},
        "Cauac": {"high": "Akbal", "medium": "Ben"},
        "Ahau": {"high": "Kan", "medium": "Men"}
    }
    
    return compatibility_map.get(day_sign, {"high": "Unknown", "medium": "Unknown"})

def get_mayan_power_days(day_sign: str, number: int) -> Dict[str, Any]:
    """Calculate power days in Mayan calendar"""
    return {
        "portal_days": f"Every 20 days when {day_sign} returns",
        "power_number_days": f"Every 13 days when number {number} returns",
        "galactic_return": f"Every 260 days (complete calendar round)",
        "next_power_day": "Calculate based on current Mayan date"
    }
