#!/usr/bin/env node

/**
 * Bundle Size Check - PERF-001 Implementation
 * 
 * Enforces bundle size limits and fails builds when thresholds are exceeded.
 * Part of CosmicHub CI/CD performance gates system.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');
const METRICS_DIR = path.join(ROOT_DIR, 'metrics');

// Environment-configurable limits
const LIMITS = {
  bundleSizeLimitKB: parseInt(process.env.BUNDLE_SIZE_LIMIT_KB) || 300,
  deltaLimitKB: parseInt(process.env.BUNDLE_SIZE_DELTA_LIMIT_KB) || 30
};

class BundleSizeChecker {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.passed = true;
  }

  async check() {
    console.log('🔍 Checking bundle size limits...');
    console.log(`📏 Limits: Max size ${LIMITS.bundleSizeLimitKB}KB, Max delta ±${LIMITS.deltaLimitKB}KB`);
    
    try {
      const reportPath = path.join(METRICS_DIR, 'bundle-size-report.json');
      const data = await fs.readFile(reportPath, 'utf8');
      const report = JSON.parse(data);
      
      this.checkSizeLimits(report);
      this.checkDeltaLimits(report);
      
      if (this.errors.length > 0) {
        this.passed = false;
        console.error('\n❌ Bundle size check FAILED:');
        for (const error of this.errors) {
          console.error(`  ❌ ${error}`);
        }
      }
      
      if (this.warnings.length > 0) {
        console.warn('\n⚠️ Bundle size warnings:');
        for (const warning of this.warnings) {
          console.warn(`  ⚠️ ${warning}`);
        }
      }
      
      if (this.passed) {
        console.log('\n✅ All bundle size checks passed!');
      }
      
      return this.passed;
      
    } catch (error) {
      console.error('❌ Bundle size check failed:', error.message);
      return false;
    }
  }

  checkSizeLimits(report) {
    for (const app of report.apps) {
      if (app.totalSizeKB > LIMITS.bundleSizeLimitKB) {
        this.errors.push(
          `${app.name} bundle size (${app.totalSizeKB}KB) exceeds limit (${LIMITS.bundleSizeLimitKB}KB)`
        );
      }
      
      // Check individual chunks for excessive size
      const largeChunks = app.chunks.filter(chunk => chunk.sizeKB > 150);
      if (largeChunks.length > 0) {
        this.warnings.push(
          `${app.name} has large chunks: ${largeChunks.map(c => `${c.name} (${c.sizeKB}KB)`).join(', ')}`
        );
      }
    }
  }

  checkDeltaLimits(report) {
    for (const app of report.apps) {
      if (app.changeKB && Math.abs(app.changeKB) > LIMITS.deltaLimitKB) {
        if (app.changeKB > 0) {
          this.errors.push(
            `${app.name} bundle size increased by ${app.changeKB}KB (limit: +${LIMITS.deltaLimitKB}KB)`
          );
        } else {
          // Large decreases are good but worth noting
          this.warnings.push(
            `${app.name} bundle size decreased by ${Math.abs(app.changeKB)}KB - consider if this is expected`
          );
        }
      }
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const checker = new BundleSizeChecker();
  checker.check().then(passed => {
    if (!passed) {
      console.error('\n💡 To fix bundle size issues:');
      console.error('  1. Run `pnpm run build:astro:analyze` for detailed analysis');
      console.error('  2. Use dynamic imports for large, optional features');
      console.error('  3. Enable tree-shaking for unused code');
      console.error('  4. Consider code splitting for large chunks');
      console.error('  5. Review recently added dependencies');
      process.exit(1);
    }
  }).catch(error => {
    console.error('❌ Bundle size check failed:', error);
    process.exit(1);
  });
}

export { BundleSizeChecker };
