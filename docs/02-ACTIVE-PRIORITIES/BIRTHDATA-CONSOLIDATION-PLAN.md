---
title: BirthData Consolidation Plan
status: proposed
owner: platform
last_reviewed: 2025-09-03
category: active-priorities
---

# BirthData Consolidation Plan

Multiple BirthData representations exist:

| Location                           | Purpose                                     |
| ---------------------------------- | ------------------------------------------- |
| backend/types/astrology_systems.py | Pydantic model used in backend calculations |
| backend/routers/synastry.py        | Inline Pydantic for legacy endpoint wiring  |
| backend/api/bridges/\*             | Coercion logic creating BirthData instances |
| packages/types/src/index.ts        | Frontend TypeScript interface               |
| packages/types/src/birth.ts        | Extended / legacy textual variants          |
| apps/astro/src/schemas/index.ts    | Zod schema for runtime validation           |

## Issues

- Divergent field naming (lat/lon vs latitude/longitude in some TS schemas)
- Inline router model duplicates canonical backend type
- Multiple guard/parse helpers overlapping with Zod schema intent

## Consolidation Steps

1. Replace `routers/synastry.py` inline `BirthData` with import from
   `backend.types.astrology_systems`.
2. Add TS alias exports referencing a single `BirthData` interface in `packages/types`.
3. Align Zod schema keys to canonical interface (prefer `lat`, `lon`). Provide a derived schema for
   `latitude/longitude` that maps -> `lat/lon`.
4. Deprecate legacy guards in `packages/types/src/type-guards.ts` for birth data once Zod adoption
   reaches 100%.
5. Extend duplicate detection script target list after consolidation.

## Success Criteria

- Single backend BirthData definition
- Single TS interface + Zod schema source of truth
- All coercion flows call one normalization function

## Tracking

Add a checkbox list here as tasks are executed in PRs.
