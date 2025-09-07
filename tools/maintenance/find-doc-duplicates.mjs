#!/usr/bin/env node
import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const EXCLUDES = new Set(['.git', 'node_modules', 'node-modules', 'dist', 'build', '.next', '.turbo', '.venv', 'coverage', 'htmlcov']);

/**
 * Recursively walk directory and collect .md files
 */
function walk(dir, out) {
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith('.DS_Store')) continue;
    const full = path.join(dir, entry);
    const rel = path.relative(ROOT, full);
    const name = path.basename(full);
    try {
      const st = statSync(full);
      if (st.isDirectory()) {
        if (EXCLUDES.has(entry)) continue;
        walk(full, out);
      } else if (st.isFile() && name.toLowerCase().endsWith('.md')) {
        out.push(rel);
      }
    } catch {
      // ignore permission/IO errors
    }
  }
}

const files = [];
walk(ROOT, files);

const map = new Map(); // basename -> [paths]
for (const f of files) {
  const base = path.basename(f);
  if (!map.has(base)) map.set(base, []);
  map.get(base).push(f);
}

const dupes = [...map.entries()].filter(([, arr]) => arr.length > 1).sort((a, b) => b[1].length - a[1].length);

if (dupes.length === 0) {
  console.log('No duplicate markdown basenames found.');
  process.exit(0);
}

for (const [base, paths] of dupes) {
  console.log(`[DUPLICATE] ${base} (${paths.length})`);
  for (const p of paths.slice(0, 20)) {
    console.log(`  - ${p}`);
  }
  if (paths.length > 20) console.log(`  ... and ${paths.length - 20} more`);
}
