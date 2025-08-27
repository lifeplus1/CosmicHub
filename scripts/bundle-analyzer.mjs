#!/usr/bin/env node

/**
 * PERF-002 Bundle Analyzer - Post-Cleanup Analysis
 *
 * Compares bundle sizes before and after tree-shaking cleanup
 * and generates comprehensive performance reports.
 */

import { promises as fs } from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');
const METRICS_DIR = path.join(ROOT_DIR, 'metrics');

class BundleAnalyzer {
  constructor() {
    this.baselineMetrics = null;
    this.currentMetrics = null;
    this.comparison = null;
  }

  async analyze(phase = 'baseline') {
    console.log(`📊 Analyzing bundle sizes (${phase})...`);

    // Ensure metrics directory exists
    await fs.mkdir(METRICS_DIR, { recursive: true });

    const metrics = {
      timestamp: new Date().toISOString(),
      phase,
      bundles: {},
      buildTime: 0
    };

    try {
      // Build all applications and measure time
      const startTime = Date.now();
      
      console.log('  Building Astro app...');
      const astroBuild = this.buildApp('astro');
      metrics.bundles.astro = await this.analyzeBundleSize('apps/astro/dist');
      
      console.log('  Building HealWave app...');
      const healwaveBuild = this.buildApp('healwave'); 
      metrics.bundles.healwave = await this.analyzeBundleSize('apps/healwave/dist');

      metrics.buildTime = Date.now() - startTime;

      // Save metrics
      const metricsFile = path.join(METRICS_DIR, `bundle-analysis-${phase}.json`);
      await fs.writeFile(metricsFile, JSON.stringify(metrics, null, 2));

      console.log(`✅ Bundle analysis (${phase}) completed in ${metrics.buildTime}ms`);
      return metrics;

    } catch (error) {
      console.error(`❌ Bundle analysis failed:`, error.message);
      throw error;
    }
  }

  buildApp(appName) {
    try {
      // Try different build commands
      const buildCommands = [
        `npm run build:${appName}`,
        `cd apps/${appName} && npm run build`,
        `npx turbo build --filter=${appName}`,
        'npm run build'
      ];

      for (const cmd of buildCommands) {
        try {
          execSync(cmd, { 
            stdio: 'pipe', 
            cwd: ROOT_DIR,
            encoding: 'utf8'
          });
          return true;
        } catch (error) {
          continue;
        }
      }
      
      throw new Error(`Could not build ${appName}`);
    } catch (error) {
      console.warn(`⚠️ Could not build ${appName}:`, error.message);
      return false;
    }
  }

  async analyzeBundleSize(distPath) {
    const fullPath = path.join(ROOT_DIR, distPath);
    
    try {
      const stats = await this.getDirSize(fullPath);
      return {
        totalSize: stats.totalSize,
        fileCount: stats.fileCount,
        jsSize: stats.jsSize,
        cssSize: stats.cssSize,
        assets: stats.assets
      };
    } catch (error) {
      console.warn(`⚠️ Could not analyze ${distPath}:`, error.message);
      return {
        totalSize: 0,
        fileCount: 0,
        jsSize: 0,
        cssSize: 0,
        assets: 0
      };
    }
  }

  async getDirSize(dirPath) {
    const stats = {
      totalSize: 0,
      fileCount: 0,
      jsSize: 0,
      cssSize: 0,
      assets: 0
    };

    try {
      const files = await fs.readdir(dirPath, { withFileTypes: true });

      for (const file of files) {
        const filePath = path.join(dirPath, file.name);

        if (file.isDirectory()) {
          const subStats = await this.getDirSize(filePath);
          stats.totalSize += subStats.totalSize;
          stats.fileCount += subStats.fileCount;
          stats.jsSize += subStats.jsSize;
          stats.cssSize += subStats.cssSize;
          stats.assets += subStats.assets;
        } else {
          const fileStat = await fs.stat(filePath);
          stats.totalSize += fileStat.size;
          stats.fileCount += 1;

          if (file.name.endsWith('.js') || file.name.endsWith('.mjs')) {
            stats.jsSize += fileStat.size;
          } else if (file.name.endsWith('.css')) {
            stats.cssSize += fileStat.size;
          } else {
            stats.assets += fileStat.size;
          }
        }
      }
    } catch (error) {
      // Directory might not exist
    }

    return stats;
  }

  async compare() {
    console.log('📊 Comparing bundle sizes...');

    try {
      // Load baseline and current metrics
      const baselineFile = path.join(METRICS_DIR, 'bundle-analysis-baseline.json');
      const currentFile = path.join(METRICS_DIR, 'bundle-analysis-after-cleanup.json');

      this.baselineMetrics = JSON.parse(await fs.readFile(baselineFile, 'utf8'));
      this.currentMetrics = JSON.parse(await fs.readFile(currentFile, 'utf8'));

      this.comparison = {
        timestamp: new Date().toISOString(),
        summary: this.calculateSummary(),
        details: this.calculateDetails(),
        recommendations: this.generateRecommendations()
      };

      // Save comparison
      const comparisonFile = path.join(METRICS_DIR, 'perf-002-bundle-comparison.json');
      await fs.writeFile(comparisonFile, JSON.stringify(this.comparison, null, 2));

      // Print summary
      this.printComparison();

      return this.comparison;

    } catch (error) {
      console.error(`❌ Bundle comparison failed:`, error.message);
      throw error;
    }
  }

  calculateSummary() {
    const baseline = this.baselineMetrics;
    const current = this.currentMetrics;

    const totalBaselineSize = Object.values(baseline.bundles).reduce(
      (sum, bundle) => sum + bundle.totalSize, 0
    );
    const totalCurrentSize = Object.values(current.bundles).reduce(
      (sum, bundle) => sum + bundle.totalSize, 0
    );

    const sizeDiff = totalBaselineSize - totalCurrentSize;
    const percentChange = (sizeDiff / totalBaselineSize) * 100;

    return {
      totalSizeReduction: sizeDiff,
      percentReduction: percentChange,
      buildTimeChange: current.buildTime - baseline.buildTime,
      perf002Success: sizeDiff > 0 && sizeDiff >= 1.5 * 1024 * 1024 // 1.5MB minimum
    };
  }

  calculateDetails() {
    const details = {};

    for (const [appName, baselineBundle] of Object.entries(this.baselineMetrics.bundles)) {
      const currentBundle = this.currentMetrics.bundles[appName];
      
      if (currentBundle) {
        details[appName] = {
          totalSize: {
            before: baselineBundle.totalSize,
            after: currentBundle.totalSize,
            reduction: baselineBundle.totalSize - currentBundle.totalSize
          },
          jsSize: {
            before: baselineBundle.jsSize,
            after: currentBundle.jsSize,
            reduction: baselineBundle.jsSize - currentBundle.jsSize
          },
          cssSize: {
            before: baselineBundle.cssSize,
            after: currentBundle.cssSize,
            reduction: baselineBundle.cssSize - currentBundle.cssSize
          },
          fileCount: {
            before: baselineBundle.fileCount,
            after: currentBundle.fileCount,
            reduction: baselineBundle.fileCount - currentBundle.fileCount
          }
        };
      }
    }

    return details;
  }

  generateRecommendations() {
    const recommendations = [];
    const summary = this.comparison.summary;

    if (summary.perf002Success) {
      recommendations.push({
        type: 'success',
        message: `PERF-002 achieved ${(summary.percentReduction).toFixed(1)}% bundle size reduction`,
        priority: 'info'
      });
    } else {
      recommendations.push({
        type: 'warning',
        message: 'PERF-002 did not achieve the target 1.5MB reduction',
        priority: 'medium'
      });
    }

    if (summary.buildTimeChange < 0) {
      recommendations.push({
        type: 'success',
        message: `Build time improved by ${Math.abs(summary.buildTimeChange)}ms`,
        priority: 'info'
      });
    }

    // Further optimizations
    if (summary.percentReduction < 20) {
      recommendations.push({
        type: 'optimization',
        message: 'Consider additional optimizations: dynamic imports, code splitting',
        priority: 'low'
      });
    }

    return recommendations;
  }

  printComparison() {
    console.log('\n🎯 PERF-002 Bundle Size Comparison:');
    console.log('=====================================');

    const summary = this.comparison.summary;
    const sizeMB = (summary.totalSizeReduction / (1024 * 1024)).toFixed(2);
    
    console.log(`Total size reduction: ${sizeMB}MB (${summary.percentReduction.toFixed(1)}%)`);
    console.log(`Build time change: ${summary.buildTimeChange > 0 ? '+' : ''}${summary.buildTimeChange}ms`);
    console.log(`PERF-002 target met: ${summary.perf002Success ? '✅ YES' : '❌ NO'}`);

    console.log('\n📊 Per-App Breakdown:');
    for (const [appName, details] of Object.entries(this.comparison.details)) {
      const appSizeMB = (details.totalSize.reduction / (1024 * 1024)).toFixed(2);
      console.log(`  ${appName}: -${appSizeMB}MB (${details.fileCount.reduction} fewer files)`);
    }

    if (this.comparison.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      for (const rec of this.comparison.recommendations) {
        const icon = rec.priority === 'info' ? '✅' : rec.priority === 'medium' ? '⚠️' : '💡';
        console.log(`  ${icon} ${rec.message}`);
      }
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const analyzer = new BundleAnalyzer();

  if (args.includes('--baseline')) {
    console.log('📊 Creating baseline bundle analysis...');
    await analyzer.analyze('baseline');
    
  } else if (args.includes('--after-cleanup')) {
    console.log('📊 Analyzing bundles after PERF-002 cleanup...');
    await analyzer.analyze('after-cleanup');
    
  } else if (args.includes('--compare')) {
    console.log('📊 Comparing baseline vs after-cleanup...');
    await analyzer.compare();
    
  } else {
    console.log(`
Bundle Analyzer - PERF-002 Implementation

Usage: node bundle-analyzer.mjs [options]

Options:
  --baseline       Create baseline bundle analysis
  --after-cleanup  Analyze bundles after cleanup
  --compare        Compare baseline vs after-cleanup
  --help           Show this help message

Workflow:
  1. node bundle-analyzer.mjs --baseline
  2. # Run tree-shaking cleanup
  3. node bundle-analyzer.mjs --after-cleanup
  4. node bundle-analyzer.mjs --compare
`);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Bundle analysis failed:', error);
    process.exit(1);
  });
}

export { BundleAnalyzer };
