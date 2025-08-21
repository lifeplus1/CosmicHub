#!/usr/bin/env node
/* Coverage Ratchet: aggregates coverage across selected workspaces (currently astro app) and enforces non-regression. */
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const PROJECTS = [
  { name: 'astro', kind: 'vitest', path: 'apps/astro', testCmd: 'pnpm exec vitest run --coverage --silent' },
  { name: 'types', kind: 'vitest', path: 'packages/types', testCmd: 'pnpm exec vitest run --coverage --silent' },
  { name: 'backend', kind: 'pytest', path: 'backend', testCmd: 'python3 -m pytest -q --cov=. --cov-report=xml --cov-report=html' }
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
  run(p.testCmd, p.path);
}

// Weighted combination by statements (frontend) or lines-valid (backend)
let totalWeight = 0;
let weighted = { lines: 0, statements: 0, functions: 0, branches: 0 };
const perProject = {};
for (const p of PROJECTS) {
  if (p.kind === 'vitest') {
    const covPath = join(p.path, 'coverage', 'coverage-final.json');
    const raw = JSON.parse(readFileSync(covPath, 'utf8'));
    let statementsTotal = 0, statementsCovered = 0, functionsTotal = 0, functionsCovered = 0, branchesTotal = 0, branchesCovered = 0, linesTotal = 0, linesCovered = 0;
    for (const file of Object.values(raw)) {
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
    const pct = (c, t) => t === 0 ? 100 : (c / t * 100);
    const metrics = {
      lines: pct(linesCovered, linesTotal),
      statements: pct(statementsCovered, statementsTotal),
      functions: pct(functionsCovered, functionsTotal),
      branches: pct(branchesCovered, branchesTotal),
      weight: statementsTotal || 1
    };
    perProject[p.name] = roundMetrics(metrics);
    weighted.lines += metrics.lines * metrics.weight;
    weighted.statements += metrics.statements * metrics.weight;
    weighted.functions += metrics.functions * metrics.weight;
    weighted.branches += metrics.branches * metrics.weight;
    totalWeight += metrics.weight;
  } else if (p.kind === 'pytest') {
    const xmlPath = join(p.path, 'coverage.xml');
    if (!existsSync(xmlPath)) {
      console.warn(`[coverage-ratchet] WARNING: backend coverage.xml missing at ${xmlPath}, skipping backend metrics.`);
      continue;
    }
    const xml = readFileSync(xmlPath, 'utf8');
    const lineRateMatch = xml.match(/line-rate="([0-9.]+)"/);
    const branchRateMatch = xml.match(/branch-rate="([0-9.]+)"/);
    const linesValidMatch = xml.match(/lines-valid="([0-9]+)"/);
    const linesCoveredMatch = xml.match(/lines-covered="([0-9]+)"/);
    const linesValid = Number(linesValidMatch?.[1] || 0);
    const linesCovered = Number(linesCoveredMatch?.[1] || Math.round(linesValid * Number(lineRateMatch?.[1] || 0)));
    const linePct = linesValid === 0 ? 100 : (linesCovered / linesValid * 100);
    const branchPct = Number(branchRateMatch?.[1] || 0) * 100;
    // Pytest XML lacks function-level breakdown; approximate functions = linePct
    const funcPct = linePct;
    const weight = linesValid || 1;
    perProject[p.name] = roundMetrics({ lines: linePct, statements: linePct, functions: funcPct, branches: branchPct, weight });
    weighted.lines += linePct * weight;
    weighted.statements += linePct * weight;
    weighted.functions += funcPct * weight;
    weighted.branches += branchPct * weight;
    totalWeight += weight;
  }
}
const combined = roundMetrics({
  lines: weighted.lines / totalWeight,
  statements: weighted.statements / totalWeight,
  functions: weighted.functions / totalWeight,
  branches: weighted.branches / totalWeight
});

console.log('[coverage-ratchet] Current coverage %', combined);
const baseline = loadBaseline();
const projectNames = PROJECTS.map(p => p.name).sort();
if (baseline === null) {
  console.log('[coverage-ratchet] Creating initial baseline');
  saveBaseline({ ...combined, projects: projectNames });
  process.exit(0);
}

// If baseline lacks project list or projects expanded, refresh baseline once (treat as opt-in expansion)
if (!baseline.projects || projectNames.some(n => !baseline.projects.includes(n))) {
  console.log('[coverage-ratchet] Detected project set change. Refreshing baseline to include new projects.');
  saveBaseline({ ...combined, projects: projectNames });
  process.exit(0);
}

let fail = false;
// Allow a tiny floating error tolerance for branch metric (instrumentation drift)
const FLOAT_TOLERANCE = 0.03; // 0.03 percentage points tolerance
for (const key of ['lines','statements','functions','branches']) {
  if (combined[key] + 1e-6 < baseline[key]) {
    const delta = baseline[key] - combined[key];
    if (key === 'branches' && delta <= FLOAT_TOLERANCE) {
      console.warn(`[coverage-ratchet] Minor branch fluctuation tolerated (Δ=${delta.toFixed(3)} <= ${FLOAT_TOLERANCE})`);
    } else {
      console.error(`[coverage-ratchet] Regression in ${key}: ${combined[key]} < ${baseline[key]}`);
      fail = true;
    }
  }
}

// Emit per-project JSON summary for reporting before potential exit
try {
  const outDir = 'metrics';
  if (!existsSync(outDir)) require('fs').mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'coverage-projects.json'), JSON.stringify({ perProject, combined }, null, 2));
} catch (e) {
  console.warn('[coverage-ratchet] Could not write per-project coverage summary', e.message);
}

if (fail) {
  console.error('[coverage-ratchet] Failing due to coverage regression.');
  process.exit(1);
}

let improved = false;
const newBaseline = { ...baseline };
for (const key of ['lines','statements','functions','branches']) {
  if (combined[key] >= baseline[key] + IMPROVEMENT_STEP) {
    newBaseline[key] = combined[key];
    improved = true;
  }
}
if (improved) {
  const updated = { ...newBaseline, projects: projectNames };
  console.log('[coverage-ratchet] Improving baseline ->', updated);
  saveBaseline(updated);
} else {
  console.log('[coverage-ratchet] No baseline update needed');
}
console.log('[coverage-ratchet] Success');
