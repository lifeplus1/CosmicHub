"""
Ayurveda Schema Definitions - Constitutional Analysis with Astrological Integration
AI #3: Backend Architecture Specialist Implementation
Following Integration Strategy: ENHANCE vs CREATE NEW approach
"""

from typing import Dict, List, Any, Optional, TypedDict, Literal
from datetime import datetime

# Ayurveda Constitutional Types
AyurvedaConstitutionType = Literal[
    "vata", "pitta", "kapha",
    "vata_pitta", "pitta_kapha", "vata_kapha",
    "tridoshic"
]

# Dosha Balance Levels
DoshaLevel = Literal["low", "moderate", "high", "excess"]

class DoshaBalance(TypedDict):
    """Individual dosha balance assessment"""
    level: DoshaLevel
    percentage: float
    characteristics: List[str]
    imbalance_indicators: List[str]

class AyurvedaConstitution(TypedDict):
    """Complete Ayurvedic constitutional analysis"""
    primary_dosha: str
    secondary_dosha: Optional[str]
    constitution_type: AyurvedaConstitutionType
    prakruti: Dict[str, float]  # Natural constitution
    vikruti: Dict[str, float]   # Current imbalances
    constitutional_traits: List[str]
    dominant_elements: List[str]

class AyurvedaHealthGuidance(TypedDict):
    """Health and lifestyle recommendations"""
    dietary_guidelines: List[str]
    lifestyle_recommendations: List[str]
    seasonal_adjustments: Dict[str, List[str]]
    exercise_recommendations: List[str]
    meditation_practices: List[str]
    herbal_suggestions: List[str]  # Educational only
    daily_routine_suggestions: List[str]

class AstrologyAyurvedaCorrelation(TypedDict):
    """Astrological correlations with Ayurvedic principles"""
    dosha_planetary_rulers: Dict[str, List[str]]
    elemental_correspondences: Dict[str, List[str]]
    house_correlations: Dict[str, List[int]]
    sign_affinities: Dict[str, List[str]]
    lunar_cycle_effects: Dict[str, str]

class AyurvedaAnalysisResult(TypedDict):
    """Complete Ayurveda analysis result"""
    user_id: Optional[str]
    birth_data: Dict[str, Any]
    constitution: AyurvedaConstitution
    dosha_analysis: Dict[str, DoshaBalance]
    health_guidance: AyurvedaHealthGuidance
    astrological_correlations: AstrologyAyurvedaCorrelation
    seasonal_recommendations: Dict[str, Dict[str, Any]]
    analysis_confidence: float
    calculation_method: str
    timestamp: str

# Comprehensive Ayurveda-Astrology Data
AYURVEDA_DOSHA_DATA: Dict[str, Dict[str, Any]] = {
    "vata": {
        "elements": ["air", "space"],
        "qualities": ["dry", "light", "cold", "rough", "subtle", "mobile"],
        "functions": ["movement", "circulation", "nervous_system", "elimination"],
        "body_type": ["thin", "light_frame", "variable_weight"],
        "mental_traits": ["creative", "quick_thinking", "enthusiastic", "changeable"],
        "physical_traits": ["dry_skin", "cold_hands_feet", "light_sleep"],
        "imbalance_signs": ["anxiety", "insomnia", "digestive_issues", "joint_pain"],
        "planetary_rulers": ["saturn", "mercury", "uranus"],
        "astrological_signs": ["gemini", "virgo", "aquarius"],
        "houses": [3, 6, 11],
        "seasons": ["autumn", "winter"],
        "times": ["dawn", "dusk"],
        "life_stage": "old_age"
    },
    "pitta": {
        "elements": ["fire", "water"],
        "qualities": ["hot", "sharp", "light", "oily", "liquid", "penetrating"],
        "functions": ["digestion", "metabolism", "temperature_regulation", "intelligence"],
        "body_type": ["medium_build", "muscular", "warm_body"],
        "mental_traits": ["focused", "intelligent", "goal_oriented", "competitive"],
        "physical_traits": ["warm_skin", "good_digestion", "strong_appetite"],
        "imbalance_signs": ["anger", "inflammation", "acidity", "skin_issues"],
        "planetary_rulers": ["sun", "mars", "jupiter"],
        "astrological_signs": ["aries", "leo", "sagittarius"],
        "houses": [1, 5, 9],
        "seasons": ["summer"],
        "times": ["midday", "midnight"],
        "life_stage": "middle_age"
    },
    "kapha": {
        "elements": ["earth", "water"],
        "qualities": ["heavy", "slow", "cold", "oily", "smooth", "stable"],
        "functions": ["structure", "lubrication", "immunity", "growth"],
        "body_type": ["large_frame", "heavy_build", "stable_weight"],
        "mental_traits": ["calm", "stable", "loving", "forgiving"],
        "physical_traits": ["smooth_skin", "thick_hair", "deep_sleep"],
        "imbalance_signs": ["lethargy", "weight_gain", "congestion", "depression"],
        "planetary_rulers": ["moon", "venus", "neptune"],
        "astrological_signs": ["taurus", "cancer", "pisces", "capricorn"],
        "houses": [2, 4, 8, 10],
        "seasons": ["spring", "late_winter"],
        "times": ["morning", "evening"],
        "life_stage": "childhood"
    }
}

# Detailed Planetary Correspondences for Ayurveda
PLANET_AYURVEDA_CORRELATIONS: Dict[str, Dict[str, Any]] = {
    "sun": {
        "primary_dosha": "pitta",
        "element": "fire",
        "body_systems": ["digestive_fire", "heart", "circulation"],
        "psychological_functions": ["confidence", "leadership", "vitality"],
        "imbalance_effects": ["ego_inflammation", "heart_issues", "fever"],
        "balancing_practices": ["cooling_pranayama", "moon_salutation", "heart_opening"]
    },
    "moon": {
        "primary_dosha": "kapha",
        "element": "water",
        "body_systems": ["lymphatic", "reproductive", "emotional"],
        "psychological_functions": ["nurturing", "intuition", "emotional_balance"],
        "imbalance_effects": ["emotional_instability", "water_retention", "mood_swings"],
        "balancing_practices": ["lunar_breathing", "gentle_flow", "emotional_release"]
    },
    "mars": {
        "primary_dosha": "pitta",
        "element": "fire",
        "body_systems": ["muscular", "blood", "immune_response"],
        "psychological_functions": ["courage", "determination", "action"],
        "imbalance_effects": ["anger", "inflammation", "aggressive_behavior"],
        "balancing_practices": ["cooling_asanas", "patience_meditation", "ahimsa_practice"]
    },
    "mercury": {
        "primary_dosha": "vata",
        "element": "air",
        "body_systems": ["nervous", "respiratory", "communication"],
        "psychological_functions": ["intelligence", "adaptability", "learning"],
        "imbalance_effects": ["mental_restlessness", "communication_issues", "anxiety"],
        "balancing_practices": ["grounding_meditation", "pranayama", "mantra_chanting"]
    },
    "jupiter": {
        "primary_dosha": "kapha",
        "element": "space",
        "body_systems": ["endocrine", "growth", "wisdom_centers"],
        "psychological_functions": ["wisdom", "expansion", "spiritual_growth"],
        "imbalance_effects": ["excess_growth", "materialism", "spiritual_pride"],
        "balancing_practices": ["dharana", "study", "selfless_service"]
    },
    "venus": {
        "primary_dosha": "kapha",
        "element": "water",
        "body_systems": ["reproductive", "kidney", "beauty"],
        "psychological_functions": ["love", "harmony", "aesthetic_sense"],
        "imbalance_effects": ["attachment", "excess_pleasure", "relationship_issues"],
        "balancing_practices": ["bhakti_yoga", "beauty_appreciation", "loving_kindness"]
    },
    "saturn": {
        "primary_dosha": "vata",
        "element": "air",
        "body_systems": ["skeletal", "chronic_conditions", "aging"],
        "psychological_functions": ["discipline", "structure", "spiritual_lessons"],
        "imbalance_effects": ["fear", "restriction", "chronic_illness"],
        "balancing_practices": ["patience_cultivation", "routine_establishment", "surrendering"]
    },
    "uranus": {
        "primary_dosha": "vata",
        "element": "space",
        "body_systems": ["nervous_innovation", "sudden_changes", "awakening"],
        "psychological_functions": ["intuition", "innovation", "liberation"],
        "imbalance_effects": ["nervous_tension", "erratic_behavior", "revolutionary_excess"],
        "balancing_practices": ["grounding_techniques", "stability_building", "mindful_change"]
    },
    "neptune": {
        "primary_dosha": "kapha",
        "element": "water",
        "body_systems": ["pineal", "psychic_centers", "dissolution"],
        "psychological_functions": ["spirituality", "compassion", "transcendence"],
        "imbalance_effects": ["confusion", "escapism", "psychic_overwhelm"],
        "balancing_practices": ["clarity_meditation", "discrimination", "spiritual_guidance"]
    },
    "pluto": {
        "primary_dosha": "pitta",
        "element": "fire",
        "body_systems": ["transformation", "regeneration", "elimination"],
        "psychological_functions": ["transformation", "power", "rebirth"],
        "imbalance_effects": ["obsession", "power_struggles", "destructive_tendencies"],
        "balancing_practices": ["transformation_yoga", "surrender_practice", "ego_dissolution"]
    }
}

# House Correspondences for Ayurvedic Body Systems
AYURVEDA_HOUSE_CORRELATIONS: Dict[int, Dict[str, Any]] = {
    1: {"dosha_correlation": "pitta", "body_systems": ["head", "brain", "identity"], "health_focus": "constitutional_strength"},
    2: {"dosha_correlation": "kapha", "body_systems": ["face", "throat", "resources"], "health_focus": "nourishment"},
    3: {"dosha_correlation": "vata", "body_systems": ["arms", "lungs", "communication"], "health_focus": "breath_coordination"},
    4: {"dosha_correlation": "kapha", "body_systems": ["chest", "heart", "emotions"], "health_focus": "emotional_balance"},
    5: {"dosha_correlation": "pitta", "body_systems": ["stomach", "creativity", "intelligence"], "health_focus": "digestive_fire"},
    6: {"dosha_correlation": "vata", "body_systems": ["intestines", "service", "routine"], "health_focus": "daily_health_habits"},
    7: {"dosha_correlation": "kapha", "body_systems": ["kidneys", "partnerships", "balance"], "health_focus": "relationship_harmony"},
    8: {"dosha_correlation": "pitta", "body_systems": ["reproductive", "transformation", "elimination"], "health_focus": "detoxification"},
    9: {"dosha_correlation": "vata", "body_systems": ["hips", "higher_learning", "expansion"], "health_focus": "spiritual_practices"},
    10: {"dosha_correlation": "kapha", "body_systems": ["knees", "structure", "reputation"], "health_focus": "long_term_health"},
    11: {"dosha_correlation": "vata", "body_systems": ["ankles", "circulation", "hopes"], "health_focus": "social_wellness"},
    12: {"dosha_correlation": "kapha", "body_systems": ["feet", "subconscious", "release"], "health_focus": "spiritual_healing"}
}

# Seasonal Ayurvedic Wisdom with Astrological Timing
AYURVEDA_SEASONAL_GUIDANCE: Dict[str, Dict[str, Any]] = {
    "spring": {
        "dominant_dosha": "kapha",
        "astrological_period": "aries_taurus_gemini",
        "body_focus": "detoxification",
        "dietary_emphasis": ["bitter", "pungent", "astringent"],
        "lifestyle_adjustments": ["increase_activity", "early_rising", "light_foods"],
        "yoga_practices": ["sun_salutations", "twisting", "backbends"],
        "herbal_support": ["turmeric", "ginger", "dandelion"],
        "planetary_influences": ["mars_activation", "sun_strengthening"]
    },
    "summer": {
        "dominant_dosha": "pitta",
        "astrological_period": "cancer_leo_virgo",
        "body_focus": "cooling",
        "dietary_emphasis": ["sweet", "bitter", "astringent"],
        "lifestyle_adjustments": ["cooling_activities", "moon_exposure", "moderate_exercise"],
        "yoga_practices": ["moon_salutations", "cooling_pranayama", "restorative"],
        "herbal_support": ["coriander", "fennel", "rose"],
        "planetary_influences": ["moon_balancing", "venus_harmony"]
    },
    "autumn": {
        "dominant_dosha": "vata",
        "astrological_period": "libra_scorpio_sagittarius",
        "body_focus": "grounding",
        "dietary_emphasis": ["sweet", "sour", "salty"],
        "lifestyle_adjustments": ["routine_establishment", "warm_foods", "oil_massage"],
        "yoga_practices": ["grounding_poses", "slow_flow", "meditation"],
        "herbal_support": ["ashwagandha", "sesame_oil", "warm_spices"],
        "planetary_influences": ["saturn_stability", "jupiter_nourishment"]
    },
    "winter": {
        "dominant_dosha": "vata_kapha",
        "astrological_period": "capricorn_aquarius_pisces",
        "body_focus": "building_strength",
        "dietary_emphasis": ["sweet", "sour", "salty"],
        "lifestyle_adjustments": ["warm_environments", "nourishing_foods", "adequate_rest"],
        "yoga_practices": ["strengthening", "heating", "restorative"],
        "herbal_support": ["ginger", "cinnamon", "ojas_building_herbs"],
        "planetary_influences": ["jupiter_expansion", "venus_nourishment"]
    }
}

# Firestore collection schema
AYURVEDA_COLLECTIONS = {
    "ayurveda_constitutions": {
        "fields": [
            "user_id", "birth_data", "constitution_type", "dosha_balance",
            "prakruti", "vikruti", "analysis_confidence", "timestamp"
        ],
        "indexes": ["user_id", "timestamp", "constitution_type"]
    },
    "ayurveda_recommendations": {
        "fields": [
            "user_id", "constitution_type", "seasonal_guidance", 
            "lifestyle_recommendations", "dietary_guidelines", "timestamp"
        ],
        "indexes": ["user_id", "constitution_type", "timestamp"]
    },
    "ayurveda_correlations": {
        "fields": [
            "user_id", "astrological_indicators", "dosha_planetary_emphasis",
            "house_correlations", "seasonal_patterns", "timestamp"
        ],
        "indexes": ["user_id", "timestamp"]
    }
}

# Quick reference for API responses
AYURVEDA_QUICK_REFERENCE = {
    "constitution_types": {
        "vata": "Air + Space elements - Movement, creativity, quick thinking",
        "pitta": "Fire + Water elements - Transformation, intelligence, leadership", 
        "kapha": "Earth + Water elements - Stability, nurturing, endurance",
        "vata_pitta": "Dual constitution with changeable, focused qualities",
        "pitta_kapha": "Dual constitution with strong, steady qualities",
        "vata_kapha": "Dual constitution with creative, nurturing qualities",
        "tridoshic": "Balanced constitution with all three doshas equal"
    },
    "dosha_balancing_keywords": {
        "vata": ["ground", "warm", "routine", "calm", "nourish"],
        "pitta": ["cool", "moderate", "compassion", "patience", "release"],
        "kapha": ["energize", "warm", "stimulate", "movement", "lighten"]
    },
    "astrological_health_timing": {
        "new_moon": "Ideal for new health routines and detox",
        "full_moon": "Best for completion of healing cycles",
        "waxing_moon": "Building strength and nourishment",
        "waning_moon": "Elimination and cleansing practices"
    }
}

# Export all schema types for use in other modules
__all__ = [
    'AyurvedaConstitutionType', 'DoshaLevel', 'DoshaBalance', 
    'AyurvedaConstitution', 'AyurvedaHealthGuidance', 
    'AstrologyAyurvedaCorrelation', 'AyurvedaAnalysisResult',
    'AYURVEDA_DOSHA_DATA', 'PLANET_AYURVEDA_CORRELATIONS',
    'AYURVEDA_HOUSE_CORRELATIONS', 'AYURVEDA_SEASONAL_GUIDANCE',
    'AYURVEDA_COLLECTIONS', 'AYURVEDA_QUICK_REFERENCE'
]
