# Unified Serialization & Interpretation Flow Runbook

## Purpose

Ensure a consistent, type‑safe pipeline from frontend chart capture through backend storage,
caching, and AI interpretation generation.

## Data Shape (Unified Serialized Chart)

Key fields stored & cached (Python `SerializedChartData` / TS `ChartSchema`):

- planets: [{ name, sign, degree, position, house, retrograde?, aspects? }]
- houses: [{ house/number, sign, degree, cusp, ruler }]
- aspects: [{ planet1, planet2, type, orb, applying }]
- asteroids: optional[]
- angles: optional[]

Differences vs legacy internal models:

- Planets stored as list (backend normalization converts to dict keyed by lowercase name before
  interpretation).
- `position` duplicates `degree` placeholder until full 360° ecliptic longitude available.
- Some optional values become empty string "" after serialization (undefined→null→string conversion
  avoidance) – consumer code should treat "" as missing.

## Endpoints

- POST `/api/charts/save` (unified) → returns `{ chart_id, cached }` and writes serialized model
  into cache.
- POST `/api/interpretations/generate` → pulls cached chart, normalizes `planets` list→dict, runs AI
  interpretation pipeline, caches result (30m TTL) at key:
  `interpretation:{chartId}:{userId}:{type}`.

## Caching Layers

1. In‑memory or Redis (preferred if `REDIS_URL` reachable).
2. Chart save: `cache_chart_data(chart_id, serialized_model)`.
3. Interpretation: `cache_serialized_data(cache_key, interpretation_dict, 1800s)`.
4. On cache hit for interpretation, missing `id` field is injected with cache key to satisfy
   Pydantic.

## Test Coverage

Backend flow test (`test_chart_and_interpretation_flow.py`) verifies:

- 404 when interpretation requested pre‑save.
- Successful generation after save.
- Cached path returns 200 and includes cache message.

Frontend / Shared: `packages/types/src/serialize.test.ts` ensures round‑trip serialization.

## Failure Modes & Mitigations

| Stage          | Symptom                          | Cause                                  | Mitigation                                                                 |
| -------------- | -------------------------------- | -------------------------------------- | -------------------------------------------------------------------------- |
| Chart Save     | 401                              | Missing / invalid Firebase token       | `TEST_MODE=1` bypass in tests; otherwise ensure Firebase init env vars set |
| Interpretation | 404                              | Chart not cached                       | Ensure POST `/api/charts/save` executed first                              |
| Interpretation | 500 NameError                    | Missing helper in `ai_interpretations` | Stub helpers added (replace with real logic later)                         |
| Interpretation | 500 ValidationError (id missing) | Cached interpretation lacked `id`      | Automatic id injection on cache hit                                        |
| Redis          | Fallback warning                 | Connection refused                     | In‑memory cache automatically used                                         |

## Environment Flags

- `TEST_MODE=1` → bypass auth & skip Firestore persistence.
- `ENABLE_TRACING=false` → skip OpenTelemetry initialization.
- `ENABLE_METRICS=false` → disable Prometheus metrics.

## Extending Interpretation Logic

Replace placeholder helper stubs in `ai_interpretations.py` (search:
`# Additional missing helper stubs`) with domain‑rich implementations. Add unit tests before
expanding logic.

## Operational Checks

1. Save a chart: observe log `Chart cached: True`.
2. Generate interpretation: first call 200 with message "generated"; second call shows `Cache hit`
   log + message contains "cache".
3. Memory vs Redis: logs show either "Redis connection successful" or fallback warning.

## Quick Curl Smoke (Optional)

```bash
# Save chart
curl -X POST http://localhost:8000/api/charts/save \
  -H 'Authorization: Bearer test' \
  -H 'Content-Type: application/json' \
  -d '{"planets":[{"name":"Sun","sign":"Leo","degree":15.25,"house":5,"aspects":[]}],"asteroids":[],"angles":[{"name":"Ascendant","sign":"Aries","degree":12.33}],"houses":[{"number":1,"sign":"Aries","cusp":12.33,"planets":["Sun"]],"aspects":[{"planet1":"Sun","planet2":"Mercury","type":"Conjunction","orb":2.5,"applying":true}]}'

# Generate interpretation
curl -X POST http://localhost:8000/api/interpretations/generate \
  -H 'Authorization: Bearer test' \
  -H 'Content-Type: application/json' \
  -d '{"chartId":"<returned_chart_id>","userId":"dev-user","type":"natal","interpretation_level":"advanced"}'
```

## TODO / Next Steps

- Replace stub helper implementations with real analytical logic.
- Supply real planetary `position` values (0–360°) instead of mirroring `degree`.
- Add frontend integration test hitting mock backend via msw.
- Add load test for interpretation caching hit ratio.
