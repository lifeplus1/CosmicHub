#!/usr/bin/env node
/* global console */
import { writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { buildLintBadge } from './lib/build-lint-badge.mjs';

function getSummary() {
  const raw = execSync('node ./scripts/lint-delta.mjs', {
    stdio: 'pipe',
    encoding: 'utf8',
  });
  return JSON.parse(raw);
}

const s = getSummary();
const badge = buildLintBadge(s);
writeFileSync('lint-metrics-badge.json', JSON.stringify(badge, null, 2));
console.log('[lint-badge] badge written to lint-metrics-badge.json');
