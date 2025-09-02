#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const BASELINE_PATH = 'metrics/type-errors-baseline.json';
const CURRENT_PATH = 'metrics/type-errors-current.json';

function run(cmd) {
  return execSync(cmd, { stdio: 'pipe', encoding: 'utf8' });
}

function ensureDir(path) {
  const dir = dirname(path);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

// Build supporting packages first (ui, config) so downstream app type checks surface their errors
let compositeOutput = '';
function append(label, out) {
  compositeOutput += `\n### ${label}\n` + out + '\n';
}

// Individual segments we want to parse; keep simple for now
const segments = [
  { label: 'UI', cmd: 'pnpm -F @cosmichub/ui build' },
  { label: 'CONFIG', cmd: 'pnpm -F @cosmichub/config build' },
  { label: 'ASTRO', cmd: 'pnpm run type-check:astro' },
  { label: 'HEALWAVE', cmd: 'pnpm run type-check:healwave' },
  // Types package (tests + main)
  { label: 'TYPES:main', cmd: 'tsc -p packages/types/tsconfig.json --noEmit' },
  {
    label: 'TYPES:test',
    cmd: 'tsc -p packages/types/tsconfig.test.json --noEmit',
  },
];

for (const { label, cmd } of segments) {
  try {
    const out = run(cmd);
    append(label, out);
  } catch (err) {
    append(label, err.stdout || err.message || '');
  }
}

const tscOutput = compositeOutput;

// Parse basic error metrics
const lines = tscOutput.split(/\r?\n/);
const errorLines = lines.filter(l => /error TS\d+:/.test(l));
const totalErrors = errorLines.length;

const fileErrors = {};
for (const line of errorLines) {
  const match = line.match(
    /([^:\s]+\.tsx?|\.ts)\((\d+),(\d+)\)\s*-\s*error\s*TS(\d+):/
  );
  if (match) {
    const file = match[1];
    fileErrors[file] = (fileErrors[file] || 0) + 1;
  }
}

// Derive rudimentary project buckets
const byProject = {
  'apps/astro': 0,
  'apps/healwave': 0,
  'packages/ui': 0,
  'packages/config': 0,
  'packages/types': 0,
};
for (const f of Object.keys(fileErrors)) {
  if (f.startsWith('apps/astro')) byProject['apps/astro'] += fileErrors[f];
  else if (f.startsWith('apps/healwave'))
    byProject['apps/healwave'] += fileErrors[f];
  else if (f.startsWith('packages/ui'))
    byProject['packages/ui'] += fileErrors[f];
  else if (f.startsWith('packages/config'))
    byProject['packages/config'] += fileErrors[f];
  else if (f.startsWith('packages/types'))
    byProject['packages/types'] += fileErrors[f];
}

const current = {
  totalErrors,
  fileErrors,
  byProject,
  generatedAt: new Date().toISOString(),
};
ensureDir(CURRENT_PATH);
writeFileSync(CURRENT_PATH, JSON.stringify(current, null, 2));

let baseline = { totalErrors: totalErrors, fileErrors: {}, byProject };
if (existsSync(BASELINE_PATH)) {
  baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf8'));
}

const shouldUpdate = process.env.TYPE_RATCHET_UPDATE === '1';

if (totalErrors > baseline.totalErrors && !shouldUpdate) {
  console.error(
    `❌ Type errors increased from ${baseline.totalErrors} to ${totalErrors}`
  );
  console.error(
    'Run with TYPE_RATCHET_UPDATE=1 pnpm run type-check:ratchet to refresh baseline intentionally.'
  );
  process.exit(1);
}

if (totalErrors < baseline.totalErrors || shouldUpdate) {
  const verb = shouldUpdate ? 'Refreshed' : 'Improving';
  console.log(`✅ ${verb} baseline: ${baseline.totalErrors} -> ${totalErrors}`);
  ensureDir(BASELINE_PATH);
  writeFileSync(BASELINE_PATH, JSON.stringify(current, null, 2));
} else {
  console.log(`✅ Type errors unchanged at ${totalErrors}`);
}
