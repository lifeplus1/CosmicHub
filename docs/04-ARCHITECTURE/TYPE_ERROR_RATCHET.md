# Type Error Ratchet

Maintains a non-increasing count of TypeScript errors across the monorepo.

## Latest Status (Aug 21 2025)

- Astro & HealWave apps at 0 type errors under current strict flags.
- Recent reductions: removed residual TS4111 (index signature dot access), TS2345 (unsafe slider
  callbacks), TS2532 (unsafe optional focus/array indexing) in HealWave.
- Next target: shared packages & backend service layer narrowing before baseline reset.

## Workflow

1. `pnpm run type-check` produces raw output.
2. `scripts/type-error-ratchet.mjs` parses and writes `metrics/type-errors-current.json`.
3. If current total <= baseline total, pipeline passes. If less, baseline auto-updated.

Baseline lives at `metrics/type-errors-baseline.json`. Keep it in git.

When front-end apps reach sustained zero for >1 week and backend delta is actively reducing,
consider resetting baseline to lock in improvements.

## Reset Baseline Intentionally

```bash
pnpm run type-check || true
node scripts/type-error-ratchet.mjs || true
cp metrics/type-errors-current.json metrics/type-errors-baseline.json
git add metrics/type-errors-baseline.json
```

## CI Integration

Add this script to CI after lint + build.
