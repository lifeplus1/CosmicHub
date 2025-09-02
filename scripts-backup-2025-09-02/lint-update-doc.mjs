#!/usr/bin/env node
/* global console, process */
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const planPath = 'docs/development-guides/PHASE_2_LINTING_PLAN.md';
const markerStart = '<!-- LINT_DELTA_START -->';
const markerEnd = '<!-- LINT_DELTA_END -->';

function getDelta() {
  const raw = execSync('node ./scripts/lint-delta.mjs', {
    stdio: 'pipe',
    encoding: 'utf8',
  });
  return JSON.parse(raw);
}

function formatTable(summary) {
  const header =
    '| Rule | Baseline | Current | Delta | Reduction % |\n|------|----------|---------|-------|-------------|';
  const rows = summary.rules.map(
    r =>
      `| ${r.rule} | ${r.baseline} | ${r.current} | ${r.delta >= 0 ? '+' + r.delta : r.delta} | ${r.reduction.toFixed(1)} |`
  );
  const total = `| **TOTAL** | ${summary.totalBaseline} | ${summary.totalCurrent} | ${summary.totalCurrent - summary.totalBaseline >= 0 ? '+' + (summary.totalCurrent - summary.totalBaseline) : summary.totalCurrent - summary.totalBaseline} | ${(((summary.totalBaseline - summary.totalCurrent) / Math.max(1, summary.totalBaseline)) * 100).toFixed(1)} |`;
  return [header, ...rows, total].join('\n');
}

const summary = getDelta();
const doc = readFileSync(planPath, 'utf8');
const startIdx = doc.indexOf(markerStart);
const endIdx = doc.indexOf(markerEnd);
if (startIdx === -1 || endIdx === -1) {
  console.error('[lint-update-doc] Markers not found. Aborting.');
  process.exit(1);
}
const before = doc.slice(0, startIdx + markerStart.length);
const after = doc.slice(endIdx);
const table = `\n### Latest Lint Delta (Updated: ${summary.generated})\n\n${formatTable(summary)}\n`;
const next = before + table + after;
writeFileSync(planPath, next);
console.log('[lint-update-doc] Documentation updated.');
