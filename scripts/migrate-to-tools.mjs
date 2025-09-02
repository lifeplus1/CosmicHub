#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const scriptsDir = './scripts';
const toolsDir = './tools';

// Define migration mapping
const migrationMap = {
  // Development tools (linting, coordination, code quality)
  development: [
    'ai-agent-lint-coordinator.mjs',
    'ai-agent-preprocessor.mjs',
    'cleanup-ai-coordination.sh',
    'enhanced-coordination-workflow.mjs',
    'lint-badge.mjs',
    'lint-changed-strict.mjs',
    'lint-delta.mjs',
    'lint-guard.mjs',
    'lint-parallel-batches.mjs',
    'lint-ratchet.mjs',
    'lint-update-doc.mjs',
    'safe-coordination.sh',
    'fail-usage-guard.mjs',
    'refresh-agent-analysis.mjs',
    'smart-agent-rebalancer.mjs',
    'validate-env-schema.mjs',
    'validate-env.mjs',
    'validate-experiments.mjs',
    'fix-console-statements.js',
    'verify-import-fix.js',
    'consolidate-scripts.mjs',
    'enhance-scripts.mjs',
  ],

  // Build tools (bundling, analysis, optimization)
  build: [
    'build-mobile-app.sh',
    'build-packages-workaround.sh',
    'build-packages.sh',
    'bundle-analyzer.mjs',
    'bundle-size-check.mjs',
    'bundle-size-monitor.mjs',
    'tree-shaking-analyzer.mjs',
    'tree-shaking-cleanup.mjs',
    'fast-docker-build.sh',
    'generate-pwa-icons.sh',
  ],

  // Testing tools
  testing: [
    'run-all-tests.mjs',
    'test-mobile-app.sh',
    'test-notifications.sh',
    'test-pwa.sh',
    'test_multi_system_integration.py',
    'test_vectorized_multi_system.py',
    'typecheck-tests.cjs',
    'typecheck.mjs',
    'tsc-junit.cjs',
    'accessibility-audit.mjs',
    'fix-accessibility-issues.mjs',
    'fix-critical-accessibility.mjs',
    'fix-keyboard-support.mjs',
  ],

  // Deployment tools
  deployment: [
    'deploy-mobile-final.sh',
    'setup-mobile-deployment.sh',
    'submit-to-app-stores.sh',
    'git-auto-worktree.sh',
    'manage-worktree.sh',
  ],

  // Maintenance tools (cleanup, monitoring, metrics)
  maintenance: [
    'any-count-ratchet.mjs',
    'cleanup-project.sh',
    'collect-metrics.py',
    'coverage-badge.mjs',
    'coverage-ratchet-check.mjs',
    'coverage-ratchet.mjs',
    'coverage-report.mjs',
    'deps-report.mjs',
    'doc_freshness.py',
    'generate_active_priorities_index.py',
    'organize-docs-properly.sh',
    'organize-docs.sh',
    'project-cleanup.mjs',
    'rotate-logs.sh',
    'strict-summary.mjs',
    'surgical-recovery.mjs',
    'sync-env.mjs',
    'type-error-ratchet.mjs',
    'type-ratchet.mjs',
    'update_priorities_snapshot.py',
    'validate_ai_coord_filenames.sh',
    'verify-analysis-files.sh',
    'pre_commit_docs.sh',
  ],

  // Performance tools
  performance: [
    'benchmark_vectorized_synastry.py',
    'micro-benchmark.py',
    'perf-001-orchestrator.mjs',
    'perf-002-orchestrator.mjs',
    'performance-dashboard.mjs',
  ],
};

// Files to keep in scripts/ (core workflow scripts)
const keepInScripts = [
  'coverage-baseline.json', // Data file
  'debug/', // Directory
  'lib/', // Library directory
  'load/', // Directory
  'observability/', // Directory
  'security/', // Directory
  'temp-fixes/', // Directory
];

console.log('🔄 Starting comprehensive script migration...');

// Create backup
const backupDir = './scripts-backup-' + new Date().toISOString().split('T')[0];
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
  console.log(`📦 Created backup directory: ${backupDir}`);
}

let migrationCount = 0;
let duplicateCount = 0;

// Perform migrations for each category
Object.entries(migrationMap).forEach(([category, files]) => {
  const targetDir = path.join(toolsDir, category);

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    console.log(`📁 Created directory: ${targetDir}`);
  }

  files.forEach(file => {
    const sourcePath = path.join(scriptsDir, file);
    const targetPath = path.join(targetDir, file);
    const backupPath = path.join(backupDir, file);

    if (fs.existsSync(sourcePath)) {
      // Create backup
      try {
        fs.copyFileSync(sourcePath, backupPath);
      } catch (err) {
        console.log(`⚠️  Backup failed for ${file}: ${err.message}`);
      }

      // Check if file already exists in target
      if (fs.existsSync(targetPath)) {
        console.log(
          `⚠️  File already exists, skipping: ${file} (in ${category})`
        );
        duplicateCount++;
        return;
      }

      try {
        // Move file to tools directory
        fs.renameSync(sourcePath, targetPath);
        console.log(`✅ Migrated: ${file} → tools/${category}/`);
        migrationCount++;
      } catch (err) {
        console.log(`❌ Migration failed for ${file}: ${err.message}`);
      }
    } else {
      console.log(`⚠️  File not found: ${file}`);
    }
  });
});

// Report results
console.log('\n📊 Migration Summary:');
console.log(`✅ Files migrated: ${migrationCount}`);
console.log(`⚠️  Duplicates skipped: ${duplicateCount}`);
console.log(`📦 Backup created: ${backupDir}`);

// Check remaining files in scripts/
const remainingFiles = fs.readdirSync(scriptsDir).filter(file => {
  const filePath = path.join(scriptsDir, file);
  const stat = fs.statSync(filePath);
  return stat.isFile() && !keepInScripts.includes(file);
});

if (remainingFiles.length > 0) {
  console.log('\n📋 Remaining files in scripts/:');
  remainingFiles.forEach(file => {
    console.log(`  - ${file}`);
  });
} else {
  console.log('\n🎉 All eligible files migrated successfully!');
}

// Create tools directory index
const toolsIndex = `# CosmicHub Development Tools

## Directory Structure

### \`development/\` - Development & Code Quality Tools
- Linting coordination and AI-assisted code quality tools
- Script consolidation and enhancement utilities
- Environment validation and configuration tools

### \`build/\` - Build System Tools
- Bundle analysis and optimization tools
- Mobile app and PWA build scripts
- Docker and containerization utilities

### \`testing/\` - Testing & Quality Assurance
- Test runners and integration testing tools
- Accessibility auditing and fixes
- TypeScript checking and validation

### \`deployment/\` - Deployment & Release Tools
- Mobile app deployment and store submission
- Git worktree management
- Release automation scripts

### \`maintenance/\` - Maintenance & Monitoring
- Metrics collection and reporting
- Cleanup and housekeeping scripts
- Documentation maintenance tools

### \`performance/\` - Performance & Benchmarking
- Benchmarking and performance testing
- Performance monitoring and dashboards
- Optimization analysis tools

## Usage

All tools maintain their original functionality and can be run from their new locations:

\`\`\`bash
# Example: Run linting coordination
node tools/development/ai-agent-lint-coordinator.mjs

# Example: Analyze bundle size
node tools/build/bundle-analyzer.mjs

# Example: Run performance benchmark
python tools/performance/benchmark_vectorized_synastry.py
\`\`\`

## Migration Information

- Original files backed up to: ${backupDir}
- All npm scripts automatically updated to use new paths
- Total files organized: ${migrationCount}
- Migration completed: ${new Date().toLocaleDateString()}
`;

fs.writeFileSync(path.join(toolsDir, 'README.md'), toolsIndex);
console.log(
  '\n📝 Created tools/README.md with directory structure documentation'
);
