# CosmicHub Issue Tracker (Lightweight Internal)

Status Legend:

- DONE = Implemented and merged
- IN-PROGRESS = Actively being developed
- PLANNED = Accepted for upcoming sprint window
- BACKLOG = Acknowledged, not yet scheduled
- DEFERRED = Explicitly postponed / re-evaluate later

| ID       | Title                                             | Status | Owner | Target     | Notes                                                                                                                                                                                                                                                                                                                                                                          | Source Doc              |
| -------- | ------------------------------------------------- | ------ | ----- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------- |
| UI-001   | Complete Synastry analysis backend integration    | DONE   | you   | 2025-08-16 | Backend algorithms implemented with PySwissEph, aspect matrices, house overlays, compatibility scoring, and composite charts. Frontend updated to use new API endpoint.                                                                                                                                                                                                        | Frontend Analysis       |
| UI-002   | Implement AI interpretation service integration   | DONE   | you   | 2025-08-16 | Full stack implemented: backend endpoints (`backend/api/interpretations.py`), service (`packages/integrations/src/xaiService.ts`), React hooks & components (`apps/astro/src/components/AIInterpretation/*`), caching + metrics. Remaining: content template refinement & advanced prompt variants (see Grok Prompt Additions).                                                | Frontend Analysis       |
| UI-003   | Complete chart saving/loading CRUD functionality  | DONE   | you   | 2025-08-27 | Full CRUD implementation found: SavedCharts.tsx (listing/deletion UI), ChartResults.tsx (save functionality with React Query), SaveChart.tsx (creation forms), database.py (save_chart, get_charts, delete_chart_by_id functions), complete frontend-backend integration.                                                                                                      | Frontend Analysis       |
| TEST-001 | Integration test enrichment (healwave-astro path) | DONE   | you   | 2025-08-27 | Comprehensive testing framework implemented: enhanced-testing.tsx (IntegrationTestRunner), componentTesting.ts (ComponentTestSuite), qualityAssurance.ts (QualityAssuranceEngine), multiple integration test files and testing utilities.                                                                                                                                      | PROJECT_PRIORITIES_2025 |
| EXP-002  | A/B modal variant content                         | DONE   | you   | 2025-08-16 | Variant set delivered (`docs/data/upgrade_modal_variants.json`) + usage guide (`UPGRADE_MODAL_COPY_VARIANTS.md`).                                                                                                                                                                                                                                                              | PROJECT_PRIORITIES_2025 |
| OBS-003  | Synthetic journey script                          | DONE   | you   | 2025-08-27 | Complete automation implemented: synthetic_journey.py (main script with step execution and JSON output), run_synthetic.sh (bash wrapper with log rotation), test_synthetic_journey.py (comprehensive test coverage), backend health checks and API testing integration.                                                                                                        | slo-policy.md           |
| OBS-004  | Weekly SLO report automation                      | DONE   | you   | 2025-08-27 | Complete implementation: scripts/observability/generate_slo_report.py (weekly SLO snapshot generation), comprehensive SLO policy documentation (docs/observability/slo-policy.md), error budget calculation and alerting thresholds.                                                                                                                                           | slo-policy.md           |
| SEC-002  | Secret inventory generator                        | DONE   | you   | 2025-08-16 | Implemented script `scripts/security/list_secrets.py` generating `logs/security/secret-inventory.json` + rotation log support.                                                                                                                                                                                                                                                 | secret-rotation.md      |
| PRIV-004 | Persist & rotate pseudonymization salts           | DONE   | you   | 2025-08-17 | Complete salt persistence and rotation system implemented: SaltStorage class with Firestore/in-memory dual storage, automated rotation script with cron integration, comprehensive test suite (15 tests passing), API endpoints for administration, and full documentation. Supports user-specific and global salts with configurable rotation intervals (90/30 days default). | pseudonymization.md     |
| SEC-005  | CSP rollout phase 2                               | DONE   | you   | 2025-08-27 | Complete implementation: csp-rollout.md documentation with phased approach, security.py with CSP headers implementation, directive definitions and violation handling systems.                                                                                                                                                                                                 | csp-rollout.md          |
| REL-005  | Degradation metrics instrumentation               | DONE   | you   | 2025-08-27 | Extensive monitoring systems implemented: performance.ts (PerformanceMonitor class), vectorized_monitoring.py (VectorizedPerformanceMonitor), comprehensive performance monitoring guides, real-time monitoring capabilities and alerting systems.                                                                                                                             | degradation-matrix.md   |

## 🎯 **Current Active Tasks** (August 2025)

**Status**: All major implementation phases complete. Focus shifted to infrastructure hardening and
user experience enhancements.

### **Infrastructure & Security Hardening** (Next Priority)

| ID      | Title                           | Status  | Owner | Target     | Notes                                    | Source Doc      |
| ------- | ------------------------------- | ------- | ----- | ---------- | ---------------------------------------- | --------------- |
| OBS-010 | Prometheus alert rules          | PLANNED | you   | 2025-09-05 | Pending metrics + synthetic baseline     | slo-policy.md   |
| OBS-011 | Performance metrics dashboard   | PLANNED | you   | 2025-09-10 | Grafana panel skeleton                   | slo-policy.md   |
| SEC-006 | Threat model mitigation batch 1 | PLANNED | you   | 2025-09-01 | Top risk items only (see threat-model)   | threat-model.md |
| SEC-007 | Abuse anomaly detection         | PLANNED | you   | 2025-09-15 | Derive thresholds from rate limit logs   | threat-model.md |
| SEC-008 | Input validation hardening      | PLANNED | you   | 2025-09-20 | Centralize schemas & tighten constraints | threat-model.md |

### **Advanced Features** (Future Planning)

| ID       | Title                                | Status  | Owner | Target     | Notes                               | Source Doc              |
| -------- | ------------------------------------ | ------- | ----- | ---------- | ----------------------------------- | ----------------------- |
| EXP-010  | Experiment registry schema validator | BACKLOG | you   | 2025-09-25 | TS/Zod -> JSON Schema generation    | registry.md             |
| EXP-011  | Guardrail breach automation          | BACKLOG | you   | 2025-09-30 | Auto flag + Slack/webhook prototype | guardrails.md           |
| UX-020   | Offline mode for chart data          | BACKLOG | you   | 2025-10-15 | Service worker caching strategy     | PROJECT_PRIORITIES_2025 |
| UX-021   | Mobile PWA enhancements              | BACKLOG | you   | 2025-10-20 | Manifest audit + install prompt     | PROJECT_PRIORITIES_2025 |
| A11Y-030 | Screen reader & keyboard sweep       | BACKLOG | you   | 2025-09-30 | Axe scan + manual flow tests        | PROJECT_PRIORITIES_2025 |

### **Minor Enhancements** (Low Priority)

| ID         | Title                                            | Status  | Owner | Target     | Notes                                                                                                                    | Source Doc              |
| ---------- | ------------------------------------------------ | ------- | ----- | ---------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------- |
| REL-010    | Circuit breaker + backoff helper                 | BACKLOG | you   | 2025-09-12 | Disable by default until tuned                                                                                           | degradation-matrix.md   |
| REL-011    | Fallback outcome logging normalization           | BACKLOG | you   | 2025-09-12 | Structured schema for fallbacks                                                                                          | degradation-matrix.md   |
| PRIV-005   | Salt rotation automation + audit log             | BACKLOG | you   | 2025-09-05 | Enhanced automation features                                                                                             | pseudonymization.md     |
| PRIV-006   | Pseudonymization risk review & collision monitor | BACKLOG | you   | 2025-09-18 | Script to sample & check hash distribution                                                                               | pseudonymization.md     |
| COLLAB-050 | Real-time collaborative chart sharing            | DONE    | you   | 2025-08-16 | Specification complete: story map, entities, 3 architecture patterns, JSON schema (see `COLLABRATIVE_CHART_SHARING.md`). | PROJECT_PRIORITIES_2025 |
| SOCIAL-060 | Community sharing & marketplace scaffolding      | DONE    | you   | TBD        | Specification complete (see `MARKETPLACE_PHASED_ROADMAP.md`).                                                            | PROJECT_PRIORITIES_2025 |
| AI-070     | Advanced model integration (post privacy review) | DONE    | you   | TBD        | Layered roadmap specification complete (see `feature-guides/AI_LAYERED_INTERPRETATION_ROADMAP.md`).                      | PROJECT_PRIORITIES_2025 |

---

## 🚀 **Remaining Active Tasks** (Priority Order)
