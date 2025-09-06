"""
Analytics API endpoints for CosmicHub
FastAPI routes for analytics data and real-time dashboards
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks, Query
from pydantic import BaseModel
from typing import Dict, Any, Optional, List, Literal
from datetime import datetime

from .custom_analytics import get_analytics_service, AnalyticsEvent

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

class TrackEventRequest(BaseModel):
    """
    Request model for tracking user analytics events.
    
    Used to capture user interactions and behaviors for analytics processing,
    helping understand user engagement and platform usage patterns.
    
    Attributes:
        event: Event name/type (e.g., "chart_calculated", "subscription_started")
        user_id: Optional authenticated user identifier
        session_id: Unique session identifier for anonymous tracking
        timestamp: Unix timestamp when the event occurred
        platform: Platform identifier ("web", "mobile", "api")
        properties: Additional event-specific data and context
        
    Example:
        {
            "event": "chart_calculated",
            "user_id": "user_123",
            "session_id": "session_abc456",
            "timestamp": 1693920000,
            "platform": "web",
            "properties": {
                "chart_type": "natal",
                "calculation_time_ms": 1250,
                "house_system": "placidus"
            }
        }
    """
    event: str
    user_id: Optional[str] = None
    session_id: str
    timestamp: int
    platform: str
    properties: Dict[str, Any]


class ConsentUpdateRequest(BaseModel):
    """
    Request model for updating user privacy consent preferences.
    
    Handles GDPR and privacy compliance by tracking user consent
    for different types of data collection and processing.
    
    Attributes:
        user_id: Optional user identifier (may be None for anonymous users)
        consent_type: Type of consent ("analytics", "marketing", "essential")
        granted: Whether consent was granted (True) or revoked (False)
        consent_version: Version of the consent policy/terms
        
    Example:
        {
            "user_id": "user_123",
            "consent_type": "analytics",
            "granted": true,
            "consent_version": "2023.1"
        }
    """
    user_id: Optional[str] = None
    consent_type: str
    granted: bool
    consent_version: str


# --- Response Models ---
class SuccessMessage(BaseModel):
    """
    Standard success response for API operations.
    
    Generic response model indicating successful completion of an operation
    with an optional descriptive message.
    
    Attributes:
        success: Boolean indicating operation success
        message: Human-readable success message
        
    Example:
        {
            "success": true,
            "message": "Event tracked successfully"
        }
    """
    success: bool
    message: str


class ConversionRates(BaseModel):
    """
    Conversion rates at different stages of the user funnel.
    
    Tracks the percentage of users converting between key stages
    in the customer journey from visitor to paying subscriber.
    
    Attributes:
        visitorToSignup: Percentage of visitors who create accounts (0.0-1.0)
        signupToTrial: Percentage of signups who start trials (0.0-1.0) 
        trialToSubscription: Percentage of trials who become subscribers (0.0-1.0)
        visitorToSubscription: Overall conversion rate visitor to subscriber (0.0-1.0)
        
    Example:
        {
            "visitorToSignup": 0.15,
            "signupToTrial": 0.45,
            "trialToSubscription": 0.25,
            "visitorToSubscription": 0.017
        }
    """
    visitorToSignup: float
    signupToTrial: float
    trialToSubscription: float
    visitorToSubscription: float


class ConversionFunnelResponse(BaseModel):
    """
    Complete conversion funnel metrics with counts and rates.
    
    Provides both absolute numbers and conversion rates for each stage
    of the user acquisition and conversion process.
    
    Attributes:
        totalVisitors: Total number of unique visitors
        signups: Number of users who created accounts
        trialStarts: Number of users who started trials
        subscriptions: Number of users who became paid subscribers
        conversionRates: Calculated conversion rates between stages
        
    Example:
        {
            "totalVisitors": 10000,
            "signups": 1500,
            "trialStarts": 675,
            "subscriptions": 169,
            "conversionRates": {...}
        }
    """
    totalVisitors: int
    signups: int
    trialStarts: int
    subscriptions: int
    conversionRates: ConversionRates


class PerformanceChartCalculationTimes(BaseModel):
    natal: int
    transit: int
    synastry: int


class PerformanceAIResponseTimes(BaseModel):
    average: int
    p95: int
    p99: int


class PerformanceErrorRates(BaseModel):
    chartCalculations: float
    aiInteractions: float
    general: float


class PerformanceMetricsResponse(BaseModel):
    averagePageLoadTime: int
    chartCalculationTimes: PerformanceChartCalculationTimes
    aiResponseTimes: PerformanceAIResponseTimes
    errorRates: PerformanceErrorRates


class UserSegment(BaseModel):
    id: str
    name: str
    criteria: Dict[str, str]
    users: int
    conversionRate: float
    averageLifetimeValue: int


class HealthCheckResponse(BaseModel):
    status: str
    timestamp: str

@router.post("/track", response_model=SuccessMessage)
async def track_event(request: TrackEventRequest, background_tasks: BackgroundTasks) -> SuccessMessage:
    """Track analytics event"""
    try:
        analytics = get_analytics_service()
        
        event = AnalyticsEvent(
            event=request.event,
            user_id=request.user_id,
            session_id=request.session_id,
            timestamp=request.timestamp,
            platform=request.platform,
            properties=request.properties
        )
        
        # Process in background to not block response
        background_tasks.add_task(analytics.track_event, event)
        return SuccessMessage(success=True, message="Event tracked successfully")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to track event: {str(e)}")

@router.get("/realtime")
async def get_realtime_metrics() -> Dict[str, Any]:
    """Get real-time dashboard metrics"""
    try:
        analytics = get_analytics_service()
        metrics = await analytics.get_real_time_metrics()
        return metrics
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get real-time metrics: {str(e)}")

@router.get("/daily")
async def get_daily_metrics(date: str | None = Query(None, description="ISO date (YYYY-MM-DD); defaults to today")) -> Dict[str, Any]:
    """Fetch aggregated daily metrics row."""
    try:
        analytics = get_analytics_service()
        data = analytics.get_daily_metrics(date)
        return { 'metrics': data }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get daily metrics: {str(e)}")

@router.get("/sessions/summary")
async def get_session_summary(limit: int = Query(20, ge=1, le=200)) -> Dict[str, Any]:
    """Return recent session summary (limited)."""
    try:
        analytics = get_analytics_service()
        import sqlite3
        with sqlite3.connect(analytics.db_path) as conn:
            rows = conn.execute(
                """
                SELECT session_id, user_id, start_time, end_time, page_views, events_count, total_duration_ms
                FROM user_sessions
                ORDER BY COALESCE(last_event_time, end_time, start_time) DESC
                LIMIT ?
                """, (limit,)
            ).fetchall()
        sessions = [
            {
                'sessionId': r[0],
                'userId': r[1],
                'startTime': r[2],
                'endTime': r[3],
                'pageViews': r[4],
                'events': r[5],
                'totalDurationMs': r[6]
            } for r in rows
        ]
        return { 'sessions': sessions }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get session summary: {str(e)}")

@router.get("/astrology")
async def get_astrology_analytics(timeframe: Literal["day", "week", "month", "year"] = "week") -> Dict[str, Any]:
    """Get astrology-specific analytics"""
    if timeframe not in ["day", "week", "month", "year"]:
        raise HTTPException(status_code=400, detail="Invalid timeframe. Use: day, week, month, year")
    
    try:
        analytics = get_analytics_service()
        data = await analytics.get_astrology_analytics(timeframe)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get astrology analytics: {str(e)}")

@router.get("/conversion-funnel", response_model=ConversionFunnelResponse)
async def get_conversion_funnel() -> ConversionFunnelResponse:
    """Get conversion funnel data"""
    # This would implement actual conversion funnel calculation
    # For now, return mock data structure
    return ConversionFunnelResponse(
        totalVisitors=1000,
        signups=150,
        trialStarts=75,
        subscriptions=25,
        conversionRates=ConversionRates(
            visitorToSignup=0.15,
            signupToTrial=0.50,
            trialToSubscription=0.33,
            visitorToSubscription=0.025,
        ),
    )

@router.get("/performance", response_model=PerformanceMetricsResponse)
async def get_performance_metrics() -> PerformanceMetricsResponse:
    """Get performance metrics"""
    return PerformanceMetricsResponse(
        averagePageLoadTime=1200,
        chartCalculationTimes=PerformanceChartCalculationTimes(
            natal=450,
            transit=620,
            synastry=890,
        ),
        aiResponseTimes=PerformanceAIResponseTimes(
            average=2300,
            p95=4500,
            p99=8000,
        ),
        errorRates=PerformanceErrorRates(
            chartCalculations=0.02,
            aiInteractions=0.01,
            general=0.005,
        ),
    )

@router.get("/segments", response_model=List[UserSegment])
async def get_user_segments() -> List[UserSegment]:
    """Get user segments"""
    return [
        UserSegment(
            id="new_users",
            name="New Users",
            criteria={"days_since_signup": "<7"},
            users=150,
            conversionRate=0.12,
            averageLifetimeValue=0,
        ),
        UserSegment(
            id="power_users",
            name="Power Users",
            criteria={"charts_per_week": ">5"},
            users=45,
            conversionRate=0.78,
            averageLifetimeValue=120,
        ),
        UserSegment(
            id="ai_enthusiasts",
            name="AI Enthusiasts",
            criteria={"ai_interactions_per_week": ">10"},
            users=89,
            conversionRate=0.65,
            averageLifetimeValue=95,
        ),
    ]

@router.post("/consent", response_model=SuccessMessage)
async def update_consent(request: ConsentUpdateRequest) -> SuccessMessage:
    """Update user consent preferences"""
    try:
        # In a real implementation, this would update user consent in database
        # and potentially trigger data cleanup if consent is revoked
        
        return SuccessMessage(
            success=True,
            message=f"Consent for {request.consent_type} updated to {request.granted}",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update consent: {str(e)}")

@router.delete("/user-data/{user_id}", response_model=SuccessMessage)
async def delete_user_data(user_id: str) -> SuccessMessage:
    """Delete user data (GDPR compliance)."""
    try:
        analytics = get_analytics_service()
        result = analytics.delete_user_data(user_id)
        return SuccessMessage(
            success=True,
            message=f"Deleted {result['eventsDeleted']} events and {result['sessionsDeleted']} sessions for user {user_id}",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete user data: {str(e)}")

@router.post("/cleanup", response_model=SuccessMessage)
async def cleanup_old_data(background_tasks: BackgroundTasks, retention_days: int = 365) -> SuccessMessage:
    """Clean up old analytics data"""
    try:
        analytics = get_analytics_service()
        background_tasks.add_task(analytics.cleanup_old_data, retention_days)
        
        return SuccessMessage(
            success=True,
            message=f"Data cleanup initiated for data older than {retention_days} days",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to initiate cleanup: {str(e)}")

# Health check endpoint
@router.get("/health", response_model=HealthCheckResponse)
async def health_check() -> HealthCheckResponse:
    """Analytics service health check"""
    try:
        analytics = get_analytics_service()
        # Simple check by getting metrics (this also tests database connection)
        await analytics.get_real_time_metrics()
        return HealthCheckResponse(status="healthy", timestamp=datetime.now().isoformat())
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Analytics service unhealthy: {str(e)}")

# Export the router for import in main.py
__all__ = ["router"]
