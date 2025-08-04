# backend/main.py
import logging
import os
import json
from fastapi import FastAPI, HTTPException, Depends, Query, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import uuid
from dotenv import load_dotenv
from auth import get_current_user  # Imports Firebase initialization
from astro_calculations import calculate_chart, get_location, validate_inputs
from astro.calculations.personality import get_personality_traits
from astro.calculations.ephemeris import get_planetary_positions
from database import save_chart, get_charts

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
    # Remove old requests
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
        "https://astrology-app-pied.vercel.app",  # Allow specific Vercel subdomain
        "https://astrology-app-0emh.onrender.com",  # Allow Render subdomain 
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
        logger.debug(f"[{request_id}] Chart calculated: {chart_data}")
        return {"chart": chart_data}
    except ValueError as e:
        logger.error(f"[{request_id}] Validation error in /calculate: {str(e)}", exc_info=True)
        raise HTTPException(400, f"Invalid input: {str(e)}")
    except Exception as e:
        logger.error(f"[{request_id}] Unexpected error in /calculate: {str(e)}", exc_info=True)
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

@app.post("/create-checkout-session", response_model=CheckoutSessionResponse)
async def create_checkout_session(user_id: str = Depends(get_current_user), request: Request = None):
    rate_limiter(request)
    request_id = str(uuid.uuid4())
    if not stripe:
        logger.error(f"[{request_id}] Stripe module not available")
        raise HTTPException(500, "Stripe integration not available")
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price": os.getenv("STRIPE_PRICE_ID", "your_stripe_price_id"),  # Use env variable
                "quantity": 1
            }],
            mode="subscription",
            success_url="https://astrology-app-mauve.vercel.app/success",
            cancel_url="https://astrology-app-mauve.vercel.app/cancel",
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