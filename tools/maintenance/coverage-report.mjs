#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const combinedBaselinePath = path.join(
  process.cwd(),
  '.coverage-baseline.json'
);
const perProjectPath = path.join(
  process.cwd(),
  'metrics',
  'coverage-projects.json'
);
if (!fs.existsSync(perProjectPath)) {
  console.error('coverage-projects.json missing. Run coverage-ratchet first.');
  process.exit(0);
}
const per = JSON.parse(fs.readFileSync(perProjectPath, 'utf8'));
const baseline = fs.existsSync(combinedBaselinePath)
  ? JSON.parse(fs.readFileSync(combinedBaselinePath, 'utf8'))
  : null;

function fmt(n) {
  return typeof n === 'number' ? n.toFixed(2) + '%' : '-';
}
let md = '# Coverage Report (Aggregated)\n\n';
md += 'Combined (weighted):\\n';
md += `- Lines: ${fmt(per.combined.lines)}\n- Statements: ${fmt(per.combined.statements)}\n- Functions: ${fmt(per.combined.functions)}\n- Branches: ${fmt(per.combined.branches)}\n\n`;
if (baseline) {
  md += 'Baseline:\\n';
  md += `- Lines: ${fmt(baseline.lines)}\n- Statements: ${fmt(baseline.statements)}\n- Functions: ${fmt(baseline.functions)}\n- Branches: ${fmt(baseline.branches)}\n\n`;
}
md += 'Per Project:\n';
for (const [name, data] of Object.entries(per.perProject)) {
  md += `- ${name}: lines ${fmt(data.lines)}, statements ${fmt(data.statements)}, funcs ${fmt(data.functions)}, branches ${fmt(data.branches)}\n`;
}

const outPath = path.join(process.cwd(), 'metrics', 'COVERAGE_REPORT.md');
fs.writeFileSync(outPath, md);
console.log('Wrote', outPath);
