#!/usr/bin/env node
const { execSync } = require('node:child_process');
const { readdirSync, statSync, existsSync } = require('node:fs');
const path = require('node:path');

const root = process.cwd();
const packagesDir = path.join(root, 'packages');
let failed = false;

function run(cmd, cwd) {
  try {
    execSync(cmd, { stdio: 'inherit', cwd });
  } catch (e) {
    failed = true;
  }
}

function checkPackage(pkgPath) {
  const testTsconfig = path.join(pkgPath, 'tsconfig.test.json');
  if (existsSync(testTsconfig)) {
    console.log(`\n== Type-checking tests for ${path.basename(pkgPath)} ==`);
    run('npx tsc -p tsconfig.test.json --noEmit', pkgPath);
  }
}

if (existsSync(packagesDir)) {
  for (const entry of readdirSync(packagesDir)) {
    const full = path.join(packagesDir, entry);
    if (statSync(full).isDirectory()) {
      checkPackage(full);
    }
  }
}

if (failed) {
  console.error('\nTest type-checks failed.');
  process.exit(1);
} else {
  console.log('\nAll test type-checks passed.');
}
