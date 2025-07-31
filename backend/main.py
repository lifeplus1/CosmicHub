# In backend/main.py
import logging
import os
import json
from fastapi import FastAPI, HTTPException, Header, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import firebase_admin
from firebase_admin import credentials, auth, initialize_app, firestore
from fastapi.security import OAuth2AuthorizationCodeBearer
from astro_calculations import calculate_chart, get_location, validate_inputs
from astro.personality import get_personality_traits
from astro.ephemeris import get_planetary_positions
import stripe
import requests

# Configure logging
log_file = os.getenv("LOG_FILE", "app.log")
logging.basicConfig(level=logging.DEBUG, filename=log_file, format="%(asctime)s %(levelname)s %(name)s %(message)s")
logger = logging.getLogger(__name__)

logger.info("Starting FastAPI application")



# Load Firebase credentials
try:
    firebase_credentials = os.getenv("FIREBASE_CREDENTIALS")
    if not firebase_credentials:
        raise ValueError("FIREBASE_CREDENTIALS environment variable is not set")
    cred_dict = json.loads(firebase_credentials)
    cred = credentials.Certificate(cred_dict)
    firebase_admin.initialize_app(cred)
except json.JSONDecodeError as e:
    print(f"Invalid FIREBASE_CREDENTIALS JSON: {str(e)}")
    raise ValueError(f"Invalid FIREBASE_CREDENTIALS JSON: {str(e)}")
except Exception as e:
    print(f"Failed to initialize Firebase: {str(e)}")
    raise


# Initialize FastAPI
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://astrology-app-sigma.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic model for birth data
class BirthData(BaseModel):
    year: int
    month: int
    day: int
    hour: int
    minute: int
    city: str
    timezone: str = None
    lat: float = None
    lon: float = None

# Firebase token verification
oauth2_scheme = OAuth2AuthorizationCodeBearer(
    authorizationUrl="https://accounts.google.com/o/oauth2/auth",
    tokenUrl="https://oauth2.googleapis.com/token"
)

async def verify_firebase_token(authorization: str = Header(...)):
    try:
        token = authorization.split("Bearer ")[1]
        decoded = auth.verify_id_token(token)
        return decoded["uid"]
    except Exception as e:
        logger.error(f"Firebase auth error: {str(e)}")
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

# Initialize Stripe
try:
    stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
    if not stripe.api_key:
        logger.warning("STRIPE_SECRET_KEY not set, Stripe endpoints may fail")
except ImportError:
    logger.error("Stripe module not installed, Stripe endpoints will fail")
    stripe = None

@app.post("/calculate")
async def calculate(data: BirthData, x_api_key: str = Header(...), house_system: str = Query("P", enum=["P", "E"])):
    logger.debug(f"Received data: {data.dict()}, API Key: {x_api_key}, House System: {house_system}")
    try:
        expected_key = os.getenv("API_KEY")
        if x_api_key != expected_key:
            logger.error(f"Invalid API key: {x_api_key}")
            raise HTTPException(401, "Invalid API key")
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

@app.post("/save-chart")
async def save_chart(data: BirthData, uid: str = Depends(verify_firebase_token)):
    try:
        chart_data = calculate_chart(data.year, data.month, data.day, data.hour, data.minute, data.lat, data.lon, data.timezone, data.city)
        chart_data["planets"] = get_planetary_positions(chart_data["julian_day"])
        chart_data["user_id"] = uid
        chart_data["created_at"] = firestore.SERVER_TIMESTAMP
        doc_ref = db.collection("users").document(uid).collection("charts").document()
        doc_ref.set(chart_data)
        logger.debug(f"Saved chart for user {uid}: {chart_data}")
        return {"id": doc_ref.id, **chart_data}
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(400, str(e))
    except Exception as e:
        logger.error(f"Error saving chart: {str(e)}", exc_info=True)
        raise HTTPException(500, f"Internal server error: {str(e)}")

@app.post("/analyze-personality")
async def analyze_personality(data: BirthData, uid: str = Depends(verify_firebase_token)):
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
async def create_checkout_session(uid: str = Depends(verify_firebase_token)):
    if not stripe:
        logger.error("Stripe module not available")
        raise HTTPException(500, "Stripe integration not available")
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price": "your_stripe_price_id",  # Replace with actual price ID
                "quantity": 1
            }],
            mode="subscription",
            success_url="https://astrology-app-sigma.vercel.app/success",
            cancel_url="https://astrology-app-sigma.vercel.app/cancel",
            metadata={"user_id": uid}
        )
        return {"id": session.id}
    except Exception as e:
        logger.error(f"Error creating checkout session: {str(e)}", exc_info=True)
        raise HTTPException(500, f"Internal server error: {str(e)}")

@app.post("/chat")
async def chat(message: dict, uid: str = Depends(verify_firebase_token)):
    try:
        api_key = os.getenv("XAI_API_KEY")
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