#!/usr/bin/env python3
"""Generate a daily markdown rollup of synthetic journey outcomes.

Reads synthetic_journey.log and writes/updates logs/synthetic_daily.md
Grouping by UTC date, summarizing counts, failure rate, p95 latency.
"""
from __future__ import annotations
import json, os, math
from collections import defaultdict
from pathlib import Path
from datetime import datetime, timezone
from typing import List, TypedDict, Optional, DefaultDict

LOG_FILE = Path(os.getenv("SYNTH_LOG", "logs/synthetic_journey.log"))
OUT_FILE = Path("logs/synthetic_daily.md")


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


def p95(values: List[int]) -> Optional[float]:
    if not values:
        return None
    vs = sorted(values)
    idx = max(0, math.ceil(0.95 * len(vs)) - 1)
    return float(vs[idx])


def load() -> List[Record]:
    if not LOG_FILE.exists():
        return []
    rows: List[Record] = []
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
                rows.append(rec)
            except Exception:
                continue
    return rows


def build_stats(records: List[Record]):
    day_buckets: DefaultDict[str, List[Record]] = defaultdict(list)
    for r in records:
        ts = r.get("timestamp")
        try:
            dt = datetime.fromisoformat(ts.replace("Z", "+00:00")) if ts else None
        except Exception:
            dt = None
        if not dt:
            continue
        day = dt.date().isoformat()
        day_buckets[day].append(r)

    lines: List[str] = ["# Synthetic Journey Daily Rollup", "", "Date | Runs | Failures | Failure % | p95 calc ms", "---- | ---- | -------- | --------- | ------------"]
    anomaly_lines: List[str] = ["", "# Daily Anomaly Summary", "Date | Anomalies", "---- | ---------"]
    # Heuristics from analyze_synthetic.py
    WINDOW = 12
    FAIL_THRESHOLD = 0.10
    INCREASE_FACTOR = 1.5
    for day in sorted(day_buckets.keys()):
        bucket: List[Record] = day_buckets[day]
        runs = len(bucket)
        failures = sum(1 for b in bucket if not b.get("overall_ok"))
        fail_pct = (failures / runs * 100) if runs else 0.0
        latencies: List[int] = []
        for b in bucket:
            steps: List[Step] = b.get("steps", [])
            calc = next((s for s in steps if s.get("path") == "/calculate"), None)
            if calc and isinstance(calc.get("ms"), int):
                ms_val = calc.get("ms")
                if isinstance(ms_val, int):
                    latencies.append(ms_val)
        p95_latency = p95(latencies)
        lines.append(f"{day} | {runs} | {failures} | {fail_pct:.1f}% | {int(p95_latency) if p95_latency else '-'}")

        # Anomaly detection per day
        anomaly_count = 0
        for i in range(len(bucket)):
            window = bucket[max(0, i-WINDOW+1):i+1]
            recent_count = len(window)
            if recent_count < max(5, WINDOW // 2):
                continue
            recent_failures = sum(1 for r in window if not r.get("overall_ok"))
            failure_rate = recent_failures / recent_count if recent_count else 0.0
            recent_latencies_raw = [s.get("ms") for r in window for s in r.get("steps", []) if s.get("path") == "/calculate" and isinstance(s.get("ms"), int)]
            recent_latencies = [v for v in recent_latencies_raw if isinstance(v, int)]
            prev_window = bucket[max(0, i-2*WINDOW+1):max(0, i-WINDOW+1)]
            prev_latencies_raw = [s.get("ms") for r in prev_window for s in r.get("steps", []) if s.get("path") == "/calculate" and isinstance(s.get("ms"), int)]
            prev_latencies = [v for v in prev_latencies_raw if isinstance(v, int)]
            recent_p95 = p95(recent_latencies)
            prev_p95 = p95(prev_latencies)
            consecutive_fail = 0
            for r in reversed(window):
                if not r.get("overall_ok"):
                    consecutive_fail += 1
                else:
                    break
            anomaly = False
            if failure_rate > FAIL_THRESHOLD:
                anomaly = True
            if recent_p95 and prev_p95 and prev_p95 > 0 and recent_p95 / prev_p95 > INCREASE_FACTOR:
                anomaly = True
            if consecutive_fail >= 2:
                anomaly = True
            if anomaly:
                anomaly_count += 1
        anomaly_lines.append(f"{day} | {anomaly_count}")

    OUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUT_FILE.write_text("\n".join(lines + anomaly_lines) + "\n")


def main() -> int:
    records = load()
    build_stats(records)
    print(json.dumps({"written": str(OUT_FILE), "records": len(records)}))
    return 0


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(main())
