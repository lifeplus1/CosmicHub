# backend/api/bridges/sacred_geometry_type_bridge.py
"""
Sacred Geometry Type Bridge - SPIRITUAL-003.5 Enhanced Implementation
API response classes for sacred geometry calculation data with type safety.
"""

import logging
from datetime import datetime
from typing import Dict, List, Optional, Any, Union, Protocol, Callable, TypedDict, Literal
from pydantic import BaseModel, Field

# Initialize logger
logger = logging.getLogger(__name__)

# Protocol definition for type checking
class SacredGeometryAnalysisProtocol(Protocol):
    user_id: str
    birth_data: Dict[str, Any]
    golden_ratio_analysis: Dict[str, Any]
    fibonacci_timing: List[Dict[str, Any]]
    platonic_solid_correspondences: Dict[str, Any]
    mandala_data: Dict[str, Any]
    tcm_geometric_integration: Dict[str, Any]
    wellness_applications: List[str]
    analysis_confidence: float
    generated_at: str

# Function type annotation
from typing import Callable

CalculationFunction = Callable[..., Any]

def _fallback_calculation(*args: Any, **kwargs: Any) -> Dict[str, Any]:
    """Fallback implementation when sacred geometry module is unavailable"""
    return {
        "user_id": str(kwargs.get("user_id", "fallback")),
        "birth_data": {},
        "golden_ratio_analysis": {},
        "fibonacci_timing": [],
        "platonic_solid_correspondences": {},
        "mandala_data": {},
        "tcm_geometric_integration": {},
        "wellness_applications": [],
        "analysis_confidence": 0.0,
        "generated_at": datetime.now().isoformat()
    }

# Conditional import for sacred geometry calculations
sacred_geometry_available: bool = False
calculate_sacred_geometry_analysis: CalculationFunction = _fallback_calculation

try:
    # Try relative import first
    from ...astro.calculations.sacred_geometry import calculate_sacred_geometry_analysis as _calc_func  # type: ignore
    calculate_sacred_geometry_analysis = _calc_func
    sacred_geometry_available = True
    logger.info("Sacred geometry module loaded successfully")
except ImportError:
    try:
        # Try absolute import with path manipulation
        import sys
        import os
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../..'))
        from backend.astro.calculations.sacred_geometry import calculate_sacred_geometry_analysis as _calc_func  # type: ignore
        calculate_sacred_geometry_analysis = _calc_func  # type: ignore[assignment]  # type: ignore[assignment]
        sacred_geometry_available = True
        logger.info("Sacred geometry module loaded via absolute import")
    except ImportError as e:
        logger.warning(f"Sacred geometry module not available - using fallback: {e}")
        sacred_geometry_available = False

# ===== TYPED INPUT CONTRACTS =====

class SacredGeometryInputData(TypedDict, total=True):
    """Type-safe contract for sacred geometry input data with required fields"""
    year: int
    month: int  
    day: int
    hour: int
    minute: int
    lat: float
    lon: float
    timezone: str
    include_tcm_integration: bool
    user_id: Optional[str]

class GoldenRatioInputData(TypedDict, total=False):
    """Type-safe contract for golden ratio calculation input"""
    year: int
    month: int
    day: int
    hour: Optional[int]
    minute: Optional[int]
    lat: Optional[float]
    lon: Optional[float]
    timezone: Optional[str]

class FibonacciTimingInputData(TypedDict, total=False):
    """Type-safe contract for fibonacci timing input"""
    start_date: str
    duration_months: Optional[int]
    include_lunar_phases: Optional[bool]

class MandalaGenerationInputData(TypedDict, total=False):
    """Type-safe contract for mandala generation input"""
    year: int
    month: int
    day: int
    mandala_size: Optional[int]

# ===== API MODEL DEFINITIONS =====
# These are the canonical definitions to prevent redefinition errors

class SacredGeometryRequest(BaseModel):
    """Canonical sacred geometry request model"""
    year: int = Field(..., description="Birth year")
    month: int = Field(..., ge=1, le=12, description="Birth month (1-12)")
    day: int = Field(..., ge=1, le=31, description="Birth day")
    hour: int = Field(default=12, ge=0, le=23, description="Birth hour (0-23)")
    minute: int = Field(default=0, ge=0, le=59, description="Birth minute (0-59)")
    lat: float = Field(default=0.0, ge=-90, le=90, description="Latitude")
    lon: float = Field(default=0.0, ge=-180, le=180, description="Longitude")
    timezone: str = Field(default="UTC", description="Timezone identifier")
    include_tcm_integration: bool = Field(default=False, description="Include TCM analysis")
    user_id: Optional[str] = Field(default=None, description="User identifier")

class SacredGeometryAnalysisResponse(BaseModel):
    """Canonical sacred geometry analysis response model"""
    analysis: Dict[str, Any] = Field(default_factory=dict, description="Sacred geometry analysis")
    birth_data: Dict[str, Any] = Field(default_factory=dict, description="Birth data used")
    generated_at: str = Field(default_factory=lambda: datetime.now().isoformat(), description="Generation timestamp")
    analysis_confidence: float = Field(default=0.0, ge=0.0, le=1.0, description="Analysis confidence level")

class GoldenRatioRequest(BaseModel):
    """Canonical golden ratio request model"""
    year: int = Field(..., description="Year for calculation")
    month: int = Field(..., ge=1, le=12, description="Month (1-12)")
    day: int = Field(..., ge=1, le=31, description="Day")
    hour: int = Field(default=12, ge=0, le=23, description="Hour (0-23)")
    minute: int = Field(default=0, ge=0, le=59, description="Minute (0-59)")
    lat: float = Field(default=0.0, ge=-90, le=90, description="Latitude")
    lon: float = Field(default=0.0, ge=-180, le=180, description="Longitude")
    timezone: str = Field(default="UTC", description="Timezone identifier")

class GoldenRatioResponse(BaseModel):
    """Canonical golden ratio response model"""
    ratio: float = Field(default=1.618033988749, description="Golden ratio value")
    golden_ratio_analysis: Dict[str, Any] = Field(default_factory=dict, description="Golden ratio analysis")
    birth_data: Dict[str, Any] = Field(default_factory=dict, description="Birth data used")
    generated_at: str = Field(default_factory=lambda: datetime.now().isoformat(), description="Generation timestamp")
    analysis_confidence: float = Field(default=0.0, ge=0.0, le=1.0, description="Analysis confidence")

class FibonacciTimingRequest(BaseModel):
    """Canonical fibonacci timing request model"""
    start_date: str = Field(..., description="Start date in ISO format")
    duration_months: int = Field(default=12, ge=1, le=120, description="Duration in months")
    include_lunar_phases: bool = Field(default=False, description="Include lunar phase calculations")

class FibonacciTimingResponse(BaseModel):
    """Canonical fibonacci timing response model"""
    timings: List[str] = Field(default_factory=list, description="Fibonacci timing sequence")
    timing_sequence: List[Dict[str, Any]] = Field(  # type: ignore[misc]
        default_factory=list, 
        description="Detailed timing data"
    )
    start_date: str = Field(default="", description="Start date")
    duration_months: int = Field(default=12, description="Duration in months")
    total_optimal_dates: int = Field(default=0, description="Total optimal dates found")
    lunar_integration: bool = Field(default=False, description="Lunar integration enabled")
    generated_at: str = Field(default_factory=lambda: datetime.now().isoformat(), description="Generation timestamp")

class MandalaGenerationRequest(BaseModel):
    """Canonical mandala generation request model"""
    year: int = Field(..., description="Year for mandala")
    month: int = Field(..., ge=1, le=12, description="Month (1-12)")
    day: int = Field(..., ge=1, le=31, description="Day")
    mandala_size: int = Field(default=512, ge=64, le=2048, description="Mandala size in pixels")

class MandalaResponse(BaseModel):
    """Canonical mandala response model"""
    mandala_data: Dict[str, Any] = Field(default_factory=dict, description="Mandala data")
    mandala_svg: str = Field(default="", description="SVG representation")
    color_meanings: Dict[str, str] = Field(default_factory=dict, description="Color meanings")
    meditation_guide: str = Field(default="", description="Meditation guidance")
    generated_at: str = Field(default_factory=lambda: datetime.now().isoformat(), description="Generation timestamp")

class PlatonicSolidsResponse(BaseModel):
    """Canonical platonic solids response model"""
    solids: Dict[str, Any] = Field(default_factory=dict, description="Platonic solids data")
    correspondences: Dict[str, Any] = Field(default_factory=dict, description="Element correspondences")
    primary_solid: str = Field(default="", description="Primary platonic solid")
    elemental_harmony: Dict[str, float] = Field(default_factory=dict, description="Elemental harmony scores")
    meditation_recommendations: List[str] = Field(default_factory=list, description="Meditation recommendations")
    generated_at: str = Field(default_factory=lambda: datetime.now().isoformat(), description="Generation timestamp")

class SacredGeometryError(BaseModel):
    """Canonical sacred geometry error model"""
    error: str = Field(default="Unknown error", description="Error message")
    error_code: str = Field(default="UNKNOWN", description="Error code")
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat(), description="Error timestamp")

# ===== TYPE BRIDGE CLASS =====

class SacredGeometryTypeBridge:
    """
    Type-safe bridge for sacred geometry data conversion.
    
    Follows type bridge pattern:
    - Accept dynamic data but validate immediately
    - Use specific types instead of Any
    - Provide safe extraction helpers
    - Clear error handling and logging
    """
    
    @staticmethod
    def validate_coordinate(value: Union[float, int, str, None], coord_type: Literal["lat", "lon"]) -> float:
        """
        Safely validate and convert coordinate values.
        
        Args:
            value: Input coordinate value
            coord_type: Type of coordinate for validation bounds
            
        Returns:
            Valid coordinate as float
        """
        try:
            if value is None:
                return 0.0
            
            # Convert to float
            if isinstance(value, str):
                coord_float = float(value)
            else:
                coord_float = float(value)
            
            # Validate bounds
            if coord_type == "lat":
                return max(-90.0, min(90.0, coord_float))
            else:  # lon
                return max(-180.0, min(180.0, coord_float))
                
        except (ValueError, TypeError):
            logger.warning(f"Invalid {coord_type} coordinate: {value}, using 0.0")
            return 0.0
    
    @staticmethod
    def validate_date_component(value: Union[int, str, None], component: str, min_val: int, max_val: int) -> int:
        """
        Safely validate date components with descriptive error handling.
        
        Args:
            value: Input date component
            component: Name of component for logging
            min_val: Minimum valid value
            max_val: Maximum valid value
            
        Returns:
            Valid date component as int
        """
        try:
            if value is None:
                default_values = {"year": 2000, "month": 1, "day": 1, "hour": 12, "minute": 0}
                default = default_values.get(component, min_val)
                logger.info(f"Using default {component}: {default}")
                return default
                
            if isinstance(value, str):
                int_val = int(value)
            else:
                int_val = int(value)
                
            # Validate range
            if min_val <= int_val <= max_val:
                return int_val
            else:
                logger.warning(f"Invalid {component}: {value}, must be {min_val}-{max_val}")
                return min_val
                
        except (ValueError, TypeError):
            logger.warning(f"Invalid {component} format: {value}")
            default_values = {"year": 2000, "month": 1, "day": 1, "hour": 12, "minute": 0}
            return default_values.get(component, min_val)
    
    @staticmethod
    def safe_extract_request_data(raw_data: Dict[str, Any]) -> SacredGeometryInputData:
        """
        Safely extract and validate sacred geometry request data.
        
        Args:
            raw_data: Raw input data dictionary
            
        Returns:
            Type-safe validated input data
        """
        # Extract and validate with required fields filled
        year = SacredGeometryTypeBridge.validate_date_component(
            raw_data.get("year"), "year", 1900, 2100
        )
        month = SacredGeometryTypeBridge.validate_date_component(
            raw_data.get("month"), "month", 1, 12
        )
        day = SacredGeometryTypeBridge.validate_date_component(
            raw_data.get("day"), "day", 1, 31
        )
        hour = SacredGeometryTypeBridge.validate_date_component(
            raw_data.get("hour"), "hour", 0, 23
        )
        minute = SacredGeometryTypeBridge.validate_date_component(
            raw_data.get("minute"), "minute", 0, 59
        )
        
        # Coordinates with validation
        lat = SacredGeometryTypeBridge.validate_coordinate(
            raw_data.get("lat") or raw_data.get("latitude"), "lat"
        )
        lon = SacredGeometryTypeBridge.validate_coordinate(
            raw_data.get("lon") or raw_data.get("longitude"), "lon"
        )
        
        # String and boolean fields with defaults
        timezone = str(raw_data.get("timezone", "UTC"))
        include_tcm_integration = bool(raw_data.get("include_tcm_integration", False))
        
        # Optional user ID
        user_id = raw_data.get("user_id")
        if user_id is not None:
            user_id = str(user_id)
        
        # Construct TypedDict with all required fields
        extracted_data: SacredGeometryInputData = {
            "year": year,
            "month": month,
            "day": day,
            "hour": hour,
            "minute": minute,
            "lat": lat,
            "lon": lon,
            "timezone": timezone,
            "include_tcm_integration": include_tcm_integration,
            "user_id": user_id
        }
        
        return extracted_data
    
    @staticmethod
    def create_validated_request(raw_data: Dict[str, Any]) -> SacredGeometryRequest:
        """
        Create a validated SacredGeometryRequest from raw data.
        
        Args:
            raw_data: Raw request data
            
        Returns:
            Validated SacredGeometryRequest instance
        """
        validated_data = SacredGeometryTypeBridge.safe_extract_request_data(raw_data)
        
        return SacredGeometryRequest(
            year=validated_data["year"],
            month=validated_data["month"],
            day=validated_data["day"],
            hour=validated_data["hour"],
            minute=validated_data["minute"],
            lat=validated_data["lat"],
            lon=validated_data["lon"],
            timezone=validated_data["timezone"],
            include_tcm_integration=validated_data["include_tcm_integration"],
            user_id=validated_data["user_id"]
        )
    
    @staticmethod
    def create_error_response(error_message: str, error_code: str = "CALCULATION_ERROR") -> SacredGeometryError:
        """
        Create a type-safe error response.
        
        Args:
            error_message: Human-readable error message
            error_code: Machine-readable error code
            
        Returns:
            Type-safe error response
        """
        return SacredGeometryError(
            error=error_message,
            error_code=error_code,
            timestamp=datetime.now().isoformat()
        )

# ===== SAFE CALCULATION FUNCTIONS =====

def safe_sacred_geometry_analysis(
    year: int, month: int, day: int, hour: int, minute: int,
    lat: float, lon: float, timezone: str = "UTC",
    tcm_data: Optional[Dict[str, Any]] = None,
    user_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Safely perform sacred geometry analysis with error handling.
    
    Args:
        year, month, day, hour, minute: Date/time components
        lat, lon: Geographical coordinates
        timezone: Timezone string
        tcm_data: Optional TCM integration data
        user_id: Optional user identifier
        
    Returns:
        Sacred geometry analysis results or error structure
    """
    try:
        # Use the imported calculation function (with fallback already handled at module level)
        result = calculate_sacred_geometry_analysis(
            year=year, month=month, day=day,
            hour=hour, minute=minute,
            lat=lat, lon=lon, timezone=timezone,
            tcm_data=tcm_data, user_id=user_id
        )
        
        # Convert result to dict format safely
        if isinstance(result, dict):
            return result  # type: ignore[return-value]
        elif hasattr(result, 'model_dump'):
            return result.model_dump()  # type: ignore[attr-defined]
        elif hasattr(result, '__dict__'):
            return dict(result.__dict__)
        else:
            # Assume it's already a dict
            return dict(result) if result else {}  # type: ignore[call-overload,return-value]
        
    except Exception as calc_error:
            logger.error(f"Sacred geometry calculation error: {calc_error}")
            return {
                "error": f"Calculation error: {str(calc_error)}",
                "golden_ratio_analysis": {},
                "fibonacci_timing": {},
                "platonic_solids": {},
                "mandala_data": {}
            }

def safe_extract_solid_name(solid_data: Dict[str, Any]) -> str:
    """
    Safely extract solid name from platonic solid data.
    
    Args:
        solid_data: Dictionary containing solid information
        
    Returns:
        Solid name or default value
    """
    try:
        # Access dict keys safely
        if "name" in solid_data:
            return str(solid_data["name"])
        elif "value" in solid_data:
            return str(solid_data["value"])
        else:
            return str(solid_data)
    except Exception as e:
        logger.warning(f"Could not extract solid name: {e}")
        return "unknown"

# ===== EXPORT ALL MODELS =====
__all__ = [
    "SacredGeometryRequest",
    "SacredGeometryAnalysisResponse", 
    "GoldenRatioRequest",
    "GoldenRatioResponse",
    "FibonacciTimingRequest", 
    "FibonacciTimingResponse",
    "MandalaGenerationRequest",
    "MandalaResponse",
    "PlatonicSolidsResponse",
    "SacredGeometryError",
    "SacredGeometryTypeBridge",
    "safe_sacred_geometry_analysis",
    "safe_extract_solid_name"
]
