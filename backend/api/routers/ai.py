# backend/api/routers/ai.py
import logging
import json
import asyncio
from typing import Dict, Any, Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
import uuid

# Import interpretation functions
from astro.calculations.ai_interpretations import generate_interpretation

logger = logging.getLogger(__name__)

# Mock auth function for development (same as main.py)
def get_current_user() -> str:
    return "elite_user_dev_123"

router = APIRouter()

class WebSocketMessage(BaseModel):
    type: str
    data: Dict[str, Any]
    user_id: Optional[str] = None
    session_id: Optional[str] = None

class ConnectionManager:
    """Manages WebSocket connections"""
    
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.user_sessions: Dict[str, str] = {}  # user_id -> session_id mapping
    
    async def connect(self, websocket: WebSocket, user_id: str, session_id: str):
        """Accept WebSocket connection and store it"""
        await websocket.accept()
        self.active_connections[session_id] = websocket
        self.user_sessions[user_id] = session_id
        logger.info(f"WebSocket connected: user_id={user_id}, session_id={session_id}")
    
    def disconnect(self, session_id: str, user_id: str):
        """Remove WebSocket connection"""
        if session_id in self.active_connections:
            del self.active_connections[session_id]
        if user_id in self.user_sessions:
            del self.user_sessions[user_id]
        logger.info(f"WebSocket disconnected: user_id={user_id}, session_id={session_id}")
    
    async def send_message(self, session_id: str, message: Dict[str, Any]):
        """Send message to specific session"""
        if session_id in self.active_connections:
            websocket = self.active_connections[session_id]
            try:
                await websocket.send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Error sending message to {session_id}: {str(e)}")
                # Remove broken connection
                del self.active_connections[session_id]
    
    async def send_streaming_chunk(self, session_id: str, chunk: str, chunk_type: str = "text"):
        """Send streaming text chunk"""
        message: Dict[str, Any] = {
            "type": "stream_chunk",
            "data": {
                "chunk": chunk,
                "chunk_type": chunk_type
            }
        }
        await self.send_message(session_id, message)
    
    async def send_error(self, session_id: str, error: str):
        """Send error message"""
        message: Dict[str, Any] = {
            "type": "error",
            "data": {
                "error": error
            }
        }
        await self.send_message(session_id, message)
    
    async def send_completion(self, session_id: str):
        """Send completion signal"""
        message: Dict[str, Any] = {
            "type": "complete",
            "data": {}
        }
        await self.send_message(session_id, message)

# Global connection manager instance
manager = ConnectionManager()

@router.websocket("/ai/interpret")
async def websocket_ai_interpret(websocket: WebSocket):
    """
    WebSocket endpoint for real-time AI interpretation
    Expected message format:
    {
        "type": "interpret",
        "data": {
            "chart_data": {...},
            "interpretation_type": "advanced",
            "user_token": "bearer_token"
        }
    }
    """
    session_id = str(uuid.uuid4())
    user_id = None
    
    try:
        # Accept connection initially
        await websocket.accept()
        logger.info(f"WebSocket connection established: session_id={session_id}")
        
        # Send connection acknowledgment
        await websocket.send_text(json.dumps({
            "type": "connected", 
            "data": {"session_id": session_id}
        }))
        
        while True:
            try:
                # Receive message from client
                data = await websocket.receive_text()
                message_data: Dict[str, Any] = json.loads(data)
                
                # Validate message structure
                if not isinstance(message_data, dict) or "type" not in message_data:
                    await websocket.send_text(json.dumps({
                        "type": "error",
                        "data": {"error": "Invalid message format"}
                    }))
                    continue
                
                message_type = message_data["type"]
                message_content: Dict[str, Any] = message_data.get("data", {})
                
                # Handle authentication for interpretation requests
                if message_type == "interpret":
                    user_token = message_content.get("user_token")
                    if not user_token:
                        await websocket.send_text(json.dumps({
                            "type": "error",
                            "data": {"error": "Authentication token required"}
                        }))
                        continue
                    
                    # Mock authentication for development (replace with real auth)
                    try:
                        # In production, validate the token properly
                        user_id = "elite_user_dev_123"  # Mock user for development
                        
                        # Register the authenticated connection
                        manager.active_connections[session_id] = websocket
                        manager.user_sessions[user_id] = session_id
                        
                        # Process interpretation request
                        await process_interpretation_request(session_id, message_content)
                        
                    except Exception as e:
                        logger.error(f"Authentication error: {str(e)}")
                        await websocket.send_text(json.dumps({
                            "type": "error",
                            "data": {"error": "Authentication failed"}
                        }))
                        continue
                
                elif message_type == "ping":
                    # Handle ping/keepalive
                    await websocket.send_text(json.dumps({
                        "type": "pong",
                        "data": {}
                    }))
                
                else:
                    await websocket.send_text(json.dumps({
                        "type": "error",
                        "data": {"error": f"Unknown message type: {message_type}"}
                    }))
                    
            except json.JSONDecodeError:
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "data": {"error": "Invalid JSON format"}
                }))
            except Exception as e:
                logger.error(f"Error processing message: {str(e)}")
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "data": {"error": "Internal server error"}
                }))
                
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected: session_id={session_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
    finally:
        # Clean up connection
        if user_id:
            manager.disconnect(session_id, user_id)

async def process_interpretation_request(session_id: str, message_data: Dict[str, Any]):
    """Process AI interpretation request with streaming response"""
    try:
        chart_data = message_data.get("chart_data")
        interpretation_type = message_data.get("interpretation_type", "advanced")
        
        if not chart_data:
            await manager.send_error(session_id, "Chart data is required")
            return
        
        # Send processing start notification
        await manager.send_message(session_id, {
            "type": "processing_start",
            "data": {"interpretation_type": interpretation_type}
        })
        
        # Generate interpretation with streaming
        async for chunk in generate_interpretation_stream(chart_data, interpretation_type):
            await manager.send_streaming_chunk(session_id, chunk)
            # Small delay to simulate real-time streaming
            await asyncio.sleep(0.05)
        
        # Send completion signal
        await manager.send_completion(session_id)
        
    except Exception as e:
        logger.error(f"Error processing interpretation: {str(e)}")
        await manager.send_error(session_id, f"Interpretation failed: {str(e)}")

async def generate_interpretation_stream(chart_data: Dict[str, Any], interpretation_type: str):
    """Generate interpretation with streaming text chunks"""
    try:
        # Get the full interpretation first
        interpretation_result = generate_interpretation(chart_data, interpretation_type)
        
        # If the result contains formatted text, stream it
        if isinstance(interpretation_result, dict):
            # Stream different sections of the interpretation
            sections = [
                ("Core Identity", interpretation_result.get("core_identity", {})),
                ("Life Purpose", interpretation_result.get("life_purpose", {})),
                ("Relationship Patterns", interpretation_result.get("relationship_patterns", {})),
                ("Career Path", interpretation_result.get("career_path", {})),
                ("Growth Challenges", interpretation_result.get("growth_challenges", {})),
                ("Spiritual Gifts", interpretation_result.get("spiritual_gifts", {}))
            ]
            
            for section_name, section_data in sections:
                if section_data:
                    yield f"\n## {section_name}\n\n"
                    
                    # Stream subsections
                    for key, value in section_data.items():
                        if isinstance(value, dict):
                            yield f"### {key.replace('_', ' ').title()}\n"
                            for subkey, subvalue in value.items():
                                subkey: str  # type: ignore
                                subvalue: Any  # type: ignore
                                if isinstance(subvalue, str):
                                    yield f"**{subkey.replace('_', ' ').title()}:** {subvalue}\n\n"
                                elif isinstance(subvalue, list):
                                    yield f"**{subkey.replace('_', ' ').title()}:**\n"
                                    for item in subvalue:  # type: Any
                                        yield f"• {item}\n"
                                    yield "\n"
                        elif isinstance(value, str):
                            yield f"**{key.replace('_', ' ').title()}:** {value}\n\n"
                        elif isinstance(value, list):
                            yield f"**{key.replace('_', ' ').title()}:**\n"
                            for item in value:
                                yield f"• {item}\n"
                            yield "\n"
        else:
            # If it's a simple string, stream it word by word
            words = str(interpretation_result).split()
            for i, word in enumerate(words):
                if i > 0:
                    yield " "
                yield word
                
    except Exception as e:
        logger.error(f"Error in interpretation streaming: {str(e)}")
        yield f"Error generating interpretation: {str(e)}"

@router.get("/ai/health")
async def ai_health_check():
    """Health check for AI service"""
    return {
        "status": "healthy", 
        "active_connections": len(manager.active_connections),
        "service": "AI Interpretation WebSocket"
    }

