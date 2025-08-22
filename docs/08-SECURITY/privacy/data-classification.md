# Data Classification Glossary

---

Status: Review Owner: Privacy Lead Last-Updated: 2025-08-16 Next-Review: 2025-09-15 Source: Manual

---

## 1. Tiers

| Tier       | Definition                                                           | Examples                                                                 | Handling Requirements                                                            |
| ---------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| PUBLIC     | Intended for unrestricted disclosure.                                | Marketing site content, public docs.                                     | No special controls; integrity checks.                                           |
| INTERNAL   | Non-public operational data; low impact if leaked.                   | Non-secret config values, aggregated anonymous metrics.                  | Limit to employees; basic access logging.                                        |
| SENSITIVE  | User-specific or business-confidential; moderate harm if exposed.    | User profile (non-financial), subscription tier, experiment assignments. | Auth required, encryption in transit, minimal retention.                         |
| RESTRICTED | High-risk data; legal / financial / identity or could enable misuse. | Payment method refs (tokens), auth tokens, privilege audit logs.         | Strict least privilege, encrypted at rest, rotation & monitoring, deletion SLAs. |

## 2. Mapping (Initial)

| Data Element                   | Tier       | Storage           | Retention                  | Notes                               |
| ------------------------------ | ---------- | ----------------- | -------------------------- | ----------------------------------- |
| User UID                       | SENSITIVE  | Firestore         | Life of account            | Pseudonymize in analytics.          |
| Subscription Status            | SENSITIVE  | Firestore         | Life of account            | Cache TTL short.                    |
| Stripe Customer ID             | RESTRICTED | Firestore         | Life of subscription + 90d | Treat as secret reference.          |
| Ephemeris Calculation Inputs   | SENSITIVE  | Transient / Cache | <24h (ephemeral)           | Avoid long-term persistence.        |
| Aggregated Performance Metrics | INTERNAL   | Metrics store     | 13 months                  | Comply with trend analysis horizon. |
| Experiment Assignment Logs     | SENSITIVE  | Firestore         | Experiment end + 180d      | Supports auditing & analysis.       |

## 3. Handling Guidelines

- Do not log RESTRICTED values; log hashed or tokenized surrogate.
- Minimize joins that could re-identify pseudonymized analytics.
- Access reviews quarterly for collections with RESTRICTED fields.

## 4. Retention Enforcement (Planned)

Scheduled job enumerates collections & applies TTL / deletion policies (see forthcoming
`retention-policy.md`).

## 5. Change Process

PR updating table + risk assessment; security steward approval required for downgrades.

Version: v0.1
