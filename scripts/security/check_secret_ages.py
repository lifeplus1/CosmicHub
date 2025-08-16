#!/usr/bin/env python3
"""Secret age checker (stub).

Scans a JSON inventory file containing objects like:
[{"name": "stripe_api_key", "last_rotated": "2025-06-01T00:00:00Z", "max_age_days": 90}]
Exits non-zero if any secret exceeds allowed age.
"""
from __future__ import annotations
import json, sys, datetime, pathlib

INVENTORY_PATH = pathlib.Path("logs/security/secret-inventory.json")

def main() -> int:
    if not INVENTORY_PATH.exists():
        print("No inventory file found (passing for now).")
        return 0
    try:
        data = json.loads(INVENTORY_PATH.read_text())
    except Exception as e:
        print(f"Failed to read inventory: {e}")
        return 1
    now = datetime.datetime.utcnow()
    failures = []
    for entry in data:
        try:
            rotated = datetime.datetime.fromisoformat(entry["last_rotated"].replace("Z","+00:00"))
            age_days = (now - rotated).days
            if age_days > int(entry.get("max_age_days", 90)):
                failures.append((entry["name"], age_days))
        except Exception:
            failures.append((entry.get("name", "<unknown>"), "parse-error"))
    if failures:
        print("Stale secrets detected:")
        for name, age in failures:
            print(f" - {name}: age={age}d")
        return 2
    print("All secrets within rotation windows.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
