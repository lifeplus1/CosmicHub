import { describe, it, expect } from 'vitest';
import * as exported from '..';

describe('config package export surface snapshot', () => {
  it('matches the approved key list', () => {
    const keys = Object.keys(exported).sort();
    expect(keys).toMatchInlineSnapshot(`[
  "ErrorCode",
  "failureFromStatus",
  "fail",
  "featureFlags",
  "isFailure",
  "isSuccess",
  "lazy",
  "logger",
  "mapFailure",
  "mapResult",
  "mapSuccess",
  "mockHttpError",
  "ok",
  "rawFailure",
  "silenceLogsForTests",
  "toFailure",
  "unwrap",
  "unwrapOr",
]`);
  });
});
