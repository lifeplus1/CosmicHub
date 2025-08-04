# backend/main.py
import logging
import os
import json
from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import stripe
import requests
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

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5174",
        "http://localhost:3000",
        "https://astrology-app-pied.vercel.app",  # Allow specific Vercel subdomain 
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

try:
    stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
    if not stripe.api_key:
        logger.warning("STRIPE_SECRET_KEY not set, Stripe endpoints may fail")
except ImportError:
    logger.error("Stripe module not installed, Stripe endpoints will fail")
    stripe = None

@app.post("/calculate")
async def calculate(data: BirthData, house_system: str = Query("P", enum=["P", "E"])):
    logger.debug(f"Received data: {data.dict()}, House System: {house_system}")
    try:
        validate_inputs(data.year, data.month, data.day, data.hour, data.minute, data.lat, data.lon, data.timezone, data.city)
        chart_data = calculate_chart(data.year, data.month, data.day, data.hour, data.minute, data.lat, data.lon, data.timezone, data.city, house_system)
        logger.debug(f"Chart calculated: {chart_data}")
        return chart_data
    except ValueError as e:
        logger.error(f"Validation error in /calculate: {str(e)}", exc_info=True)
        raise HTTPException(400, f"Invalid input: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error in /calculate: {str(e)}", exc_info=True)
        raise HTTPException(500, f"Internal server error: {str(e)}")

@app.get("/user/profile")
async def get_user_profile(user_id: str = Depends(get_current_user)):
    try:
        from firebase_admin import auth
        user = auth.get_user(user_id)
        return {"uid": user_id, "email": user.email, "created_at": user.user_metadata.creation_timestamp}
    except Exception as e:
        logger.error(f"Error fetching user profile: {str(e)}")
        raise HTTPException(500, f"Internal server error: {str(e)}")

@app.post("/save-chart")
async def save_chart_endpoint(data: BirthData, user_id: str = Depends(get_current_user)):
    try:
        chart_data = calculate_chart(data.year, data.month, data.day, data.hour, data.minute, data.lat, data.lon, data.timezone, data.city)
        chart_data["planets"] = get_planetary_positions(chart_data["julian_day"])
        result = save_chart(user_id, "natal", data.dict(), chart_data)
        return result
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(400, str(e))
    except Exception as e:
        logger.error(f"Error saving chart: {str(e)}")
        if "PERMISSION_DENIED" in str(e):
            raise HTTPException(403, "Permission denied: Check Firestore rules")
        raise HTTPException(500, f"Internal server error: {str(e)}")

@app.get("/charts")
async def list_charts(user_id: str = Depends(get_current_user)):
    try:
        charts = get_charts(user_id)
        return charts
    except Exception as e:
        logger.error(f"Error fetching charts: {str(e)}")
        raise HTTPException(500, f"Internal server error: {str(e)}")

@app.post("/analyze-personality")
async def analyze_personality(data: BirthData, user_id: str = Depends(get_current_user)):
    try:
        chart_data = calculate_chart(data.year, data.month, data.day, data.hour, data.minute, data.lat, data.lon, data.timezone, data.city)
        personality = get_personality_traits(chart_data)
        return personality
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(400, str(e))
    except Exception as e:
        logger.error(f"Error analyzing personality: {str(e)}", exc_info=True)
        raise HTTPException(500, f"Internal server error: {str(e)}")

@app.post("/create-checkout-session")
async def create_checkout_session(user_id: str = Depends(get_current_user)):
    if not stripe:
        logger.error("Stripe module not available")
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
        logger.error(f"Error creating checkout session: {str(e)}", exc_info=True)
        raise HTTPException(500, f"Internal server error: {str(e)}")

@app.post("/chat")
async def chat(message: dict, user_id: str = Depends(get_current_user)):
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
        return response.json()
    except Exception as e:
        logger.error(f"Chat error: {str(e)}", exc_info=True)
        raise HTTPException(500, f"Chat error: {str(e)}")

@app.get("/health")
async def health_check():
    return {"status": "ok"}