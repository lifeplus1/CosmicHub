"""
Minimal main app to isolate middleware issues
"""
import os
os.environ["TEST_MODE"] = "1"

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Create the most minimal possible version of the main app
minimal_app = FastAPI(title="Minimal CosmicHub")

# Add only CORS middleware
minimal_app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@minimal_app.get("/health")
async def health():
    return {"status": "ok", "app": "minimal"}

@minimal_app.get("/test")
async def test_endpoint():
    return {"message": "minimal app works", "middleware": "cors_only"}

# Add the debug router
from api.debug import router as debug_router
minimal_app.include_router(debug_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(minimal_app, host="0.0.0.0", port=8003, reload=False)
