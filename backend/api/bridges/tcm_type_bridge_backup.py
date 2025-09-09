# backend/api/bridges/tcm_type_bridge.py
# NOTE: This is a legacy backup bridge file kept for reference during refactors.
# It performs extensive dynamic dict access and defensive conversions that
# generate a large volume of "Unknown" type diagnostics which distract from
# active enforcement on current modules. We intentionally relax unknown-* rules
# here to keep global Pyright output focused on actionable issues.
# pyright: reportUnknownMemberType=false, reportUnknownVariableType=false, reportUnknownArgumentType=false, reportUnknownParameterType=false
"""TCM Type Bridge - Safe conversion between engine data and API types

Extended bridge layer providing:
    - Comprehensive conversion helpers from raw engine dicts to Pydantic models
    - Validation & normalization utilities (element names, percentages, lists)
    - Safe accessor wrappers with graceful fallbacks
    - Response factory methods for consistent API contracts
    - (Pre-refactor ready) granular functions to enable future standalone page usage

Design Goals:
    * No hard dependency on engine internal class shapes (dict-based contracts)
    * Fail-soft: never raise inside conversion path; log + return safe defaults
    * Central constants & mappings to avoid scattered literals
    * Backward compatible with earlier minimal bridge
"""

import logging
from typing import cast, Any, Dict, List, Optional, Union
from typing_extensions import Literal, Tuple
from enum import Enum
from datetime import datetime

from backend_types.tcm_systems import (
    # Core / previously used
    ElementInfo,
    ElementInfoResponse,
    TCMCalculationData,
    ConstitutionAnalysis,
    HealthRecommendationsResponse,
    # Newly integrated domain types
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

# ====== CONSTANTS & DEFAULTS ======

VALID_ELEMENTS: set[str] = {"wood", "fire", "earth", "metal", "water"}

DEFAULT_ELEMENTAL_BALANCE: Dict[str, float] = {
    "wood": 0.2,
    "fire": 0.2,
    "earth": 0.2,
    "metal": 0.2,
    "water": 0.2,
}

DEFAULT_ELEMENT_INFO = ElementInfo(
    season="spring",
    organ_yin="liver", 
    organ_yang="gallbladder",
    emotion_balanced="patience",
    emotion_imbalanced="anger",
    planets=["mars"],
    hours={"start": 23, "end": 1}
)

# Mapping from potential alternative engine keys to our canonical names
FIELD_MAPPINGS: Dict[str, str] = {
    "yinOrgan": "organ_yin",
    "yangOrgan": "organ_yang",
    "balancedEmotion": "emotion_balanced",
    "imbalancedEmotion": "emotion_imbalanced",
    "planetary": "planets",
}

# Lightweight cache for element info (static reference data); TTL (seconds)
_ELEMENT_INFO_CACHE: Dict[str, Tuple[ElementInfo, float]] = {}
_ELEMENT_INFO_TTL = 3600.0


class BridgeError(Enum):
    """Categorized bridge errors for observability (optional use)."""
    ELEMENT_CONVERSION = "element_conversion_error"
    CONSTITUTION_CONVERSION = "constitution_conversion_error"
    ANALYSIS_CONVERSION = "analysis_conversion_error"
    BALANCE_VALIDATION = "balance_validation_error"
    GENERIC = "generic_bridge_error"


def log_conversion_error(kind: BridgeError, context: str, exc: Exception) -> None:
    """Centralized logging for bridge-related conversion issues."""
    logger.warning(f"[{kind.value}] {context}: {exc}")


def safe_get(container: Any, *path: Union[str, int], default: Any = None) -> Any:
    """Generic deep get (dict / list) with fallback."""
    try:
        current = container
        for key in path:
            if isinstance(current, dict) and isinstance(key, str):
                current = current.get(key)
            elif isinstance(current, list) and isinstance(key, int) and 0 <= key < len(current):
                current = current[key]
            else:
                return default
            if current is None:
                return default
        return current
    except Exception:
        return default

class TCMTypeBridge:
    """
    Type-safe bridge between TCM engine data structures and API response models
    """

    # ===== NORMALIZATION & VALIDATION UTILITIES =====

    @staticmethod
    def normalize_element_name(element: str) -> str:
        if not element:
            return "earth"
        e = element.lower().strip()
        return e if e in VALID_ELEMENTS else "earth"

    # (Primary validate_element_name removed; legacy alias retained later for brevity)

    @staticmethod
    def validate_percentage(value: Any, default: float = 0.0) -> float:
        try:
            v = float(value)
            if v != v:  # NaN
                return default
            return max(0.0, min(1.0, v))
        except Exception:
            return default

    @staticmethod
    def sanitize_recommendations_list(items: Any) -> List[str]:
        if not items:
            return []
        out: List[str] = []
        try:
            if isinstance(items, (list, tuple, set)):
                for raw in items:
                    if raw is None:
                        continue
                    s = str(raw).strip()
                    if s and s not in out:
                        out.append(s)
            elif isinstance(items, str):
                s = items.strip()
                if s:
                    out.append(s)
        except Exception:
            pass
        return out

    @staticmethod
    def validate_elemental_balance(raw: Any) -> Dict[str, float]:
        if not isinstance(raw, dict):
            return DEFAULT_ELEMENTAL_BALANCE.copy()
        result: Dict[str, float] = {}
        for el in VALID_ELEMENTS:
            result[el] = TCMTypeBridge.validate_percentage(raw.get(el, DEFAULT_ELEMENTAL_BALANCE[el]), DEFAULT_ELEMENTAL_BALANCE[el])
        # Optional normalization to sum=1 while preserving proportions
        total = sum(result.values()) or 1.0
        normalized = {k: (v / total) for k, v in result.items()}
        return normalized

    @staticmethod
    def validate_constitution_type(raw: Any) -> Optional[TCMConstitutionType]:
        if not isinstance(raw, dict):
            return None
        try:
            name = raw.get("name")
            desc = raw.get("description")
            if not (name and desc):
                return None
            return TCMConstitutionType(
                name=name,
                description=desc,
                characteristics=raw.get("characteristics", []) or [],
                vulnerabilities=raw.get("vulnerabilities", []) or [],
                season=raw.get("season"),
                organ=raw.get("organ"),
                emotion=raw.get("emotion"),
                recommendations=raw.get("recommendations"),
            )
        except Exception as e:
            log_conversion_error(BridgeError.CONSTITUTION_CONVERSION, "validate_constitution_type", e)
            return None
    
    @staticmethod
    def engine_to_element_info(raw_data: Dict[str, Any]) -> ElementInfo:
        """Convert raw engine element data to typed ElementInfo"""
        try:
            # Apply field aliasing for resilience
            mapped: Dict[str, Any] = {}
            for k, v in raw_data.items():
                canonical = FIELD_MAPPINGS.get(k, k)
                mapped[canonical] = v
            return ElementInfo(
                season=mapped.get("season"),
                organ_yin=mapped.get("organ_yin"),
                organ_yang=mapped.get("organ_yang"),
                emotion_balanced=mapped.get("emotion_balanced"),
                emotion_imbalanced=mapped.get("emotion_imbalanced"),
                planets=mapped.get("planets", []) or [],
                hours=mapped.get("hours", {}) or {},
            )
        except Exception as e:
            log_conversion_error(BridgeError.ELEMENT_CONVERSION, "engine_to_element_info", e)
            return DEFAULT_ELEMENT_INFO  # Safe fallback

    # ----- New granular converters -----

    @staticmethod
    def engine_to_wuxing_element(raw: Any) -> Optional[WuXingElement]:
        if not isinstance(raw, dict):
            return None
        try:
            return WuXingElement(
                name=str(raw.get("name", "")),
                chinese_name=str(raw.get("chinese_name", raw.get("chineseName", ""))),
                season=str(raw.get("season", "")),
                organ=str(raw.get("organ", "")),
                emotion=str(raw.get("emotion", "")),
                balance_level=cast(Literal['high', 'medium', 'low'], "medium" if raw.get("balance_level", raw.get("balanceLevel", "medium")) not in ['high', 'medium', 'low'] else raw.get("balance_level", raw.get("balanceLevel", "medium"))),
                percentage=TCMTypeBridge.validate_percentage(raw.get("percentage", raw.get("pct", 0.0)), 0.0),
                characteristics=raw.get("characteristics", []) or [],
                vulnerabilities=raw.get("vulnerabilities", []) or [],
                balancing_elements=raw.get("balancing_elements", []) or [],
                recommendations=raw.get("recommendations", []) or [],
            )
        except Exception as e:
            log_conversion_error(BridgeError.ELEMENT_CONVERSION, "engine_to_wuxing_element", e)
            return None

    @staticmethod
    def engine_to_organ_system_balance(raw: Any) -> Optional[OrganSystemBalance]:
        if not isinstance(raw, dict):
            return None
        try:
            return OrganSystemBalance(
                name=str(raw.get("name", "")),
                balance=TCMTypeBridge.validate_percentage(raw.get("balance", 0.0), 0.0),
                season=str(raw.get("season", "")),
                element=TCMTypeBridge.normalize_element_name(raw.get("element", "earth")),
                characteristics=raw.get("characteristics", []) or [],
                vulnerabilities=raw.get("vulnerabilities", []) or [],
            )
        except Exception as e:
            log_conversion_error(BridgeError.ANALYSIS_CONVERSION, "engine_to_organ_system_balance", e)
            return None

    @staticmethod
    def engine_to_meridian_flow_data(raw: Any) -> Optional[MeridianFlowData]:
        if not isinstance(raw, dict):
            return None
        try:
            return MeridianFlowData(
                name=str(raw.get("name", "")),
                time_window=str(raw.get("time_window", raw.get("timeWindow", ""))),
                energy_level=TCMTypeBridge.validate_percentage(raw.get("energy_level", raw.get("energyLevel", 0.0)), 0.0),
                blockages=raw.get("blockages"),
                flow_direction=cast(Literal['ascending', 'descending', 'circular'], "circular" if raw.get("flow_direction", raw.get("flowDirection", "circular")) not in ['ascending', 'descending', 'circular'] else raw.get("flow_direction", raw.get("flowDirection", "circular"))),
            )
        except Exception as e:
            log_conversion_error(BridgeError.ANALYSIS_CONVERSION, "engine_to_meridian_flow_data", e)
            return None

    @staticmethod
    def engine_to_tcm_constitution_type(raw: Any) -> Optional[TCMConstitutionType]:
        return TCMTypeBridge.validate_constitution_type(raw)
    
    @staticmethod 
    def engine_to_constitution_analysis(
        constitution_data: Dict[str, Any]
    ) -> ConstitutionAnalysis:
        """Convert engine constitution data to typed analysis"""
        try:
            return ConstitutionAnalysis(
                constitutional_type=constitution_data.get("constitutional_type"),
                constitution_traits=constitution_data.get("constitution_traits", []),
                primary_element=constitution_data.get("primary_element"),
                element_strength=constitution_data.get("element_strength", 0.0)
            )
        except Exception as e:
            log_conversion_error(BridgeError.CONSTITUTION_CONVERSION, "engine_to_constitution_analysis", e)
            return ConstitutionAnalysis(
                constitutional_type="unknown",
                constitution_traits=[],
                primary_element="earth",
                element_strength=0.0
            )

    @staticmethod
    def engine_to_tcm_analysis_data(raw: Any) -> Optional[TCMAnalysisData]:
        if not isinstance(raw, dict):
            return None
        try:
            # Constitution types list
            const_types_raw = raw.get("constitution_types", []) or []
            constitution_types: List[TCMConstitutionType] = [
                ct for ct in (TCMTypeBridge.engine_to_tcm_constitution_type(r) for r in const_types_raw) if ct
            ]

            # Wu Xing elements list
            elements_raw = raw.get("wuxing_elements", raw.get("elements", [])) or []
            wuxing_elements: List[WuXingElement] = [
                el for el in (TCMTypeBridge.engine_to_wuxing_element(r) for r in elements_raw) if el
            ]

            primary_raw = raw.get("primary_type")
            primary_type = TCMTypeBridge.engine_to_tcm_constitution_type(primary_raw) or TCMConstitutionType(
                name="unknown", description="Unknown", characteristics=[], vulnerabilities=[]
            )
            secondary_type = TCMTypeBridge.engine_to_tcm_constitution_type(raw.get("secondary_type"))

            return TCMAnalysisData(
                primary_type=primary_type,
                secondary_type=secondary_type,
                constitution_types=constitution_types or None,
                wuxing_elements=wuxing_elements or None,
                balance_score=raw.get("balance_score"),
                recommendations=raw.get("recommendations"),
            )
        except Exception as e:
            log_conversion_error(BridgeError.ANALYSIS_CONVERSION, "engine_to_tcm_analysis_data", e)
            return None
    
    @staticmethod
    def engine_to_calculation_data(
        raw_calculation: Dict[str, Any]
    ) -> TCMCalculationData:
        """Convert full engine calculation to typed calculation data"""
        try:
            # Extract constitution analysis if present
            constitution_raw = raw_calculation.get("constitution_analysis", {})
            constitution_analysis = TCMTypeBridge.engine_to_constitution_analysis(constitution_raw)
            
            # Extract health guidance
            health_guidance = raw_calculation.get("health_guidance", {})
            
            return TCMCalculationData(
                primary_element=raw_calculation.get("primary_element"),
                elemental_balance=TCMTypeBridge.validate_elemental_balance(raw_calculation.get("elemental_balance")),
                constitution_analysis=constitution_analysis,
                analysis_confidence=raw_calculation.get("analysis_confidence", 0.0),
                dietary_recommendations=health_guidance.get("dietary_recommendations"),
                lifestyle_recommendations=health_guidance.get("lifestyle_recommendations"),
                seasonal_guidance=raw_calculation.get("seasonal_recommendations")
            )
        except Exception as e:
            log_conversion_error(BridgeError.ANALYSIS_CONVERSION, "engine_to_calculation_data", e)
            # Return minimal valid data
            return TCMCalculationData(
                primary_element="earth",
                elemental_balance={"wood": 0.2, "fire": 0.2, "earth": 0.2, "metal": 0.2, "water": 0.2},
                analysis_confidence=0.0
            )

    # ----- Additional converters for response-layer enrichment -----

    @staticmethod
    def engine_to_elemental_balance(raw: Any) -> Dict[str, float]:
        return TCMTypeBridge.validate_elemental_balance(raw)

    @staticmethod
    def engine_to_elemental_balance_response(raw: Any) -> ElementalBalanceResponse:
        # Validate and get the elemental balance dict
        balance_dict = TCMTypeBridge.validate_elemental_balance(raw)
        
        # Find the primary element (highest value)
        primary_element = max(balance_dict.items(), key=lambda x: x[1])[0] if balance_dict else "earth"
        
        # Cast to proper literal type for Pydantic
        from typing import cast, Literal
        element_literal = cast(Literal['wood', 'fire', 'earth', 'metal', 'water'], 
                              TCMTypeBridge.validate_element_name(primary_element))
        
        return ElementalBalanceResponse(
            success=True,
            elemental_balance=balance_dict,
            primary_element=element_literal,
            element_strength=balance_dict.get(primary_element, 0.2),
            quick_analysis=True,
            user_id=None,  # Will be set by endpoint if needed
            generated_at=""  # Will be set by endpoint
        )

    @staticmethod
    def engine_to_constitution_analysis_response(raw: Any) -> Optional[ConstitutionAnalysisResponse]:
        if not isinstance(raw, dict):
            return None
        try:
            return ConstitutionAnalysisResponse(
                primary_element=raw.get("primary_element", "earth"),
                secondary_element=raw.get("secondary_element"),
                constitutional_type=raw.get("constitutional_type", "unknown"),
                element_strength=TCMTypeBridge.validate_percentage(raw.get("element_strength", 0.0), 0.0),
                constitution_traits=raw.get("constitution_traits", []) or [],
            )
        except Exception as e:
            log_conversion_error(BridgeError.CONSTITUTION_CONVERSION, "engine_to_constitution_analysis_response", e)
            return None

    @staticmethod
    def engine_result_to_tcm_response(raw: Dict[str, Any], processing_time_ms: float, include_detail: bool) -> TCMResponse:
        calc = TCMTypeBridge.engine_to_calculation_data(raw)
        return TCMResponse(
            success=True,
            data=calc,
            calculation_method="traditional_chinese_medicine",
            processing_time_ms=processing_time_ms,
            api_version="1.0",
            generated_at=datetime.now().isoformat(),
            includes_detailed_analysis=include_detail,
        )
    
    @staticmethod
    def safe_extract_list(data: Any, key: str, default: Optional[List[str]] = None) -> List[str]:
        """Safely extract list from data with type checking"""
        if default is None:
            default = []
            
        try:
            if isinstance(data, dict) and key in data:
                value = data[key]
                if isinstance(value, list):
                    # Ensure all items are strings
                    return [str(item) for item in value if item is not None]
                elif isinstance(value, str):
                    return [value]
            return default
        except Exception:
            return default
    
    @staticmethod
    def safe_extract_string(data: Any, key: str, default: str = "") -> str:
        """Safely extract string from data"""
        try:
            if isinstance(data, dict) and key in data:
                value = data[key]
                return str(value) if value is not None else default
            return default
        except Exception:
            return default
    
    @staticmethod
    def safe_extract_float(data: Any, key: str, default: float = 0.0) -> float:
        """Safely extract float from data with bounds checking"""
        try:
            if isinstance(data, dict) and key in data:
                value = data[key]
                if isinstance(value, (int, float)):
                    return max(0.0, min(1.0, float(value)))  # Clamp between 0-1
            return default
        except Exception:
            return default
    
    @staticmethod
    def validate_element_name(element: str) -> str:
        """Validate (normalize) element name (legacy alias)."""
        return TCMTypeBridge.normalize_element_name(element)

    # (Legacy alias kept above for backward compatibility)  # noqa: E303
    
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
            element=TCMTypeBridge.validate_element_name(element),
            dietary_recommendations=dietary_recommendations,
            lifestyle_recommendations=lifestyle_recommendations,
            optimal_season=element_info.season or "varies",
            balanced_emotion=element_info.emotion_balanced or "balance",
            dominant_organs=[
                element_info.organ_yin or "unknown",
                element_info.organ_yang or "unknown"
            ],
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
            element=TCMTypeBridge.validate_element_name(element),
            season=element_info.season,
            organs={
                "yin": element_info.organ_yin,
                "yang": element_info.organ_yang
            },
            emotions={
                "balanced": element_info.emotion_balanced,
                "imbalanced": element_info.emotion_imbalanced
            },
            planetary_influences=element_info.planets or [],
            optimal_hours=element_info.hours or {},
            generated_at=generated_at
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
            success=True,
            data=tcm_data,
            calculation_method="traditional_chinese_medicine",
            processing_time_ms=processing_time_ms,
            api_version="1.0",
            generated_at=generated_at,
            includes_detailed_analysis=includes_detailed_analysis
        )

    # ----- New response builders -----

    @staticmethod
    def create_elemental_balance_response(raw_balance: Dict[str, float]) -> ElementalBalanceResponse:
        return TCMTypeBridge.engine_to_elemental_balance_response(raw_balance)

    @staticmethod
    def create_constitution_analysis_response(raw_constitution: Dict[str, Any]) -> Optional[ConstitutionAnalysisResponse]:
        return TCMTypeBridge.engine_to_constitution_analysis_response(raw_constitution)

    @staticmethod
    def create_organ_system_balance_response(raw_list: Any) -> List[OrganSystemBalance]:
        out: List[OrganSystemBalance] = []
        if isinstance(raw_list, list):
            for item in raw_list:
                converted = TCMTypeBridge.engine_to_organ_system_balance(item)
                if converted:
                    out.append(converted)
        return out

    @staticmethod
    def create_meridian_flow_response(raw_list: Any) -> List[MeridianFlowData]:
        out: List[MeridianFlowData] = []
        if isinstance(raw_list, list):
            for item in raw_list:
                converted = TCMTypeBridge.engine_to_meridian_flow_data(item)
                if converted:
                    out.append(converted)
        return out

    @staticmethod
    def create_full_analysis_response(raw: Dict[str, Any], processing_time_ms: float, include_detail: bool) -> TCMResponse:
        return TCMTypeBridge.engine_result_to_tcm_response(raw, processing_time_ms, include_detail)

    # ----- Request / inbound helpers -----

    @staticmethod
    def request_to_engine_params(req: TCMRequest) -> Tuple[int, int, int, int, int, float, float, str, Optional[str]]:
        return (
            req.year,
            req.month,
            req.day,
            req.hour,
            req.minute,
            req.lat,
            req.lon,
            req.timezone,
            req.user_id,
        )

    @staticmethod
    def api_payload_normalizer(payload: Dict[str, Any]) -> Dict[str, Any]:
            # Light sanitation – currently only returns copy; placeholder for future transformations
            return payload.copy()

    # ----- Safe accessors (wrappers around engine attributes) -----

    @staticmethod
    def safe_get_elemental_balance(engine: Any) -> Dict[str, float]:
        try:
            if engine and hasattr(engine, "elemental_balance"):
                return TCMTypeBridge.validate_elemental_balance(getattr(engine, "elemental_balance"))
        except Exception as e:
            log_conversion_error(BridgeError.BALANCE_VALIDATION, "safe_get_elemental_balance", e)
        return DEFAULT_ELEMENTAL_BALANCE.copy()

    @staticmethod
    def safe_get_constitution_analysis(engine: Any) -> Optional[ConstitutionAnalysis]:
        try:
            data = safe_get(getattr(engine, "__dict__", {}), "constitution_analysis")
            if isinstance(data, dict):
                return TCMTypeBridge.engine_to_constitution_analysis(data)
        except Exception:
            pass
        return None

    @staticmethod
    def safe_get_wuxing_elements(engine: Any) -> List[WuXingElement]:
        try:
            raw_list = getattr(engine, "wuxing_elements", [])
            out: List[WuXingElement] = []
            if isinstance(raw_list, list):
                for item in raw_list:
                    el = TCMTypeBridge.engine_to_wuxing_element(item)
                    if el:
                        out.append(el)
            return out
        except Exception as e:
            log_conversion_error(BridgeError.ELEMENT_CONVERSION, "safe_get_wuxing_elements", e)
            return []

    @staticmethod
    def safe_get_meridian_flow(engine: Any) -> List[MeridianFlowData]:
        try:
            raw_list = getattr(engine, "meridian_flow", [])
            out: List[MeridianFlowData] = []
            if isinstance(raw_list, list):
                for item in raw_list:
                    mf = TCMTypeBridge.engine_to_meridian_flow_data(item)
                    if mf:
                        out.append(mf)
            return out
        except Exception as e:
            log_conversion_error(BridgeError.ANALYSIS_CONVERSION, "safe_get_meridian_flow", e)
            return []

    @staticmethod
    def safe_get_organ_system_balances(engine: Any) -> List[OrganSystemBalance]:
        try:
            raw_list = getattr(engine, "organ_system_balances", [])
            out: List[OrganSystemBalance] = []
            if isinstance(raw_list, list):
                for item in raw_list:
                    ob = TCMTypeBridge.engine_to_organ_system_balance(item)
                    if ob:
                        out.append(ob)
            return out
        except Exception as e:
            log_conversion_error(BridgeError.ANALYSIS_CONVERSION, "safe_get_organ_system_balances", e)
            return []

    @staticmethod
    def safe_build_full_analysis(engine: Any) -> Dict[str, Any]:
        """Aggregate safe accessors into a single raw dict (pre-Pydantic)."""
        try:
            return {
                "elemental_balance": TCMTypeBridge.safe_get_elemental_balance(engine),
                "constitution_analysis": (
                    TCMTypeBridge.safe_get_constitution_analysis(engine)
                    or ConstitutionAnalysis(
                        constitutional_type="unknown",
                        constitution_traits=[],
                        primary_element="earth",
                        element_strength=0.0,
                    )
                ).model_dump(),
                "wuxing_elements": [w.model_dump() for w in TCMTypeBridge.safe_get_wuxing_elements(engine)],
                "meridian_flow": [m.model_dump() for m in TCMTypeBridge.safe_get_meridian_flow(engine)],
                "organ_system_balances": [o.model_dump() for o in TCMTypeBridge.safe_get_organ_system_balances(engine)],
            }
        except Exception as e:
            log_conversion_error(BridgeError.GENERIC, "safe_build_full_analysis", e)
            return {}

# Convenience functions for backward compatibility
def safe_get_element_data_typed(engine: Any, element: str) -> ElementInfo:
    """Type-safe wrapper for getting element data"""
    if engine and hasattr(engine, 'element_data') and element in engine.element_data:
        raw_data = engine.element_data[element]
        return TCMTypeBridge.engine_to_element_info(raw_data)
    return ElementInfo()

def safe_convert_calculation_result(raw_result: Dict[str, Any]) -> TCMCalculationData:
    """Type-safe conversion of calculation results"""
    return TCMTypeBridge.engine_to_calculation_data(raw_result)

# Public re-exports
__all__ = [
    "TCMTypeBridge",
    "safe_get_element_data_typed",
    "safe_convert_calculation_result",
    "BridgeError",
    "VALID_ELEMENTS",
    "DEFAULT_ELEMENTAL_BALANCE",
]
