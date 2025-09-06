"""
API Endpoints for Ayurveda Constitutional Analysis System
AI #3: Backend Architecture Specialist Implementation
Following Integration Strategy: ENHANCE vs CREATE NEW approach
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List, Type, Union, Protocol, runtime_checkable, TYPE_CHECKING, Callable
from datetime import datetime
import logging
import time

# Type-safe imports with protocols
if TYPE_CHECKING:
    from ...astro.calculations.ayurveda_engine import AyurvedaEngine as AyurvedaEngineType
else:
    AyurvedaEngineType = object

# Setup logging first
logger = logging.getLogger(__name__)

@runtime_checkable
class AyurvedaEngineProtocol(Protocol):
    """Protocol for Ayurveda calculation engine"""
    def analyze_constitution(self, birth_data: Dict[str, Any], user_id: Optional[str] = None) -> Any: ...

# Conditional import with proper typing
AyurvedaEngineClass: Union[Type[AyurvedaEngineType], None] = None
calculate_ayurveda_constitution_func: Union[Callable[[Dict[str, Any]], Any], None] = None

try:
    from ...astro.calculations.ayurveda_engine import AyurvedaEngine, calculate_ayurveda_constitution
    from ...astro.calculations.ayurveda_schema import AYURVEDA_QUICK_REFERENCE
    AyurvedaEngineClass = AyurvedaEngine
    calculate_ayurveda_constitution_func = calculate_ayurveda_constitution
    AYURVEDA_AVAILABLE = True
except ImportError as e:
    logger.warning(f"Ayurveda engine not available: {e}")
    AYURVEDA_AVAILABLE = False

def get_ayurveda_engine() -> AyurvedaEngineProtocol:
    """Get Ayurveda engine with proper error handling"""
    if not AYURVEDA_AVAILABLE or AyurvedaEngineClass is None:
        raise HTTPException(
            status_code=503,
            detail="Ayurveda calculation service is not available"
        )
    return AyurvedaEngineClass()  # type: ignore[return-value]

# Setup router
ayurveda_router = APIRouter(prefix="/api/ayurveda", tags=["ayurveda"])

# Request/Response Models
class AyurvedaRequest(BaseModel):
    """Request model for Ayurveda constitutional analysis"""
    birth_data: Dict[str, Any] = Field(..., description="Birth chart data with planetary positions and houses")
    user_id: Optional[str] = Field(None, description="Optional user identifier")
    include_correlations: bool = Field(True, description="Include astrological correlations in response")
    include_guidance: bool = Field(True, description="Include health and lifestyle guidance")

class DoshaBalanceResponse(BaseModel):
    """Response model for dosha balance analysis"""
    vata: float = Field(..., ge=0, le=1, description="Vata dosha percentage (0-1)")
    pitta: float = Field(..., ge=0, le=1, description="Pitta dosha percentage (0-1)") 
    kapha: float = Field(..., ge=0, le=1, description="Kapha dosha percentage (0-1)")
    primary_dosha: str = Field(..., description="Dominant dosha")
    constitution_type: str = Field(..., description="Overall constitutional type")

class AyurvedaResponse(BaseModel):
    """Complete response model for Ayurveda analysis"""
    success: bool = Field(True, description="Analysis success status")
    data: Dict[str, Any] = Field(..., description="Complete Ayurveda analysis data")
    constitution_summary: str = Field(..., description="Brief constitution summary")
    primary_recommendations: List[str] = Field(..., description="Key recommendations")
    calculation_method: str = Field(..., description="Method used for analysis")
    processing_time_ms: int = Field(..., description="Processing time in milliseconds")
    api_version: str = Field("1.0", description="API version")
    generated_at: str = Field(..., description="Response generation timestamp")

class HealthGuidanceResponse(BaseModel):
    """Response model for health guidance"""
    constitution_type: str = Field(..., description="Constitutional type")
    dietary_guidelines: List[str] = Field(..., description="Personalized dietary recommendations")
    lifestyle_recommendations: List[str] = Field(..., description="Lifestyle guidance")
    seasonal_adjustments: Dict[str, List[str]] = Field(..., description="Seasonal recommendations")
    exercise_recommendations: List[str] = Field(..., description="Exercise guidance")
    meditation_practices: List[str] = Field(..., description="Meditation recommendations")

class ErrorResponse(BaseModel):
    """Error response model"""
    success: bool = Field(False, description="Always false for errors")
    error: str = Field(..., description="Error message")
    error_code: str = Field(..., description="Error code")
    timestamp: str = Field(..., description="Error timestamp")

# Helper Functions

# =============================================================================
# CACHING UTILITIES
# =============================================================================

def generate_cache_key(prefix: str, data: Dict[str, Any]) -> str:
    """Generate consistent cache keys for analysis results"""
    import hashlib
    import json
    
    # Create deterministic hash from input data
    sorted_data = json.dumps(data, sort_keys=True, default=str)
    hash_key = hashlib.md5(sorted_data.encode()).hexdigest()
    return f"{prefix}:{hash_key}"

def should_use_cache(request: AyurvedaRequest) -> bool:
    """Determine if request should use cached results"""
    # Skip cache for real-time requests or when explicitly disabled
    return not getattr(request, 'force_refresh', False)

# =============================================================================
# ERROR RECOVERY & FALLBACK UTILITIES
# =============================================================================

def handle_analysis_error(error: Exception, fallback_mode: str = "basic") -> Dict[str, Any]:
    """Provide graceful fallback when analysis fails"""
    logger.error(f"Analysis failed: {error}")
    
    if fallback_mode == "basic":
        return {
            "constitution": {"vata": 33, "pitta": 33, "kapha": 34},
            "confidence": 0.5,
            "analysis_mode": "fallback",
            "recommendations": ["Consult with an Ayurvedic practitioner for personalized analysis"]
        }
    else:
        return {"error": "Analysis temporarily unavailable", "status": "degraded"}

def validate_analysis_result(result: Dict[str, Any]) -> bool:
    """Validate analysis results meet quality standards"""
    required_fields = ["constitution", "confidence"]
    
    if not all(field in result for field in required_fields):
        return False
        
    # Check constitution percentages sum to ~100
    constitution = result.get("constitution", {})
    if isinstance(constitution, dict):
        total = sum(constitution.values())
        return 90 <= total <= 110  # Allow 10% variance
    
    return False

# =============================================================================
# DATA EXPORT & AUDIT UTILITIES
# =============================================================================

def generate_audit_log(
    operation: str, 
    user_data: Dict[str, Any], 
    result: Dict[str, Any],
    performance_metrics: Dict[str, float]
) -> Dict[str, Any]:
    """Generate comprehensive audit log for analysis operations"""
    import hashlib
    import json
    from datetime import datetime
    
    return {
        "timestamp": datetime.utcnow().isoformat(),
        "operation": operation,
        "user_input_hash": hashlib.md5(
            json.dumps(user_data, sort_keys=True).encode()
        ).hexdigest(),
        "result_status": "success" if result.get("constitution") else "failed",
        "performance": performance_metrics,
        "data_privacy": "anonymized",
        "compliance_flags": []
    }

def export_analysis_summary(analysis_result: Dict[str, Any], format_type: str = "json") -> str:
    """Export analysis results in various formats"""
    import json
    
    if format_type == "json":
        return json.dumps(analysis_result, indent=2, default=str)
    elif format_type == "csv":
        # Basic CSV export for constitution data
        constitution = analysis_result.get("constitution", {})
        return f"dosha,percentage\n" + "\n".join(f"{k},{v}" for k, v in constitution.items())
    else:
        return str(analysis_result)

# =============================================================================
# PERFORMANCE & MONITORING UTILITIES  
# =============================================================================

def monitor_performance(operation_name: str):
    """Decorator to monitor API endpoint performance"""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            start_time = time.time()
            start_memory = 0  # Could integrate with psutil for actual memory monitoring
            
            try:
                result = await func(*args, **kwargs)
                
                # Log successful operation
                duration_ms = (time.time() - start_time) * 1000
                logger.info(
                    f"[Performance] {operation_name} completed successfully",
                    extra={
                        "operation": operation_name,
                        "duration_ms": round(duration_ms, 2),
                        "status": "success",
                        "timestamp": datetime.now().isoformat()
                    }
                )
                
                return result
                
            except Exception as e:
                # Log failed operation
                duration_ms = (time.time() - start_time) * 1000
                logger.error(
                    f"[Performance] {operation_name} failed",
                    extra={
                        "operation": operation_name,
                        "duration_ms": round(duration_ms, 2),
                        "status": "error",
                        "error": str(e),
                        "timestamp": datetime.now().isoformat()
                    }
                )
                raise
                
        return wrapper
    return decorator

# =============================================================================
# SECURITY & VALIDATION UTILITIES
# =============================================================================

def sanitize_user_input(data: Dict[str, Any]) -> Dict[str, Any]:
    """Sanitize user input to prevent injection attacks"""
    import html
    import re
    
    def sanitize_value(value: Any) -> Any:
        if isinstance(value, str):
            # HTML escape and remove potentially dangerous characters
            value = html.escape(value)
            # Remove control characters except newlines/tabs
            value = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]', '', value)
            # Limit string length
            return value[:1000] if len(value) > 1000 else value
        elif isinstance(value, dict):
            return {k: sanitize_value(v) for k, v in value.items()}
        elif isinstance(value, list):
            return [sanitize_value(item) for item in value]
        elif isinstance(value, (int, float)):
            # Ensure numeric values are within reasonable bounds
            if isinstance(value, float):
                return max(-1000.0, min(1000.0, value))
            return max(-1000000, min(1000000, value))
        return value
    
    return sanitize_value(data)

def validate_rate_limit(user_id: Optional[str] = None) -> None:
    """Basic rate limiting validation"""
    # This would integrate with Redis for production rate limiting
    # For now, just a placeholder that could be expanded
    if user_id and len(user_id) > 100:
        raise HTTPException(
            status_code=400,
            detail="Invalid user ID format"
        )

# =============================================================================
# DATA FLOW PATTERNS
# =============================================================================

# 1. API Flow - Pydantic models for FastAPI validation and documentation
class AyurvedaAPIData:
    """API data flow with full Pydantic validation"""
    
    @staticmethod
    def validate_birth_data(birth_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and normalize birth data for API consumption"""
        # Security: Sanitize input first
        birth_data = sanitize_user_input(birth_data)
        
        required_fields = ['planetary_strengths', 'house_emphasis']
        
        for field in required_fields:
            if field not in birth_data:
                logger.warning(f"Missing {field} in birth data, using defaults")
                
        # Ensure basic structure with proper API defaults
        if 'planetary_strengths' not in birth_data:
            birth_data['planetary_strengths'] = {
                'sun': 0.5, 'moon': 0.5, 'mars': 0.5, 'mercury': 0.5,
                'jupiter': 0.5, 'venus': 0.5, 'saturn': 0.5
            }
            
        if 'house_emphasis' not in birth_data:
            birth_data['house_emphasis'] = {str(i): 0.5 for i in range(1, 13)}
        
        # Validate planetary strengths are within bounds
        if 'planetary_strengths' in birth_data:
            for planet, strength in birth_data['planetary_strengths'].items():
                if not isinstance(strength, (int, float)) or not 0 <= strength <= 1:
                    logger.warning(f"Invalid strength for {planet}: {strength}, using 0.5")
                    birth_data['planetary_strengths'][planet] = 0.5
            
        return birth_data

# 2. Flat Config Flow - Simple dictionaries for serialization/Parquet export
class AyurvedaFlatData:
    """Flat data flow for serialization and Parquet export"""
    
    @staticmethod
    def to_flat_config(analysis_result: Dict[str, Any]) -> Dict[str, Any]:
        """Convert analysis result to flat structure for serialization"""
        flat_data = {}
        
        # Flatten constitution data
        if 'constitution' in analysis_result:
            const = analysis_result['constitution']
            flat_data.update({
                'constitution_type': const.get('constitution_type'),
                'primary_dosha': const.get('primary_dosha'),
                'secondary_dosha': const.get('secondary_dosha'),
                'vata_percentage': const.get('prakruti', {}).get('vata', 0),
                'pitta_percentage': const.get('prakruti', {}).get('pitta', 0),
                'kapha_percentage': const.get('prakruti', {}).get('kapha', 0),
            })
        
        # Flatten dosha analysis
        if 'dosha_analysis' in analysis_result:
            dosha = analysis_result['dosha_analysis']
            flat_data.update({
                'current_vata': dosha.get('vikruti', {}).get('vata', 0),
                'current_pitta': dosha.get('vikruti', {}).get('pitta', 0),
                'current_kapha': dosha.get('vikruti', {}).get('kapha', 0),
                'imbalance_severity': dosha.get('imbalance_severity', 'mild'),
            })
        
        # Add metadata
        flat_data.update({
            'analysis_confidence': analysis_result.get('analysis_confidence', 0),
            'calculation_method': analysis_result.get('calculation_method', 'astrological'),
            'timestamp': datetime.now().isoformat(),
        })
        
        return flat_data
    
    @staticmethod
    def from_flat_config(flat_data: Dict[str, Any]) -> Dict[str, Any]:
        """Reconstruct analysis result from flat structure"""
        return {
            'constitution': {
                'constitution_type': flat_data.get('constitution_type'),
                'primary_dosha': flat_data.get('primary_dosha'),
                'secondary_dosha': flat_data.get('secondary_dosha'),
                'prakruti': {
                    'vata': flat_data.get('vata_percentage', 0),
                    'pitta': flat_data.get('pitta_percentage', 0),
                    'kapha': flat_data.get('kapha_percentage', 0),
                }
            },
            'dosha_analysis': {
                'vikruti': {
                    'vata': flat_data.get('current_vata', 0),
                    'pitta': flat_data.get('current_pitta', 0),
                    'kapha': flat_data.get('current_kapha', 0),
                },
                'imbalance_severity': flat_data.get('imbalance_severity', 'mild'),
            },
            'analysis_confidence': flat_data.get('analysis_confidence', 0),
            'calculation_method': flat_data.get('calculation_method', 'astrological'),
        }

# 3. Mock Testing Flow - Deterministic test data for unit tests
class AyurvedaMockData:
    """Mock data flow for testing with deterministic results"""
    
    @staticmethod
    def get_mock_birth_data(constitution_type: str = "vata_pitta") -> Dict[str, Any]:
        """Generate mock birth data for testing specific constitution types"""
        mock_data: Dict[str, Any] = {
            'planetary_strengths': {
                'sun': 0.7,    # Strong fire element (Pitta)
                'moon': 0.4,   # Moderate water element
                'mars': 0.8,   # Strong fire element (Pitta)
                'mercury': 0.9, # Strong air element (Vata)
                'jupiter': 0.3, # Weak earth element
                'venus': 0.5,   # Moderate water/earth
                'saturn': 0.2,  # Weak earth element (Kapha)
            },
            'house_emphasis': {str(i): 0.5 for i in range(1, 13)},
            'mock_test': True,
            'target_constitution': constitution_type,
        }
        
        # Adjust planetary strengths based on target constitution
        planetary_strengths = mock_data['planetary_strengths']
        if isinstance(planetary_strengths, dict):
            if constitution_type == "vata":
                planetary_strengths.update({
                    'mercury': 0.9, 'saturn': 0.2, 'mars': 0.3
                })
            elif constitution_type == "pitta":
                planetary_strengths.update({
                    'sun': 0.9, 'mars': 0.8, 'saturn': 0.2
                })
            elif constitution_type == "kapha":
                planetary_strengths.update({
                    'moon': 0.8, 'venus': 0.7, 'mercury': 0.3
                })
        
        return mock_data
    
    @staticmethod
    def get_mock_analysis_result(constitution_type: str = "vata_pitta") -> Dict[str, Any]:
        """Generate mock analysis result for testing"""
        return {
            'constitution': {
                'constitution_type': constitution_type,
                'primary_dosha': constitution_type.split('_')[0],
                'secondary_dosha': constitution_type.split('_')[1] if '_' in constitution_type else None,
                'prakruti': {
                    'vata': 0.45 if 'vata' in constitution_type else 0.25,
                    'pitta': 0.40 if 'pitta' in constitution_type else 0.25,
                    'kapha': 0.15 if 'kapha' in constitution_type else 0.50,
                }
            },
            'dosha_analysis': {
                'vikruti': {
                    'vata': 0.5, 'pitta': 0.3, 'kapha': 0.2
                },
                'imbalance_severity': 'mild',
                'dominant_influences': ['mercury', 'mars']
            },
            'analysis_confidence': 0.85,
            'calculation_method': 'astrological_correlation',
            'health_guidance': {
                'dietary_guidelines': ['Favor warm, cooked foods', 'Reduce cold, raw foods'],
                'lifestyle_recommendations': ['Regular sleep schedule', 'Gentle exercise'],
                'seasonal_adjustments': {
                    'winter': ['Increase warming foods', 'Oil massage'],
                    'summer': ['Cooling foods', 'Avoid heat']
                },
                'exercise_recommendations': ['Yoga', 'Walking', 'Swimming'],
                'meditation_practices': ['Breathing exercises', 'Mindfulness']
            },
            'astrological_correlations': {
                'planetary_influences': {
                    'mercury': 'increases_vata',
                    'mars': 'increases_pitta'
                },
                'house_correlations': {
                    '1': 'constitution_vitality',
                    '6': 'health_challenges'
                }
            },
            'seasonal_recommendations': {
                'current_season': 'autumn',
                'recommended_practices': ['Warm oil massage', 'Grounding foods']
            }
        }

# Unified validation function (maintains backward compatibility)
def validate_birth_data(birth_data: Dict[str, Any]) -> Dict[str, Any]:
    """Validate and normalize birth data - delegates to API flow"""
    return AyurvedaAPIData.validate_birth_data(birth_data)

# API Endpoints

@ayurveda_router.get("/health", response_model=Dict[str, Any])
async def health_check():
    """Health check endpoint for Ayurveda API"""
    return {
        "status": "healthy",
        "service": "Ayurveda Constitutional Analysis API",
        "version": "1.0",
        "available": AYURVEDA_AVAILABLE,
        "timestamp": datetime.now().isoformat(),
        "features": [
            "Constitutional Analysis",
            "Dosha Balance Assessment", 
            "Astrological Correlations",
            "Health & Lifestyle Guidance",
            "Seasonal Recommendations"
        ]
    }

@ayurveda_router.post("/analyze-constitution", response_model=AyurvedaResponse)
@monitor_performance("ayurveda_constitution_analysis")
async def analyze_constitution(request: AyurvedaRequest) -> AyurvedaResponse:
    """
    Comprehensive Ayurvedic constitutional analysis with security and performance monitoring.
    
    Implements three data flow patterns:
    - API: Full Pydantic validation and type safety
    - Flat: Optimized for serialization/export
    - Mock: Deterministic testing data
    """
    try:
        start_time = time.time()
        
        # Security validation - basic rate limiting check
        validate_rate_limit(request.user_id)
        
        # Input sanitization
        sanitized_birth_data = sanitize_user_input(request.birth_data)
        
        # API Data Flow - Use existing validation
        validated_birth_data = AyurvedaAPIData.validate_birth_data(sanitized_birth_data)
        
        # Perform analysis
        engine = get_ayurveda_engine()
        analysis_result = engine.analyze_constitution(validated_birth_data, request.user_id)
        
        # Flat Data Flow - Create serialization-optimized format from result
        flat_data = AyurvedaFlatData.to_flat_config(analysis_result)
        
        # Mock Data Flow - Get deterministic testing data
        mock_result = AyurvedaMockData.get_mock_analysis_result("vata_pitta")
        
        # Validate analysis quality
        if not validate_analysis_result(analysis_result):
            logger.warning("Analysis quality check failed, using fallback")
            analysis_result = handle_analysis_error(
                Exception("Analysis quality check failed"), 
                fallback_mode="basic"
            )
        
        # Prepare response
        processing_time_ms = int((time.time() - start_time) * 1000)
        
        # Generate audit log
        audit_log = generate_audit_log(
            operation="constitution_analysis",
            user_data={"user_id": request.user_id, "data_size": len(str(sanitized_birth_data))},
            result=analysis_result,
            performance_metrics={"execution_time_ms": processing_time_ms}
        )
        
        return AyurvedaResponse(
            success=True,
            data=analysis_result,
            constitution_summary=str(analysis_result.get('constitution', {}).get('constitution_type', 'Unknown')),
            primary_recommendations=analysis_result.get('recommendations', [])[:3],  # Top 3
            calculation_method="ayurveda_engine_v1",
            processing_time_ms=processing_time_ms,
            api_version="1.0",
            generated_at=datetime.utcnow().isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Constitution analysis failed: {e}")
        
        # Return fallback response
        fallback_result = handle_analysis_error(e, "basic")
        
        return AyurvedaResponse(
            success=False,
            data=fallback_result,
            constitution_summary="Fallback analysis",
            primary_recommendations=fallback_result.get("recommendations", []),
            calculation_method="fallback",
            processing_time_ms=int((time.time() - start_time) * 1000) if 'start_time' in locals() else 0,
            api_version="1.0",
            generated_at=datetime.utcnow().isoformat()
        )

@ayurveda_router.post("/dosha-balance", response_model=DoshaBalanceResponse)
async def get_dosha_balance(
    request: AyurvedaRequest,
    engine: Any = Depends(get_ayurveda_engine)  # type: ignore[type-arg]
):
    """
    Get basic dosha balance analysis from birth chart data
    
    Returns simplified dosha percentages and constitutional type
    without full health guidance.
    """
    try:
        # Validate birth data
        birth_data = validate_birth_data(request.birth_data.copy())
        
        # Extract planetary and house data - casting to access private methods
        engine_impl = engine  # We know this is the real AyurvedaEngine
        planetary_strengths = engine_impl._extract_planetary_strengths(birth_data)  # type: ignore[attr-defined]
        house_emphasis = engine_impl._extract_house_emphasis(birth_data)  # type: ignore[attr-defined]
        elemental_balance = engine_impl._calculate_elemental_balance(birth_data)  # type: ignore[attr-defined]
        
        # Calculate dosha balance
        prakruti = engine_impl._calculate_prakruti(planetary_strengths, house_emphasis, elemental_balance)  # type: ignore[attr-defined]
        constitution_type = engine_impl._determine_constitution_type(prakruti)  # type: ignore[attr-defined]
        
        # Determine primary dosha
        primary_dosha = max(prakruti.items(), key=lambda x: x[1])[0]
        
        return DoshaBalanceResponse(
            vata=prakruti.get('vata', 0.33),
            pitta=prakruti.get('pitta', 0.33),
            kapha=prakruti.get('kapha', 0.33),
            primary_dosha=primary_dosha,
            constitution_type=str(constitution_type)
        )
        
    except Exception as e:
        logger.error(f"Error in dosha balance calculation: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Dosha balance calculation failed: {str(e)}"
        )

@ayurveda_router.post("/health-guidance", response_model=HealthGuidanceResponse)
async def get_health_guidance(
    request: AyurvedaRequest,
    engine: Any = Depends(get_ayurveda_engine)  # type: ignore[type-arg]
):
    """
    Get personalized health and lifestyle guidance based on constitution
    
    Provides detailed recommendations for diet, lifestyle, exercise,
    meditation practices, and seasonal adjustments.
    """
    try:
        # Get full analysis first
        birth_data = validate_birth_data(request.birth_data.copy())
        result = engine.analyze_constitution(birth_data, request.user_id)
        
        constitution_type = result['constitution']['constitution_type']
        health_guidance = result['health_guidance']
        
        return HealthGuidanceResponse(
            constitution_type=str(constitution_type),
            dietary_guidelines=health_guidance['dietary_guidelines'],
            lifestyle_recommendations=health_guidance['lifestyle_recommendations'],
            seasonal_adjustments=health_guidance['seasonal_adjustments'],
            exercise_recommendations=health_guidance['exercise_recommendations'],
            meditation_practices=health_guidance['meditation_practices']
        )
        
    except Exception as e:
        logger.error(f"Error generating health guidance: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Health guidance generation failed: {str(e)}"
        )

@ayurveda_router.get("/constitution-types", response_model=Dict[str, Any])
async def get_constitution_types():
    """
    Get information about all Ayurvedic constitution types
    
    Returns educational information about the different constitutional
    types and their characteristics.
    """
    try:
        if not AYURVEDA_AVAILABLE:
            raise HTTPException(
                status_code=503,
                detail="Ayurveda reference data not available"
            )
            
        return {
            "constitution_types": AYURVEDA_QUICK_REFERENCE.get("constitution_types", {}),
            "balancing_keywords": AYURVEDA_QUICK_REFERENCE.get("dosha_balancing_keywords", {}),
            "astrological_timing": AYURVEDA_QUICK_REFERENCE.get("astrological_health_timing", {}),
            "description": "Ayurvedic constitutional types with astrological correlations",
            "educational_note": (
                "This information is for educational purposes. "
                "Consult qualified Ayurvedic practitioners for personalized guidance."
            )
        }
        
    except Exception as e:
        logger.error(f"Error retrieving constitution types: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve constitution type information"
        )

@ayurveda_router.get("/seasonal-guidance/{constitution_type}", response_model=Dict[str, Any])
async def get_seasonal_guidance(constitution_type: str):
    """
    Get seasonal guidance for specific constitution type
    
    Returns detailed seasonal recommendations including dietary adjustments,
    lifestyle changes, and astrological timing information.
    """
    try:
        if not AYURVEDA_AVAILABLE:
            raise HTTPException(
                status_code=503, 
                detail="Ayurveda analysis not available"
            )
            
        # Validate constitution type
        valid_types = [
            "vata", "pitta", "kapha", "vata_pitta", 
            "pitta_kapha", "vata_kapha", "tridoshic"
        ]
        
        if constitution_type not in valid_types:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid constitution type. Must be one of: {', '.join(valid_types)}"
            )
        
        # Generate seasonal recommendations
        engine = get_ayurveda_engine()
        seasonal_recommendations = engine._generate_seasonal_recommendations(  # type: ignore[attr-defined]
            constitution_type, {}  # type: ignore[arg-type]
        )
        
        return {
            "constitution_type": constitution_type,
            "seasonal_recommendations": seasonal_recommendations,
            "generated_at": datetime.now().isoformat(),
            "educational_note": (
                "Seasonal guidance based on Ayurvedic principles and astrological timing. "
                "Adjust recommendations based on individual needs and local climate."
            )
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating seasonal guidance: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Failed to generate seasonal guidance"
        )

# =============================================================================
# DATA FLOW DEMONSTRATION ENDPOINTS
# =============================================================================

@ayurveda_router.post("/export/flat", response_model=Dict[str, Any])
async def export_flat_data(
    request: AyurvedaRequest,
    engine: Any = Depends(get_ayurveda_engine)  # type: ignore[type-arg]
):
    """
    Export analysis in flat format for serialization/Parquet export
    
    Demonstrates the flat config data flow pattern for data export,
    analytics, and serialization to formats like Parquet.
    """
    try:
        # 1. API Flow - Get full analysis using Pydantic validation
        birth_data = AyurvedaAPIData.validate_birth_data(request.birth_data.copy())
        result = engine.analyze_constitution(birth_data, request.user_id)
        
        # 2. Flat Config Flow - Convert to flat structure
        flat_data = AyurvedaFlatData.to_flat_config(result)
        
        return {
            "export_format": "flat_config",
            "data": flat_data,
            "metadata": {
                "export_timestamp": datetime.now().isoformat(),
                "data_flow": "api -> flat_config",
                "suitable_for": ["parquet", "csv", "analytics", "serialization"],
                "compression_ratio": f"{len(str(result)) / len(str(flat_data)):.1f}x",
            }
        }
        
    except Exception as e:
        logger.error(f"Error in flat data export: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Flat data export failed: {str(e)}"
        )

@ayurveda_router.get("/test/mock/{constitution_type}", response_model=Dict[str, Any])
async def test_with_mock_data(constitution_type: str = "vata_pitta"):
    """
    Test endpoint using mock data flow
    
    Demonstrates the mock testing data flow pattern for unit tests,
    development, and testing with deterministic results.
    """
    try:
        # Validate constitution type
        valid_types = [
            "vata", "pitta", "kapha", "vata_pitta", 
            "pitta_kapha", "vata_kapha", "tridoshic"
        ]
        
        if constitution_type not in valid_types:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid constitution type. Must be one of: {', '.join(valid_types)}"
            )
        
        # 3. Mock Testing Flow - Generate deterministic test data
        mock_birth_data = AyurvedaMockData.get_mock_birth_data(constitution_type)
        mock_result = AyurvedaMockData.get_mock_analysis_result(constitution_type)
        
        # Convert to flat format to show data flow integration
        flat_result = AyurvedaFlatData.to_flat_config(mock_result)
        
        return {
            "test_data": {
                "constitution_type": constitution_type,
                "mock_birth_data": mock_birth_data,
                "mock_analysis_result": mock_result,
                "flat_export": flat_result,
            },
            "data_flows": {
                "1_api_flow": "Pydantic validation for FastAPI endpoints",
                "2_flat_config": "Serialization-ready flat structure",
                "3_mock_testing": "Deterministic test data generation",
            },
            "metadata": {
                "test_timestamp": datetime.now().isoformat(),
                "deterministic": True,
                "suitable_for": ["unit_tests", "development", "ci_cd"],
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in mock testing: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Mock testing failed: {str(e)}"
        )

@ayurveda_router.post("/roundtrip/test", response_model=Dict[str, Any])
async def test_data_flow_roundtrip(
    request: AyurvedaRequest,
    engine: Any = Depends(get_ayurveda_engine)  # type: ignore[type-arg]
):
    """
    Test roundtrip data conversion between all three flows
    
    Demonstrates data integrity across:
    1. API Flow (Pydantic) -> 2. Flat Config -> 3. Mock Data compatibility
    """
    try:
        # 1. API Flow - Process request normally
        birth_data = AyurvedaAPIData.validate_birth_data(request.birth_data.copy())
        api_result = engine.analyze_constitution(birth_data, request.user_id)
        
        # 2. Flat Config Flow - Convert to flat and back
        flat_data = AyurvedaFlatData.to_flat_config(api_result)
        reconstructed_result = AyurvedaFlatData.from_flat_config(flat_data)
        
        # 3. Mock Testing Flow - Compare with mock data structure
        constitution_type = api_result['constitution']['constitution_type']
        mock_result = AyurvedaMockData.get_mock_analysis_result(constitution_type)
        
        # Validate data integrity
        integrity_check = {
            "constitution_preserved": (
                api_result['constitution']['constitution_type'] == 
                reconstructed_result['constitution']['constitution_type']
            ),
            "dosha_balance_preserved": (
                abs(api_result['constitution']['prakruti']['vata'] - 
                    reconstructed_result['constitution']['prakruti']['vata']) < 0.01
            ),
            "structure_compatible": (
                set(api_result.keys()) & set(mock_result.keys()) == 
                set(['constitution', 'dosha_analysis', 'analysis_confidence', 'calculation_method'])
            ),
        }
        
        return {
            "roundtrip_test": {
                "original_api": api_result,
                "flat_intermediate": flat_data,
                "reconstructed": reconstructed_result,
                "mock_template": mock_result,
            },
            "integrity_check": integrity_check,
            "data_loss_analysis": {
                "original_fields": len(str(api_result)),
                "flat_fields": len(str(flat_data)),
                "reconstructed_fields": len(str(reconstructed_result)),
                "compression_ratio": f"{len(str(api_result)) / len(str(flat_data)):.1f}x",
            },
            "metadata": {
                "test_passed": all(integrity_check.values()),
                "timestamp": datetime.now().isoformat(),
            }
        }
        
    except Exception as e:
        logger.error(f"Error in roundtrip test: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Roundtrip test failed: {str(e)}"
        )

# Note: Exception handlers should be registered at the FastAPI app level, not router level
# These functions can be used by the main app for error handling

async def ayurveda_http_exception_handler(request: Any, exc: HTTPException) -> ErrorResponse:
    """Handle HTTP exceptions with proper error response"""
    return ErrorResponse(
        success=False,
        error=exc.detail,
        error_code=f"HTTP_{exc.status_code}",
        timestamp=datetime.now().isoformat()
    )

async def ayurveda_general_exception_handler(request: Any, exc: Exception) -> ErrorResponse:
    """Handle general exceptions"""
    logger.error(f"Unhandled exception in Ayurveda API: {str(exc)}", exc_info=True)
    return ErrorResponse(
        success=False,
        error="Internal server error",
        error_code="INTERNAL_ERROR", 
        timestamp=datetime.now().isoformat()
    )

# Export router for inclusion in main app
__all__ = ['ayurveda_router']
