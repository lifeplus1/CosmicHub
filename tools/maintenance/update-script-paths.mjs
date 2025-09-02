#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const packageJsonPath = './package.json';
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

console.log('🔄 Updating npm scripts to use new tool locations...');

// Mapping of script paths to update
const pathMappings = {
  // Development tools
  'node ./scripts/ai-agent-lint-coordinator.mjs':
    'node tools/development/ai-agent-lint-coordinator.mjs',
  'node scripts/ai-agent-lint-coordinator.mjs':
    'node tools/development/ai-agent-lint-coordinator.mjs',
  'node scripts/ai-agent-preprocessor.mjs':
    'node tools/development/ai-agent-preprocessor.mjs',
  'node scripts/enhanced-coordination-workflow.mjs':
    'node tools/development/enhanced-coordination-workflow.mjs',
  'node scripts/lint-parallel-batches.mjs':
    'node tools/development/lint-parallel-batches.mjs',
  'node scripts/smart-agent-rebalancer.mjs':
    'node tools/development/smart-agent-rebalancer.mjs',
  'node scripts/refresh-agent-analysis.mjs':
    'node tools/development/refresh-agent-analysis.mjs',
  './scripts/safe-coordination.sh': 'tools/development/safe-coordination.sh',

  // Testing tools
  'node ./scripts/typecheck.mjs': 'node tools/testing/typecheck.mjs',
  'node ./scripts/typecheck-tests.cjs':
    'node tools/testing/typecheck-tests.cjs',

  // Maintenance tools
  'node ./scripts/lint-ratchet.mjs': 'node tools/development/lint-ratchet.mjs',
  'node ./scripts/lint-guard.mjs': 'node tools/development/lint-guard.mjs',
  'node ./scripts/fail-usage-guard.mjs':
    'node tools/development/fail-usage-guard.mjs',
  'node ./scripts/lint-changed-strict.mjs':
    'node tools/development/lint-changed-strict.mjs',
  'node ./scripts/lint-delta.mjs': 'node tools/development/lint-delta.mjs',
  'node ./scripts/lint-update-doc.mjs':
    'node tools/development/lint-update-doc.mjs',
  'node ./scripts/lint-badge.mjs': 'node tools/development/lint-badge.mjs',
  'node ./scripts/type-error-ratchet.mjs':
    'node tools/maintenance/type-error-ratchet.mjs',
  'node ./scripts/type-ratchet.mjs': 'node tools/maintenance/type-ratchet.mjs',
  'node ./scripts/any-count-ratchet.mjs':
    'node tools/maintenance/any-count-ratchet.mjs',
  'node ./scripts/coverage-ratchet.mjs':
    'node tools/maintenance/coverage-ratchet.mjs',
  'node ./scripts/coverage-ratchet-check.mjs':
    'node tools/maintenance/coverage-ratchet-check.mjs',
  'node ./scripts/coverage-report.mjs':
    'node tools/maintenance/coverage-report.mjs',
  'node ./scripts/project-cleanup.mjs':
    'node tools/maintenance/project-cleanup.mjs',
  'node scripts/validate-experiments.mjs':
    'node tools/development/validate-experiments.mjs',
  'node ./scripts/sync-env.mjs': 'node tools/maintenance/sync-env.mjs',

  // Performance tools
  'python3 scripts/benchmark_vectorized_synastry.py':
    'python3 tools/performance/benchmark_vectorized_synastry.py',
};

let updateCount = 0;
const updatedScripts = {};

// Update all scripts
Object.entries(packageJson.scripts).forEach(([scriptName, scriptCommand]) => {
  let updatedCommand = scriptCommand;
  let wasUpdated = false;

  // Check each path mapping
  Object.entries(pathMappings).forEach(([oldPath, newPath]) => {
    if (updatedCommand.includes(oldPath)) {
      updatedCommand = updatedCommand.replace(
        new RegExp(oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
        newPath
      );
      wasUpdated = true;
    }
  });

  updatedScripts[scriptName] = updatedCommand;

  if (wasUpdated) {
    console.log(`✅ Updated script: ${scriptName}`);
    console.log(`   ${scriptCommand}`);
    console.log(`   → ${updatedCommand}`);
    updateCount++;
  }
});

// Update package.json
packageJson.scripts = updatedScripts;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log(`\n📊 Script Update Summary:`);
console.log(`✅ Scripts updated: ${updateCount}`);
console.log(`📝 Updated package.json with new tool paths`);

// Clean up duplicate files from scripts directory
const duplicateFiles = [
  'scripts/ai-agent-lint-coordinator.mjs',
  'scripts/ai-agent-preprocessor.mjs',
  'scripts/cleanup-ai-coordination.sh',
  'scripts/enhanced-coordination-workflow.mjs',
  'scripts/lint-badge.mjs',
  'scripts/lint-changed-strict.mjs',
  'scripts/lint-delta.mjs',
  'scripts/lint-guard.mjs',
  'scripts/lint-parallel-batches.mjs',
  'scripts/lint-ratchet.mjs',
  'scripts/lint-update-doc.mjs',
  'scripts/safe-coordination.sh',
];

let cleanupCount = 0;
duplicateFiles.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`🗑️  Removed duplicate: ${filePath}`);
      cleanupCount++;
    } catch (err) {
      console.log(`⚠️  Failed to remove ${filePath}: ${err.message}`);
    }
  }
});

console.log(`🗑️  Duplicate files removed: ${cleanupCount}`);
console.log('\n🎉 Tool organization migration completed successfully!');
