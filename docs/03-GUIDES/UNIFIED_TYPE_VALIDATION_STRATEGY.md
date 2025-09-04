---
title: Unified Type & Validation Strategy
status: active
last_reviewed: 2025-09-03
owner: platform
category: guides
---

# Unified Type & Validation Strategy

This document defines the layered approach to runtime and static validation across the monorepo.

## Layers

1. TypeScript (tsc / ESLint) – Compile-time structural safety
2. Pyright + Mypy – Python static analysis (FastAPI backend)
3. Zod – Frontend runtime validation for external / untyped inputs
4. Pydantic – Backend runtime validation and coercion
5. Test Suites – Vitest (frontend) & Pytest (backend) for behavioral guarantees

## Commands

| Purpose | Command |
|---------|---------|
| Full TS check | `pnpm run type-check` |
| Pyright scan | `pnpm run pyright` |
| Pyright strict verify | `pnpm run pyright:strict` |
| Mypy (backend) | `pnpm run mypy` |
| All static types | `pnpm run types:all` |

## Incremental Strictness

We enforce strict subsets first (security, analytics, bridges) then expand. Add a module to:

- `pyrightconfig.json` strict array
- `backend/mypy.ini` per-module strict section

## Zod vs Pydantic

| Concern | Frontend (Zod) | Backend (Pydantic) |
|---------|----------------|--------------------|
| User input | ✅ | ✅ |
| API responses sanity | ✅ (decode) | N/A |
| External service payloads | ✅ | ✅ |
| Serialization | Manual | Built-in |

## Adding New Strict Module (Python)

1. Add focused annotations (avoid Any)
2. Run: `pnpm run pyright`
3. Add mypy section with strict flags
4. Remove local ignores
5. Add test coverage if missing

## Adding Zod Schema

Place schemas in `apps/astro/src/schemas` and re-export from `index.ts`. Provide matching TypeScript types via `z.infer`. Use composition for nested resources.

## Future Enhancements

- Enforce `disallow_untyped_defs = True` globally after remaining 5% coverage
- Generate OpenAPI → Zod via codegen to guarantee parity
- Add `pytest --mypy` plugin once stable baseline established
