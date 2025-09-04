# Type Bridge System for CosmicHub

## Overview

The Type Bridge system ensures consistency between TypeScript frontend types and Python backend types across the CosmicHub application. This maintains type safety and API contract consistency throughout the full-stack application.

## Architecture

### Frontend Types (TypeScript)

- **Location**: `packages/types/src/tcm-systems.types.ts`
- **Purpose**: Defines interfaces for frontend components and API communication
- **Format**: TypeScript interfaces and type aliases

### Backend Types (Python)  

- **Location**: `backend/types/tcm_systems.py`
- **Purpose**: Mirrors frontend types using Pydantic models for API validation
- **Format**: Pydantic BaseModel classes with validation

### Bridge Components

1. **Centralized Type Definitions**
   - Single source of truth for data structures
   - Automatic validation and serialization
   - IDE autocomplete and error detection

2. **API Contract Enforcement**
   - FastAPI uses Pydantic models for request/response validation
   - Automatic OpenAPI documentation generation
   - Runtime type checking and validation

3. **Development Tools**
   - Type bridge generator script (`scripts/type-bridge-generator.py`)
   - Validation utilities to ensure sync
   - Bridge reports for consistency checking

## Usage Examples

### API Endpoint with Typed Response

```python
# backend/api/endpoints/tcm_systems.py
from backend.types.tcm_systems import HealthRecommendationsResponse

@tcm_router.get("/health-recommendations/{element}", response_model=HealthRecommendationsResponse)
async def get_health_recommendations(element: str) -> HealthRecommendationsResponse:
    return HealthRecommendationsResponse(
        element=element,
        dietary_recommendations=["recommendation1", "recommendation2"],
        lifestyle_recommendations=["lifestyle1", "lifestyle2"],
        optimal_season="spring",
        balanced_emotion="joy",
        dominant_organs=["liver", "gallbladder"],
        generated_at="2025-09-03T00:00:00Z"
    )
```

### Frontend Type Usage

```typescript
// Frontend component using the same types
import { HealthRecommendationsResponse } from '@cosmichub/types';

const processRecommendations = (data: HealthRecommendationsResponse) => {
  // TypeScript knows the exact shape of the data
  console.log(data.dietary_recommendations);
  console.log(data.optimal_season);
};
```

## Type Definitions

### Core TCM Types

#### ElementInfo

- Contains element-specific information (season, organs, emotions, etc.)
- Used for both API responses and internal calculations

**ElementalBalance**  

- Five-element balance representation
- Standardized 0-1 range for each element

#### TCMRequest

- Birth data input for TCM calculations
- Includes validation for date ranges and coordinates

**HealthRecommendationsResponse**

- Dietary and lifestyle recommendations
- Element-specific guidance and organ information

**ElementInfoResponse**

- Detailed element information
- Planetary influences and optimal time windows

### Response Models

All API endpoints use strongly-typed response models:

- `TCMResponse` - Complete analysis results
- `HealthRecommendationsResponse` - Health guidance
- `ElementInfoResponse` - Element details  
- `TCMHealthCheck` - Service status

## Benefits

### 1. **Type Safety**

- Compile-time error detection
- Prevents runtime type mismatches
- IDE support for autocomplete and refactoring

### 2. **API Consistency**

- Guaranteed contract between frontend and backend
- Automatic validation of request/response data
- Self-documenting API through type definitions

### 3. **Developer Experience**

- Clear data structure expectations
- Reduced debugging time
- Better code maintainability

### 4. **Documentation**

- Types serve as living documentation
- OpenAPI spec generation from Pydantic models
- Clear interface contracts

## Validation and Sync

### Manual Validation

```bash
# Run type bridge generator
python scripts/type-bridge-generator.py
```

### Automated Checks

- CI/CD integration for type consistency
- Pre-commit hooks for validation
- Build-time type checking

## Best Practices

### 1. **Single Source of Truth**

- Define types once, use everywhere
- Update both TypeScript and Python types together
- Use the bridge generator for validation

### 2. **Validation Rules**

- Include Pydantic Field constraints for data validation
- Use appropriate type unions for optional fields
- Validate ranges and formats at the API layer

### 3. **Naming Conventions**

- Use consistent naming between TypeScript and Python
- Follow language-specific conventions (camelCase vs snake_case)
- Use descriptive type names

### 4. **Documentation**

- Add docstrings to Pydantic models
- Include field descriptions and examples
- Keep type definitions well-commented

## Migration Guide

### From Inline Types to Centralized Types

**Before:**

```python
# Inline type definition
async def endpoint() -> Dict[str, Any]:
    return {"field": "value"}
```

**After:**

```python  
# Using centralized types
from backend.types.tcm_systems import MyResponseModel

async def endpoint() -> MyResponseModel:
    return MyResponseModel(field="value")
```

### Adding New Types

1. **Define in TypeScript first**

   ```typescript
   // packages/types/src/tcm-systems.types.ts
   export interface NewType {
     field: string;
     optional?: number;
   }
   ```

2. **Mirror in Python**

   ```python
   # backend/types/tcm_systems.py
   class NewType(BaseModel):
       field: str
       optional: Optional[float] = None
   ```

3. **Use in API**

   ```python
   # Import and use the new type
   from backend.types.tcm_systems import NewType
   
   @router.post("/endpoint", response_model=NewType)
   async def endpoint() -> NewType:
       return NewType(field="value")
   ```

## Future Enhancements

- **Automated Type Generation**: Generate Python types from TypeScript
- **Runtime Validation**: Enhanced validation with custom validators  
- **Type Documentation**: Automated docs from type definitions
- **Schema Evolution**: Versioning and migration strategies

## Extracted Domain Page Pattern (Post Multi-System Refactor)

To reduce bundle weight and clarify ownership boundaries, individual domain tabs (TCM, Psychology, Spiritual) can be rendered as standalone pages while still leveraging the shared multi-system component. Key patterns:

1. Conditional Tab Rendering
    - `MultiSystemChartDisplay` now accepts `overrideVisibleTabs` to limit rendered systems
    - Feature flag `deprecateMultiSystemTabs` hides extracted tabs globally when enabled

2. Data Isolation Hooks
    - Each domain implements a hook (`useTCMChartData`, etc.) returning `{ data, isLoading, error, refresh }`
    - Hooks will migrate to React Query for caching & refetch control (TCM implemented)

3. Progressive Migration Strategy
    - Phase 1: Add standalone pages reusing existing tab internals
    - Phase 2: Move domain-specific logic & API integration into dedicated services
    - Phase 3: Remove legacy tab code when usage metrics confirm adoption

4. Testing Strategy
    - Smoke tests validate page mounts
    - Snapshot tests lock initial structure prior to deeper refactors

5. Type Bridge Alignment
    - Standalone pages still rely on centralized types (`@cosmichub/types` + Pydantic mirrors)
    - Future: auto-generation ensures extracted domains never drift from backend schemas

This pattern maintains type safety guarantees while enabling vertical scaling of complex domain UX without bloating the unified chart entrypoint.
