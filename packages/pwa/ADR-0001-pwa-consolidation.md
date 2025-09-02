---
title: ADR-0001: PWA Consolidation Strategy
owner: platform
status: active
last_reviewed: 2025-09-02
review_cycle: 60d
category: overview
---

# ADR-0001: PWA Consolidation Strategy

Date: 2025-08-27

Status: Accepted (Initial Implementation Complete – Iterative Dedup In Progress)

## Context

Both `apps/healwave` and `apps/astro` implemented overlapping (but diverging) PWA and mobile
enhancement logic:

- Service Worker (SW) registration with update loops / backoff.
- Capability detection (platform, standalone, push, etc.).
- Mobile viewport / gesture optimizations.
- Custom install / update banners and engagement gating.

Drift was increasing (naming, feature flags, accessibility refinements). A central module reduces:

1. Duplication & divergence risk.
2. Bundle size (tree‑sharable code instead of per‑app re‑emit).
3. Testing surface (one place to harden SW + install heuristics).
4. Future platform additions (notifications, badging, share) with single integration surface.

An "API package" (referenced in prior discussions) does not yet exist in the monorepo. Existing
packages (`types`, `hooks`, `storage`, `ui`, etc.) focus on discrete concerns. Creating a broad
`@cosmichub/api` prematurely would conflate unrelated domains. A focused `@cosmichub/pwa` package
keeps scope crisp and can later be _promoted_ or merged into a higher‑level platform package once
more cross‑cutting client APIs accumulate (e.g. feature flag client, analytics, realtime presence,
notification orchestration).

## Decision

Introduce dedicated `@cosmichub/pwa` package exporting:

- `registerServiceWorkerWithBackoff(...)` – resilient SW registration.
- `initPWA(...)` (light bootstrap hook surface – currently thin).
- `mobile-enhancements` (legacy consolidated mobile module).

Refactor app implementations to consume shared SW utilities first (lowest risk, high immediate
value). Perform _incremental_ dedup for remaining mobile & capability code to avoid large disruptive
change while both apps are actively iterated.

## Rationale

- **Separation of concerns**: Keeps PWA domain isolated; avoids overloading a hypothetical general
  API package before it is needed.
- **Progressive migration**: Small, verifiable steps (SW first → capability detection → gestures /
  viewport → banners) reduce regression surface.
- **Testability**: Central logic easier to unit & integration test (controllerchange, updatefound,
  engagement gating) once dedup completes.
- **Bundle hygiene**: Shared compiled output allows Vite / Rollup to de‑duplicate emitted chunks.
- **Clarity**: ADR documents intent, reducing future confusion about why a specialized package
  exists.

## Alternatives Considered

1. Immediately create `@cosmichub/api` and place PWA code there.
   - Rejected: Namespace too broad today; invites unrelated additions without clear boundaries.
2. Keep per‑app implementations and add README guidance.
   - Rejected: Continued divergence risk and duplicated maintenance effort.
3. Merge into existing `@cosmichub/hooks` or `@cosmichub/ui`.
   - Rejected: PWA concerns are runtime/platform, not presentational (UI) nor generic React hooks
     only.

## Migration Plan (Phased)

Phase 1 (DONE):

- Extract SW registration + backoff into shared package; wire both apps.

Phase 2 (IN PROGRESS):

- Unify capability detection (HealWave wrapper → shared detector) – partial.
- Author ADR (this file).

Phase 3 (NEXT):

- Consolidate gesture + viewport logic (decide on advanced vs minimal API; likely expose
  per‑document gesture manager + static viewport optimizer with teardown handle).
- Expose a shared install/update banner builder with sanitized templates + accessibility;
  parameterize branding strings & icons.

Phase 4:

- Provide integration tests (simulate `updatefound`, `controllerchange`, engagement gating) inside
  `@cosmichub/pwa` test suite.
- Remove duplicated code from app `pwa.ts` files; leave only thin configuration wrappers.

Phase 5:

- Evaluate promoting `@cosmichub/pwa` into a broader platform package **iff** additional
  cross‑cutting web platform APIs (notifications, background sync orchestration, media session,
  badging) are centralized.

## Open Questions / TODO

- Decide naming/shape for unified gesture API (element‑scoped vs document singleton + registration).
- Determine theming extensibility for shared banner styles (CSS vars vs inline style injection).
- Standardize analytics hooks (install prompt shown / dismissed / accepted) – pluggable reporter
  injection.
- Provide SSR guards for all future exports (maintain isomorphic import safety).

## Risks

- Partial migration state temporarily increases surface area (wrapper classes in apps). Mitigated by
  tight phases & tests.
- Differences in UX copy / branding may require per‑app configuration objects (avoid regression by
  designing an explicit config interface before banner consolidation).

## Measuring Success

- Reduced duplicated LOC (track via diff once gestures + viewport consolidated).
- Single source test coverage for SW update scenarios.
- No regressions in install banner appearance timing (compare engagement metrics before & after
  consolidation).

## Status Log

- 2025-08-27: ADR created; capability detector dedup wrapper added in HealWave (Phase 2).
