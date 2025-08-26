#!/usr/bin/env node

/**
 * Bundle Size Monitor - PERF-001 Implementation
 *
 * Monitors bundle sizes, tracks changes, and enforces size limits.
 * Part of CosmicHub advanced performance optimization system.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');
const METRICS_DIR = path.join(ROOT_DIR, 'metrics');

// Bundle size thresholds (in KB)
const THRESHOLDS = {
  astro: {
    warning: 250,
    error: 300,
    delta: 30,
  },
  healwave: {
    warning: 200,
    error: 250,
    delta: 30,
  },
};

class BundleSizeMonitor {
  constructor() {
    this.results = {
      apps: [],
      totalChange: 0,
      warnings: [],
      recommendations: [],
      timestamp: new Date().toISOString(),
    };
  }

  async run() {
    console.log('🔍 Starting bundle size analysis...');

    // Ensure metrics directory exists
    await fs.mkdir(METRICS_DIR, { recursive: true });

    // Analyze each app
    await this.analyzeApp('astro');
    await this.analyzeApp('healwave');

    // Load previous results for comparison
    await this.loadPreviousResults();

    // Generate recommendations
    this.generateRecommendations();

    // Save results
    await this.saveResults();

    // Log summary
    this.logSummary();
  }

  async analyzeApp(appName) {
    console.log(`📦 Analyzing ${appName} bundle...`);

    const distPath = path.join(ROOT_DIR, 'apps', appName, 'dist');

    try {
      const stats = await this.getBundleStats(distPath);
      const app = {
        name: appName,
        ...stats,
        threshold: THRESHOLDS[appName],
        status: this.getStatus(stats.totalSizeKB, THRESHOLDS[appName]),
      };

      this.results.apps.push(app);

      // Check for warnings
      if (stats.totalSizeKB > THRESHOLDS[appName].warning) {
        this.results.warnings.push(
          `${appName} bundle size (${stats.totalSizeKB}KB) exceeds warning threshold (${THRESHOLDS[appName].warning}KB)`
        );
      }

      console.log(
        `  ✓ ${appName}: ${stats.totalSizeKB}KB (${stats.chunks.length} chunks)`
      );
    } catch (error) {
      console.error(`❌ Failed to analyze ${appName}:`, error.message);
      this.results.warnings.push(
        `Failed to analyze ${appName}: ${error.message}`
      );
    }
  }

  async getBundleStats(distPath) {
    const files = await fs.readdir(distPath, { withFileTypes: true });
    const chunks = [];
    let totalSize = 0;
    let gzippedSize = 0;

    for (const file of files) {
      if (
        file.isFile() &&
        (file.name.endsWith('.js') || file.name.endsWith('.css'))
      ) {
        const filePath = path.join(distPath, file.name);
        const stats = await fs.stat(filePath);
        const size = stats.size;

        // Estimate gzipped size (typically ~70% of original)
        const estimatedGzipSize = Math.floor(size * 0.7);

        chunks.push({
          name: file.name,
          size,
          sizeKB: Math.round(size / 1024),
          gzippedKB: Math.round(estimatedGzipSize / 1024),
          type: file.name.endsWith('.js') ? 'js' : 'css',
        });

        totalSize += size;
        gzippedSize += estimatedGzipSize;
      }
    }

    return {
      totalSize,
      totalSizeKB: Math.round(totalSize / 1024),
      gzippedSize,
      gzippedSizeKB: Math.round(gzippedSize / 1024),
      chunks: chunks.sort((a, b) => b.size - a.size),
    };
  }

  getStatus(sizeKB, threshold) {
    if (sizeKB > threshold.error) return '🚨 ERROR';
    if (sizeKB > threshold.warning) return '⚠️ WARNING';
    return '✅ OK';
  }

  async loadPreviousResults() {
    try {
      const previousFile = path.join(METRICS_DIR, 'bundle-size-previous.json');
      const data = await fs.readFile(previousFile, 'utf8');
      const previous = JSON.parse(data);

      // Calculate changes
      for (const app of this.results.apps) {
        const prevApp = previous.apps?.find(p => p.name === app.name);
        if (prevApp) {
          const change = app.totalSizeKB - prevApp.totalSizeKB;
          app.previousSize = `${prevApp.totalSizeKB}KB`;
          app.change = change > 0 ? `+${change}KB` : `${change}KB`;
          app.changeKB = change;
          this.results.totalChange += change;

          // Check delta threshold
          if (Math.abs(change) > app.threshold.delta) {
            this.results.warnings.push(
              `${app.name} bundle size changed by ${change}KB (threshold: ±${app.threshold.delta}KB)`
            );
          }
        } else {
          app.previousSize = 'N/A';
          app.change = 'NEW';
          app.changeKB = 0;
        }

        app.currentSize = `${app.totalSizeKB}KB`;
      }
    } catch (error) {
      console.log('No previous bundle size data found');
      for (const app of this.results.apps) {
        app.previousSize = 'N/A';
        app.change = 'BASELINE';
        app.changeKB = 0;
        app.currentSize = `${app.totalSizeKB}KB`;
      }
    }
  }

  generateRecommendations() {
    const largeChunks = this.results.apps
      .flatMap(app => app.chunks.map(chunk => ({ ...chunk, app: app.name })))
      .filter(chunk => chunk.sizeKB > 100)
      .sort((a, b) => b.sizeKB - a.sizeKB)
      .slice(0, 5);

    if (largeChunks.length > 0) {
      this.results.recommendations.push(
        `**Large chunks detected**: Consider code splitting for: ${largeChunks.map(c => `${c.app}/${c.name}`).join(', ')}`
      );
    }

    const totalSize = this.results.apps.reduce(
      (sum, app) => sum + app.totalSizeKB,
      0
    );
    if (totalSize > 400) {
      this.results.recommendations.push(
        `**Total bundle size is ${totalSize}KB**: Consider implementing lazy loading for non-critical features`
      );
    }

    const hasLargeIncrease = this.results.apps.some(app => app.changeKB > 20);
    if (hasLargeIncrease) {
      this.results.recommendations.push(
        '**Significant size increase detected**: Review recent dependency changes and implement tree-shaking'
      );
    }

    // Add static recommendations from PERF-001
    this.results.recommendations.push(
      'Use `pnpm run build:astro:analyze` to generate detailed bundle analysis',
      'Monitor large dependencies with bundle-analyzer webpack plugin',
      'Consider using dynamic imports for optional features',
      'Enable tree-shaking in production builds'
    );
  }

  async saveResults() {
    // Save current results
    const currentFile = path.join(METRICS_DIR, 'bundle-size-current.json');
    await fs.writeFile(currentFile, JSON.stringify(this.results, null, 2));

    // Save as previous for next run
    const previousFile = path.join(METRICS_DIR, 'bundle-size-previous.json');
    await fs.writeFile(previousFile, JSON.stringify(this.results, null, 2));

    // Save report for CI
    const reportFile = path.join(METRICS_DIR, 'bundle-size-report.json');
    await fs.writeFile(reportFile, JSON.stringify(this.results, null, 2));

    console.log(`💾 Results saved to ${METRICS_DIR}/`);
  }

  logSummary() {
    console.log('\n📊 Bundle Size Analysis Summary:');
    console.log('=====================================');

    for (const app of this.results.apps) {
      console.log(
        `${app.name}: ${app.currentSize} (${app.change}) ${app.status}`
      );

      // Show top 3 largest chunks
      const topChunks = app.chunks.slice(0, 3);
      for (const chunk of topChunks) {
        console.log(`  ├─ ${chunk.name}: ${chunk.sizeKB}KB`);
      }
    }

    console.log(
      `\nTotal Change: ${this.results.totalChange > 0 ? '+' : ''}${this.results.totalChange}KB`
    );

    if (this.results.warnings.length > 0) {
      console.log('\n⚠️ Warnings:');
      for (const warning of this.results.warnings) {
        console.log(`  - ${warning}`);
      }
    }

    if (this.results.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      for (const rec of this.results.recommendations) {
        console.log(`  - ${rec}`);
      }
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const monitor = new BundleSizeMonitor();
  monitor.run().catch(error => {
    console.error('❌ Bundle size monitoring failed:', error);
    process.exit(1);
  });
}

export { BundleSizeMonitor };
