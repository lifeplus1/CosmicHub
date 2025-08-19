# CosmicHub Project Instructions

To improve overall app performance (e.g., faster load times, efficient handling of large datasets for astrology trends, personality assessments, numerology, human design, and gene keys; reduced bundle sizes; and optimized resource use), here are the updated project instructions. These refinements build on prior discussions, emphasizing ongoing feature implementation (e.g., AI chatbot enhancements, multi-system chart integrations, and frequency generator modules) and optimizations (e.g., vectorized calculations, caching, and lazy loading). They incorporate the current monorepo structure with `apps/astro` and `apps/healwave` as separate but interconnected apps, shared `packages` for auth, config, integrations, subscriptions, types, and UI. Standards remain strict across type safety, accessibility, scalability, modularity, security, marketability, robustness, and performance. Streamlined for clarity, with added focus on recent updates like ephemeris performance, pseudonymization, and salt management.

**Core Project Goals:**
Build a production-grade astrology app (`astro`) integrated with a standalone frequency generator (`healwave`). Enable storage and analysis of large user datasets for trends across astrology, personality, numerology, human design, and gene keys. Include an expert AI chatbot for personalized insights, with premium features tied to subscriptions. Extend `healwave` functionality into `astro` (e.g., astrology-tied binaural beats and transits) via shared modules, while maintaining app separation to avoid duplication.

**Enforced Standards:**

- **Type Safety**: Strict TypeScript in frontend (e.g., `tsconfig.json` variants in apps and packages) and Pydantic in backend (e.g., models in `backend/api/models`). Use type guards (e.g., `packages/types/type-guards.ts`) and serialization utils (e.g., `backend/api/utils/serialization.py`). Eliminate `any` types; validate with `tsc-junit.cjs` and `typecheck.mjs`.
- **Accessibility**: WCAG 2.1 compliance via Radix UI primitives (e.g., in `packages/ui/components`). Ensure ARIA labels in charts (e.g., `apps/astro/src/components/ChartDisplay`) and forms (e.g., `UnifiedBirthInput.tsx`). Test with `accessibility-testing.tsx` in `packages/config`.
- **Scalability**: Handle high loads with Firestore indexing (e.g., via `backend/auth.py`), Redis caching (e.g., `backend/cache`), and horizontal scaling (Docker/Render in `docker-compose.yml`). Optimize queries (e.g., batched reads in `backend/astro/calculations`); use vectorized ops (e.g., `backend/utils/vectorized_*` files) for synastry/transits.
- **Modularity**: Monorepo via TurboRepo (`turbo.json`); share `packages` (e.g., `auth` for Firebase auth, `integrations` for Stripe/xAI, `ui` for components like `EnhancedCard.tsx`). Keep `healwave` separate but integrate via `apps/astro/src/components/integrations/HealwaveIntegration`. Remove duplicates (e.g., run `scripts/cleanup-project.sh`).
- **Security**: Use Vercel secrets for env vars (e.g., `.env` schema in `schema/env.schema.json`); rate limiting in FastAPI routers (e.g., `backend/api/routers`); strict Firestore rules. Implement pseudonymization (`backend/utils/pseudonymization.py`), salt rotation (`scripts/security/rotate_salts.py`), and CSP (`backend/api/routers/csp.py`).
- **Marketability**: Onboarding flows (e.g., `apps/astro/src/components/Signup.tsx`), tooltips (e.g., `EducationalTooltip.tsx`), premium prompts via Stripe (e.g., `backend/api/routers/stripe_router.py`), and cross-app promotions (e.g., `apps/astro/src/components/shared/AppSwitcher.tsx`).
- **Robustness**: Comprehensive testing with Vitest (`vitest.config.ts` in apps/packages) and pytest (`pytest.ini`); error boundaries (e.g., `apps/astro/src/components/ErrorBoundary.tsx`); logging (e.g., `backend/app.log*` rotation via `scripts/rotate-logs.sh`).
- **Performance**: Lazy loading/code splitting in React (e.g., `apps/astro/src/routes/lazy-routes.tsx`); memoization in hooks (e.g., `usePerformance.ts`); efficient API queries (e.g., vectorized in `backend/utils/optimized_vectorized_integration.py`); bundle optimization with Vite (`vite.config.ts`); TurboRepo caching for builds/CI. Monitor with `apps/astro/src/components/EphemerisPerformanceDashboard.tsx` and scripts like `benchmark_vectorized.py`.

**Tech Stack Summary:**

- **Frontend**: React 18 + TypeScript + Vite + Tailwind + Radix UI (e.g., in `packages/ui`).
- **Backend**: Python FastAPI + PySwissEph + Firebase (e.g., `backend/astro/calculations` for ephemeris/gene keys).
- **Database**: Firestore + Firebase Auth (shared via `packages/config/firebase.ts`).
- **Audio**: Web Audio API + Custom synthesis (e.g., `apps/healwave/src/components/AudioPlayer.tsx`).
- **Testing**: Vitest + Testing Library + Pytest (e.g., extensive tests in `backend/tests` and `apps/astro/src/__tests__`).
- **Build/DevOps**: TurboRepo + Vite + ESLint; Docker + Compose (`docker-compose.dev.yml`); Firebase Emulators; Deployment to Vercel/Render (scripts like `deploy-dev.sh`).
- **Performance Targets**: Aim for 77ms builds; enterprise-grade with full test coverage. Use `scripts/observability` for SLO reports and synthetic journeys.

**Current Structure Guidelines:**

- **apps/astro**: Core astrology features (e.g., charts in `src/components/MultiSystemChart`, AI in `src/components/AIInterpretation`, transits in `src/components/TransitAnalysis`). Integrate healwave via `src/features/healwave`.
- **apps/healwave**: Frequency generator (e.g., controls in `src/components/FrequencyControls.tsx`). Share UI/components with astro.
- **packages**: Centralized sharing (e.g., `types` for astrology.types.ts, `integrations` for xAI/Stripe, `ui` for reusable like `UpgradeModal.tsx`).
- **backend**: API routers/models (e.g., `api/routers/ai.py` for chatbot); calculations (e.g., `astro/calculations/synastry.py` with vectorization).
- **docs**: Maintain indexes (e.g., `INDEX.md`, `ROADMAP.md`); update with scripts like `organize-docs.sh`.
- **scripts**: Automation for cleanup (`cleanup-project.sh`), benchmarks (`benchmark_vectorized_synastry.py`), security (`rotate_salts.sh`).

**Next Steps for Feature Implementation and Optimization:**

1. **Features**: Complete AI chatbot enhancements (e.g., layered interpretations in `backend/api/services/ai_service.py`; integrate xAI via `packages/integrations/xaiService.ts`). Add collaborative sharing (per `docs/COLLABRATIVE_CHART_SHARING.md`). Expand multi-system charts (e.g., Vedic/Uranian in `apps/astro/src/components/MultiSystemChart`).
2. **Optimizations**: Vectorize remaining calculations (e.g., Phase 3 in `docs/phase-completions/PHASE_3_OPTIMIZATION_PLAN.md`). Implement Redis for ephemeris caching (`backend/cache`). Lazy-load heavy components (e.g., charts); profile with `performance-monitoring.ts`.
3. **Cleanups**: Run `scripts/project-cleanup.mjs` to remove redundancies (e.g., duplicate tests/icons). Validate env with `validate-env.mjs`.
4. **Testing/Deployment**: Ensure 100% coverage; test integrations (e.g., `tests/integration/healwave-astro-integration.test.ts`). Deploy updates via `deployment-manifest.json`.
5. **Monitoring**: Use `scripts/observability/generate_slo_report.py` for performance tracking; rotate secrets quarterly.

Apply these consistently: Prioritize performance in suggestions (e.g., reduce renders via memoization, batch fetches), provide modular code snippets, and suggest structure cleanups (e.g., consolidate duplicate utils). If gaps arise (e.g., in types/docs), propose targeted refinements to these instructions.
