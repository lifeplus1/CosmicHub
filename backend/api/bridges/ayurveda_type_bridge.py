# backend/api/bridges/ayurveda_type_bridge.py
"""
Ayurveda Type Bridge - Safe import and type conversion for Ayurveda data
Follows Unified Type Validation Strategy with descriptive types and layered validation
"""

import logging
from typing import Any, Dict, List, Optional, Union, Protocol
from datetime import datetime

logger = logging.getLogger(__name__)

# ===== DESCRIPTIVE TYPE DEFINITIONS (Layer 1: Static Type Safety) =====

class PlanetaryCorrelationData(Protocol):
    """Protocol for planetary correlation data structure"""
    primary_dosha: str
    influence: str
    strength: str

class PlanetData(Protocol):
    """Protocol for planet data structure"""
    strength: float

class AyurvedaAnalysisData(Protocol):
    """Protocol for Ayurveda analysis result structure"""
    constitution: Optional[Dict[str, Any]]
    health_guidance: Optional[Dict[str, Any]] 
    correlation: Optional[Dict[str, Any]]

class AyurvedaConstitutionData(Protocol):
    """Protocol for Ayurveda constitution structure"""
    vata: float
    pitta: float
    kapha: float

class DoshaBalanceData(Protocol):
    """Protocol for dosha balance structure"""
    vata: float
    pitta: float
    kapha: float

class AyurvedaHealthGuidanceData(Protocol):
    """Protocol for Ayurveda health guidance structure"""
    recommendations: List[str]
    seasonal_advice: Dict[str, Any]
    dietary_guidance: Dict[str, Any]

class AstrologyAyurvedaCorrelationData(Protocol):
    """Protocol for astrology-Ayurveda correlation structure"""
    planetary_influences: Dict[str, Any]
    house_correlations: Dict[str, Any]
    dosha_planetary_map: Dict[str, str]

# ===== DESCRIPTIVE TYPE ALIASES FOR CLARITY =====

# External types that may or may not be available
ExternalAyurvedaAnalysis = Any
ExternalAyurvedaConstitution = Any
ExternalDoshaBalance = Any
ExternalAyurvedaHealthGuidance = Any
ExternalAstrologyAyurvedaCorrelation = Any

# Validated data types following strategy
ValidatedAyurvedaAnalysis = Union[AyurvedaAnalysisData, Dict[str, Any]]
ValidatedAyurvedaConstitution = Union[AyurvedaConstitutionData, Dict[str, Any]]
ValidatedDoshaBalance = Union[DoshaBalanceData, Dict[str, Any]]
ValidatedAyurvedaHealthGuidance = Union[AyurvedaHealthGuidanceData, Dict[str, Any]]
ValidatedAstrologyCorrelation = Union[AstrologyAyurvedaCorrelationData, Dict[str, Any]]

# ===== SAFE IMPORT WITH DESCRIPTIVE FALLBACKS =====

# Import availability tracking
ayurveda_schema_available = False
ayurveda_imports: Dict[str, Any] = {}
ayurveda_data_constants: Dict[str, Any] = {}

# Layer 2: Safe External Import Handling
try:
    from astro.calculations.ayurveda_schema import (  # type: ignore[import-untyped,import-not-found]
        AyurvedaAnalysisResult,  # type: ignore[attr-defined]
        AyurvedaConstitution,  # type: ignore[attr-defined]
        AyurvedaHealthGuidance,  # type: ignore[attr-defined]
        AstrologyAyurvedaCorrelation,  # type: ignore[attr-defined]
        DoshaBalance,  # type: ignore[attr-defined]
        AYURVEDA_DOSHA_DATA,  # type: ignore[attr-defined]
        PLANET_AYURVEDA_CORRELATIONS,  # type: ignore[attr-defined]
        AYURVEDA_HOUSE_CORRELATIONS,  # type: ignore[attr-defined]
        AYURVEDA_SEASONAL_GUIDANCE  # type: ignore[attr-defined]
    )
    ayurveda_schema_available = True
    ayurveda_imports = {
        'AyurvedaAnalysisResult': AyurvedaAnalysisResult,
        'AyurvedaConstitution': AyurvedaConstitution,
        'AyurvedaHealthGuidance': AyurvedaHealthGuidance,
        'AstrologyAyurvedaCorrelation': AstrologyAyurvedaCorrelation,
        'DoshaBalance': DoshaBalance
    }
    ayurveda_data_constants = {
        'AYURVEDA_DOSHA_DATA': AYURVEDA_DOSHA_DATA,
        'PLANET_AYURVEDA_CORRELATIONS': PLANET_AYURVEDA_CORRELATIONS,
        'AYURVEDA_HOUSE_CORRELATIONS': AYURVEDA_HOUSE_CORRELATIONS,
        'AYURVEDA_SEASONAL_GUIDANCE': AYURVEDA_SEASONAL_GUIDANCE
    }
except ImportError:
    try:
        from ayurveda_schema import (  # type: ignore[import-untyped,import-not-found]
            AyurvedaAnalysisResult,  # type: ignore[attr-defined]
            AyurvedaConstitution,  # type: ignore[attr-defined]
            AyurvedaHealthGuidance,  # type: ignore[attr-defined]
            AstrologyAyurvedaCorrelation,  # type: ignore[attr-defined]
            DoshaBalance,  # type: ignore[attr-defined]
            AYURVEDA_DOSHA_DATA,  # type: ignore[attr-defined]
            PLANET_AYURVEDA_CORRELATIONS,  # type: ignore[attr-defined]
            AYURVEDA_HOUSE_CORRELATIONS,  # type: ignore[attr-defined]
            AYURVEDA_SEASONAL_GUIDANCE  # type: ignore[attr-defined]
        )
        ayurveda_schema_available = True
        ayurveda_imports = {
            'AyurvedaAnalysisResult': AyurvedaAnalysisResult,
            'AyurvedaConstitution': AyurvedaConstitution,
            'AyurvedaHealthGuidance': AyurvedaHealthGuidance,
            'AstrologyAyurvedaCorrelation': AstrologyAyurvedaCorrelation,
            'DoshaBalance': DoshaBalance
        }
        ayurveda_data_constants = {
            'AYURVEDA_DOSHA_DATA': AYURVEDA_DOSHA_DATA,
            'PLANET_AYURVEDA_CORRELATIONS': PLANET_AYURVEDA_CORRELATIONS,
            'AYURVEDA_HOUSE_CORRELATIONS': AYURVEDA_HOUSE_CORRELATIONS,
            'AYURVEDA_SEASONAL_GUIDANCE': AYURVEDA_SEASONAL_GUIDANCE
        }
    except ImportError:
        logger.info("Ayurveda schema not available, using descriptive fallback implementations")
        
        # Layer 3: Descriptive Fallback Data (following strategy)
        ayurveda_data_constants = {
            'AYURVEDA_DOSHA_DATA': {
                "vata": {"elements": ["air", "space"], "qualities": ["light", "dry", "cold", "mobile"]},
                "pitta": {"elements": ["fire", "water"], "qualities": ["hot", "sharp", "penetrating", "oily"]},
                "kapha": {"elements": ["earth", "water"], "qualities": ["heavy", "slow", "steady", "cool"]}
            },
            'PLANET_AYURVEDA_CORRELATIONS': {
                "sun": {"primary_dosha": "pitta", "influence": "constitution", "strength": "high"},
                "moon": {"primary_dosha": "kapha", "influence": "mind", "strength": "high"},
                "mars": {"primary_dosha": "pitta", "influence": "energy", "strength": "medium"},
                "mercury": {"primary_dosha": "vata", "influence": "nervous_system", "strength": "medium"},
                "jupiter": {"primary_dosha": "kapha", "influence": "wisdom", "strength": "high"},
                "venus": {"primary_dosha": "kapha", "influence": "reproductive", "strength": "medium"},
                "saturn": {"primary_dosha": "vata", "influence": "longevity", "strength": "high"}
            },
            'AYURVEDA_HOUSE_CORRELATIONS': {
                "1": {"focus": "constitution", "dosha_influence": "all"},
                "6": {"focus": "health_challenges", "dosha_influence": "disease_tendency"},
                "8": {"focus": "longevity", "dosha_influence": "transformation"},
                "12": {"focus": "moksha", "dosha_influence": "spiritual_liberation"}
            },
            'AYURVEDA_SEASONAL_GUIDANCE': {
                "spring": {"primary_dosha": "kapha", "action": "pacify", "practices": ["detox", "movement"]},
                "summer": {"primary_dosha": "pitta", "action": "cool", "practices": ["cooling_foods", "meditation"]},
                "autumn": {"primary_dosha": "vata", "action": "ground", "practices": ["routine", "warm_foods"]},
                "winter": {"primary_dosha": "vata_kapha", "action": "balance", "practices": ["warmth", "rest"]}
            }
        }
        
        # Layer 3: Descriptive Fallback Classes
        class FallbackAyurvedaAnalysis:
            """Descriptive fallback for Ayurveda analysis"""
            def __init__(self, constitution: Optional[Dict[str, Any]] = None, 
                         health_guidance: Optional[Dict[str, Any]] = None,
                         correlation: Optional[Dict[str, Any]] = None, **kwargs: Any) -> None:
                self.constitution = constitution or {}
                self.health_guidance = health_guidance or {}
                self.correlation = correlation or {}
                self.generated_at = datetime.now().isoformat()
                self.analysis_type = "ayurveda_fallback"
        
        class FallbackAyurvedaConstitution:
            """Descriptive fallback for Ayurveda constitution"""
            def __init__(self, vata: float = 0.33, pitta: float = 0.33, 
                         kapha: float = 0.33, **kwargs: Any) -> None:
                # Normalize to ensure sum = 1.0
                total = vata + pitta + kapha
                if total > 0:
                    self.vata = vata / total
                    self.pitta = pitta / total
                    self.kapha = kapha / total
                else:
                    self.vata = self.pitta = self.kapha = 0.33
                self.constitution_type = self._determine_type()
            
            def _determine_type(self) -> str:
                """Determine primary constitution type"""
                scores = {"vata": self.vata, "pitta": self.pitta, "kapha": self.kapha}
                return max(scores, key=scores.get)  # type: ignore[arg-type]
        
        ayurveda_imports = {
            'AyurvedaAnalysisResult': FallbackAyurvedaAnalysis,
            'AyurvedaConstitution': FallbackAyurvedaConstitution,
            'AyurvedaHealthGuidance': type('FallbackHealthGuidance', (), {}),
            'AstrologyAyurvedaCorrelation': type('FallbackCorrelation', (), {}),
            'DoshaBalance': FallbackAyurvedaConstitution  # Reuse constitution for balance
        }

# ===== DESCRIPTIVE TYPE BRIDGE CLASS =====

class AyurvedaTypeBridge:
    """
    Layer 3: Type-safe bridge for Ayurveda calculation data
    Follows unified validation strategy with descriptive types
    """
    
    @staticmethod
    def get_ayurveda_types() -> Dict[str, Any]:
        """Get Ayurveda types with safe import handling"""
        return {
            **ayurveda_imports,
            'available': ayurveda_schema_available
        }
    
    @staticmethod
    def get_ayurveda_data() -> Dict[str, Any]:
        """Get Ayurveda data constants with safe import handling"""
        return {
            **ayurveda_data_constants,
            'available': ayurveda_schema_available
        }
    
    @staticmethod
    def safe_create_analysis_result(
        constitution_data: Optional[ValidatedAyurvedaConstitution] = None,
        health_guidance_data: Optional[ValidatedAyurvedaHealthGuidance] = None,
        correlation_data: Optional[ValidatedAstrologyCorrelation] = None,
        **kwargs: Any
    ) -> ExternalAyurvedaAnalysis:
        """
        Layer 4: Safely create AyurvedaAnalysisResult with descriptive validation
        """
        if not ayurveda_schema_available:
            logger.info("Creating fallback Ayurveda analysis result")
            return ayurveda_imports['AyurvedaAnalysisResult'](
                constitution=constitution_data,
                health_guidance=health_guidance_data,
                correlation=correlation_data,
                **kwargs
            )
        
        try:
            return ayurveda_imports['AyurvedaAnalysisResult'](
                constitution=constitution_data,
                health_guidance=health_guidance_data,
                correlation=correlation_data,
                **kwargs
            )
        except Exception as e:
            logger.error(f"Error creating AyurvedaAnalysisResult: {e}")
            # Fallback to dict structure
            return {
                'constitution': constitution_data or {},
                'health_guidance': health_guidance_data or {},
                'correlation': correlation_data or {},
                'generated_at': datetime.now().isoformat(),
                'analysis_type': 'ayurveda_error_fallback'
            }
    
    @staticmethod
    def safe_create_constitution(
        vata_score: float = 0.33,
        pitta_score: float = 0.33,
        kapha_score: float = 0.33,
        **kwargs: Any
    ) -> ExternalAyurvedaConstitution:
        """
        Layer 4: Safely create AyurvedaConstitution with descriptive validation
        """
        # Descriptive score validation
        total_score = vata_score + pitta_score + kapha_score
        if total_score > 0:
            normalized_vata = vata_score / total_score
            normalized_pitta = pitta_score / total_score
            normalized_kapha = kapha_score / total_score
        else:
            normalized_vata = normalized_pitta = normalized_kapha = 0.33
        
        try:
            return ayurveda_imports['AyurvedaConstitution'](
                vata=normalized_vata,
                pitta=normalized_pitta,
                kapha=normalized_kapha,
                **kwargs
            )
        except Exception as e:
            logger.error(f"Error creating AyurvedaConstitution: {e}")
            # Fallback to dict structure
            return {
                'vata': normalized_vata,
                'pitta': normalized_pitta,
                'kapha': normalized_kapha,
                'constitution_type': 'balanced' if abs(normalized_vata - normalized_pitta) < 0.1 and abs(normalized_pitta - normalized_kapha) < 0.1 else 'mixed'
            }
    
    @staticmethod
    def safe_create_dosha_balance(
        dosha_scores: Dict[str, float],
        **kwargs: Any
    ) -> ValidatedDoshaBalance:
        """
        Layer 4: Safely create DoshaBalance with descriptive score validation
        """
        # Descriptive validation with clear error handling
        validated_scores: Dict[str, float] = {}
        for dosha_name in ['vata', 'pitta', 'kapha']:
            raw_score = dosha_scores.get(dosha_name, 0.33)
            validated_scores[dosha_name] = max(0.0, min(1.0, float(raw_score)))
        
        try:
            return ayurveda_imports['DoshaBalance'](
                vata=validated_scores['vata'],
                pitta=validated_scores['pitta'],
                kapha=validated_scores['kapha'],
                **kwargs
            )
        except Exception as e:
            logger.error(f"Error creating DoshaBalance: {e}")
            # Return descriptive fallback structure with validated scores
            return {
                'vata': validated_scores['vata'],
                'pitta': validated_scores['pitta'], 
                'kapha': validated_scores['kapha'],
                'balance_type': _determine_dosha_balance_type(validated_scores),
                'generated_at': datetime.now().isoformat(),
                'analysis_type': 'dosha_balance_fallback'
            }

# ===== HELPER FUNCTIONS FOR DESCRIPTIVE VALIDATION =====

def _get_safe_string_value(data: Any, key: str, default: str) -> str:
    """Safely get a string value from dict-like object with validation"""
    try:
        if hasattr(data, 'get') and callable(getattr(data, 'get')):
            value = data.get(key, default)
            return str(value) if value is not None else default
        return default
    except (ValueError, TypeError, AttributeError):
        return default

def _get_safe_float_value(data: Any, key: str, default: float) -> float:
    """Safely get a float value from dict-like object with validation"""
    try:
        if hasattr(data, 'get') and callable(getattr(data, 'get')):
            value = data.get(key, default)
            return float(value) if value is not None else default
        return default
    except (ValueError, TypeError, AttributeError):
        return default

def _determine_dosha_balance_type(validated_scores: Dict[str, float]) -> str:
    """
    Determine the dosha balance type based on validated scores
    Returns descriptive balance type for clear understanding
    """
    if not validated_scores:
        return 'unknown'
    
    # Find dominant dosha with proper typing
    dominant_dosha: str = max(validated_scores.keys(), key=lambda k: validated_scores[k])
    dominant_score = validated_scores[dominant_dosha]
    
    # Descriptive balance type determination
    if dominant_score >= 0.6:
        return f'{dominant_dosha}_dominant'
    elif dominant_score >= 0.4:
        # Check for dual constitution
        sorted_scores = sorted(validated_scores.items(), key=lambda x: x[1], reverse=True)
        if len(sorted_scores) >= 2 and sorted_scores[1][1] >= 0.3:
            return f'{sorted_scores[0][0]}_{sorted_scores[1][0]}_dual'
        else:
            return f'{dominant_dosha}_primary'
    else:
        return 'tridoshic_balanced'

# ===== LAYER 5: HELPER FUNCTIONS FOR DIRECT USE =====

def get_safe_ayurveda_imports() -> Dict[str, Any]:
    """Get safely imported Ayurveda types and data following strategy"""
    bridge = AyurvedaTypeBridge()
    return {
        **bridge.get_ayurveda_types(),
        **bridge.get_ayurveda_data()
    }

def safe_ayurveda_analysis(
    constitution_data: Optional[Dict[str, Any]] = None,
    **kwargs: Any
) -> ExternalAyurvedaAnalysis:
    """Helper function for safe Ayurveda analysis creation"""
    return AyurvedaTypeBridge.safe_create_analysis_result(
        constitution_data=constitution_data,
        **kwargs
    )

def safe_dosha_calculation(
    birth_data: Dict[str, Any],
    **kwargs: Any
) -> ValidatedDoshaBalance:
    """Helper function for safe dosha balance calculation from birth data"""
    # Extract relevant planetary positions and calculate dosha influence
    planets = birth_data.get('planets', {})
    dosha_scores: Dict[str, float] = {'vata': 0.0, 'pitta': 0.0, 'kapha': 0.0}
    
    # Use descriptive planetary correlation data with proper typing
    correlations = ayurveda_data_constants.get('PLANET_AYURVEDA_CORRELATIONS', {})
    
    for planet_name, planet_data in planets.items():
        if isinstance(planet_name, str) and planet_name.lower() in correlations:
            correlation_info = correlations[planet_name.lower()]
            if isinstance(correlation_info, dict):
                # Use descriptive type casting with validation using typed helper functions
                primary_dosha = _get_safe_string_value(correlation_info, 'primary_dosha', 'vata')
                influence_strength = _get_safe_string_value(correlation_info, 'strength', 'medium')
                
                # Convert strength to numeric influence with descriptive mapping
                strength_mapping: Dict[str, float] = {'low': 0.5, 'medium': 1.0, 'high': 1.5}
                strength_multiplier = strength_mapping.get(influence_strength, 1.0)
                
                # Ensure planet_data is properly typed using helper function
                if isinstance(planet_data, dict):
                    planet_strength_raw = _get_safe_float_value(planet_data, 'strength', 1.0)
                    planet_strength = planet_strength_raw * strength_multiplier
                    
                    # Validate dosha name before assignment
                    if primary_dosha in dosha_scores:
                        dosha_scores[primary_dosha] += planet_strength
    
    # Normalize scores with descriptive validation
    total = sum(dosha_scores.values())
    if total > 0:
        dosha_scores = {k: v/total for k, v in dosha_scores.items()}
    else:
        dosha_scores = {'vata': 0.33, 'pitta': 0.33, 'kapha': 0.33}
    
    return AyurvedaTypeBridge.safe_create_dosha_balance(dosha_scores, **kwargs)
