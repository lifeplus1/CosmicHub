# apps/backend/src/routers/synastry.py
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Dict, List, Any
import swisseph as swe  # type: ignore
from datetime import datetime, timezone
import pytz

from utils.aspect_utils import build_aspect_matrix, get_key_aspects
from utils.house_overlay_utils import analyze_house_overlays, get_key_overlays
from utils.compatibility_utils import calculate_compatibility_score, generate_relationship_summary

# Check if vectorized operations are available
vectorized_available = False
try:
    import importlib.util
    spec = importlib.util.find_spec("numpy")
    if spec is not None:
        vectorized_available = True
except ImportError:
    pass

router = APIRouter()

class BirthData(BaseModel):
    date: str  # YYYY-MM-DD
    time: str  # HH:MM
    city: str
    country: str
    latitude: float
    longitude: float
    timezone: str
    datetime: str  # ISO format with timezone

class SynastryRequest(BaseModel):
    person1: BirthData
    person2: BirthData

class CompositeChart(BaseModel):
    midpoint_sun: float
    midpoint_moon: float
    relationship_purpose: str

class SynastryResponse(BaseModel):
    compatibility_analysis: Dict[str, Any]
    interaspects: List[Dict[str, Any]]
    house_overlays: List[Dict[str, Any]]
    composite_chart: CompositeChart
    summary: Dict[str, List[str]]

def parse_datetime(birth_data: BirthData) -> datetime:
    """Parse birth data into datetime object."""
    try:
        # Try to parse the provided datetime string first
        if birth_data.datetime:
            return datetime.fromisoformat(birth_data.datetime.replace('Z', '+00:00'))
        
        # Fallback to date/time/timezone parsing
        date_str = f"{birth_data.date} {birth_data.time}"
        dt = datetime.strptime(date_str, "%Y-%m-%d %H:%M")
        
        # Apply timezone
        if birth_data.timezone:
            tz = pytz.timezone(birth_data.timezone)
            dt = tz.localize(dt)
        
        return dt
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid datetime format: {str(e)}")

def calculate_planets(birth_data: BirthData) -> tuple[Dict[str, float], List[float]]:
    """Calculate planetary positions and house cusps for a birth chart."""
    dt = parse_datetime(birth_data)

    # Convert to UTC for SwissEph
    utc_dt = dt.astimezone(timezone.utc)

    # Calculate Julian day
    jd: float = swe.julday(utc_dt.year, utc_dt.month, utc_dt.day,  # type: ignore
                           utc_dt.hour + utc_dt.minute/60.0)

    # Calculate planetary positions
    planets: Dict[str, float] = {}
    planet_nums: Dict[str, int] = {
        'sun': swe.SUN, 'moon': swe.MOON, 'mercury': swe.MERCURY,  # type: ignore
        'venus': swe.VENUS, 'mars': swe.MARS, 'jupiter': swe.JUPITER,  # type: ignore
        'saturn': swe.SATURN, 'uranus': swe.URANUS,  # type: ignore
        'neptune': swe.NEPTUNE, 'pluto': swe.PLUTO  # type: ignore
    }

    for planet_name, planet_num in planet_nums.items():
        result = swe.calc_ut(jd, planet_num)  # type: ignore
        planets[planet_name] = result[0][0]  # Longitude in degrees

    # Calculate house cusps (Placidus system)
    cusps_result = swe.houses(jd, birth_data.latitude, birth_data.longitude, b'P')  # type: ignore
    cusps: List[float] = list(cusps_result[0])  # type: ignore

    return planets, cusps

def calculate_composite_midpoints(planets1: Dict[str, float], planets2: Dict[str, float]) -> CompositeChart:
    """Calculate composite chart midpoints."""
    def midpoint(lon1: float, lon2: float) -> float:
        """Calculate midpoint between two longitudes, handling 360° wrap."""
        diff = abs(lon1 - lon2)
        if diff > 180:
            # Take the shorter arc
            if lon1 > lon2:
                midpoint_val = (lon1 + lon2 + 360) / 2
            else:
                midpoint_val = (lon1 + 360 + lon2) / 2
        else:
            midpoint_val = (lon1 + lon2) / 2
        
        return midpoint_val % 360
    
    sun_midpoint = midpoint(planets1.get('sun', 0), planets2.get('sun', 0))
    moon_midpoint = midpoint(planets1.get('moon', 0), planets2.get('moon', 0))
    
    # Generate purpose interpretation based on composite Sun sign
    sun_sign = get_zodiac_sign(sun_midpoint)
    purpose = get_relationship_purpose(sun_sign)
    
    return CompositeChart(
        midpoint_sun=sun_midpoint,
        midpoint_moon=moon_midpoint,
        relationship_purpose=purpose
    )

def get_zodiac_sign(longitude: float) -> str:
    """Get zodiac sign from longitude."""
    signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
             'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
    return signs[int(longitude // 30)]

def get_relationship_purpose(sun_sign: str) -> str:
    """Get relationship purpose based on composite Sun sign."""
    purposes = {
        'Aries': 'To inspire action and new beginnings together',
        'Taurus': 'To build stability and lasting value',
        'Gemini': 'To learn, communicate, and explore ideas',
        'Cancer': 'To create emotional security and nurture growth',
        'Leo': 'To express creativity and celebrate life together',
        'Virgo': 'To serve others and perfect shared skills',
        'Libra': 'To create harmony and balance in partnership',
        'Scorpio': 'To transform and deepen understanding',
        'Sagittarius': 'To explore truth and expand horizons',
        'Capricorn': 'To achieve goals and build lasting legacy',
        'Aquarius': 'To innovate and contribute to humanity',
        'Pisces': 'To develop compassion and spiritual connection'
    }
    return purposes.get(sun_sign, 'To grow and learn together')

@router.post("/calculate-synastry", response_model=SynastryResponse)
async def calculate_synastry(
    request: SynastryRequest,
    use_vectorized: bool = Query(False, description="Use vectorized calculations for better performance")
):
    """Calculate comprehensive synastry analysis between two birth charts."""
    try:
        # Calculate planetary positions and houses for both people
        planets1, cusps1 = calculate_planets(request.person1)
        planets2, cusps2 = calculate_planets(request.person2)

        # Build aspect matrix - use vectorized version if available and requested
        if use_vectorized and vectorized_available:
            from ..utils.vectorized_aspect_utils import build_aspect_matrix_fast
            aspect_matrix = build_aspect_matrix_fast(planets1, planets2)
        else:
            aspect_matrix = build_aspect_matrix(planets1, planets2)

        # Analyze house overlays
        overlays = analyze_house_overlays(planets1, cusps2, planets2, cusps1)

        # Calculate compatibility score and relationship summary
        compatibility = calculate_compatibility_score(aspect_matrix, overlays)
        summary = generate_relationship_summary(aspect_matrix, overlays)

        # Key aspects and overlays for display
        interaspects_raw = get_key_aspects(aspect_matrix)
        interaspects: List[Dict[str, Any]] = [dict(item) for item in interaspects_raw]
        house_overlays = get_key_overlays(overlays)

        composite = calculate_composite_midpoints(planets1, planets2)

        return SynastryResponse(
            compatibility_analysis=compatibility,
            interaspects=interaspects,
            house_overlays=house_overlays,
            composite_chart=composite,
            summary=summary
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

# Health check endpoint
@router.get("/health")
async def health_check():
    """Health check for synastry service."""
    return {"status": "healthy", "service": "synastry"}
