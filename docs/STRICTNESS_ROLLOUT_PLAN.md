# TypeScript Strictness Rollout Plan

## Current Global Flags

strict, noImplicitAny, strictNullChecks, strictFunctionTypes, noImplicitReturns, noFallthroughCasesInSwitch, noUncheckedIndexedAccess, exactOptionalPropertyTypes, noImplicitOverride, noPropertyAccessFromIndexSignature, noUnusedLocals, noUnusedParameters.

## Done

- Centralized error boundary types (errorTypes.ts)
- Added any usage ratchet (scripts/any-count-ratchet.mjs)
- Frontend bracket access migration (Astro + HealWave apps) for index-signature objects completed (replaced risky dot access, added guards)
- Slider / array indexing hardened with undefined guards (eliminated TS2345 & TS2532 cases in UI components)

## In Progress

- Dynamic analytics/performance import hardening.
- Backend & shared packages deeper narrowing (replacing broad Record<string, unknown> remnants).

## Planned (Next Wave)

1. Replace generic Records with domain-specific interfaces in services (start with shared packages: `@cosmichub/frequency`, backend services).
2. Consolidate runtime validations into shared guard modules (reduce duplicated inline shape checks).
3. Expand strict pilot include list iteratively (add remaining packages once they pass ratchets at zero new errors).
4. Add tests to cover edge cases (empty payloads, partial objects) before deeper narrowing.
5. Introduce ESLint rule override removal pass (remove now-unneeded ts-ignore / eslint-disable comments discovered during migration).
6. Track residual `any` hot-spots via `any-count-ratchet` diff reports and schedule targeted refactors.

## Ratchets

- Type errors: scripts/type-error-ratchet.mjs
- Any count: scripts/any-count-ratchet.mjs

## Expansion Criteria

File enters strict pilot after resolving TS4111/TS2532/TS2345 locally & passing ratchets.

## Guidelines

- Prefer narrowing types over sprinkling bracket access; bracket only when dynamic key space unavoidable.
- Use type guards to centralize shape checks.
- Avoid non-null assertions; encode optionality explicitly.

## Metrics

- Downward TS4111 / TS2532 / TS2345 incident counts (now zero in front-end apps).
- Non-increasing any count (ratcheted).
- Stable zero baseline for ratcheted type errors (apps now clean; next lower backend count before baseline reset).
- Guard adoption coverage (% of array/dynamic key accesses preceded by existence checks).

---

Latest update: August 21, 2025 – HealWave app brought to zero type errors; frontend strictness parity achieved.

Document updates as phases progress.
