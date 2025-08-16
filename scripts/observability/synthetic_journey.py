#!/usr/bin/env python3
"""Synthetic user journey script (OBS-003).

Phases (initial scope):
1. Root endpoint fetch
2. (Future) Signup (if test user not exists)
3. Auth (placeholder) – integrate when test auth flow available
4. Fetch representative calculation endpoint

Emits one JSON line summarizing step timings and overall success for ingestion by SLO/alert tooling.
"""
from __future__ import annotations
import time, json, sys, os, urllib.request, urllib.error
from datetime import datetime, timezone
from typing import TypedDict, List

BASE_URL: str = os.getenv("SYNTH_BASE_URL", "http://localhost:8000")
CALC_ENDPOINT: str = os.getenv("SYNTH_CALC_PATH", "/calculate")
SIGNUP_ENDPOINT: str = os.getenv("SYNTH_SIGNUP_PATH", "/auth/signup")
TIMEOUT: float = float(os.getenv("SYNTH_TIMEOUT", "10"))


class StepResult(TypedDict, total=False):
    path: str
    ok: bool
    status: int
    bytes: int
    ms: int
    error: str


def ts() -> str:
    return datetime.now(timezone.utc).isoformat()


def fetch(path: str) -> StepResult:
    url = BASE_URL.rstrip('/') + path
    start = time.time()
    try:
        with urllib.request.urlopen(url, timeout=TIMEOUT) as resp:  # nosec B310
            _ = resp.read()
            status = resp.getcode()
            return StepResult(path=path, ok=200 <= status < 300, status=status, bytes=0, ms=int((time.time()-start)*1000))
    except urllib.error.HTTPError as e:  # pragma: no cover
        return StepResult(path=path, ok=False, status=e.code, error="http_error", ms=int((time.time()-start)*1000))
    except Exception as e:  # pragma: no cover
        return StepResult(path=path, ok=False, error=str(e), ms=int((time.time()-start)*1000))


def main() -> int:
    results: List[StepResult] = []
    overall_ok: bool = True

    r_root = fetch("/")
    results.append(r_root)
    overall_ok &= r_root.get("ok", False)

    # Synthetic signup step
    r_signup = fetch(SIGNUP_ENDPOINT)
    results.append(r_signup)
    overall_ok &= r_signup.get("ok", False)

    r_calc = fetch(CALC_ENDPOINT)
    results.append(r_calc)
    overall_ok &= r_calc.get("ok", False)

    out: dict[str, object] = {
        "timestamp": ts(),
        "base_url": BASE_URL,
        "overall_ok": overall_ok,
        "steps": results,
    }
    print(json.dumps(out))
    return 0 if overall_ok else 1


if __name__ == "__main__":  # pragma: no cover
    sys.exit(main())
