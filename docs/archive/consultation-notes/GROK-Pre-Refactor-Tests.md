Before starting a refactor in the CosmicHub project, ensure the following tests pass to maintain type safety, accessibility, scalability, modularity, security, robustness, and performance, as outlined in the project instructions. This ensures a stable baseline, preventing regressions during refactoring. The tests are prioritized based on their role in validating critical aspects of the system, aligned with the project's enforced standards and production readiness.

### Recommended Tests to Pass Before Refactoring

1. **Type Safety Tests**
   - **TypeScript Type Checking**: Run `scripts/typecheck.mjs` and `scripts/tsc-junit.cjs` to validate TypeScript types across `apps/astro`, `apps/mobile`, and shared `packages` (e.g., `types`, `ui`, `integrations`). Ensure no `any` types or type errors remain, using type guards (`packages/types/type-guards.ts`) and serialization utils (`backend/api/utils/serialization.py`).
   - **Pyright and MyPy**: Execute Pyright and MyPy for Python type safety in the backend (`backend/api/models`, `backend/astro/calculations`). These ensure Pydantic models and vectorized calculations (e.g., `backend/utils/vectorized_*`) are type-safe.
   - **Zod Validation**: Verify Zod schema validations in `apps/astro/src/utils` (e.g., `birthDataUtils.safeParse.test.ts`) to ensure runtime data integrity, especially for `UnifiedBirthInput.tsx` and API inputs.

2. **Accessibility Tests**
   - **WCAG 2.1 Compliance**: Run `scripts/accessibility-audit.mjs` and tests in `apps/astro/src/a11y/__tests__` (e.g., `AIChat.a11y.test.tsx`, `GeneKeysChart.a11y.test.tsx`) to confirm ARIA labels and accessibility compliance in components like `ChartDisplay` and `UnifiedBirthInput.tsx`. Use `packages/config/accessibility-testing.tsx` to validate Radix UI primitives.

3. **Unit Tests**
   - **Vitest (Frontend)**: Ensure 100% coverage with `scripts/coverage-report.mjs` for `apps/astro/src/__tests__` (e.g., `MultiSystemChart.test.tsx`, `SynastryAnalysis.test.tsx`) and shared packages (`ui`, `hooks`, `integrations`). Key tests include `App.integration.test.tsx`, `chart-data-conversion.test.ts`, and `useAIInterpretationManager.test.ts`.
   - **Pytest (Backend)**: Run `pytest` with `pytest.ini` to validate backend logic in `backend/tests`, focusing on `test_vectorized_synastry_integration.py`, `test_charts_endpoint.py`, and `test_vectorized_composite_charts.py`. These cover vectorized calculations and API endpoints critical for `astro` and `healwave` integration.

4. **Integration Tests**
   - **Frontend Integration**: Validate integration tests in `apps/astro/src/__tests__` (e.g., `App.integration.test.tsx`, `TransitApiIntegration.test.ts`) and `tests/integration` (e.g., `healwave-astro-integration.test.ts`) to ensure `astro` and `healwave` components (e.g., `HealwaveIntegration`, `AudioPlayer.tsx`) work together seamlessly.
   - **Backend Integration**: Confirm `test_multi_system_integration.py` and `test_vectorized_multi_system.py` pass to validate cross-system calculations (e.g., `backend/astro/calculations/synastry.py`) and Firestore/Redis interactions (`backend/cache`).

5. **Performance Tests**
   - **Frontend Performance**: Run `performance.test.ts` in `packages/config/src/__tests__` and verify `usePerformance.ts` hooks in `apps/astro/src/hooks`. Check metrics via `scripts/performance-dashboard.mjs` and `apps/astro/src/components/EphemerisPerformanceDashboard.tsx` to ensure lazy loading (`lazy-routes.tsx`) and memoization meet the 77ms build target.
   - **Backend Performance**: Execute `scripts/collect-metrics.py` and `scripts/micro-benchmark.py` to validate vectorized query performance (`backend/utils/optimized_vectorized_integration.py`) and caching efficiency (`backend/cache`).

6. **Security Tests**
   - **Environment Validation**: Run `scripts/validate-env.mjs` against `schema/env.schema.json` to ensure secure environment variables (e.g., `API_KEY`, `FIREBASE_CREDENTIALS` from `.env`). Verify Firestore rules (`firestore.rules`) and rate limiting (`backend/api/routers`) with `scripts/security/check_secret_ages.py`.
   - **CSRF and Pseudonymization**: Test CSRF protection (`apps/astro/src/services/csrfService.ts`) and pseudonymization logic (`backend/utils/pseudonymization.py`) to ensure data security.

7. **AI Agent Coordination Tests**
   - **Agent Coordination**: Run `scripts/ai-agent-lint-coordinator.mjs` to validate the AI agent system (e.g., `ComponentFixAgent`, `FeatureFixAgent`) using `ai-agent-coordination/coordination-manifest.json`. Ensure no conflicts in `coordination-output.log` and that artifacts (e.g., `agent-1-astro-components-analysis.json`) are consistent.

8. **Mobile-Specific Tests**
   - **Mobile Integration**: Run `tests/integration/mobile-integration.test.ts` and `scripts/test-mobile-app.sh` to validate React Native features (push notifications, biometric auth, widgets, camera integration) in `apps/mobile`. Ensure compatibility with shared `ui` and `integrations` packages.

### Execution Order

Follow the order recommended previously for efficiency and dependency resolution:

1. **ESLint** (`lint-ratchet.mjs`, `lint-changed-strict.mjs`): Catch code style and potential issues.
2. **TypeCheck** (`typecheck.mjs`, `tsc-junit.cjs`): Validate TypeScript types.
3. **Pylance**: Quick Python linting (IDE-driven or via tasks).
4. **Pyright**: Static Python type checking.
5. **MyPy**: Comprehensive Python type validation.
6. **Zod**: Runtime schema validation in unit tests.
7. **Vitest**: Frontend unit and integration tests.
8. **Pytest**: Backend unit and integration tests.

### Additional Considerations

- **Coverage Requirements**: Achieve 100% test coverage (`scripts/coverage-report.mjs`) to ensure all critical paths in `apps/astro`, `apps/healwave`, `apps/mobile`, and `backend` are tested.
- **Error Boundaries**: Validate `ErrorBoundary.tsx` tests (`apps/astro/src/components/__tests__/ErrorBoundary.test.tsx`) to ensure robust error handling.
- **Observability**: Run `scripts/observability/generate_slo_report.py` to confirm system health metrics (e.g., 92.4/100 privacy score) are stable.
- **Cleanup**: Execute `scripts/cleanup-project.sh` to remove redundant files (e.g., `vectorized_multi_system_utils.py.backup`) before testing to avoid false positives.

### Why These Tests?

- **Type Safety**: Prevents type-related bugs during refactoring (e.g., changes to `astrology.types.ts` or Pydantic models).
- **Accessibility**: Ensures WCAG compliance, critical for user-facing components like `ChartDisplay` and `AIChat.tsx`.
- **Unit and Integration Tests**: Validate core functionality (charts, AI interpretations, transits) and cross-app integrations (`healwave` in `astro`).
- **Performance**: Confirms optimizations (lazy loading, vectorized queries) remain intact.
- **Security**: Protects sensitive data and API endpoints, crucial for production readiness.
- **AI Coordination**: Ensures AI-driven maintenance (e.g., linting, fixes) aligns with refactor goals.
- **Mobile**: Validates mobile-specific features, as refactoring may impact React Native integrations.

By ensuring these tests pass, you establish a reliable foundation for refactoring, minimizing risks to the production-ready state of CosmicHub. Run `scripts/validate-env.mjs` post-testing to confirm environment consistency before proceeding.
