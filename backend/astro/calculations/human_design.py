# backend/astro/calculations/human_design.py
import logging
from typing import Dict, Any, Tuple, TypedDict
class PlanetActivation(TypedDict):
    gate: int
    line: int
    position: float
    center: str
from datetime import datetime, timedelta
import swisseph as swe  # type: ignore

logger = logging.getLogger(__name__)

# I Ching Hexagram Gate Names and Properties (CORRECTED MAPPINGS)
GATES = {
    1: {"name": "The Creative", "center": "G", "type": "Individual", "theme": "Self-Expression"},
    2: {"name": "The Receptive", "center": "G", "type": "Collective", "theme": "Direction"},
    3: {"name": "Difficulty at the Beginning", "center": "Root", "type": "Individual", "theme": "Mutation"},
    4: {"name": "Youthful Folly", "center": "Ajna", "type": "Collective", "theme": "Logic"},
    5: {"name": "Waiting", "center": "Sacral", "type": "Collective", "theme": "Pattern"},
    6: {"name": "Conflict", "center": "Solar Plexus", "type": "Tribal", "theme": "Emotion"},
    7: {"name": "The Army", "center": "G", "type": "Collective", "theme": "Direction"},
    8: {"name": "Holding Together", "center": "Throat", "type": "Individual", "theme": "Knowing"},
    9: {"name": "The Taming Power of the Small", "center": "Sacral", "type": "Collective", "theme": "Focus"},
    10: {"name": "Treading", "center": "G", "type": "Individual", "theme": "Self-Expression"},
    11: {"name": "Peace", "center": "Ajna", "type": "Collective", "theme": "Ideas"},
    12: {"name": "Standstill", "center": "Throat", "type": "Individual", "theme": "Knowing"},
    13: {"name": "Fellowship with Men", "center": "G", "type": "Collective", "theme": "Direction"},
    14: {"name": "Possession in Great Measure", "center": "Sacral", "type": "Individual", "theme": "Power"},
    15: {"name": "Modesty", "center": "G", "type": "Collective", "theme": "Direction"},
    16: {"name": "Enthusiasm", "center": "Throat", "type": "Collective", "theme": "Logic"},
    17: {"name": "Following", "center": "Ajna", "type": "Collective", "theme": "Opinion"},
    18: {"name": "Work on What Has Been Spoiled", "center": "Spleen", "type": "Collective", "theme": "Perfection"},
    19: {"name": "Approach", "center": "Root", "type": "Tribal", "theme": "Needs"},
    20: {"name": "Contemplation", "center": "Throat", "type": "Individual", "theme": "Knowing"},
    21: {"name": "Biting Through", "center": "Heart", "type": "Tribal", "theme": "Ego"},
    22: {"name": "Grace", "center": "Solar Plexus", "type": "Individual", "theme": "Knowing"},
    23: {"name": "Splitting Apart", "center": "Throat", "type": "Individual", "theme": "Knowing"},
    24: {"name": "Return", "center": "Ajna", "type": "Individual", "theme": "Knowing"},
    25: {"name": "Innocence", "center": "Heart", "type": "Individual", "theme": "Love"},
    26: {"name": "The Taming Power of the Great", "center": "Heart", "type": "Tribal", "theme": "Ego"},
    27: {"name": "The Corners of the Mouth", "center": "Sacral", "type": "Tribal", "theme": "Caring"},
    28: {"name": "Preponderance of the Great", "center": "Spleen", "type": "Individual", "theme": "Struggle"},
    29: {"name": "The Abysmal", "center": "Sacral", "type": "Collective", "theme": "Experience"},
    30: {"name": "The Clinging", "center": "Solar Plexus", "type": "Individual", "theme": "Recognition"},
    31: {"name": "Influence", "center": "Throat", "type": "Collective", "theme": "Leading"},
    32: {"name": "Duration", "center": "Spleen", "type": "Tribal", "theme": "Continuity"},
    33: {"name": "Retreat", "center": "Throat", "type": "Individual", "theme": "Privacy"},
    34: {"name": "The Power of the Great", "center": "Sacral", "type": "Individual", "theme": "Power"},
    35: {"name": "Progress", "center": "Solar Plexus", "type": "Collective", "theme": "Experience"},
    36: {"name": "Darkening of the Light", "center": "Solar Plexus", "type": "Individual", "theme": "Crisis"},
    37: {"name": "The Family", "center": "Solar Plexus", "type": "Tribal", "theme": "Bargains"},
    38: {"name": "Opposition", "center": "Root", "type": "Individual", "theme": "Struggle"},
    39: {"name": "Obstruction", "center": "Root", "type": "Individual", "theme": "Provocation"},
    40: {"name": "Deliverance", "center": "Heart", "type": "Tribal", "theme": "Alone"},
    41: {"name": "Decrease", "center": "Root", "type": "Collective", "theme": "Contraction"},
    42: {"name": "Increase", "center": "Sacral", "type": "Collective", "theme": "Expansion"},
    43: {"name": "Breakthrough", "center": "Ajna", "type": "Individual", "theme": "Insight"},
    44: {"name": "Coming to Meet", "center": "Spleen", "type": "Collective", "theme": "Patterns"},
    45: {"name": "Gathering Together", "center": "Throat", "type": "Tribal", "theme": "Ruler"},
    46: {"name": "Pushing Upward", "center": "G", "type": "Individual", "theme": "Determination"},
    47: {"name": "Oppression", "center": "Ajna", "type": "Individual", "theme": "Realisation"},
    48: {"name": "The Well", "center": "Spleen", "type": "Collective", "theme": "Depth"},
    49: {"name": "Revolution", "center": "Solar Plexus", "type": "Tribal", "theme": "Principles"},
    50: {"name": "The Cauldron", "center": "Spleen", "type": "Tribal", "theme": "Values"},
    51: {"name": "The Arousing", "center": "Heart", "type": "Individual", "theme": "Shock"},
    52: {"name": "Keeping Still", "center": "Root", "type": "Individual", "theme": "Stillness"},
    53: {"name": "Development", "center": "Root", "type": "Collective", "theme": "Evolution"},
    54: {"name": "The Marrying Maiden", "center": "Root", "type": "Tribal", "theme": "Ambition"},
    55: {"name": "Abundance", "center": "Solar Plexus", "type": "Individual", "theme": "Spirit"},
    56: {"name": "The Wanderer", "center": "Throat", "type": "Collective", "theme": "Stimulation"},
    57: {"name": "The Gentle", "center": "Spleen", "type": "Collective", "theme": "Intuition"},
    58: {"name": "The Joyous", "center": "Root", "type": "Individual", "theme": "Vitality"},
    59: {"name": "Dispersion", "center": "Sacral", "type": "Tribal", "theme": "Sexuality"},
    60: {"name": "Limitation", "center": "Root", "type": "Collective", "theme": "Acceptance"},
    61: {"name": "Inner Truth", "center": "Head", "type": "Individual", "theme": "Mystery"},
    62: {"name": "Preponderance of the Small", "center": "Throat", "type": "Individual", "theme": "Details"},
    63: {"name": "After Completion", "center": "Head", "type": "Collective", "theme": "Doubt"},
    64: {"name": "Before Completion", "center": "Head", "type": "Individual", "theme": "Confusion"}
}

# Energy Centers and their properties
CENTERS = {
    "Head": {"type": "Pressure", "theme": "Inspiration", "color": "yellow"},
    "Ajna": {"type": "Awareness", "theme": "Conceptualization", "color": "green"},
    "Throat": {"type": "Motor", "theme": "Manifestation", "color": "brown"},
    "G": {"type": "Identity", "theme": "Love & Direction", "color": "yellow"},
    "Heart": {"type": "Motor", "theme": "Will", "color": "red"},
    "Spleen": {"type": "Awareness", "theme": "Intuition", "color": "brown"},
    "Solar Plexus": {"type": "Motor", "theme": "Emotion", "color": "brown"},
    "Sacral": {"type": "Motor", "theme": "Life Force", "color": "red"},
    "Root": {"type": "Pressure", "theme": "Stress", "color": "brown"}
}

# Human Design Types
TYPES = {
    "Manifestor": {
        "description": "Initiators who are here to make things happen",
        "strategy": "Inform before you act",
        "signature": "Peace",
        "not_self": "Anger",
        "percentage": "9%"
    },
    "Generator": {
        "description": "Builders who are here to master their craft",
        "strategy": "Respond to life",
        "signature": "Satisfaction",
        "not_self": "Frustration",
        "percentage": "37%"
    },
    "Manifesting Generator": {
        "description": "Multi-passionate builders and initiators",
        "strategy": "Respond, then inform",
        "signature": "Satisfaction & Peace",
        "not_self": "Frustration & Anger",
        "percentage": "33%"
    },
    "Projector": {
        "description": "Guides who are here to see the big picture",
        "strategy": "Wait for invitation",
        "signature": "Success",
        "not_self": "Bitterness",
        "percentage": "20%"
    },
    "Reflector": {
        "description": "Mirrors who reflect the health of their community",
        "strategy": "Wait a lunar cycle",
        "signature": "Surprise",
        "not_self": "Disappointment",
        "percentage": "1%"
    }
}

# Authorities
AUTHORITIES = {
    "Emotional": "Wait for emotional clarity before making decisions",
    "Sacral": "Follow your gut response in the moment",
    "Splenic": "Trust your intuitive knowing",
    "Heart": "Listen to your willpower and ego",
    "G": "Follow your identity and direction",
    "Mental": "Discuss and process with others",
    "Lunar": "Wait a full lunar cycle (28 days)"
}

# Human Design Channels (Gate pairs that form channels)
CHANNELS = {
    "1-8": {"name": "The Channel of Inspiration", "circuit": "Individual", "theme": "Creative Role Model"},
    "2-14": {"name": "The Channel of the Beat", "circuit": "Individual", "theme": "Keeper of the Keys"},
    "3-60": {"name": "The Channel of Mutation", "circuit": "Individual", "theme": "Energy for Change"},
    "4-63": {"name": "The Channel of Logic", "circuit": "Collective", "theme": "Mental Ease"},
    "5-15": {"name": "The Channel of Rhythm", "circuit": "Collective", "theme": "Being in the Flow"},
    "6-59": {"name": "The Channel of Mating", "circuit": "Tribal", "theme": "Focused on Reproduction"},
    "7-31": {"name": "The Channel of the Alpha", "circuit": "Collective", "theme": "Leadership for the Future"},
    "9-52": {"name": "The Channel of Concentration", "circuit": "Collective", "theme": "Focused Determination"},
    "10-20": {"name": "The Channel of Awakening", "circuit": "Individual", "theme": "Commitment to Higher Principles"},
    "10-34": {"name": "The Channel of Exploration", "circuit": "Individual", "theme": "Following One's Convictions"},
    "10-57": {"name": "The Channel of Perfected Form", "circuit": "Individual", "theme": "Survival"},
    "11-56": {"name": "The Channel of Curiosity", "circuit": "Collective", "theme": "The Seeker"},
    "12-22": {"name": "The Channel of Openness", "circuit": "Individual", "theme": "A Social Being"},
    "13-33": {"name": "The Channel of the Prodigal", "circuit": "Collective", "theme": "A Witness"},
    "16-48": {"name": "The Channel of the Wavelength", "circuit": "Collective", "theme": "Talent"},
    "17-62": {"name": "The Channel of Acceptance", "circuit": "Collective", "theme": "An Organized Being"},
    "18-58": {"name": "The Channel of Judgment", "circuit": "Collective", "theme": "Insatiable Critic"},
    "19-49": {"name": "The Channel of Synthesis", "circuit": "Tribal", "theme": "Sensitivity"},
    "20-57": {"name": "The Channel of the Brainwave", "circuit": "Individual", "theme": "Penetrating Awareness"},
    "21-45": {"name": "The Channel of Money", "circuit": "Tribal", "theme": "A Material Way of Life"},
    "23-43": {"name": "The Channel of Structuring", "circuit": "Individual", "theme": "Genius to Freak"},
    "24-61": {"name": "The Channel of Awareness", "circuit": "Individual", "theme": "Thinker"},
    "25-51": {"name": "The Channel of Initiation", "circuit": "Individual", "theme": "Needing to be First"},
    "26-44": {"name": "The Channel of Surrender", "circuit": "Tribal", "theme": "A Transmitter"},
    "27-50": {"name": "The Channel of Preservation", "circuit": "Tribal", "theme": "Custodianship"},
    "28-38": {"name": "The Channel of Struggle", "circuit": "Individual", "theme": "Stubbornness"},
    "29-46": {"name": "The Channel of Discovery", "circuit": "Collective", "theme": "Succeeding Where Others Fail"},
    "30-41": {"name": "The Channel of Recognition", "circuit": "Individual", "theme": "A Focused Way of Life"},
    "32-54": {"name": "The Channel of Transformation", "circuit": "Tribal", "theme": "Being Driven"},
    "34-57": {"name": "The Channel of Power", "circuit": "Individual", "theme": "An Archetype"},
    "35-36": {"name": "The Channel of Transitoriness", "circuit": "Collective", "theme": "A Jack of All Trades"},
    "37-40": {"name": "The Channel of Community", "circuit": "Tribal", "theme": "A Part seeking a Whole"},
    "39-55": {"name": "The Channel of Emoting", "circuit": "Individual", "theme": "Moodiness"},
    "42-53": {"name": "The Channel of Maturation", "circuit": "Collective", "theme": "Balanced Development"},
    "47-64": {"name": "The Channel of Abstraction", "circuit": "Individual", "theme": "Mental Activity Mixed with Clarity"}
}

def detect_channels(activations: Dict[str, Any]) -> list[str]:
    """Detect which channels are formed by the planetary activations"""
    activated_gates: set[int] = set()
    
    # Collect all activated gates from both conscious and unconscious
    for planet_data in activations.values():
        gate = planet_data.get("gate")
        if gate:
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

def calculate_planetary_activations(julian_day: float) -> dict[str, PlanetActivation]:
    """Calculate planetary activations for Human Design"""
    activations: dict[str, PlanetActivation] = {}
    
    # Planet constants for Swiss Ephemeris
    planets: dict[str, int] = {
        'sun': int(getattr(swe, "SUN", 0)),
        'moon': int(getattr(swe, "MOON", 1)),
        'mercury': int(getattr(swe, "MERCURY", 2)),
        'venus': int(getattr(swe, "VENUS", 3)),
        'mars': int(getattr(swe, "MARS", 4)),
        'jupiter': int(getattr(swe, "JUPITER", 5)),
        'saturn': int(getattr(swe, "SATURN", 6)),
        'uranus': int(getattr(swe, "URANUS", 7)),
        'neptune': int(getattr(swe, "NEPTUNE", 8)),
        'pluto': int(getattr(swe, "PLUTO", 9)),
        'north_node': int(getattr(swe, "MEAN_NODE", 10))
    }
    
    try:
        for planet_name, planet_id in planets.items():
            # Calculate planet position
            result = swe.calc_ut(julian_day, planet_id, swe.FLG_SWIEPH)  # type: ignore
            position: float = float(result[0][0])  # type: ignore  # Longitude in degrees
            
            # Convert to Human Design gate/line (CORRECTED FORMULA)
            # Each gate is 5.625 degrees (360/64)
            gate_degrees: float = 360.0 / 64.0  # 5.625 degrees per gate
            gate_position: float = position / gate_degrees  # Position in gates (0-63.999...)
            gate_number: int = int(gate_position) + 1  # Gates are 1-64
            
            # Each line is 1/6 of a gate
            line_position: float = (gate_position % 1.0) * 6.0  # Position within gate (0-5.999...)
            line_number: int = int(line_position) + 1  # Lines are 1-6
            
            # Ensure valid ranges
            gate_number = max(1, min(64, gate_number))
            line_number = max(1, min(6, line_number))
            
            activations[planet_name] = {
                'gate': gate_number,
                'line': line_number,
                'position': position,
                'center': get_gate_center(gate_number)
            }
        
        # Calculate Earth position (opposite of Sun)
        if 'sun' in activations:
            sun_position: float = float(activations['sun']['position'])
            earth_position: float = (sun_position + 180.0) % 360.0
            
            # Calculate Earth gate/line
            gate_degrees: float = 360.0 / 64.0
            gate_position: float = earth_position / gate_degrees
            gate_number: int = int(gate_position) + 1
            line_position: float = (gate_position % 1) * 6
            line_number: int = int(line_position) + 1
            
            gate_number = max(1, min(64, gate_number))
            line_number = max(1, min(6, line_number))
            
            activations['earth'] = {
                'gate': gate_number,
                'line': line_number,
                'position': earth_position,
                'center': get_gate_center(gate_number)
            }
            
    except Exception as e:
        logger.error(f"Error calculating planetary activations: {str(e)}")
    
    return activations

def calculate_design_data(conscious_time: datetime, unconscious_time: datetime) -> Dict[str, Any]:
    """Calculate Human Design data for both conscious and unconscious"""
    try:
        import swisseph as swe  # type: ignore
        
        # Calculate Julian days
        conscious_jd_result = swe.utc_to_jd( # type: ignore
            conscious_time.year, conscious_time.month, conscious_time.day,
            conscious_time.hour, conscious_time.minute, 0, 1
        )  # type: ignore
        unconscious_jd_result: tuple = swe.utc_to_jd( # type: ignore
            unconscious_time.year, unconscious_time.month, unconscious_time.day,
            unconscious_time.hour, unconscious_time.minute, 0, 1
        )  # type: ignore
        
        conscious_jd_val = conscious_jd_result[1] # type: ignore
        if isinstance(conscious_jd_val, (int, float)):
            conscious_jd = float(conscious_jd_val)
        elif isinstance(conscious_jd_val, str) and conscious_jd_val.replace('.', '', 1).isdigit():
            conscious_jd = float(conscious_jd_val)
        else:
            conscious_jd = 0.0
        unconscious_jd_val: Any = unconscious_jd_result[1] # type: ignore
        if isinstance(unconscious_jd_val, (int, float)):
            unconscious_jd = float(unconscious_jd_val)
        elif isinstance(unconscious_jd_val, str) and unconscious_jd_val.replace('.', '', 1).isdigit():
            unconscious_jd = float(unconscious_jd_val)
        else:
            unconscious_jd = 0.0
        
        # Get planetary activations
        conscious_activations = calculate_planetary_activations(conscious_jd)
        unconscious_activations = calculate_planetary_activations(unconscious_jd)
        
        return {
            "conscious": conscious_activations,
            "unconscious": unconscious_activations
        }
    except Exception as e:
        logger.error(f"Error calculating design data: {str(e)}")
        return {"conscious": {}, "unconscious": {}}

def determine_type_and_authority(definition: Dict[str, Any]) -> Tuple[str, str]:
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
            # Check for manifestor channels (throat to motor without sacral response)
            manifestor_channels = any(ch in channels for ch in ["12-22", "35-36", "20-34"])
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

def analyze_definition(activations: Dict[str, Any]) -> Dict[str, Any]:
    """Analyze which centers are defined based on planetary activations"""
    try:
        defined_gates: list[int] = []
        center_activations: dict[str, list[int]] = {}
        
        # Collect all activated gates from both conscious and unconscious
        all_activations: Dict[str, Any] = {}
        
        # Handle nested structure (design_data with conscious/unconscious)
        if 'conscious' in activations and isinstance(activations['conscious'], dict):
            conscious_data: Dict[str, Any] = activations['conscious']  # type: ignore
            all_activations.update(conscious_data)
        
        if 'unconscious' in activations and isinstance(activations['unconscious'], dict):
            unconscious_data: Dict[str, Any] = activations['unconscious']  # type: ignore
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
        
        # Determine defined centers (need at least one gate)
        defined_centers: list[str] = [str(center) for center in center_activations.keys()]
        
        # Detect channels using the new function
        channels = detect_channels(all_activations)
        
        return {
            "defined_gates": defined_gates,
            "defined_centers": defined_centers,
            "center_activations": center_activations,
            "channels": channels
        }
    except Exception as e:
        logger.error(f"Error analyzing definition: {str(e)}")
        return {"defined_gates": [], "defined_centers": [], "center_activations": {}, "channels": []}

from typing import Any

def calculate_human_design(year: int, month: int, day: int, hour: int, minute: int, 
                          lat: float, lon: float, timezone: str) -> Dict[str, Any]:
    """Calculate complete Human Design chart"""
    try:
        # Birth time (conscious)
        birth_time = datetime(year, month, day, hour, minute)
        
        # Design time (unconscious) - approximately 88 degrees of sun movement before birth
        # This is approximately 88.4 days, not exactly 88 days
        design_time = birth_time - timedelta(days=88, hours=10, minutes=0)  # More accurate timing
        
        # Calculate activations for both times
        design_data = calculate_design_data(birth_time, design_time)
        
        # Combine conscious and unconscious activations
        all_activations: Dict[str, PlanetActivation] = {}
        all_activations.update(design_data["conscious"])
        all_activations.update(design_data["unconscious"])
        
        # Analyze definition
        definition = analyze_definition(all_activations)
        
        # Determine type and authority
        hd_type, authority = determine_type_and_authority(definition)
        
        # Create comprehensive Human Design data
        human_design_chart: Dict[str, Any] = {
            "birth_info": {
                "conscious_time": birth_time.isoformat(),
                "unconscious_time": design_time.isoformat(),
                "location": {"latitude": lat, "longitude": lon, "timezone": timezone}
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
                "unconscious": design_data["unconscious"]
            },
            "definition": definition,
            "defined_centers": definition["defined_centers"],
            "undefined_centers": [center for center in CENTERS.keys() if center not in definition["defined_centers"]],
            "gates": [{"number": gate, "name": GATES.get(gate, {}).get("name", "Unknown"), "center": GATES.get(gate, {}).get("center", "Unknown")} for gate in definition["defined_gates"]],
            "channels": definition["channels"],
            "centers": {
                center: {
                    "defined": center in definition["defined_centers"],
                    "gates": definition["center_activations"].get(center, []),
                    "info": CENTERS.get(center, {})
                }
                for center in CENTERS.keys()
            },
            "profile": calculate_profile(design_data),
            "incarnation_cross": calculate_incarnation_cross(design_data),
            "variables": calculate_variables(design_data)
        }
        
        return human_design_chart
    except Exception as e:
        logger.error(f"Error calculating Human Design: {str(e)}", exc_info=True)
        return {"error": f"Human Design calculation failed: {str(e)}"}

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
            "1/3": "Investigator/Martyr - Life theme of study and trial and error",
            "1/4": "Investigator/Opportunist - Life theme of study and networking",
            "2/4": "Hermit/Opportunist - Natural talent with networking gift",
            "2/5": "Hermit/Heretic - Natural talent with leadership potential",
            "3/5": "Martyr/Heretic - Trial and error leading to wisdom",
            "3/6": "Martyr/Role Model - Life in three phases of development",
            "4/6": "Opportunist/Role Model - Networking leading to wisdom",
            "4/1": "Opportunist/Investigator - Networking with deep study",
            "5/1": "Heretic/Investigator - Leadership through investigation",
            "5/2": "Heretic/Hermit - Universal leadership with natural talent",
            "6/2": "Role Model/Hermit - Wisdom combined with natural gifts",
            "6/3": "Role Model/Martyr - Wisdom through life experience"
        }
        
        return {
            "number": profile_number,
            "personality_line": personality_line,
            "design_line": design_line,
            "description": profiles.get(profile_number, "Unknown profile combination")
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
        cross_name = f"Right Angle Cross of {GATES.get(sun_personality, {}).get('name', 'Unknown')}"
        
        return {
            "name": cross_name,
            "gates": {
                "sun_personality": sun_personality,
                "earth_personality": earth_personality,
                "sun_design": sun_design,
                "earth_design": earth_design
            },
            "description": "Your life purpose and the energy you bring to the world"
        }
    except Exception as e:
        logger.error(f"Error calculating incarnation cross: {str(e)}")
        return {"name": "Cross calculation error", "gates": {}, "description": ""}

def calculate_variables(design_data: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate the Variables (PHS - Primary Health System)"""
    try:
        # This is a simplified version - full variables require more complex calculations
        return {
            "digestion": "Appetite - eat when hungry",
            "environment": "Markets - busy, social environments",
            "awareness": "Taste - taste-oriented awareness",
            "perspective": "Personal - individual perspective",
            "description": "Variables determine your optimal environment and health strategy"
        }
    except Exception as e:
        logger.error(f"Error calculating variables: {str(e)}")
        return {"description": "Variables calculation error"}
