#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const BASELINE = join(ROOT, 'metrics', 'any-usage-baseline.json');
const SCAN_DIRS = ['packages', 'apps'];
const SKIP = ['node_modules', 'dist', '.turbo'];
const RGX = /\bany\b/g;

async function walk(dir) {
  const ents = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of ents) {
    const full = join(dir, e.name);
    if (SKIP.some(s => full.includes(s))) continue;
    if (e.isDirectory()) files.push(...(await walk(full)));
    else if (/\.(ts|tsx|mts|cts|js|jsx)$/.test(e.name)) files.push(full);
  }
  return files;
}

async function countAny(file) {
  const text = await fs.readFile(file, 'utf8');
  let c = 0;
  while (RGX.exec(text)) c++;
  return c;
}

async function main() {
  const files = (
    await Promise.all(SCAN_DIRS.map(d => walk(join(ROOT, d))))
  ).flat();
  let total = 0;
  for (const f of files) total += await countAny(f);
  await fs.mkdir(join(ROOT, 'metrics'), { recursive: true });
  let baseline;
  try {
    baseline = JSON.parse(await fs.readFile(BASELINE, 'utf8'));
  } catch {
    baseline = { anyCount: total };
  }
  if (typeof baseline.anyCount !== 'number') baseline.anyCount = total;
  if (total > baseline.anyCount) {
    console.error(`❌ any count increased: ${baseline.anyCount} -> ${total}`);
    process.exit(1);
  } else if (total < baseline.anyCount) {
    console.log(
      `✅ any reduced: ${baseline.anyCount} -> ${total} (baseline updated)`
    );
    baseline.anyCount = total;
    await fs.writeFile(BASELINE, JSON.stringify(baseline, null, 2));
  } else {
    console.log(`= any unchanged at ${total}`);
    if (!(await fs.stat(BASELINE).catch(() => false))) {
      await fs.writeFile(BASELINE, JSON.stringify(baseline, null, 2));
    }
  }
}

main().catch(err => {
  console.error('[any-ratchet] failure', err);
  process.exit(1);
});
