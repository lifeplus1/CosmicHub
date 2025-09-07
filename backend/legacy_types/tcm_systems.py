# backend/types/tcm_systems.py
"""
TCM (Traditional Chinese Medicine) Type Bridge - Pydantic models mirroring TypeScript types
Part of the unified Type Bridge System for CosmicHub
"""

from datetime import datetime
from typing import Any, Dict, List, Optional, Union, Literal
from pydantic import BaseModel, Field


class WuXingElement(BaseModel):
    """Wu Xing (Five Elements) data structure"""
    name: str = Field(..., description="Element name")
    chineseName: str = Field(..., description="Chinese name")
    season: str = Field(..., description="Associated season")
    organ: str = Field(..., description="Associated organ")
    emotion: str = Field(..., description="Associated emotion")
    balanceLevel: Literal['high', 'medium', 'low'] = Field(..., description="Balance level")
    percentage: float = Field(..., ge=0, le=100, description="Balance percentage")
    characteristics: List[str] = Field(..., description="Element characteristics")
    vulnerabilities: List[str] = Field(..., description="Element vulnerabilities")
    balancing_elements: List[str] = Field(..., description="Balancing elements")
    recommendations: List[str] = Field(..., description="Recommendations")


class TCMConstitutionType(BaseModel):
    """TCM Constitution Type"""
    name: str = Field(..., description="Constitution type name")
    description: str = Field(..., description="Type description")
    characteristics: List[str] = Field(..., description="Type characteristics")
    vulnerabilities: List[str] = Field(..., description="Type vulnerabilities")
    season: Optional[str] = Field(None, description="Associated season")
    organ: Optional[str] = Field(None, description="Associated organ")
    emotion: Optional[str] = Field(None, description="Associated emotion")
    recommendations: Optional[List[str]] = Field(None, description="Recommendations")


class TCMAnalysisData(BaseModel):
    """TCM Analysis Data"""
    primary_type: TCMConstitutionType
    secondary_type: Optional[TCMConstitutionType] = None
    constitution_types: Optional[List[TCMConstitutionType]] = None
    wuxing_elements: Optional[List[WuXingElement]] = None
    balance_score: Optional[float] = Field(None, ge=0, le=100, description="Balance score")
    recommendations: Optional[List[str]] = None


class OrganSystemBalance(BaseModel):
    """Organ System Balance"""
    name: str = Field(..., description="Organ name")
    balance: float = Field(..., ge=0, le=100, description="Balance percentage")
    season: str = Field(..., description="Associated season")
    element: str = Field(..., description="Associated element")
    characteristics: List[str] = Field(..., description="Characteristics")
    vulnerabilities: List[str] = Field(..., description="Vulnerabilities")


class MeridianFlowData(BaseModel):
    """Meridian Flow Data"""
    name: str = Field(..., description="Meridian name")
    timeWindow: str = Field(..., description="Time window")
    energy_level: float = Field(..., ge=0, le=100, description="Energy level")
    blockages: Optional[List[str]] = Field(None, description="Blockages")
    flow_direction: Literal['ascending', 'descending', 'circular'] = Field(..., description="Flow direction")


class ElementInfo(BaseModel):
    """Element Information"""
    season: Optional[str] = Field(None, description="Season")
    organ_yin: Optional[str] = Field(None, description="Yin organ")
    organ_yang: Optional[str] = Field(None, description="Yang organ")
    emotion_balanced: Optional[str] = Field(None, description="Balanced emotion")
    emotion_imbalanced: Optional[str] = Field(None, description="Imbalanced emotion")
    planets: Optional[List[str]] = Field(None, description="Associated planets")
    hours: Optional[Dict[str, Union[str, float]]] = Field(None, description="Optimal hours - Record<string, string | number>")


class ElementalBalance(BaseModel):
    """Elemental Balance"""
    wood: float = Field(..., ge=0, le=100, description="Wood element balance")
    fire: float = Field(..., ge=0, le=100, description="Fire element balance")
    earth: float = Field(..., ge=0, le=100, description="Earth element balance")
    metal: float = Field(..., ge=0, le=100, description="Metal element balance")
    water: float = Field(..., ge=0, le=100, description="Water element balance")


class ConstitutionAnalysis(BaseModel):
    """Constitution Analysis"""
    constitutional_type: Optional[str] = Field(None, description="Constitutional type")
    constitution_traits: Optional[List[str]] = Field(None, description="Constitution traits")
    primary_element: Optional[str] = Field(None, description="Primary element")
    element_strength: Optional[float] = Field(None, ge=0, le=100, description="Element strength")


class TCMCalculationData(BaseModel):
    """TCM Calculation Data"""
    primary_element: Optional[str] = Field(None, description="Primary element")
    elemental_balance: Optional[Dict[str, float]] = Field(None, description="Elemental balance")
    constitution_analysis: Optional[ConstitutionAnalysis] = None
    analysis_confidence: Optional[float] = Field(None, ge=0, le=100, description="Analysis confidence")
    dietary_recommendations: Optional[List[str]] = Field(None, description="Dietary recommendations")
    lifestyle_recommendations: Optional[List[str]] = Field(None, description="Lifestyle recommendations")
    seasonal_guidance: Optional[Dict[str, Union[str, float]]] = Field(None, description="Seasonal guidance - Record<string, string | number>")


class TCMResponse(BaseModel):
    """TCM Response"""
    success: bool = Field(default=True, description="Success status")
    data: TCMCalculationData
    calculation_method: str = Field(..., description="Calculation method")
    processing_time_ms: float = Field(..., description="Processing time")
    api_version: str = Field(..., description="API version")
    generated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat(),
                             description="Generation timestamp")
    includes_detailed_analysis: bool = Field(..., description="Detailed analysis flag")


class TCMRequest(BaseModel):
    """TCM Request"""
    year: int = Field(..., ge=1900, le=2100, description="Birth year")
    month: int = Field(..., ge=1, le=12, description="Birth month")
    day: int = Field(..., ge=1, le=31, description="Birth day")
    hour: Optional[int] = Field(None, ge=0, le=23, description="Birth hour")
    minute: Optional[int] = Field(None, ge=0, le=59, description="Birth minute")
    lat: Optional[float] = Field(None, ge=-90, le=90, description="Latitude")
    lon: Optional[float] = Field(None, ge=-180, le=180, description="Longitude")
    timezone: Optional[str] = Field(None, description="Timezone")
    user_id: Optional[str] = Field(None, description="User ID")
    include_detailed_analysis: Optional[bool] = Field(False, description="Include detailed analysis")


class ElementalBalanceResponse(BaseModel):
    """Elemental Balance Response"""
    wood: float = Field(..., ge=0, le=100)
    fire: float = Field(..., ge=0, le=100)
    earth: float = Field(..., ge=0, le=100)
    metal: float = Field(..., ge=0, le=100)
    water: float = Field(..., ge=0, le=100)


class ConstitutionAnalysisResponse(BaseModel):
    """Constitution Analysis Response"""
    primary_element: str = Field(..., description="Primary element")
    secondary_element: Optional[str] = Field(None, description="Secondary element")
    constitutional_type: str = Field(..., description="Constitutional type")
    element_strength: float = Field(..., ge=0, le=100, description="Element strength")
    constitution_traits: List[str] = Field(..., description="Constitution traits")


class HealthRecommendationsResponse(BaseModel):
    """Health Recommendations Response"""
    element: str = Field(..., description="Element")
    dietary_recommendations: List[str] = Field(..., description="Dietary recommendations")
    lifestyle_recommendations: List[str] = Field(..., description="Lifestyle recommendations")
    optimal_season: str = Field(..., description="Optimal season")
    balanced_emotion: str = Field(..., description="Balanced emotion")
    dominant_organs: List[str] = Field(..., description="Dominant organs")
    generated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat(),
                             description="Generation timestamp")


class ElementOrgans(BaseModel):
    """Element Organs structure matching TypeScript interface"""
    yin: Optional[str] = Field(None, description="Yin organ")
    yang: Optional[str] = Field(None, description="Yang organ")


class ElementEmotions(BaseModel):
    """Element Emotions structure matching TypeScript interface"""
    balanced: Optional[str] = Field(None, description="Balanced emotion")
    imbalanced: Optional[str] = Field(None, description="Imbalanced emotion")


class ElementInfoResponse(BaseModel):
    """Element Info Response"""
    element: str = Field(..., description="Element")
    season: Optional[str] = Field(None, description="Season")
    organs: ElementOrgans = Field(..., description="Organs - { yin?: string; yang?: string }")
    emotions: ElementEmotions = Field(..., description="Emotions")
    planetary_influences: List[str] = Field(..., description="Planetary influences")
    optimal_hours: Dict[str, Union[str, float]] = Field(..., description="Optimal hours - Record<string, string | number>")
    yang: Optional[str] = Field(None, description="Yang organ (legacy field)")
    generated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat(),
                             description="Generation timestamp")


class TCMAnalysisResponse(BaseModel):
    """Complete TCM Analysis Response - Primary response type for calculate endpoint"""
    success: bool = Field(default=True, description="Success status")
    data: TCMCalculationData = Field(..., description="TCM calculation results")
    calculation_method: str = Field(..., description="Calculation method used")
    processing_time_ms: float = Field(..., description="Processing time in milliseconds")
    api_version: str = Field(default="1.0", description="API version")
    generated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat(),
                             description="Generation timestamp")
    includes_detailed_analysis: bool = Field(..., description="Whether detailed analysis is included")
    user_id: Optional[str] = Field(None, description="User ID if provided")

    class Config:
        """Pydantic configuration"""
        json_schema_extra = {
            "example": {
                "success": True,
                "data": {
                    "primary_element": "wood",
                    "elemental_balance": {"wood": 35, "fire": 20, "earth": 15, "metal": 15, "water": 15},
                    "analysis_confidence": 85
                },
                "calculation_method": "traditional",
                "processing_time_ms": 245.6,
                "api_version": "1.0",
                "generated_at": "2025-09-05T12:00:00Z",
                "includes_detailed_analysis": True
            }
        }


class TCMHealthCheck(BaseModel):
    """TCM Health Check"""
    service: str = Field(default="tcm", description="Service name")
    status: Literal['healthy', 'unhealthy'] = Field(..., description="Service status")
    engine_available: bool = Field(..., description="Engine availability")
    version: str = Field(..., description="Version")
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat(),
                          description="Timestamp")

    class Config:
        """Pydantic configuration"""
        json_schema_extra = {
            "example": {
                "service": "tcm",
                "status": "healthy",
                "engine_available": True,
                "version": "1.0.0",
                "timestamp": "2025-09-05T00:00:00Z"
            }
        }
