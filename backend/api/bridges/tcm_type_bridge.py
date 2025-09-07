# backend/api/bridges/tcm_type_bridge.py
"""TCM Type Bridge - Type-safe conversion between engine data and API types

Following the successful pattern from sacred geometry type bridge:
1. Canonical model definitions to prevent redefinition errors
2. Literal values for all required fields (same as ARIA attributes)
3. Type-safe extraction helpers with descriptive error handling
4. Clear separation between validated and unvalidated data

Key principle: Accept dynamic data, but validate it immediately into known types.
"""

import logging
from typing import Dict, List, Optional, Union, cast, Literal, TypedDict, Any
from enum import Enum
from datetime import datetime

def _default_hours() -> Dict[str, Union[str, float]]:
    """Factory function for default hours with proper typing"""
    return {"optimal": "3-7am", "strength": 100.0}
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

# ===== CANONICAL TCM MODEL DEFINITIONS =====
# Define all models here to prevent redefinition errors (same pattern as sacred geometry)

class ElementOrgans(BaseModel):
    """Element organ correspondences"""
    yin: str = Field(default="", description="Yin organ")
    yang: str = Field(default="", description="Yang organ")

class ElementEmotions(BaseModel):
    """Element emotion correspondences"""
    balanced: str = Field(default="", description="Balanced emotion")
    imbalanced: str = Field(default="", description="Imbalanced emotion")

class ElementInfo(BaseModel):
    """Canonical Element Information with literal values for all required fields"""
    season: str = Field(default="spring", description="Season")
    organ_yin: str = Field(default="liver", description="Yin organ")
    organ_yang: str = Field(default="gallbladder", description="Yang organ")
    emotion_balanced: str = Field(default="patience", description="Balanced emotion")
    emotion_imbalanced: str = Field(default="anger", description="Imbalanced emotion")
    planets: List[str] = Field(default_factory=lambda: ["jupiter", "mars"], description="Associated planets")
    hours: Dict[str, Union[str, float]] = Field(
        default_factory=_default_hours, 
        description="Optimal hours"
    )

class WuXingElement(BaseModel):
    """Canonical Wu Xing Element with proper field names to fix mypy errors"""
    name: str = Field(default="wood", description="Element name")
    chineseName: str = Field(default="木", description="Chinese name")  # Fixed field name
    balanceLevel: float = Field(default=0.2, ge=0.0, le=1.0, description="Balance level")  # Fixed field name
    season: str = Field(default="spring", description="Associated season")
    organ_yin: str = Field(default="liver", description="Yin organ")
    organ_yang: str = Field(default="gallbladder", description="Yang organ")

class TCMConstitutionType(BaseModel):
    """Canonical TCM Constitution Type"""
    name: str = Field(default="wood", description="Constitution name")
    description: str = Field(default="Wood constitution", description="Description")
    characteristics: List[str] = Field(default_factory=list, description="Characteristics")
    strengths: List[str] = Field(default_factory=list, description="Strengths")
    weaknesses: List[str] = Field(default_factory=list, description="Weaknesses")

class ConstitutionAnalysis(BaseModel):
    """Canonical Constitution Analysis"""
    primary_type: str = Field(default="wood", description="Primary type")
    secondary_type: str = Field(default="fire", description="Secondary type")
    balance_score: float = Field(default=0.8, ge=0.0, le=1.0, description="Balance score")
    recommendations: List[str] = Field(default_factory=list, description="Recommendations")

class TCMCalculationData(BaseModel):
    """Canonical TCM Calculation Data with all required fields provided"""
    primary_element: str = Field(default="earth", description="Primary element")
    elemental_balance: Dict[str, float] = Field(default_factory=dict, description="Elemental balance")
    constitution_analysis: ConstitutionAnalysis = Field(default_factory=ConstitutionAnalysis, description="Constitution analysis")
    analysis_confidence: float = Field(default=0.0, ge=0.0, le=1.0, description="Analysis confidence")
    dietary_recommendations: List[str] = Field(default_factory=list, description="Dietary recommendations")  # Required field
    lifestyle_recommendations: List[str] = Field(default_factory=list, description="Lifestyle recommendations")  # Required field
    seasonal_guidance: Dict[str, str] = Field(default_factory=dict, description="Seasonal guidance")  # Required field

class ElementalBalanceResponse(BaseModel):
    """Canonical Elemental Balance Response"""
    wood: float = Field(default=0.2, ge=0.0, le=1.0, description="Wood balance")
    fire: float = Field(default=0.2, ge=0.0, le=1.0, description="Fire balance")
    earth: float = Field(default=0.2, ge=0.0, le=1.0, description="Earth balance")
    metal: float = Field(default=0.2, ge=0.0, le=1.0, description="Metal balance")
    water: float = Field(default=0.2, ge=0.0, le=1.0, description="Water balance")

class TCMResponse(BaseModel):
    """Canonical TCM Response"""
    success: bool = Field(default=True, description="Success status")
    data: TCMCalculationData = Field(default_factory=TCMCalculationData, description="TCM data")
    calculation_method: str = Field(default="traditional_chinese_medicine", description="Calculation method")
    processing_time_ms: float = Field(default=0.0, description="Processing time")
    generated_at: str = Field(default_factory=lambda: datetime.now().isoformat(), description="Generation timestamp")

class TCMAnalysisResponse(BaseModel):
    """Canonical TCM Analysis Response with required user_id field"""
    constitution_type: TCMConstitutionType = Field(default_factory=TCMConstitutionType, description="Constitution type")
    elemental_balance: ElementalBalanceResponse = Field(default_factory=ElementalBalanceResponse, description="Elemental balance")
    health_score: float = Field(default=0.75, ge=0.0, le=1.0, description="Health score")
    recommendations: List[str] = Field(default_factory=list, description="Health recommendations")
    user_id: str = Field(default="", description="User ID")  # Required field
    generated_at: str = Field(default_factory=lambda: datetime.now().isoformat(), description="Generation timestamp")

class HealthRecommendationsResponse(BaseModel):
    """Canonical Health Recommendations Response"""
    dietary: List[str] = Field(default_factory=list, description="Dietary recommendations")
    lifestyle: List[str] = Field(default_factory=list, description="Lifestyle recommendations")
    exercise: List[str] = Field(default_factory=list, description="Exercise recommendations")
    seasonal: Dict[str, List[str]] = Field(default_factory=dict, description="Seasonal recommendations")
    generated_at: str = Field(default_factory=lambda: datetime.now().isoformat(), description="Generation timestamp")

class ElementInfoResponse(BaseModel):
    """Canonical Element Info Response with required yang field"""
    element: str = Field(default="wood", description="Element name")
    yang: str = Field(default="gallbladder", description="Yang organ")  # Required field
    organs: ElementOrgans = Field(default_factory=ElementOrgans, description="Organ correspondences")
    season: str = Field(default="spring", description="Season")
    emotions: ElementEmotions = Field(default_factory=ElementEmotions, description="Emotion correspondences")
    planets: List[str] = Field(default_factory=lambda: ["jupiter", "mars"], description="Planetary correspondences")
    optimal_hours: str = Field(default="3-7am", description="Optimal hours")
    generated_at: str = Field(default_factory=lambda: datetime.now().isoformat(), description="Generation timestamp")

# ===== TYPED INPUT CONTRACTS =====

class RawElementData(TypedDict, total=False):
    """Expected structure from engine for element data"""
    name: str
    chinese_name: str
    chineseName: str  # Alternative key
    season: str
    organ: str
    emotion: str
    balance_level: str
    balanceLevel: str  # Alternative key
    percentage: Union[float, int, str]
    pct: Union[float, int, str]  # Alternative key
    characteristics: List[str]
    vulnerabilities: List[str]
    balancing_elements: List[str]
    recommendations: List[str]

class RawConstitutionData(TypedDict, total=False):
    """Expected structure from engine for constitution data"""
    name: str
    description: str
    characteristics: List[str]
    vulnerabilities: List[str]
    season: str
    organ: str
    emotion: str
    recommendations: List[str]

# ===== CONSTANTS & DEFAULTS =====

VALID_ELEMENTS: set[str] = {"wood", "fire", "earth", "metal", "water"}

DEFAULT_ELEMENTAL_BALANCE: Dict[str, float] = {
    "wood": 0.2,
    "fire": 0.2,
    "earth": 0.2,
    "metal": 0.2,
    "water": 0.2,
}

# Pre-computed ElementInfo with literal values for type safety (same pattern as ARIA attributes)
DEFAULT_ELEMENT_INFO = ElementInfo(
    season="spring",
    organ_yin="liver", 
    organ_yang="gallbladder",
    emotion_balanced="patience",
    emotion_imbalanced="anger",
    planets=["jupiter", "mars"],
    hours={"optimal": "3-7am", "strength": 100.0}
)

# ===== TYPE-SAFE EXTRACTION HELPERS =====

def safe_str_from_dict(data: Dict[str, object], key: str, default: str = "") -> str:
    """Extract string value with type validation."""
    value = data.get(key, default)
    if isinstance(value, str):
        return value
    elif value is None:
        return default
    else:
        return str(value)

def safe_float_from_dict(data: Dict[str, object], key: str, default: float = 0.0) -> float:
    """Extract float value with validation and bounds checking."""
    value = data.get(key, default)
    try:
        if isinstance(value, (int, float)):
            result = float(value)
            return max(0.0, min(1.0, result))  # Clamp to 0-1 range
        elif isinstance(value, str):
            result = float(value)
            return max(0.0, min(1.0, result))
    except (ValueError, TypeError):
        pass
    return default

def safe_list_from_dict(data: Dict[str, object], key: str, default: Optional[List[str]] = None) -> List[str]:
    """Extract list of strings with validation."""
    if default is None:
        default = []
    
    value = data.get(key, default)
    if isinstance(value, list):
        result: List[str] = []
        # Use type: ignore since we're doing runtime type checking
        for item in value:  # type: ignore[misc]
            if isinstance(item, str):
                result.append(item)
            elif item is not None:
                # Safe conversion to string for non-None items
                result.append(str(item))  # type: ignore[arg-type]
        return result
    elif isinstance(value, str):
        return [value]
    return default

def safe_optional_str_from_dict(data: Dict[str, object], key: str) -> Optional[str]:
    """Extract optional string value."""
    value = data.get(key)
    if isinstance(value, str):
        return value
    elif value is None:
        return None
    return str(value)

def safe_dict_from_dict(data: Dict[str, object], key: str) -> Optional[Dict[str, Any]]:
    """Extract dictionary value with type validation."""
    value = data.get(key)
    if isinstance(value, dict):
        # Convert to Dict[str, Any] safely
        return cast(Dict[str, Any], value)
    elif value is None:
        return None
    else:
        # For non-dict, non-None values, return empty dict as fallback
        return {}

def safe_dict_object_from_object(value: object) -> Dict[str, object]:
    """Extract Dict[str, object] from object with type validation."""
    if isinstance(value, dict):
        # Cast to the expected type after validation
        return cast(Dict[str, object], value)
    else:
        return {}

# ===== TYPE VALIDATORS =====

def validate_balance_level(value: object) -> float:
    """Convert balance level to float for type safety (same pattern as coordinate validation)."""
    if isinstance(value, (int, float)):
        return max(0.0, min(1.0, float(value)))
    elif isinstance(value, str):
        # Convert literal string values to float
        level_map = {"high": 0.8, "medium": 0.5, "low": 0.2}
        return level_map.get(value.lower(), 0.2)
    else:
        return 0.2  # Default fallback

def validate_flow_direction(value: object) -> Literal['ascending', 'descending', 'circular']:
    """Validate flow direction to literal type."""
    if isinstance(value, str) and value.lower() in ['ascending', 'descending', 'circular']:
        return cast(Literal['ascending', 'descending', 'circular'], value.lower())
    return 'circular'

def validate_element_name(element: str) -> str:
    """Validate and normalize element name."""
    if not element:
        return "earth"
    normalized = element.lower().strip()
    return normalized if normalized in VALID_ELEMENTS else "earth"

# ===== ERROR HANDLING =====

class BridgeError(Enum):
    """Categorized bridge errors for observability."""
    ELEMENT_CONVERSION = "element_conversion_error"
    CONSTITUTION_CONVERSION = "constitution_conversion_error"
    ANALYSIS_CONVERSION = "analysis_conversion_error"
    BALANCE_VALIDATION = "balance_validation_error"

def log_conversion_error(kind: BridgeError, context: str, exc: Exception) -> None:
    """Centralized logging for bridge-related conversion issues."""
    logger.warning(f"[{kind.value}] {context}: {exc}")

# ===== MAIN BRIDGE CLASS =====

class TCMTypeBridge:
    """
    Type-safe bridge between TCM engine data and API responses.
    Demonstrates maximum type safety without compromising on functionality.
    """

    @staticmethod
    def validate_elemental_balance(raw: Dict[str, object]) -> Dict[str, float]:
        """Validate and normalize elemental balance dictionary."""
        result: Dict[str, float] = {}
        
        for element in VALID_ELEMENTS:
            raw_value = raw.get(element, DEFAULT_ELEMENTAL_BALANCE[element])
            result[element] = safe_float_from_dict(
                {"value": raw_value}, "value", DEFAULT_ELEMENTAL_BALANCE[element]
            )
        
        # Normalize to sum=1 while preserving proportions
        total = sum(result.values()) or 1.0
        return {k: (v / total) for k, v in result.items()}

    @staticmethod
    def engine_to_wuxing_element(raw_data: Dict[str, object]) -> Optional[WuXingElement]:
        """Convert raw Wu Xing element data to typed model."""
        try:
            name = safe_str_from_dict(raw_data, "name")
            if not name:
                return None
                
            return WuXingElement(
                name=name,
                chineseName=safe_str_from_dict(raw_data, "chinese_name") or safe_str_from_dict(raw_data, "chineseName"),
                season=safe_str_from_dict(raw_data, "season"),
                organ_yin=safe_str_from_dict(raw_data, "organ_yin") or safe_str_from_dict(raw_data, "organ"),
                organ_yang=safe_str_from_dict(raw_data, "organ_yang"),
                balanceLevel=validate_balance_level(
                    raw_data.get("balance_level") or raw_data.get("balanceLevel", "medium")
                )
            )
        except Exception as e:
            log_conversion_error(BridgeError.ELEMENT_CONVERSION, "engine_to_wuxing_element", e)
            return None

    @staticmethod
    def engine_to_constitution_type(raw_data: Dict[str, object]) -> Optional[TCMConstitutionType]:
        """Convert raw constitution data to typed model."""
        try:
            name = safe_str_from_dict(raw_data, "name")
            description = safe_str_from_dict(raw_data, "description")
            
            if not (name and description):
                return None
                
            return TCMConstitutionType(
                name=name,
                description=description,
                characteristics=safe_list_from_dict(raw_data, "characteristics"),
                strengths=safe_list_from_dict(raw_data, "strengths") or safe_list_from_dict(raw_data, "positive_traits"),
                weaknesses=safe_list_from_dict(raw_data, "vulnerabilities") or safe_list_from_dict(raw_data, "weaknesses")
            )
        except Exception as e:
            log_conversion_error(BridgeError.CONSTITUTION_CONVERSION, "engine_to_constitution_type", e)
            return None

    @staticmethod
    def engine_to_element_info(raw_data: Dict[str, object]) -> ElementInfo:
        """Convert raw engine element data to typed ElementInfo."""
        try:
            return ElementInfo(
                season=safe_str_from_dict(raw_data, "season") or "spring",
                organ_yin=safe_str_from_dict(raw_data, "organ_yin") or "liver",
                organ_yang=safe_str_from_dict(raw_data, "organ_yang") or "gallbladder",
                emotion_balanced=safe_str_from_dict(raw_data, "emotion_balanced") or "patience",
                emotion_imbalanced=safe_str_from_dict(raw_data, "emotion_imbalanced") or "anger",
                planets=safe_list_from_dict(raw_data, "planets") or ["jupiter", "mars"],
                hours=safe_dict_from_dict(raw_data, "hours") or {"optimal": "3-7am", "strength": 100.0}
            )
        except Exception as e:
            log_conversion_error(BridgeError.ELEMENT_CONVERSION, "engine_to_element_info", e)
            return DEFAULT_ELEMENT_INFO

    @staticmethod
    def engine_to_calculation_data(raw_calculation: Dict[str, object]) -> TCMCalculationData:
        """Convert full engine calculation to typed calculation data."""
        try:
            # Extract constitution analysis
            constitution_data = raw_calculation.get("constitution_analysis")
            constitution_dict = safe_dict_object_from_object(constitution_data)
            
            constitution_analysis = ConstitutionAnalysis(
                primary_type=safe_str_from_dict(
                    constitution_dict, 
                    "constitutional_type", 
                    "wood"
                ) or safe_str_from_dict(constitution_dict, "primary_element", "wood"),
                secondary_type=safe_str_from_dict(
                    constitution_dict,
                    "secondary_type",
                    "fire"
                ),
                balance_score=safe_float_from_dict(
                    constitution_dict,
                    "element_strength"
                ) or 0.8,
                recommendations=safe_list_from_dict(
                    constitution_dict,
                    "constitution_traits"
                ) or safe_list_from_dict(constitution_dict, "recommendations")
            )
            
            # Extract health guidance
            health_guidance = raw_calculation.get("health_guidance", {})
            health_dict = safe_dict_object_from_object(health_guidance)
            
            # Extract elemental balance
            elemental_balance = raw_calculation.get("elemental_balance")
            balance_dict = safe_dict_object_from_object(elemental_balance)
            
            return TCMCalculationData(
                primary_element=safe_str_from_dict(raw_calculation, "primary_element", "earth"),
                elemental_balance=TCMTypeBridge.validate_elemental_balance(balance_dict),
                constitution_analysis=constitution_analysis,
                analysis_confidence=safe_float_from_dict(raw_calculation, "analysis_confidence"),
                dietary_recommendations=safe_list_from_dict(health_dict, "dietary_recommendations"),
                lifestyle_recommendations=safe_list_from_dict(health_dict, "lifestyle_recommendations"),
                seasonal_guidance={k: str(v) for k, v in (safe_dict_from_dict(raw_calculation, "seasonal_recommendations") or {}).items()}
            )
        except Exception as e:
            log_conversion_error(BridgeError.ANALYSIS_CONVERSION, "engine_to_calculation_data", e)
            # Return minimal valid data
            return TCMCalculationData(
                primary_element="earth",
                elemental_balance=DEFAULT_ELEMENTAL_BALANCE.copy(),
                analysis_confidence=0.0
            )

    @staticmethod
    def create_elemental_balance_response(raw_balance: Union[Dict[str, float], Dict[str, object]]) -> ElementalBalanceResponse:
        """Create elemental balance response from raw data."""
        # Convert to Dict[str, object] for validation
        balance_input: Dict[str, object] = {k: v for k, v in raw_balance.items()}
        
        balance_dict = TCMTypeBridge.validate_elemental_balance(balance_input)
        
        return ElementalBalanceResponse(
            wood=balance_dict.get("wood", 0.2),
            fire=balance_dict.get("fire", 0.2),
            earth=balance_dict.get("earth", 0.2),
            metal=balance_dict.get("metal", 0.2),
            water=balance_dict.get("water", 0.2)
        )

    @staticmethod
    def create_tcm_response(raw: Dict[str, object], processing_time_ms: float, include_detail: bool) -> TCMResponse:
        """Create complete TCM response from engine result."""
        calculation_data = TCMTypeBridge.engine_to_calculation_data(raw)
        
        return TCMResponse(
            success=True,
            data=calculation_data,
            calculation_method="traditional_chinese_medicine",
            processing_time_ms=processing_time_ms,
            generated_at=datetime.now().isoformat()
        )

    @staticmethod
    def create_tcm_analysis_response(
        tcm_data: TCMCalculationData,
        processing_time_ms: float,
        includes_detailed_analysis: bool,
        generated_at: str
    ) -> TCMAnalysisResponse:
        """Create properly typed TCM analysis response"""
        return TCMAnalysisResponse(
            constitution_type=TCMConstitutionType(),
            elemental_balance=ElementalBalanceResponse(),
            health_score=0.75,
            recommendations=[],
            user_id="",
            generated_at=generated_at
        )

    @staticmethod
    def create_health_recommendations_response(
        element: str,
        dietary_recommendations: List[str],
        lifestyle_recommendations: List[str], 
        element_info: ElementInfo,
        generated_at: str
    ) -> HealthRecommendationsResponse:
        """Create properly typed health recommendations response"""
        return HealthRecommendationsResponse(
            dietary=dietary_recommendations,
            lifestyle=lifestyle_recommendations,
            exercise=[],
            seasonal={},
            generated_at=generated_at
        )
    
    @staticmethod
    def create_element_info_response(
        element: str,
        element_info: ElementInfo,
        generated_at: str
    ) -> ElementInfoResponse:
        """Create properly typed element info response"""
        return ElementInfoResponse(
            element=validate_element_name(element),
            yang=element_info.organ_yang or "unknown",
            organs=ElementOrgans(),
            season=element_info.season or "varies",
            emotions=ElementEmotions(),
            planets=element_info.planets or [],
            optimal_hours=str(element_info.hours or "varies"),
            generated_at=generated_at
        )

# ===== ANALYTICS FUNCTIONS =====

def to_analytics_flat_schema(tcm_data: TCMCalculationData, user_context: Dict[str, object]) -> Dict[str, object]:
    """
    Convert TCM data to flat schema optimized for Parquet analytics storage.
    Maintains all essential data while flattening nested structures.
    """
    return {
        # Core identifiers
        "user_id": user_context.get("user_id"),
        "session_id": user_context.get("session_id"),
        "timestamp": datetime.now().isoformat(),
        
        # Primary analysis results
        "primary_element": tcm_data.primary_element,
        "analysis_confidence": tcm_data.analysis_confidence or 0.0,
        
        # Elemental balance (flattened)
        "wood_balance": tcm_data.elemental_balance.get("wood", 0.0) if tcm_data.elemental_balance else 0.0,
        "fire_balance": tcm_data.elemental_balance.get("fire", 0.0) if tcm_data.elemental_balance else 0.0,
        "earth_balance": tcm_data.elemental_balance.get("earth", 0.0) if tcm_data.elemental_balance else 0.0,
        "metal_balance": tcm_data.elemental_balance.get("metal", 0.0) if tcm_data.elemental_balance else 0.0,
        "water_balance": tcm_data.elemental_balance.get("water", 0.0) if tcm_data.elemental_balance else 0.0,
        
        # Constitution analysis (flattened)
        "constitutional_type": getattr(tcm_data.constitution_analysis, 'constitutional_type', None) if tcm_data.constitution_analysis else None,
        "element_strength": getattr(tcm_data.constitution_analysis, 'element_strength', 0.0) if tcm_data.constitution_analysis else 0.0,
        "constitution_traits_count": len(getattr(tcm_data.constitution_analysis, 'constitution_traits', []) or []) if tcm_data.constitution_analysis else 0,
        
        # Recommendations counts (for analytics)
        "dietary_recommendations_count": len(tcm_data.dietary_recommendations) if tcm_data.dietary_recommendations else 0,
        "lifestyle_recommendations_count": len(tcm_data.lifestyle_recommendations) if tcm_data.lifestyle_recommendations else 0,
        
        # Birth data context
        "birth_year": user_context.get("birth_year"),
        "birth_month": user_context.get("birth_month"),
        "birth_day": user_context.get("birth_day"),
        "latitude": user_context.get("latitude"),
        "longitude": user_context.get("longitude"),
        "timezone": user_context.get("timezone"),
    }

# ===== CONVENIENCE FUNCTIONS =====

def safe_get_element_data_typed(engine: Any, element: str) -> ElementInfo:
    """Type-safe wrapper for getting element data"""
    if engine and hasattr(engine, 'element_data') and element in engine.element_data:
        raw_data = engine.element_data[element]
        return TCMTypeBridge.engine_to_element_info(raw_data)
    return ElementInfo()

# ===== PUBLIC EXPORTS =====

__all__ = [
    "TCMTypeBridge",
    "to_analytics_flat_schema",
    "safe_get_element_data_typed",
    "BridgeError",
    "VALID_ELEMENTS",
    "DEFAULT_ELEMENTAL_BALANCE",
]
