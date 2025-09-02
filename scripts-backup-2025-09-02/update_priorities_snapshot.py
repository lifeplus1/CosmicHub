#!/usr/bin/env python3
"""Update PROJECT_PRIORITIES_2025.md executive snapshot date & change log.

Idempotent: only updates if today's date not already present.

Actions:
 1. Update frontmatter last_reviewed to today.
 2. Update '## Executive Snapshot (YYYY-MM-DD)' heading date.
 3. Append (or update) change log row for today if not present.

Exit codes:
 0 success (changes or none)
 1 unexpected error
"""
from __future__ import annotations
import re
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FILE = ROOT / 'docs' / '01-CURRENT-STATUS' / 'PROJECT_PRIORITIES_2025.md'

FRONTMATTER_RE = re.compile(r'^---\n(.*?)\n---\n', re.DOTALL)
EXEC_SNAPSHOT_RE = re.compile(r'^(## Executive Snapshot) \((\d{4}-\d{2}-\d{2})\)', re.MULTILINE)
CHANGE_LOG_TABLE_RE = re.compile(r'^## Change Log\n(.*?)(?:\n## |\Z)', re.DOTALL | re.MULTILINE)

def main():
    today = datetime.now(timezone.utc).date().isoformat()
    text = FILE.read_text(encoding='utf-8')
    original = text

    # 1. Update frontmatter last_reviewed
    m = FRONTMATTER_RE.match(text)
    if m:
        block = m.group(1)
        lines = block.splitlines()
        updated_block = []
        found = False
        for line in lines:
            if line.startswith('last_reviewed:'):
                updated_block.append(f'last_reviewed: {today}')
                found = True
            else:
                updated_block.append(line)
        if not found:
            updated_block.append(f'last_reviewed: {today}')
        new_block = '\n'.join(updated_block)
        text = text.replace(block, new_block, 1)

    # 2. Executive snapshot heading
    def repl_exec(match: re.Match):
        return f"{match.group(1)} ({today})"
    text, exec_count = EXEC_SNAPSHOT_RE.subn(repl_exec, text, count=1)

    # 3. Change log row
    # Ensure change log section exists (added earlier). If not, append at end.
    if '## Change Log' not in text:
        text += ('\n\n## Change Log\n\n| Date | Change | Author |\n|------|--------|--------|\n')
    # After ensuring section, inject row if missing for today.
    if today not in text:
        # Insert row after header of change log table
        lines = text.splitlines()
        for i,l in enumerate(lines):
            if l.strip().startswith('| Date | Change | Author |'):
                # next line is separator, insert after separator
                if i+1 < len(lines) and lines[i+1].startswith('|------'):
                    insert_idx = i+2
                else:
                    insert_idx = i+1
                lines.insert(insert_idx, f'| {today} | Automated snapshot refresh | platform |')
                text = '\n'.join(lines)
                break

    if text != original:
        FILE.write_text(text, encoding='utf-8')
        print('PROJECT_PRIORITIES_2025.md updated for snapshot refresh.')
    else:
        print('No snapshot updates needed.')

if __name__ == '__main__':  # pragma: no cover
    try:
        main()
    except Exception as e:  # noqa: BLE001 broad for CI
        print(f'Error updating snapshot: {e}')
        raise SystemExit(1)
