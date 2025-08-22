# Phase 2 Implementation Plan: Enhanced Type Checking and Module Resolution

This document outlines the implementation plan for Phase 2 of our linting and type checking improvements, focusing on resolving the remaining TypeScript module resolution issues and enhancing the type safety of our codebase.

## Objectives

1. Remove temporary workarounds implemented in Phase 1
2. Fix all remaining TS7016 errors for subpath exports
3. Implement proper typing for Firebase analytics imports
4. Enforce stricter type checking across all packages

## Implementation Steps

### 1. Fix Subpath Exports in Config Package

```bash
# Estimated completion time: 2 days
```

1. Enhance the `packages/config/package.json` exports field to properly handle all subpaths:

```json
"exports": {
  ".": {
    "types": "./dist/index.d.ts",
    "default": "./dist/index.js"
  },
  "./hooks": {
    "types": "./dist/hooks/index.d.ts",
    "default": "./dist/hooks/index.js"
  },
  "./hooks/*": {
    "types": "./dist/hooks/*.d.ts",
    "default": "./dist/hooks/*.js"
  },
  "./firebase": {
    "types": "./dist/firebase/index.d.ts",
    "default": "./dist/firebase/index.js"
  },
  "./firebase/*": {
    "types": "./dist/firebase/*.d.ts",
    "default": "./dist/firebase/*.js"
  },
  "./component-library": {
    "types": "./dist/component-library/index.d.ts",
    "default": "./dist/component-library/index.js"
  },
  "./lazy-loading": {
    "types": "./dist/lazy-loading/index.d.ts",
    "default": "./dist/lazy-loading/index.js"
  },
  "./performance": {
    "types": "./dist/performance/index.d.ts",
    "default": "./dist/performance/index.js"
  }
}
```

2. Improve the declaration file structure to match the export patterns:

```typescript
// In packages/config/src/hooks/index.ts
export * from './useABTest';
export * from './useAnalytics';
// etc.
```

3. Update the build process to ensure all declaration files are properly generated:

```typescript
// In packages/config/tsconfig.build.json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noEmit": false
  },
  "include": ["src/**/*"],
  "exclude": ["**/*.test.ts", "**/*.test.tsx", "**/*.stories.tsx"]
}
```

### 2. Fix Firebase Analytics Typing

```bash
# Estimated completion time: 1 day
```

1. Create proper type definitions for Firebase analytics imports:

```typescript
// In packages/config/src/firebase/analytics.ts
import type { Analytics, AnalyticsCallOptions } from 'firebase/analytics';

export type { Analytics, AnalyticsCallOptions };

// Define proper types for all analytics methods
export interface AnalyticsService {
  logEvent: (eventName: string, eventParams?: Record<string, any>, options?: AnalyticsCallOptions) => void;
  setCurrentScreen: (screenName: string, options?: AnalyticsCallOptions) => void;
  setUserId: (userId: string, options?: AnalyticsCallOptions) => void;
  setUserProperties: (properties: Record<string, any>, options?: AnalyticsCallOptions) => void;
}

// Export the analytics factory function type
export type GetAnalyticsType = () => Promise<Analytics>;
```

2. Update the dynamic import pattern in hooks:

```typescript
// In packages/config/src/hooks/useAnalytics.ts
import { useCallback, useEffect, useState } from 'react';
import type { Analytics, AnalyticsCallOptions } from '../firebase/analytics';

export function useAnalytics() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        // Dynamic import with proper type handling
        const { getAnalytics } = await import('firebase/analytics');
        const { getApp } = await import('firebase/app');
        const app = getApp();
        setAnalytics(getAnalytics(app));
      } catch (error) {
        console.error('Failed to load analytics:', error);
      }
    };
    
    loadAnalytics();
  }, []);

  const logEvent = useCallback(
    (eventName: string, eventParams?: Record<string, any>, options?: AnalyticsCallOptions) => {
      if (!analytics) return;
      
      // Only import logEvent when needed
      import('firebase/analytics').then(({ logEvent }) => {
        logEvent(analytics, eventName, eventParams, options);
      }).catch(console.error);
    },
    [analytics]
  );

  // Return properly typed methods
  return {
    logEvent,
    // Other methods...
  };
}
```

### 3. Remove UI Package Workarounds

```bash
# Estimated completion time: 1 day
```

1. Remove the temporary build script:

```bash
# Delete packages/ui/scripts/build-phase1.sh
```

2. Update the build script in package.json:

```json
// In packages/ui/package.json
{
  "scripts": {
    "build": "tsc -p tsconfig.build.json && tsc -p tsconfig.build.json --emitDeclarationOnly"
  }
}
```

3. Fix import statements in UI package:

```typescript
// Update all imports to use proper paths
import { useABTest } from '@cosmichub/config/hooks';
```

### 4. Enforce Stricter Type Checking

```bash
# Estimated completion time: 2 days
```

1. Update the main tsconfig.json to enable stricter checks:

```json
// In tsconfig.base.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "useUnknownInCatchVariables": true,
    "alwaysStrict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true,
    "allowUnreachableCode": false
  }
}
```

2. Implement a type error ratcheting mechanism:

```typescript
// In scripts/type-error-ratchet.mjs
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const TYPE_ERROR_BASELINE = 'metrics/type-errors-baseline.json';

// Run type checking and capture errors
const output = execSync('pnpm run type-check:all --generateReport', { encoding: 'utf8' });
const currentErrors = JSON.parse(fs.readFileSync('metrics/type-errors-current.json', 'utf8'));

// Compare with baseline
let baseline = { totalErrors: 0, fileErrors: {} };
if (fs.existsSync(TYPE_ERROR_BASELINE)) {
  baseline = JSON.parse(fs.readFileSync(TYPE_ERROR_BASELINE, 'utf8'));
}

// Fail if errors increased
if (currentErrors.totalErrors > baseline.totalErrors) {
  console.error(`❌ Type errors increased from ${baseline.totalErrors} to ${currentErrors.totalErrors}`);
  process.exit(1);
}

// Success if errors decreased
if (currentErrors.totalErrors < baseline.totalErrors) {
  console.log(`✅ Type errors decreased from ${baseline.totalErrors} to ${currentErrors.totalErrors}`);
  // Update baseline
  fs.writeFileSync(TYPE_ERROR_BASELINE, JSON.stringify(currentErrors, null, 2));
}

console.log(`✅ Type error check passed: ${currentErrors.totalErrors} errors (baseline: ${baseline.totalErrors})`);
```

3. Add the script to package.json:

```json
// In package.json
{
  "scripts": {
    "type-check:all": "pnpm run type-check:astro && pnpm run type-check:healwave && pnpm run type-check:types",
    "type-check:ratchet": "node ./scripts/type-error-ratchet.mjs"
  }
}
```

## Testing Strategy

1. **Unit Tests**:
   - Add tests for Firebase analytics hooks
   - Ensure all config package exports are properly typed

2. **Integration Tests**:
   - Test UI components that consume the config package exports
   - Verify Firebase analytics integration works correctly

3. **Continuous Integration**:
   - Add type checking to the CI pipeline
   - Run the type error ratchet script to prevent regression

## Success Criteria

1. All TS7016 errors for subpath exports are resolved
2. Firebase analytics imports are properly typed
3. No temporary workarounds are needed for building packages
4. Type checking is enforced across all packages
5. CI pipeline includes type checking with error ratcheting

## Timeline

| Task | Duration | Dependencies |
|------|----------|--------------|
| Fix Subpath Exports in Config Package | 2 days | None |
| Fix Firebase Analytics Typing | 1 day | Config Package Exports |
| Remove UI Package Workarounds | 1 day | Fixed Exports and Typing |
| Enforce Stricter Type Checking | 2 days | All previous tasks |
| Testing and Verification | 1 day | All previous tasks |

**Total Estimated Time**: 7 working days

## Rollback Plan

If issues arise during implementation, we can roll back to the Phase 1 implementation with temporary workarounds. All changes should be committed in small, atomic pull requests to facilitate easy rollback if needed.
