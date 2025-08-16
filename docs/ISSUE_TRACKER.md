# CosmicHub Issue Tracker (Lightweight Internal)

Status Legend:

- DONE = Implemented and merged
- IN-PROGRESS = Actively being developed
- PLANNED = Accepted for upcoming sprint window
- BACKLOG = Acknowledged, not yet scheduled
- DEFERRED = Explicitly postponed / re-evaluate later

| ID | Title | Status | Owner | Target | Notes | Source Doc |
|----|-------|--------|-------|--------|-------|------------|
| UI-001 | Complete Synastry analysis backend integration | URGENT | you | 2025-08-20 | Currently pure UI mockup, needs calculation logic **→ Send domain logic to Grok** | Frontend Analysis |
| UI-002 | Implement AI interpretation service integration | PLANNED | you | 2025-08-21 | Has structure but needs XAI/Grok API integration **→ Send content templates to Grok** | Frontend Analysis |
| UI-003 | Complete chart saving/loading CRUD functionality | PLANNED | you | 2025-08-22 | Partial implementation, needs full persistence **→ Use Claude 3.5 Sonnet** | Frontend Analysis |
| TEST-001 | Integration test enrichment (healwave-astro path) | PLANNED | you | 2025-08-19 | Add real component render + assertions | PROJECT_PRIORITIES_2025 |
| EXP-002 | A/B modal variant content | PLANNED | you | 2025-08-19 | Use analytics hook to condition content | PROJECT_PRIORITIES_2025 |
| OBS-003 | Synthetic journey script | IN-PROGRESS | you | 2025-08-21 | Script scaffold + log output JSON | slo-policy.md |
| OBS-004 | Weekly SLO report automation | PLANNED | you | 2025-08-22 | Cron + markdown summary artifact | slo-policy.md |
| SEC-002 | Secret inventory generator | PLANNED | you | 2025-08-21 | Produce JSON consumed by check_secret_ages.py | secret-rotation.md |
| PRIV-004 | Persist & rotate pseudonymization salts | PLANNED | you | 2025-08-23 | Firestore (or file) store + rotation policy | pseudonymization.md |
| SEC-005 | CSP rollout phase 2 | PLANNED | you | 2025-08-23 | Tighten directives / aggregate violations | csp-rollout.md |
| REL-005 | Degradation metrics instrumentation | PLANNED | you | 2025-08-26 | Cache age, fallback counts, retry queue gauge | degradation-matrix.md |
| OBS-012 | Synthetic anomaly detection & daily rollup | IN-PROGRESS | you | 2025-08-21 | Analyze log + daily markdown summary | slo-policy.md |
| OBS-010 | Prometheus alert rules | BACKLOG | you | 2025-09-05 | Pending metrics + synthetic baseline | slo-policy.md |
| OBS-011 | Performance metrics dashboard | BACKLOG | you | 2025-09-10 | Grafana panel skeleton | slo-policy.md |
| REL-010 | Circuit breaker + backoff helper | BACKLOG | you | 2025-09-12 | Disable by default until tuned | degradation-matrix.md |
| REL-011 | Fallback outcome logging normalization | BACKLOG | you | 2025-09-12 | Structured schema for fallbacks | degradation-matrix.md |
| SEC-006 | Threat model mitigation batch 1 | BACKLOG | you | 2025-09-01 | Top risk items only (see threat-model) | threat-model.md |
| SEC-007 | Abuse anomaly detection | BACKLOG | you | 2025-09-15 | Derive thresholds from rate limit logs | threat-model.md |
| SEC-008 | Input validation hardening | BACKLOG | you | 2025-09-20 | Centralize schemas & tighten constraints | threat-model.md |
| PRIV-005 | Salt rotation automation + audit log | BACKLOG | you | 2025-09-05 | Depends on PRIV-004 storage design | pseudonymization.md |
| PRIV-006 | Pseudonymization risk review & collision monitor | BACKLOG | you | 2025-09-18 | Script to sample & check hash distribution | pseudonymization.md |
| EXP-010 | Experiment registry schema validator | BACKLOG | you | 2025-09-25 | TS/Zod -> JSON Schema generation | registry.md |
| EXP-011 | Guardrail breach automation | BACKLOG | you | 2025-09-30 | Auto flag + Slack/webhook prototype | guardrails.md |
| UX-020 | Offline mode for chart data | BACKLOG | you | 2025-10-15 | Service worker caching strategy | PROJECT_PRIORITIES_2025 |
| UX-021 | Mobile PWA enhancements | BACKLOG | you | 2025-10-20 | Manifest audit + install prompt | PROJECT_PRIORITIES_2025 |
| A11Y-030 | Screen reader & keyboard sweep | BACKLOG | you | 2025-09-30 | Axe scan + manual flow tests | PROJECT_PRIORITIES_2025 |
| COLLAB-050 | Real-time collaborative chart sharing | DEFERRED | you | TBD | Requires auth/session scaling review | PROJECT_PRIORITIES_2025 |
| SOCIAL-060 | Community sharing & marketplace scaffolding | DEFERRED | you | TBD | After reliability/security baseline | PROJECT_PRIORITIES_2025 |
| AI-070 | Advanced model integration (post privacy review) | DEFERRED | you | TBD | Requires PRIV-006 results | PROJECT_PRIORITIES_2025 |

Cross-reference: Update status here first, then reflect major milestone shifts in `PROJECT_PRIORITIES_2025.md`.
