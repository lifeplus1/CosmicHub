"""
TCM Analytics Schema - Optimized for Parquet/Columnar Analytics
Tier 1: Flat schema for analytics processing and ML training
"""

from typing import Dict, List, Optional, Literal, Any
from pydantic import BaseModel, Field
from datetime import datetime


# ===== ANALYTICS-OPTIMIZED FLAT SCHEMA =====

class TCMAnalyticsRecord(BaseModel):
    """
    Flattened TCM record optimized for Parquet analytics.
    This is the primary format for data warehouse and ML training.
    """
    # Core metadata (analytics keys)
    timestamp: str
    user_id_hash: Optional[str] = None
    session_id: str
    calculation_type: str = "tcm_analysis"
    processing_time_ms: float = Field(ge=0.0)
    success: bool = True
    error_code: Optional[str] = None
    api_version: str = "1.0"
    
    # Birth data (flattened for analytics)
    birth_year: int = Field(ge=1900, le=2100)
    birth_month: int = Field(ge=1, le=12)
    birth_day: int = Field(ge=1, le=31)
    birth_hour: int = Field(ge=0, le=23)
    birth_minute: int = Field(ge=0, le=59)
    birth_latitude: float = Field(ge=-90.0, le=90.0)
    birth_longitude: float = Field(ge=-180.0, le=180.0)
    birth_timezone: str = "UTC"
    
    # Primary TCM results (for analytics/ML)
    primary_element: Literal['wood', 'fire', 'earth', 'metal', 'water']
    primary_element_strength: float = Field(ge=0.0, le=1.0)
    constitutional_type: str
    balance_score: float = Field(ge=0.0, le=1.0)
    analysis_confidence: float = Field(ge=0.0, le=1.0)
    
    # Element balance (flattened - critical for ML features)
    wood_percentage: float = Field(ge=0.0, le=1.0)
    fire_percentage: float = Field(ge=0.0, le=1.0)
    earth_percentage: float = Field(ge=0.0, le=1.0)
    metal_percentage: float = Field(ge=0.0, le=1.0)
    water_percentage: float = Field(ge=0.0, le=1.0)
    
    # Secondary elements (for analytics patterns)
    secondary_element: Optional[Literal['wood', 'fire', 'earth', 'metal', 'water']] = None
    secondary_element_strength: float = Field(default=0.0, ge=0.0, le=1.0)
    
    # Health metrics (quantified for analytics)
    organ_balance_count: int = Field(default=0, ge=0)
    meridian_flow_count: int = Field(default=0, ge=0)
    recommendation_count: int = Field(default=0, ge=0)
    dietary_rec_count: int = Field(default=0, ge=0)
    lifestyle_rec_count: int = Field(default=0, ge=0)
    
    # Seasonal/temporal analysis
    optimal_season: Optional[str] = None
    current_season_match: bool = False
    
    # Constitution characteristics (aggregated for ML)
    constitution_trait_count: int = Field(default=0, ge=0)
    vulnerability_count: int = Field(default=0, ge=0)
    
    # Additional analytics fields
    detailed_analysis_requested: bool = True
    chart_context_available: bool = False
    follow_up_analysis: bool = False


class TCMBatchAnalytics(BaseModel):
    """
    Batch analytics summary for TCM data processing.
    Used for generating insights and performance metrics.
    """
    # Batch metadata
    batch_id: str
    processing_date: str
    record_count: int = Field(ge=0)
    date_range_start: str
    date_range_end: str
    
    # Aggregate metrics
    avg_processing_time_ms: float = Field(ge=0.0)
    success_rate: float = Field(ge=0.0, le=1.0)
    avg_confidence: float = Field(ge=0.0, le=1.0)
    avg_balance_score: float = Field(ge=0.0, le=1.0)
    
    # Element distribution (for population analytics)
    element_distribution: Dict[str, float]  # {'wood': 0.23, 'fire': 0.18, ...}
    constitution_distribution: Dict[str, int]  # {'yang_bright': 150, 'yin_deficient': 120, ...}
    
    # Seasonal patterns
    seasonal_patterns: Dict[str, Dict[str, float]]  # {'spring': {'wood': 0.35, ...}, ...}
    
    # Performance metrics
    error_types: Dict[str, int]
    avg_recommendation_count: float = Field(ge=0.0)
    
    # ML training metrics
    training_data_quality: float = Field(ge=0.0, le=1.0)
    feature_completeness: float = Field(ge=0.0, le=1.0)


# ===== CONVERSION UTILITIES =====

class TCMAnalyticsConverter:
    """
    Simplified converter from complex TCM types to flat analytics schema.
    Focuses on extracting key metrics for ML and analytics processing.
    """
    
    @staticmethod
    def to_analytics_record(
        calculation_data: Dict[str, Any],
        request_data: Dict[str, Any],
        metadata: Dict[str, Any]
    ) -> TCMAnalyticsRecord:
        """
        Convert complex TCM calculation to flat analytics record.
        Optimized for Parquet storage and ML feature extraction.
        """
        # Extract element balance with defaults
        element_balance = calculation_data.get("elemental_balance", {})
        
        # Extract constitution analysis
        constitution = calculation_data.get("constitution_analysis", {})
        
        return TCMAnalyticsRecord(
            # Metadata
            timestamp=metadata.get("timestamp", datetime.now().isoformat()),
            user_id_hash=metadata.get("user_id_hash"),
            session_id=metadata.get("session_id", "unknown"),
            processing_time_ms=metadata.get("processing_time_ms", 0.0),
            success=metadata.get("success", True),
            error_code=metadata.get("error_code"),
            
            # Birth data (flattened)
            birth_year=request_data.get("year", 2000),
            birth_month=request_data.get("month", 1),
            birth_day=request_data.get("day", 1),
            birth_hour=request_data.get("hour", 12),
            birth_minute=request_data.get("minute", 0),
            birth_latitude=request_data.get("lat", 0.0),
            birth_longitude=request_data.get("lon", 0.0),
            birth_timezone=request_data.get("timezone", "UTC"),
            
            # Primary results
            primary_element=calculation_data.get("primary_element", "earth"),
            primary_element_strength=constitution.get("element_strength", 0.0),
            constitutional_type=constitution.get("constitutional_type", "unknown"),
            balance_score=calculation_data.get("balance_score", 0.0),
            analysis_confidence=calculation_data.get("analysis_confidence", 0.0),
            
            # Flattened element percentages (critical for ML)
            wood_percentage=element_balance.get("wood", 0.2),
            fire_percentage=element_balance.get("fire", 0.2),
            earth_percentage=element_balance.get("earth", 0.2),
            metal_percentage=element_balance.get("metal", 0.2),
            water_percentage=element_balance.get("water", 0.2),
            
            # Secondary analysis
            secondary_element=calculation_data.get("secondary_element"),
            
            # Health metrics (aggregated counts for analytics)
            recommendation_count=len(calculation_data.get("dietary_recommendations", [])),
            dietary_rec_count=len(calculation_data.get("dietary_recommendations", [])),
            lifestyle_rec_count=len(calculation_data.get("lifestyle_recommendations", [])),
            constitution_trait_count=len(constitution.get("constitution_traits", [])),
            
            # Context flags
            detailed_analysis_requested=request_data.get("include_detailed_analysis", True),
            chart_context_available=bool(request_data.get("chart_context")),
        )
    
    @staticmethod
    def create_parquet_schema() -> Dict[str, str]:
        """
        Define optimal Parquet schema for TCM analytics data.
        Optimized for columnar analytics and ML feature extraction.
        """
        return {
            # String columns (categorical for analytics)
            'timestamp': 'string',
            'user_id_hash': 'string',
            'session_id': 'string',
            'primary_element': 'category',  # Limited values - efficient storage
            'constitutional_type': 'category',
            'birth_timezone': 'category',
            'error_code': 'string',
            
            # Numeric columns (ML features)
            'processing_time_ms': 'float64',
            'birth_year': 'int32',
            'birth_month': 'int8',
            'birth_day': 'int8', 
            'birth_hour': 'int8',
            'birth_minute': 'int8',
            'birth_latitude': 'float32',
            'birth_longitude': 'float32',
            
            # ML feature columns (float32 for efficiency)
            'primary_element_strength': 'float32',
            'balance_score': 'float32',
            'analysis_confidence': 'float32',
            'wood_percentage': 'float32',
            'fire_percentage': 'float32',
            'earth_percentage': 'float32',
            'metal_percentage': 'float32',
            'water_percentage': 'float32',
            'secondary_element_strength': 'float32',
            
            # Count columns (int16 for efficiency)
            'recommendation_count': 'int16',
            'dietary_rec_count': 'int16',
            'lifestyle_rec_count': 'int16',
            'constitution_trait_count': 'int16',
            'vulnerability_count': 'int16',
            
            # Boolean flags (boolean type)
            'success': 'boolean',
            'detailed_analysis_requested': 'boolean',
            'chart_context_available': 'boolean',
            'current_season_match': 'boolean',
            'follow_up_analysis': 'boolean',
        }


# Export key classes for use in analytics pipeline
__all__ = [
    "TCMAnalyticsRecord",
    "TCMBatchAnalytics", 
    "TCMAnalyticsConverter",
]
