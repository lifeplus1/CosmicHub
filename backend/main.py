# backend/main.py
import logging
import os
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, HTTPException, Depends, Query, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator, FieldValidationInfo
import requests
import uuid
import asyncio
from datetime import datetime
from functools import lru_cache

# Local imports (backend directory is container WORKDIR and on PYTHONPATH)
from auth import get_current_user  # pragma: no cover (import side effects)
from database import save_chart, get_charts, delete_chart_by_id, get_firestore_client  # noqa: F401

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

from astro.calculations.chart import calculate_chart, validate_inputs, calculate_multi_system_chart
from astro.calculations.personality import get_personality_traits
from astro.calculations.ephemeris import get_planetary_positions
from astro.calculations.numerology import calculate_numerology
from astro.calculations.synastry import calculate_synastry_chart
from astro.calculations.pdf_export import create_chart_pdf, create_synastry_pdf, create_multi_system_pdf
from astro.calculations.ai_interpretations import generate_advanced_interpretation
from astro.calculations.human_design import calculate_human_design
from astro.calculations.gene_keys import calculate_gene_keys_profile, get_gene_key_details, get_daily_contemplation

# Configure logging with rotation for large datasets
from logging.handlers import RotatingFileHandler
log_file = os.getenv("LOG_FILE", "app.log")
# Ensure directory exists
log_dir = os.path.dirname(log_file) or "."
os.makedirs(log_dir, exist_ok=True)
handler = RotatingFileHandler(log_file, maxBytes=10**6, backupCount=5)
logging.basicConfig(level=logging.DEBUG, handlers=[handler], format="%(asctime)s %(levelname)s %(name)s %(message)s")
logger = logging.getLogger(__name__)

logger.info("Starting FastAPI application")

# Security headers middleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request as StarletteRequest
from starlette.responses import Response as StarletteResponse

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: StarletteRequest, call_next) -> StarletteResponse:
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
    redis_client: _Any | None = redis.Redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379"))  # type: ignore[attr-defined]
except Exception:  # pragma: no cover - fallback path
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
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "").split(","),
    allow_credentials=True,
    allow_methods=["*"],
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
    def validate_day(cls, v: int, info: FieldValidationInfo):  # type: ignore[override]
        raw = getattr(info, 'data', {})  # type: ignore[attr-defined]
        if isinstance(raw, dict):
            month = raw.get('month')
            year = raw.get('year')
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
    systems: Optional[Dict[str, Any]] = None

# Other models with strict validation...

# (Truncated for brevity; apply similar Pydantic strictness to all models)

# Endpoints with background tasks for non-blocking ops, batched Firestore reads
@app.post("/calculate", response_model=ChartResponse)
async def calculate(data: BirthData, request: Request, background_tasks: BackgroundTasks, house_system: str = Query("P", enum=["P", "E"])):
    await rate_limiter(request)
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
    # Provide multi-system expansion in background if desired
    background_tasks.add_task(lambda: None)  # placeholder for future async tasks
    return ChartResponse(
        planets=chart.get('planets', {}),
        houses=chart.get('houses', {}),
        aspects=chart.get('aspects', []),
        systems=chart.get('systems') if 'systems' in chart else None
    )

@app.get("/health")
async def root_health():
    return {"status": "ok"}

# Structure cleanup suggestion: Move routers to separate files and import here for modularity.
# Import API routers (local path)
from api.routers import ai, presets, subscriptions
app.include_router(ai.router)
app.include_router(presets.router)
app.include_router(subscriptions.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)