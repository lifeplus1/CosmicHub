#!/usr/bin/env node
/* eslint-env node */
/* global console */
import process from 'node:process';
/**
 * Lint Ratchet Script
 * Fails (exit 1) only if error counts for tracked rules exceed the stored baseline.
 * Baseline stored in .lint-baseline.json at repo root. Run with LINT_RATCHET_UPDATE=1 to refresh baseline.
 */
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const TRACK_RULES = [
  '@typescript-eslint/no-misused-promises',
  '@typescript-eslint/no-floating-promises',
  '@typescript-eslint/no-unsafe-member-access',
  '@typescript-eslint/no-unsafe-assignment',
  '@typescript-eslint/strict-boolean-expressions',
  '@typescript-eslint/explicit-function-return-type',
  'eqeqeq',
];

const root = process.cwd();
const baselinePath = path.join(root, '.lint-baseline.json');

function runESLintJSON() {
  // Limit scope to source directories to reduce output & avoid config/tooling/test files
  const targets = [
    'apps/astro/src',
    'apps/healwave/src',
    'packages/*/src',
  ].join(' ');
  const ignorePatterns = [
    '**/.storybook/**',
    '**/dist/**',
    '**/build/**',
    '**/public/**',
    '**/node_modules/**',
    '**/*.test.*',
    '**/*.spec.*',
    '**/__tests__/**',
  ];
  const ignore = ignorePatterns.map(p => `--ignore-pattern "${p}"`).join(' ');
  const cmd = `npx eslint ${targets} --ext .ts,.tsx -f json ${ignore}`;
  let raw;
  try {
    raw = execSync(cmd, {
      stdio: 'pipe',
      encoding: 'utf8',
      maxBuffer: 20 * 1024 * 1024,
    });
  } catch (e) {
    // ESLint exits non-zero on errors; still attempt to parse stdout
    raw = (e.stdout && e.stdout.toString()) || '[]';
  }
  return JSON.parse(raw || '[]');
}

function aggregate(data) {
  const counts = Object.create(null);
  for (const file of data) {
    for (const m of file.messages || []) {
      if (m.severity === 2 && m.ruleId && TRACK_RULES.includes(m.ruleId)) {
        counts[m.ruleId] = (counts[m.ruleId] || 0) + 1;
      }
    }
  }
  for (const r of TRACK_RULES) counts[r] = counts[r] || 0; // ensure keys
  return counts;
}

const update = process.env.LINT_RATCHET_UPDATE === '1';
const report = aggregate(runESLintJSON());

if (update || !existsSync(baselinePath)) {
  writeFileSync(
    baselinePath,
    JSON.stringify(
      { created: new Date().toISOString(), rules: report },
      null,
      2
    )
  );
  console.log('[lint-ratchet] Baseline updated:', report);
  process.exit(0);
}

const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
const failures = [];
for (const rule of TRACK_RULES) {
  const prev = baseline.rules[rule] ?? 0;
  const cur = report[rule] ?? 0;
  if (cur > prev) failures.push({ rule, prev, cur });
}

if (failures.length) {
  console.error('\n[lint-ratchet] Regression detected in tracked rules:');
  for (const f of failures) {
    console.error(`  ${f.rule}: ${f.prev} -> ${f.cur}`);
  }
  console.error(
    '\nUpdate baseline intentionally with: LINT_RATCHET_UPDATE=1 pnpm run lint:ratchet'
  );
  process.exit(1);
}

console.log('[lint-ratchet] OK (no regressions)');
console.table(report);
