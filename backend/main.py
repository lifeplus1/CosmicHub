import logging
import os
import json
from fastapi import FastAPI, HTTPException, Header, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import firebase_admin
from firebase_admin import credentials, auth, firestore
from astro_calculations import calculate_chart, get_location, validate_inputs
from astro.personality import get_personality_traits
from astro.ephemeris import get_planetary_positions
import stripe
import requests
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# Configure logging
log_file = os.getenv("LOG_FILE", "app.log")
logging.basicConfig(level=logging.DEBUG, filename=log_file, format="%(asctime)s %(levelname)s %(name)s %(message)s")
logger = logging.getLogger(__name__)

logger.info("Starting FastAPI application")

# Initialize Firebase
try:
    emulator_host = os.getenv("FIRESTORE_EMULATOR_HOST")
    if emulator_host:
        logger.info(f"Using Firestore emulator at {emulator_host}")
        firebase_admin.initialize_app(options={'projectId': 'test-project'})
    else:
        firebase_credentials = os.getenv("FIREBASE_CREDENTIALS")
        if not firebase_credentials:
            logger.error("FIREBASE_CREDENTIALS environment variable is not set")
            # Fail gracefully in test/CI, but raise in production
            if os.getenv("CI") or os.getenv("PYTEST_CURRENT_TEST"):
                # In CI or pytest, skip Firebase init
                firebase_admin = None
                cred = None
                logger.warning("Skipping Firebase initialization in CI/test environment.")
            else:
                raise ValueError("FIREBASE_CREDENTIALS environment variable is not set")
        else:
            try:
                cred_dict = json.loads(firebase_credentials)
                logger.debug(f"FIREBASE_CREDENTIALS loaded: project_id={cred_dict.get('project_id')}")
                cred = credentials.Certificate(cred_dict)
                firebase_admin.initialize_app(cred)
                logger.info("Firebase initialized successfully")
            except json.JSONDecodeError as e:
                logger.error(f"Invalid FIREBASE_CREDENTIALS JSON: {str(e)}")
                raise ValueError(f"Invalid FIREBASE_CREDENTIALS JSON: {str(e)}")
            except Exception as e:
                logger.error(f"Failed to initialize Firebase: {str(e)}")
                raise

except Exception as e:
    logger.error(f"Failed to initialize Firebase: {str(e)}")
    raise

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5174",
        "http://localhost:3000",
        "https://*.vercel.app"
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
    timezone: str = None
    lat: float = None
    lon: float = None

async def verify_firebase_token(authorization: str = Header(...)):
    try:
        if not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Invalid authorization header")
        token = authorization.split("Bearer ")[1]
        if os.getenv("FIRESTORE_EMULATOR_HOST"):
            logger.debug("Emulator mode: Bypassing token verification")
            return {"uid": token}
        decoded = auth.verify_id_token(token)
        return decoded
    except Exception as e:
        logger.error(f"Firebase auth error: {str(e)}")
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

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
async def get_user_profile(user: dict = Depends(verify_firebase_token)):
    try:
        return {"uid": user["uid"], "email": user.get("email", ""), "created_at": user.get("iat", "")}
    except Exception as e:
        logger.error(f"Error fetching user profile: {str(e)}")
        raise HTTPException(500, f"Internal server error: {str(e)}")

@app.post("/save-chart")
async def save_chart(data: BirthData, user: dict = Depends(verify_firebase_token)):
    try:
        chart_data = calculate_chart(data.year, data.month, data.day, data.hour, data.minute, data.lat, data.lon, data.timezone, data.city)
        chart_data["planets"] = get_planetary_positions(chart_data["julian_day"])
        chart_data["user_id"] = user["uid"]
        chart_data["created_at"] = firestore.SERVER_TIMESTAMP
        db = firestore.client()
        doc_ref = db.collection("users").document(user["uid"]).collection("charts").document()
        doc_ref.set(chart_data)
        logger.debug(f"Saved chart for user {user['uid']}: {chart_data}")
        return {"id": doc_ref.id, **chart_data}
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(400, str(e))
    except Exception as e:
        logger.error(f"Error saving chart: {str(e)}", exc_info=True)
        if "PERMISSION_DENIED" in str(e):
            raise HTTPException(403, "Permission denied: Check Firestore rules")
        raise HTTPException(500, f"Internal server error: {str(e)}")

@app.post("/analyze-personality")
async def analyze_personality(data: BirthData, user: dict = Depends(verify_firebase_token)):
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
async def create_checkout_session(user: dict = Depends(verify_firebase_token)):
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
            success_url="https://astrology-app-mauve.vercel.app/success",
            cancel_url="https://astrology-app-mauve.vercel.app/cancel",
            metadata={"user_id": user["uid"]}
        )
        return {"id": session.id}
    except Exception as e:
        logger.error(f"Error creating checkout session: {str(e)}", exc_info=True)
        raise HTTPException(500, f"Internal server error: {str(e)}")

@app.post("/chat")
async def chat(message: dict, user: dict = Depends(verify_firebase_token)):
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