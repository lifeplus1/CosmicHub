from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class InterpretationRequest(BaseModel):
    chartId: str
    userId: str
    chartData: Dict[str, Any]
    sections: List[str] = Field(default_factory=list)


class InterpretationResponse(BaseModel):
    chartId: str
    interpretations: Dict[str, Any]
    generatedAt: datetime
    success: bool = True


class AIAnalysisRequest(BaseModel):
    userId: str
    chartData: Dict[str, Any]
    analysisType: str = "general"
    userPreferences: Optional[Dict[str, Any]] = None


class AIAnalysisResponse(BaseModel):
    analysis: Dict[str, Any]
    confidence: float
    analysisType: str
    generatedAt: datetime
