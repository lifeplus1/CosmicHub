# backend/astro/calculations/uranian.py
import logging
from typing import Dict, List, Any

logger = logging.getLogger(__name__)

# Uranian planets (transneptunian points)
URANIAN_PLANETS: Dict[str, Dict[str, Any]] = {
    "cupido": {"symbol": "⚷", "meaning": "Groups, family, art, beauty", "speed": 0.033},
    "hades": {"symbol": "⚸", "meaning": "Decay, medicine, occult, underground", "speed": 0.027},
    "zeus": {"symbol": "⚹", "meaning": "Fire, creativity, machines, guns", "speed": 0.022},
    "kronos": {"symbol": "⚺", "meaning": "Authority, leadership, government", "speed": 0.019},
    "apollon": {"symbol": "⚻", "meaning": "Science, research, peace, wisdom", "speed": 0.016},
    "admetos": {"symbol": "⚼", "meaning": "Raw materials, real estate, deep", "speed": 0.014},
    "vulkanus": {"symbol": "⚽", "meaning": "Power, force, might, violence", "speed": 0.012},
    "poseidon": {"symbol": "⚾", "meaning": "Spirituality, ideas, media, light", "speed": 0.010}
}

# Hamburg School midpoints and combinations
URANIAN_MIDPOINTS = {
    "sun_moon": "Life vitality, personality core",
    "sun_mercury": "Self-expression, communication",
    "sun_venus": "Love nature, artistic expression",
    "sun_mars": "Drive, energy, action",
    "sun_jupiter": "Success, expansion, wisdom",
    "sun_saturn": "Discipline, limitation, structure",
    "moon_mercury": "Emotional communication",
    "moon_venus": "Emotional harmony, beauty",
    "moon_mars": "Emotional action, instinct",
    "mercury_venus": "Artistic communication",
    "mercury_mars": "Quick thinking, sharp words",
    "venus_mars": "Passion, sexual attraction"
}

# 90-degree dial interpretations
DIAL_INTERPRETATIONS: Dict[float, str] = {
    0: "Conjunction - Unity, concentration, focus",
    22.5: "Semi-octile - Subtle influence, background energy",
    45: "Semi-square - Dynamic tension, friction",
    67.5: "Sesqui-octile - Adjustment, fine-tuning",
    90: "Square - Challenge, conflict, action needed"
}

def calculate_uranian_planets_positions(julian_day: float) -> Dict[str, Dict[str, Any]]:
    """Calculate positions of Uranian/transneptunian planets"""
    try:
        # These are hypothetical planets used in Hamburg School astrology
        # Using approximated calculation since not all are in Swiss Ephemeris
        
        positions: Dict[str, Dict[str, Any]] = {}
        
        # Calculate approximate positions based on mean motions
        # Base positions (fictional starting points for demonstration)
        base_epoch = 2451545.0  # J2000.0
        days_since_epoch = julian_day - base_epoch
        
        for planet, data in URANIAN_PLANETS.items():
            # Simple calculation: base position + (days * daily motion)
            # In real implementation, these would use proper ephemeris data
            base_position = hash(planet) % 360  # Fictional base position
            daily_motion = data["speed"] / 365.25  # Convert annual to daily motion
            
            position = (base_position + (days_since_epoch * daily_motion)) % 360
            
            positions[planet] = {
                "position": position,
                "symbol": data["symbol"],
                "meaning": data["meaning"],
                "speed": data["speed"]
            }
        
        logger.debug(f"Uranian planets calculated: {positions}")
        return positions
        
    except Exception as e:
        logger.error(f"Error calculating Uranian planets: {str(e)}")
        return {}

def calculate_midpoints(planets: Dict[str, Any]) -> Dict[str, Dict[str, Any]]:
    """Calculate midpoints between planets"""
    try:
        midpoints: Dict[str, Dict[str, Any]] = {}
        
        planet_names = list(planets.keys())
        
        for i, planet1 in enumerate(planet_names):
            for planet2 in planet_names[i+1:]:
                if "position" in planets[planet1] and "position" in planets[planet2]:
                    pos1 = planets[planet1]["position"]
                    pos2 = planets[planet2]["position"]
                    
                    # Calculate midpoint (shortest arc)
                    diff = abs(pos1 - pos2)
                    if diff > 180:
                        # Use longer arc
                        midpoint = ((pos1 + pos2 + 360) / 2) % 360
                    else:
                        midpoint = (pos1 + pos2) / 2
                    
                    key = f"{planet1}_{planet2}"
                    midpoints[key] = {
                        "position": midpoint,
                        "meaning": URANIAN_MIDPOINTS.get(key, f"Combination of {planet1} and {planet2} energies")
                    }
        
        return midpoints
        
    except Exception as e:
        logger.error(f"Error calculating midpoints: {str(e)}")
        return {}

def calculate_90_degree_dial(planets: Dict[str, Any], uranian_planets: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Calculate 90-degree dial aspects (Hamburg School method)"""
    try:
        dial_aspects: List[Dict[str, Any]] = []
        
        # Combine regular planets and Uranian planets
        all_bodies = {**planets, **uranian_planets}
        
        body_names = list(all_bodies.keys())
        
        for i, body1 in enumerate(body_names):
            for body2 in body_names[i+1:]:
                if "position" in all_bodies[body1] and "position" in all_bodies[body2]:
                    pos1 = all_bodies[body1]["position"]
                    pos2 = all_bodies[body2]["position"]
                    
                    # Calculate aspect in 90-degree dial
                    diff = abs(pos1 - pos2) % 90
                    if diff > 45:
                        diff = 90 - diff
                    
                    # Check for significant aspects (within 1 degree orb)
                    for dial_angle, meaning in DIAL_INTERPRETATIONS.items():
                        if abs(diff - dial_angle) <= 1.0:
                            dial_aspects.append({
                                "body1": body1,
                                "body2": body2,
                                "angle": dial_angle,
                                "orb": abs(diff - dial_angle),
                                "meaning": meaning,
                                "dial_position": f"{diff:.1f}°"
                            })
        
        return sorted(dial_aspects, key=lambda x: x["orb"])
        
    except Exception as e:
        logger.error(f"Error calculating 90-degree dial: {str(e)}")
        return []

def get_uranian_house_meanings() -> Dict[int, str]:
    """Get Uranian-style house interpretations"""
    return {
        1: "Personal action, self-direction, initiative",
        2: "Personal resources, values, self-worth",
        3: "Communication, short trips, siblings",
        4: "Home base, roots, emotional foundation",
        5: "Creative self-expression, children, romance",
        6: "Daily work, health, service to others",
        7: "Partnerships, open enemies, projection",
        8: "Shared resources, transformation, death/rebirth",
        9: "Higher learning, philosophy, long journeys",
        10: "Career, reputation, authority figures",
        11: "Groups, friends, hopes and wishes",
        12: "Hidden enemies, subconscious, sacrifice"
    }

def analyze_uranian_patterns(planets: Dict[str, Any], uranian_planets: Dict[str, Any], 
                           midpoints: Dict[str, Any]) -> Dict[str, Any]:
    """Analyze Uranian astrological patterns"""
    try:
        analysis: Dict[str, List[str]] = {
            "dominant_themes": [],
            "power_concentrations": [],
            "hidden_influences": [],
            "karmic_patterns": []
        }
        
        # Check for concentrations of Uranian planets
        uranian_positions = [data["position"] for data in uranian_planets.values() if "position" in data]
        
        if uranian_positions:
            # Group by 30-degree segments to find concentrations
            segments: Dict[int, int] = {}
            for pos in uranian_positions:
                segment = int(pos // 30)
                segments[segment] = segments.get(segment, 0) + 1
            
            # Find concentrated areas
            for segment, count in segments.items():
                if count >= 3:
                    sign_name = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
                               "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"][segment]
                    analysis["power_concentrations"].append(
                        f"Strong Uranian influence in {sign_name} - collective unconscious themes"
                    )
        
        # Analyze Uranian planet themes
        for planet, data in uranian_planets.items():
            if planet == "hades":
                analysis["hidden_influences"].append(f"Hades influence: {data['meaning']}")
            elif planet == "kronos":
                analysis["dominant_themes"].append(f"Kronos influence: {data['meaning']}")
            elif planet == "poseidon":
                analysis["karmic_patterns"].append(f"Poseidon influence: {data['meaning']}")
        
        # Analyze key midpoints
        key_midpoints = ["sun_moon", "sun_mercury", "moon_mercury"]
        for mp in key_midpoints:
            if mp in midpoints:
                analysis["dominant_themes"].append(f"Active {mp} midpoint: {midpoints[mp]['meaning']}")
        
        return analysis
        
    except Exception as e:
        logger.error(f"Error in Uranian analysis: {str(e)}")
        return {"error": "Analysis failed"}

def calculate_uranian_astrology(julian_day: float, planets: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate complete Uranian astrology analysis"""
    try:
        # Calculate Uranian planet positions
        uranian_planets = calculate_uranian_planets_positions(julian_day)
        
        # Calculate midpoints
        midpoints = calculate_midpoints(planets)
        
        # Calculate 90-degree dial aspects
        dial_aspects = calculate_90_degree_dial(planets, uranian_planets)
        
        # Get house meanings
        house_meanings = get_uranian_house_meanings()
        
        # Analyze patterns
        patterns = analyze_uranian_patterns(planets, uranian_planets, midpoints)
        
        return {
            "uranian_planets": uranian_planets,
            "midpoints": midpoints,
            "dial_aspects": dial_aspects[:10],  # Top 10 most exact aspects
            "house_meanings": house_meanings,
            "pattern_analysis": patterns,
            "methodology": {
                "description": "Uranian astrology uses transneptunian points and midpoint analysis",
                "focus": "Psychological patterns, collective unconscious, precise timing",
                "techniques": ["90-degree dial", "Midpoint trees", "Planetary pictures"]
            },
            "interpretation_notes": [
                "Uranian planets represent collective unconscious themes",
                "Midpoints show combined planetary energies",
                "90-degree dial reveals hidden connections",
                "Focus on precise aspects (within 1 degree orb)"
            ]
        }
        
    except Exception as e:
        logger.error(f"Error in Uranian astrology calculation: {str(e)}")
        return {"error": "Calculation failed", "details": str(e)}
