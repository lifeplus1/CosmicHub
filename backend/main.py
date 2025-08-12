# backend/main.py
import logging
import os
from typing import Optional, Dict, Any, List, cast
from fastapi import FastAPI, HTTPException, Query, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator, FieldValidationInfo
from functools import lru_cache

# Local imports (backend directory is container WORKDIR and on PYTHONPATH)
# Note: These imports are intentionally kept for future use and side effects

# Mock user profile for elite user with Pydantic
class UserProfile(BaseModel):
    uid: str
    email: str
    displayName: str
    subscription: Dict[str, Any]
    usage: Dict[str, Any]

@lru_cache(maxsize=1)  # Cache mock profile for performance
def get_user_profile_mock(user_id: str) -> UserProfile:
    return UserProfile(
        uid=user_id,
        email="elite.user@cosmichub.dev",
        displayName="Elite Dev User",
        subscription={
            "tier": "elite",
            "status": "active",
            "customerId": "cus_dev_elite_user",
            "subscriptionId": "sub_dev_elite_123",
            "currentPeriodEnd": "2025-09-04T00:00:00Z",
            "features": [
                "unlimited_charts",
                "chart_storage", 
                "synastry_analysis",
                "pdf_export",
                "transit_analysis",
                "ai_interpretation",
                "priority_support"
            ]
        },
        usage={
            "chartsThisMonth": 5,
            "savedCharts": 8
        }
    )

from astro.calculations.chart import calculate_chart
from astro.calculations.human_design import calculate_human_design

# Configure logging with rotation for large datasets
from logging.handlers import RotatingFileHandler
import sys
log_file = os.getenv("LOG_FILE", "app.log")
# Ensure directory exists
log_dir = os.path.dirname(log_file) or "."
os.makedirs(log_dir, exist_ok=True)

# Setup logging with both file and console handlers
log_level = getattr(logging, os.getenv("LOG_LEVEL", "INFO").upper())
formatter = logging.Formatter("%(asctime)s %(levelname)s %(name)s %(message)s")

# File handler
file_handler = RotatingFileHandler(log_file, maxBytes=10**6, backupCount=5)
file_handler.setFormatter(formatter)

# Console handler for Docker logs
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setFormatter(formatter)

# Root logger configuration
logging.basicConfig(
    level=log_level, 
    handlers=[file_handler, console_handler], 
    format="%(asctime)s %(levelname)s %(name)s %(message)s"
)
logger = logging.getLogger(__name__)

logger.info("Starting FastAPI application")

# Security headers middleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request as StarletteRequest
from starlette.responses import Response as StarletteResponse
from typing import Callable, Awaitable

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: StarletteRequest, call_next: Callable[[StarletteRequest], Awaitable[StarletteResponse]]) -> StarletteResponse:
        response = await call_next(request)
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        response.headers['Strict-Transport-Security'] = 'max-age=63072000; includeSubDomains; preload'
        return response

# Redis-based rate limiter for scalability (fallback to in-memory if Redis not available)
from typing import Any as _Any, Any
import time
try:  # Optional redis dependency
    import redis  # type: ignore
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
    logger.info(f"Connecting to Redis at: {redis_url}")
    redis_client: _Any | None = redis.Redis.from_url(redis_url)  # type: ignore[attr-defined]
    # Test the connection
    redis_client.ping()
    logger.info("Redis connection successful")
except Exception as e:  # pragma: no cover - fallback path
    logger.warning(f"Redis connection failed: {e}. Falling back to in-memory rate limiting.")
    redis_client = None
    from collections import defaultdict
    rate_limit_store: Dict[tuple[str, str], List[float]] = defaultdict(list)

RATE_LIMIT = 60  # requests
RATE_PERIOD = 60  # seconds

async def rate_limiter(request: Request) -> None:
    ip = request.client.host if request.client else "unknown"
    endpoint = request.url.path
    key = f"rate:{ip}:{endpoint}"
    if redis_client:
        # redis-py client calls are synchronous; execute directly
        count = redis_client.incr(key)
        if count == 1:
            redis_client.expire(key, RATE_PERIOD)
        if count > RATE_LIMIT:
            raise HTTPException(429, "Too Many Requests")
    else:
        now = time.time()
        window = now - RATE_PERIOD
        rate_limit_store[(ip, endpoint)] = [t for t in rate_limit_store[(ip, endpoint)] if t > window]
        if len(rate_limit_store[(ip, endpoint)]) >= RATE_LIMIT:
            raise HTTPException(429, "Too Many Requests")
        rate_limit_store[(ip, endpoint)].append(now)

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):  # suppress benign CancelledError on shutdown
    try:
        yield
    except Exception as e:  # log unexpected lifespan errors
        logger.warning(f"Lifespan exception: {e}")

app = FastAPI(lifespan=lifespan)
app.add_middleware(SecurityHeadersMiddleware)

# Add CORS middleware with strict origins
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5174,http://localhost:3000,http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

class BirthData(BaseModel):
    year: int = Field(..., ge=1900, le=2100)
    month: int = Field(..., ge=1, le=12)
    day: int = Field(..., ge=1, le=31)
    hour: int = Field(..., ge=0, le=23)
    minute: int = Field(..., ge=0, le=59)
    city: str = Field(..., min_length=1)
    timezone: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None

    @field_validator('day')
    @classmethod
    def validate_day(cls, v: int, info: FieldValidationInfo) -> int:  # type: ignore[override]
        raw = getattr(info, 'data', {})  # type: ignore[attr-defined]
        if isinstance(raw, dict):
            month = raw.get('month')  # type: ignore[attr-defined]
            year = raw.get('year')  # type: ignore[attr-defined]
            if isinstance(month, int) and isinstance(year, int):
                if month in [4, 6, 9, 11] and v > 30:
                    raise ValueError('Invalid day for month')
                if month == 2:
                    leap = (year % 4 == 0 and (year % 100 != 0 or year % 400 == 0))
                    if (leap and v > 29) or (not leap and v > 28):
                        raise ValueError('Invalid day for February')
        return v

class ChartResponse(BaseModel):
    planets: Dict[str, Any]
    houses: Dict[str, Any]
    aspects: List[Any]
    angles: Optional[Dict[str, Any]] = None
    systems: Optional[Dict[str, Any]] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    timezone: Optional[str] = None
    julian_day: Optional[float] = None

# Other models with strict validation...

# (Truncated for brevity; apply similar Pydantic strictness to all models)

@app.post("/calculate", response_model=ChartResponse)
async def calculate(data: BirthData, request: Request, background_tasks: BackgroundTasks, house_system: str = Query("P", enum=["P", "E"])):
    await rate_limiter(request)
    
    # Debug: Log incoming request data
    print(f"🔍 Backend received data: lat={data.lat}, lon={data.lon}, timezone={data.timezone}, city={data.city}")
    
    chart = calculate_chart(
        year=data.year,
        month=data.month,
        day=data.day,
        hour=data.hour,
        minute=data.minute,
        lat=data.lat,
        lon=data.lon,
        city=data.city,
        timezone=data.timezone or "UTC"
    )
    
    # Convert houses list to dictionary format if needed
    houses_data: Any = chart.get('houses', {})
    if isinstance(houses_data, list):
        # Convert list of houses to dictionary format
        houses_dict: Dict[str, Any] = {}
        houses_list = cast(List[Dict[str, Any]], houses_data)
        for house in houses_list:
            if 'house' in house:
                houses_dict[f"house_{house['house']}"] = house
        houses_data = houses_dict
    
    # Provide multi-system expansion in background if desired
    background_tasks.add_task(lambda: None)  # placeholder for future async tasks
    return ChartResponse(
        planets=chart.get('planets', {}),
        houses=houses_data,
        aspects=chart.get('aspects', []),
        angles=chart.get('angles'),
        systems=chart.get('systems') if 'systems' in chart else None,
        latitude=chart.get('latitude'),  # Use resolved coordinates from chart calculation
        longitude=chart.get('longitude'),  # Use resolved coordinates from chart calculation
        timezone=chart.get('timezone'),  # Use resolved timezone from chart calculation
        julian_day=chart.get('julian_day')
    )

@app.post("/calculate-human-design")
async def calculate_human_design_endpoint(data: BirthData, request: Request):
    await rate_limiter(request)
    
    # Debug: Log incoming request data
    print(f"🧬 Human Design backend received data: year={data.year}, month={data.month}, day={data.day}, hour={data.hour}, minute={data.minute}")
    print(f"🧬 Location data: lat={data.lat}, lon={data.lon}, timezone={data.timezone}, city={data.city}")
    
    try:
        # Resolve coordinates if not provided but city is available
        lat = data.lat
        lon = data.lon
        timezone = data.timezone
        
        if data.city and (lat is None or lon is None):
            from astro.calculations.chart import get_location
            print(f"🌍 Resolving location for city: {data.city}")
            try:
                location_data = get_location(data.city)
                lat = location_data["latitude"]
                lon = location_data["longitude"]
                timezone = location_data["timezone"] or timezone
                print(f"✅ Location resolved: lat={lat}, lon={lon}, timezone={timezone}")
            except Exception as geo_error:
                print(f"❌ Geocoding failed for city '{data.city}': {str(geo_error)}")
                logger.error(f"Geocoding error for city '{data.city}': {str(geo_error)}")
                # For now, use default coordinates (this should be improved in production)
                lat = 0.0
                lon = 0.0
                timezone = timezone or "UTC"
                print(f"🔄 Using fallback coordinates: lat={lat}, lon={lon}, timezone={timezone}")
        
        # Validate required coordinates
        if lat is None or lon is None:
            raise ValueError("Latitude and longitude are required for Human Design calculation")
        
        if timezone is None:
            timezone = "UTC"
        
        human_design_chart = calculate_human_design(
            year=data.year,
            month=data.month,
            day=data.day,
            hour=data.hour,
            minute=data.minute,
            lat=lat,
            lon=lon,
            timezone=timezone
        )
        
        return {"human_design": human_design_chart}
    except Exception as e:
        logger.error(f"Human Design calculation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Human Design calculation failed: {str(e)}")

@app.get("/health")
async def root_health():
    return {"status": "ok"}

# Structure cleanup suggestion: Move routers to separate files and import here for modularity.
# Import API routers (local path)
from api.routers import ai, presets, subscriptions, ephemeris, charts
app.include_router(ai.router)
app.include_router(presets.router)
app.include_router(subscriptions.router)
app.include_router(ephemeris.router, prefix="/api")
app.include_router(charts.router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)