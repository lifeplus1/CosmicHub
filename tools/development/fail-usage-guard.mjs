#!/usr/bin/env node
/* Guard: discourage direct fail() calls outside shared utility & explicit allowlist. */
import { readdirSync, statSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const ALLOWED_DIRS = ['packages/config/src/utils/api'];
const ALLOWED_FILE_PATTERNS = [
  /result\.ts$/,
  /test-helpers\.ts$/,
  /network-mocks\.ts$/,
];
const IGNORE_EXT = [/\.test\./, /\.spec\./, /\.stories\./];
const IGNORE_DIR = [/__tests__/, /dist\//, /build\//, /node_modules\//];
const ALLOW_COMMENT = /ALLOW_FAIL_USAGE/;

const offenders = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const rel = relative(ROOT, full);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (IGNORE_DIR.some(r => r.test(rel))) continue;
      walk(full);
    } else if (/\.(ts|tsx)$/.test(entry)) {
      if (IGNORE_EXT.some(r => r.test(entry))) continue;
      scanFile(full, rel);
    }
  }
}

function isAllowedPath(rel) {
  if (ALLOWED_DIRS.some(d => rel.startsWith(d))) return true;
  if (ALLOWED_FILE_PATTERNS.some(r => r.test(rel))) return true;
  return false;
}

function scanFile(full, rel) {
  const txt = readFileSync(full, 'utf8');
  if (!/\bfail\s*\(/.test(txt)) return;
  if (isAllowedPath(rel)) return;
  if (ALLOW_COMMENT.test(txt)) return;
  const lines = txt.split(/\n/);
  const localOff = [];
  lines.forEach((line, idx) => {
    if (/\bfail\s*\(/.test(line)) {
      if (/INVALID_SHAPE/.test(line)) return;
      localOff.push({ line: idx + 1, content: line.trim() });
    }
  });
  if (localOff.length) offenders.push({ file: rel, occurrences: localOff });
}

walk(join(ROOT, 'apps'));
walk(join(ROOT, 'packages'));

if (offenders.length) {
  console.error('\n[fail-usage-guard] Direct fail() usage violations:');
  for (const o of offenders) {
    console.error(`  ${o.file}`);
    for (const occ of o.occurrences) {
      console.error(`    L${occ.line}: ${occ.content}`);
    }
  }
  console.error(
    '\nAdd comment // ALLOW_FAIL_USAGE if a one-off is justified, or refactor to toFailure / ErrorCode constants.'
  );
  process.exit(1);
}
console.log('[fail-usage-guard] OK (no disallowed direct fail() calls)');
