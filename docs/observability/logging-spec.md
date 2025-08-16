# Logging Field Specification (Draft)

Field | Type | Description | Example
---|---|---|---
ts | string | ISO8601 timestamp | 2025-08-16T12:34:56Z
level | string | Log level | INFO
service | string | Service name | cosmichub-backend
logger | string | Logger name | backend.main
msg | string | Message text | access
request_id | string | Correlation ID (from X-Request-ID) | 3f1e...
trace_id | string | OpenTelemetry trace ID (if tracing enabled) | 4bf92f...
span_id | string | OpenTelemetry span ID | 00f067...
path | string | HTTP path | /calculate
method | string | HTTP method | POST
status_code | int | HTTP status | 200
duration_ms | int | Request duration | 245
client_ip | string | Remote IP | 127.0.0.1
user_id | string | Authenticated user UID (if available) | uid_123
error | string | Error message summary | ValidationError
exc_info | string | Stack trace (only on errors) | Traceback...

## Conventions

1. Redact or omit PII fields; only store anonymized_user_id or hash if needed.
2. Never log raw tokens / secrets.
3. Attach `request_id` to every log in request scope.
4. For background tasks, propagate trace context where possible.
5. Error logs must include an actionable `msg` plus structured context fields.

## Next Steps

- Add user_id enrichment middleware (post-auth) to include UID.
- Add trace/span ID injection via OpenTelemetry logging bridge if required.
- Finalize retention & rotation policy (target: 14d hot, 30d cold export).
