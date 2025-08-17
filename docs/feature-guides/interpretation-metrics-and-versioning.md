# Interpretation Metrics & Versioning

## Overview

The interpretation generation pipeline now exposes Prometheus metrics and embeds a schema version in responses for compatibility and observability.

## Schema Versioning

* Constant: `INTERPRETATION_SCHEMA_VERSION` (currently `1.0.0`)
* Injected fields in API responses:
  * `version`
  * `schemaVersion` (alias, same value)
* Added automatically on cache hits and newly generated interpretations.
* Backward compatibility: Legacy cached entries missing these fields are rehydrated on access.

## Prometheus Metrics

Metric names (enabled when `ENABLE_METRICS=true`):

| Metric | Type | Labels | Description |
| ------ | ---- | ------ | ----------- |
| `interpretations_total` | Counter | `result`, `level` | Total interpretation generation attempts categorized by result (success, error, http_error) and requested level. |
| `interpretation_generation_seconds` | Histogram | (none) | Latency distribution for interpretation generation (buckets: 0.05, 0.1, 0.25, 0.5, 1, 2, 5). |
| `interpretation_cache_events_total` | Counter | `event` | Cache hit/miss events for interpretation retrieval. |
| `http_requests_total` | Counter | path, method, status | Global HTTP request counts (core middleware). |
| `http_request_latency_seconds` | Histogram | path, method, status | Request latency distribution. |

Endpoint: `/metrics`

## Environment Variables

| Variable | Default | Purpose |
| -------- | ------- | ------- |
| `ENABLE_METRICS` | `true` | Toggles metrics registration. |
| `INTERPRETATION_CACHE_TTL` | `1800` | Seconds TTL for interpretation cache entries. |
| `ENABLE_TRACING` | `true` | Enables tracing (now requires `OTEL_EXPORTER_OTLP_ENDPOINT`). |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | (unset) | If set with `ENABLE_TRACING=true`, tracing exporter is configured; otherwise a no-op tracer is used. |

## Version Drift Guard (CI)

CI workflow checks for changes to `ai_interpretations.py` without a corresponding version bump of `INTERPRETATION_SCHEMA_VERSION`.

## Testing

Key tests:

* `test_chart_and_interpretation_flow.py` – ensures version fields present.
* `test_metrics_interpretation.py` – metrics exposure smoke test.
* `test_challenging_aspects.py` – aspect classification logic.
* `test_interpretation_backward_compat.py` – legacy cache version rehydration.

## Upgrading Schema

1. Update `INTERPRETATION_SCHEMA_VERSION`.
2. Document changes in this file and any migration notes.
3. Add / update tests for new fields or structural differences.

## Future Enhancements

* Add per-user cardinality control on counters if high-cardinality labels are introduced.
* Add RED metrics (rate, errors, duration) per interpretation level.
* Emit structured events for interpretation generation for external analytics pipeline.
