import logging
import os
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, HTTPException, Depends, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import uuid

# Note: load_dotenv() not needed in Docker - environment variables are passed via --env-file

# Temporarily comment out authentication for debugging
# from auth import get_current_user  # Absolute import for Firebase Auth

# Mock database functions for development
def save_chart(user_id: str, chart_type: str, birth_data: dict, chart_data: dict):
    return {"status": "success", "message": "Chart saved (mock)"}

def get_charts(user_id: str):
    return []

def delete_chart_by_id(user_id: str, chart_id: str):
    return True

# Try to import real database functions, fallback to mock
try:
    from database import save_chart as real_save_chart, get_charts as real_get_charts, delete_chart_by_id as real_delete_chart
    save_chart = real_save_chart
    get_charts = real_get_charts  
    delete_chart_by_id = real_delete_chart
    print("Using real Firebase database")
except Exception as e:
    print(f"Using mock database functions: {str(e)}")

# Using mock auth function for development - simulating elite user
def get_current_user() -> str:
    return "elite_user_dev_123"

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
# from astro.calculations.transits_clean import calculate_transits, calculate_lunar_transits
from astro.calculations.ai_interpretations import generate_advanced_interpretation
from astro.calculations.human_design import calculate_human_design
from astro.calculations.gene_keys import calculate_gene_keys_profile, get_gene_key_details, get_daily_contemplation

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
    async def dispatch(self, request: StarletteRequest, call_next) -> StarletteResponse:  # type: ignore
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

# Include API routers
from api.routers import ai
app.include_router(ai.router, prefix="/api/v1", tags=["ai"])

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5178",  # Current frontend port
        "http://localhost:5177",  # Previous frontend port
        "http://localhost:5174",
        "http://localhost:5173",
        "http://localhost:8080",  # New frontend port
        "http://localhost:8081",  # New frontend port
        "http://localhost:8082",  # New frontend port
        "http://localhost:8083",  # New frontend port
        "http://localhost:3000",
        "https://astrology-app-pied.vercel.app",  # Astrology frontend
        "https://healwave.yourdomain.com",  # HealWave frontend (update with actual domain)
        "https://astrology-app-0emh.onrender.com",  # Backend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
from api.routers import ai
app.include_router(ai.router, prefix="/api/v1", tags=["ai"])

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

class HumanDesignResponse(BaseModel):
    human_design: Dict[str, Any]

class GeneKeysResponse(BaseModel):
    gene_keys: Dict[str, Any]

class GeneKeyDetailsResponse(BaseModel):
    gene_key: Dict[str, Any]

class DailyContemplationResponse(BaseModel):
    contemplation: Dict[str, Any]

try:
    import stripe
    stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
    if not stripe.api_key:
        logger.warning("STRIPE_SECRET_KEY not set, Stripe endpoints may fail")
except ImportError:
    logger.error("Stripe module not installed, Stripe endpoints will fail")
    stripe = None

@app.post("/calculate", response_model=ChartResponse)
async def calculate(data: BirthData, request: Request, house_system: str = Query("P", enum=["P", "E"])):
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
async def calculate_multi_system(data: BirthData, request: Request, house_system: str = Query("P", enum=["P", "E"])):
    """Calculate chart with multiple astrology systems (Western, Vedic, Chinese, Mayan, Uranian)"""
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
async def get_user_profile(request: Request, user_id: str = Depends(get_current_user)):
    if request:
        rate_limiter(request)
    request_id = str(uuid.uuid4())
    try:
        # Return mock elite user profile for development
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
async def save_chart_endpoint(data: BirthData, request: Request, house_system: str = Query("P", enum=["P", "E"]), user_id: str = Depends(get_current_user)):
    rate_limiter(request)
    request_id = str(uuid.uuid4())
    try:
        chart_data = calculate_chart(data.year, data.month, data.day, data.hour, data.minute, data.lat, data.lon, data.timezone, data.city, house_system)
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
async def list_charts(request: Request, user_id: str = Depends(get_current_user)):
    if request:
        rate_limiter(request)
    request_id = str(uuid.uuid4())
    try:
        charts = get_charts(user_id)
        return {"charts": charts}
    except Exception as e:
        logger.error(f"[{request_id}] Error fetching charts: {str(e)}")
        raise HTTPException(500, f"Internal server error: {str(e)}")

@app.delete("/charts/{chart_id}")
async def delete_chart(chart_id: str, request: Request, user_id: str = Depends(get_current_user)):
    if request:
        rate_limiter(request)
    request_id = str(uuid.uuid4())
    try:
        success = delete_chart_by_id(user_id, chart_id)
        if success:
            return {"success": True, "message": "Chart deleted successfully"}
        else:
            raise HTTPException(404, "Chart not found or access denied")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[{request_id}] Error deleting chart: {str(e)}")
        raise HTTPException(500, f"Internal server error: {str(e)}")

@app.post("/analyze-personality", response_model=PersonalityResponse)
async def analyze_personality(data: BirthData, request: Request, user_id: str = Depends(get_current_user)):
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
async def calculate_numerology_endpoint(data: NumerologyData, request: Request):
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
async def calculate_synastry(data: SynastryData, request: Request):
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
async def create_checkout_session(user_id: str = Depends(get_current_user)):
    request_id = str(uuid.uuid4())
    if not stripe:
        logger.error(f"[{request_id}] Stripe module not available")
        raise HTTPException(500, "Stripe integration not available")
    try:
        from firebase_admin import auth
        user = auth.get_user(user_id)  # type: ignore
        session = stripe.checkout.Session.create(
            customer_email=user.email,  # type: ignore
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
async def chat(message: Dict[str, Any], user_id: str = Depends(get_current_user)):
    request_id = str(uuid.uuid4())
    try:
        api_key = os.getenv("XAI_API_KEY")
        if not api_key:
            raise HTTPException(500, "XAI_API_KEY not set")
        response = requests.post(
            "https://api.x.ai/v1/chat/completions",
            headers={"Authorization": f"Bearer {api_key}"},
            json={"model": "grok", "messages": [{"role": "user", "content": message["text"]}]}  # type: ignore
        )
        response.raise_for_status()
        return {"response": response.json()}
    except Exception as e:
        logger.error(f"[{request_id}] Chat error: {str(e)}", exc_info=True)
        raise HTTPException(500, f"Chat error: {str(e)}")

@app.get("/health")
async def health_check(request: Request):
    rate_limiter(request)
    return {"status": "ok"}

@app.post("/export-pdf", response_model=PdfResponse)
async def export_chart_pdf(data: PdfExportData, request: Request):
    """Generate PDF report for chart data"""
    request_id = str(uuid.uuid4())[:8]
    rate_limiter(request)
    
    try:
        logger.info(f"[{request_id}] PDF export request for {data.report_type}")
        
        if data.report_type == "synastry":
            if not data.chart_data.get('synastry'):
                raise HTTPException(400, "Synastry data required for synastry PDF")
            pdf_base64 = create_synastry_pdf(data.chart_data['synastry'])  # type: ignore
            filename = "synastry_report.pdf"
        
        elif data.report_type == "multi_system":
            if not data.chart_data.get('charts'):
                raise HTTPException(400, "Multi-system charts required for multi-system PDF")
            pdf_base64 = create_multi_system_pdf(data.chart_data)  # type: ignore
            filename = "multi_system_report.pdf"
        
        else:  # standard chart PDF
            if not data.chart_data.get('chart'):
                raise HTTPException(400, "Chart data required for standard PDF")
            pdf_base64 = create_chart_pdf(data.chart_data['chart'], data.birth_info)  # type: ignore
            filename = "astrology_chart.pdf"
        
        logger.info(f"[{request_id}] PDF generated successfully: {filename}")
        return PdfResponse(pdf_base64=pdf_base64, filename=filename)
        
    except Exception as e:
        logger.error(f"[{request_id}] PDF export error: {str(e)}", exc_info=True)
        raise HTTPException(500, f"PDF export failed: {str(e)}")

@app.post("/export-synastry-pdf", response_model=PdfResponse)
async def export_synastry_pdf(data: SynastryData, request: Request):
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
        pdf_base64 = create_synastry_pdf(synastry_result)  # type: ignore
        filename = f"synastry_report_{request_id}.pdf"
        
        logger.info(f"[{request_id}] Synastry PDF generated successfully")
        return PdfResponse(pdf_base64=pdf_base64, filename=filename)
        
    except Exception as e:
        logger.error(f"[{request_id}] Synastry PDF export error: {str(e)}", exc_info=True)
        raise HTTPException(500, f"Synastry PDF export failed: {str(e)}")

"""
@app.post("/calculate-transits", response_model=TransitResponse)
async def calculate_transits_endpoint(data: TransitData, request: Request):
    # Calculate planetary transits for a given period
    request_id = str(uuid.uuid4())[:8]
    rate_limiter(request)
    
    try:
        logger.info(f"[{request_id}] Transit calculation request: {data.start_date} to {data.end_date}")
        
        # Convert BirthData to dict format expected by transit calculation
        from datetime import datetime
        birth_datetime = datetime(
            data.birth_data.year, 
            data.birth_data.month, 
            data.birth_data.day, 
            data.birth_data.hour, 
            data.birth_data.minute
        )
        
        birth_dict: Dict[str, Any] = {
            'datetime': birth_datetime,
            'latitude': data.birth_data.lat or 0.0,
            'longitude': data.birth_data.lon or 0.0,
            'timezone': data.birth_data.timezone or "UTC"
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
async def calculate_lunar_transits_endpoint(data: TransitData, request: Request):
    # Calculate Moon transits for a given period
    request_id = str(uuid.uuid4())[:8]
    rate_limiter(request)
    
    try:
        logger.info(f"[{request_id}] Lunar transit calculation request: {data.start_date} to {data.end_date}")
        
        # Convert BirthData to dict format
        from datetime import datetime
        birth_datetime = datetime(
            data.birth_data.year, 
            data.birth_data.month, 
            data.birth_data.day, 
            data.birth_data.hour, 
            data.birth_data.minute
        )
        
        birth_dict: Dict[str, Any] = {
            'datetime': birth_datetime,
            'latitude': data.birth_data.lat or 0.0,
            'longitude': data.birth_data.lon or 0.0,
            'timezone': data.birth_data.timezone or "UTC"
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
"""

@app.post("/ai-interpretation", response_model=AIInterpretationResponse)
async def generate_ai_interpretation(data: AIInterpretationData, request: Request):
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

@app.post("/calculate-human-design", response_model=HumanDesignResponse)
async def calculate_human_design_endpoint(data: BirthData, request: Request):
    """Calculate complete Human Design chart and analysis"""
    request_id = str(uuid.uuid4())[:8]
    rate_limiter(request)
    
    try:
        logger.info(f"[{request_id}] Human Design calculation for: {data.model_dump()}")
        
        # Validate inputs
        validate_inputs(data.year, data.month, data.day, data.hour, data.minute, data.lat, data.lon, data.timezone, data.city)
        
        # Calculate Human Design chart
        human_design_data = calculate_human_design(
            data.year, data.month, data.day, data.hour, data.minute, 
            data.lat or 0.0, data.lon or 0.0, data.timezone or "UTC"
        )
        
        logger.info(f"[{request_id}] Human Design calculation completed successfully")
        return HumanDesignResponse(human_design=human_design_data)
        
    except ValueError as e:
        logger.error(f"[{request_id}] Validation error in Human Design: {str(e)}", exc_info=True)
        raise HTTPException(400, f"Invalid input: {str(e)}")
    except Exception as e:
        logger.error(f"[{request_id}] Unexpected error in Human Design: {str(e)}", exc_info=True)
        raise HTTPException(500, f"Human Design calculation failed: {str(e)}")

@app.post("/calculate-gene-keys", response_model=GeneKeysResponse)
async def calculate_gene_keys_endpoint(data: BirthData, request: Request):
    """Calculate complete Gene Keys profile including all sequences"""
    request_id = str(uuid.uuid4())[:8]
    rate_limiter(request)
    
    try:
        logger.info(f"[{request_id}] Gene Keys calculation for: {data.model_dump()}")
        
        # Validate inputs
        validate_inputs(data.year, data.month, data.day, data.hour, data.minute, data.lat, data.lon, data.timezone, data.city)
        
        # Calculate Gene Keys profile
        gene_keys_data = calculate_gene_keys_profile(
            data.year, data.month, data.day, data.hour, data.minute,
            data.lat or 0.0, data.lon or 0.0, data.timezone or "UTC"
        )
        
        logger.info(f"[{request_id}] Gene Keys calculation completed successfully")
        return GeneKeysResponse(gene_keys=gene_keys_data)
        
    except ValueError as e:
        logger.error(f"[{request_id}] Validation error in Gene Keys: {str(e)}", exc_info=True)
        raise HTTPException(400, f"Invalid input: {str(e)}")
    except Exception as e:
        logger.error(f"[{request_id}] Unexpected error in Gene Keys: {str(e)}", exc_info=True)
        raise HTTPException(500, f"Gene Keys calculation failed: {str(e)}")

@app.get("/gene-key/{gene_key_number}", response_model=GeneKeyDetailsResponse)
async def get_gene_key_details_endpoint(gene_key_number: int, request: Request):
    """Get detailed information about a specific Gene Key"""
    request_id = str(uuid.uuid4())[:8]
    rate_limiter(request)
    
    try:
        logger.info(f"[{request_id}] Gene Key details request for: {gene_key_number}")
        
        if gene_key_number < 1 or gene_key_number > 64:
            raise HTTPException(400, "Gene Key number must be between 1 and 64")
        
        # Get Gene Key details
        gene_key_details = get_gene_key_details(gene_key_number)
        
        logger.info(f"[{request_id}] Gene Key details retrieved successfully")
        return GeneKeyDetailsResponse(gene_key=gene_key_details)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[{request_id}] Error getting Gene Key details: {str(e)}", exc_info=True)
        raise HTTPException(500, f"Failed to get Gene Key details: {str(e)}")

@app.get("/daily-contemplation/{gene_key_number}", response_model=DailyContemplationResponse)
async def get_daily_contemplation_endpoint(gene_key_number: int, request: Request):
    """Get daily contemplation guidance for a specific Gene Key"""
    request_id = str(uuid.uuid4())[:8]
    rate_limiter(request)
    
    try:
        logger.info(f"[{request_id}] Daily contemplation request for Gene Key: {gene_key_number}")
        
        if gene_key_number < 1 or gene_key_number > 64:
            raise HTTPException(400, "Gene Key number must be between 1 and 64")
        
        # Get daily contemplation
        contemplation = get_daily_contemplation(gene_key_number)
        
        logger.info(f"[{request_id}] Daily contemplation retrieved successfully")
        return DailyContemplationResponse(contemplation=contemplation)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[{request_id}] Error getting daily contemplation: {str(e)}", exc_info=True)
        raise HTTPException(500, f"Failed to get daily contemplation: {str(e)}")

@app.get("/health")
async def health_check(request: Request):
    rate_limiter(request)
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)