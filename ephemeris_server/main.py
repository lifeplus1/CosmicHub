import os
import logging
from pathlib import Path
from typing import List
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.responses import FileResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from models import (
    CalculationRequest, 
    CalculationResponse, 
    BatchCalculationRequest, 
    BatchCalculationResponse,
    HealthResponse
)
from service import EphemerisService
try:
    # Load local env files for development if present
    from dotenv import load_dotenv  # type: ignore
    _env_loaded = False
    for fname in ('.env', '.env.production.server'):
        env_path = Path(__file__).resolve().parent / fname
        if env_path.exists():
            load_dotenv(dotenv_path=str(env_path))
            _env_loaded = True
            break
    if _env_loaded:
        logging.getLogger(__name__).info("Loaded ephemeris_server environment from local .env file")
except Exception:
    # Safe to ignore if python-dotenv is not available in certain environments
    pass

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Rate limiting setup
limiter = Limiter(key_func=get_remote_address)

# Security setup
security = HTTPBearer()

# Global service instance
ephemeris_service: EphemerisService = None  # type: ignore


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    global ephemeris_service
    
    # Startup
    logger.info("Starting Ephemeris Server...")
    
    # Initialize service
    redis_url = os.getenv('REDIS_URL')
    cache_ttl = int(os.getenv('CACHE_TTL', '3600'))
    
    ephemeris_service = EphemerisService(redis_url=redis_url, cache_ttl=cache_ttl)
    
    logger.info("Ephemeris Server started successfully")
    yield
    
    # Shutdown
    logger.info("Shutting down Ephemeris Server...")


# Create FastAPI app
app = FastAPI(
    title="Ephemeris Server",
    description="Dedicated server for astronomical calculations using Swiss Ephemeris",
    version="1.0.0",
    lifespan=lifespan
)

# Add rate limiting middleware
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)  # type: ignore
app.add_middleware(SlowAPIMiddleware)


def verify_api_key(credentials: HTTPAuthorizationCredentials = Depends(security)) -> bool:
    """Verify API key from Authorization header."""
    expected_key = os.getenv('API_KEY')
    if not expected_key:
        logger.error("API_KEY environment variable not set")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server configuration error"
        )
    
    if credentials.credentials != expected_key:
        logger.warning(f"Invalid API key attempt from client")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key"
        )
    
    return True


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    try:
        is_healthy = ephemeris_service.is_healthy() if ephemeris_service else False
        return HealthResponse(
            status="healthy" if is_healthy else "unhealthy",
            ephemeris_initialized=is_healthy
        )
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return HealthResponse(
            status="unhealthy",
            ephemeris_initialized=False
        )


@app.get("/ephemeris/{filename}", response_class=FileResponse)
@limiter.limit("50/minute")  # type: ignore[misc]
async def get_ephemeris_file(
    request: Request,
    filename: str,
    authorized: bool = Depends(verify_api_key)
) -> FileResponse:
    """
    Serve ephemeris files securely.
    Requires valid API key in Authorization header.
    """
    try:
        # Validate filename to prevent directory traversal
        if '..' in filename or '/' in filename or '\\' in filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid filename"
            )
        
        ephe_path = os.getenv('EPHE_PATH', '/app/ephe')
        file_path = os.path.join(ephe_path, filename)
        
        if not os.path.exists(file_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Ephemeris file '{filename}' not found"
            )
        
        return FileResponse(
            path=file_path,
            filename=filename,
            media_type='application/octet-stream'
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error serving file {filename}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error serving file"
        )


@app.post("/calculate", response_model=CalculationResponse)
@limiter.limit("100/minute")  # type: ignore[misc]
async def calculate_position(
    request: Request,
    calc_request: CalculationRequest,
    authorized: bool = Depends(verify_api_key)
) -> CalculationResponse:
    """
    Calculate planetary position for given Julian Day and planet.
    Requires valid API key in Authorization header.
    """
    try:
        if not ephemeris_service:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Ephemeris service not initialized"
            )
        
        position = ephemeris_service.calculate_position(
            calc_request.julian_day,
            calc_request.planet
        )
        
        return CalculationResponse(
            planet=calc_request.planet.lower(),
            julian_day=calc_request.julian_day,
            position=position
        )
        
    except ValueError as e:
        logger.warning(f"Invalid calculation request: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Calculation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Calculation failed"
        )


@app.post("/calculate/batch", response_model=BatchCalculationResponse)
@limiter.limit("20/minute")  # type: ignore[misc]
async def calculate_batch_positions(
    request: Request,
    batch_request: BatchCalculationRequest,
    authorized: bool = Depends(verify_api_key)
) -> BatchCalculationResponse:
    """
    Calculate multiple planetary positions in batch.
    Requires valid API key in Authorization header.
    Limited to fewer requests per minute due to higher computational cost.
    """
    try:
        if not ephemeris_service:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Ephemeris service not initialized"
            )
        
        # Limit batch size to prevent abuse
        max_batch_size = int(os.getenv('MAX_BATCH_SIZE', '50'))
        if len(batch_request.calculations) > max_batch_size:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Batch size exceeds maximum of {max_batch_size}"
            )
        
        results: List[CalculationResponse] = []
        for calc in batch_request.calculations:
            try:
                position = ephemeris_service.calculate_position(
                    calc.julian_day,
                    calc.planet
                )
                results.append(CalculationResponse(
                    planet=calc.planet.lower(),
                    julian_day=calc.julian_day,
                    position=position
                ))
            except ValueError as e:
                logger.warning(f"Skipping invalid calculation in batch: {e}")
                # Skip invalid calculations rather than failing entire batch
                continue
        
        return BatchCalculationResponse(results=results)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Batch calculation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Batch calculation failed"
        )


@app.get("/planets", response_model=List[str])
async def get_supported_planets(
    authorized: bool = Depends(verify_api_key)
) -> List[str]:
    """
    Get list of supported planets/celestial bodies.
    Requires valid API key in Authorization header.
    """
    try:
        if not ephemeris_service:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Ephemeris service not initialized"
            )
        
        return ephemeris_service.get_supported_planets()
        
    except Exception as e:
        logger.error(f"Error getting supported planets: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving supported planets"
        )


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv('PORT', '8001'))
    uvicorn.run(app, host="0.0.0.0", port=port)
