#!/usr/bin/env python3
"""Generate an index file for active priorities (docs/02-ACTIVE-PRIORITIES).

Scans markdown files (excluding existing INDEX.md) and builds a table sorted by filename
with title, status, last_reviewed, review_cycle, and path.

Usage:
  python scripts/generate_active_priorities_index.py
"""
from __future__ import annotations
import os
import re
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
PRIORITIES_DIR = os.path.join(ROOT, 'docs', '02-ACTIVE-PRIORITIES')
INDEX_PATH = os.path.join(PRIORITIES_DIR, 'INDEX.md')
FRONTMATTER_RE = re.compile(r'^---\n(.*?)\n---\n', re.DOTALL)


def parse_frontmatter(content: str) -> Dict[str, str]:
    m = FRONTMATTER_RE.match(content)
    if not m:
        return {}
    meta: Dict[str, str] = {}
    for line in m.group(1).splitlines():
        if not line.strip() or line.strip().startswith('#'):
            continue
        if ':' in line:
            k, v = line.split(':', 1)
            meta[k.strip()] = v.strip()
    return meta


def collect_docs() -> List[str]:
    files: List[str] = []
    for name in sorted(os.listdir(PRIORITIES_DIR)):
        if not name.endswith('.md'):
            continue
        if name.upper() == 'INDEX.md':
            continue
        files.append(os.path.join(PRIORITIES_DIR, name))
    return files


def build_index(rows: List[Dict[str, Any]]) -> str:
    today_dt = datetime.now(timezone.utc)
    today = today_dt.date().isoformat()
    # compute overdue stats
    overdue_rows = [r for r in rows if r.get('overdue')]
    active_rows = [r for r in rows if r.get('status') == 'active']
    pct_overdue = (len(overdue_rows) / len(active_rows) * 100) if active_rows else 0.0
    lines = [
        '---',
        'title: Active Priorities Index',
        'owner: platform',
        'status: active',
        f'last_reviewed: {today}',
        'review_cycle: 30d',
        'category: plan',
        '---',
        '',
        '# Active Priorities Index',
        '',
        f'Generated: {today}',
        '',
    'Aggregated view of implementation plans and active priority documents. Source: docs/02-ACTIVE-PRIORITIES/*.md',
    '',
    f'Active docs: {len(active_rows)} | Overdue: {len(overdue_rows)} ({pct_overdue:.1f}%)',
        '',
    ]
    if not rows:
        lines.append('_No active priority documents found._')
        return '\n'.join(lines) + '\n'

    lines.append('| Title | File | Status | Last Reviewed | Next Review Due | Cycle | Overdue |')
    lines.append('|-------|------|--------|---------------|-----------------|-------|---------|')
    for r in rows:
        overdue_marker = '⚠️' if r.get('overdue') else ''
        lines.append(f"| {r['title']} | {r['file']} | {r['status']} | {r['last_reviewed']} | {r['next_due']} | {r['cycle']} | {overdue_marker} |")
    lines.append('')
    lines.append('> Maintained by generate_active_priorities_index.py')
    return '\n'.join(lines) + '\n'


def main():
    docs = collect_docs()
    rows: List[Dict[str, Any]] = []
    for path in docs:
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        meta = parse_frontmatter(content)
        if not meta:
            continue  # skip non-conforming
        title = meta.get('title', os.path.basename(path))
        status = meta.get('status', 'active')
        last_reviewed = meta.get('last_reviewed', '1970-01-01')
        cycle = meta.get('review_cycle', '30d')
        cycle_days = cycle.rstrip('d')
        try:
            lr_dt = datetime.strptime(last_reviewed, '%Y-%m-%d')
        except ValueError:
            lr_dt = datetime(1970, 1, 1)
        try:
            cycle_int = int(cycle_days)
        except ValueError:
            cycle_int = 30
        next_due_date = (lr_dt + timedelta(days=cycle_int)).date().isoformat()
        overdue = datetime.now(timezone.utc).date() > datetime.strptime(next_due_date, '%Y-%m-%d').date() and status == 'active'
        rows.append({
            'title': title,
            'file': os.path.basename(path),
            'status': status,
            'last_reviewed': last_reviewed,
            'next_due': next_due_date,
            'cycle': cycle,
            'overdue': overdue,
        })
    # sort by status then title
    rows.sort(key=lambda r: (r['status'] != 'active', r['title'].lower()))
    index_md = build_index(rows)
    with open(INDEX_PATH, 'w', encoding='utf-8') as f:
        f.write(index_md)
    print(f'Wrote {INDEX_PATH} with {len(rows)} entries.')

if __name__ == '__main__':
    main()
