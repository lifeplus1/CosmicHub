#!/usr/bin/env python3
"""
Simple test backend for chart calculations without authentication
"""

import logging
import os
import json
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uuid
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="CosmicHub API", version="1.0.0")

# CORS middleware for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple models
class BirthData(BaseModel):
    year: int
    month: int
    day: int
    hour: int
    minute: int
    city: str

class ChartResponse(BaseModel):
    chart: dict

class NumerologyData(BaseModel):
    name: str
    birth_date: str

class NumerologyResponse(BaseModel):
    numerology: dict

# Simple chart calculation endpoint
@app.post("/calculate-multi-system", response_model=ChartResponse)
async def calculate_multi_system(data: BirthData, house_system: str = Query("P")):
    """Calculate a multi-system astrology chart"""
    request_id = str(uuid.uuid4())[:8]
    logger.info(f"[{request_id}] Multi-system chart calculation started")
    
    try:
        # Import here to avoid import issues at startup
        from astro.calculations.chart import calculate_multi_system_chart
        
        # Log the request
        logger.debug(f"[{request_id}] Data: {data.model_dump()}")
        
        # Calculate chart
        chart_data = calculate_multi_system_chart(
            data.year, data.month, data.day, 
            data.hour, data.minute,
            city=data.city,
            house_system=house_system
        )
        
        logger.info(f"[{request_id}] Chart calculated successfully")
        return {"chart": chart_data}
        
    except Exception as e:
        logger.error(f"[{request_id}] Error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Chart calculation failed: {str(e)}")

# Simple numerology endpoint
@app.post("/calculate-numerology", response_model=NumerologyResponse)
async def calculate_numerology_endpoint(data: NumerologyData):
    """Calculate numerology analysis"""
    request_id = str(uuid.uuid4())[:8]
    logger.info(f"[{request_id}] Numerology calculation started")
    
    try:
        # Import here to avoid import issues at startup
        from astro.calculations.numerology import calculate_numerology
        
        # Parse birth date
        birth_date = datetime.strptime(data.birth_date, "%Y-%m-%d")
        
        # Calculate numerology
        numerology_data = calculate_numerology(data.name, birth_date)
        
        logger.info(f"[{request_id}] Numerology calculated successfully")
        return {"numerology": numerology_data}
        
    except Exception as e:
        logger.error(f"[{request_id}] Error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Numerology calculation failed: {str(e)}")

# Health check endpoint
@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "ok", "message": "CosmicHub API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
