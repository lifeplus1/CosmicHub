#!/usr/bin/env node
/**
 * Summarize @typescript-eslint/strict-boolean-expressions violations from an ESLint JSON report.
 * Usage: node scripts/strict-summary.mjs /tmp/astro_eslint.json [limit]
 */
import fs from 'fs';
import path from 'path';

const reportPath = process.argv[2] || '/tmp/astro_eslint.json';
const limit = Number(process.argv[3] || 40);

if (!fs.existsSync(reportPath)) {
  console.error('Report file not found:', reportPath);
  process.exit(1);
}

let raw;
try {
  raw = fs.readFileSync(reportPath, 'utf8');
} catch (e) {
  console.error('Failed reading report:', e);
  process.exit(1);
}

let data;
try {
  data = JSON.parse(raw);
  if (!Array.isArray(data)) throw new Error('Top-level JSON is not an array');
} catch (e) {
  console.error('Invalid JSON report:', e.message);
  process.exit(1);
}

const RULE = '@typescript-eslint/strict-boolean-expressions';

const rows = data
  .map(f => ({
    file: f.filePath,
    messages: (f.messages || []).filter(m => m.ruleId === RULE)
  }))
  .filter(r => r.messages.length > 0)
  .sort((a, b) => b.messages.length - a.messages.length);

const totalViolations = rows.reduce((sum, r) => sum + r.messages.length, 0);

console.log(`Total strict-boolean violations: ${totalViolations}`);
console.log(`Files with violations: ${rows.length}`);
console.log('Top offenders:');
for (const r of rows.slice(0, limit)) {
  const rel = r.file.includes('apps/astro/')
    ? r.file.split('apps/astro/')[1]
    : path.relative(process.cwd(), r.file);
  console.log(String(r.messages.length).padStart(3, ' '), rel);
}

// Optional JSON summary output (machine-consumable) when env set
if (process.env.JSON) {
  const summary = rows.map(r => ({ file: r.file, count: r.messages.length }));
  process.stdout.write('\nJSON_SUMMARY_BEGIN\n');
  process.stdout.write(JSON.stringify({ totalViolations, files: summary }, null, 2));
  process.stdout.write('\nJSON_SUMMARY_END\n');
}
