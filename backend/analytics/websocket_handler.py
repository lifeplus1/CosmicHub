"""
Analytics WebSocket Handler
Real-time analytics updates for dashboard
"""

from fastapi import WebSocket, WebSocketDisconnect
from typing import List, Dict, Any
import json
import asyncio
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class AnalyticsWebSocketManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.connection_ids: Dict[WebSocket, str] = {}

    async def connect(self, websocket: WebSocket, client_id: str = None):
        await websocket.accept()
        self.active_connections.append(websocket)
        if client_id:
            self.connection_ids[websocket] = client_id
        logger.info(f"Analytics WebSocket client connected: {client_id or 'anonymous'}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        if websocket in self.connection_ids:
            client_id = self.connection_ids.pop(websocket)
            logger.info(f"Analytics WebSocket client disconnected: {client_id}")

    async def send_personal_message(self, message: Dict[str, Any], websocket: WebSocket):
        try:
            await websocket.send_text(json.dumps(message))
        except Exception as e:
            logger.error(f"Failed to send personal message: {e}")

    async def broadcast(self, message: Dict[str, Any]):
        """Broadcast message to all connected clients"""
        if not self.active_connections:
            return

        message_str = json.dumps(message)
        disconnected = []
        
        for connection in self.active_connections:
            try:
                await connection.send_text(message_str)
            except Exception as e:
                logger.error(f"Failed to broadcast to connection: {e}")
                disconnected.append(connection)

        # Clean up disconnected clients
        for connection in disconnected:
            self.disconnect(connection)

    async def broadcast_realtime_update(self, metrics: Dict[str, Any]):
        """Broadcast real-time metrics update"""
        await self.broadcast({
            "type": "realtime_update",
            "data": metrics,
            "timestamp": int(datetime.now().timestamp() * 1000)
        })

    async def broadcast_alert(self, alert_type: str, message: str, data: Dict[str, Any] = None):
        """Broadcast system alert"""
        await self.broadcast({
            "type": "alert",
            "data": {
                "alert_type": alert_type,
                "message": message,
                "data": data or {}
            },
            "timestamp": int(datetime.now().timestamp() * 1000)
        })

    async def broadcast_error(self, error_message: str, error_data: Dict[str, Any] = None):
        """Broadcast error notification"""
        await self.broadcast({
            "type": "error",
            "data": {
                "message": error_message,
                "data": error_data or {}
            },
            "timestamp": int(datetime.now().timestamp() * 1000)
        })

    def get_connection_count(self) -> int:
        """Get number of active connections"""
        return len(self.active_connections)

# Global WebSocket manager instance
analytics_ws_manager = AnalyticsWebSocketManager()

async def analytics_websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for analytics dashboard"""
    client_id = websocket.query_params.get("client_id")
    await analytics_ws_manager.connect(websocket, client_id)
    
    try:
        # Send initial connection confirmation
        await analytics_ws_manager.send_personal_message({
            "type": "connection_established",
            "data": {
                "client_id": client_id,
                "connected_at": datetime.now().isoformat()
            },
            "timestamp": int(datetime.now().timestamp() * 1000)
        }, websocket)

        # Keep connection alive and handle incoming messages
        while True:
            try:
                # Wait for messages (if any)
                message = await websocket.receive_text()
                data = json.loads(message)
                
                # Handle different message types
                if data.get("type") == "ping":
                    await analytics_ws_manager.send_personal_message({
                        "type": "pong",
                        "timestamp": int(datetime.now().timestamp() * 1000)
                    }, websocket)
                elif data.get("type") == "subscribe":
                    # Handle subscription to specific metrics
                    pass
                    
            except json.JSONDecodeError:
                await analytics_ws_manager.send_personal_message({
                    "type": "error",
                    "data": {"message": "Invalid JSON message"},
                    "timestamp": int(datetime.now().timestamp() * 1000)
                }, websocket)
            except Exception as e:
                logger.error(f"Error handling WebSocket message: {e}")
                break

    except WebSocketDisconnect:
        analytics_ws_manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        analytics_ws_manager.disconnect(websocket)

# Background task to send periodic updates
async def start_analytics_broadcast_task():
    """Background task that broadcasts real-time updates"""
    while True:
        try:
            if analytics_ws_manager.get_connection_count() > 0:
                # Import here to avoid circular imports
                from .custom_analytics import get_analytics_service
                
                analytics = get_analytics_service()
                if analytics:
                    metrics = await analytics.get_real_time_metrics()
                    await analytics_ws_manager.broadcast_realtime_update(metrics)
                    
            # Wait 30 seconds before next update
            await asyncio.sleep(30)
            
        except Exception as e:
            logger.error(f"Error in analytics broadcast task: {e}")
            await asyncio.sleep(30)  # Continue trying after error

# Start the background task
def start_analytics_websocket_task():
    """Start the analytics WebSocket background task"""
    asyncio.create_task(start_analytics_broadcast_task())
