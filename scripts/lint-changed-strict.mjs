#!/usr/bin/env node
/* eslint-env node */
import process from 'node:process';
/**
 * Lint only changed (staged or since origin/main) TS/TSX files with warnings treated as errors.
 * Strategy: gather changed files -> run eslint --max-warnings=0
 */
import { execSync } from 'node:child_process';

function sh(cmd) { return execSync(cmd, { stdio: 'pipe', encoding: 'utf8' }).trim(); }

let base = process.env.LINT_CHANGED_BASE || 'origin/main';
try { sh(`git fetch -q ${base.split('/')[0]}`); } catch (err) { /* ignore fetch issues */ }

// Prefer staged files; if none, diff vs base
let files = sh('git diff --name-only --cached || echo').split('\n').filter(Boolean);
if (files.length === 0) {
  files = sh(`git diff --name-only ${base}...HEAD || echo`).split('\n').filter(Boolean);
}
files = files.filter(f => /\.(ts|tsx)$/i.test(f));
if (!files.length) {
  console.log('[lint-changed-strict] No changed TS/TSX files.');
  process.exit(0);
}

const batch = files.map(f => f.includes(' ') ? `'${f}'` : f).join(' ');
const cmd = `npx eslint ${batch} --ext .ts,.tsx --max-warnings=0`;
console.log('[lint-changed-strict] Running:', cmd);
try {
  execSync(cmd, { stdio: 'inherit' });
  console.log('[lint-changed-strict] Success');
} catch (e) {
  console.error('[lint-changed-strict] Failed');
  process.exit(1);
}
