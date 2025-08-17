# apps/backend/src/routers/synastry.py
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Dict, List, TypedDict, Optional, Any, Union

# Type definitions for better type safety
class AspectData(TypedDict):
    planet1: str
    planet2: str
    aspect_type: str
    orb: float
    influence: str

class HouseOverlay(TypedDict):
    planet: str
    house: int
    influence: str
    strength: float

class CompatibilityScore(TypedDict):
    overall: float
    emotional: float
    communication: float
    values: float
    activities: float
    growth: float

class Summary(TypedDict):
    strengths: List[str]
    challenges: List[str]
    advice: List[str]

import swisseph as swe
from datetime import datetime, timezone
import pytz
import time
from os import getenv

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

# Optional Prometheus metrics (mirrors interpretation pattern)
metrics_enabled_flag = getenv("ENABLE_METRICS", "true").lower() == "true"
try:  # Safe optional import
    if metrics_enabled_flag:
        from prometheus_client import Counter, Histogram  # type: ignore
        SYN_COUNTER = Counter('synastry_requests_total', 'Synastry calculation attempts', ['result'])  # type: ignore
        SYN_LATENCY = Histogram('synastry_generation_seconds', 'Synastry calculation latency seconds', buckets=(0.05,0.1,0.25,0.5,1,2,5,10))  # type: ignore
        SYN_CACHE = Counter('synastry_cache_events_total', 'Synastry cache events', ['event'])  # type: ignore
    else:  # pragma: no cover - disabled path
        SYN_COUNTER = None  # type: ignore
        SYN_LATENCY = None  # type: ignore
        SYN_CACHE = None  # type: ignore
except Exception:  # pragma: no cover - import failure
    SYN_COUNTER = None  # type: ignore
    SYN_LATENCY = None  # type: ignore
    SYN_CACHE = None  # type: ignore

# Simple in-memory cache (lightweight; future: unify with Redis service)
from typing import Any as _Any
_syn_cache: dict[str, tuple[float, dict[str, _Any]]] = {}
_CACHE_TTL = int(getenv('SYNASTRY_CACHE_TTL', '900'))  # 15 min default

def _make_pair_key(p1: 'BirthData', p2: 'BirthData') -> str:
    # Order-independent key using datetimes (fallback to date+time)
    k1 = p1.datetime or f"{p1.date}T{p1.time}"
    k2 = p2.datetime or f"{p2.date}T{p2.time}"
    a, b = sorted([k1, k2])
    return f"syn:{a}|{b}"

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
    compatibility_analysis: CompatibilityScore
    interaspects: List[AspectData]
    house_overlays: List[HouseOverlay]
    composite_chart: CompositeChart
    summary: Summary

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
        start_time = time.time()
        cache_key = _make_pair_key(request.person1, request.person2)

        # Cache lookup
        if _CACHE_TTL > 0 and cache_key in _syn_cache:
            ts, payload = _syn_cache[cache_key]
            if (time.time() - ts) <= _CACHE_TTL:
                if SYN_CACHE:
                    try: SYN_CACHE.labels('hit').inc()  # type: ignore
                    except Exception: pass
                if SYN_COUNTER:
                    try: SYN_COUNTER.labels('cache').inc()  # type: ignore
                    except Exception: pass
                return payload  # type: ignore[return-value]
            else:
                if SYN_CACHE:
                    try: SYN_CACHE.labels('expired').inc()  # type: ignore
                    except Exception: pass
                _syn_cache.pop(cache_key, None)
        else:
            if SYN_CACHE:
                try: SYN_CACHE.labels('miss').inc()  # type: ignore
                except Exception: pass

        # Core calculations
        planets1, cusps1 = calculate_planets(request.person1)
        planets2, cusps2 = calculate_planets(request.person2)

        if use_vectorized and vectorized_available:
            from ..utils.vectorized_aspect_utils import build_aspect_matrix_fast
            aspect_matrix = build_aspect_matrix_fast(planets1, planets2)
        else:
            aspect_matrix = build_aspect_matrix(planets1, planets2)

        overlays = analyze_house_overlays(planets1, cusps2, planets2, cusps1)
        compatibility = calculate_compatibility_score(aspect_matrix, overlays)
        summary = generate_relationship_summary(aspect_matrix, overlays)

        # Process and validate data types
        interaspects_raw = get_key_aspects(aspect_matrix)
        interaspects: List[AspectData] = []
        for item in interaspects_raw:
            aspect_data: AspectData = {
                "planet1": str(item.get("planet1", "")),
                "planet2": str(item.get("planet2", "")),
                "aspect_type": str(item.get("aspect_type", "")),
                "orb": float(item.get("orb", 0.0)),
                "influence": str(item.get("influence", ""))
            }
            interaspects.append(aspect_data)
            
        house_overlays_raw = get_key_overlays(overlays)
        house_overlays: List[HouseOverlay] = []
        for item in house_overlays_raw:
            overlay_data: HouseOverlay = {
                "planet": str(item.get("planet", "")),
                "house": int(item.get("house", 0)),
                "influence": str(item.get("influence", "")),
                "strength": float(item.get("strength", 0.0))
            }
            house_overlays.append(overlay_data)
            
        # Ensure compatibility score matches our TypedDict
        compatibility_data: CompatibilityScore = {
            "overall": float(compatibility.get("overall", 0.0)),
            "emotional": float(compatibility.get("emotional", 0.0)),
            "communication": float(compatibility.get("communication", 0.0)),
            "values": float(compatibility.get("values", 0.0)),
            "activities": float(compatibility.get("activities", 0.0)),
            "growth": float(compatibility.get("growth", 0.0))
        }
        
        # Ensure summary matches our TypedDict
        summary_data: Summary = {
            "strengths": summary.get("strengths", []),
            "challenges": summary.get("challenges", []),
            "advice": summary.get("advice", [])
        }
        composite = calculate_composite_midpoints(planets1, planets2)

        response_obj = SynastryResponse(
            compatibility_analysis=compatibility_data,
            interaspects=interaspects,
            house_overlays=house_overlays,
            composite_chart=composite,
            summary=summary_data
        )

        if _CACHE_TTL > 0:
            _syn_cache[cache_key] = (time.time(), response_obj.model_dump())
            if SYN_CACHE:
                try: SYN_CACHE.labels('store').inc()  # type: ignore
                except Exception: pass

        if SYN_COUNTER:
            try: SYN_COUNTER.labels('success').inc()  # type: ignore
            except Exception: pass
        if SYN_LATENCY:
            try: SYN_LATENCY.observe(time.time() - start_time)  # type: ignore
            except Exception: pass

        return response_obj
    except HTTPException:
        if SYN_COUNTER:
            try: SYN_COUNTER.labels('client_error').inc()  # type: ignore
            except Exception: pass
        raise
    except Exception as e:
        if SYN_COUNTER:
            try: SYN_COUNTER.labels('error').inc()  # type: ignore
            except Exception: pass
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

# Health check endpoint
@router.get("/health")
async def health_check():
    """Health check for synastry service."""
    return {"status": "healthy", "service": "synastry"}
