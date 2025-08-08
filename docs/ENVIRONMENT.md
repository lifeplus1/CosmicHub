# Environment & Secrets Strategy

This repository separates public client variables from server-only secrets to minimize accidental exposure.

## File Separation

| File | Purpose | Commit? | Contents |
|------|---------|---------|----------|
| `.env.production` | Public, Vite-exposed variables (VITE_*) | Yes (sanitized) | API base, Firebase public config, feature flags |
| `.env.production.server` | Server-only secrets | No | Database, Redis, SMTP, OAuth, observability, rate limits |
| `.env.example` | Developer template | Yes | Safe defaults & blanks |

## Naming Rules

- All variables intended for frontend bundle must use `VITE_` prefix.
- Never put secrets (passwords, private keys, connection strings) behind `VITE_`.
- Legacy prefixes (`NEXT_PUBLIC_`, `REACT_APP_`) are flagged and will be removed.
- Backend-only variables MUST NOT appear in `.env.production`.

## Public (Client) Variables

| Variable | Required (Prod) | Description |
|----------|-----------------|-------------|
| `VITE_API_URL` | Yes | Base URL for API gateway |
| `VITE_FIREBASE_API_KEY` | Yes | Firebase Web API Key (rotate regularly) |
| `VITE_FIREBASE_PROJECT_ID` | Yes | Firebase project ID |
| `VITE_FIREBASE_APP_ID` | Yes | Firebase App ID |
| `VITE_FIREBASE_AUTH_DOMAIN` | Recommended | Auth domain for OAuth flows |
| `VITE_FIREBASE_STORAGE_BUCKET` | Optional | For storage uploads |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Optional | For messaging features |
| `VITE_ENABLE_ANALYTICS` | Optional | Feature flag |
| `VITE_ENABLE_ERROR_REPORTING` | Optional | Feature flag |
| `VITE_ENABLE_PERFORMANCE_MONITORING` | Optional | Feature flag |

## Server-Only Variables

| Variable | Category | Notes |
|----------|----------|-------|
| `DATABASE_URL` | Persistence | Postgres connection string |
| `REDIS_URL` | Cache/Rate limit | Redis instance URL |
| `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASS` | Email | Credentials (keep secret) |
| `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` | OAuth | Web client credentials |
| `SENTRY_DSN` | Observability | Public or secret depending on setup |
| `NEW_RELIC_LICENSE_KEY` | Observability | Secret instrumentation key |
| `RATE_LIMIT_MAX`/`RATE_LIMIT_WINDOW` | Throttling | Applied at API edge |
| `LOG_LEVEL`/`LOG_FORMAT` | Logging | Non-secret |

## Validation Pipeline

`npm run validate-env` performs:

1. Required public checks
2. Secret leakage detection (VITE_ misuse)
3. URL validation & HTTPS enforcement in production
4. Legacy prefix warnings
5. Server-only presence warnings

## Schema Enforcement

Machine-readable schema: `schema/env.schema.json` used by `scripts/validate-env-schema.mjs` in CI.

## Adding a New Variable

1. Decide if client needs it. If yes, prefix with `VITE_`. If not, server-only file.
2. Update `docs/ENVIRONMENT.md` table.
3. Add to `schema/env.schema.json` (if public).
4. Extend allow list in `scripts/validate-env.mjs`.
5. Run `npm run validate-env` locally.

## Security Controls

- Secrets excluded from repo via `.gitignore` (`.env.production.server`).
- Optional: store encrypted server env with SOPS or inject via CI/CD variables.
- Automated validation before every build and push.

## Future Enhancements

- SOPS integration for encrypted server env.
- Secret scanning with TruffleHog or Gitleaks in CI.
- Rotational alerts for aging credentials.
