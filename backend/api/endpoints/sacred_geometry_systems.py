# backend/api/endpoints/sacred_geometry_systems.py
"""
Sacred Geometry API Endpoints
SPIRITUAL-003.5 Implementation

FastAPI router for Sacred Geometry & Cosmometry analysis endpoints
"""

from fastapi import APIRouter, HTTPException, Query, Depends
from typing import Dict, List, Optional, Any
import logging
from datetime import datetime

# Import calculation engine
try:
    from backend.astro.calculations.sacred_geometry import (
        sacred_geometry_engine,
        calculate_sacred_geometry_analysis,
        SacredGeometryAnalysis
    )
except ImportError:
    try:
        from astro.calculations.sacred_geometry import (
            sacred_geometry_engine,
            calculate_sacred_geometry_analysis,
            SacredGeometryAnalysis
        )
    except ImportError:
        # Fallback for development
        def calculate_sacred_geometry_analysis(*args, **kwargs):
            raise HTTPException(status_code=500, detail="Sacred geometry engine not available")

# Import type definitions
try:
    from backend.types.sacred_geometry import (
        SacredGeometryRequest,
        SacredGeometryAnalysisResponse,
        GoldenRatioRequest,
        GoldenRatioResponse,
        FibonacciTimingRequest,
        FibonacciTimingResponse,
        MandalaGenerationRequest,
        MandalaResponse,
        PlatonicSolidsResponse,
        SacredGeometryError
    )
except ImportError:
    try:
        from types.sacred_geometry import (
            SacredGeometryRequest,
            SacredGeometryAnalysisResponse,
            GoldenRatioRequest,
            GoldenRatioResponse,
            FibonacciTimingRequest,
            FibonacciTimingResponse,
            MandalaGenerationRequest,
            MandalaResponse,
            PlatonicSolidsResponse,
            SacredGeometryError
        )
    except ImportError:
        # Fallback types for development
        from pydantic import BaseModel
        class SacredGeometryRequest(BaseModel): pass
        class SacredGeometryAnalysisResponse(BaseModel): pass
        class GoldenRatioRequest(BaseModel): pass
        class GoldenRatioResponse(BaseModel): pass
        class FibonacciTimingRequest(BaseModel): pass
        class FibonacciTimingResponse(BaseModel): pass
        class MandalaGenerationRequest(BaseModel): pass
        class MandalaResponse(BaseModel): pass
        class PlatonicSolidsResponse(BaseModel): pass
        class SacredGeometryError(BaseModel): pass

# Optional TCM integration
try:
    from backend.astro.calculations.tcm_calculations import tcm_engine
    TCM_AVAILABLE = True
except ImportError:
    try:
        from astro.calculations.tcm_calculations import tcm_engine
        TCM_AVAILABLE = True
    except ImportError:
        TCM_AVAILABLE = False

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api/sacred-geometry", tags=["Sacred Geometry"])

# ===== MAIN ANALYSIS ENDPOINTS =====

@router.post("/calculate", response_model=SacredGeometryAnalysisResponse)
async def calculate_sacred_geometry(request: SacredGeometryRequest):
    """
    Calculate complete sacred geometry analysis
    
    Performs comprehensive sacred geometry and cosmometry analysis including:
    - Golden Ratio patterns from astrological chart
    - Fibonacci timing sequences for spiritual practices
    - Platonic solid correspondences with TCM elements
    - Personalized sacred mandala generation
    - Wellness applications and meditation guidance
    """
    try:
        logger.info(f"Calculating sacred geometry for {request.year}-{request.month}-{request.day}")
        
        # Get TCM data if integration is requested and available
        tcm_data = None
        if request.include_tcm_integration and TCM_AVAILABLE:
            try:
                tcm_result = tcm_engine.calculate_tcm_constitution(
                    request.year, request.month, request.day,
                    request.hour, request.minute,
                    request.lat, request.lon, request.timezone
                )
                tcm_data = {
                    "elemental_balance": tcm_result.elemental_balance,
                    "primary_constitution": tcm_result.primary_constitution.__dict__,
                    "organ_systems": tcm_result.organ_systems.__dict__
                }
            except Exception as e:
                logger.warning(f"TCM integration failed: {e}")
        
        # Calculate sacred geometry analysis
        result = calculate_sacred_geometry_analysis(
            year=request.year,
            month=request.month,
            day=request.day,
            hour=request.hour,
            minute=request.minute,
            lat=request.lat,
            lon=request.lon,
            timezone=request.timezone,
            tcm_data=tcm_data,
            user_id=request.user_id
        )
        
        # Convert to response format
        response_data = _convert_to_response_format(result)
        
        return SacredGeometryAnalysisResponse(**response_data)
        
    except Exception as e:
        logger.error(f"Sacred geometry calculation failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Sacred geometry calculation failed: {str(e)}"
        )

@router.post("/golden-ratio", response_model=GoldenRatioResponse)
async def calculate_golden_ratio(request: GoldenRatioRequest):
    """
    Calculate Golden Ratio patterns from astrological chart
    
    Analyzes planetary aspects and positions to identify Golden Ratio (φ) patterns,
    harmonic relationships, and optimal meditation timing based on sacred proportions.
    """
    try:
        logger.info(f"Calculating Golden Ratio patterns for {request.year}-{request.month}-{request.day}")
        
        # Calculate full analysis but extract only golden ratio data
        result = calculate_sacred_geometry_analysis(
            year=request.year,
            month=request.month,
            day=request.day,
            hour=request.hour,
            minute=request.minute,
            lat=request.lat,
            lon=request.lon
        )
        
        return GoldenRatioResponse(
            golden_ratio_analysis={
                "primary_phi_ratio": result.golden_ratio_analysis.primary_phi_ratio,
                "phi_aspects": result.golden_ratio_analysis.phi_aspects,
                "harmonic_ratios": result.golden_ratio_analysis.harmonic_ratios,
                "resonance_strength": result.golden_ratio_analysis.resonance_strength,
                "optimal_meditation_times": result.golden_ratio_analysis.optimal_meditation_times
            },
            birth_data=result.birth_data,
            generated_at=datetime.now().isoformat(),
            analysis_confidence=result.analysis_confidence
        )
        
    except Exception as e:
        logger.error(f"Golden ratio calculation failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Golden ratio calculation failed: {str(e)}"
        )

@router.post("/fibonacci-timing", response_model=FibonacciTimingResponse)
async def calculate_fibonacci_timing(request: FibonacciTimingRequest):
    """
    Calculate Fibonacci-based timing for spiritual practices
    
    Generates optimal timing sequences based on Fibonacci numbers,
    aligned with lunar phases and natural spiritual development cycles.
    """
    try:
        logger.info(f"Calculating Fibonacci timing from {request.start_date}")
        
        # Parse start date
        start_date = datetime.fromisoformat(request.start_date)
        
        # Calculate sacred geometry analysis with timing focus
        result = calculate_sacred_geometry_analysis(
            year=start_date.year,
            month=start_date.month,
            day=start_date.day
        )
        
        return FibonacciTimingResponse(
            timing_sequence=[
                {
                    "sequence_position": timing.sequence_position,
                    "days_from_start": timing.days_from_start,
                    "optimal_date": timing.optimal_date.isoformat(),
                    "activity_type": timing.activity_type,
                    "lunar_phase_alignment": timing.lunar_phase_alignment
                }
                for timing in result.fibonacci_timing
            ],
            start_date=request.start_date,
            duration_months=request.duration_months,
            total_optimal_dates=len(result.fibonacci_timing),
            lunar_integration=request.include_lunar_phases,
            generated_at=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Fibonacci timing calculation failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Fibonacci timing calculation failed: {str(e)}"
        )

@router.post("/mandala", response_model=MandalaResponse)
async def generate_mandala(request: MandalaGenerationRequest):
    """
    Generate personalized sacred mandala
    
    Creates a custom sacred mandala based on birth chart patterns,
    Golden Ratio proportions, and TCM elemental correspondences.
    """
    try:
        logger.info(f"Generating mandala for {request.year}-{request.month}-{request.day}")
        
        # Calculate sacred geometry analysis
        result = calculate_sacred_geometry_analysis(
            year=request.year,
            month=request.month,
            day=request.day
        )
        
        # Generate SVG mandala (simplified for now)
        mandala_svg = _generate_mandala_svg(result.mandala_data, request.mandala_size)
        
        # Create color meanings
        color_meanings = _create_color_meanings(result.mandala_data.color_harmonics)
        
        # Generate meditation guide
        meditation_guide = _create_meditation_guide(result.mandala_data)
        
        return MandalaResponse(
            mandala_data={
                "center_point": result.mandala_data.center_point,
                "primary_radius": result.mandala_data.primary_radius,
                "golden_ratio_rings": result.mandala_data.golden_ratio_rings,
                "symmetry_order": result.mandala_data.symmetry_order,
                "color_harmonics": result.mandala_data.color_harmonics,
                "geometric_elements": result.mandala_data.geometric_elements,
                "meditation_focus": result.mandala_data.meditation_focus
            },
            mandala_svg=mandala_svg,
            color_meanings=color_meanings,
            meditation_guide=meditation_guide,
            generated_at=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Mandala generation failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Mandala generation failed: {str(e)}"
        )

@router.get("/platonic-solids", response_model=PlatonicSolidsResponse)
async def get_platonic_correspondences(
    birth_year: int = Query(..., ge=1900, le=2100),
    birth_month: int = Query(..., ge=1, le=12),
    birth_day: int = Query(..., ge=1, le=31),
    include_tcm: bool = Query(default=True)
):
    """
    Get Platonic solid correspondences with TCM elements
    
    Maps the five Platonic solids to TCM elements and chakra correspondences
    based on birth chart analysis and constitutional assessment.
    """
    try:
        logger.info(f"Getting Platonic solid correspondences for {birth_year}-{birth_month}-{birth_day}")
        
        # Calculate sacred geometry analysis
        result = calculate_sacred_geometry_analysis(
            year=birth_year,
            month=birth_month,
            day=birth_day
        )
        
        # Convert correspondences to response format
        correspondences = {}
        for element, solid in result.platonic_solid_correspondences.items():
            correspondences[element] = {
                "name": solid.value,
                "faces": sacred_geometry_engine.platonic_solids[solid].faces,
                "vertices": sacred_geometry_engine.platonic_solids[solid].vertices,
                "edges": sacred_geometry_engine.platonic_solids[solid].edges,
                "dihedral_angle": sacred_geometry_engine.platonic_solids[solid].dihedral_angle,
                "tcm_element": sacred_geometry_engine.platonic_solids[solid].tcm_element,
                "chakra_correspondence": sacred_geometry_engine.platonic_solids[solid].chakra_correspondence
            }
        
        # Determine primary solid
        primary_solid = "dodecahedron"  # Default to unity/spirit
        if correspondences:
            primary_solid = list(correspondences.values())[0]["name"]
        
        # Calculate elemental harmony
        elemental_harmony = len(correspondences) / 5  # Max 5 elements
        
        # Generate meditation recommendations
        meditation_recommendations = [
            f"Visualize {solid_data['name']} geometry during meditation"
            for solid_data in list(correspondences.values())[:3]
        ] + [
            f"Focus on {solid_data['tcm_element']} element balance"
            for solid_data in list(correspondences.values())[:3]
        ] + [
            f"Practice geometric breathing with {solid_data['faces']}-count cycles"
            for solid_data in list(correspondences.values())[:3]
        ]
        
        return PlatonicSolidsResponse(
            correspondences=correspondences,
            primary_solid=primary_solid,
            elemental_harmony=elemental_harmony,
            meditation_recommendations=meditation_recommendations,
            generated_at=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Platonic solid correspondence calculation failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Platonic solid calculation failed: {str(e)}"
        )

# ===== UTILITY ENDPOINTS =====

@router.get("/constants")
async def get_sacred_geometry_constants():
    """
    Get sacred geometry mathematical constants
    
    Returns fundamental constants used in sacred geometry calculations
    including Golden Ratio, Pi, Tau, and Fibonacci sequence.
    """
    return {
        "golden_ratio": 1.618033988749,
        "phi_inverse": 0.618033988749,
        "pi": 3.141592653589793,
        "tau": 6.283185307179586,
        "fibonacci_sequence": [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377],
        "sacred_angles": {
            "golden_angle": 137.508,
            "pentagon_angle": 36.0,
            "hexagon_angle": 60.0,
            "octagon_angle": 45.0
        },
        "platonic_solids": {
            "tetrahedron": {"faces": 4, "vertices": 4, "edges": 6},
            "cube": {"faces": 6, "vertices": 8, "edges": 12},
            "octahedron": {"faces": 8, "vertices": 6, "edges": 12},
            "dodecahedron": {"faces": 12, "vertices": 20, "edges": 30},
            "icosahedron": {"faces": 20, "vertices": 12, "edges": 30}
        }
    }

@router.get("/health-check")
async def sacred_geometry_health_check():
    """Sacred geometry system health check"""
    return {
        "status": "operational",
        "service": "sacred_geometry",
        "version": "1.0.0",
        "features": [
            "golden_ratio_analysis",
            "fibonacci_timing",
            "platonic_correspondences",
            "mandala_generation",
            "tcm_integration"
        ],
        "tcm_integration_available": TCM_AVAILABLE,
        "timestamp": datetime.now().isoformat()
    }

# ===== HELPER FUNCTIONS =====

def _convert_to_response_format(result: SacredGeometryAnalysis) -> Dict[str, Any]:
    """Convert SacredGeometryAnalysis to response format"""
    return {
        "user_id": result.user_id,
        "birth_data": result.birth_data,
        "golden_ratio_analysis": {
            "primary_phi_ratio": result.golden_ratio_analysis.primary_phi_ratio,
            "phi_aspects": result.golden_ratio_analysis.phi_aspects,
            "harmonic_ratios": result.golden_ratio_analysis.harmonic_ratios,
            "resonance_strength": result.golden_ratio_analysis.resonance_strength,
            "optimal_meditation_times": result.golden_ratio_analysis.optimal_meditation_times
        },
        "fibonacci_timing": [
            {
                "sequence_position": timing.sequence_position,
                "days_from_start": timing.days_from_start,
                "optimal_date": timing.optimal_date.isoformat(),
                "activity_type": timing.activity_type,
                "lunar_phase_alignment": timing.lunar_phase_alignment
            }
            for timing in result.fibonacci_timing
        ],
        "platonic_solid_correspondences": {
            element: solid.value for element, solid in result.platonic_solid_correspondences.items()
        },
        "mandala_data": {
            "center_point": result.mandala_data.center_point,
            "primary_radius": result.mandala_data.primary_radius,
            "golden_ratio_rings": result.mandala_data.golden_ratio_rings,
            "symmetry_order": result.mandala_data.symmetry_order,
            "color_harmonics": result.mandala_data.color_harmonics,
            "geometric_elements": result.mandala_data.geometric_elements,
            "meditation_focus": result.mandala_data.meditation_focus
        },
        "tcm_geometric_integration": result.tcm_geometric_integration,
        "wellness_applications": result.wellness_applications,
        "analysis_confidence": result.analysis_confidence,
        "generated_at": result.generated_at
    }

def _generate_mandala_svg(mandala_data, size: int) -> str:
    """Generate SVG markup for mandala (simplified version)"""
    center_x = size // 2
    center_y = size // 2
    
    svg_elements = []
    
    # Create rings based on golden ratio
    for i, radius in enumerate(mandala_data.golden_ratio_rings):
        if radius * size > size // 2:
            break
        
        color = mandala_data.color_harmonics[i % len(mandala_data.color_harmonics)]
        scaled_radius = radius * size
        
        svg_elements.append(
            f'<circle cx="{center_x}" cy="{center_y}" r="{scaled_radius}" '
            f'fill="none" stroke="{color}" stroke-width="2" opacity="0.7"/>'
        )
    
    # Add symmetrical divisions
    for i in range(mandala_data.symmetry_order):
        angle = (i * 360 / mandala_data.symmetry_order)
        x2 = center_x + (size // 2) * 0.9 * (angle * 3.14159 / 180)
        y2 = center_y + (size // 2) * 0.9 * (angle * 3.14159 / 180)
        
        svg_elements.append(
            f'<line x1="{center_x}" y1="{center_y}" x2="{x2}" y2="{y2}" '
            f'stroke="#888" stroke-width="1" opacity="0.5"/>'
        )
    
    svg_content = "\n".join(svg_elements)
    
    return f'''<svg width="{size}" height="{size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <style>
            .mandala-center {{ fill: {mandala_data.color_harmonics[0]}; opacity: 0.8; }}
        </style>
    </defs>
    <circle cx="{center_x}" cy="{center_y}" r="5" class="mandala-center"/>
    {svg_content}
</svg>'''

def _create_color_meanings(colors: List[str]) -> Dict[str, str]:
    """Create color meaning mappings"""
    color_meanings = {
        "#FFD700": "Divine wisdom and spiritual illumination",
        "#FF6B6B": "Life force energy and passion",
        "#4ECDC4": "Emotional healing and flow",
        "#45B7D1": "Communication and truth",
        "#96CEB4": "Growth and natural harmony",
        "#228B22": "Wood element - growth and flexibility",
        "#FF4500": "Fire element - transformation and energy",
        "#D2691E": "Earth element - stability and grounding",
        "#C0C0C0": "Metal element - clarity and precision",
        "#000080": "Water element - depth and wisdom"
    }
    
    result = {}
    for color in colors:
        result[color] = color_meanings.get(color, "Sacred geometric harmony")
    
    return result

def _create_meditation_guide(mandala_data) -> str:
    """Create meditation guidance text"""
    return f"""Sacred Geometry Meditation Guide:

1. Center yourself in the mandala's center point, representing your divine essence.

2. Begin with the innermost ring (radius: {mandala_data.primary_radius:.3f}) and contemplate unity.

3. Expand awareness through each golden ratio ring, feeling the natural harmony of φ proportions.

4. Focus on the {mandala_data.symmetry_order}-fold symmetry, representing balance and wholeness.

5. Meditation Focus: {mandala_data.meditation_focus}

6. Use the geometric elements as focal points:
   {chr(10).join(f"   - {element}" for element in mandala_data.geometric_elements)}

7. Breathe in harmony with the golden ratio: inhale for 1 count, exhale for φ (1.618) counts.

Practice this meditation daily for optimal spiritual alignment with your sacred geometric patterns."""

# Export router
sacred_geometry_router = router
