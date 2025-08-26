"""
Debug routes for testing API issues
"""
from typing import Dict, Any
from fastapi import APIRouter, Response
import json

router = APIRouter(prefix="/debug", tags=["debug"])

@router.get("/simple")
async def simple_debug() -> Dict[str, str]:
    """Simplest possible endpoint"""
    return {"status": "ok", "message": "Debug endpoint working"}

@router.get("/charts-mock")
async def debug_charts_mock() -> Dict[str, Any]:
    """Mock the charts response without any dependencies"""
    return {
        "charts": [],
        "total": 0,
        "has_more": False,
        "debug": "mock_success"
    }

@router.get("/raw-response")
async def debug_raw_response() -> Response:
    """Return raw JSON to test serialization"""
    response_data: Dict[str, Any] = {
        "test": "raw response",
        "working": True,
        "charts": []
    }
    return Response(
        content=json.dumps(response_data),
        media_type="application/json"
    )
