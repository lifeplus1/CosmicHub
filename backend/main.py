# backend/main.py
import logging
import os
from pathlib import Path
from typing import Optional, Dict, Any, List, cast

# Enhanced environment loading with proper error handling
def load_environment():
    """Load environment variables with proper error handling and logging."""
    env_mode = os.environ.get('DEPLOY_ENVIRONMENT', 'development').lower()
    try:
        from dotenv import load_dotenv  # type: ignore
        backend_dir = Path(__file__).resolve().parent
        preferred = ['.env.production.server', '.env'] if env_mode == 'production' else ['.env', '.env.production.server']
        
        for fname in preferred:
            env_path = backend_dir / fname
            if env_path.exists():
                if load_dotenv(dotenv_path=str(env_path)):
                    logging.getLogger(__name__).info(f"Successfully loaded environment from {fname}")
                    return True
                else:
                    logging.getLogger(__name__).warning(f"Failed to load environment from {fname}")
        
        logging.getLogger(__name__).error("Failed to load any .env file")
        if env_mode == 'production':
            raise RuntimeError("No valid .env file found in production environment")
        return False
    except ImportError:
        logging.getLogger(__name__).info("python-dotenv not available, using system environment")
        return True
    except Exception as e:
        logging.getLogger(__name__).error(f"Environment loading error: {str(e)}")
        if env_mode == 'production':
            raise RuntimeError(f"Environment loading failed: {str(e)}")
        return False

# Load environment
load_environment()
from fastapi import FastAPI, HTTPException, Query, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator, ValidationInfo
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

RATE_LIMIT = 1000  # requests - increased for development
RATE_PERIOD = 60  # seconds

# Enhanced Redis-based rate limiter with memory cleanup
async def rate_limiter(request: Request) -> None:
    """Enhanced rate limiter with better memory management and Redis optimization."""
    ip = request.client.host if request.client else "unknown"
    endpoint = request.url.path
    key = f"rate:{ip}:{endpoint}"
    
    if redis_client:
        try:
            count = redis_client.incr(key)
            if count == 1:
                redis_client.expire(key, RATE_PERIOD)
            if count > RATE_LIMIT:
                raise HTTPException(status_code=429, detail="Too Many Requests")
        except Exception as redis_error:
            logger.warning(f"Redis rate limiting failed: {redis_error}. Falling back to in-memory.")
            # Fallback to in-memory if Redis fails
            await _in_memory_rate_limit(ip, endpoint)
    else:
        await _in_memory_rate_limit(ip, endpoint)

async def _in_memory_rate_limit(ip: str, endpoint: str) -> None:
    """In-memory rate limiting with automatic cleanup."""
    now = time.time()
    window = now - RATE_PERIOD
    
    # Clean old entries to prevent memory leaks
    rate_limit_store[(ip, endpoint)] = [
        t for t in rate_limit_store[(ip, endpoint)] if t > window
    ]
    
    if len(rate_limit_store[(ip, endpoint)]) >= RATE_LIMIT:
        raise HTTPException(status_code=429, detail="Too Many Requests")
    
    rate_limit_store[(ip, endpoint)].append(now)
    
    # Periodic cleanup of the entire store to prevent memory leaks
    if len(rate_limit_store) > 1000:  # Arbitrary limit
        cutoff_time = now - (RATE_PERIOD * 2)  # Clean entries older than 2x rate period
        keys_to_remove = [
            key for key, timestamps in rate_limit_store.items()
            if not timestamps or max(timestamps) < cutoff_time
        ]
        for key in keys_to_remove:
            del rate_limit_store[key]
        logger.info(f"Cleaned {len(keys_to_remove)} old rate limit entries")

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
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5174,http://localhost:5175,http://localhost:3000,http://localhost:5173").split(",")
logger.info(f"🌐 CORS enabled for origins: {allowed_origins}")
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
    def validate_day(cls, v: int, info: ValidationInfo) -> int:  # type: ignore[override]
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
        
        # Enhanced geocoding with better error handling
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
                raise HTTPException(
                    status_code=400, 
                    detail=f"Invalid city '{data.city}' or geocoding service unavailable. Please provide valid latitude and longitude coordinates."
                )
        
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

@app.post("/calculate-gene-keys")
async def calculate_gene_keys_endpoint(data: BirthData, request: Request):
    await rate_limiter(request)
    
    # Debug: Log incoming request data
    print(f"🗝️ Gene Keys backend received data: year={data.year}, month={data.month}, day={data.day}, hour={data.hour}, minute={data.minute}")
    print(f"🗝️ Location data: lat={data.lat}, lon={data.lon}, timezone={data.timezone}, city={data.city}")
    
    try:
        # Import Gene Keys calculation function
        from astro.calculations.gene_keys import calculate_gene_keys_profile
        
        # Resolve coordinates if not provided but city is available
        lat = data.lat
        lon = data.lon
        timezone = data.timezone
        
        # Enhanced geocoding with better error handling
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
                raise HTTPException(
                    status_code=400, 
                    detail=f"Invalid city '{data.city}' or geocoding service unavailable. Please provide valid latitude and longitude coordinates."
                )
        
        # Validate required coordinates
        if lat is None or lon is None:
            raise ValueError("Latitude and longitude are required for Gene Keys calculation")
        
        if timezone is None:
            timezone = "UTC"
        
        gene_keys_profile = calculate_gene_keys_profile(
            year=data.year,
            month=data.month,
            day=data.day,
            hour=data.hour,
            minute=data.minute,
            lat=lat,
            lon=lon,
            timezone=timezone
        )
        
        return {"gene_keys": gene_keys_profile}
    except Exception as e:
        logger.error(f"Gene Keys calculation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Gene Keys calculation failed: {str(e)}")

@app.get("/health")
async def root_health():
    return {"status": "ok"}

# Structure cleanup suggestion: Move routers to separate files and import here for modularity.
# Import API routers (local path)
from api.routers import ai, presets, subscriptions, ephemeris, charts, stripe_router
from api import interpretations
from astro.calculations import transits_clean

app.include_router(ai.router)
app.include_router(presets.router)
app.include_router(subscriptions.router)
app.include_router(ephemeris.router, prefix="/api")
app.include_router(charts.router, prefix="/api")
app.include_router(interpretations.router)  # AI Interpretations router
app.include_router(transits_clean.router, prefix="/api/astro", tags=["transits"])  # Transit calculations router
app.include_router(stripe_router.router)  # Stripe subscription & billing endpoints

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)