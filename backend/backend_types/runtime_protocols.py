"""Runtime protocols and TypedDicts to improve type safety across dynamic service layers."""
from __future__ import annotations
from typing import Protocol, runtime_checkable, Any, Dict, List, Optional, TypedDict

class FirestoreDocumentRef(Protocol):  # pragma: no cover - structural typing only
    id: str
    def get(self) -> 'FirestoreDocumentSnapshot': ...
    def set(self, data: Dict[str, Any], merge: bool | None = None) -> Any: ...
    def update(self, data: Dict[str, Any]) -> Any: ...
    def collection(self, name: str) -> 'FirestoreCollectionRef': ...

class FirestoreCollectionRef(Protocol):  # pragma: no cover
    def document(self, doc_id: Optional[str] = None) -> FirestoreDocumentRef: ...
    def order_by(self, field: str, direction: Any = None) -> 'FirestoreQuery': ...

class FirestoreQuery(Protocol):  # pragma: no cover
    def limit(self, n: int) -> 'FirestoreQuery': ...
    def stream(self) -> List['FirestoreDocumentSnapshot']: ...
    def start_after(self, doc: 'FirestoreDocumentSnapshot') -> 'FirestoreQuery': ...

class FirestoreDocumentSnapshot(Protocol):  # pragma: no cover
    @property
    def exists(self) -> bool: ...
    def to_dict(self) -> Dict[str, Any] | None: ...

class FirestoreClient(Protocol):  # pragma: no cover
    def collection(self, name: str) -> FirestoreCollectionRef: ...

# ----- TypedDicts for clearer structures -----
class SubscriptionData(TypedDict, total=False):
    plan_id: str
    is_active: bool
    stripe_status: str
    stripe_customer_id: str
    stripe_subscription_id: str
    current_period_end: str
    updated_at: str

class ChartRecord(TypedDict):
    id: str
    name: str
    birth_date: str
    birth_time: str
    birth_location: str
    chart_type: str
    birth_data: Dict[str, Any]
    chart_data: Dict[str, Any]
    created_at: str
    updated_at: str

# ----- Payments / Subscription Support -----
class SubscriptionPlan(TypedDict, total=True):
    price_id: Optional[str]
    features: List[str]
    name: str
    price: float

# ----- Analytics Metrics -----
class RealTimeMetrics(TypedDict, total=True):
    realTimeUsers: int
    chartCalculationsPerMinute: int
    aiInteractionsPerHour: int
    mobileAppSessions: int
    subscriptionConversions: int
    errorRate: float
    averageResponseTime: float
    averageSessionDurationMs: float

class AstrologyAnalyticsResponse(TypedDict, total=True):
    chartCalculations: Dict[str, int]
    aiFeatureUsage: Dict[str, int]
    userPreferences: Dict[str, Any]

__all__ = [
    'FirestoreClient','FirestoreCollectionRef','FirestoreDocumentRef','FirestoreQuery','FirestoreDocumentSnapshot',
    'SubscriptionData','ChartRecord','SubscriptionPlan','RealTimeMetrics','AstrologyAnalyticsResponse'
]
