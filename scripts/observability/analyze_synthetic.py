#!/usr/bin/env python3
"""Analyze synthetic journey log for simple anomalies (OBS-012).

Heuristics:
1. Rolling window failure rate > threshold.
2. p95 latency jump factor vs previous window.
3. Two or more consecutive failures.

Exit code 1 if anomaly detected (enables cron alert). Prints JSON summary.
"""
from __future__ import annotations
import json, os, math, sys
from pathlib import Path
from datetime import datetime, timezone
from typing import List, Dict, Any, TypedDict, Optional

LOG_FILE = Path(os.getenv("SYNTH_LOG", "logs/synthetic_journey.log"))
WINDOW = int(os.getenv("ANOMALY_WINDOW", "12"))
FAIL_THRESHOLD = float(os.getenv("ANOMALY_FAIL_THRESHOLD", "0.10"))  # 10%
INCREASE_FACTOR = float(os.getenv("ANOMALY_P95_FACTOR", "1.5"))


class Step(TypedDict, total=False):
    path: str
    status: int
    ms: int
    ok: bool
    error: str


class Record(TypedDict, total=False):
    timestamp: str
    overall_ok: bool
    steps: List[Step]
    calc_latency_ms: Optional[int]


def parse_lines() -> List[Record]:
    if not LOG_FILE.exists():
        return []
    out: List[Record] = []
    with LOG_FILE.open() as f:
        for line in f:
            line = line.strip()
            if not line.startswith('{'):
                continue
            try:
                raw = json.loads(line)
                rec: Record = {
                    "timestamp": raw.get("timestamp", ""),
                    "overall_ok": bool(raw.get("overall_ok")),
                    "steps": list(raw.get("steps") or []),
                }
                steps: List[Step] = rec.get("steps", [])
                calc_step: Optional[Step] = next((s for s in steps if s.get("path") == "/calculate"), None)
                rec["calc_latency_ms"] = calc_step.get("ms") if (calc_step and isinstance(calc_step.get("ms"), int)) else None
                out.append(rec)
            except Exception:
                continue
    return out


def p95(values: List[int]) -> Optional[float]:
    if not values:
        return None
    vs = sorted(values)
    idx = max(0, math.ceil(0.95 * len(vs)) - 1)
    return float(vs[idx])


def main() -> int:
    import argparse
    parser = argparse.ArgumentParser(description="Analyze synthetic journey log for anomalies.")
    parser.add_argument("--alert-log", type=str, default=None, help="Path to append anomaly JSON if detected.")
    args = parser.parse_args()

    records: List[Record] = parse_lines()
    ts = datetime.now(timezone.utc).isoformat()
    recent = records[-WINDOW:]
    prev = records[-2 * WINDOW:-WINDOW] if len(records) >= 2 * WINDOW else []

    recent_failures = sum(1 for r in recent if not r.get("overall_ok"))
    recent_count = len(recent)
    failure_rate = recent_failures / recent_count if recent_count else 0.0
    recent_latencies: List[int] = []
    for r in recent:
        v = r.get("calc_latency_ms")
        if isinstance(v, int):
            recent_latencies.append(v)
    prev_latencies: List[int] = []
    for r in prev:
        v = r.get("calc_latency_ms")
        if isinstance(v, int):
            prev_latencies.append(v)
    recent_p95 = p95(recent_latencies)
    prev_p95 = p95(prev_latencies)

    consecutive_fail = 0
    for r in reversed(recent):
        if not r.get("overall_ok"):
            consecutive_fail += 1
        else:
            break

    reasons: List[str] = []
    if failure_rate > FAIL_THRESHOLD and recent_count >= max(5, WINDOW // 2):
        reasons.append(f"failure_rate>{FAIL_THRESHOLD*100:.1f}% ({failure_rate*100:.1f}%)")
    if recent_p95 and prev_p95 and prev_p95 > 0 and recent_p95 / prev_p95 > INCREASE_FACTOR:
        reasons.append(f"p95_increase>{INCREASE_FACTOR}x ({recent_p95:.0f} vs {prev_p95:.0f})")
    if consecutive_fail >= 2:
        reasons.append(f"consecutive_failures={consecutive_fail}")

    anomaly = bool(reasons)
    summary: Dict[str, Any] = {
        "timestamp": ts,
        "window": recent_count,
        "failure_rate": round(failure_rate, 4),
        "recent_p95": recent_p95,
        "prev_p95": prev_p95,
        "consecutive_failures": consecutive_fail,
        "anomaly": anomaly,
        "reasons": reasons,
    }
    print(json.dumps(summary))
    if anomaly and args.alert_log:
        try:
            with open(args.alert_log, "a") as f:
                f.write(json.dumps(summary) + "\n")
        except Exception:
            pass
    return 1 if anomaly else 0


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(main())
