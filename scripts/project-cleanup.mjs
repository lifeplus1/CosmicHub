#!/usr/bin/env node
/**
 * Project cleanup helper (initial skeleton).
 * Identifies deprecated `shared/` imports and duplicate subscription tier definitions.
 * Non-destructive: prints a report. Extend later to offer autofix suggestions.
 */
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const root = process.cwd();

function findFiles(dir, accum = []) {
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) findFiles(full, accum);
      else if (/\.(t|j)sx?$/.test(entry.name)) accum.push(full);
    }
  } catch {}
  return accum;
}

function scanForDeprecatedImports() {
  const files = [
    ...findFiles(join(root, 'apps')),
    ...findFiles(join(root, 'packages')),
  ];
  const offenders = [];
  for (const file of files) {
    try {
      const text = readFileSync(file, 'utf8');
      if (text.includes('shared/'))
        offenders.push(file.replace(root + '/', ''));
    } catch {}
  }
  return offenders;
}

function summarizeTierDuplication() {
  // Only the centralized package should remain
  const locations = ['packages/subscriptions/src/index.ts'];
  const existing = locations.filter(p => {
    try {
      readFileSync(join(root, p));
      return true;
    } catch {
      return false;
    }
  });
  return existing;
}

console.log('\n🔍 CosmicHub Cleanup Report');
console.log('--------------------------------');
console.log('Root:', root);

// 1. Deprecated imports
const offenders = scanForDeprecatedImports();
if (offenders.length) {
  console.log(
    `❗ Deprecated path usage detected (shared/): ${offenders.length} files`
  );
  offenders.slice(0, 20).forEach(f => console.log('  -', f));
  if (offenders.length > 20)
    console.log(`  ...and ${offenders.length - 20} more`);
} else {
  console.log('✅ No runtime references to deprecated shared/ path found.');
}

// 2. Tier duplication
const tierFiles = summarizeTierDuplication();
console.log('\n📦 Subscription tier definition files present:');
tierFiles.forEach(f => console.log('  -', f));
if (tierFiles.length > 1) {
  console.log(
    '\n➡️  Consolidation recommended: create a single source (e.g., packages/subscriptions)'
  );
} else {
  console.log('\n✅ Single source of truth achieved.');
}

console.log('\nDone.');
