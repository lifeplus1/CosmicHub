#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const summaryPath = path.join(process.cwd(), 'coverage', 'coverage-summary.json');
if (!fs.existsSync(summaryPath)) {
  console.error('Coverage summary missing.');
  process.exit(0);
}
const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8')).total || {};
const pct = summary.lines?.pct ?? 0;
const color = pct >= 90 ? 'brightgreen' : pct >= 80 ? 'green' : pct >= 70 ? 'yellow' : 'orange';
const badge = {
  schemaVersion: 1,
  label: 'coverage',
  message: pct.toFixed(1) + '%',
  color
};
const outDir = path.join(process.cwd(), 'metrics');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'coverage-badge.json'), JSON.stringify(badge, null, 2));
console.log('Coverage badge written.');
