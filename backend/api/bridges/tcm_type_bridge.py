# backend/api/bridges/tcm_type_bridge.py
"""TCM Type Bridge - Type-safe conversion between engine data and API types

This bridge demonstrates maximum type safety by:
1. Using specific typed dictionaries instead of Any
2. Providing type-safe extraction helpers
3. Explicit validation with proper error handling
4. Clear separation between validated and unvalidated data

Key principle: Accept dynamic data, but validate it immediately into known types.
"""

import logging
from typing import Dict, List, Optional, Union, Tuple, cast, Literal, TypedDict
from enum import Enum
from datetime import datetime

from backend.types.tcm_systems import (
    ElementInfo,
    ElementInfoResponse,
    TCMCalculationData,
    ConstitutionAnalysis,
    HealthRecommendationsResponse,
    WuXingElement,
    TCMConstitutionType,
    TCMAnalysisData,
    OrganSystemBalance,
    MeridianFlowData,
    ElementalBalanceResponse,
    ConstitutionAnalysisResponse,
    TCMAnalysisResponse,
    TCMResponse,
    TCMRequest
)

logger = logging.getLogger(__name__)

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

DEFAULT_ELEMENT_INFO = ElementInfo()

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
        for item in value:
            if isinstance(item, str):
                result.append(item)
            elif item is not None:
                # Type assertion for the str() call
                result.append(str(item))
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

# ===== TYPE VALIDATORS =====

def validate_balance_level(value: object) -> Literal['high', 'medium', 'low']:
    """Validate balance level to literal type."""
    if isinstance(value, str) and value.lower() in ['high', 'medium', 'low']:
        return cast(Literal['high', 'medium', 'low'], value.lower())
    return 'medium'

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
                chinese_name=safe_str_from_dict(raw_data, "chinese_name") or safe_str_from_dict(raw_data, "chineseName"),
                season=safe_str_from_dict(raw_data, "season"),
                organ=safe_str_from_dict(raw_data, "organ"),
                emotion=safe_str_from_dict(raw_data, "emotion"),
                balance_level=validate_balance_level(
                    raw_data.get("balance_level") or raw_data.get("balanceLevel", "medium")
                ),
                percentage=safe_float_from_dict(raw_data, "percentage") or safe_float_from_dict(raw_data, "pct"),
                characteristics=safe_list_from_dict(raw_data, "characteristics"),
                vulnerabilities=safe_list_from_dict(raw_data, "vulnerabilities"),
                balancing_elements=safe_list_from_dict(raw_data, "balancing_elements"),
                recommendations=safe_list_from_dict(raw_data, "recommendations"),
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
                vulnerabilities=safe_list_from_dict(raw_data, "vulnerabilities"),
                season=safe_optional_str_from_dict(raw_data, "season"),
                organ=safe_optional_str_from_dict(raw_data, "organ"),
                emotion=safe_optional_str_from_dict(raw_data, "emotion"),
                recommendations=safe_list_from_dict(raw_data, "recommendations") or None,
            )
        except Exception as e:
            log_conversion_error(BridgeError.CONSTITUTION_CONVERSION, "engine_to_constitution_type", e)
            return None

    @staticmethod
    def engine_to_element_info(raw_data: Dict[str, object]) -> ElementInfo:
        """Convert raw engine element data to typed ElementInfo."""
        try:
            return ElementInfo(
                season=safe_optional_str_from_dict(raw_data, "season"),
                organ_yin=safe_optional_str_from_dict(raw_data, "organ_yin"),
                organ_yang=safe_optional_str_from_dict(raw_data, "organ_yang"),
                emotion_balanced=safe_optional_str_from_dict(raw_data, "emotion_balanced"),
                emotion_imbalanced=safe_optional_str_from_dict(raw_data, "emotion_imbalanced"),
                planets=safe_list_from_dict(raw_data, "planets"),
                hours=raw_data.get("hours") if isinstance(raw_data.get("hours"), dict) else {},
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
            constitution_analysis = ConstitutionAnalysis(
                constitutional_type=safe_str_from_dict(
                    constitution_data if isinstance(constitution_data, dict) else {}, 
                    "constitutional_type", 
                    "unknown"
                ),
                constitution_traits=safe_list_from_dict(
                    constitution_data if isinstance(constitution_data, dict) else {},
                    "constitution_traits"
                ),
                primary_element=safe_str_from_dict(
                    constitution_data if isinstance(constitution_data, dict) else {},
                    "primary_element",
                    "earth"
                ),
                element_strength=safe_float_from_dict(
                    constitution_data if isinstance(constitution_data, dict) else {},
                    "element_strength"
                )
            )
            
            # Extract health guidance
            health_guidance = raw_calculation.get("health_guidance", {})
            if not isinstance(health_guidance, dict):
                health_guidance = {}
            
            return TCMCalculationData(
                primary_element=safe_str_from_dict(raw_calculation, "primary_element", "earth"),
                elemental_balance=TCMTypeBridge.validate_elemental_balance(
                    raw_calculation.get("elemental_balance") if isinstance(raw_calculation.get("elemental_balance"), dict) else {}
                ),
                constitution_analysis=constitution_analysis,
                analysis_confidence=safe_float_from_dict(raw_calculation, "analysis_confidence"),
                dietary_recommendations=safe_list_from_dict(health_guidance, "dietary_recommendations"),
                lifestyle_recommendations=safe_list_from_dict(health_guidance, "lifestyle_recommendations"),
                seasonal_guidance=safe_optional_str_from_dict(raw_calculation, "seasonal_recommendations")
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
    def create_elemental_balance_response(raw_balance: Dict[str, object]) -> ElementalBalanceResponse:
        """Create elemental balance response from raw data."""
        balance_dict = TCMTypeBridge.validate_elemental_balance(raw_balance)
        
        # Find primary element (highest value)
        primary_element = max(balance_dict.items(), key=lambda x: x[1])[0] if balance_dict else "earth"
        element_literal = cast(
            Literal['wood', 'fire', 'earth', 'metal', 'water'], 
            validate_element_name(primary_element)
        )
        
        return ElementalBalanceResponse(
            success=True,
            elemental_balance=balance_dict,
            primary_element=element_literal,
            element_strength=balance_dict.get(primary_element, 0.2),
            quick_analysis=True,
            user_id=None,
            generated_at=""
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
            api_version="1.0",
            generated_at=datetime.now().isoformat(),
            includes_detailed_analysis=include_detail,
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
        "constitutional_type": tcm_data.constitution_analysis.constitutional_type if tcm_data.constitution_analysis else None,
        "element_strength": tcm_data.constitution_analysis.element_strength if tcm_data.constitution_analysis else 0.0,
        "constitution_traits_count": len(tcm_data.constitution_analysis.constitution_traits or []) if tcm_data.constitution_analysis else 0,
        
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

# ===== PUBLIC EXPORTS =====

__all__ = [
    "TCMTypeBridge",
    "to_analytics_flat_schema",
    "BridgeError",
    "VALID_ELEMENTS",
    "DEFAULT_ELEMENTAL_BALANCE",
]
