#!/usr/bin/env python3
"""Secret inventory generator (SEC-002).

Generates/updates a machine-readable inventory JSON at
  logs/security/secret-inventory.json

Schema (list of objects):
[
  {
    "name": "stripe_api_key",           # canonical name (snake_case)
    "env": "STRIPE_SECRET_KEY",        # environment variable providing it
    "category": "api_key",             # classification bucket (policy aligned)
    "last_rotated": "2025-06-01T00:00:00Z",  # ISO8601 UTC
    "max_age_days": 90,                 # from policy mapping
    "present": true,                    # whether env var currently set
    "hash_ref": "ab12cd34",            # first 8 hex chars of sha256 (non‑sensitive ref)
    "notes": "Stripe live secret key"  # optional
  }
]

Usage:
  python scripts/security/list_secrets.py              # refresh inventory (preserve last_rotated)
  python scripts/security/list_secrets.py --mark-rotated stripe_api_key  # update rotation timestamp now

Rotation events are appended to logs/security/secret-rotation.log
with lines: <utc_iso> <name> <old_timestamp|-> <new_timestamp>

Safe to run in CI; exits 0 unless an internal error occurs.
Pair script: scripts/security/check_secret_ages.py (consumes inventory).
"""
from __future__ import annotations

import argparse
import dataclasses as dc
import datetime as dt
import hashlib
import json
import os
import pathlib
import sys
from typing import Any, Dict, List

INV_PATH = pathlib.Path("logs/security/secret-inventory.json")
ROT_LOG = pathlib.Path("logs/security/secret-rotation.log")

# Policy driven max ages (days) – derived from docs/security/secret-rotation.md
MAX_AGE = {
    "api_key": 90,
    "webhook_secret": 90,
    "jwt_signing_key": 60,
    "service_account_key": 90,
    "pseudonymization_salt": 180,
    "pseudonymization_pepper": 180,
    "db_credentials": 90,
    "redis_auth": 90,
    "observability_key": 180,  # Sentry/New Relic – lower risk, still rotate semi-annually
    "smtp_password": 180,
}

@dc.dataclass
class SecretItem:
    name: str
    env: str
    category: str
    last_rotated: str
    max_age_days: int
    present: bool
    hash_ref: str | None
    notes: str = ""

    def to_dict(self) -> Dict[str, Any]:  # stable ordering
        return {
            "name": self.name,
            "env": self.env,
            "category": self.category,
            "last_rotated": self.last_rotated,
            "max_age_days": self.max_age_days,
            "present": self.present,
            "hash_ref": self.hash_ref,
            "notes": self.notes,
        }


def _utcnow_iso() -> str:
    return dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def load_existing() -> Dict[str, Dict[str, Any]]:
    if not INV_PATH.exists():
        return {}
    try:
        data = json.loads(INV_PATH.read_text())
        if not isinstance(data, list):
            return {}
        # Narrow dynamic typing for static analyzers
        result: Dict[str, Dict[str, Any]] = {}
        for entry in data:  # type: ignore[assignment]
            if isinstance(entry, dict):  # runtime narrowing
                nm_obj = entry.get("name")  # type: ignore[index]
                nm = str(nm_obj) if isinstance(nm_obj, str) else None
                if nm:
                    result[nm] = entry  # type: ignore[assignment]
        return result
    except Exception:
        return {}


def compute_hash_ref(raw: str) -> str:
    h = hashlib.sha256(raw.encode("utf-8")).hexdigest()
    return h[:8]


def defined_secret_specs() -> List[Dict[str, str]]:
    """Return canonical secret definitions (add here as project evolves)."""
    return [
        {"name": "stripe_api_key", "env": "STRIPE_SECRET_KEY", "category": "api_key", "notes": "Stripe live secret key"},
        {"name": "stripe_webhook_secret", "env": "STRIPE_WEBHOOK_SECRET", "category": "webhook_secret", "notes": "Validate Stripe webhook signatures"},
        {"name": "stripe_healwave_pro_price_id", "env": "STRIPE_HEALWAVE_PRO_PRICE_ID", "category": "config", "notes": "Non-secret price ID (tracked for completeness)"},
        {"name": "stripe_astro_premium_price_id", "env": "STRIPE_ASTRO_PREMIUM_PRICE_ID", "category": "config", "notes": "Non-secret price ID"},
        {"name": "stripe_cosmic_master_price_id", "env": "STRIPE_COSMIC_MASTER_PRICE_ID", "category": "config", "notes": "Non-secret price ID"},
        {"name": "firebase_credentials_json", "env": "FIREBASE_CREDENTIALS", "category": "service_account_key", "notes": "Full service account JSON"},
        {"name": "firebase_private_key", "env": "FIREBASE_PRIVATE_KEY", "category": "service_account_key", "notes": "Service account PK if JSON not used"},
        {"name": "database_url", "env": "DATABASE_URL", "category": "db_credentials", "notes": "PostgreSQL connection string"},
        {"name": "redis_url", "env": "REDIS_URL", "category": "redis_auth", "notes": "Redis connection string / auth"},
        {"name": "sentry_dsn", "env": "SENTRY_DSN", "category": "observability_key", "notes": "Sentry project DSN"},
        {"name": "new_relic_license_key", "env": "NEW_RELIC_LICENSE_KEY", "category": "observability_key", "notes": "New Relic ingest key"},
        {"name": "smtp_password", "env": "SMTP_PASS", "category": "smtp_password", "notes": "SMTP auth password"},
        {"name": "pseudonym_pepper", "env": "PSEUDONYM_PEPPER", "category": "pseudonymization_pepper", "notes": "Pepper for analytics pseudonymization"},
    ]


def resolve_max_age(cat: str) -> int:
    return MAX_AGE.get(cat, 90)


def build_inventory(existing: Dict[str, Dict[str, Any]]) -> List[SecretItem]:
    items: List[SecretItem] = []
    for spec in defined_secret_specs():
        name = spec["name"]
        env = spec["env"]
        category = spec["category"]
        raw = os.getenv(env, "")
        present = bool(raw)
        prev = existing.get(name)
        last_rotated = prev.get("last_rotated") if prev else None
        if not last_rotated:
            # Initialize new entries with current time baseline; can be edited manually if known
            last_rotated = _utcnow_iso()
        hash_ref = compute_hash_ref(raw) if present and category not in {"config"} else None
        items.append(
            SecretItem(
                name=name,
                env=env,
                category=category,
                last_rotated=last_rotated,
                max_age_days=resolve_max_age(category),
                present=present,
                hash_ref=hash_ref,
                notes=spec.get("notes", ""),
            )
        )
    return items


def mark_rotated(name: str, inventory: Dict[str, Dict[str, Any]]) -> None:
    if name not in inventory:
        print(f"Secret '{name}' not found in current inventory definitions.")
        sys.exit(1)
    old = inventory[name].get("last_rotated", "-")
    new_ts = _utcnow_iso()
    inventory[name]["last_rotated"] = new_ts
    ROT_LOG.parent.mkdir(parents=True, exist_ok=True)
    with ROT_LOG.open("a", encoding="utf-8") as fh:
        fh.write(f"{new_ts} {name} {old} {new_ts}\n")
    print(f"Marked {name} rotated at {new_ts}")


def main(argv: List[str]) -> int:
    parser = argparse.ArgumentParser(description="Generate or update secret inventory")
    parser.add_argument("--mark-rotated", metavar="NAME", help="Mark a secret rotated now (updates last_rotated)")
    args = parser.parse_args(argv)

    existing = load_existing()
    existing_by_name = {k: v for k, v in existing.items()}
    items = build_inventory(existing_by_name)
    inv_dict = {i.name: i.to_dict() for i in items}

    if args.mark_rotated:
        mark_rotated(args.mark_rotated, inv_dict)

    INV_PATH.parent.mkdir(parents=True, exist_ok=True)
    # Stable deterministic ordering by name
    output_list = [inv_dict[name] for name in sorted(inv_dict.keys())]
    INV_PATH.write_text(json.dumps(output_list, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(output_list)} secrets to {INV_PATH}")
    return 0


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(main(sys.argv[1:]))
