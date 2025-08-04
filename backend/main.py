import logging
import os
import json
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, HTTPException, Depends, Query, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import uuid
from dotenv import load_dotenv
# Temporarily comment out authentication for debugging
# from auth import get_current_user  # Absolute import for Firebase Auth
from database import save_chart, get_charts

# Mock auth function for development - simulating elite user
def get_current_user() -> str:
    return "elite_user_dev_123"

# Mock database functions for development are commented out - using real ones now
# def save_chart(user_id: str, chart_data: dict) -> dict:
#     return {"success": True, "id": "mock_chart_id"}

# def get_charts(user_id: str) -> list:
#     return []

# Mock user profile for elite user
def get_user_profile_mock(user_id: str) -> Dict[str, Any]:
    return {
        "uid": user_id,
        "email": "elite.user@cosmichub.dev",
        "displayName": "Elite Dev User",
        "subscription": {
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
        "usage": {
            "chartsThisMonth": 5,
            "savedCharts": 8
        }
    }
from astro.calculations.chart import calculate_chart
from astro.calculations.personality import get_personality_traits
from astro.calculations.ephemeris import get_planetary_positions
from astro.calculations.chart import validate_inputs, calculate_multi_system_chart
from astro.calculations.numerology import calculate_numerology
from astro.calculations.synastry import calculate_synastry_chart
from astro.calculations.pdf_export import create_chart_pdf, create_synastry_pdf, create_multi_system_pdf
from astro.calculations.transits import calculate_transits
from astro.calculations.ai_interpretations import generate_advanced_interpretation
# from healwave.routers.presets import router as presets_router  # New: HealWave presets
# from healwave.routers.subscriptions import router as subscriptions_router  # New: HealWave subscriptions

# Load .env file
load_dotenv()

# Configure logging
log_file = os.getenv("LOG_FILE", "app.log")
logging.basicConfig(level=logging.DEBUG, filename=log_file, format="%(asctime)s %(levelname)s %(name)s %(message)s")
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

# Simple in-memory rate limiter (per IP, per endpoint)
from collections import defaultdict
import time
RATE_LIMIT = 60  # requests
RATE_PERIOD = 60  # seconds
rate_limit_store: Dict[tuple[str, str], List[float]] = defaultdict(list)
def rate_limiter(request: Request) -> None:
    ip = request.client.host if request.client else "unknown"
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
# Include HealWave routers  
# app.include_router(presets_router, prefix="/healwave")
# app.include_router(subscriptions_router, prefix="/healwave")

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
    chart: Dict[str, Any]

class UserProfileResponse(BaseModel):
    uid: str
    email: str
    created_at: str

class SaveChartResponse(BaseModel):
    result: Dict[str, Any]

class ChartsListResponse(BaseModel):
    charts: List[Dict[str, Any]]

class PersonalityResponse(BaseModel):
    personality: Dict[str, Any]

class NumerologyData(BaseModel):
    name: str
    year: int
    month: int
    day: int

class NumerologyResponse(BaseModel):
    numerology: Dict[str, Any]

class CheckoutSessionResponse(BaseModel):
    id: str

class ChatResponse(BaseModel):
    response: Dict[str, Any]

class SynastryData(BaseModel):
    person1: BirthData
    person2: BirthData

class SynastryResponse(BaseModel):
    synastry: Dict[str, Any]
    
class PdfExportData(BaseModel):
    chart_data: Dict[str, Any]
    birth_info: Optional[Dict[str, Any]] = None
    report_type: str = "standard"  # standard, synastry, multi_system

class PdfResponse(BaseModel):
    pdf_base64: str
    filename: str

class TransitData(BaseModel):
    birth_data: BirthData
    start_date: str
    end_date: str
    orb: float = 2.0
    include_retrogrades: bool = True

class TransitResponse(BaseModel):
    transits: Dict[str, Any]

class AIInterpretationData(BaseModel):
    chart_data: Dict[str, Any]
    interpretation_type: str = "advanced"  # advanced, basic, focused

class AIInterpretationResponse(BaseModel):
    interpretation: Dict[str, Any]

try:
    import stripe
    stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
    if not stripe.api_key:
        logger.warning("STRIPE_SECRET_KEY not set, Stripe endpoints may fail")
except ImportError:
    logger.error("Stripe module not installed, Stripe endpoints will fail")
    stripe = None

@app.post("/calculate", response_model=ChartResponse)
async def calculate(data: BirthData, house_system: str = Query("P", enum=["P", "E"]), request: Optional[Request] = None):
    if request:
        rate_limiter(request)
    request_id = str(uuid.uuid4())
    logger.debug(f"[{request_id}] Received data: {data.model_dump()}, House System: {house_system}")
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
async def calculate_multi_system(data: BirthData, house_system: str = Query("P", enum=["P", "E"]), request: Optional[Request] = None):
    """Calculate chart with multiple astrology systems (Western, Vedic, Chinese, Mayan, Uranian)"""
    if request:
        rate_limiter(request)
    request_id = str(uuid.uuid4())
    logger.debug(f"[{request_id}] Multi-system calculation for: {data.model_dump()}")
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
async def get_user_profile(user_id: str = Depends(get_current_user), request: Optional[Request] = None):
    if request:
        rate_limiter(request)
    request_id = str(uuid.uuid4())
    try:
        # FOR DEVELOPMENT: Return mock elite user profile
        # TODO: Replace with actual Firebase user lookup
        mock_profile = get_user_profile_mock(user_id)
        return UserProfileResponse(uid=user_id, email=mock_profile["email"], created_at="2024-01-01")
    except Exception as e:
        logger.error(f"[{request_id}] Error fetching user profile: {str(e)}")
        raise HTTPException(500, f"Internal server error: {str(e)}")

@app.get("/user/subscription")
async def get_user_subscription(user_id: str = Depends(get_current_user)):
    """Get full user profile including subscription details for elite testing"""
    try:
        return get_user_profile_mock(user_id)
    except Exception as e:
        raise HTTPException(500, f"Error fetching subscription: {str(e)}")

@app.post("/save-chart", response_model=SaveChartResponse)
async def save_chart_endpoint(data: BirthData, user_id: str = Depends(get_current_user), request: Optional[Request] = None):
    if request:
        rate_limiter(request)
    request_id = str(uuid.uuid4())
    try:
        chart_data = calculate_chart(data.year, data.month, data.day, data.hour, data.minute, data.lat, data.lon, data.timezone, data.city)
        chart_data["planets"] = get_planetary_positions(chart_data["julian_day"])
        result = save_chart(user_id, "natal", data.model_dump(), chart_data)
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
async def list_charts(user_id: str = Depends(get_current_user), request: Optional[Request] = None):
    if request:
        rate_limiter(request)
    request_id = str(uuid.uuid4())
    try:
        charts = get_charts(user_id)
        return {"charts": charts}
    except Exception as e:
        logger.error(f"[{request_id}] Error fetching charts: {str(e)}")
        raise HTTPException(500, f"Internal server error: {str(e)}")

@app.post("/analyze-personality", response_model=PersonalityResponse)
async def analyze_personality(data: BirthData, user_id: str = Depends(get_current_user), request: Optional[Request] = None):
    if request:
        rate_limiter(request)
    request_id = str(uuid.uuid4())
    try:
        chart_data = calculate_chart(data.year, data.month, data.day, data.hour, data.minute, data.lat, data.lon, data.timezone, data.city)
        personality = get_personality_traits(chart_data)
        return PersonalityResponse(personality=personality)
    except ValueError as e:
        logger.error(f"[{request_id}] Validation error: {str(e)}")
        raise HTTPException(400, str(e))
    except Exception as e:
        logger.error(f"[{request_id}] Error analyzing personality: {str(e)}", exc_info=True)
        raise HTTPException(500, f"Internal server error: {str(e)}")

@app.post("/calculate-numerology", response_model=NumerologyResponse)
async def calculate_numerology_endpoint(data: NumerologyData, request: Optional[Request] = None):
    if request:
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

@app.post("/calculate-synastry", response_model=SynastryResponse)
async def calculate_synastry(data: SynastryData, request: Optional[Request] = None):
    if request:
        rate_limiter(request)
    request_id = str(uuid.uuid4())
    logger.debug(f"[{request_id}] Synastry calculation for two people")
    try:
        # Convert BirthData to dict format expected by synastry calculation
        person1_data: Dict[str, Any] = {
            "year": data.person1.year,
            "month": data.person1.month,
            "day": data.person1.day,
            "hour": data.person1.hour,
            "minute": data.person1.minute,
            "lat": data.person1.lat,
            "lon": data.person1.lon,
            "timezone": data.person1.timezone,
            "city": data.person1.city
        }
        
        person2_data: Dict[str, Any] = {
            "year": data.person2.year,
            "month": data.person2.month,
            "day": data.person2.day,
            "hour": data.person2.hour,
            "minute": data.person2.minute,
            "lat": data.person2.lat,
            "lon": data.person2.lon,
            "timezone": data.person2.timezone,
            "city": data.person2.city
        }
        
        # Calculate synastry analysis
        synastry_data = calculate_synastry_chart(person1_data, person2_data)
        logger.debug(f"[{request_id}] Returning synastry analysis")
        return {"synastry": synastry_data}
    except ValueError as e:
        logger.error(f"[{request_id}] Validation error in /calculate-synastry: {str(e)}", exc_info=True)
        raise HTTPException(400, f"Invalid input: {str(e)}")
    except Exception as e:
        logger.error(f"[{request_id}] Unexpected error in /calculate-synastry: {str(e)}", exc_info=True)
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

@app.post("/export-pdf", response_model=PdfResponse)
async def export_chart_pdf(data: PdfExportData, request: Request = None):
    """Generate PDF report for chart data"""
    request_id = str(uuid.uuid4())[:8]
    rate_limiter(request)
    
    try:
        logger.info(f"[{request_id}] PDF export request for {data.report_type}")
        
        if data.report_type == "synastry":
            if not data.chart_data.get('synastry'):
                raise HTTPException(400, "Synastry data required for synastry PDF")
            pdf_base64 = create_synastry_pdf(data.chart_data['synastry'])
            filename = "synastry_report.pdf"
        
        elif data.report_type == "multi_system":
            if not data.chart_data.get('charts'):
                raise HTTPException(400, "Multi-system charts required for multi-system PDF")
            pdf_base64 = create_multi_system_pdf(data.chart_data)
            filename = "multi_system_report.pdf"
        
        else:  # standard chart PDF
            if not data.chart_data.get('chart'):
                raise HTTPException(400, "Chart data required for standard PDF")
            pdf_base64 = create_chart_pdf(data.chart_data['chart'], data.birth_info)
            filename = "astrology_chart.pdf"
        
        logger.info(f"[{request_id}] PDF generated successfully: {filename}")
        return PdfResponse(pdf_base64=pdf_base64, filename=filename)
        
    except Exception as e:
        logger.error(f"[{request_id}] PDF export error: {str(e)}", exc_info=True)
        raise HTTPException(500, f"PDF export failed: {str(e)}")

@app.post("/export-synastry-pdf", response_model=PdfResponse)
async def export_synastry_pdf(data: SynastryData, request: Optional[Request] = None):
    """Generate PDF report specifically for synastry analysis"""
    request_id = str(uuid.uuid4())[:8]
    if request:
        rate_limiter(request)
    
    try:
        logger.info(f"[{request_id}] Synastry PDF export request")
        
        # Convert BirthData to dict format for synastry calculation
        person1_dict = data.person1.model_dump()
        person2_dict = data.person2.model_dump()
        
        # Calculate synastry for PDF export
        synastry_result = calculate_synastry_chart(person1_dict, person2_dict)
        
        # Generate PDF - pass the synastry result as dict since that's what the function expects
        pdf_base64 = create_synastry_pdf(synastry_result)
        filename = f"synastry_report_{request_id}.pdf"
        
        logger.info(f"[{request_id}] Synastry PDF generated successfully")
        return PdfResponse(pdf_base64=pdf_base64, filename=filename)
        
    except Exception as e:
        logger.error(f"[{request_id}] Synastry PDF export error: {str(e)}", exc_info=True)
        raise HTTPException(500, f"Synastry PDF export failed: {str(e)}")

@app.post("/calculate-transits", response_model=TransitResponse)
async def calculate_transits_endpoint(data: TransitData, request: Request = None):
    """Calculate planetary transits for a given period"""
    request_id = str(uuid.uuid4())[:8]
    rate_limiter(request)
    
    try:
        logger.info(f"[{request_id}] Transit calculation request: {data.start_date} to {data.end_date}")
        
        # Convert BirthData to dict format expected by transit calculation
        birth_dict = {
            'datetime': data.birth_data.datetime,
            'latitude': data.birth_data.latitude,
            'longitude': data.birth_data.longitude,
            'timezone': data.birth_data.timezone
        }
        
        # Calculate transits
        transits = calculate_transits(
            birth_dict,
            data.start_date,
            data.end_date,
            data.orb,
            data.include_retrogrades
        )
        
        logger.info(f"[{request_id}] Transit calculation completed successfully")
        return TransitResponse(transits=transits)
        
    except Exception as e:
        logger.error(f"[{request_id}] Transit calculation error: {str(e)}", exc_info=True)
        raise HTTPException(500, f"Transit calculation failed: {str(e)}")

@app.post("/calculate-lunar-transits", response_model=TransitResponse)
async def calculate_lunar_transits_endpoint(data: TransitData, request: Request = None):
    """Calculate Moon transits for a given period"""
    request_id = str(uuid.uuid4())[:8]
    rate_limiter(request)
    
    try:
        logger.info(f"[{request_id}] Lunar transit calculation request: {data.start_date} to {data.end_date}")
        
        # Convert BirthData to dict format
        birth_dict = {
            'datetime': data.birth_data.datetime,
            'latitude': data.birth_data.latitude,
            'longitude': data.birth_data.longitude,
            'timezone': data.birth_data.timezone
        }
        
        # Calculate lunar transits
        transits = calculate_lunar_transits(
            birth_dict,
            data.start_date,
            data.end_date
        )
        
        logger.info(f"[{request_id}] Lunar transit calculation completed successfully")
        return TransitResponse(transits=transits)
        
    except Exception as e:
        logger.error(f"[{request_id}] Lunar transit calculation error: {str(e)}", exc_info=True)
        raise HTTPException(500, f"Lunar transit calculation failed: {str(e)}")

@app.post("/ai-interpretation", response_model=AIInterpretationResponse)
async def generate_ai_interpretation(data: AIInterpretationData, request: Request = None):
    """Generate advanced AI-powered astrological interpretation"""
    request_id = str(uuid.uuid4())[:8]
    rate_limiter(request)
    
    try:
        logger.info(f"[{request_id}] AI interpretation request: {data.interpretation_type}")
        
        # Generate advanced interpretation
        interpretation = generate_advanced_interpretation(data.chart_data)
        
        logger.info(f"[{request_id}] AI interpretation generated successfully")
        return AIInterpretationResponse(interpretation=interpretation)
        
    except Exception as e:
        logger.error(f"[{request_id}] AI interpretation error: {str(e)}", exc_info=True)
        raise HTTPException(500, f"AI interpretation failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)