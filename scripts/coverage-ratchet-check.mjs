#!/usr/bin/env node
// Compares current coverage summary against baseline; fails if any metric drops.
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const baselinePath = path.join(root, 'scripts', 'coverage-baseline.json');
const summaryDir = path.join(root, 'coverage');
const summaryPath = path.join(summaryDir, 'coverage-summary.json');

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

// Helper to attempt synthesizing a summary from any coverage-final.json files
function synthesizeSummary() {
  const finals = [];
  function walk(dir, depth = 0) {
    if (depth > 4) return; // safety
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) {
        // only descend into small/expected dirs
        if (/node_modules|\.git|dist|htmlcov/.test(p)) continue;
        walk(p, depth + 1);
      } else if (e.name === 'coverage-final.json') {
        finals.push(p);
      }
    }
  }
  walk(root);
  if (!finals.length) return null;

  let totalStatements = 0, coveredStatements = 0;
  let totalBranches = 0, coveredBranches = 0;
  let totalFunctions = 0, coveredFunctions = 0;

  for (const file of finals) {
    let data;
    try { data = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { continue; }
    for (const fileKey of Object.keys(data)) {
      const fc = data[fileKey];
      if (!fc || typeof fc !== 'object') continue;
      // Statements
      if (fc.s) {
        const keys = Object.keys(fc.s);
        totalStatements += keys.length;
        coveredStatements += keys.filter(k => fc.s[k] > 0).length;
      }
      // Branches
      if (fc.b) {
        for (const bid of Object.keys(fc.b)) {
          const arr = fc.b[bid];
            if (Array.isArray(arr)) {
              totalBranches += arr.length;
              coveredBranches += arr.filter(c => c > 0).length;
            }
        }
      }
      // Functions
      if (fc.f) {
        const fnIds = Object.keys(fc.f);
        totalFunctions += fnIds.length;
        coveredFunctions += fnIds.filter(id => fc.f[id] > 0).length;
      }
    }
  }

  if (totalStatements === 0) return null; // give up

  const pct = (c, t) => t === 0 ? 0 : (c / t * 100);
  // Istanbul summary shape compatibility (we only need .total.metrics.pct)
  const summary = {
    total: {
      lines: { pct: pct(coveredStatements, totalStatements) },
      statements: { pct: pct(coveredStatements, totalStatements) },
      branches: { pct: pct(coveredBranches, totalBranches) },
      functions: { pct: pct(coveredFunctions, totalFunctions) }
    }
  };
  if (!fs.existsSync(summaryDir)) fs.mkdirSync(summaryDir, { recursive: true });
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  console.log('Synthesized coverage summary at', summaryPath);
  return summary;
}

let synthesized = false;
if (!fs.existsSync(summaryPath)) {
  const result = synthesizeSummary();
  if (!result) {
    console.error('Coverage summary not found and unable to synthesize at', summaryPath);
    process.exit(1);
  }
  synthesized = true;
}

if (!fs.existsSync(baselinePath)) {
  console.error('Baseline not found; creating new baseline from current coverage.');
  const summary = readJSON(summaryPath).total || {};
  const baseline = {
    timestamp: new Date().toISOString(),
    lines: summary.lines?.pct ?? 0,
    branches: summary.branches?.pct ?? 0,
    functions: summary.functions?.pct ?? 0,
    statements: summary.statements?.pct ?? 0
  };
  fs.writeFileSync(baselinePath, JSON.stringify(baseline, null, 2));
  console.log('Baseline created.');
  process.exit(0);
}

const baseline = readJSON(baselinePath);
const currentFile = readJSON(summaryPath);
const current = currentFile.total || {};

const metrics = ['lines','branches','functions','statements'];
let failing = false;
const report = [];
for (const m of metrics) {
  const base = baseline[m];
  const cur = current[m]?.pct ?? 0;
  if (cur + 1e-6 < base) {
    failing = true;
  }
  report.push({ metric: m, baseline: base, current: cur });
}

console.table(report);
if (synthesized) {
  console.log('(info) coverage summary was synthesized from coverage-final.json files. Consider enabling json-summary reporter in vitest for more accuracy.');
}
if (failing) {
  console.error('Coverage ratchet violation: at least one metric decreased.');
  process.exit(1);
}
console.log('Coverage ratchet ok (no decreases).');
