"""Documentation Freshness & Frontmatter Utility

Scans markdown files, ensures frontmatter, and generates a freshness report.

Usage:
  python scripts/doc_freshness.py --apply            # add missing frontmatter (in-place)
  python scripts/doc_freshness.py --report           # generate freshness report only
  python scripts/doc_freshness.py --apply --report   # both
  python scripts/doc_freshness.py --dry-run          # show planned changes

Frontmatter Schema:
  ---
  title: <string>
  owner: <team|owner>
  status: active|archived|deprecated
  last_reviewed: YYYY-MM-DD
  review_cycle: <Nd>
  category: <overview|plan|guide|architecture|operations|monitoring|security|reference|archive|context>
  canonical: <path> (optional)
  ---
"""

from __future__ import annotations

import os
import re
import argparse
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Optional, List, Dict

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DOCS_DIR = os.path.join(ROOT, "docs")
FRESHNESS_PATH = os.path.join(DOCS_DIR, "01-CURRENT-STATUS", "DOCUMENTATION_FRESHNESS.md")

FRONTMATTER_RE = re.compile(r"^---\n(.*?)\n---\n", re.DOTALL)
TITLE_RE = re.compile(r"^# +(.+)$", re.MULTILINE)

CATEGORY_MAP = [
    ("00-OVERVIEW", "overview"),
    ("01-CURRENT-STATUS", "status"),
    ("02-ACTIVE-PRIORITIES", "plan"),
    ("03-GUIDES", "guide"),
    ("04-ARCHITECTURE", "architecture"),
    ("06-OPERATIONS", "operations"),
    ("07-MONITORING", "monitoring"),
    ("08-SECURITY", "security"),
    ("99-REFERENCE", "reference"),
]


@dataclass
class DocMeta:
    path: str
    title: str
    owner: str
    status: str
    last_reviewed: datetime
    review_cycle_days: int
    category: str
    canonical: Optional[str] = None

    @property
    def next_review_due(self) -> datetime:
        return self.last_reviewed + timedelta(days=self.review_cycle_days)

    @property
    def is_overdue(self) -> bool:
        """Determine if an active document is past its review due date."""
        if self.status != "active":
            return False
        return datetime.now(timezone.utc).date() > self.next_review_due.date()


def detect_category(rel_path: str) -> str:
    for prefix, cat in CATEGORY_MAP:
        if rel_path.startswith(f"docs/{prefix}"):
            return cat
    if "05-ARCHIVE" in rel_path:
        return "archive"
    if rel_path.startswith("docs/"):
        return "guide"
    return "overview"


def default_review_cycle(category: str, status: str) -> int:
    if status != "active":
        return 365
    return {
        "overview": 60,
        "context": 14,
        "status": 14,
        "plan": 30,
        "guide": 90,
        "architecture": 90,
        "operations": 120,
        "monitoring": 60,
        "security": 60,
        "reference": 120,
    }.get(category, 90)


def infer_status(rel_path: str) -> str:
    if "05-ARCHIVE" in rel_path or "ARCHIVE" in os.path.basename(rel_path):
        return "archived"
    return "active"


def parse_frontmatter(content: str) -> Dict[str, str]:
    m = FRONTMATTER_RE.match(content)
    if not m:
        return {}
    block = m.group(1)
    meta: Dict[str, str] = {}
    for line in block.splitlines():
        if not line.strip() or line.strip().startswith('#'):
            continue
        if ':' in line:
            k, v = line.split(':', 1)
            meta[k.strip()] = v.strip()
    return meta


def ensure_frontmatter(path: str, apply: bool, dry_run: bool) -> Optional[str]:
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    meta = parse_frontmatter(content)
    changed = False

    if not meta:
        # derive title from first H1
        title_match = TITLE_RE.search(content)
        title = title_match.group(1).strip() if title_match else os.path.splitext(os.path.basename(path))[0]
        rel_path = os.path.relpath(path, ROOT).replace('\\', '/')
        category = detect_category(rel_path)
        status = infer_status(rel_path)
        review_cycle = default_review_cycle(category, status)
        today = datetime.now(timezone.utc).date().isoformat()
        frontmatter = (
            f"---\n"
            f"title: {title}\n"
            f"owner: platform\n"
            f"status: {status}\n"
            f"last_reviewed: {today}\n"
            f"review_cycle: {review_cycle}d\n"
            f"category: {category}\n"
            f"---\n\n"
        )
        new_content = frontmatter + content
        changed = True
    else:
        new_content = content

    if changed and apply:
        if dry_run:
            return 'WOULD_UPDATE'
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return 'UPDATED'
    return None


def collect_docs() -> List[str]:
    md_files: List[str] = []
    for root, _, files in os.walk(ROOT):
        # skip irrelevant directories
        skip = any(seg in root for seg in ["node_modules", ".git", "coverage", "dist", "build"])
        if skip:
            continue
        for f in files:
            if f.endswith('.md'):
                md_files.append(os.path.join(root, f))
    return md_files


def extract_meta(path: str) -> Optional[DocMeta]:
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    meta = parse_frontmatter(content)
    if not meta:
        return None
    rel_path = os.path.relpath(path, ROOT).replace('\\', '/')
    try:
        last_reviewed = datetime.strptime(meta.get('last_reviewed', '1970-01-01'), '%Y-%m-%d')
    except ValueError:
        last_reviewed = datetime(1970, 1, 1)
    rc_raw = meta.get('review_cycle', '90d').rstrip('d')
    try:
        rc_days = int(rc_raw)
    except ValueError:
        rc_days = 90
    return DocMeta(
        path=rel_path,
        title=meta.get('title', os.path.basename(path)),
        owner=meta.get('owner', 'platform'),
        status=meta.get('status', 'active'),
        last_reviewed=last_reviewed,
        review_cycle_days=rc_days,
        category=meta.get('category', detect_category(rel_path)),
        canonical=meta.get('canonical')
    )


def compute_overdue_stats(metas: List[DocMeta]):
    overdue = [m for m in metas if m.is_overdue]
    active = [m for m in metas if m.status == 'active']
    pct_overdue = (len(overdue) / len(active) * 100) if active else 0
    return overdue, active, pct_overdue


def generate_report(metas: List[DocMeta]) -> str:
    today = datetime.now(timezone.utc).date().isoformat()
    overdue, active, pct_overdue = compute_overdue_stats(metas)
    lines = [
        "---",
        "title: Documentation Freshness Report",
        f"generated_at: {today}",
        "status: generated",
        "---\n",
        f"# Documentation Freshness Report\n\n",
        f"Generated: {today}\n\n",
        f"Active docs: {len(active)}  | Overdue: {len(overdue)} ({pct_overdue:.1f}%)\n\n",
        "## Overdue Documents\n",
    ]
    if not overdue:
        lines.append("None – all active docs within review window.\n")
    else:
        lines.append("| Title | Path | Last Reviewed | Next Review Due | Cycle (d) |" )
        lines.append("|-------|------|---------------|-----------------|----------|")
        overdue_sorted = sorted(overdue, key=lambda m: m.next_review_due)
        for m in overdue_sorted:
            lines.append(
                f"| {m.title} | {m.path} | {m.last_reviewed.date()} | {m.next_review_due.date()} | {m.review_cycle_days} |"
            )
        lines.append("\n")
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--apply', action='store_true', help='Apply frontmatter additions')
    parser.add_argument('--report', action='store_true', help='Generate freshness report')
    parser.add_argument('--dry-run', action='store_true', help='Show actions without writing files')
    parser.add_argument('--fail-overdue-pct', type=float, default=None, help='Exit non-zero if overdue percent exceeds this threshold')
    args = parser.parse_args()

    md_files = collect_docs()
    updated = 0
    if args.apply:
        for path in md_files:
            result = ensure_frontmatter(path, apply=True, dry_run=args.dry_run)
            if result == 'UPDATED':
                updated += 1
        action = 'would add' if args.dry_run else 'added'
        print(f"{action} frontmatter to {updated} files")

    if args.report:
        metas: List[DocMeta] = []
        for path in md_files:
            meta = extract_meta(path)
            if meta:
                metas.append(meta)
        report = generate_report(metas)
        if args.dry_run:
            print(report)
        else:
            os.makedirs(os.path.dirname(FRESHNESS_PATH), exist_ok=True)
            with open(FRESHNESS_PATH, 'w', encoding='utf-8') as f:
                f.write(report)
            print(f"Freshness report written to {FRESHNESS_PATH}")
        if args.fail_overdue_pct is not None:
            _overdue, _active, pct = compute_overdue_stats(metas)
            if pct > args.fail_overdue_pct:
                print(f"ERROR: {pct:.1f}% of active docs overdue (threshold {args.fail_overdue_pct}%)")
                raise SystemExit(1)
            else:
                print(f"OK: {pct:.1f}% overdue within threshold {args.fail_overdue_pct}%")

    if not args.apply and not args.report:
        parser.print_help()


if __name__ == '__main__':  # pragma: no cover
    main()
