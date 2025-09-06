# backend/astro/calculations/tcm_schema.py
"""
TCM (Traditional Chinese Medicine) Database Schema
AI #3: Backend Architecture Specialist Implementation

This module provides comprehensive type definitions for Traditional Chinese Medicine
analysis integration with astrological calculations. It defines strict type safety
for all TCM-related data structures and validation functions.

Key Features:
- Five Element Theory types and data structures
- Constitutional analysis result types  
- Organ system analysis with detailed health guidance
- Seasonal influence calculations
- Astrological correlation mappings
- Firestore collection schemas for data persistence
"""

from typing import Dict, List, Optional, TypedDict, Union, Literal, NewType, Mapping
from enum import Enum

# ===== TYPE ALIASES =====

# Strength values range from 0.0 (weakest) to 1.0 (strongest)
StrengthScore = NewType('StrengthScore', float)

# Confidence values range from 0.0 (lowest) to 1.0 (highest)
ConfidenceScore = NewType('ConfidenceScore', float)

# Element balance values range from 0.0 (deficient) to 1.0 (excessive)  
ElementBalance = NewType('ElementBalance', float)

# ===== TYPE DEFINITIONS =====

class TCMElement(Enum):
    """
    Five Elements of Traditional Chinese Medicine
    
    Each element represents fundamental life forces and has specific
    correspondences with organs, emotions, seasons, and celestial bodies.
    """
    WOOD = "wood"      # Spring, growth, liver/gallbladder, Jupiter
    FIRE = "fire"      # Summer, expansion, heart/small intestine, Mars
    EARTH = "earth"    # Late summer, stability, spleen/stomach, Saturn
    METAL = "metal"    # Autumn, contraction, lung/large intestine, Venus
    WATER = "water"    # Winter, conservation, kidney/bladder, Mercury

class TCMOrgan(Enum):
    """
    TCM Organ Systems (Zang-Fu Theory)
    
    Includes both Yin organs (Zang) that store essence and Yang organs (Fu)
    that transport and transform substances. Each has specific functions
    beyond the physical organ in Western medicine.
    """
    # Yin Organs (Zang) - Store essence
    LIVER = "liver"              # Stores blood, governs free flow of qi
    HEART = "heart"              # Houses spirit, governs blood circulation  
    SPLEEN = "spleen"            # Governs transformation and transportation
    LUNG = "lung"                # Governs qi and respiration
    KIDNEY = "kidney"            # Stores essence, governs growth and reproduction
    PERICARDIUM = "pericardium"  # Protects the heart
    
    # Yang Organs (Fu) - Transform and transport
    GALLBLADDER = "gallbladder"           # Stores and secretes bile
    SMALL_INTESTINE = "small_intestine"   # Separates pure from impure
    STOMACH = "stomach"                   # Receives and ripens food
    LARGE_INTESTINE = "large_intestine"   # Transports and excretes waste
    BLADDER = "bladder"                   # Stores and excretes urine
    TRIPLE_HEATER = "triple_heater"       # Regulates water passages

class ConstitutionType(Enum):
    """TCM Constitutional Types based on dominant element patterns"""
    WOOD_DOMINANT = "wood_dominant"        # Goal-oriented, driven personality
    FIRE_DOMINANT = "fire_dominant"        # Enthusiastic, social personality
    EARTH_DOMINANT = "earth_dominant"      # Nurturing, stable personality
    METAL_DOMINANT = "metal_dominant"      # Organized, detail-oriented personality
    WATER_DOMINANT = "water_dominant"      # Introspective, wise personality
    BALANCED = "balanced"                  # No single element dominates

class BalanceState(Enum):
    """Organ system balance states in TCM diagnosis"""
    STRONG = "strong"           # Abundant qi, optimal function
    BALANCED = "balanced"       # Normal qi flow, healthy function
    WEAK = "weak"              # Slightly deficient qi, minor dysfunction
    DEFICIENT = "deficient"    # Significantly low qi, notable symptoms
    STAGNANT = "stagnant"      # Blocked qi flow, stress symptoms
    EXCESSIVE = "excessive"    # Overactive qi, hyperfunction symptoms

# ===== ADDITIONAL TYPE DEFINITIONS =====

class BirthData(TypedDict):
    """
    Birth data for TCM analysis
    
    Contains precise birth timing and location data required for
    accurate astrological-TCM correlation calculations.
    """
    year: int                    # Birth year (e.g., 1990)
    month: int                   # Birth month (1-12)
    day: int                     # Birth day (1-31)
    hour: int                    # Birth hour (0-23)
    minute: int                  # Birth minute (0-59)
    latitude: float              # Birth latitude (-90.0 to 90.0)
    longitude: float             # Birth longitude (-180.0 to 180.0)
    timezone: str                # Timezone identifier (e.g., "UTC", "America/New_York")

class OrganAnalysis(TypedDict):
    """
    Analysis of individual organ systems in TCM
    
    Provides detailed assessment of each organ's energetic state,
    including recommendations for balancing and strengthening.
    """
    strength: StrengthScore                              # Organ qi strength (0.0-1.0)
    element: str                                         # Associated TCM element
    balance_state: Literal["strong", "balanced", "weak", "deficient", "stagnant", "excessive"]
    recommendations: List[str]                           # Specific health recommendations
    meridian_hours: str                                  # Peak energy flow hours (e.g., "3-5 AM")
    seasonal_affinity: str                               # Most supportive season
    symptoms_when_imbalanced: List[str]                  # Common symptoms of imbalance
    foods_to_strengthen: List[str]                       # Foods that support this organ
    emotions_associated: List[str]                       # Related emotional patterns

class SeasonalInfluence(TypedDict):
    """
    Seasonal influence on constitutional patterns
    
    Describes how different seasons affect the individual's
    energy patterns and provides seasonal wellness guidance.
    """
    season: str                                          # Season name
    influence_strength: float                            # How strongly this season affects person (0.0-1.0)
    recommendations: List[str]                           # General seasonal recommendations
    optimal_activities: List[str]                        # Best activities for this season
    foods_to_favor: List[str]                           # Seasonal foods to emphasize
    foods_to_avoid: List[str]                           # Foods to minimize this season
    energy_patterns: str                                 # Expected energy changes
    potential_challenges: List[str]                      # Common seasonal challenges for this constitution

class HealthGuidance(TypedDict):
    """
    Comprehensive health guidance based on TCM analysis
    
    Provides holistic wellness recommendations covering diet,
    lifestyle, exercise, and emotional balance strategies.
    """
    constitutional_strengths: List[str]                  # Natural strengths of this constitution
    potential_weaknesses: List[str]                      # Areas requiring attention
    dietary_guidelines: Dict[str, List[str]]             # Detailed dietary recommendations by category
    exercise_recommendations: List[str]                  # Optimal exercise types and timing
    lifestyle_patterns: Dict[str, List[str]]             # Daily routine recommendations
    preventive_measures: List[str]                       # Prevention strategies for common issues
    seasonal_adjustments: Dict[str, List[str]]           # Season-specific modifications
    emotional_balance_tips: List[str]                    # Emotional wellness strategies
    sleep_recommendations: Dict[str, str]                # Optimal sleep patterns and environment
    stress_management: List[str]                         # Stress reduction techniques

class TCMConstitution(TypedDict):
    """
    TCM Constitutional Type Analysis
    
    Defines an individual's fundamental constitutional pattern based on
    Five Element Theory, including physical, emotional, and energetic characteristics.
    """
    # Required fields
    type_name: str                                       # Constitutional type name (e.g., "Wood Constitution")
    primary_element: str                                 # Dominant element (wood, fire, earth, metal, water)
    secondary_element: Optional[str]                     # Secondary influential element
    dominant_organs: List[str]                           # Primary organ systems for this constitution
    characteristics: List[str]                           # Key constitutional characteristics
    emotional_tendencies: List[str]                      # Typical emotional patterns
    physical_traits: List[str]                          # Common physical characteristics
    astrological_correlations: Dict[str, str]            # Planetary and sign correlations
    health_recommendations: List[str]                    # Constitution-specific health advice
    optimal_seasons: List[str]                          # Most supportive seasons

class TCMConstitutionExtended(TCMConstitution, total=False):
    """Extended TCM Constitution with optional enhanced fields"""
    learning_style: str                                 # Preferred learning and processing style
    career_affinities: List[str]                        # Career types that suit this constitution
    relationship_patterns: List[str]                     # Typical relationship dynamics
    spiritual_practices: List[str]                       # Recommended spiritual/meditation practices

class TCMElementData(TypedDict):
    """
    Five Element System Reference Data
    
    Complete reference information for each of the five elements,
    including all traditional correspondences and modern correlations.
    """
    # Required fields
    element: str                                         # Element name
    yin_organ: str                                       # Primary yin organ
    yang_organ: str                                      # Primary yang organ
    emotion_balanced: str                                # Emotion when element is balanced
    emotion_imbalanced: str                              # Emotion when element is imbalanced
    season: str                                          # Associated season
    direction: str                                       # Compass direction
    color: str                                           # Associated color
    taste: str                                           # Associated taste
    body_tissue: str                                     # Governed body tissue
    sense_organ: str                                     # Associated sense organ
    sound: str                                           # Vocal expression when imbalanced
    climate: str                                         # Environmental preference
    astrological_planets: List[str]                      # Correlated planets
    birth_timing_influence: Dict[str, float]             # Birth time influence weights
    meridian_flow_hours: Dict[str, str]                  # Optimal energy flow hours

class TCMElementDataExtended(TCMElementData, total=False):
    """Extended TCM Element Data with optional enhanced fields"""
    development_stage: str                               # Life development stage association
    virtues: List[str]                                   # Positive qualities when balanced
    challenges: List[str]                                # Common challenges when imbalanced

class TCMAstrologicalMapping(TypedDict):
    """
    TCM-Astrology Correspondence Mapping
    
    Defines correlations between astrological factors and TCM elements/organs,
    enabling integrated analysis of celestial and energetic influences.
    """
    # Required fields
    planet: str                                          # Astrological planet
    primary_element: str                                 # Associated TCM element
    organ_system: str                                    # Correlated organ system
    emotional_quality: str                               # Emotional influence
    physical_influence: str                              # Physical/health influence
    optimal_timing: str                                  # Best timing for related activities
    challenging_aspects: List[str]                       # Potentially difficult astrological aspects
    harmonious_aspects: List[str]                        # Supportive astrological aspects

class TCMAstrologicalMappingExtended(TCMAstrologicalMapping, total=False):
    """Extended TCM Astrological Mapping with optional enhanced fields"""
    transiting_effects: Dict[str, str]                   # Effects during planetary transits
    retrograde_influence: str                            # Influence during retrograde periods

class TCMAnalysisResult(TypedDict):
    """
    Complete TCM Analysis Result
    
    Comprehensive analysis result combining constitutional assessment,
    elemental balance analysis, organ system evaluation, and personalized
    health guidance based on Traditional Chinese Medicine principles.
    """
    user_id: str                                         # Unique user identifier
    birth_data: BirthData                               # Complete birth information
    primary_constitution: TCMConstitution               # Dominant constitutional pattern
    elemental_balance: Dict[str, ElementBalance]        # Five element balance scores (0.0-1.0)
    organ_strength_analysis: Dict[str, OrganAnalysis]   # Detailed organ system analysis
    seasonal_influences: Dict[str, SeasonalInfluence]   # Seasonal effect patterns
    health_guidance: HealthGuidance                     # Comprehensive health recommendations
    astrological_correlations: List[TCMAstrologicalMapping]  # Astrological-TCM correlations
    lifestyle_recommendations: Dict[str, List[str]]     # Lifestyle guidance by category
    treatment_suggestions: Dict[str, List[str]]         # Therapeutic recommendations
    analysis_confidence: ConfidenceScore               # Overall analysis confidence (0.0-1.0)
    timestamp: str                                      # Analysis creation timestamp (ISO format)

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

# Define collection schema types
class FirestoreFieldSchema(TypedDict):
    type: str
    required: bool
    description: Optional[str]

class FirestoreCollectionSchema(TypedDict, total=False):
    description: str
    fields: Dict[str, Union[str, FirestoreFieldSchema]]
    indexes: List[List[str]]

TCM_COLLECTIONS: Dict[str, FirestoreCollectionSchema] = {
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

def validate_tcm_constitution(data: Union[TCMConstitution, Dict[str, Union[str, List[str], Dict[str, str], None]]]) -> bool:
    """
    Validate TCM constitution data structure
    
    Args:
        data: Constitution data dictionary to validate
        
    Returns:
        bool: True if data contains required fields and valid structure
    """
    required_fields = ["type_name", "primary_element", "dominant_organs"]
    return all(field in data for field in required_fields)

def validate_elemental_balance(balance: Mapping[str, Union[float, ElementBalance]]) -> bool:
    """
    Validate elemental balance percentages
    
    Args:
        balance: Dictionary mapping element names to balance scores
        
    Returns:
        bool: True if balance contains all five elements with valid scores (0.0-1.0)
    """
    elements = ["wood", "fire", "earth", "metal", "water"]
    return (
        all(element in balance for element in elements) and
        all(0.0 <= float(score) <= 1.0 for score in balance.values()) and
        len(balance) == 5
    )

def validate_birth_data(birth_data: BirthData) -> bool:
    """
    Validate birth data for TCM analysis
    
    Args:
        birth_data: Birth data dictionary to validate
        
    Returns:
        bool: True if birth data contains valid date/time/location information
    """
    try:
        # Basic range validation
        valid_year = 1900 <= birth_data['year'] <= 2100
        valid_month = 1 <= birth_data['month'] <= 12
        valid_day = 1 <= birth_data['day'] <= 31
        valid_hour = 0 <= birth_data['hour'] <= 23
        valid_minute = 0 <= birth_data['minute'] <= 59
        valid_lat = -90.0 <= birth_data['latitude'] <= 90.0
        valid_lon = -180.0 <= birth_data['longitude'] <= 180.0
        
        return all([valid_year, valid_month, valid_day, valid_hour, 
                   valid_minute, valid_lat, valid_lon])
    except (KeyError, TypeError):
        return False

def validate_organ_analysis(analysis: OrganAnalysis) -> bool:
    """
    Validate organ analysis data structure
    
    Args:
        analysis: Organ analysis dictionary to validate
        
    Returns:
        bool: True if analysis contains valid structure and data ranges
    """
    try:
        valid_strength = 0.0 <= analysis['strength'] <= 1.0
        valid_element = analysis['element'] in ["wood", "fire", "earth", "metal", "water"]
        valid_state = analysis['balance_state'] in [
            "strong", "balanced", "weak", "deficient", "stagnant", "excessive"
        ]
        return valid_strength and valid_element and valid_state
    except (KeyError, TypeError):
        return False

def validate_analysis_result(result: TCMAnalysisResult) -> bool:
    """
    Validate complete TCM analysis result
    
    Args:
        result: Complete analysis result to validate
        
    Returns:
        bool: True if result structure and data are valid
    """
    try:
        # Validate core components
        valid_birth = validate_birth_data(result['birth_data'])
        valid_constitution = validate_tcm_constitution(result['primary_constitution'])
        valid_balance = validate_elemental_balance(result['elemental_balance'])
        valid_confidence = 0.0 <= result['analysis_confidence'] <= 1.0
        
        # Validate organ analyses
        valid_organs = all(
            validate_organ_analysis(analysis) 
            for analysis in result['organ_strength_analysis'].values()
        )
        
        return all([valid_birth, valid_constitution, valid_balance, 
                   valid_confidence, valid_organs])
    except (KeyError, TypeError):
        return False

# ===== EXPORT DEFINITIONS =====

__all__ = [
    # Type Aliases
    "StrengthScore",
    "ConfidenceScore", 
    "ElementBalance",
    
    # Enums
    "TCMElement",
    "TCMOrgan",
    "ConstitutionType",
    "BalanceState",
    
    # TypedDict Classes
    "BirthData",
    "OrganAnalysis",
    "SeasonalInfluence",
    "HealthGuidance",
    "TCMConstitution",
    "TCMElementData",
    "TCMAstrologicalMapping",
    "TCMAnalysisResult",
    "FirestoreFieldSchema",
    "FirestoreCollectionSchema",
    
    # Data Constants
    "TCM_FIVE_ELEMENTS_DATA",
    "TCM_CONSTITUTIONAL_TYPES",
    "PLANET_TCM_CORRELATIONS",
    "TCM_COLLECTIONS",
    
    # Validation Functions
    "validate_tcm_constitution",
    "validate_elemental_balance",
    "validate_birth_data",
    "validate_organ_analysis",
    "validate_analysis_result"
]
