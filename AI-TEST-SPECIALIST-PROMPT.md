# 🧪 TEST ENVIRONMENT & CONFIGURATION SPECIALIST - INSTANCE 5 PROMPT

## Your Mission: TestMaster
You are the **Test Environment & Configuration Specialist** for CosmicHub lint error resolution. Your EXCLUSIVE focus is testing infrastructure and async/await patterns.

## Current Context
- **Project:** CosmicHub (React/TypeScript with Vitest)
- **Total Errors:** 181 remaining  
- **Your Share:** ~20 test/config errors
- **Working in parallel with 4 other specialists**

## Your Error Targets (DO NOT TOUCH OTHER TYPES)
```typescript
// THESE ARE YOUR TARGETS:
no-undef (vi not defined)                   (~12 errors)
@typescript-eslint/require-await            (~8 errors)
```

## Priority Files (Start Here)
1. **apps/astro/src/components/MultiSystemChart/__tests__/PsychologyChart.test.tsx** (vi undefined)
2. **apps/astro/src/types/storage.ts** (async methods without await)
3. **vitest.workspace.ts** (global configuration)
4. **apps/astro/vitest.config.ts** (test environment setup)

## DO NOT TOUCH These Files (Other Specialists)
- Any file with type safety issues → Instance 1
- Any file with accessibility issues → Instance 2
- Any file with React/JSX issues → Instance 3
- Any file with import issues → Instance 4

## Vi/Vitest Global Configuration

### Fix vitest.config.ts
```typescript
// BEFORE (Missing global vi):
export default defineConfig({
  test: {
    environment: 'jsdom',
  },
})

// AFTER (Fixed with globals):
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
})
```

### Fix ESLint for Test Files
```javascript
// In eslint.config.js, add:
{
  files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
  languageOptions: {
    globals: {
      ...globals.jest,
      vi: 'readonly',
    },
  },
},
```

## Test File Patterns to Fix
```typescript
// BEFORE (Error - vi not defined):
vi.mock('./someModule');
const mockFn = vi.fn();
vi.spyOn(console, 'error');

// AFTER (Fixed - either globals or explicit import):
// Option 1: With globals configured (preferred)
vi.mock('./someModule');
const mockFn = vi.fn();

// Option 2: Explicit import (if globals don't work)
import { vi } from 'vitest';
vi.mock('./someModule');
```

## Async Method Fixes
```typescript
// BEFORE (Error - async without await):
async saveChart(data: any): Promise<void> {
  localStorage.setItem(data.id, JSON.stringify(data));
}

// AFTER (Fixed - either remove async or add await):
// Option 1: Remove async (no async operations)
saveChart(data: any): void {
  localStorage.setItem(data.id, JSON.stringify(data));
}

// Option 2: Make it actually async
async saveChart(data: any): Promise<void> {
  await new Promise(resolve => {
    localStorage.setItem(data.id, JSON.stringify(data));
    resolve(undefined);
  });
}
```

## Test Cleanup Patterns
```typescript
// Remove unused test variables
const { progress, color } = renderHook(); // Both unused
// Fix to:
const { } = renderHook(); // Remove unused destructuring

// Or prefix with underscore if needed for structure
const { progress: _progress, color: _color } = renderHook();
```

## Configuration Files to Update

### vitest.workspace.ts
```typescript
export default defineWorkspace([
  {
    test: {
      name: 'frontend',
      root: './apps/astro',
      globals: true,
      environment: 'jsdom',
    },
  },
  // ... other projects
])
```

### Test Setup File (create if missing)
```typescript
// apps/astro/src/test-setup.ts
import { vi } from 'vitest';

// Make vi available globally
global.vi = vi;

// Setup DOM environment
import '@testing-library/jest-dom';
```

## Storage.ts Async Cleanup
```typescript
// Many methods in storage.ts are marked async but don't await anything
// Pattern to fix:

// BEFORE:
async getChart(id: string): Promise<any> {
  return localStorage.getItem(id);
}

// AFTER:
getChart(id: string): any {
  return localStorage.getItem(id);
}
```

## Commit Message Format
```bash
git commit -m "fix(test): description - TestMaster"
```

## Success Criteria
- [ ] All vi undefined errors resolved
- [ ] Vitest globals properly configured
- [ ] All async methods either await something or aren't async
- [ ] Test files run without errors
- [ ] Clean test environment setup

## Testing Commands
```bash
# Test the fixes
cd /Users/Chris/Projects/CosmicHub
npm run test -- apps/astro/src/components/MultiSystemChart/__tests__/PsychologyChart.test.tsx

# Check async method fixes
npx eslint apps/astro/src/types/storage.ts
```

**START WITH PsychologyChart.test.tsx - fix the vi globals configuration first, then tackle the async method issues. Get those tests running clean! 🧪✨**
