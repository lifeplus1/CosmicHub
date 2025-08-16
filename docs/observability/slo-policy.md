# SLO & Error Budget Policy

---
Status: Review
Owner: Observability Steward
Last-Updated: 2025-08-16
Next-Review: 2025-09-15
Source: Manual
---

## 1. Objectives (Initial Set)

- Availability (core public API surface) \>= 99.5% rolling 30d
- Latency: p95 for `POST /calculate` < 1200ms rolling 7d
- Latency: p95 for `GET /stripe/subscription-status` < 800ms rolling 7d
- Error Rate: 5xx responses < 2% rolling 1h

## 2. Key Terms

- SLI (Service Level Indicator): Quantitative measurement (e.g., p95 latency, availability %).
- SLO (Service Level Objective): Target/goal for an SLI (includes threshold + window).
- Error Budget: 100% - SLO (expressed in minutes of downtime or % of bad events allowed).

## 3. Measurement & Instrumentation

| Objective | SLI Query Concept | Source | Notes |
|-----------|------------------|--------|-------|
| Availability | (successful_requests / total_requests)*100 | API gateway / FastAPI metrics | Counts 2xx + 3xx as success. |
| Latency p95 `/calculate` | histogram_quantile(0.95, sum by(le) (rate(http_request_duration_seconds_bucket{route="/calculate"}[5m]))) | Prometheus | Trim warmup. |
| Latency p95 `/stripe/subscription-status` | Same pattern filtered on route | Prometheus | |
| Error Rate | rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) | Prometheus | Includes upstream timeouts mapped to 502/504. |

## 4. Error Budget Calculation

- Availability budget (30d): 30 days × 24h × 60m = 43,200 minutes.
- With 99.5% target → 0.5% allowable = 216 minutes of unavailability per 30d window.
- Track burned minutes whenever availability < 100% in a 1‑minute slice: budget_burn += (1 - availability_slice%) * 1m.

## 5. Alerting Policy

| Condition | Threshold | Window | Action |
|-----------|-----------|--------|--------|
| Fast Burn | >10% of monthly error budget consumed in < 2h | 2h | Page on-call immediately; declare incident if user impact confirmed. |
| Slow Burn | >30% budget consumed in < 7d | 7d | Open investigation ticket; prioritize mitigation in current sprint. |
| Latency Breach | p95 `/calculate` > 1200ms for 3 consecutive 5m periods | 15m | Triage: check saturation (CPU, external deps). |
| Error Rate Spike | 5xx rate >2% for 5m | 5m | Page on-call; capture traces & recent deploys. |
| Near Exhaustion | 75% monthly budget used | Rolling 30d | Add change freeze consideration; weekly review escalated. |

## 6. Reporting & Cadence

- Automated weekly SLO report (cron CI) → commit artifact & Slack summary.
- Monthly review: adjust objectives only with product + engineering sign-off.
- Post-incident: recalc budget remaining & update burn projection.

## 7. Ownership

- SLO Steward: Observability lead (rotating quarterly).
- On‑call engineers ensure real-time response; steward ensures definition hygiene.

## 8. Change Control

- Proposal PR modifies this file + accompanying dashboard screenshots.
- Require approval: 1 platform engineer + 1 product owner.

## 9. Exceptional Circumstances

- Force majeure events (cloud-wide outage) logged separately; may be excluded from objective only with retro approval documented in postmortem.

## 10. Future Candidates

- Client-perceived latency (RUM) for initial chart render.
- Background job success ratio once async queue is introduced.

Status: v0.1 (initial operational draft). Update after 2 cycles of data.
