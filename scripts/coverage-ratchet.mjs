#!/usr/bin/env node
/* Coverage Ratchet: aggregates coverage across selected workspaces (currently astro app) and enforces non-regression. */
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const PROJECTS = [
  { name: 'astro', path: 'apps/astro' }
];

const BASELINE_FILE = '.coverage-baseline.json';
const PRECISION = 2; // decimal places for stored pct
const IMPROVEMENT_STEP = 0.25; // bump baseline only when improved by at least this pct

function run(cmd, cwd) {
  const [bin, ...args] = cmd.split(/\s+/);
  const res = spawnSync(bin, args, { cwd, stdio: 'inherit', env: { ...process.env, CI: 'true' } });
  if (res.status !== 0) {
    console.error(`[coverage-ratchet] Command failed: ${cmd}`);
    process.exit(res.status ?? 1);
  }
}

function aggregateCoverage(finalJsonPath) {
  if (!existsSync(finalJsonPath)) {
    throw new Error(`Coverage file missing: ${finalJsonPath}`);
  }
  const data = JSON.parse(readFileSync(finalJsonPath, 'utf8'));
  let statementsCovered = 0, statementsTotal = 0;
  let functionsCovered = 0, functionsTotal = 0;
  let branchesCovered = 0, branchesTotal = 0;
  let linesCovered = 0, linesTotal = 0;

  for (const file of Object.values(data)) {
    if (typeof file !== 'object' || file === null) continue;
    const f = file;
    const sKeys = Object.keys(f.s ?? {});
    statementsTotal += sKeys.length;
    statementsCovered += sKeys.filter(k => (f.s?.[k] ?? 0) > 0).length;
    const fnKeys = Object.keys(f.f ?? {});
    functionsTotal += fnKeys.length;
    functionsCovered += fnKeys.filter(k => (f.f?.[k] ?? 0) > 0).length;
    for (const arr of Object.values(f.b ?? {})) {
      if (!Array.isArray(arr)) continue;
      branchesTotal += arr.length;
      branchesCovered += arr.filter(c => (c ?? 0) > 0).length;
    }
    linesTotal += sKeys.length;
    linesCovered += sKeys.filter(k => (f.s?.[k] ?? 0) > 0).length;
  }

  const pct = (covered, total) => total === 0 ? 100 : (covered / total) * 100;
  return {
    lines: pct(linesCovered, linesTotal),
    statements: pct(statementsCovered, statementsTotal),
    functions: pct(functionsCovered, functionsTotal),
    branches: pct(branchesCovered, branchesTotal)
  };
}

function roundMetrics(m) {
  const r = {};
  for (const k of Object.keys(m)) {
    r[k] = Number(m[k].toFixed(PRECISION));
  }
  return r;
}

function loadBaseline() {
  if (!existsSync(BASELINE_FILE)) return null;
  return JSON.parse(readFileSync(BASELINE_FILE, 'utf8'));
}

function saveBaseline(baseline) {
  writeFileSync(BASELINE_FILE, JSON.stringify(baseline, null, 2) + '\n');
}

for (const p of PROJECTS) {
  console.log(`[coverage-ratchet] Running coverage for ${p.name}`);
  run('pnpm exec vitest run --coverage --silent', p.path);
}

let combined = { lines: 0, statements: 0, functions: 0, branches: 0 };
let count = 0;
for (const p of PROJECTS) {
  const covPath = join(p.path, 'coverage', 'coverage-final.json');
  const m = aggregateCoverage(covPath);
  combined.lines += m.lines;
  combined.statements += m.statements;
  combined.functions += m.functions;
  combined.branches += m.branches;
  count++;
}
combined.lines /= count; combined.statements /= count; combined.functions /= count; combined.branches /= count;
combined = roundMetrics(combined);

console.log('[coverage-ratchet] Current coverage %', combined);
const baseline = loadBaseline();
if (baseline === null) {
  console.log('[coverage-ratchet] Creating initial baseline');
  saveBaseline(combined);
  process.exit(0);
}

let fail = false;
for (const key of Object.keys(combined)) {
  if (combined[key] + 1e-6 < baseline[key]) {
    console.error(`[coverage-ratchet] Regression in ${key}: ${combined[key]} < ${baseline[key]}`);
    fail = true;
  }
}

if (fail) {
  console.error('[coverage-ratchet] Failing due to coverage regression.');
  process.exit(1);
}

let improved = false;
const newBaseline = { ...baseline };
for (const key of Object.keys(combined)) {
  if (combined[key] >= baseline[key] + IMPROVEMENT_STEP) {
    newBaseline[key] = combined[key];
    improved = true;
  }
}
if (improved) {
  console.log('[coverage-ratchet] Improving baseline ->', newBaseline);
  saveBaseline(newBaseline);
} else {
  console.log('[coverage-ratchet] No baseline update needed');
}
console.log('[coverage-ratchet] Success');
