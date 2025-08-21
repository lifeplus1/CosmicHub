# ESLint Rules Tightening Plan for CosmicHub

## Current Status ✅

- **ESLint**: 0 errors, 0 warnings
- **TypeScript**: Some import resolution issues in healwave
- **Build**: Passing despite TypeScript errors
- **Historical improvement**: 953 → 0 lint errors

## Phase 1: Safe Tightening (Implement Immediately)

### Enable These Rules Now

```javascript
'@typescript-eslint/prefer-nullish-coalescing': 'error', // Auto-fixable
'@typescript-eslint/prefer-optional-chain': 'error',    // Auto-fixable
'@typescript-eslint/consistent-type-definitions': ['error', 'interface'], // Already enabled
```

**Impact**: ~2-5 errors, all auto-fixable **Benefit**: Modern TypeScript patterns, better
readability

## Phase 2: Type Safety (Week 2-3)

### Address TypeScript Import Issues First

1. Fix healwave/src/services/api.ts import resolution
2. Ensure all packages build without type errors

### Then Enable

```javascript
'@typescript-eslint/no-explicit-any': ['error', { fixToUnknown: true }],
'@typescript-eslint/no-non-null-assertion': 'warn', // Start with warning
```

**Impact**: ~50-100 errors (estimated) **Benefit**: Better type safety, catch potential runtime
errors

## Phase 3: Strict Mode (Month 2)

### Advanced Rules

```javascript
'@typescript-eslint/strict-boolean-expressions': 'error',
'@typescript-eslint/explicit-function-return-type': ['error', {
  allowExpressions: true,
  allowHigherOrderFunctions: true
}],
```

**Impact**: ~100+ errors (estimated) **Benefit**: Maximum type safety, explicit contracts

## Implementation Strategy

### Week 1: Phase 1

```bash
# Enable safe rules
pnpm run lint -- --fix  # Auto-fix what we can
# Manual fix remaining issues (should be minimal)
```

### Week 2-3: Phase 2

```bash
# 1. Fix TypeScript imports first
# 2. Enable stricter any/non-null rules
# 3. Gradual cleanup of unsafe operations
```

### Month 2: Phase 3

```bash
# Only after Phase 1-2 are stable
# Enable strictest rules
# Team-wide cleanup effort
```

## Immediate Actions Recommended

1. **✅ Enable Phase 1 rules now** (low risk, high value)
2. **🔧 Fix healwave TypeScript imports** (blocking issue)
3. **📊 Add lint metrics tracking** (measure progress)
4. **🚀 Add pre-commit hooks** (prevent regressions)

## Success Metrics

- Maintain 0 lint errors/warnings at each phase
- TypeScript compilation passes completely
- Build performance remains stable
- Team velocity not significantly impacted

## Risk Mitigation

- **Gradual rollout**: One rule at a time
- **Auto-fix first**: Reduce manual effort
- **Team communication**: Clear expectations per phase
- **Rollback plan**: Can revert individual rules if problematic

---

_Created: August 21, 2025_ _Status: Phase 1 Ready for Implementation_
