# API Degradation / Fallback Matrix

---

Status: Adopted Owner: Reliability Lead Last-Updated: 2025-08-16 Next-Review: 2025-09-15 Source:
Manual

---

| Feature              | Primary Dependencies                      | Failure Mode           | Degraded Behavior                         | User Messaging                | Monitoring Signal                 |
| -------------------- | ----------------------------------------- | ---------------------- | ----------------------------------------- | ----------------------------- | --------------------------------- |
| Chart Calculation    | Firestore (user prefs), Ephemeris service | Ephemeris timeout      | Use last cached successful result (<=24h) | Banner: "Showing cached data" | Timeout rate, cache hit ratio     |
| Subscription Status  | Stripe API, Firestore                     | Stripe API 5xx/timeout | Assume last known status for 2h grace     | Silent unless downgrade risk  | Error rate stripe span, stale age |
| Preferences Save     | Firestore                                 | Write failure          | Queue locally (localStorage) & retry      | Toast: "Will retry syncing"   | Retry queue length                |
| A/B Variant Fetch    | Experiment config store                   | Store unreachable      | Default to control variant                | None                          | Fetch error counter               |
| Analytics Event Send | Network beacon                            | Beacon blocked         | Batch in memory until unload              | None                          | Queue size gauge                  |

Principles: Favor stale-but-valid over hard failure; surface user-facing messaging only when
correctness might materially differ.

Action Items:

1. Implement local retry queue for preference writes.
2. Cache last good ephemeris result with timestamp.
3. Add stale age metric for subscription status cache.

Version v0.1
