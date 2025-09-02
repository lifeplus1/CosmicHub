#!/usr/bin/env node
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const outDir = path.join(process.cwd(), 'metrics');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

try {
  const raw = execSync('pnpm outdated --recursive --json', {
    stdio: 'pipe',
  }).toString();
  const parsed = JSON.parse(raw);
  const summary = Object.entries(parsed).map(([pkg, info]) => ({
    package: pkg,
    current: info.current,
    latest: info.latest,
    dependsOn: info.dependsOn,
    workspace: info.workspace,
  }));
  fs.writeFileSync(
    path.join(outDir, 'outdated-summary.json'),
    JSON.stringify(summary, null, 2)
  );
  console.log('Dependency outdated summary written.');
} catch (e) {
  console.error(
    'Failed to generate outdated report (may be none or command not supported).'
  );
}
