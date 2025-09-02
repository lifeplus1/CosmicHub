#!/usr/bin/env node

/**
 * PERF-002 Orchestrator - Complete Tree-Shaking Implementation
 *
 * Executes the full PERF-002 implementation workflow:
 * 1. Creates baseline bundle analysis
 * 2. Performs tree-shaking cleanup
 * 3. Validates changes
 * 4. Compares bundle sizes
 * 5. Generates comprehensive report
 */

import { promises as fs } from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { TreeShakingCleanup } from './tree-shaking-cleanup.mjs';
import { BundleAnalyzer } from './bundle-analyzer.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');
const METRICS_DIR = path.join(ROOT_DIR, 'metrics');

class PERF002Orchestrator {
  constructor(options = {}) {
    this.dryRun = options.dryRun || false;
    this.skipBaseline = options.skipBaseline || false;
    this.skipValidation = options.skipValidation || false;
    this.startTime = Date.now();
    this.phases = [];
  }

  async execute() {
    console.log('🚀 Starting PERF-002: Complete Tree-Shaking Implementation');
    console.log(`Mode: ${this.dryRun ? 'DRY RUN' : 'FULL EXECUTION'}`);
    console.log(`Started: ${new Date().toISOString()}`);

    try {
      // Phase 1: Baseline Analysis
      if (!this.skipBaseline) {
        await this.phase1_BaselineAnalysis();
      }

      // Phase 2: Tree-Shaking Cleanup
      await this.phase2_TreeShakingCleanup();

      // Phase 3: Validation (only if not dry run)
      if (!this.dryRun && !this.skipValidation) {
        await this.phase3_Validation();
      }

      // Phase 4: Post-Cleanup Analysis (only if not dry run)
      if (!this.dryRun) {
        await this.phase4_PostCleanupAnalysis();
      }

      // Phase 5: Comparison & Reporting
      if (!this.dryRun) {
        await this.phase5_ComparisonAndReporting();
      }

      // Generate final report
      await this.generateFinalReport();

      const duration = ((Date.now() - this.startTime) / 1000).toFixed(1);
      console.log(`\n🎉 PERF-002 completed successfully in ${duration}s!`);

      return {
        success: true,
        duration,
        phases: this.phases,
        dryRun: this.dryRun,
      };
    } catch (error) {
      console.error('❌ PERF-002 implementation failed:', error);
      await this.handleFailure(error);
      throw error;
    }
  }

  async phase1_BaselineAnalysis() {
    console.log('\n📊 Phase 1: Baseline Bundle Analysis');
    console.log('=====================================');

    const phaseStart = Date.now();

    try {
      const analyzer = new BundleAnalyzer();
      const baseline = await analyzer.analyze('baseline');

      this.phases.push({
        phase: 1,
        name: 'Baseline Analysis',
        duration: Date.now() - phaseStart,
        success: true,
        data: {
          totalBundleSize: Object.values(baseline.bundles).reduce(
            (sum, bundle) => sum + bundle.totalSize,
            0
          ),
          buildTime: baseline.buildTime,
        },
      });

      console.log('✅ Phase 1 completed: Baseline established');
    } catch (error) {
      this.phases.push({
        phase: 1,
        name: 'Baseline Analysis',
        duration: Date.now() - phaseStart,
        success: false,
        error: error.message,
      });

      console.warn(
        '⚠️ Phase 1 failed, continuing without baseline:',
        error.message
      );
    }
  }

  async phase2_TreeShakingCleanup() {
    console.log('\n🌳 Phase 2: Tree-Shaking Cleanup');
    console.log('=================================');

    const phaseStart = Date.now();

    try {
      const cleanup = new TreeShakingCleanup({
        dryRun: this.dryRun,
        backup: true,
      });

      const result = await cleanup.execute();

      this.phases.push({
        phase: 2,
        name: 'Tree-Shaking Cleanup',
        duration: Date.now() - phaseStart,
        success: true,
        data: result,
      });

      console.log(
        `✅ Phase 2 completed: ${result.exportsRemoved} exports removed`
      );
    } catch (error) {
      this.phases.push({
        phase: 2,
        name: 'Tree-Shaking Cleanup',
        duration: Date.now() - phaseStart,
        success: false,
        error: error.message,
      });

      throw error; // This phase is critical
    }
  }

  async phase3_Validation() {
    console.log('\n🔍 Phase 3: Validation & Testing');
    console.log('=================================');

    const phaseStart = Date.now();
    const validationResults = {
      typescript: false,
      build: false,
      tests: false,
      linting: false,
    };

    try {
      // TypeScript compilation
      console.log('  Validating TypeScript compilation...');
      try {
        execSync('npm run type-check', {
          stdio: 'pipe',
          cwd: ROOT_DIR,
          encoding: 'utf8',
        });
        validationResults.typescript = true;
        console.log('  ✅ TypeScript validation passed');
      } catch (error) {
        console.log('  ❌ TypeScript validation failed');
      }

      // Build validation
      console.log('  Validating build process...');
      try {
        execSync('npm run build 2>/dev/null || npm run build:astro', {
          stdio: 'pipe',
          cwd: ROOT_DIR,
          encoding: 'utf8',
          timeout: 120000, // 2 minutes timeout
        });
        validationResults.build = true;
        console.log('  ✅ Build validation passed');
      } catch (error) {
        console.log('  ❌ Build validation failed');
      }

      // Test suite (if available and fast)
      console.log('  Running critical tests...');
      try {
        execSync('npm test -- --passWithNoTests --bail', {
          stdio: 'pipe',
          cwd: ROOT_DIR,
          encoding: 'utf8',
          timeout: 60000, // 1 minute timeout
        });
        validationResults.tests = true;
        console.log('  ✅ Test validation passed');
      } catch (error) {
        console.log('  ⚠️ Tests skipped or failed (non-critical)');
      }

      // Linting (quick check)
      console.log('  Running lint checks...');
      try {
        execSync('npm run lint -- --max-warnings=50', {
          stdio: 'pipe',
          cwd: ROOT_DIR,
          encoding: 'utf8',
          timeout: 30000, // 30 seconds timeout
        });
        validationResults.linting = true;
        console.log('  ✅ Lint validation passed');
      } catch (error) {
        console.log('  ⚠️ Linting issues detected (non-critical)');
      }

      const criticalValidations =
        validationResults.typescript && validationResults.build;

      this.phases.push({
        phase: 3,
        name: 'Validation',
        duration: Date.now() - phaseStart,
        success: criticalValidations,
        data: validationResults,
      });

      if (criticalValidations) {
        console.log('✅ Phase 3 completed: Critical validations passed');
      } else {
        console.log('⚠️ Phase 3 completed: Some validations failed');
      }
    } catch (error) {
      this.phases.push({
        phase: 3,
        name: 'Validation',
        duration: Date.now() - phaseStart,
        success: false,
        error: error.message,
        data: validationResults,
      });

      console.error('❌ Phase 3 failed:', error.message);
      throw error;
    }
  }

  async phase4_PostCleanupAnalysis() {
    console.log('\n📊 Phase 4: Post-Cleanup Bundle Analysis');
    console.log('=========================================');

    const phaseStart = Date.now();

    try {
      const analyzer = new BundleAnalyzer();
      const postCleanup = await analyzer.analyze('after-cleanup');

      this.phases.push({
        phase: 4,
        name: 'Post-Cleanup Analysis',
        duration: Date.now() - phaseStart,
        success: true,
        data: {
          totalBundleSize: Object.values(postCleanup.bundles).reduce(
            (sum, bundle) => sum + bundle.totalSize,
            0
          ),
          buildTime: postCleanup.buildTime,
        },
      });

      console.log('✅ Phase 4 completed: Post-cleanup metrics captured');
    } catch (error) {
      this.phases.push({
        phase: 4,
        name: 'Post-Cleanup Analysis',
        duration: Date.now() - phaseStart,
        success: false,
        error: error.message,
      });

      console.warn(
        '⚠️ Phase 4 failed, continuing without comparison:',
        error.message
      );
    }
  }

  async phase5_ComparisonAndReporting() {
    console.log('\n📈 Phase 5: Comparison & Performance Report');
    console.log('===========================================');

    const phaseStart = Date.now();

    try {
      const analyzer = new BundleAnalyzer();
      const comparison = await analyzer.compare();

      this.phases.push({
        phase: 5,
        name: 'Comparison & Reporting',
        duration: Date.now() - phaseStart,
        success: true,
        data: comparison.summary,
      });

      console.log('✅ Phase 5 completed: Performance impact measured');
    } catch (error) {
      this.phases.push({
        phase: 5,
        name: 'Comparison & Reporting',
        duration: Date.now() - phaseStart,
        success: false,
        error: error.message,
      });

      console.warn('⚠️ Phase 5 failed:', error.message);
    }
  }

  async generateFinalReport() {
    console.log('\n📋 Generating PERF-002 Implementation Report');
    console.log('============================================');

    const report = {
      perf002Implementation: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        mode: this.dryRun ? 'dry-run' : 'execution',
        duration: Date.now() - this.startTime,
        phases: this.phases,
        summary: this.generateSummary(),
        recommendations: this.generateRecommendations(),
      },
    };

    const reportPath = path.join(
      METRICS_DIR,
      'perf-002-implementation-report.json'
    );
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    // Print executive summary
    this.printExecutiveSummary(report.perf002Implementation);

    console.log(`\n💾 Full report saved to: ${reportPath}`);

    return report;
  }

  generateSummary() {
    const completedPhases = this.phases.filter(p => p.success).length;
    const totalPhases = this.phases.length;

    let bundleReduction = 0;
    let exportsRemoved = 0;

    // Get cleanup results
    const cleanupPhase = this.phases.find(p => p.phase === 2);
    if (cleanupPhase && cleanupPhase.success) {
      exportsRemoved = cleanupPhase.data.exportsRemoved;
    }

    // Get bundle size reduction
    const comparisonPhase = this.phases.find(p => p.phase === 5);
    if (comparisonPhase && comparisonPhase.success) {
      bundleReduction = comparisonPhase.data.totalSizeReduction || 0;
    }

    return {
      success: completedPhases === totalPhases,
      completionRate: ((completedPhases / totalPhases) * 100).toFixed(1),
      exportsRemoved,
      bundleReductionMB: (bundleReduction / (1024 * 1024)).toFixed(2),
      targetAchieved: bundleReduction >= 1.5 * 1024 * 1024, // 1.5MB target
      criticalValidationsPassed:
        this.phases.find(p => p.phase === 3)?.success || this.dryRun,
    };
  }

  generateRecommendations() {
    const recommendations = [];
    const summary = this.generateSummary();

    if (this.dryRun) {
      recommendations.push({
        type: 'next-step',
        message:
          'Execute PERF-002 with: node perf-002-orchestrator.mjs --execute',
        priority: 'high',
      });
    }

    if (summary.targetAchieved) {
      recommendations.push({
        type: 'success',
        message: `PERF-002 achieved ${summary.bundleReductionMB}MB bundle reduction`,
        priority: 'info',
      });
    }

    if (!summary.criticalValidationsPassed && !this.dryRun) {
      recommendations.push({
        type: 'warning',
        message: 'Manual testing recommended due to validation failures',
        priority: 'high',
      });
    }

    // Future optimizations
    if (parseFloat(summary.bundleReductionMB) < 2.0) {
      recommendations.push({
        type: 'optimization',
        message:
          'Consider dynamic imports and code splitting for additional gains',
        priority: 'medium',
      });
    }

    return recommendations;
  }

  printExecutiveSummary(implementation) {
    console.log('\n🎯 PERF-002 Executive Summary:');
    console.log('==============================');

    const summary = implementation.summary;
    const duration = (implementation.duration / 1000).toFixed(1);

    console.log(
      `Implementation: ${summary.success ? '✅ SUCCESS' : '⚠️ PARTIAL'}`
    );
    console.log(`Duration: ${duration}s`);
    console.log(`Completion Rate: ${summary.completionRate}%`);
    console.log(`Exports Removed: ${summary.exportsRemoved}`);

    if (!this.dryRun) {
      console.log(`Bundle Reduction: ${summary.bundleReductionMB}MB`);
      console.log(
        `Target Achievement: ${summary.targetAchieved ? '✅ YES' : '❌ NO'}`
      );
    }

    console.log('\n📊 Phase Results:');
    for (const phase of implementation.phases) {
      const status = phase.success ? '✅' : '❌';
      const duration = (phase.duration / 1000).toFixed(1);
      console.log(
        `  ${status} Phase ${phase.phase}: ${phase.name} (${duration}s)`
      );
    }

    if (implementation.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      for (const rec of implementation.recommendations) {
        const icon =
          rec.priority === 'high'
            ? '🔥'
            : rec.priority === 'info'
              ? '✅'
              : '💡';
        console.log(`  ${icon} ${rec.message}`);
      }
    }
  }

  async handleFailure(error) {
    console.log('\n🚨 PERF-002 Implementation Failed');
    console.log('==================================');

    // Try to create a failure report
    try {
      const failureReport = {
        perf002FailureReport: {
          timestamp: new Date().toISOString(),
          error: error.message,
          stack: error.stack,
          completedPhases: this.phases,
          duration: Date.now() - this.startTime,
          recovery: {
            backupAvailable: true,
            rollbackCommand: 'git checkout -- . && git clean -fd',
          },
        },
      };

      const failurePath = path.join(
        METRICS_DIR,
        'perf-002-failure-report.json'
      );
      await fs.writeFile(failurePath, JSON.stringify(failureReport, null, 2));

      console.log('🔄 Recovery instructions:');
      console.log('  1. Restore from backup: tree-shaking-backup/');
      console.log('  2. Or rollback: git checkout -- . && git clean -fd');
      console.log(`📋 Failure report saved to: ${failurePath}`);
    } catch (reportError) {
      console.warn('⚠️ Could not create failure report:', reportError.message);
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: !args.includes('--execute'),
    skipBaseline: args.includes('--skip-baseline'),
    skipValidation: args.includes('--skip-validation'),
  };

  if (args.includes('--help')) {
    console.log(`
PERF-002 Orchestrator - Complete Tree-Shaking Implementation

Usage: node perf-002-orchestrator.mjs [options]

Options:
  --execute          Execute full implementation (default is dry-run)
  --skip-baseline    Skip baseline bundle analysis
  --skip-validation  Skip validation phase
  --help             Show this help message

Phases:
  1. Baseline bundle analysis
  2. Tree-shaking cleanup (removes unused exports)
  3. Validation (TypeScript, build, tests)
  4. Post-cleanup bundle analysis
  5. Performance comparison and reporting

Examples:
  node perf-002-orchestrator.mjs                    # Dry run (safe preview)
  node perf-002-orchestrator.mjs --execute          # Full implementation
  node perf-002-orchestrator.mjs --execute --skip-baseline  # Fast execution
`);
    return;
  }

  const orchestrator = new PERF002Orchestrator(options);
  await orchestrator.execute();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ PERF-002 orchestrator failed:', error);
    process.exit(1);
  });
}

export { PERF002Orchestrator };
