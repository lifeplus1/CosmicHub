"""
Debug endpoint to isolate the charts API issue
"""
from typing import Dict, Any
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
import json

# Create a minimal FastAPI app with only CORS
debug_app = FastAPI(title="Debug Charts API")

debug_app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@debug_app.get("/debug/charts")
async def debug_charts() -> Dict[str, Any]:
    """Simple debug endpoint without any middleware or dependencies"""
    return {"charts": [], "total": 0, "debug": "success"}

@debug_app.get("/debug/charts/raw")
async def debug_charts_raw() -> Response:
    """Even simpler - return raw JSON response"""
    response_data: Dict[str, Any] = {
        "charts": [],
        "total": 0,
        "debug": "raw_success",
        "message": "This endpoint works without any authentication or middleware"
    }
    return Response(
        content=json.dumps(response_data),
        media_type="application/json"
    )

@debug_app.get("/health")
async def debug_health() -> Dict[str, Any]:
    """Simple health check"""
    return {"status": "ok", "debug": True}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(debug_app, host="0.0.0.0", port=8002, reload=False)
