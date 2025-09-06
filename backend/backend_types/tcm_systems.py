"""
TCM (Traditional Chinese Medicine) System Types - Python Implementation
Mirror of packages/types/src/tcm-systems.types.ts for type consistency
"""

from typing import Dict, List, Optional, Literal, Any
from pydantic import BaseModel, Field


# ===== CORE TCM TYPES =====

class WuXingElement(BaseModel):
    """Wu Xing (Five Elements) Element"""
    name: str
    chinese_name: str
    season: str
    organ: str
    emotion: str
    balance_level: Literal['high', 'medium', 'low']
    percentage: float = Field(ge=0.0, le=1.0)
    characteristics: List[str]
    vulnerabilities: List[str]
    balancing_elements: List[str]
    recommendations: List[str]


class TCMConstitutionType(BaseModel):
    """TCM Constitutional Type"""
    name: str
    description: str
    characteristics: List[str]
    vulnerabilities: List[str]
    season: Optional[str] = None
    organ: Optional[str] = None
    emotion: Optional[str] = None
    recommendations: Optional[List[str]] = None


class TCMAnalysisData(BaseModel):
    """Complete TCM Analysis Data"""
    primary_type: TCMConstitutionType
    secondary_type: Optional[TCMConstitutionType] = None
    constitution_types: Optional[List[TCMConstitutionType]] = None
    wuxing_elements: Optional[List[WuXingElement]] = None
    balance_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    recommendations: Optional[List[str]] = None


class OrganSystemBalance(BaseModel):
    """Organ System Balance"""
    name: str
    balance: float = Field(ge=0.0, le=1.0)
    season: str
    element: str
    characteristics: List[str]
    vulnerabilities: List[str]


class MeridianFlowData(BaseModel):
    """Meridian Flow Data"""
    name: str
    time_window: str
    energy_level: float = Field(ge=0.0, le=1.0)
    blockages: Optional[List[str]] = None
    flow_direction: Literal['ascending', 'descending', 'circular']


# ===== API-SPECIFIC TYPES =====

class ElementInfo(BaseModel):
    """Element Information Structure"""
    season: Optional[str] = None
    organ_yin: Optional[str] = None
    organ_yang: Optional[str] = None
    emotion_balanced: Optional[str] = None
    emotion_imbalanced: Optional[str] = None
    planets: Optional[List[str]] = None
    hours: Optional[Dict[str, Any]] = None


class ElementalBalance(BaseModel):
    """Five Element Balance"""
    wood: float = Field(ge=0.0, le=1.0)
    fire: float = Field(ge=0.0, le=1.0)
    earth: float = Field(ge=0.0, le=1.0)
    metal: float = Field(ge=0.0, le=1.0)
    water: float = Field(ge=0.0, le=1.0)


class ConstitutionAnalysis(BaseModel):
    """Constitutional Analysis Data"""
    constitutional_type: Optional[str] = None
    constitution_traits: Optional[List[str]] = None
    primary_element: Optional[str] = None
    element_strength: Optional[float] = Field(None, ge=0.0, le=1.0)


class TCMCalculationData(BaseModel):
    """TCM Calculation Result Data"""
    primary_element: Optional[str] = None
    elemental_balance: Optional[Dict[str, float]] = None
    constitution_analysis: Optional[ConstitutionAnalysis] = None
    analysis_confidence: Optional[float] = Field(None, ge=0.0, le=1.0)
    dietary_recommendations: Optional[List[str]] = None
    lifestyle_recommendations: Optional[List[str]] = None
    seasonal_guidance: Optional[Dict[str, Any]] = None


class TCMResponse(BaseModel):
    """Complete TCM API Response"""
    success: bool
    data: TCMCalculationData
    calculation_method: str
    processing_time_ms: float = Field(ge=0.0)
    api_version: str
    generated_at: str
    includes_detailed_analysis: bool


# ===== REQUEST/RESPONSE MODELS =====

class TCMRequest(BaseModel):
    """TCM Constitutional Analysis Request"""
    year: int = Field(ge=1900, le=2100)
    month: int = Field(ge=1, le=12)
    day: int = Field(ge=1, le=31)
    hour: int = Field(12, ge=0, le=23)
    minute: int = Field(0, ge=0, le=59)
    lat: float = Field(0.0, ge=-90.0, le=90.0)
    lon: float = Field(0.0, ge=-180.0, le=180.0)
    timezone: str = "UTC"
    user_id: Optional[str] = None
    include_detailed_analysis: bool = True


class ConstitutionAnalysisResponse(BaseModel):
    """Constitutional Analysis Response"""
    primary_element: str
    secondary_element: Optional[str] = None
    constitutional_type: str
    element_strength: float = Field(ge=0.0, le=1.0)
    constitution_traits: List[str]


class HealthRecommendationsResponse(BaseModel):
    """Health Recommendations Response"""
    element: str
    dietary_recommendations: List[str]
    lifestyle_recommendations: List[str]
    optimal_season: str
    balanced_emotion: str
    dominant_organs: List[str]
    generated_at: str


class ElementInfoResponse(BaseModel):
    """Element Info Response"""
    element: str
    season: Optional[str] = None
    organs: Dict[str, Optional[str]]
    emotions: Dict[str, Optional[str]]
    planetary_influences: List[str]
    optimal_hours: Dict[str, Any]
    generated_at: str



# ===== UTILITY TYPES =====

# ===== TYPE ALIASES =====
ElementData = ElementInfo
TCMElementName = Literal['wood', 'fire', 'earth', 'metal', 'water']


class TCMHealthCheck(BaseModel):
    """Health check response for TCM service"""
    service: str
    status: Literal['healthy', 'unhealthy']
    engine_available: bool
    version: str
    timestamp: str


class TCMAnalysisResponse(BaseModel):
    """Complete TCM constitutional analysis response"""
    success: bool = True
    data: TCMCalculationData
    calculation_method: str = "traditional_chinese_medicine"
    processing_time_ms: float
    api_version: str = "1.0"
    generated_at: str
    includes_detailed_analysis: bool


class ElementalBalanceResponse(BaseModel):
    """Quick elemental balance calculation response"""
    success: bool = True
    elemental_balance: Dict[str, float]
    primary_element: Literal['wood', 'fire', 'earth', 'metal', 'water']
    element_strength: float
    quick_analysis: bool = True
    user_id: Optional[str] = None
    generated_at: str
