# @cosmichub/config

Shared configuration, utilities, and cross-app primitives for the CosmicHub monorepo.

## ApiResult Standard

All frontend (astro, healwave, shared packages) should use the unified `ApiResult<T>` from this
package to model async request outcomes.

### Shape

```ts
interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}
interface ApiFailure {
  success: false;
  error: string;
  code?: string;
  details?: unknown;
}
type ApiResult<T> = ApiSuccess<T> | ApiFailure;
```

### Helpers

- `ok(data, message?)` – build success
- `fail(error, code?, details?)` – build failure (rarely used directly now; prefer `toFailure` in
  catch blocks)
- `toFailure(error, { defaultMsg, auth?, notFound?, validation? })` – map raw errors (Axios/fetch
  style) to normalized failures with status-derived `code` values (`401`, `404`, `400`). Any
  unmatched error collapses to `defaultMsg`.
- Type guards: `isSuccess`, `isFailure`
- Unwrapping & transforms: `unwrap`, `unwrapOr`, `mapResult`, `mapSuccess`, `mapFailure`

### Usage Pattern

```ts
try {
  const resp = await apiCall();
  if (!resp.ok)
    return toFailure(
      { response: { status: resp.status } },
      {
        auth: 'Authentication required',
        notFound: 'Resource not found',
        validation: 'Validation error',
        defaultMsg: 'Request failed',
      }
    );
  const data = await resp.json();
  return ok(transform(data));
} catch (e) {
  return toFailure(e, { defaultMsg: 'Request failed' });
}
```

### Error Code Mapping

| HTTP Status | Mapped Code | Typical Meaning           | Override Key |
| ----------- | ----------- | ------------------------- | ------------ |
| 401         | `401`       | Auth/session issue        | `auth`       |
| 404         | `404`       | Missing resource/endpoint | `notFound`   |
| 400         | `400`       | Validation / bad input    | `validation` |
| other       | (none)      | Fallback path             | `defaultMsg` |

> The mapped string codes (`"401"`, `"404"`, `"400"`) and domain codes like `invalid_shape` are
> exposed as stable constants via `ErrorCode` to avoid magic strings.

### ErrorCode Constants

`ErrorCode` centralizes the canonical string values so calling code does not inline ad‑hoc literals:

```ts
import { ErrorCode } from '@cosmichub/config';

ErrorCode.AUTH; // "401"
ErrorCode.NOT_FOUND; // "404"
ErrorCode.VALIDATION; // "400"
ErrorCode.INVALID_SHAPE; // "invalid_shape"
```

Guidelines:

1. Prefer comparing `failure.code === ErrorCode.AUTH` rather than hardcoding `"401"`.
2. Add new entries sparingly; they should represent cross-app programmatic branches (UI gating,
   retry logic) – not copy of every HTTP status.
3. When introducing a new constant also add / adjust a contract test where relevant.
4. For purely presentational messages (no branching) rely on the failure `error` text instead of
   inventing a code.

### Guidelines

1. Always return `ApiResult<T>` from service layer boundaries (instead of throwing) so callers can
   branch explicitly.
2. Use `toFailure` both for non-OK HTTP statuses and in `catch` blocks for consistency.
3. Attach stable custom shape codes via `fail` (e.g. `ErrorCode.INVALID_SHAPE`) only when additional
   programmatic distinction is needed beyond HTTP-derived codes.
4. Avoid reimplementing local result helpers; import from `@cosmichub/config`.
5. Tests should prefer the discriminant (`success`) or helper guards over duck-typing.

### Anti-Patterns (Avoid)

- Throwing raw errors from service functions used directly by React components.
- Returning mixed shapes (`{ error?: string }`) without the `success` discriminant.
- Mapping HTTP status codes in multiple places – centralize in `toFailure`.

### Migration Checklist For New/Legacy Services

- Replace local `ok/fail` definitions with imports.
- Wrap network / async logic in `try/catch`; use `toFailure` in both non-OK and `catch` paths.
- Add targeted tests asserting both success and mapped failure codes (401/404/400) when practical.

## Notification Stats

This package also exports `NotificationStats` (centralized usage and schema) to unify cross-app
notification metrics.

## Adding New Shared Primitives

1. Implement in `src/utils` or domain folder.
2. Export via `src/index.ts` and (optionally) a dedicated export path in `package.json#exports` if
   needed for tree-shaking.
3. Add a contract test enumerating expected exports when API surface stability matters.

## Contract Testing

`ApiResult` surface is guarded by a contract test (`src/__tests__/api-result.contract.test.ts`)
ensuring accidental breaking changes are caught early. If you intentionally extend or rename
exports, update that test in the same commit.

### Test Helpers

For consumer tests you can import small helpers:

```ts
import { mockHttpError, failureFromStatus, rawFailure } from '@cosmichub/config';

// Map a 401 quickly
const authFailure = failureFromStatus(401, { defaultMsg: 'Request failed', auth: 'Auth required' });
```

### Backend (Python) Parity

The backend exposes a mirrored implementation in `backend/utils/api_result.py` with analogous
helpers:

```py
from utils.api_result import ok, fail, to_failure, unwrap, unwrap_or, map_result

result = ok({"id": 123})
data = unwrap(result)  # returns the dict

failure = to_failure(SomeHttpError(), FailureOptions(default_msg="Request failed"))
```

Key Parity Points:

- `ApiSuccess`, `ApiFailure`, and union `ApiResult` semantics match the TS discriminant
  (`success: True/False`).
- Helper names (`ok`, `fail`, `to_failure`, `unwrap`, `unwrap_or`, `map_result`, `map_success`,
  `map_failure`) align closely for mental model portability.
- HTTP status mapping (401/404/400) behaves the same; codes are string values ("401", "404", "400").
- Domain / shape-specific codes should stay string-aligned (e.g. `invalid_shape`) so frontend can
  branch uniformly.

If you evolve the TypeScript surface (add/remove helpers or codes) assess whether the Python parity
layer should mirror the change to preserve full-stack consistency.

### Logger Utility

This package now exports a minimal `logger` with level filtering (`debug|info|warn|error`) and a
`once` semantic to emit a message only a single time (useful for fallback warnings).

Basic usage:

```ts
import { logger } from '@cosmichub/config';

logger.info('Loaded presets', { count: presets.length });
logger.once(
  'deprecated.apiResult.local',
  'warn',
  'Local apiResult helper detected; migrate to @cosmichub/config'
);
```

In tests you can reduce noise:

```ts
import { silenceLogsForTests } from '@cosmichub/config';
beforeAll(() => silenceLogsForTests());
```

---

Questions or proposed enhancements? Add a note in `docs/ISSUE_TRACKER.md` or open a merge request.
