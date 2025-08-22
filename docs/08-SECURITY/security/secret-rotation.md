# Secret Rotation Policy

---

Status: Review Owner: Security Steward Last-Updated: 2025-08-16 Next-Review: 2025-11-14 Source:
Manual

---

## 1. Scope

Applies to: API keys (Stripe, Firebase Admin), service account JSON, JWT signing keys, database
credentials, Redis auth tokens, CI/CD tokens, webhook secrets, encryption salts (pseudonymization).

## 2. Principles

1. Least Lifetime: Keys live only as long as necessary.
2. Automate Where Feasible: Scheduled rotation scripts / workflows.
3. Immediate Revocation on Suspicion: Compromise > scheduled cadence.

## 3. Rotation Intervals

| Secret Type                                                | Interval                     | Justification                                    |
| ---------------------------------------------------------- | ---------------------------- | ------------------------------------------------ |
| Production API Keys (Stripe, 3rd party)                    | 90 days                      | Industry baseline.                               |
| JWT Signing Key (HS/RS)                                    | 60 days                      | High blast radius; supports key rollover header. |
| Service Account Keys                                       | 90 days                      | Balance toil vs risk.                            |
| CI/CD Tokens (GitHub Actions OIDC issuers minimize static) | 180 days (fallback)          | OIDC preferred; static minimized.                |
| Webhook Secrets                                            | 90 days                      | Reduces replay risk.                             |
| Encryption Salts (analytics pseudonymization)              | 180 days with overlap window | Ensure re-identification risk mitigation.        |
| Emergency / Compromise                                     | Immediate                    | Incident response.                               |

## 4. Process Overview

1. Inventory: `scripts/security/list_secrets.py` (planned) emits current secret metadata (age, last
   rotated).
2. Pre-Rotation Validation: Confirm no pending deploy relying on deprecated key.
3. Generate New Secret: Use approved internal tooling / provider console.
4. Dual Key Window (where supported): Add new key → deploy → remove old after verification.
5. Verification: Health checks + synthetic journey pass.
6. Record: Append rotation event to `logs/security/secret-rotation.log` (include user/tool,
   timestamp, secret class, old key ref hash).

## 5. Emergency Rotation

- Trigger: Suspicious access logs, leaked commit, provider advisory.
- Actions: Revoke old key immediately → generate new → invalidate sessions (if auth key) → incident
  postmortem.

## 6. Automation Backlog

- Script: Age report failing CI if any secret age > defined threshold.
- GitHub Action: Monthly rotation reminder issue creation.
- Secret Scanner: Leaks detection (gitleaks / trufflehog) integrated with PR gating.

## 7. Auditing & Evidence

- Quarterly audit: reconcile inventory vs live secrets.
- Store cryptographic hash (SHA256 first 8 bytes) as non-sensitive reference.
- Maintain exception list with expiry dates.

## 8. Exceptions

Granted only if rotation breaks provider-issued quota or no dual-key support; must have mitigation
plan and review date.

## 9. Ownership

- Security steward maintains policy; infra engineer executes automation tasks.

Version: v0.1 (initial). Review in 90 days.
