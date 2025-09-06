"""
TCM API Types - Tier 2: API Layer (Request/Response Models)
Focused on API contracts and validation
"""

from typing import Dict, Optional, Literal
from pydantic import BaseModel, Field
from datetime import datetime


# ===== API REQUEST/RESPONSE MODELS =====

class TCMAnalysisRequest(BaseModel):
    """Simplified TCM analysis request for API endpoints"""
    year: int = Field(ge=1900, le=2100)
    month: int = Field(ge=1, le=12)
    day: int = Field(ge=1, le=31)
    hour: int = Field(default=12, ge=0, le=23)
    minute: int = Field(default=0, ge=0, le=59)
    lat: float = Field(default=0.0, ge=-90.0, le=90.0)
    lon: float = Field(default=0.0, ge=-180.0, le=180.0)
    timezone: str = "UTC"
    user_id: Optional[str] = None
    include_detailed_analysis: bool = True


class ElementalBalanceResult(BaseModel):
    """Core elemental balance results"""
    wood: float = Field(ge=0.0, le=1.0)
    fire: float = Field(ge=0.0, le=1.0)
    earth: float = Field(ge=0.0, le=1.0)
    metal: float = Field(ge=0.0, le=1.0)
    water: float = Field(ge=0.0, le=1.0)


class ConstitutionResult(BaseModel):
    """Constitutional analysis results"""
    primary_element: Literal['wood', 'fire', 'earth', 'metal', 'water']
    constitutional_type: str
    element_strength: float = Field(ge=0.0, le=1.0)
    traits: list[str] = Field(default_factory=list)


class TCMAnalysisResponse(BaseModel):
    """Complete TCM analysis API response"""
    success: bool = True
    
    # Core results
    elemental_balance: ElementalBalanceResult
    constitution: ConstitutionResult
    balance_score: float = Field(ge=0.0, le=1.0)
    analysis_confidence: float = Field(ge=0.0, le=1.0)
    
    # Recommendations (simplified for API)
    dietary_recommendations: list[str] = Field(default_factory=list)
    lifestyle_recommendations: list[str] = Field(default_factory=list)
    optimal_season: Optional[str] = None
    
    # Metadata
    calculation_method: str = "traditional_chinese_medicine"
    processing_time_ms: float = Field(ge=0.0)
    api_version: str = "1.0"
    generated_at: str = Field(default_factory=lambda: datetime.now().isoformat())
    includes_detailed_analysis: bool = True


class QuickElementalBalanceResponse(BaseModel):
    """Quick elemental balance calculation (for fast API endpoints)"""
    success: bool = True
    primary_element: Literal['wood', 'fire', 'earth', 'metal', 'water']
    element_strength: float = Field(ge=0.0, le=1.0)
    elemental_balance: ElementalBalanceResult
    quick_analysis: bool = True
    generated_at: str = Field(default_factory=lambda: datetime.now().isoformat())


class HealthRecommendationsResponse(BaseModel):
    """Health recommendations for specific element"""
    element: Literal['wood', 'fire', 'earth', 'metal', 'water']
    dietary_recommendations: list[str]
    lifestyle_recommendations: list[str]
    optimal_season: str
    balanced_emotion: str
    dominant_organs: list[str]
    generated_at: str


class ElementInfoResponse(BaseModel):
    """Detailed element information"""
    element: Literal['wood', 'fire', 'earth', 'metal', 'water']
    season: Optional[str] = None
    organs: Dict[str, Optional[str]]  # {"yin": "liver", "yang": "gallbladder"}
    emotions: Dict[str, Optional[str]]  # {"balanced": "patience", "imbalanced": "anger"}
    planetary_influences: list[str] = Field(default_factory=list)
    optimal_hours: Dict[str, str] = Field(default_factory=dict)
    generated_at: str


class TCMHealthCheck(BaseModel):
    """Health check response for TCM service"""
    service: str = "TCM Systems API"
    status: Literal['healthy', 'unhealthy'] = 'healthy'
    engine_available: bool = True
    version: str = "1.0"
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())


# ===== ERROR RESPONSES =====

class TCMErrorResponse(BaseModel):
    """Standardized error response"""
    success: bool = False
    error: str
    error_code: str
    details: Optional[str] = None
    generated_at: str = Field(default_factory=lambda: datetime.now().isoformat())


# Export API types
__all__ = [
    "TCMAnalysisRequest",
    "TCMAnalysisResponse", 
    "QuickElementalBalanceResponse",
    "HealthRecommendationsResponse",
    "ElementInfoResponse",
    "TCMHealthCheck",
    "TCMErrorResponse",
    "ElementalBalanceResult",
    "ConstitutionResult",
]
