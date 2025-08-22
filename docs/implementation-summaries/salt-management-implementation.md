# Salt Management Implementation Summary

Date: 2025-08-17 Status: Active (In-Memory Prototype Stabilized + Adapter Scaffold)

## Goals

- Provide a stable, minimal salt storage & rotation layer after previous file corruption.
- Expose administrative endpoints for inspection and rotation without introducing persistence
  complexity yet.
- Enable pseudonymization utilities (`pseudonymize_user_data`, `pseudonymize_analytics_data`) to
  transparently consume salts.
- Add first-line API tests to prevent regression.

## Current Architecture

| Component                           | Responsibility                                                                                                                                                                                                      |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `utils/salt_storage.py`             | In-memory `SaltStorage` with per-user + global salts, rotation intervals, batch rotation, helpers (`get_or_create_*`), and `reset_salt_storage` for test/env override refresh.                                      |
| `utils/salt_backend.py`             | Adapter layer: `SaltBackendProtocol`, `InMemorySaltBackend`, placeholder `FirestoreSaltBackend` (currently falls back), selector + storage type helper.                                                             |
| `api/salt_management.py`            | FastAPI router (now adapter-aware) exposing status, user/global rotation, batch rotation, audit, and dev pseudonymization test endpoints (auto-refreshes backend if interval env vars appear post-start for tests). |
| `utils/pseudonymization.py`         | Hashing & pepper management; retrieves salts lazily via singleton `get_salt_storage()`.                                                                                                                             |
| `tests/test_salt_management_api.py` | Validates endpoint surface (status, rotation flow, batch rotation, dev guard, pseudonymization).                                                                                                                    |

## Key Design Decisions

- **In-memory first**: Keep logic deterministic & fast; reintroduce Firestore behind same API later.
- **Explicit response models**: Pydantic schemas for each endpoint ensure typed, forward-compatible
  contracts.
- **BackgroundTasks**: Rotation triggers return immediately while scheduling actual write operations
  (sufficient for current synchronous memory backend; remains future-proof for I/O persistence).
- **Convenience methods**: Added `get_or_create_user_salt` / `get_or_create_global_salt` to align
  with existing pseudonymization helper expectations.
- **Batch rotation**: Sequential for simplicity; instrumentation points left for future parallelism
  if needed.

## Rotation Metadata Tracked

| Field                | Meaning                                                                            |
| -------------------- | ---------------------------------------------------------------------------------- |
| `created_at`         | ISO timestamp of salt creation.                                                    |
| `last_rotated`       | Last rotation (creation counts as rotation baseline).                              |
| `rotation_count`     | Number of rotations performed (excludes initial creation).                         |
| `next_rotation`      | Scheduled timestamp based on configured interval.                                  |
| `previous_salt_hash` | First 16 hex chars of prior salt (for limited audit without exposing full secret). |

## Intervals

| Environment Variable        | Default | Applies To                |
| --------------------------- | ------- | ------------------------- |
| `USER_SALT_ROTATION_DAYS`   | 90      | Per-user salts            |
| `GLOBAL_SALT_ROTATION_DAYS` | 30      | Global (event-type) salts |

## Security Considerations (Planned Enhancements)

- Enforce admin auth dependency (placeholder noted in router).
- Move salts to encrypted at-rest storage (Firestore / KMS / Secret Manager).
- Structured audit logging (user_id, salt_type, rotation_id) with correlation IDs.
- Rate limiting on admin endpoints separate from public API throttle.
- Metric counters (rotations executed, errors, overdue salts).

## Testing Coverage (Current)

| Test                                                                             | Purpose                                                                                   |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `test_status_empty`                                                              | Verifies status schema & zero-due behavior.                                               |
| `test_user_rotation_flow`                                                        | Ensures creation (forced) + rotation path + audit visibility.                             |
| `test_batch_rotation`                                                            | Validates batch endpoint counts & initiation.                                             |
| `test_pseudonymize_dev_guard`                                                    | Dev flag enforcement & pseudonymization output.                                           |
| `test_salt_backend_selector`                                                     | Ensures Firestore flag currently falls back to in-memory backend.                         |
| `test_salt_management_api_extended::test_status_storage_type_firestone_env`      | Confirms fallback storage type under `SALT_BACKEND=firestore`.                            |
| `test_salt_management_api_extended::test_status_rotation_intervals_env_override` | Verifies dynamic interval env overrides surfaced (uses reset + refresh logic).            |
| `test_salt_management_api_extended::test_force_create_user_rotation`             | Force creation path for absent user salt.                                                 |
| `test_salt_management_api_extended::test_audit_missing_user_404`                 | Missing user returns 404.                                                                 |
| `test_salt_management_api_extended::test_batch_rotation_nothing_due`             | No-op batch scenario.                                                                     |
| `test_salt_management_api_extended::test_global_salt_rotation`                   | Background global salt creation.                                                          |
| `test_pseudonymization (SaltStorage tests)`                                      | Deep unit coverage for storage, rotation intervals, batch rotation success & error paths. |

## Next Steps (Optional Roadmap)

1. Implement real Firestore backend (CRUD + transactional rotation) behind existing protocol.
2. Auth Guard & Role Enforcement (e.g., `Depends(admin_guard)`).
3. Observability: structured logs + Prometheus counters.
4. Integrity Checks: background job scanning for overdue salts & auto-rotate.
5. CLI / management script for manual rotation & reporting.
6. Formalize cryptographic review (pepper lifecycle, rotation cadence rationale).
7. Replace status refresh heuristic with explicit admin-triggered reload endpoint (reduces implicit
   behavior in prod).

## Migration Path to Persistence

1. (DONE - scaffold) Introduce `SaltBackendProtocol` (create/get/rotate primitives).
2. Implement Firestore backend (real), keep env flag `SALT_BACKEND=firestore` selecting it.
3. Optional dual-write shadow (in-memory & Firestore) + consistency verifier.
4. Performance test under rotation/batch load; add caching layer if needed.
5. Remove fallback once Firestore stable; adjust tests accordingly.

## Rationale for Minimal Batch Implementation

- Memory operations are O(n) over small sets; premature async concurrency adds noise.
- Future scaling can adopt async tasks or distributed job queue without changing external contract.

## Risks / Mitigations

| Risk                                         | Mitigation                                                                     |
| -------------------------------------------- | ------------------------------------------------------------------------------ |
| Accidental exposure of salts                 | Only metadata returned; actual salts never surfaced.                           |
| Stale salts (missed rotations)               | `get_salts_due_for_rotation` + future scheduled job.                           |
| Inconsistent API after persistence addition  | Protocol + Pydantic response models lock schema early.                         |
| Prod confusion from dynamic interval refresh | Convert test-only auto-refresh to explicit admin reload in production rollout. |

---

Maintainer Notes: Keep tests green before adding persistence complexity. For structural changes
prefer full file replacement. When implementing Firestore, add integration tests mirroring current
in-memory cases plus failure simulations (network, transaction conflicts). Remove auto-interval
refresh hack once reload endpoint exists.

## Operational Metrics (Current)

Exported via Prometheus (if ENABLE_METRICS=true):

| Metric                           | Type      | Labels             | Purpose                                                                                        |
| -------------------------------- | --------- | ------------------ | ---------------------------------------------------------------------------------------------- |
| `salt_operations_total`          | Counter   | `operation,result` | Volume + success/error ratio per op (rotate_user/global/batch/status/reload/pseudonymize_test) |
| `salts_due_total`                | Gauge     | `kind`             | Instant number of salts currently due (users or globals)                                       |
| `salt_operation_latency_seconds` | Histogram | `operation,result` | Latency distribution (p50/p90/p99 derivable) for each salt operation                           |

Recommended PromQL examples:

- p95 user rotation latency (5m):
  `histogram_quantile(0.95, sum by (le) (rate(salt_operation_latency_seconds_bucket{operation="rotate_user",result="success"}[5m])))`
- Error rate (user rotate, 5m):
  `sum(rate(salt_operations_total{operation="rotate_user",result="error"}[5m])) / sum(rate(salt_operations_total{operation="rotate_user"}[5m]))`
- Due salts total: `salts_due_total`

SLO Draft (future Firestore backend): 95% of rotate_user <250ms; 99% <750ms. Alert if p95 >250ms for
15m OR error rate >1% for 10m.
