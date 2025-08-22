# Python Type Safety Improvements

## Overview

This document outlines the improvements made to Python type safety in the CosmicHub backend. Claude
3.7 is particularly effective at handling complex Python type annotations, especially with libraries
that don't provide complete type stubs.

## Key Patterns Addressed

### 1. Third-Party Library Type Annotations

Many type issues in the codebase are related to third-party libraries lacking proper type stubs.
Instead of using `# type: ignore`, we've created specialized type stubs for these libraries:

```python
# Before:
import swisseph as swe  # type: ignore
from prometheus_client import Counter, Histogram  # type: ignore

# After:
import swisseph as swe
from prometheus_client import Counter, Histogram

# In a types/stubs/swisseph.pyi file:
from typing import Any, List, Tuple, Union, Literal

def julday(year: int, month: int, day: int, hour: float) -> float: ...
def calc_ut(jd: float, planet_num: int) -> Tuple[List[float], int]: ...
def houses(jd: float, lat: float, lon: float, hsys: bytes) -> Tuple[List[float], List[float], List[float]]: ...

SUN: int
MOON: int
MERCURY: int
VENUS: int
MARS: int
JUPITER: int
SATURN: int
URANUS: int
NEPTUNE: int
PLUTO: int
```

### 2. Explicit Any Type Usage

For places where `Any` is truly needed, we've replaced it with more descriptive type annotations:

```python
# Before:
from typing import Any, Dict, Optional
decoded_token: Dict[str, Any] = auth.verify_id_token(token)  # type: ignore

# After:
from typing import Any, Dict, Optional, TypedDict, Union

class DecodedToken(TypedDict):
    uid: str
    email: Optional[str]
    name: Optional[str]
    picture: Optional[str]
    auth_time: int
    firebase: Dict[str, str]
    iat: int
    exp: int
    aud: str
    iss: str
    sub: str

decoded_token: DecodedToken = auth.verify_id_token(token)
```

### 3. Type Guards for Better Runtime Safety

We've added Python type guards to improve runtime type safety:

```python
# Before:
def calculate_synastry(request: SynastryRequest):
    planets1, cusps1 = calculate_planets(request.person1)
    # No validation that planets1 and cusps1 have the expected structure

# After:
from typing import TypeGuard, Dict, List, Union, cast

def is_valid_planets(data: object) -> TypeGuard[Dict[str, float]]:
    """Validate that the planets data has the expected structure."""
    if not isinstance(data, dict):
        return False

    required_planets = ['sun', 'moon', 'mercury', 'venus', 'mars',
                        'jupiter', 'saturn', 'uranus', 'neptune', 'pluto']
    return all(planet in data and isinstance(data[planet], float)
               for planet in required_planets)

def is_valid_cusps(data: object) -> TypeGuard[List[float]]:
    """Validate that the cusps data has the expected structure."""
    if not isinstance(data, list):
        return False

    # Expect 12 house cusps
    return len(data) == 12 and all(isinstance(cusp, float) for cusp in data)

def calculate_synastry(request: SynastryRequest):
    planets1_raw, cusps1_raw = calculate_planets(request.person1)

    # Validate and use type guards
    if not is_valid_planets(planets1_raw):
        raise ValueError("Invalid planets data structure")
    planets1 = planets1_raw  # TypeGuard ensures this is Dict[str, float]

    if not is_valid_cusps(cusps1_raw):
        raise ValueError("Invalid cusps data structure")
    cusps1 = cusps1_raw  # TypeGuard ensures this is List[float]
```

### 4. Optional Types and Safe Handling

We've improved the handling of optional values:

```python
# Before:
uid: Optional[str] = decoded_token.get('uid')  # type: ignore
if not uid:
    logger.error("No UID found in decoded token")

# After:
uid: Optional[str] = decoded_token.get('uid')
if uid is None:
    logger.error("No UID found in decoded token")
    raise HTTPException(status_code=401, detail="Invalid token: No UID found")
```

### 5. Generic Type Parameters

We've added proper generic type parameters to improve type inference:

```python
# Before:
_syn_cache: dict[str, tuple[float, dict[str, _Any]]] = {}

# After:
from typing import TypeVar, Generic, Dict, Tuple, Any

T = TypeVar('T')
class CacheEntry(Generic[T]):
    """Type-safe cache entry with timestamp and payload."""
    def __init__(self, timestamp: float, payload: T):
        self.timestamp = timestamp
        self.payload = payload

# Strongly typed cache with proper generics
_syn_cache: Dict[str, CacheEntry[Dict[str, Any]]] = {}
```

## Implementation Details

### Type Stub Files

We've created the following type stub files:

1. `backend/types/stubs/swisseph.pyi` - Type stubs for the Swiss Ephemeris library
2. `backend/types/stubs/prometheus_client.pyi` - Type stubs for Prometheus metrics
3. `backend/types/stubs/firebase_admin.pyi` - Type stubs for Firebase Admin SDK
4. `backend/types/stubs/opentelemetry.pyi` - Type stubs for OpenTelemetry tracing library
5. `backend/types/stubs/opentelemetry/trace.pyi` - Specific types for the trace module
6. `backend/types/stubs/google/cloud/firestore.pyi` - Type stubs for Google Cloud Firestore
7. `backend/types/stubs/google/cloud/storage.pyi` - Type stubs for Google Cloud Storage
8. `backend/types/stubs/google/cloud/pubsub.pyi` - Type stubs for Google Cloud PubSub
9. `backend/types/stubs/google/cloud/exceptions.pyi` - Common exceptions for Google Cloud APIs
10. `backend/types/stubs/google/cloud/secretmanager.pyi` - Type stubs for Google Cloud Secret
    Manager

### Custom Type Definitions

We've added custom type definitions for domain-specific concepts:

```python
# backend/types/synastry.py
from typing import Dict, List, TypedDict, Optional

class AspectData(TypedDict):
    planet1: str
    planet2: str
    aspect_type: str
    orb: float
    influence: str

class HouseOverlay(TypedDict):
    planet: str
    house: int
    influence: str
    strength: float

class CompatibilityScore(TypedDict):
    overall: float
    emotional: float
    communication: float
    values: float
    activities: float
    growth: float
```

### Using Google Cloud Type Stubs

With our comprehensive type stubs for Google Cloud services, Python code that interacts with these
libraries now has proper type checking:

```python
# Before:
from google.cloud import firestore  # type: ignore
from typing import Any, Dict

def get_user_data(user_id: str) -> Dict[str, Any]:
    db = firestore.Client()
    user_ref = db.collection('users').document(user_id)
    user_doc = user_ref.get()
    if user_doc.exists:
        return user_doc.to_dict()  # No type information about the return value
    return {}

# After:
from google.cloud import firestore
from typing import Dict, TypedDict, Optional

class UserData(TypedDict):
    """User data stored in Firestore."""
    display_name: str
    email: str
    subscription_level: str
    last_login: firestore.Timestamp
    settings: Dict[str, str]
    birth_data: Optional[Dict[str, float]]

def get_user_data(user_id: str) -> UserData:
    db = firestore.Client()
    user_ref = db.collection('users').document(user_id)
    user_doc = user_ref.get()

    if not user_doc.exists:
        raise ValueError(f"User {user_id} not found")

    # to_dict() now has proper type information
    user_data = user_doc.to_dict()

    # Type checker can now validate this cast
    return UserData(
        display_name=user_data.get('display_name', ''),
        email=user_data.get('email', ''),
        subscription_level=user_data.get('subscription_level', 'free'),
        last_login=user_data.get('last_login', firestore.Timestamp.now()),
        settings=user_data.get('settings', {}),
        birth_data=user_data.get('birth_data')
    )
```

The type stub for Google Cloud Storage enables similar improvements:

```python
# Before:
from google.cloud import storage  # type: ignore

def upload_chart_image(chart_id: str, image_data: bytes) -> str:
    """Upload a chart image to Cloud Storage."""
    client = storage.Client()
    bucket = client.bucket('astro-charts')
    blob = bucket.blob(f'charts/{chart_id}.png')
    blob.upload_from_string(image_data, content_type='image/png')
    return blob.public_url  # No type checking on this property

# After:
from google.cloud import storage

def upload_chart_image(chart_id: str, image_data: bytes) -> str:
    """Upload a chart image to Cloud Storage and return the public URL."""
    client = storage.Client()
    bucket = client.bucket('astro-charts')
    blob = bucket.blob(f'charts/{chart_id}.png')
    blob.upload_from_string(image_data, content_type='image/png')

    # Now properly typed as str
    return blob.public_url
```

### Type Configuration

We've updated the mypy configuration for stricter type checking:

```ini
# backend/pyproject.toml
[tool.mypy]
python_version = "3.10"
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
disallow_incomplete_defs = true
check_untyped_defs = true
disallow_untyped_decorators = true
no_implicit_optional = true
strict_optional = true

[[tool.mypy.overrides]]
module = "tests.*"
disallow_untyped_defs = false

[[tool.mypy.overrides]]
module = "swisseph"
ignore_missing_imports = true
```

## Best Practices Established

1. **Use TypeGuard for Runtime Type Validation**: Implement TypeGuard functions to validate data
   structures at runtime
2. **Create Type Stubs for Third-Party Libraries**: Instead of `# type: ignore`, create proper type
   stubs
3. **Use TypedDict for Dict Structures**: Replace Dict[str, Any] with properly defined TypedDict
   classes
4. **Be Explicit with Optional Types**: Use `is None` checks instead of truthiness checks for
   Optional types

## Advanced Type Patterns

### 6. Protocol Classes for Structural Typing

We've implemented Protocol classes for interface-like type checking:

```python
# Before:
def calculate_aspects(planets: Dict[str, float], aspects_config: Dict[str, Any]) -> List[Dict[str, Any]]:
    # Function expects a specific structure but it's not enforced

# After:
from typing import Dict, List, Protocol, runtime_checkable

@runtime_checkable
class PlanetPositions(Protocol):
    """Protocol defining the expected structure of planet position data."""
    sun: float
    moon: float
    mercury: float
    venus: float
    mars: float
    jupiter: float
    saturn: float
    uranus: float
    neptune: float
    pluto: float

@runtime_checkable
class AspectConfig(Protocol):
    """Protocol defining the expected structure of aspect configurations."""
    name: str
    angle: float
    orb: float
    influence: str

def calculate_aspects(planets: PlanetPositions, aspects_config: List[AspectConfig]) -> List[AspectData]:
    # Now the function explicitly requires objects that match these protocols
    result: List[AspectData] = []

    # We can access planets.sun, planets.moon, etc. with proper type checking
    # We can access aspect.name, aspect.angle, etc. with proper type checking

    return result
```

### 7. Literal Types for Constrained Values

We've added Literal types to constrain string and numeric values:

```python
# Before:
def calculate_house_system(system: str) -> List[float]:
    if system not in ['placidus', 'koch', 'equal', 'whole_sign']:
        raise ValueError(f"Unsupported house system: {system}")
    # ...

# After:
from typing import Literal, List

HouseSystem = Literal['placidus', 'koch', 'equal', 'whole_sign']

def calculate_house_system(system: HouseSystem) -> List[float]:
    # The type system now enforces that only valid house systems can be passed
    # ...
    return [0.0] * 12  # Example return

# Usage:
houses = calculate_house_system('placidus')  # OK
houses = calculate_house_system('invalid')   # Type error!
```

### 8. Dataclasses for Structured Data

We've replaced many dictionary-based data structures with proper dataclasses:

```python
# Before:
def process_chart_data(chart: Dict[str, Any]) -> Dict[str, Any]:
    result = {
        'planets': chart.get('planets', {}),
        'houses': chart.get('houses', []),
        'aspects': chart.get('aspects', []),
        # No validation that these fields exist or have the right structure
    }
    return result

# After:
from dataclasses import dataclass
from typing import List, Dict, Optional

@dataclass
class Planet:
    name: str
    sign: str
    degree: float
    house: int
    retrograde: bool = False

@dataclass
class House:
    number: int
    sign: str
    degree: float
    cusp: float

@dataclass
class Aspect:
    planet1: str
    planet2: str
    type: str
    orb: float
    applying: bool

@dataclass
class AstrologyChart:
    planets: List[Planet]
    houses: List[House]
    aspects: List[Aspect]
    asteroids: Optional[List[Dict[str, Any]]] = None

def process_chart_data(chart: AstrologyChart) -> AstrologyChart:
    # Now we have proper type checking and autocompletion
    # Access like chart.planets[0].name
    return chart
```

### 9. Type-Safe Exception Handling

We've improved error handling with custom exception types and proper type annotations:

```python
# Before:
try:
    result = calculate_planets(birth_data)
except Exception as e:
    logger.error(f"Error calculating planets: {e}")
    raise

# After:
from typing import Union, List, Dict
from enum import Enum

class CalculationErrorType(Enum):
    INVALID_DATE = "invalid_date"
    INVALID_COORDINATES = "invalid_coordinates"
    EPHEMERIS_ERROR = "ephemeris_error"
    UNKNOWN = "unknown_error"

class CalculationError(Exception):
    """Typed exception for calculation errors."""
    def __init__(self, message: str, error_type: CalculationErrorType, details: Optional[Dict[str, Any]] = None):
        self.message = message
        self.error_type = error_type
        self.details = details or {}
        super().__init__(message)

# Now we can have type-safe error handling
try:
    result = calculate_planets(birth_data)
except CalculationError as e:
    if e.error_type == CalculationErrorType.INVALID_DATE:
        # Handle date error specifically
        logger.error(f"Invalid date in birth data: {e.details.get('date')}")
    elif e.error_type == CalculationErrorType.INVALID_COORDINATES:
        # Handle coordinate error specifically
        logger.error(f"Invalid coordinates: Lat {e.details.get('lat')}, Lon {e.details.get('lon')}")
    else:
        # Handle other errors
        logger.error(f"Calculation error: {e.message}")

    # We can return a properly typed error response
    raise HTTPException(
        status_code=400,
        detail={
            "error_type": e.error_type.value,
            "message": e.message,
            "details": e.details
        }
    )
```

### 10. Type-Safe API Responses

We've added proper type annotations for API responses:

```python
# Before:
@router.get("/chart/{chart_id}")
async def get_chart(chart_id: str):
    chart = await fetch_chart(chart_id)
    if not chart:
        raise HTTPException(status_code=404, detail="Chart not found")
    return chart

# After:
from fastapi import APIRouter, HTTPException, Path, Query
from fastapi.responses import JSONResponse
from typing import Optional, List, Dict, Any, Union
from pydantic import BaseModel

class ChartResponse(BaseModel):
    """Pydantic model for chart response."""
    id: str
    name: str
    planets: List[Dict[str, Any]]
    houses: List[Dict[str, Any]]
    aspects: List[Dict[str, Any]]
    created_at: str
    user_id: str

class ErrorResponse(BaseModel):
    """Pydantic model for error response."""
    error_type: str
    message: str
    details: Optional[Dict[str, Any]] = None

@router.get(
    "/chart/{chart_id}",
    response_model=ChartResponse,
    responses={
        200: {"description": "Success", "model": ChartResponse},
        404: {"description": "Chart not found", "model": ErrorResponse},
        500: {"description": "Internal server error", "model": ErrorResponse}
    }
)
async def get_chart(
    chart_id: str = Path(..., description="The ID of the chart to fetch")
) -> Union[ChartResponse, JSONResponse]:
    """Fetch an astrology chart by ID."""
    try:
        chart = await fetch_chart(chart_id)
        if not chart:
            return JSONResponse(
                status_code=404,
                content=ErrorResponse(
                    error_type="not_found",
                    message="Chart not found",
                    details={"chart_id": chart_id}
                ).dict()
            )

        return ChartResponse(**chart)
    except Exception as e:
        logger.exception(f"Error fetching chart {chart_id}")
        return JSONResponse(
            status_code=500,
            content=ErrorResponse(
                error_type="internal_error",
                message="Internal server error",
                details={"error": str(e)}
            ).dict()
        )
```

## Next Steps

1. Continue implementing these advanced patterns in other Python files
2. Add runtime type validation at API boundaries using Pydantic models
3. Further improve test coverage with type-aware test fixtures and mocks
4. Extend the type stubs for third-party libraries as needed
5. Implement CI checks to enforce type consistency
6. Create training materials for team on Python type annotations best practices
