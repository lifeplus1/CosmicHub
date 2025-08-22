# Threat Model for CosmicHub (FastAPI + Firebase + Stripe System)

---

Status: Review Owner: Security Steward Last-Updated: 2025-08-16 Next-Review: 2025-09-15 Source: Grok
Generated + Manual Edits

---

## Overview

This threat model applies the STRIDE framework (Spoofing, Tampering, Repudiation, Information
Disclosure, Denial of Service, Elevation of Privilege) to the CosmicHub system. The system comprises
a React frontend (apps/astro and apps/healwave), a FastAPI backend for astrology calculations and
API routing, Firebase for authentication and Firestore database, and Stripe for subscription
payments. Key integrations include AI chatbots, chart generation (e.g., astrology, numerology, human
design), and frequency generation modules.

The model focuses on security while aligning with performance optimizations (e.g., rate limiting to
prevent DoS impacting load times, caching to reduce unauthorized data fetches). It identifies
assets, trust boundaries, STRIDE threats per component, and mitigations. This is a draft stub to be
expanded based on ongoing development.

## Assets & Data Flows

### Key Assets

- **User Data**: Birth details (date, time, location), profiles, saved charts (astrology,
  numerology, gene keys, human design), AI interpretations, and personality analyses. Stored in
  Firestore; sensitive due to personal nature.
- **Authentication Tokens**: Firebase JWTs for user sessions.
- **Payment Information**: Subscription details and billing (handled via Stripe tokens; no full card
  data stored locally).
- **API Credentials**: Firebase service account keys, Stripe API keys, and environment variables
  (e.g., from .env: API_KEY, FIREBASE_CREDENTIALS).
- **Computed Data**: Ephemeris data, transit analyses, synastry charts—derived from user inputs and
  Swiss Ephemeris library.
- **System Logs**: Audit logs for API calls, errors, and usage tracking (e.g., for premium
  features).
- **Code and Configurations**: Backend routes (e.g., /charts, /subscriptions), Firestore rules, and
  Docker images.

### Data Flows

1. **User Registration/Login**: Frontend → Firebase Auth → Backend (token validation).
2. **Chart Calculation**: Frontend submits birth data → Backend (FastAPI) computes via PySwissEph →
   Stores in Firestore → Returns to frontend.
3. **AI Interpretation**: User query → Backend AI service (e.g., integrations/xaiService) →
   Processes and stores results.
4. **Subscription Purchase**: Frontend → Stripe API (via backend proxy) → Updates Firestore
   subscription status.
5. **Frequency Generation**: Shared modules (packages/frequency) flow between astro and healwave
   apps, integrating binaural beats with astrology data.
6. **Ephemeris Queries**: Backend → Internal ephemeris_server for performance-optimized calculations
   (cached in Redis where applicable).

Flows emphasize modularity (e.g., shared auth/subscriptions packages) and performance (batched
Firestore reads, lazy loading in frontend).

## Trust Boundaries

Trust boundaries define where trust changes, requiring controls like authentication or encryption.

- **Client-Server Boundary**: Untrusted client (browser/PWA) interacts with trusted backend via
  HTTPS. Assume clients can be malicious (e.g., tampered requests).
- **Backend-Firebase Boundary**: Backend trusts Firebase for auth and data storage but enforces
  rules (e.g., Firestore security rules prevent direct client access).
- **Backend-Stripe Boundary**: Backend proxies Stripe calls; trusts Stripe for payment processing
  but validates webhooks.
- **Internal Component Boundaries**: Within monorepo (TurboRepo), trust shared packages (e.g., auth,
  integrations) but isolate apps (astro vs. healwave) to prevent cross-app data leaks.
- **External Integrations**: Backend to external services (e.g., XAI API via
  packages/integrations/xaiService)—rate-limited and credential-protected.
- **Deployment Boundaries**: Docker containers (e.g., backend, ephemeris_server) isolated;
  Vercel/Render hosting with environment variables secured.

## STRIDE per Component

Components are derived from project structure (e.g., backend/api/routers, apps/astro/components).
Threats are categorized by STRIDE, focusing on high-impact risks.

### Component: Frontend (React Apps - astro/healwave)

- **Spoofing**: Attacker impersonates user via stolen session cookies.
- **Tampering**: Client-side data manipulation (e.g., altering birth inputs before API submission).
- **Repudiation**: User denies actions (e.g., chart saves) without logging.
- **Information Disclosure**: Exposure of local storage tokens or console logs.
- **Denial of Service**: Resource exhaustion via infinite loops in components (e.g., AIChat.tsx).
- **Elevation of Privilege**: Bypassing feature guards (e.g., PremiumFeaturesDashboard.tsx) via dev
  tools.

### Component: Backend API (FastAPI - backend/api/routers)

- **Spoofing**: Fake API calls without valid Firebase token (e.g., /charts endpoint).
- **Tampering**: Modifying request payloads (e.g., injecting invalid ephemeris data in
  calculations.py).
- **Repudiation**: Unlogged API actions (e.g., subscription changes via stripe_router.py).
- **Information Disclosure**: Leaking sensitive data in responses (e.g., full user profiles from
  charts.py).
- **Denial of Service**: Flooding endpoints (e.g., high-load transit calculations in
  transits_clean.py).
- **Elevation of Privilege**: Exploiting weak auth to access admin routes.

### Component: Firebase (Auth & Firestore)

- **Spoofing**: Token forgery or replay attacks.
- **Tampering**: Direct Firestore writes bypassing rules (e.g., altering subscription status).
- **Repudiation**: Lack of audit trails for data changes.
- **Information Disclosure**: Misconfigured rules exposing user data (e.g., birth details).
- **Denial of Service**: Query bombs overwhelming Firestore indices.
- **Elevation of Privilege**: Escalating from user to admin via insecure rules.

### Component: Stripe Integration (backend/api/stripe_integration.py)

- **Spoofing**: Fake webhooks from Stripe.
- **Tampering**: Altering payment intents or subscription metadata.
- **Repudiation**: Disputes over transactions without logs.
- **Information Disclosure**: Accidental logging of payment tokens.
- **Denial of Service**: Repeated failed payment attempts exhausting resources.
- **Elevation of Privilege**: Using test keys in prod to bypass payments.

### Component: Ephemeris Server (ephemeris_server)

- **Spoofing**: Impersonating internal calls.
- **Tampering**: Corrupting ephemeris files (e.g., seas_18.se1).
- **Repudiation**: Untracked computations.
- **Information Disclosure**: Exposing raw astronomical data.
- **Denial of Service**: Overloading with bulk queries.
- **Elevation of Privilege**: Accessing server internals via debug endpoints.

### Component: Shared Packages (e.g., packages/auth, packages/integrations)

- **Spoofing**: Misusing shared auth tokens across apps.
- **Tampering**: Altering shared utils (e.g., subscription-utils.ts).
- **Repudiation**: Cross-app actions without attribution.
- **Information Disclosure**: Leaks in cross-app stores (e.g., useCrossAppStore.ts).
- **Denial of Service**: Inefficient shared hooks causing bottlenecks.
- **Elevation of Privilege**: Escalating via shared contexts (e.g., SubscriptionProvider.tsx).

## Mitigations & Gaps

Mitigations prioritize security standards (e.g., strict Firestore rules, rate limiting) while
enhancing performance (e.g., caching reduces DoS impact). Gaps highlight areas for improvement.

| Threat Category        | Component       | Mitigation                                                                          | Implementation Details                                                 | Gaps/Recommendations                                                             |
| ---------------------- | --------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Spoofing               | All             | Firebase JWT validation; HTTPS everywhere.                                          | Use auth.py in backend; enforce in Firestore rules.                    | Gap: No MFA; Add via Firebase console (Issue: SEC-001).                          |
| Tampering              | Backend API     | Input validation with Pydantic models (e.g., models/ephemeris.py); CSRF protection. | Strict TypeScript in frontend; backend uses typing_helpers.py.         | Gap: No request signing; Implement HMAC for critical endpoints (Issue: SEC-002). |
| Tampering              | Frontend        | Memoization and immutability in React components (e.g., useAIInterpretation.ts).    | Leverage Radix UI for secure forms; code splitting to isolate.         | Gap: Client-side tampering easy; Suggest content security policy (CSP).          |
| Repudiation            | Firebase/Stripe | Comprehensive logging with timestamps/user IDs.                                     | Use Firebase audit logs; backend logs to app.log via settings.py.      | Gap: No centralized logging; Integrate ELK or OpenSearch stack (Issue: OBS-003). |
| Information Disclosure | All             | Environment variables (Vercel secrets); no sensitive data in responses.             | Firestore rules restrict reads; Stripe tokens not stored.              | Gap: Potential console leaks; Add obfuscation in production builds.              |
| Information Disclosure | Backend         | Data minimization in APIs (e.g., return only necessary chart fields).               | Use utils/ephemeris_client.py with redaction.                          | Gap: AI responses may leak PII; Sanitize via ai_service.py (Issue: PRIV-004).    |
| Denial of Service      | Backend API     | Rate limiting (e.g., FastAPI middleware); Redis caching for queries.                | Horizontal scaling via Docker; TurboRepo for efficient builds.         | Gap: No auto-scaling; Monitor with Prometheus (Issue: REL-005).                  |
| Denial of Service      | Firebase        | Indexed queries; query limits in Firestore.                                         | Batched reads in api.ts; performance monitoring via usePerformance.ts. | Gap: High-load transits; Optimize transits_clean.py with async.                  |
| Elevation of Privilege | All             | Role-based access (e.g., premium vs. free via SubscriptionProvider.tsx).            | Strict Firestore rules; feature guards in FeatureGuard.tsx.            | Gap: No least-privilege in shared packages; Audit integrations (Issue: SEC-006). |

### Top 5 Prioritized Mitigations

1. SEC-002 Request signing for critical POST endpoints (/calculate, subscription mutations)
2. PRIV-004 AI output PII sanitation pass (regex + allowlist)
3. SEC-001 Add optional MFA for privileged actions (billing changes)
4. OBS-003 Centralized log aggregation (structured JSON -> OpenSearch)
5. REL-005 Auto-scaling or at least saturation alerting rules (CPU, queue depth) | Elevation of
   Privilege | Stripe | Webhook signature verification. | In stripe_service.py; test via
   STRIPE_TESTING_GUIDE.md. | Gap: Test/prod key mix-up; Automate via scripts/validate-env.mjs. |

This model aligns with robustness (error boundaries in ErrorBoundary.tsx) and security guidelines
(e.g., SECURITY_GUIDE.md). Next steps: Validate via penetration testing; refine based on
PHASE_4_PRODUCTION_OPTIMIZATION.md for performance-security balance. Suggest updating project
instructions to include automated threat scanning in CI/CD.
