#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const srcDir = join(root, 'src');
const distDir = join(root, 'dist');

const want = new Set([
  'component-library.d.ts',
  'component-architecture.d.ts',
  'lazy-loading.d.ts',
  'performance.d.ts',
  // firebase now structured as directory; keep backward compatibility copying root firebase.d.ts if present
  'firebase.d.ts',
  'enhanced-testing.d.ts',
  'accessibility-testing.d.ts',
  'index.d.ts', // when inside firebase/ subdirectory
  'analytics.d.ts',
]);

// Always mirror hooks directory (types live beside source and are needed for subpath export)
const ALWAYS_COPY_DIRS = ['hooks']; // includes useAnalytics and future hook declarations

function copyIfWanted(filePath) {
  const rel = filePath.substring(srcDir.length + 1);
  const name = filePath.split('/').pop();
  if (!name) return;
  // Copy if explicitly wanted or if in an always-copy directory and ends with .d.ts
  const topLevelDir = rel.split('/')[0];
  if (!rel.endsWith('.d.ts')) return;
  if (!want.has(name) && !ALWAYS_COPY_DIRS.includes(topLevelDir)) return;
  // Always prefer source hook index.d.ts to ensure latest exports (e.g., useAnalytics)
  if (rel === 'hooks/index.d.ts') {
    // fall through to copy
  }
  const target = join(distDir, rel);
  const dir = target.substring(0, target.lastIndexOf('/'));
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  cpSync(filePath, target);
  console.log('Copied declaration stub:', rel);
}

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full);
    else if (st.isFile() && full.endsWith('.d.ts')) copyIfWanted(full);
  }
}

if (!existsSync(srcDir)) {
  console.error('Source directory missing:', srcDir);
  process.exit(0);
}
if (!existsSync(distDir)) mkdirSync(distDir, { recursive: true });
walk(srcDir);
console.log('Declaration stub copy complete.');
