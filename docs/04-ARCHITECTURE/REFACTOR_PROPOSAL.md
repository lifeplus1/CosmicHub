# Chart Data Processing Refactor Proposal

## Current Issues

1. Multiple sign calculation functions
2. Multiple house calculation functions  
3. Redundant transformation layers
4. Saved charts re-processed unnecessarily
5. Validation happening after transformation instead of before

## Proposed Solution

### 1. Create Centralized Utilities (`shared/astrology-utils.ts`)

```typescript
// Single source of truth for astrological calculations
export const AstrologyUtils = {
  getSignFromDegrees(degrees: number): ZodiacSign,
  calculateHousePosition(position: number, houseCusps: number[]): number,
  normalizeDegreesToRange(degrees: number): number,
  formatPlanetPosition(position: number): string
}
```

### 2. Unified Chart Processor (`services/chart-processor.ts`)

```typescript
export class ChartProcessor {
  // Process raw backend data OR saved chart data
  static process(rawData: unknown, source: 'api' | 'saved'): ProcessedChart
  
  // Handle both cases with single logic
  private static transformPlanets(planets: any, houses: any[]): Planet[]
  private static transformAspects(aspects: any[]): Aspect[]
  private static transformAngles(angles: any): ChartAngles
}
```

### 3. Streamlined Data Flow

```text
Backend API → ChartProcessor → Validation → Display
Saved Data → ChartProcessor → Validation → Display
```

Instead of:

```text
Backend API → API Transform → Normalization → Validation → Display
Saved Data → Normalization → Validation → Display (fails → sample data)
```

### 4. Smart Caching

```typescript
// Only process if data structure has changed
const processedChart = ChartProcessor.process(data, {
  skipIfAlreadyProcessed: true,
  source: isFromAPI ? 'api' : 'saved'
})
```

## Benefits

- ✅ Single source of truth for calculations
- ✅ Saved charts work reliably  
- ✅ Easier to maintain and debug
- ✅ Better performance (less redundant processing)
- ✅ More predictable data flow

## Implementation Priority

1. **High**: Fix saved chart loading (immediate user issue)
2. **Medium**: Consolidate calculation functions  
3. **Low**: Full architectural refactor
