import logging
import os
import json
from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from firebase_admin import credentials, auth, initialize_app
from fastapi.security import OAuth2AuthorizationCodeBearer
from backend.astro_calculations import calculate_chart, get_location, validate_inputs, get_planetary_positions
import stripe

# Configure logging
log_file = os.getenv("LOG_FILE", "app.log")  # Default to app.log locally
logging.basicConfig(level=logging.DEBUG, filename=log_file, format="%(asctime)s %(levelname)s %(name)s %(message)s")
logger = logging.getLogger(__name__)

logger.info("Starting FastAPI application")

# Initialize Firebase Admin
try:
    firebase_cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "firebase-adminsdk.json")
    if os.path.exists(firebase_cred_path):
        logger.info(f"Using Firebase credentials file: {firebase_cred_path}")
        cred = credentials.Certificate(firebase_cred_path)
    else:
        firebase_creds = os.getenv("FIREBASE_CREDENTIALS")
        if not firebase_creds:
            logger.error("FIREBASE_CREDENTIALS or FIREBASE_CREDENTIALS_PATH not set")
            raise ValueError("FIREBASE_CREDENTIALS or FIREBASE_CREDENTIALS_PATH not set")
        try:
            creds_dict = json.loads(firebase_creds)
        except json.JSONDecodeError as e:
            logger.error(f"Invalid FIREBASE_CREDENTIALS format: {str(e)}")
            raise ValueError(f"Invalid FIREBASE_CREDENTIALS JSON: {str(e)}")
        cred = credentials.Certificate(creds_dict)
    initialize_app(cred)
    logger.info("Firebase initialized successfully")
except Exception as e:
    logger.error(f"Firebase initialization failed: {str(e)}", exc_info=True)
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

# Calculate endpoint
@app.post("/calculate")
async def calculate(data: BirthData, x_api_key: str = Header(...)):
    logger.debug(f"Received data: {data.dict()}, API Key: {x_api_key}")
    try:
        expected_key = os.getenv("API_KEY")
        logger.debug(f"Expected API Key: {expected_key}")
        if x_api_key != expected_key:
            logger.error(f"Invalid API key: {x_api_key}")
            raise HTTPException(401, "Invalid API key")
        logger.debug("Starting input validation")
        validate_inputs(data.year, data.month, data.day, data.hour, data.minute, data.lat, data.lon, data.timezone, data.city)
        logger.debug("Input validation passed, calculating chart")
        chart_data = calculate_chart(data.year, data.month, data.day, data.hour, data.minute, data.lat, data.lon, data.timezone, data.city)
        logger.debug("Chart calculation complete, fetching planetary positions")
        chart_data["planets"] = get_planetary_positions(chart_data["julian_day"])
        logger.debug(f"Chart calculated: {chart_data}")
        return chart_data
    except ValueError as e:
        logger.error(f"Validation error in /calculate: {str(e)}", exc_info=True)
        raise HTTPException(400, f"Invalid input: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error in /calculate: {str(e)}", exc_info=True)
        raise HTTPException(500, f"Internal server error: {str(e)}")

# Save chart endpoint
@app.post("/save-chart")
async def save_chart(data: BirthData, uid: str = Depends(verify_firebase_token)):
    logger.debug(f"Saving chart for user {uid}: {data.dict()}")
    try:
        chart_data = calculate_chart(data.year, data.month, data.day, data.hour, data.minute, data.lat, data.lon, data.timezone, data.city)
        chart_data["planets"] = get_planetary_positions(chart_data["julian_day"])
        chart_data["user_id"] = uid
        return chart_data
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(400, str(e))
    except Exception as e:
        logger.error(f"Error saving chart: {str(e)}", exc_info=True)
        raise HTTPException(500, f"Internal server error: {str(e)}")

# Stripe checkout session endpoint
try:
    stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
    if not stripe.api_key:
        logger.warning("STRIPE_SECRET_KEY not set, Stripe endpoints may fail")
except ImportError:
    logger.error("Stripe module not installed, Stripe endpoints will fail")
    stripe = None

@app.post("/create-checkout-session")
async def create_checkout_session(uid: str = Depends(verify_firebase_token)):
    if not stripe:
        logger.error("Stripe module not available")
        raise HTTPException(500, "Stripe integration not available")
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price": "price_12345",  # Replace with your Stripe price ID
                "quantity": 1
            }],
            mode="subscription",
            success_url="https://astrology-app-sigma.vercel.app/success",
            cancel_url="https://astrology-app-sigma.vercel.app/cancel"
        )
        return {"id": session.id}
    except Exception as e:
        logger.error(f"Error creating checkout session: {str(e)}", exc_info=True)
        raise HTTPException(500, f"Internal server error: {str(e)}")

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "ok"}