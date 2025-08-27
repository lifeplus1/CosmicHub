#!/usr/bin/env node
/**
 * Parallel Lint Testing with Optimal Batching for CosmicHub
 * 
 * Distributes TypeScript/TSX files across 5 optimized batches for parallel processing.
 * Each batch is balanced by file count and logical grouping.
 */

import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

// Optimal batch configuration based on file analysis
// Total files: ~446 (distributed across 5 batches)
const BATCHES = [
  {
    id: 'batch-1-astro-core',
    name: 'Astro Core (Components & Features)',
    targets: [
      'apps/astro/src/components',
      'apps/astro/src/features'
    ],
    estimatedFiles: 90,
    maxWarnings: 35
  },
  {
    id: 'batch-2-astro-pages',
    name: 'Astro Pages & Context',
    targets: [
      'apps/astro/src/pages',
      'apps/astro/src/contexts',
      'apps/astro/src/hooks',
      'apps/astro/src/utils'
    ],
    estimatedFiles: 85,
    maxWarnings: 35
  },
  {
    id: 'batch-3-astro-services',
    name: 'Astro Services & Types',
    targets: [
      'apps/astro/src/services',
      'apps/astro/src/types',
      'apps/astro/src/config'
    ],
    estimatedFiles: 65,
    maxWarnings: 25
  },
  {
    id: 'batch-4-astro-root-files',
    name: 'Astro Root Files & Examples',
    targets: [
      'apps/astro/src/*.ts',
      'apps/astro/src/*.tsx',
      'apps/astro/src/examples',
      'apps/astro/src/a11y'
    ],
    estimatedFiles: 25,
    maxWarnings: 10
  },
  {
    id: 'batch-5-all-packages-and-apps',
    name: 'All Packages & Other Apps',
    targets: [
      'packages/ui/src',
      'packages/config/src',
      'apps/healwave/src',
      'apps/mobile/src',
      'packages/auth/src',
      'packages/frequency/src',
      'packages/hooks/src',
      'packages/integrations/src',
      'packages/pwa/src',
      'packages/storage/src',
      'packages/subscriptions/src',
      'packages/types/src'
    ],
    estimatedFiles: 181,
    maxWarnings: 80
  }
];

const ESLINT_CONFIG = '--config eslint.config.js';
const EXTENSIONS = '--ext .ts,.tsx';
const IGNORE_PATTERNS = [
  '--ignore-pattern "**/*.test.*"',
  '--ignore-pattern "**/*.spec.*"',
  '--ignore-pattern "**/__tests__/**"',
  '--ignore-pattern "**/test-utils/**"',
  '--ignore-pattern "**/tests/**"'
].join(' ');

// Color codes for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function runBatch(batch, index) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const targets = batch.targets.join(' ');
    const cmd = `npx eslint ${targets} ${EXTENSIONS} --max-warnings=${batch.maxWarnings} ${ESLINT_CONFIG} ${IGNORE_PATTERNS}`;
    
    console.log(colorize(`📦 Batch ${index + 1}/5: ${batch.name}`, 'cyan'));
    console.log(colorize(`   Targets: ${batch.targets.length} directories (~${batch.estimatedFiles} files)`, 'blue'));
    console.log(colorize(`   Command: ${cmd}`, 'magenta'));
    console.log('');

    const child = spawn('bash', ['-c', cmd], {
      cwd: ROOT,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      const duration = Date.now() - startTime;
      const result = {
        batch,
        index: index + 1,
        code,
        stdout,
        stderr,
        duration,
        success: code === 0
      };
      
      // Print result immediately
      printBatchResult(result);
      resolve(result);
    });
  });
}

function printBatchResult(result) {
  const { batch, index, code, stdout, stderr, duration, success } = result;
  const durationSec = (duration / 1000).toFixed(2);
  
  console.log(colorize(`\n📊 Batch ${index} Results: ${batch.name}`, 'bright'));
  console.log(colorize(`⏱️  Duration: ${durationSec}s`, 'blue'));
  
  if (success) {
    console.log(colorize('✅ Status: PASSED', 'green'));
  } else {
    console.log(colorize(`❌ Status: FAILED (exit code ${code})`, 'red'));
  }

  // Count warnings and errors from output
  const warnings = (stdout.match(/warning/gi) || []).length;
  const errors = (stdout.match(/error/gi) || []).length;
  
  if (warnings > 0) {
    console.log(colorize(`⚠️  Warnings: ${warnings}`, 'yellow'));
  }
  if (errors > 0) {
    console.log(colorize(`🚫 Errors: ${errors}`, 'red'));
  }
  
  // Show sample of issues (first few lines)
  if (stdout.trim()) {
    const lines = stdout.trim().split('\n').slice(0, 5);
    if (lines.length > 0) {
      console.log(colorize('📝 Sample output:', 'blue'));
      lines.forEach(line => {
        if (line.trim()) {
          console.log(`   ${line}`);
        }
      });
      if (stdout.split('\n').length > 5) {
        console.log(colorize('   ... (truncated)', 'blue'));
      }
    }
  }
  
  if (stderr.trim()) {
    console.log(colorize('⚠️  Stderr:', 'yellow'));
    console.log(stderr.trim());
  }
  
  console.log(colorize('─'.repeat(80), 'blue'));
}

function printSummary(results) {
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0) / 1000;
  const maxDuration = Math.max(...results.map(r => r.duration)) / 1000;
  const successful = results.filter(r => r.success).length;
  const failed = results.length - successful;
  
  console.log(colorize('\n🎯 LINT BATCH SUMMARY', 'bright'));
  console.log(colorize('═'.repeat(50), 'blue'));
  
  console.log(colorize(`📊 Total Batches: ${results.length}`, 'blue'));
  console.log(colorize(`✅ Successful: ${successful}`, successful === results.length ? 'green' : 'yellow'));
  console.log(colorize(`❌ Failed: ${failed}`, failed === 0 ? 'blue' : 'red'));
  
  console.log(colorize(`⏱️  Total Processing Time: ${totalDuration.toFixed(2)}s`, 'blue'));
  console.log(colorize(`⚡ Max Batch Duration: ${maxDuration.toFixed(2)}s`, 'blue'));
  console.log(colorize(`🚀 Parallelization Efficiency: ${((totalDuration / maxDuration) * 100 / results.length).toFixed(1)}%`, 'cyan'));
  
  // Show batch performance
  console.log(colorize('\n📈 Batch Performance:', 'bright'));
  results.forEach((result, i) => {
    const status = result.success ? colorize('PASS', 'green') : colorize('FAIL', 'red');
    const duration = (result.duration / 1000).toFixed(2);
    console.log(`   ${i + 1}. ${result.batch.name}: ${status} (${duration}s)`);
  });
  
  if (failed > 0) {
    console.log(colorize('\n🔧 RECOMMENDATIONS:', 'yellow'));
    results.forEach((result, i) => {
      if (!result.success) {
        console.log(colorize(`   • Batch ${i + 1}: Review lint errors in ${result.batch.name}`, 'yellow'));
        console.log(colorize(`     Consider increasing maxWarnings from ${result.batch.maxWarnings}`, 'blue'));
      }
    });
  }
  
  console.log(colorize('\n🎉 Batch processing complete!', 'green'));
  
  if (failed === 0) {
    console.log(colorize('All linting passed successfully across all batches.', 'green'));
  } else {
    console.log(colorize(`${failed} batch(es) had issues that need attention.`, 'red'));
    process.exit(1);
  }
}

async function main() {
  console.log(colorize('🚀 CosmicHub Parallel Lint Testing', 'bright'));
  console.log(colorize('Optimized batching for maximum efficiency', 'blue'));
  console.log(colorize('═'.repeat(50), 'blue'));
  
  // Display batch plan
  console.log(colorize('\n📋 Batch Execution Plan:', 'bright'));
  BATCHES.forEach((batch, i) => {
    console.log(colorize(`${i + 1}. ${batch.name}`, 'cyan'));
    console.log(colorize(`   Files: ~${batch.estimatedFiles} | Max Warnings: ${batch.maxWarnings}`, 'blue'));
    console.log(colorize(`   Directories: ${batch.targets.length}`, 'blue'));
  });
  
  const totalEstimatedFiles = BATCHES.reduce((sum, batch) => sum + batch.estimatedFiles, 0);
  console.log(colorize(`\nTotal estimated files: ${totalEstimatedFiles}`, 'green'));
  console.log(colorize('Starting parallel execution...\n', 'green'));
  
  const startTime = Date.now();
  
  try {
    // Run all batches in parallel
    const results = await Promise.all(
      BATCHES.map((batch, index) => runBatch(batch, index))
    );
    
    const totalTime = Date.now() - startTime;
    console.log(colorize(`\n⏱️  Total execution time: ${(totalTime / 1000).toFixed(2)}s`, 'green'));
    
    printSummary(results);
    
  } catch (error) {
    console.error(colorize('\n💥 Fatal error during batch processing:', 'red'), error);
    process.exit(1);
  }
}

// CLI support
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(colorize('💥 Unhandled error:', 'red'), error);
    process.exit(1);
  });
}
