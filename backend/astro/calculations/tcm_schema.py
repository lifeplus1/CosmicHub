# backend/astro/calculations/tcm_schema.py
"""
TCM (Traditional Chinese Medicine) Database Schema
AI #3: Backend Architecture Specialist Implementation
"""

from typing import Any, Dict, List, Optional, TypedDict, Final
from enum import Enum

# ===== TYPE DEFINITIONS =====

class TCMElement(Enum):
    """Five Elements of TCM"""
    WOOD = "wood"
    FIRE = "fire" 
    EARTH = "earth"
    METAL = "metal"
    WATER = "water"

class TCMOrgan(Enum):
    """TCM Organ Systems"""
    LIVER = "liver"
    HEART = "heart"
    SPLEEN = "spleen"
    LUNG = "lung"
    KIDNEY = "kidney"
    GALLBLADDER = "gallbladder"
    SMALL_INTESTINE = "small_intestine"
    STOMACH = "stomach"
    LARGE_INTESTINE = "large_intestine"
    BLADDER = "bladder"
    PERICARDIUM = "pericardium"
    TRIPLE_HEATER = "triple_heater"

class TCMConstitution(TypedDict):
    """TCM Constitutional Type"""
    type_name: str
    primary_element: str
    secondary_element: Optional[str]
    dominant_organs: List[str]
    characteristics: List[str]
    emotional_tendencies: List[str]
    physical_traits: List[str]
    astrological_correlations: Dict[str, str]
    health_recommendations: List[str]
    optimal_seasons: List[str]
    
class TCMElementData(TypedDict):
    """Five Element System Data"""
    element: str
    yin_organ: str
    yang_organ: str
    emotion_balanced: str
    emotion_imbalanced: str
    season: str
    direction: str
    color: str
    taste: str
    body_tissue: str
    sense_organ: str
    sound: str
    climate: str
    astrological_planets: List[str]
    birth_timing_influence: Dict[str, float]
    meridian_flow_hours: Dict[str, str]

class TCMAstrologicalMapping(TypedDict):
    """TCM-Astrology Correspondence"""
    planet: str
    primary_element: str  # Changed from tcm_element
    organ_system: str
    emotional_quality: str
    physical_influence: str
    optimal_timing: str
    challenging_aspects: List[str]
    harmonious_aspects: List[str]

class TCMAnalysisResult(TypedDict):
    """Complete TCM Analysis Result"""
    user_id: str
    birth_data: Dict[str, Any]
    primary_constitution: TCMConstitution
    elemental_balance: Dict[str, float]
    organ_strength_analysis: Dict[str, Dict[str, Any]]
    seasonal_influences: Dict[str, Any]
    health_guidance: Dict[str, Any]
    astrological_correlations: List[TCMAstrologicalMapping]
    lifestyle_recommendations: Dict[str, List[str]]
    treatment_suggestions: Dict[str, List[str]]
    analysis_confidence: float
    timestamp: str

# ===== TCM CONSTANTS AND DATA =====

TCM_FIVE_ELEMENTS_DATA: Dict[str, TCMElementData] = {
    "wood": {
        "element": "wood",
        "yin_organ": "liver", 
        "yang_organ": "gallbladder",
        "emotion_balanced": "patience_planning",
        "emotion_imbalanced": "anger_frustration",
        "season": "spring",
        "direction": "east",
        "color": "green",
        "taste": "sour",
        "body_tissue": "tendons_ligaments",
        "sense_organ": "eyes",
        "sound": "shouting",
        "climate": "windy",
        "astrological_planets": ["Jupiter", "Mars"],
        "birth_timing_influence": {
            "spring_months": 1.0,
            "morning_hours": 0.8,
            "jupiter_aspects": 0.9
        },
        "meridian_flow_hours": {
            "liver": "1:00-3:00 AM",
            "gallbladder": "11:00 PM-1:00 AM"
        }
    },
    "fire": {
        "element": "fire",
        "yin_organ": "heart",
        "yang_organ": "small_intestine", 
        "emotion_balanced": "joy_enthusiasm",
        "emotion_imbalanced": "anxiety_overexcitement",
        "season": "summer",
        "direction": "south", 
        "color": "red",
        "taste": "bitter",
        "body_tissue": "blood_vessels",
        "sense_organ": "tongue",
        "sound": "laughing",
        "climate": "hot",
        "astrological_planets": ["Sun", "Mars"],
        "birth_timing_influence": {
            "summer_months": 1.0,
            "midday_hours": 0.9,
            "sun_aspects": 1.0
        },
        "meridian_flow_hours": {
            "heart": "11:00 AM-1:00 PM",
            "small_intestine": "1:00-3:00 PM"
        }
    },
    "earth": {
        "element": "earth",
        "yin_organ": "spleen",
        "yang_organ": "stomach",
        "emotion_balanced": "empathy_stability",
        "emotion_imbalanced": "worry_overthinking",
        "season": "late_summer",
        "direction": "center",
        "color": "yellow",
        "taste": "sweet",
        "body_tissue": "muscles_flesh",
        "sense_organ": "mouth",
        "sound": "singing",
        "climate": "humid",
        "astrological_planets": ["Saturn", "Venus"],
        "birth_timing_influence": {
            "late_summer": 1.0,
            "seasonal_transitions": 0.8,
            "saturn_aspects": 0.9
        },
        "meridian_flow_hours": {
            "spleen": "9:00-11:00 AM",
            "stomach": "7:00-9:00 AM"
        }
    },
    "metal": {
        "element": "metal",
        "yin_organ": "lung",
        "yang_organ": "large_intestine",
        "emotion_balanced": "clarity_precision",
        "emotion_imbalanced": "grief_rigidity",
        "season": "autumn",
        "direction": "west",
        "color": "white",
        "taste": "spicy",
        "body_tissue": "skin_hair",
        "sense_organ": "nose",
        "sound": "weeping", 
        "climate": "dry",
        "astrological_planets": ["Mercury", "Venus"],
        "birth_timing_influence": {
            "autumn_months": 1.0,
            "evening_hours": 0.8,
            "mercury_aspects": 0.9
        },
        "meridian_flow_hours": {
            "lung": "3:00-5:00 AM",
            "large_intestine": "5:00-7:00 AM"
        }
    },
    "water": {
        "element": "water",
        "yin_organ": "kidney",
        "yang_organ": "bladder",
        "emotion_balanced": "wisdom_will",
        "emotion_imbalanced": "fear_indecision",
        "season": "winter",
        "direction": "north",
        "color": "black_blue",
        "taste": "salty",
        "body_tissue": "bones_marrow",
        "sense_organ": "ears",
        "sound": "groaning",
        "climate": "cold",
        "astrological_planets": ["Moon", "Pluto"],
        "birth_timing_influence": {
            "winter_months": 1.0,
            "night_hours": 0.9,
            "moon_aspects": 1.0
        },
        "meridian_flow_hours": {
            "kidney": "5:00-7:00 PM",
            "bladder": "3:00-5:00 PM"
        }
    }
}

TCM_CONSTITUTIONAL_TYPES: Dict[str, TCMConstitution] = {
    "wood_dominant": {
        "type_name": "Wood Constitution",
        "primary_element": "wood",
        "secondary_element": "fire",
        "dominant_organs": ["liver", "gallbladder"],
        "characteristics": [
            "Natural leader and visionary",
            "Strong planning and organizational skills",
            "Creative and innovative thinking",
            "Goal-oriented and determined"
        ],
        "emotional_tendencies": [
            "Quick to anger when blocked",
            "Impatient with inefficiency",
            "Strong sense of justice",
            "Emotional flexibility when healthy"
        ],
        "physical_traits": [
            "Athletic build with good muscle tone",
            "Strong eyes and clear vision", 
            "Tendency toward headaches when stressed",
            "Liver sensitivity to alcohol and toxins"
        ],
        "astrological_correlations": {
            "jupiter": "Vision and expansion",
            "mars": "Initiative and action",
            "fire_signs": "Natural leadership",
            "cardinal_signs": "Pioneering spirit"
        },
        "health_recommendations": [
            "Regular exercise to move liver qi",
            "Anger management and stress reduction",
            "Avoid excessive alcohol and processed foods",
            "Spring detoxification practices"
        ],
        "optimal_seasons": ["spring", "early_summer"]
    },
    "fire_dominant": {
        "type_name": "Fire Constitution",
        "primary_element": "fire",
        "secondary_element": "earth",
        "dominant_organs": ["heart", "small_intestine"],
        "characteristics": [
            "Charismatic and inspiring personality",
            "Natural communicator and entertainer", 
            "Warm and generous nature",
            "Strong intuitive abilities"
        ],
        "emotional_tendencies": [
            "Joyful and enthusiastic",
            "Sensitive to emotional atmospheres",
            "Can become overstimulated easily",
            "Needs emotional connection"
        ],
        "physical_traits": [
            "Often has rosy complexion",
            "Strong cardiovascular system when balanced",
            "Tendency toward heart palpitations when stressed",
            "Sensitive to hot climates"
        ],
        "astrological_correlations": {
            "sun": "Vital life force and identity",
            "mars": "Passionate expression",
            "fire_signs": "Natural enthusiasm",
            "leo": "Heart-centered leadership"
        },
        "health_recommendations": [
            "Heart-healthy diet low in stimulants",
            "Meditation and calming practices",
            "Avoid overexcitement and overstimulation",
            "Summer cooling practices"
        ],
        "optimal_seasons": ["summer", "late_spring"]
    }
    # Additional constitutional types would continue here...
}

# ===== ASTROLOGY-TCM CORRELATION MAPPINGS =====

PLANET_TCM_CORRELATIONS: Dict[str, TCMAstrologicalMapping] = {
    "sun": {
        "planet": "sun",
        "primary_element": "fire",
        "organ_system": "heart",
        "emotional_quality": "joy_vitality",
        "physical_influence": "circulation_warmth",
        "optimal_timing": "summer_midday",
        "challenging_aspects": ["saturn_square", "mars_opposition"],
        "harmonious_aspects": ["jupiter_trine", "venus_sextile"]
    },
    "moon": {
        "planet": "moon",
        "primary_element": "water", 
        "organ_system": "kidney_bladder",
        "emotional_quality": "wisdom_intuition",
        "physical_influence": "fluid_balance_reproduction",
        "optimal_timing": "winter_night",
        "challenging_aspects": ["saturn_square", "mars_square"],
        "harmonious_aspects": ["venus_trine", "neptune_sextile"]
    },
    "mercury": {
        "planet": "mercury",
        "primary_element": "metal",
        "organ_system": "lung_large_intestine", 
        "emotional_quality": "clarity_communication",
        "physical_influence": "breathing_elimination",
        "optimal_timing": "autumn_morning",
        "challenging_aspects": ["saturn_square", "neptune_opposition"],
        "harmonious_aspects": ["venus_sextile", "jupiter_trine"]
    },
    "venus": {
        "planet": "venus",
        "primary_element": "earth_metal",
        "organ_system": "spleen_lung",
        "emotional_quality": "harmony_beauty",
        "physical_influence": "digestion_skin",
        "optimal_timing": "late_summer_evening",
        "challenging_aspects": ["mars_square", "saturn_opposition"],
        "harmonious_aspects": ["jupiter_trine", "neptune_sextile"]
    },
    "mars": {
        "planet": "mars",
        "primary_element": "fire_wood",
        "organ_system": "heart_liver",
        "emotional_quality": "courage_action",
        "physical_influence": "blood_circulation_muscles",
        "optimal_timing": "spring_summer",
        "challenging_aspects": ["saturn_square", "neptune_square"],
        "harmonious_aspects": ["jupiter_trine", "sun_conjunction"]
    },
    "jupiter": {
        "planet": "jupiter",
        "primary_element": "wood",
        "organ_system": "liver_gallbladder",
        "emotional_quality": "vision_growth",
        "physical_influence": "detoxification_planning",
        "optimal_timing": "spring_morning",
        "challenging_aspects": ["saturn_opposition", "neptune_square"],
        "harmonious_aspects": ["sun_trine", "venus_sextile"]
    },
    "saturn": {
        "planet": "saturn",
        "primary_element": "earth_water",
        "organ_system": "kidney_spleen",
        "emotional_quality": "discipline_wisdom",
        "physical_influence": "bones_structure",
        "optimal_timing": "winter_late_summer",
        "challenging_aspects": ["mars_square", "sun_opposition"],
        "harmonious_aspects": ["venus_trine", "mercury_sextile"]
    }
}

# ===== FIRESTORE COLLECTION SCHEMAS =====

TCM_COLLECTIONS: Dict[str, Dict[str, Any]] = {
    "tcm_constitutions": {
        "description": "TCM constitutional analysis results",
        "fields": {
            "user_id": "string",
            "birth_data": "map",
            "primary_constitution": "map",
            "elemental_balance": "map", 
            "analysis_confidence": "number",
            "timestamp": "timestamp"
        },
        "indexes": [
            ["user_id", "timestamp"],
            ["primary_constitution.primary_element", "analysis_confidence"]
        ]
    },
    "tcm_element_data": {
        "description": "Five Elements reference data",
        "fields": {
            "element": "string",
            "organ_systems": "map",
            "astrological_correlations": "map",
            "seasonal_influences": "map"
        }
    },
    "tcm_health_recommendations": {
        "description": "Personalized TCM health guidance",
        "fields": {
            "user_id": "string", 
            "constitution_type": "string",
            "dietary_guidance": "array",
            "lifestyle_recommendations": "array",
            "seasonal_adjustments": "map",
            "treatment_modalities": "array"
        }
    }
}

# ===== VALIDATION FUNCTIONS =====

def validate_tcm_constitution(data: Dict[str, Any]) -> bool:
    """Validate TCM constitution data"""
    required_fields = ["type_name", "primary_element", "dominant_organs"]
    return all(field in data for field in required_fields)

def validate_elemental_balance(balance: Dict[str, float]) -> bool:
    """Validate elemental balance percentages"""
    elements = ["wood", "fire", "earth", "metal", "water"]
    return (
        all(element in balance for element in elements) and
        abs(sum(balance.values()) - 1.0) < 0.01  # Should sum to approximately 1.0
    )

# ===== EXPORT DEFINITIONS =====

__all__ = [
    "TCMElement",
    "TCMOrgan", 
    "TCMConstitution",
    "TCMElementData",
    "TCMAstrologicalMapping",
    "TCMAnalysisResult",
    "TCM_FIVE_ELEMENTS_DATA",
    "TCM_CONSTITUTIONAL_TYPES",
    "PLANET_TCM_CORRELATIONS",
    "TCM_COLLECTIONS",
    "validate_tcm_constitution",
    "validate_elemental_balance"
]
