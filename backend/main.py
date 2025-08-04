import logging
import os
import json
from fastapi import FastAPI, HTTPException, Depends, Query, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import uuid
from dotenv import load_dotenv
from .auth import get_current_user  # Relative import for Firebase Auth
from .database import get_db  # Relative import for Firestore
from .astro.calculations.chart import calculate_chart
from .astro.calculations.personality import get_personality_traits
from .astro.calculations.ephemeris import get_planetary_positions
from .astro.calculations.chart import validate_inputs, get_location, calculate_multi_system_chart
from .astro.calculations.numerology import calculate_numerology
from .database import save_chart, get_charts
from .healwave.routers.presets import router as presets_router  # New: HealWave presets
from .healwave.routers.subscriptions import router as subscriptions_router  # New: HealWave subscriptions

# Load .env file
load_dotenv()

# Configure logging
log_file = os.getenv("LOG_FILE", "app.log")
logging.basicConfig(level=logging.DEBUG, filename=log_file, format="%(asctime)s %(levelname)s %(name)s %(message)s")
logger = logging.getLogger(__name__)

logger.info("Starting FastAPI application")

# Security headers middleware
from starlette.middleware.base import BaseHTTPMiddleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        response.headers['Strict-Transport-Security'] = 'max-age=63072000; includeSubDomains; preload'
        return response

# Simple in-memory rate limiter (per IP, per endpoint)
from collections import defaultdict
import time
RATE_LIMIT = 60  # requests
RATE_PERIOD = 60  # seconds
rate_limit_store = defaultdict(list)
def rate_limiter(request: Request):
    ip = request.client.host
    endpoint = request.url.path
    now = time.time()
    window = now - RATE_PERIOD
    rate_limit_store[(ip, endpoint)] = [t for t in rate_limit_store[(ip, endpoint)] if t > window]
    if len(rate_limit_store[(ip, endpoint)]) >= RATE_LIMIT:
        raise HTTPException(429, "Too Many Requests")
    rate_limit_store[(ip, endpoint)].append(now)

app = FastAPI()
app.add_middleware(SecurityHeadersMiddleware)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5174",
        "http://localhost:5173",
        "http://localhost:3000",
        "https://astrology-app-pied.vercel.app",  # Astrology frontend
        "https://healwave.yourdomain.com",  # HealWave frontend (update with actual domain)
        "https://astrology-app-0emh.onrender.com",  # Backend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(presets_router, prefix="/healwave")
app.include_router(subscriptions_router, prefix="/healwave")

class BirthData(BaseModel):
    year: int
    month: int
    day: int
    hour: int
    minute: int
    city: str
    timezone: str | None = None
    lat: float | None = None
    lon: float | None = None

# Example response models
class ChartResponse(BaseModel):
    chart: dict

class UserProfileResponse(BaseModel):
    uid: str
    email: str
    created_at: int

class SaveChartResponse(BaseModel):
    result: dict

class ChartsListResponse(BaseModel):
    charts: list

class PersonalityResponse(BaseModel):
    personality: dict

class NumerologyData(BaseModel):
    name: str
    year: int
    month: int
    day: int

class NumerologyResponse(BaseModel):
    numerology: dict

class CheckoutSessionResponse(BaseModel):
    id: str

class ChatResponse(BaseModel):
    response: dict

try:
    import stripe
    stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
    if not stripe.api_key:
        logger.warning("STRIPE_SECRET_KEY not set, Stripe endpoints may fail")
except ImportError:
    logger.error("Stripe module not installed, Stripe endpoints will fail")
    stripe = None

@app.post("/calculate", response_model=ChartResponse)
async def calculate(data: BirthData, house_system: str = Query("P", enum=["P", "E"]), request: Request = None):
    rate_limiter(request)
    request_id = str(uuid.uuid4())
    logger.debug(f"[{request_id}] Received data: {data.dict()}, House System: {house_system}")
    try:
        validate_inputs(data.year, data.month, data.day, data.hour, data.minute, data.lat, data.lon, data.timezone, data.city)
        chart_data = calculate_chart(data.year, data.month, data.day, data.hour, data.minute, data.lat, data.lon, data.timezone, data.city, house_system)
        if not chart_data.get("planets"):
            logger.warning(f"[{request_id}] No planets data in chart")
            chart_data["planets"] = {}
        logger.debug(f"[{request_id}] Returning chart: {chart_data}")
        return {"chart": chart_data}
    except ValueError as e:
        logger.error(f"[{request_id}] Validation error in /calculate: {str(e)}", exc_info=True)
        raise HTTPException(400, f"Invalid input: {str(e)}")
    except Exception as e:
        logger.error(f"[{request_id}] Unexpected error in /calculate: {str(e)}", exc_info=True)
        raise HTTPException(500, f"Internal server error: {str(e)}")

@app.post("/calculate-multi-system", response_model=ChartResponse)
async def calculate_multi_system(data: BirthData, house_system: str = Query("P", enum=["P", "E"]), request: Request = None):
    """Calculate chart with multiple astrology systems (Western, Vedic, Chinese, Mayan, Uranian)"""
    rate_limiter(request)
    request_id = str(uuid.uuid4())
    logger.debug(f"[{request_id}] Multi-system calculation for: {data.dict()}")
    try:
        validate_inputs(data.year, data.month, data.day, data.hour, data.minute, data.lat, data.lon, data.timezone, data.city)
        multi_chart = calculate_multi_system_chart(data.year, data.month, data.day, data.hour, data.minute, data.lat, data.lon, data.timezone, data.city, house_system)
        logger.debug(f"[{request_id}] Returning multi-system chart")
        return {"chart": multi_chart}
    except ValueError as e:
        logger.error(f"[{request_id}] Validation error in /calculate-multi-system: {str(e)}", exc_info=True)
        raise HTTPException(400, f"Invalid input: {str(e)}")
    except Exception as e:
        logger.error(f"[{request_id}] Unexpected error in /calculate-multi-system: {str(e)}", exc_info=True)
        raise HTTPException(500, f"Internal server error: {str(e)}")

@app.get("/user/profile", response_model=UserProfileResponse)
async def get_user_profile(user_id: str = Depends(get_current_user), request: Request = None):
    rate_limiter(request)
    request_id = str(uuid.uuid4())
    try:
        from firebase_admin import auth
        user = auth.get_user(user_id)
        return {"uid": user_id, "email": user.email, "created_at": user.user_metadata.creation_timestamp}
    except Exception as e:
        logger.error(f"[{request_id}] Error fetching user profile: {str(e)}")
        raise HTTPException(500, f"Internal server error: {str(e)}")

@app.post("/save-chart", response_model=SaveChartResponse)
async def save_chart_endpoint(data: BirthData, user_id: str = Depends(get_current_user), request: Request = None):
    rate_limiter(request)
    request_id = str(uuid.uuid4())
    try:
        chart_data = calculate_chart(data.year, data.month, data.day, data.hour, data.minute, data.lat, data.lon, data.timezone, data.city)
        chart_data["planets"] = get_planetary_positions(chart_data["julian_day"])
        result = save_chart(user_id, "natal", data.dict(), chart_data)
        return {"result": result}
    except ValueError as e:
        logger.error(f"[{request_id}] Validation error: {str(e)}")
        raise HTTPException(400, str(e))
    except Exception as e:
        logger.error(f"[{request_id}] Error saving chart: {str(e)}")
        if "PERMISSION_DENIED" in str(e):
            raise HTTPException(403, "Permission denied: Check Firestore rules")
        raise HTTPException(500, f"Internal server error: {str(e)}")

@app.get("/charts", response_model=ChartsListResponse)
async def list_charts(user_id: str = Depends(get_current_user), request: Request = None):
    rate_limiter(request)
    request_id = str(uuid.uuid4())
    try:
        charts = get_charts(user_id)
        return {"charts": charts}
    except Exception as e:
        logger.error(f"[{request_id}] Error fetching charts: {str(e)}")
        raise HTTPException(500, f"Internal server error: {str(e)}")

@app.post("/analyze-personality", response_model=PersonalityResponse)
async def analyze_personality(data: BirthData, user_id: str = Depends(get_current_user), request: Request = None):
    rate_limiter(request)
    request_id = str(uuid.uuid4())
    try:
        chart_data = calculate_chart(data.year, data.month, data.day, data.hour, data.minute, data.lat, data.lon, data.timezone, data.city)
        personality = get_personality_traits(chart_data)
        return {"personality": personality}
    except ValueError as e:
        logger.error(f"[{request_id}] Validation error: {str(e)}")
        raise HTTPException(400, str(e))
    except Exception as e:
        logger.error(f"[{request_id}] Error analyzing personality: {str(e)}", exc_info=True)
        raise HTTPException(500, f"Internal server error: {str(e)}")

@app.post("/calculate-numerology", response_model=NumerologyResponse)
async def calculate_numerology_endpoint(data: NumerologyData, request: Request = None):
    rate_limiter(request)
    request_id = str(uuid.uuid4())
    logger.debug(f"[{request_id}] Numerology calculation for: {data.model_dump()}")
    try:
        # Convert to datetime object
        from datetime import datetime
        birth_date = datetime(data.year, data.month, data.day)
        
        # Calculate numerology
        numerology_data = calculate_numerology(data.name, birth_date)
        logger.debug(f"[{request_id}] Returning numerology analysis")
        return {"numerology": numerology_data}
    except ValueError as e:
        logger.error(f"[{request_id}] Validation error in /calculate-numerology: {str(e)}", exc_info=True)
        raise HTTPException(400, f"Invalid input: {str(e)}")
    except Exception as e:
        logger.error(f"[{request_id}] Unexpected error in /calculate-numerology: {str(e)}", exc_info=True)
        raise HTTPException(500, f"Internal server error: {str(e)}")

@app.post("/create-checkout-session", response_model=CheckoutSessionResponse)
async def create_checkout_session(user_id: str = Depends(get_current_user), request: Request = None):
    rate_limiter(request)
    request_id = str(uuid.uuid4())
    if not stripe:
        logger.error(f"[{request_id}] Stripe module not available")
        raise HTTPException(500, "Stripe integration not available")
    try:
        from firebase_admin import auth
        user = auth.get_user(user_id)
        session = stripe.checkout.Session.create(
            customer_email=user.email,
            payment_method_types=["card"],
            line_items=[{
                "price": os.getenv("STRIPE_PRICE_ID", "your_stripe_price_id"),
                "quantity": 1
            }],
            mode="subscription",
            success_url=os.getenv("CHECKOUT_SUCCESS_URL", "https://astrology-app-pied.vercel.app/success"),
            cancel_url=os.getenv("CHECKOUT_CANCEL_URL", "https://astrology-app-pied.vercel.app/cancel"),
            metadata={"user_id": user_id}
        )
        return {"id": session.id}
    except Exception as e:
        logger.error(f"[{request_id}] Error creating checkout session: {str(e)}", exc_info=True)
        raise HTTPException(500, f"Internal server error: {str(e)}")

@app.post("/chat", response_model=ChatResponse)
async def chat(message: dict, user_id: str = Depends(get_current_user), request: Request = None):
    rate_limiter(request)
    request_id = str(uuid.uuid4())
    try:
        api_key = os.getenv("XAI_API_KEY")
        if not api_key:
            raise HTTPException(500, "XAI_API_KEY not set")
        response = requests.post(
            "https://api.x.ai/v1/chat/completions",
            headers={"Authorization": f"Bearer {api_key}"},
            json={"model": "grok", "messages": [{"role": "user", "content": message["text"]}]}
        )
        response.raise_for_status()
        return {"response": response.json()}
    except Exception as e:
        logger.error(f"[{request_id}] Chat error: {str(e)}", exc_info=True)
        raise HTTPException(500, f"Chat error: {str(e)}")

@app.get("/health")
async def health_check(request: Request = None):
    rate_limiter(request)
    return {"status": "ok"}