"""
Analytics WebSocket Handler
Real-time analytics updates for dashboard
"""

from fastapi import WebSocket, WebSocketDisconnect
from typing import (
    List,
    Dict,
    Any,
    Optional,
    TypedDict,
    Literal,
    Union,
    Protocol,
    runtime_checkable,
)
import json
import asyncio
import logging
from datetime import datetime

# Import here to avoid circular imports
from .custom_analytics import get_analytics_service

logger = logging.getLogger(__name__)

TimestampMs = int

class ConnectionEstablishedMessage(TypedDict):
    type: Literal["connection_established"]
    data: Dict[str, Any]
    timestamp: TimestampMs

class RealtimeUpdateMessage(TypedDict):
    type: Literal["realtime_update"]
    data: Dict[str, Any]
    timestamp: TimestampMs

class AlertMessage(TypedDict):
    type: Literal["alert"]
    data: Dict[str, Any]
    timestamp: TimestampMs

class ErrorMessage(TypedDict):
    type: Literal["error"]
    data: Dict[str, Any]
    timestamp: TimestampMs

class SubscriptionConfirmedMessage(TypedDict):
    type: Literal["subscription_confirmed"]
    data: Dict[str, List[str]]
    timestamp: TimestampMs

class UnsubscriptionConfirmedMessage(TypedDict):
    type: Literal["unsubscription_confirmed"]
    timestamp: TimestampMs

class PongMessage(TypedDict):
    type: Literal["pong"]
    timestamp: TimestampMs

class PingMessage(TypedDict):
    type: Literal["ping"]
    timestamp: TimestampMs

OutgoingMessage = Union[
    ConnectionEstablishedMessage,
    RealtimeUpdateMessage,
    AlertMessage,
    ErrorMessage,
    SubscriptionConfirmedMessage,
    UnsubscriptionConfirmedMessage,
    PongMessage,
    PingMessage,
]

@runtime_checkable
class SupportsSend(Protocol):  # pragma: no cover - structural typing
    async def send_text(self, data: str) -> Any: ...


class AnalyticsWebSocketManager:
    """Manages connected analytics WebSocket clients.

    Provides basic broadcast, per-client messaging, and heartbeat support.
    Safe against connection failures; failed connections are removed.
    """

    def __init__(self, max_connections: int = 1000) -> None:
        self.active_connections: List[WebSocket] = []
        self.connection_ids: Dict[WebSocket, str] = {}
        self.max_connections = max_connections

    async def connect(self, websocket: WebSocket, client_id: Optional[str] = None) -> None:
        if len(self.active_connections) >= self.max_connections:
            await websocket.close(code=1008)  # Policy violation
            logger.warning(f"Connection rejected: maximum connections ({self.max_connections}) reached")
            return
        
        await websocket.accept()
        self.active_connections.append(websocket)
        if client_id:
            self.connection_ids[websocket] = client_id
        logger.info(f"Analytics WebSocket client connected: {client_id or 'anonymous'} ({len(self.active_connections)}/{self.max_connections})")

    def disconnect(self, websocket: WebSocket) -> None:
        self.active_connections.remove(websocket)
        if websocket in self.connection_ids:
            client_id = self.connection_ids.pop(websocket)
            logger.info(f"Analytics WebSocket client disconnected: {client_id}")

    async def send_personal_message(self, message: OutgoingMessage, websocket: WebSocket) -> None:
        try:
            await websocket.send_text(json.dumps(message))
        except Exception as e:
            logger.error(f"Failed to send personal message: {e}")

    async def broadcast(self, message: OutgoingMessage) -> None:
        """Broadcast message to all connected clients.

        Silently skips if there are no active connections.
        Failed connections are removed from the active set.
        """
        if not self.active_connections:
            return

        message_str = json.dumps(message)
        
        # Send messages concurrently for better performance
        tasks: List[asyncio.Task[None]] = []
        for connection in self.active_connections:
            task = asyncio.create_task(connection.send_text(message_str))
            tasks.append(task)
        
        # Gather results and handle exceptions
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Clean up any connections that failed
        disconnected: List[WebSocket] = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                logger.error(f"Failed to broadcast to connection {i}: {result}")
                disconnected.append(self.active_connections[i])

        # Clean up disconnected clients
        for connection in disconnected:
            self.disconnect(connection)

    async def broadcast_realtime_update(self, metrics: Dict[str, Any]) -> None:
        """Broadcast real-time metrics update."""
        message: RealtimeUpdateMessage = {
            "type": "realtime_update",
            "data": metrics,
            "timestamp": int(datetime.now().timestamp() * 1000),
        }
        await self.broadcast(message)

    async def broadcast_alert(self, alert_type: str, message: str, data: Optional[Dict[str, Any]] = None) -> None:
        """Broadcast system alert."""
        alert_msg: AlertMessage = {
            "type": "alert",
            "data": {
                "alert_type": alert_type,
                "message": message,
                "data": data or {},
            },
            "timestamp": int(datetime.now().timestamp() * 1000),
        }
        await self.broadcast(alert_msg)

    async def broadcast_error(self, error_message: str, error_data: Optional[Dict[str, Any]] = None) -> None:
        """Broadcast error notification."""
        error_msg: ErrorMessage = {
            "type": "error",
            "data": {"message": error_message, "data": error_data or {}},
            "timestamp": int(datetime.now().timestamp() * 1000),
        }
        await self.broadcast(error_msg)

    def get_connection_count(self) -> int:
        """Get number of active connections"""
        return len(self.active_connections)

    async def send_heartbeat(self) -> None:
        """Send heartbeat ping to all connected clients."""
        heartbeat: PingMessage = {
            "type": "ping",
            "timestamp": int(datetime.now().timestamp() * 1000),
        }
        for connection in self.active_connections[:]:  # Copy to avoid modification during iteration
            try:
                await self.send_personal_message(heartbeat, connection)
            except Exception as e:  # pragma: no cover - defensive
                logger.error(f"Failed to send heartbeat to connection: {e}")
                self.disconnect(connection)

# Global WebSocket manager instance
analytics_ws_manager = AnalyticsWebSocketManager()

# Background task reference for proper cancellation
_background_task: Optional[asyncio.Task[None]] = None

async def analytics_websocket_endpoint(websocket: WebSocket) -> None:
    """WebSocket endpoint for analytics dashboard"""
    client_id = websocket.query_params.get("client_id")
    await analytics_ws_manager.connect(websocket, client_id)
    
    try:
        # Send initial connection confirmation
        init_msg: ConnectionEstablishedMessage = {
            "type": "connection_established",
            "data": {
                "client_id": client_id,
                "connected_at": datetime.now().isoformat(),
            },
            "timestamp": int(datetime.now().timestamp() * 1000),
        }
        await analytics_ws_manager.send_personal_message(init_msg, websocket)

        # Keep connection alive and handle incoming messages
        while True:
            try:
                # Wait for messages (if any)
                message = await websocket.receive_text()
                data = json.loads(message)
                
                # Handle different message types
                if data.get("type") == "ping":
                    pong: PongMessage = {
                        "type": "pong",
                        "timestamp": int(datetime.now().timestamp() * 1000),
                    }
                    await analytics_ws_manager.send_personal_message(pong, websocket)
                elif data.get("type") == "pong":
                    # Client responded to our ping - connection is healthy
                    logger.debug(f"Received pong from client: {client_id or 'anonymous'}")
                elif data.get("type") == "subscribe":
                    # Handle subscription to specific metrics
                    subscription_data = data.get("data", {})
                    metric_types = subscription_data.get("metrics", [])
                    if isinstance(metric_types, list) and metric_types:
                        # Validate all metrics are strings
                        valid_metrics = True
                        for item in metric_types:  # type: ignore
                            if not isinstance(item, str):
                                valid_metrics = False
                                break
                        
                        if valid_metrics:
                            confirm: SubscriptionConfirmedMessage = {
                                "type": "subscription_confirmed",
                                "data": {"metrics": metric_types},
                                "timestamp": int(datetime.now().timestamp() * 1000),
                            }
                            await analytics_ws_manager.send_personal_message(confirm, websocket)
                        else:
                            err_msg: ErrorMessage = {
                                "type": "error",
                                "data": {"message": "Invalid subscription format. All metrics must be strings."},
                                "timestamp": int(datetime.now().timestamp() * 1000),
                            }
                            await analytics_ws_manager.send_personal_message(err_msg, websocket)
                elif data.get("type") == "unsubscribe":
                    # Handle unsubscription
                    unsub: UnsubscriptionConfirmedMessage = {
                        "type": "unsubscription_confirmed",
                        "timestamp": int(datetime.now().timestamp() * 1000),
                    }
                    await analytics_ws_manager.send_personal_message(unsub, websocket)
                else:
                    unknown_err: ErrorMessage = {
                        "type": "error",
                        "data": {"message": f"Unknown message type: {data.get('type')}"},
                        "timestamp": int(datetime.now().timestamp() * 1000),
                    }
                    await analytics_ws_manager.send_personal_message(unknown_err, websocket)
                    
            except json.JSONDecodeError:
                json_err: ErrorMessage = {
                    "type": "error",
                    "data": {"message": "Invalid JSON message"},
                    "timestamp": int(datetime.now().timestamp() * 1000),
                }
                await analytics_ws_manager.send_personal_message(json_err, websocket)
            except Exception as e:
                logger.error(f"Error handling WebSocket message: {e}")
                break

    except WebSocketDisconnect:
        analytics_ws_manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        analytics_ws_manager.disconnect(websocket)

# Background task to send periodic updates
async def start_analytics_broadcast_task() -> None:
    """Background task that broadcasts real-time updates"""
    last_heartbeat: float = 0.0
    heartbeat_interval = 60  # Send heartbeat every 60 seconds
    
    while True:
        try:
            current_time = asyncio.get_event_loop().time()
            
            # Send heartbeat if enough time has passed
            if current_time - last_heartbeat >= heartbeat_interval:
                await analytics_ws_manager.send_heartbeat()
                last_heartbeat = current_time
            
            # Send analytics updates if there are connections
            if analytics_ws_manager.get_connection_count() > 0:
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
def start_analytics_websocket_task() -> None:
    """Start the analytics WebSocket background task"""
    global _background_task
    if _background_task is None or _background_task.done():
        _background_task = asyncio.create_task(start_analytics_broadcast_task())

def stop_analytics_websocket_task() -> None:
    """Stop the analytics WebSocket background task"""
    global _background_task
    if _background_task and not _background_task.done():
        _background_task.cancel()
        _background_task = None
