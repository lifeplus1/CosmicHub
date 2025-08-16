# CosmicHub Roadmap

- Threat model narrative sections ✅ [docs/security/threat-model.md](docs/security/threat-model.md)
- Incident runbook template boilerplate ✅ [docs/runbooks/template.md](docs/runbooks/template.md)
- Experiment registry schema documentation prose ✅ [docs/experimentation/registry.md](docs/experimentation/registry.md)
- Data classification glossary definitions ✅ [docs/privacy/data-classification.md](docs/privacy/data-classification.md)
- Guardrail metrics explanation for stakeholders 🟡 [docs/experimentation/guardrails.md](docs/experimentation/guardrails.md)
- SLO & error budget policy narrative & exemplar calculations ✅ [docs/observability/slo-policy.md](docs/observability/slo-policy.md)
- Secret rotation policy & RBAC matrix documentation 🟡 [docs/security/secret-rotation.md](docs/security/secret-rotation.md)
- Performance & capacity planning narrative (growth assumptions) ✅ [docs/operations/capacity-planning.md](docs/operations/capacity-planning.md)
- Experiment lifecycle & statistical governance doc ✅ [docs/experimentation/lifecycle.md](docs/experimentation/lifecycle.md)
- Privacy pseudonymization & retention rationale ✅ [docs/privacy/pseudonymization.md](docs/privacy/pseudonymization.md)
- Incident postmortem template & rubric ✅ [docs/runbooks/postmortem-template.md](docs/runbooks/postmortem-template.md)
- API graceful degradation & fallback matrix ✅ [docs/operations/degradation-matrix.md](docs/operations/degradation-matrix.md)
- Security headers & CSP rollout rationale 🟡 [docs/security/csp-rollout.md](docs/security/csp-rollout.md)
...existing code...
-- Threat model narrative sections ✅ (see `docs/security/threat-model.md`)
-- Incident runbook template boilerplate ✅ (`docs/runbooks/template.md`)
-- Experiment registry schema documentation prose ✅ (`docs/experimentation/registry.md`)
-- Data classification glossary definitions ✅ (`docs/privacy/data-classification.md`)
-- Guardrail metrics explanation for stakeholders 🟡 (`docs/experimentation/guardrails.md`)
-- SLO & error budget policy narrative & exemplar calculations ✅ (`docs/observability/slo-policy.md`)
-- Secret rotation policy & RBAC matrix documentation 🟡 (`docs/security/secret-rotation.md`)
-- Performance & capacity planning narrative (growth assumptions) ✅ (`docs/operations/capacity-planning.md`)
-- Experiment lifecycle & statistical governance doc ✅ (`docs/experimentation/lifecycle.md`)
-- Privacy pseudonymization & retention rationale ✅ (`docs/privacy/pseudonymization.md`)
-- Incident postmortem template & rubric ✅ (`docs/runbooks/postmortem-template.md`)
-- API graceful degradation & fallback matrix ✅ (`docs/operations/degradation-matrix.md`)
-- Security headers & CSP rollout rationale 🟡 (`docs/security/csp-rollout.md`)

## CosmicHub Operational Roadmap (Phase: Production Hardening)

> Alignment (Aug 16 2025): High-level capability roadmap. Granular, time-sequenced tasks now tracked in `docs/PROJECT_PRIORITIES_2025.md` with IDs (OBS-, SEC-, PRIV-, REL-, EXP-). Keep this file thematic; avoid sprint-level duplication.

## 1. Structured Observability

- [x] Request ID middleware & JSON logs (FastAPI)
- [x] Correlate frontend -> backend via X-Request-ID propagation (fetch interceptor in `apps/healwave/src/auth.ts`)
- [x] OpenTelemetry tracing (HTTP + key endpoints; Firestore & Stripe span attributes partial – Firestore ops next)
- [x] Metrics: latency histograms per endpoint, error_rate, p95 chart calc (Prometheus histograms & counter; p95 via SLO script)
- [ ] Synthetic journey: signup -> subscription -> chart -> save preferences (see OBS-003)
- [x] Structured log field spec (service, trace_id, span_id, anonymized_user_id) (`docs/observability/logging-spec.md`)
- [ ] Frontend error reporter includes X-Request-ID in payload
- [ ] Central log dashboard (top errors, p95 latency, saturation, error budget burn)
- [ ] Alert rules defined (p95 latency > SLO 5m, 5xx rate >2%, synthetic failure) (OBS-010)
- [ ] Tracing sampling strategy (parent-based; 100% errors, 10% baseline)

## 2. Reliability & Resilience

- [x] Define SLOs: availability 99.5%, p95 /calculate < 1200ms (`docs/observability/slo-policy.md`)
- [x] Error budget policy & weekly review (documented; automation refinement OBS-004)
- [ ] k6 load test scripts committed (baseline & stress)
- [ ] Chaos tests: inject Firestore latency, Redis down, external API timeout
- [x] Graceful degradation guidelines doc (`docs/operations/degradation-matrix.md`)
- [x] Capacity model & projected growth assumptions doc (`docs/operations/capacity-planning.md`)
- [ ] Retry & timeout policy matrix (service -> timeout/retries/backoff)
- [ ] Fallback behaviors implemented (degraded chart mode on external failure)
- [ ] Circuit breaker PoC for Stripe & Firestore hot paths
- [x] Automated weekly SLO report generation script (`scripts/observability/generate_slo_report.py`)

## 3. Security & Compliance

- [x] Threat model document (STRIDE sections) (`docs/security/threat-model.md`)
- [ ] Automated dep scanning (Dependabot + pip-audit + npm audit GitHub Action)
- [ ] Firebase rules review & least privilege matrix
- [x] Rate limit refinement per auth tier (baseline implemented; anomaly detection next SEC-007)
- [x] Data classification inventory (tiers documented; retention schedule pending)
- [x] Secret rotation policy (policy + age check stub; automation pending SEC-002)
- [ ] RBAC enforcement audit checklist & remediation tasks
- [ ] Security headers + CSP (report-only -> enforce) rollout (phase 1: report endpoint; phase 2 tightening SEC-005)
- [ ] Anomaly detection rules (role elevation spike, auth failures surge)
- [ ] SBOM (CycloneDX) generation in CI

## 4. Cost & Performance Optimization

- [ ] Firestore read pattern audit (cache preference docs; batch writes)
- [ ] Bundle size tracking CI (fail > +30KB gzip delta)
- [ ] Server profiling session (cProfile) for heavy calc endpoints
- [ ] Adaptive concurrency limits & queue backpressure design
- [ ] Firestore cost dashboard (reads/writes per feature)
- [ ] Caching layer evaluation (in-memory vs edge) for ephemeris data
- [ ] Cold start latency tracking (if any serverless functions)
- [ ] Performance budget doc (TTI, LCP, CLS thresholds) & gating
- [ ] Micro-benchmark harness for critical calc functions

## 5. Experimentation Maturity

- [x] Central experiment registry JSON schema (doc) + [ ] validator (EXP-010)
- [x] Guardrail metrics documentation (util pending EXP-011)
- [ ] Automated variant exposure event schema tests
- [x] Experiment lifecycle checklist (`docs/experimentation/lifecycle.md`)
- [ ] Sequential test overlap guard rules
- [ ] Statistical config doc (alpha, MDE, power assumptions)
- [ ] Sample size calculator CLI/utility
- [ ] Archive assignments export & reproducibility storage

## 6. DevEx & Runbooks

- [x] Incident runbook templates (auth outage, billing errors, latency spike) (`docs/runbooks/template.md`, `docs/runbooks/postmortem-template.md`)
- [ ] One-command local env bootstrap script verification
- [x] Pre-push git hook: lint, type-check (ts & py), fast test subset
- [ ] Flaky test quarantine tagging convention
- [ ] Developer onboarding 15‑min quickstart guide
- [ ] CI pipeline time budget & optimization backlog
- [ ] Delivery metrics dashboard (change failure rate, MTTR)
- [ ] Release checklist automation script
- [ ] Local mock services docker-compose enhancements

## 7. Privacy & User Rights

- [ ] Data deletion pipeline (user -> scrub Firestore + derived caches)
- [ ] Export my data endpoint design
- [ ] Audit log for privilege changes
- [ ] DSAR SLA tracking & dashboard
- [x] Pseudonymization strategy for analytics events (`docs/privacy/pseudonymization.md`; utility implemented; salt persistence PRIV-004/005)
- [ ] Differential privacy / aggregation feasibility note
- [ ] Automated retention enforcement job
- [ ] Privacy policy update checklist linked to schema changes

## 8. Multi-Region & Scalability (Later Phase)

- [ ] Read replica / edge caching evaluation
- [ ] Stateless calc service containerization baseline metrics
- [ ] Disaster recovery drill (restore from backup) rehearsal log
- [ ] Multi-region data locality & latency assessment
- [ ] Active-passive failover runbook
- [ ] Traffic shadowing harness (prod -> staging)
- [ ] Asynchronous job queue design & prototype
- [ ] Global latency synthetic monitoring per region

## Items Suitable to Draft with Grok Assistance

⚡ **AI Model Strategy Complete**: Comprehensive recommendations available in [`docs/AI_MODEL_RECOMMENDATIONS.md`](docs/AI_MODEL_RECOMMENDATIONS.md)

Provide to Grok for first-pass elaboration, then refine internally. Status legend:
✅ = Complete/Implemented, 🟡 = Partially Complete, ⏳ = In Progress, ❌ = Not Started

**Recommended for Grok Integration:**

- Astrological domain logic and calculation formulas (UI-001 Synastry)
- AI interpretation templates and content frameworks (UI-002)
- Mathematical analysis and statistical computations
- Creative content generation for user-facing features

**Better with GitHub Copilot Models:**

- Code implementation (use Claude 3.5 Sonnet for React/Python)
- System architecture and infrastructure (use GPT-4o)
- Testing and quality assurance (use Claude 3.5 Sonnet)
- Security policies and compliance (use GPT-4o)

- Threat model narrative sections ✅ [docs/security/threat-model.md](docs/security/threat-model.md)
- Incident runbook template boilerplate ✅ [docs/runbooks/template.md](docs/runbooks/template.md)
- Experiment registry schema documentation prose ✅ [docs/experimentation/registry.md](docs/experimentation/registry.md)
- Data classification glossary definitions ✅ [docs/privacy/data-classification.md](docs/privacy/data-classification.md)
- Guardrail metrics explanation for stakeholders 🟡 [docs/experimentation/guardrails.md](docs/experimentation/guardrails.md)
- SLO & error budget policy narrative & exemplar calculations ✅ [docs/observability/slo-policy.md](docs/observability/slo-policy.md)
- Secret rotation policy & RBAC matrix documentation 🟡 [docs/security/secret-rotation.md](docs/security/secret-rotation.md)
- Performance & capacity planning narrative (growth assumptions) ✅ [docs/operations/capacity-planning.md](docs/operations/capacity-planning.md)
- Experiment lifecycle & statistical governance doc ✅ [docs/experimentation/lifecycle.md](docs/experimentation/lifecycle.md)
- Privacy pseudonymization & retention rationale ✅ [docs/privacy/pseudonymization.md](docs/privacy/pseudonymization.md)
- Incident postmortem template & rubric ✅ [docs/runbooks/postmortem-template.md](docs/runbooks/postmortem-template.md)
- API graceful degradation & fallback matrix ✅ [docs/operations/degradation-matrix.md](docs/operations/degradation-matrix.md)
- Security headers & CSP rollout rationale 🟡 [docs/security/csp-rollout.md](docs/security/csp-rollout.md)

### Grok Prompt Queue (Provide these prompts & target files)

1. Threat Model Narrative -> [`docs/security/threat-model.md`](docs/security/threat-model.md) ✅
 Prompt: "Draft a STRIDE-based threat model for the CosmicHub FastAPI + Firebase + Stripe system including assets, trust boundaries, and mitigations table."
2. Incident Runbook Template -> [`docs/runbooks/template.md`](docs/runbooks/template.md) ✅
 Prompt: "Create an incident runbook markdown template with sections: Summary, Impact, Detection, Triage, Mitigation, Comms, Timeline, Root Cause, Follow-ups, Lessons Learned."
3. Experiment Registry Documentation -> [`docs/experimentation/registry.md`](docs/experimentation/registry.md) ✅
 Prompt: "Document a JSON schema for an experiment registry including fields id, name, hypothesis, metrics.primary, metrics.guardrails[], start_date, end_date, segment, owner, status."
4. Data Classification Glossary -> [`docs/privacy/data-classification.md`](docs/privacy/data-classification.md) ✅
 Prompt: "Write a data classification glossary with tiers PUBLIC, INTERNAL, SENSITIVE, RESTRICTED and examples for user profiles, subscription info, telemetry."
5. Guardrail Metrics Explanation -> [`docs/experimentation/guardrails.md`](docs/experimentation/guardrails.md) 🟡
 Prompt: "Explain guardrail metrics purpose, selection criteria, and a sample calculation for minimum sample size (MDE, alpha, power)."
6. SLO & Error Budget Policy -> [`docs/observability/slo-policy.md`](docs/observability/slo-policy.md) ✅
 Prompt: "Draft SLO policy with objectives: availability 99.5%, p95 /calculate <1200ms; define error budget calc and burn alert thresholds (2h, 24h)."
7. Secret Rotation Policy -> [`docs/security/secret-rotation.md`](docs/security/secret-rotation.md) 🟡
 Prompt: "Provide a secret rotation policy detailing rotation intervals, responsibilities, emergency rotation steps, and auditing methods."
8. Capacity Planning Narrative -> [`docs/operations/capacity-planning.md`](docs/operations/capacity-planning.md) ✅
 Prompt: "Produce a capacity planning narrative outlining demand drivers, forecasting method, headroom target (30%), and scaling triggers."
9. Experiment Lifecycle Governance -> [`docs/experimentation/lifecycle.md`](docs/experimentation/lifecycle.md) ✅
 Prompt: "Outline experiment lifecycle phases with entry/exit criteria, overlap rules, and archive requirements."
10. Privacy Pseudonymization Rationale -> [`docs/privacy/pseudonymization.md`](docs/privacy/pseudonymization.md) ✅
 Prompt: "Describe pseudonymization strategy for analytics events; hashing method, salt rotation, re-identification risk controls."
11. Incident Postmortem Template -> [`docs/runbooks/postmortem-template.md`](docs/runbooks/postmortem-template.md) ✅
 Prompt: "Generate a postmortem template emphasizing blameless analysis and action item SMART formatting."
12. API Degradation Matrix -> [`docs/operations/degradation-matrix.md`](docs/operations/degradation-matrix.md) ✅
 Prompt: "Create a fallback/degradation matrix listing key features, dependencies, failure modes, user-facing behavior, and monitoring signals."
13. CSP Rollout Plan -> [`docs/security/csp-rollout.md`](docs/security/csp-rollout.md) 🟡
 Prompt: "Draft a CSP rollout plan: inventory, report-only phase, metrics, strict mode migration, exception handling."

## Immediate Next Implementation Targets

1. Frontend propagation of X-Request-ID (fetch interceptor) & surfacing in error reports ✅
2. Add OpenTelemetry dependency & tracer init scaffold ✅
3. k6 baseline script committed under `scripts/load/` ✅
4. Dependency scanning GitHub Action workflow file ✅
5. Tracing instrumentation stubs for `/calculate` & `/stripe/subscription-status` ✅
6. Pre-push git hook script under `.hooks/` ✅
7. Structured log field spec doc stub (`docs/observability/logging-spec.md`) ✅
8. Stress k6 script `scripts/load/stress.js` ✅
9. User ID enrichment middleware ✅
10. Weekly SLO report script `scripts/observability/generate_slo_report.py` ✅
11. SBOM workflow (`.github/workflows/sbom.yml`) ✅ (pending action ref validation)

---
Generated: current session
