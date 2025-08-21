#!/usr/bin/env node
/* eslint-env node */
/* global console, process */
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const GUARD_RULES = [
  '@typescript-eslint/no-misused-promises',
  '@typescript-eslint/no-floating-promises'
];

const baseline = JSON.parse(readFileSync('.lint-baseline.json','utf8'));
for (const r of GUARD_RULES) {
  if ((baseline.rules[r] ?? 0) !== 0) {
    console.error(`[lint-guard] Expected baseline for ${r} to be 0; found ${baseline.rules[r]}`);
    process.exit(1);
  }
}

function runESLint() {
  const targets = ['apps/astro/src','apps/healwave/src','packages/*/src'].join(' ');
  const ignorePatterns = ['**/.storybook/**','**/dist/**','**/build/**','**/public/**','**/node_modules/**','**/*.test.*','**/*.spec.*','**/__tests__/**'];
  const ignore = ignorePatterns.map(p=>`--ignore-pattern "${p}"`).join(' ');
  let raw;
  try {
    raw = execSync(`npx eslint ${targets} --ext .ts,.tsx -f json ${ignore}`, { stdio:'pipe', encoding:'utf8', maxBuffer:20*1024*1024 });
  } catch (e) {
    raw = (e.stdout && e.stdout.toString()) || '[]';
  }
  return JSON.parse(raw||'[]');
}

const data = runESLint();
const violations = {};
for (const f of data) {
  for (const m of f.messages || []) {
    if (m.severity === 2 && m.ruleId && GUARD_RULES.includes(m.ruleId)) {
      violations[m.ruleId] = (violations[m.ruleId] || 0) + 1;
    }
  }
}

const offenders = Object.entries(violations).filter(([,count])=>count>0);
if (offenders.length) {
  console.error('\n[lint-guard] Guard rule violations detected:');
  for (const [r,c] of offenders) console.error(`  ${r}: ${c}`);
  console.error('\nFix immediately; these rules must remain at zero.');
  process.exit(1);
}
console.log('[lint-guard] OK (no guarded rule violations)');
