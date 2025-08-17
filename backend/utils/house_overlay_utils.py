# apps/backend/src/utils/house_overlay_utils.py
from typing import Dict, List, Any
from pydantic import BaseModel

class Overlay(BaseModel):
    planet: str
    house: int
    interpretation: str

def find_house(lon: float, cusps: List[float]) -> int:
    """Find which house a longitude falls into."""
    # Handle 360-degree wrap-around
    lon = lon % 360
    
    # Create extended cusps array to handle wrap-around
    extended_cusps = cusps + [cusps[0] + 360]
    
    for i in range(len(cusps)):
        cusp_start = cusps[i]
        cusp_end = extended_cusps[i + 1]
        
        # Handle wrap-around at 0/360 degrees
        if cusp_start <= cusp_end:
            if cusp_start <= lon < cusp_end:
                return i + 1  # 1-indexed houses
        else:  # Wrap-around case
            if lon >= cusp_start or lon < cusp_end:
                return i + 1
    
    return 1  # Default to 1st house if not found

def analyze_house_overlays(
    long1: Dict[str, float], 
    cusps2: List[float], 
    long2: Dict[str, float], 
    cusps1: List[float]
) -> Dict[str, Dict[str, Overlay]]:
    """Analyze how planets from each chart overlay into the other's houses."""
    overlays: Dict[str, Dict[str, Overlay]] = {'p1_in_p2': {}, 'p2_in_p1': {}}
    
    # Person 1's planets in Person 2's houses
    for planet, lon in long1.items():
        house = find_house(lon, cusps2)
        interp = f"{planet.capitalize()} in {house}th house: {get_house_interpretation(planet, house)}"
        overlays['p1_in_p2'][planet] = Overlay(planet=planet, house=house, interpretation=interp)
    
    # Person 2's planets in Person 1's houses
    for planet, lon in long2.items():
        house = find_house(lon, cusps1)
        interp = f"{planet.capitalize()} in {house}th house: {get_house_interpretation(planet, house)}"
        overlays['p2_in_p1'][planet] = Overlay(planet=planet, house=house, interpretation=interp)
    
    return overlays

def get_house_theme(house: int) -> str:
    """Get the theme/meaning of a house."""
    themes = {
        1: 'self-image and identity', 
        2: 'values and resources', 
        3: 'communication and learning', 
        4: 'home and family', 
        5: 'creativity and romance', 
        6: 'daily routines and health',
        7: 'partnerships and marriage', 
        8: 'transformation and intimacy', 
        9: 'philosophy and higher learning', 
        10: 'career and reputation', 
        11: 'friendships and aspirations', 
        12: 'subconscious and spirituality'
    }
    return themes.get(house, 'unknown area')

def get_house_interpretation(planet: str, house: int) -> str:
    """Get specific interpretation for planet in house overlay."""
    interpretations = {
        'sun': {
            1: 'Brings confidence and leadership to partner\'s identity',
            5: 'Sparks creativity and romantic expression',
            7: 'Illuminates partnership dynamics and commitment',
            10: 'Enhances career goals and public image'
        },
        'moon': {
            4: 'Creates emotional security and nurturing in the home',
            7: 'Brings emotional intimacy to the partnership',
            8: 'Deepens psychological and emotional bonds',
            12: 'Connects through intuition and spiritual understanding'
        },
        'venus': {
            2: 'Enhances appreciation for partner\'s values and resources',
            5: 'Brings romance, pleasure, and creative collaboration',
            7: 'Attracts harmony and beauty to the relationship',
            11: 'Creates friendship and shared social connections'
        },
        'mars': {
            1: 'Energizes partner\'s self-expression and initiative',
            5: 'Ignites passion, competition, and dynamic creativity',
            7: 'Can bring both passion and conflict to partnerships',
            8: 'Intensifies sexual and transformative energy'
        }
    }
    
    if planet in interpretations and house in interpretations[planet]:
        return interpretations[planet][house]
    else:
        return f"Influences {get_house_theme(house)} in the relationship"

def get_key_overlays(overlays: Dict[str, Dict[str, Overlay]]) -> List[Dict[str, Any]]:
    """Extract key overlay patterns for display."""
    key_overlays: List[Dict[str, Any]] = []
    important_houses = [1, 4, 5, 7, 8, 10]  # Most significant for relationships
    
    for direction, overlay_dict in overlays.items():
        for planet, overlay in overlay_dict.items():
            if overlay.house in important_houses:
                key_overlays.append({
                    'person1_planet': planet if direction == 'p1_in_p2' else 'partner',
                    'person2_house': overlay.house,
                    'interpretation': overlay.interpretation
                })
    
    return key_overlays
