#!/usr/bin/env node

/**
 * PERF-001 Performance Dashboard - CosmicHub Advanced Performance Optimization
 *
 * Comprehensive performance monitoring dashboard that aggregates metrics from:
 * - Bundle size monitoring
 * - Tree-shaking analysis
 * - Firestore read patterns
 * - Concurrency metrics
 * - Ephemeris cache performance
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { BundleSizeMonitor } from './bundle-size-monitor.mjs';
import { TreeShakingAnalyzer } from './tree-shaking-analyzer.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '../..');
const METRICS_DIR = path.join(ROOT_DIR, 'metrics');

class PerformanceDashboard {
  constructor() {
    this.metrics = {
      timestamp: new Date().toISOString(),
      bundleSize: null,
      treeShaking: null,
      firestore: null,
      concurrency: null,
      cache: null,
      summary: {
        overallScore: 0,
        recommendations: [],
        criticalIssues: [],
      },
    };
  }

  async generateDashboard() {
    console.log('📊 Generating CosmicHub Performance Dashboard...');
    console.log('================================================');

    try {
      // Gather all performance metrics
      await this.gatherBundleMetrics();
      await this.gatherTreeShakingMetrics();
      await this.gatherFirestoreMetrics();
      await this.gatherConcurrencyMetrics();
      await this.gatherCacheMetrics();

      // Calculate overall performance score
      this.calculateOverallScore();

      // Generate recommendations
      this.generateRecommendations();

      // Save comprehensive report
      await this.saveReport();

      // Display dashboard
      this.displayDashboard();
    } catch (error) {
      console.error('❌ Failed to generate performance dashboard:', error);
      process.exit(1);
    }
  }

  async gatherBundleMetrics() {
    console.log('🔍 Gathering bundle size metrics...');

    try {
      const bundleReport = path.join(METRICS_DIR, 'bundle-size-report.json');

      if (await this.fileExists(bundleReport)) {
        const data = await fs.readFile(bundleReport, 'utf8');
        this.metrics.bundleSize = JSON.parse(data);
      } else {
        // Run bundle analysis if no existing report
        const monitor = new BundleSizeMonitor();
        await monitor.run();

        const data = await fs.readFile(bundleReport, 'utf8');
        this.metrics.bundleSize = JSON.parse(data);
      }

      console.log('  ✓ Bundle metrics collected');
    } catch (error) {
      console.warn('  ⚠️ Bundle metrics not available:', error.message);
      this.metrics.bundleSize = { error: 'Not available' };
    }
  }

  async gatherTreeShakingMetrics() {
    console.log('🌳 Gathering tree-shaking metrics...');

    try {
      const treeShakingReport = path.join(
        METRICS_DIR,
        'tree-shaking-analysis.json'
      );

      if (await this.fileExists(treeShakingReport)) {
        const data = await fs.readFile(treeShakingReport, 'utf8');
        this.metrics.treeShaking = JSON.parse(data);
      } else {
        // Run tree-shaking analysis
        const analyzer = new TreeShakingAnalyzer();
        const result = await analyzer.analyze();
        this.metrics.treeShaking = {
          timestamp: new Date().toISOString(),
          stats: result.stats,
          recommendations: result.recommendations,
          unusedCount: result.unusedCount,
        };
      }

      console.log('  ✓ Tree-shaking metrics collected');
    } catch (error) {
      console.warn('  ⚠️ Tree-shaking metrics not available:', error.message);
      this.metrics.treeShaking = { error: 'Not available' };
    }
  }

  async gatherFirestoreMetrics() {
    console.log('🔥 Gathering Firestore performance metrics...');

    try {
      const firestoreReport = path.join(
        METRICS_DIR,
        'firestore-performance.json'
      );

      if (await this.fileExists(firestoreReport)) {
        const data = await fs.readFile(firestoreReport, 'utf8');
        this.metrics.firestore = JSON.parse(data);
      } else {
        // Create placeholder metrics if no data
        this.metrics.firestore = {
          timestamp: new Date().toISOString(),
          totalQueries: 0,
          averageLatency: 0,
          cacheHitRate: 0,
          recommendations: [
            'Enable Firestore performance tracking to see metrics',
          ],
        };
      }

      console.log('  ✓ Firestore metrics collected');
    } catch (error) {
      console.warn('  ⚠️ Firestore metrics not available:', error.message);
      this.metrics.firestore = { error: 'Not available' };
    }
  }

  async gatherConcurrencyMetrics() {
    console.log('⚡ Gathering concurrency metrics...');

    try {
      const concurrencyReport = path.join(
        METRICS_DIR,
        'concurrency-metrics.json'
      );

      if (await this.fileExists(concurrencyReport)) {
        const data = await fs.readFile(concurrencyReport, 'utf8');
        this.metrics.concurrency = JSON.parse(data);
      } else {
        // Create placeholder metrics
        this.metrics.concurrency = {
          timestamp: new Date().toISOString(),
          currentLimit: 10,
          utilizationPercent: 0,
          averageLatency: 0,
          successRate: 100,
          recommendations: [
            'Enable concurrency monitoring to see real metrics',
          ],
        };
      }

      console.log('  ✓ Concurrency metrics collected');
    } catch (error) {
      console.warn('  ⚠️ Concurrency metrics not available:', error.message);
      this.metrics.concurrency = { error: 'Not available' };
    }
  }

  async gatherCacheMetrics() {
    console.log('💾 Gathering cache performance metrics...');

    try {
      const cacheReport = path.join(METRICS_DIR, 'cache-performance.json');

      if (await this.fileExists(cacheReport)) {
        const data = await fs.readFile(cacheReport, 'utf8');
        this.metrics.cache = JSON.parse(data);
      } else {
        // Create placeholder metrics
        this.metrics.cache = {
          timestamp: new Date().toISOString(),
          memoryHitRate: 0,
          diskHitRate: 0,
          totalSize: 0,
          recommendations: [
            'Enable enhanced caching to see performance metrics',
          ],
        };
      }

      console.log('  ✓ Cache metrics collected');
    } catch (error) {
      console.warn('  ⚠️ Cache metrics not available:', error.message);
      this.metrics.cache = { error: 'Not available' };
    }
  }

  calculateOverallScore() {
    let score = 100;
    const penalties = [];

    // Bundle size penalties
    if (this.metrics.bundleSize && !this.metrics.bundleSize.error) {
      for (const app of this.metrics.bundleSize.apps || []) {
        if (app.totalSizeKB > 300) {
          score -= 15;
          penalties.push(`${app.name} bundle size exceeds 300KB`);
        } else if (app.totalSizeKB > 250) {
          score -= 5;
          penalties.push(`${app.name} bundle size approaching limit`);
        }
      }

      if (
        this.metrics.bundleSize.warnings &&
        this.metrics.bundleSize.warnings.length > 0
      ) {
        score -= this.metrics.bundleSize.warnings.length * 3;
      }
    }

    // Tree-shaking penalties
    if (this.metrics.treeShaking && !this.metrics.treeShaking.error) {
      if (this.metrics.treeShaking.unusedCount > 20) {
        score -= 10;
        penalties.push(
          `${this.metrics.treeShaking.unusedCount} unused exports detected`
        );
      } else if (this.metrics.treeShaking.unusedCount > 10) {
        score -= 5;
        penalties.push(
          `${this.metrics.treeShaking.unusedCount} unused exports found`
        );
      }
    }

    // Firestore penalties
    if (this.metrics.firestore && !this.metrics.firestore.error) {
      if (this.metrics.firestore.cacheHitRate < 70) {
        score -= 15;
        penalties.push(
          `Low Firestore cache hit rate (${this.metrics.firestore.cacheHitRate}%)`
        );
      }

      if (this.metrics.firestore.averageLatency > 200) {
        score -= 10;
        penalties.push(
          `High Firestore latency (${this.metrics.firestore.averageLatency}ms)`
        );
      }
    }

    // Concurrency penalties
    if (this.metrics.concurrency && !this.metrics.concurrency.error) {
      if (this.metrics.concurrency.successRate < 95) {
        score -= 20;
        penalties.push(
          `Low success rate (${this.metrics.concurrency.successRate}%)`
        );
      }

      if (this.metrics.concurrency.averageLatency > 2000) {
        score -= 10;
        penalties.push(
          `High concurrency latency (${this.metrics.concurrency.averageLatency}ms)`
        );
      }
    }

    // Cache penalties
    if (this.metrics.cache && !this.metrics.cache.error) {
      if (this.metrics.cache.memoryHitRate < 80) {
        score -= 5;
        penalties.push(
          `Low cache hit rate (${this.metrics.cache.memoryHitRate}%)`
        );
      }
    }

    this.metrics.summary.overallScore = Math.max(0, score);
    this.metrics.summary.penalties = penalties;
  }

  generateRecommendations() {
    const recommendations = [];

    // Bundle size recommendations
    if (this.metrics.bundleSize && !this.metrics.bundleSize.error) {
      if (this.metrics.bundleSize.recommendations) {
        recommendations.push(...this.metrics.bundleSize.recommendations);
      }
    }

    // Tree-shaking recommendations
    if (this.metrics.treeShaking && !this.metrics.treeShaking.error) {
      if (this.metrics.treeShaking.recommendations) {
        recommendations.push(
          ...this.metrics.treeShaking.recommendations.map(
            rec => rec.description || rec
          )
        );
      }
    }

    // Firestore recommendations
    if (this.metrics.firestore && !this.metrics.firestore.error) {
      if (this.metrics.firestore.recommendations) {
        recommendations.push(...this.metrics.firestore.recommendations);
      }
    }

    // Overall PERF-001 recommendations
    recommendations.push(
      'Monitor bundle size in CI/CD pipeline with automated alerts',
      'Implement predictive caching for frequently accessed data',
      'Use adaptive concurrency limits based on system performance',
      'Enable compression for large cached data sets',
      'Implement performance budgets for critical user journeys'
    );

    this.metrics.summary.recommendations = recommendations;
  }

  async saveReport() {
    await fs.mkdir(METRICS_DIR, { recursive: true });

    const reportPath = path.join(METRICS_DIR, 'performance-dashboard.json');
    await fs.writeFile(reportPath, JSON.stringify(this.metrics, null, 2));

    // Also save a timestamped version
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const historicalPath = path.join(
      METRICS_DIR,
      `performance-dashboard-${timestamp}.json`
    );
    await fs.writeFile(historicalPath, JSON.stringify(this.metrics, null, 2));

    console.log(`📄 Performance report saved to ${reportPath}`);
  }

  displayDashboard() {
    console.log('\n📊 COSMICHUB PERFORMANCE DASHBOARD');
    console.log('==========================================');
    console.log(`📅 Generated: ${this.metrics.timestamp}`);
    console.log(
      `🏆 Overall Score: ${this.getScoreEmoji(this.metrics.summary.overallScore)} ${this.metrics.summary.overallScore}/100`
    );

    // Bundle Size Section
    console.log('\n📦 Bundle Size Analysis:');
    if (this.metrics.bundleSize && !this.metrics.bundleSize.error) {
      for (const app of this.metrics.bundleSize.apps || []) {
        const status =
          app.totalSizeKB > 300 ? '🚨' : app.totalSizeKB > 250 ? '⚠️' : '✅';
        console.log(
          `  ${status} ${app.name}: ${app.totalSizeKB}KB (${app.change || 'NEW'})`
        );
      }
    } else {
      console.log('  ❓ Bundle metrics not available');
    }

    // Tree Shaking Section
    console.log('\n🌳 Tree Shaking Analysis:');
    if (this.metrics.treeShaking && !this.metrics.treeShaking.error) {
      const status =
        this.metrics.treeShaking.unusedCount > 20
          ? '🚨'
          : this.metrics.treeShaking.unusedCount > 10
            ? '⚠️'
            : '✅';
      console.log(
        `  ${status} Unused exports: ${this.metrics.treeShaking.unusedCount}`
      );
      console.log(
        `  💾 Potential savings: ~${this.metrics.treeShaking.stats?.potentialSavingsKB || 0}KB`
      );
    } else {
      console.log('  ❓ Tree-shaking metrics not available');
    }

    // Firestore Section
    console.log('\n🔥 Firestore Performance:');
    if (this.metrics.firestore && !this.metrics.firestore.error) {
      const hitRateStatus =
        this.metrics.firestore.cacheHitRate > 80
          ? '✅'
          : this.metrics.firestore.cacheHitRate > 60
            ? '⚠️'
            : '🚨';
      console.log(
        `  ${hitRateStatus} Cache hit rate: ${this.metrics.firestore.cacheHitRate}%`
      );
      console.log(
        `  ⏱️ Average latency: ${this.metrics.firestore.averageLatency}ms`
      );
      console.log(`  📊 Total queries: ${this.metrics.firestore.totalQueries}`);
    } else {
      console.log('  ❓ Firestore metrics not available');
    }

    // Concurrency Section
    console.log('\n⚡ Concurrency Control:');
    if (this.metrics.concurrency && !this.metrics.concurrency.error) {
      const successStatus =
        this.metrics.concurrency.successRate > 98
          ? '✅'
          : this.metrics.concurrency.successRate > 95
            ? '⚠️'
            : '🚨';
      console.log(
        `  ${successStatus} Success rate: ${this.metrics.concurrency.successRate}%`
      );
      console.log(
        `  🎯 Current limit: ${this.metrics.concurrency.currentLimit}`
      );
      console.log(
        `  📈 Utilization: ${this.metrics.concurrency.utilizationPercent}%`
      );
    } else {
      console.log('  ❓ Concurrency metrics not available');
    }

    // Cache Section
    console.log('\n💾 Cache Performance:');
    if (this.metrics.cache && !this.metrics.cache.error) {
      const hitStatus =
        this.metrics.cache.memoryHitRate > 80
          ? '✅'
          : this.metrics.cache.memoryHitRate > 60
            ? '⚠️'
            : '🚨';
      console.log(
        `  ${hitStatus} Memory hit rate: ${this.metrics.cache.memoryHitRate}%`
      );
      console.log(
        `  📊 Total size: ${Math.round(this.metrics.cache.totalSize / 1024)}KB`
      );
    } else {
      console.log('  ❓ Cache metrics not available');
    }

    // Recommendations Section
    if (this.metrics.summary.recommendations.length > 0) {
      console.log('\n💡 Top Recommendations:');
      this.metrics.summary.recommendations.slice(0, 8).forEach((rec, i) => {
        console.log(`  ${i + 1}. ${rec}`);
      });
    }

    // Critical Issues
    if (
      this.metrics.summary.penalties &&
      this.metrics.summary.penalties.length > 0
    ) {
      console.log('\n🚨 Critical Issues:');
      this.metrics.summary.penalties.forEach(penalty => {
        console.log(`  ❌ ${penalty}`);
      });
    }

    console.log('\n==========================================');
    console.log(
      `🎯 PERF-001 Implementation Status: ${this.getImplementationStatus()}`
    );
    console.log('==========================================\n');
  }

  getScoreEmoji(score) {
    if (score >= 90) return '🟢';
    if (score >= 75) return '🟡';
    if (score >= 60) return '🟠';
    return '🔴';
  }

  getImplementationStatus() {
    const score = this.metrics.summary.overallScore;
    if (score >= 90) return 'EXCELLENT ✅';
    if (score >= 75) return 'GOOD ⚠️';
    if (score >= 60) return 'NEEDS IMPROVEMENT 🔧';
    return 'CRITICAL ISSUES 🚨';
  }

  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

// CLI support
if (import.meta.url === `file://${process.argv[1]}`) {
  const dashboard = new PerformanceDashboard();
  dashboard.generateDashboard().catch(error => {
    console.error('❌ Performance dashboard generation failed:', error);
    process.exit(1);
  });
}

export { PerformanceDashboard };
