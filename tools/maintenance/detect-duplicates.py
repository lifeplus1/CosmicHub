"""Lightweight duplicate implementation detector.

Scans for multiple definitions of core domain concepts (e.g., BirthData) across
Python (Pydantic) and TypeScript (interfaces, Zod schemas) and emits a report.

Exit codes:
 0 = No actionable duplication
 1 = Potential duplication found
"""

from __future__ import annotations
import re
import sys
from pathlib import Path
from typing import Dict, List, Tuple

ROOT = Path(__file__).resolve().parents[2]

TARGET_KEYS = {
    "BirthData": [
        re.compile(r"class\s+BirthData\(BaseModel\)") ,
        re.compile(r"interface\s+BirthData\s+{"),
        re.compile(r"export\s+const\s+BirthDataSchema\s*=\s*z\.object"),
    ]
}

TS_GLOBS = ["apps/astro/src/**/*.ts", "packages/types/src/**/*.ts"]
PY_GLOBS = ["backend/**/*.py"]

def collect_files(patterns: List[str]) -> List[Path]:
    out: List[Path] = []
    for pattern in patterns:
        out.extend(ROOT.glob(pattern))
    return [p for p in out if p.is_file()]

def scan() -> Dict[str, List[Tuple[str, int]]]:
    results: Dict[str, List[Tuple[str, int]]] = {k: [] for k in TARGET_KEYS}
    files = collect_files(TS_GLOBS + PY_GLOBS)
    for f in files:
        try:
            text = f.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue
        for key, patterns in TARGET_KEYS.items():
            for pat in patterns:
                for m in pat.finditer(text):
                    line_no = text[: m.start()].count("\n") + 1
                    results[key].append((str(f.relative_to(ROOT)), line_no))
    return results

def main() -> int:
    dupes = scan()
    exit_code = 0
    for key, occurrences in dupes.items():
        if len(occurrences) > 1:
            exit_code = 1
            print(f"[DUPLICATE] {key} defined {len(occurrences)} times")
            for path, line in occurrences:
                print(f"  - {path}:{line}")
            print()
    if exit_code == 0:
        print("No actionable duplicate definitions detected.")
    else:
        print("Review duplicates and consolidate to a single canonical source.")
    return exit_code

if __name__ == "__main__":
    raise SystemExit(main())
