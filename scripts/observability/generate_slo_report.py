#!/usr/bin/env python3
"""Generate a weekly SLO report placeholder.

Currently ingests FastAPI access JSON logs (app.log*), aggregates p95 latency for /calculate
and 5xx rate, then prints a markdown summary. Extend later for real storage & error budget math.
"""
from __future__ import annotations
import json, glob, os, datetime

LOG_PATTERN = os.getenv("LOG_GLOB", "backend/app.log*")
TARGET_ENDPOINT = "/calculate"

durations = []
errors = 0
total = 0
for path in glob.glob(LOG_PATTERN):
    try:
        with open(path, 'r') as f:
            for line in f:
                line = line.strip()
                if not line.startswith('{'):
                    continue
                try:
                    rec = json.loads(line)
                except Exception:
                    continue
                if rec.get('msg') != 'access':
                    continue
                if rec.get('path') == TARGET_ENDPOINT:
                    total += 1
                    if rec.get('status_code', 200) >= 500:
                        errors += 1
                    if 'duration_ms' in rec:
                        durations.append(rec['duration_ms'])
    except FileNotFoundError:
        continue

if durations:
    durations.sort()
    p95 = durations[int(len(durations)*0.95)-1]
else:
    p95 = None

error_rate = (errors / total * 100) if total else 0.0
now = datetime.datetime.utcnow().isoformat()

print("# Weekly SLO Snapshot")
print(f"Generated: {now} UTC")
print()
print(f"Endpoint: {TARGET_ENDPOINT}")
print(f"Requests: {total}")
print(f"5xx Errors: {errors} ({error_rate:.2f}% rate)")
print(f"p95 Duration: {p95 if p95 is not None else 'n/a'} ms")
print()
print("## Status vs Objectives")
print("- Availability target: 99.5% (proxy via 5xx rate <0.5%) -> " + ("OK" if error_rate < 0.5 else "ATTENTION"))
if p95 is not None:
    print("- Latency target: p95 < 1200ms -> " + ("OK" if p95 < 1200 else "ATTENTION"))
else:
    print("- Latency target: p95 < 1200ms -> NO DATA")

print("\n(Extend: store historical reports, calculate burn, add other endpoints)")
