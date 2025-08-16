# CSP Rollout Plan

---
Status: Draft
Owner: Security Steward
Last-Updated: 2025-08-16
Next-Review: 2025-09-05
Source: Manual
---

## 1. Objectives

Reduce XSS risk and untrusted resource inclusion while enabling controlled analytics / font / image sources.

## 2. Phased Approach

1. Inventory: Collect current external domains from network logs & build output.
2. Draft Policy (Report-Only): Minimal allowlist + violation reporting endpoint.
3. Tightening Iterations: Remove unused sources weekly.
4. Enforcement: Switch to `Content-Security-Policy` header once noise <3% legitimate violations for 7 consecutive days.
5. Maintenance: Quarterly review + diff new dependencies.

## 3. Initial Directive Set (Report-Only)

```text
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googletagmanager.com https://js.stripe.com;
style-src 'self' 'unsafe-inline';
img-src 'self' data: https://*.stripe.com https://*.analytics.google.com;
font-src 'self' data:;
connect-src 'self' https://api.stripe.com https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://*.analytics.google.com;
frame-src https://js.stripe.com;
report-uri /csp/report;
```

Goal: Remove `'unsafe-inline'` & `'unsafe-eval'` by introducing build-time hashing / nonces.

## 4. Violation Handling

- Endpoint aggregates reports (bucket by directive, URI) → dashboard.
- Prioritize top 5 violation sources for remediation each iteration.

## 5. Hardening Milestones

| Milestone | Target |
|-----------|--------|
| M1 | Report-only baseline active |
| M2 | Eliminate unused external script hosts |
| M3 | Replace inline scripts with modules/nonces |
| M4 | Enforce policy (no unsafe-* in script-src) |
| M5 | Add `object-src 'none'; base-uri 'self'; frame-ancestors 'none'` |

## 6. Tooling

- Optional: `csp-evaluator` for heuristic scoring.
- CI check: diff CSP header vs allowlist baseline prevents accidental broadening.

## 7. Ownership & Review

Security steward + frontend lead.

Version: v0.1
