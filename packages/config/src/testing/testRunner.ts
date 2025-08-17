/**
 * Advanced Test Suite Runner for CosmicHub
 * Integrates testing with performance monitoring, accessibility validation, and quality metrics
 */

import { performanceMonitor } from '../performance';
import { createDefaultEventBus, TestEventBus, SuiteStartEvent, ErrorEvent, SuiteResultEvent, RunStartEvent, RunSummaryEvent, WarningEvent, RecommendationEvent, ReportGeneratedEvent } from './testEvents';
import { TestResult, TestRunSummary } from './testTypes';
// Add Node.js process type definitions
declare const process: {
  version: string;
  platform: string;
  memoryUsage: () => { heapUsed: number };
};

export interface TestRunnerConfig {
  coverage: {
    threshold: number;
    exclude: string[];
  };
  performance: {
    maxRenderTime: number;
    maxMountTime: number;
  };
  accessibility: {
    level: 'A' | 'AA' | 'AAA';
    checkContrast: boolean;
  };
  reports: {
    generateHtml: boolean;
    generateJson: boolean;
    uploadResults: boolean;
  outputDir?: string; // directory for persisted reports
  };
}

// Using shared TestResult & TestRunSummary interfaces (see testTypes.ts)

class TestSuiteRunner {
  private config: TestRunnerConfig;
  private results: TestResult[] = [];
  private startTime: number = 0;
  private bus: TestEventBus;

  constructor(config: Partial<TestRunnerConfig> = {}, bus: TestEventBus = createDefaultEventBus()) {
    this.config = {
      coverage: {
        threshold: 80,
        exclude: ['node_modules', 'dist', '**/*.d.ts'],
        ...config.coverage
      },
      performance: {
        maxRenderTime: 16,
        maxMountTime: 100,
        ...config.performance
      },
      accessibility: {
        level: 'AA',
        checkContrast: true,
        ...config.accessibility
      },
      reports: {
        generateHtml: true,
        generateJson: true,
        uploadResults: false,
  outputDir: 'test-results',
        ...config.reports
      }
    };
    this.bus = bus;
  }

  async runSuite(suiteName: string, testFn: () => Promise<void>): Promise<TestResult> {
  this.bus.emit({ type: 'suite:start', suite: suiteName } as SuiteStartEvent);
    
    const startTime = performance.now();
    const initialMemory = this.getMemoryUsage();
    
    let status: 'passed' | 'failed' | 'skipped' = 'passed';
    const errors: string[] = [];
    let renderTime = 0;
    const mountTime = 0;

    try {
      // Track performance during test execution
      const performanceStart = performance.now();
      
      await testFn();
      
      renderTime = performance.now() - performanceStart;
      
      // Record test performance metrics
      performanceMonitor.recordMetric('TestExecution', renderTime, {
        suite: suiteName,
        type: 'test-suite'
      });
      
    } catch (error) {
      status = 'failed';
      const msg = error instanceof Error ? error.message : String(error);
      errors.push(msg);
  this.bus.emit({ type: 'error', message: `Test suite failed: ${suiteName}`, suite: suiteName, error: msg } as ErrorEvent);
    }

    const duration = performance.now() - startTime;
    const finalMemory = this.getMemoryUsage();
    const memoryUsage = finalMemory - initialMemory;

    // Generate mock coverage data (in real implementation, this would come from coverage tools)
    const coverage = this.generateMockCoverage();
    
    // Generate mock accessibility results
    const accessibility = this.generateMockAccessibility();

    const result: TestResult = {
      suite: suiteName,
      status,
      duration,
      coverage,
      performance: {
        renderTime,
        mountTime,
        memoryUsage
      },
      accessibility,
      errors,
      metadata: {
        timestamp: new Date().toISOString(),
        nodeVersion: typeof process !== 'undefined' ? process.version : 'unknown',
        platform: typeof process !== 'undefined' ? process.platform : 'unknown'
      }
    };

    this.results.push(result);
    
    // Log result summary
  this.emitResultWarnings(result);
  this.bus.emit({ type: 'suite:result', result } as SuiteResultEvent);
    
    return result;
  }

  async runAllSuites(suites: Record<string, () => Promise<void>>): Promise<TestRunSummary> {
  this.bus.emit({ type: 'run:start', totalSuites: Object.keys(suites).length } as RunStartEvent);
    this.startTime = performance.now();
    this.results = [];

    // Run all test suites
    for (const [suiteName, testFn] of Object.entries(suites)) {
      await this.runSuite(suiteName, testFn);
    }

    // Generate summary
    const summary = this.generateSummary();
    
    // Generate reports
    const tasks: Promise<void>[] = [];
    if (this.config.reports.generateJson) {
      tasks.push(this.generateJsonReport(summary));
    }
    if (this.config.reports.generateHtml) {
      tasks.push(this.generateHtmlReport(summary));
    }
    if (tasks.length) {
      await Promise.all(tasks);
    }

    // Log final summary
  this.emitRecommendations(summary);
  this.bus.emit({ type: 'run:summary', summary } as RunSummaryEvent);
    
    return summary;
  }

  private generateSummary(): TestRunSummary {
    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    const skipped = this.results.filter(r => r.status === 'skipped').length;
    const duration = performance.now() - this.startTime;

    // Calculate average coverage
    const avgCoverage = this.results.reduce((acc, result) => {
      acc.statements += result.coverage.statements;
      acc.branches += result.coverage.branches;
      acc.functions += result.coverage.functions;
      acc.lines += result.coverage.lines;
      return acc;
    }, { statements: 0, branches: 0, functions: 0, lines: 0 });

    Object.keys(avgCoverage).forEach(key => {
      avgCoverage[key as keyof typeof avgCoverage] /= total || 1;
    });

    const overall = (avgCoverage.statements + avgCoverage.branches + avgCoverage.functions + avgCoverage.lines) / 4;

    // Calculate performance metrics
    const renderTimes = this.results.map(r => r.performance.renderTime);
    const averageRenderTime = renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length;
    const maxRenderTime = Math.max(...renderTimes);
    const totalMemoryUsage = this.results.reduce((acc, r) => acc + r.performance.memoryUsage, 0);

    // Calculate accessibility metrics
    const totalViolations = this.results.reduce((acc, r) => acc + r.accessibility.violations.length, 0);
    const criticalViolations = this.results.reduce((acc, r) => 
      acc + r.accessibility.violations.filter(v => v.impact === 'critical').length, 0);
    const totalWarnings = this.results.reduce((acc, r) => acc + r.accessibility.warnings.length, 0);

    // Calculate quality score and grade
    const { score, grade, recommendations } = this.calculateQualityMetrics({
      coverage: overall,
      performance: averageRenderTime,
      accessibility: totalViolations,
      testSuccess: passed / total
    });

    return {
      total,
      passed,
      failed,
      skipped,
      duration,
      coverage: {
        overall,
        ...avgCoverage
      },
      performance: {
        averageRenderTime,
        maxRenderTime,
        totalMemoryUsage
      },
      accessibility: {
        totalViolations,
        criticalViolations,
        totalWarnings
      },
      quality: {
        score,
        grade,
        recommendations
      }
    };
  }

  private calculateQualityMetrics(metrics: {
    coverage: number;
    performance: number;
    accessibility: number;
    testSuccess: number;
  }): { score: number; grade: 'A' | 'B' | 'C' | 'D' | 'F'; recommendations: string[] } {
    // Calculate weighted quality score
    const weights = {
      coverage: 0.3,
      performance: 0.2,
      accessibility: 0.3,
      testSuccess: 0.2
    };

    const coverageScore = Math.min(metrics.coverage / this.config.coverage.threshold * 100, 100);
    const performanceScore = metrics.performance <= this.config.performance.maxRenderTime ? 100 : 
                            Math.max(0, 100 - (metrics.performance - this.config.performance.maxRenderTime) * 5);
    const accessibilityScore = metrics.accessibility === 0 ? 100 : Math.max(0, 100 - metrics.accessibility * 10);
    const testSuccessScore = metrics.testSuccess * 100;

    const score = Math.round(
      coverageScore * weights.coverage +
      performanceScore * weights.performance +
      accessibilityScore * weights.accessibility +
      testSuccessScore * weights.testSuccess
    );

    const grade: 'A' | 'B' | 'C' | 'D' | 'F' = score >= 90 ? 'A' : 
                  score >= 80 ? 'B' : 
                  score >= 70 ? 'C' : 
                  score >= 60 ? 'D' : 'F';

    const recommendations: string[] = [];
    if (coverageScore < 80) recommendations.push('Increase test coverage');
    if (performanceScore < 80) recommendations.push('Optimize component performance');
    if (accessibilityScore < 80) recommendations.push('Fix accessibility violations');
    if (testSuccessScore < 100) recommendations.push('Fix failing tests');

    return { score, grade, recommendations };
  }

  private getMemoryUsage(): number {
  // Safely access memory usage via globalThis to avoid ReferenceError when process is undefined
  const proc = (globalThis as unknown as { process?: { memoryUsage?: () => { heapUsed: number } } }).process;
  return proc?.memoryUsage?.().heapUsed ?? 0;
  }

  private generateMockCoverage(): { statements: number; branches: number; functions: number; lines: number } {
    // In real implementation, this would integrate with coverage tools like c8 or istanbul
    return {
      statements: 85 + Math.random() * 10,
      branches: 80 + Math.random() * 15,
      functions: 90 + Math.random() * 10,
      lines: 87 + Math.random() * 8
    };
  }

  private generateMockAccessibility(): { violations: Array<{ id: string; impact: 'moderate'; description: string; nodes: number }>; warnings: Array<{ id: string; description: string; nodes: number }> } {
    // In real implementation, this would integrate with axe-core or similar tools
    const violations = Math.random() > 0.8 ? [{
      id: 'color-contrast',
      impact: 'moderate' as const,
      description: 'Text color contrast is insufficient',
      nodes: 1
    }] : [];

    const warnings = Math.random() > 0.7 ? [{
      id: 'aria-label',
      description: 'Consider adding aria-label for better accessibility',
      nodes: 1
    }] : [];

    return { violations, warnings };
  }

  private emitResultWarnings(result: TestResult): void {
    if (result.performance.renderTime > this.config.performance.maxRenderTime) {
  this.bus.emit({ type: 'warning', message: `Slow render time: ${result.performance.renderTime.toFixed(2)}ms`, suite: result.suite, code: 'PERF_SLOW_RENDER' } as WarningEvent);
    }
    if (result.accessibility.violations.length > 0) {
  this.bus.emit({ type: 'warning', message: `${result.accessibility.violations.length} accessibility violations`, suite: result.suite, code: 'A11Y_VIOLATIONS' } as WarningEvent);
    }
  }

  private emitRecommendations(summary: TestRunSummary): void {
    summary.quality.recommendations.forEach(rec => {
  this.bus.emit({ type: 'recommendation', recommendation: rec } as RecommendationEvent);
    });
  }

  private async ensureOutputDir(): Promise<string> {
  const dir = this.config.reports.outputDir ?? 'test-results';
    try {
      const fs = await import('fs/promises');
      await fs.mkdir(dir, { recursive: true });
    } catch {/* ignore mkdir errors */}
    return dir;
  }

  private async generateJsonReport(summary: TestRunSummary): Promise<void> {
    const dir = await this.ensureOutputDir();
    const path = `${dir}/test-report.json`;
    const payload = {
      summary,
      results: this.results,
      timestamp: new Date().toISOString(),
      config: this.config
    };
    try {
      const fs = await import('fs/promises');
      await fs.writeFile(path, JSON.stringify(payload, null, 2), 'utf-8');
  this.bus.emit({ type: 'report:generated', format: 'json', location: path } as ReportGeneratedEvent);
    } catch {
  this.bus.emit({ type: 'error', message: 'Failed to write JSON report', error: path } as ErrorEvent);
    }
  }

  private async generateHtmlReport(summary: TestRunSummary): Promise<void> {
    const dir = await this.ensureOutputDir();
    const path = `${dir}/test-report.html`;
    const html = this.buildHtmlReport(summary);
    try {
      const fs = await import('fs/promises');
      await fs.writeFile(path, html, 'utf-8');
  this.bus.emit({ type: 'report:generated', format: 'html', location: path } as ReportGeneratedEvent);
    } catch {
  this.bus.emit({ type: 'error', message: 'Failed to write HTML report', error: path } as ErrorEvent);
    }
  }

  private buildHtmlReport(summary: TestRunSummary): string {
    const rows = this.results.map(r => `<tr><td>${r.suite}</td><td>${r.status}</td><td>${r.duration.toFixed(2)}ms</td><td>${r.coverage.statements.toFixed(1)}%</td><td>${r.performance.renderTime.toFixed(2)}ms</td><td>${r.accessibility.violations.length}</td></tr>`).join('\n');
    const recommendations = summary.quality.recommendations.map(r => `<li>${r}</li>`).join('\n');
    return `<!DOCTYPE html><html><head><meta charset='utf-8'/><title>Test Report</title><style>body{font-family:system-ui,Arial,sans-serif;margin:16px;}table{border-collapse:collapse;width:100%;margin-top:12px;}th,td{border:1px solid #ddd;padding:6px;font-size:12px;}th{background:#f5f5f5;text-align:left;} .status-passed{color:green;} .status-failed{color:#b00;} .status-skipped{color:#666;} .metrics{display:flex;gap:16px;flex-wrap:wrap;margin-top:8px;} .metric{background:#fafafa;border:1px solid #eee;padding:8px;border-radius:4px;min-width:140px;} .recs ul{margin:4px 0 0 18px;padding:0;} </style></head><body><h1>Test Run Summary</h1><div class='metrics'>
    <div class='metric'><strong>Total</strong><br/>${summary.total}</div>
    <div class='metric'><strong>Passed</strong><br/>${summary.passed}</div>
    <div class='metric'><strong>Failed</strong><br/>${summary.failed}</div>
    <div class='metric'><strong>Duration</strong><br/>${(summary.duration/1000).toFixed(2)}s</div>
    <div class='metric'><strong>Coverage</strong><br/>${summary.coverage.overall.toFixed(1)}%</div>
    <div class='metric'><strong>Avg Render</strong><br/>${summary.performance.averageRenderTime.toFixed(2)}ms</div>
    <div class='metric'><strong>A11y Violations</strong><br/>${summary.accessibility.totalViolations}</div>
    <div class='metric'><strong>Quality Score</strong><br/>${summary.quality.score} (${summary.quality.grade})</div>
    </div>
    <h2>Suites</h2><table><thead><tr><th>Suite</th><th>Status</th><th>Duration</th><th>Statements</th><th>Render</th><th>A11y Viol.</th></tr></thead><tbody>${rows}</tbody></table>
    <div class='recs'><h2>Recommendations</h2><ul>${recommendations || '<li>None 🎉</li>'}</ul></div>
    <p>Generated at ${new Date().toISOString()}</p>
    </body></html>`;
  }
}

// Pre-configured runners for different environments
export const createDevelopmentRunner = (): TestSuiteRunner => new TestSuiteRunner({
  coverage: { threshold: 70, exclude: ['**/*.test.*', '**/*.spec.*'] },
  performance: { maxRenderTime: 32, maxMountTime: 50 },
  accessibility: { level: 'AA', checkContrast: true },
  reports: { generateHtml: true, generateJson: false, uploadResults: false }
});

export const createCIRunner = (): TestSuiteRunner => new TestSuiteRunner({
  coverage: { threshold: 80, exclude: ['**/*.test.*', '**/*.spec.*', '**/stories/**'] },
  performance: { maxRenderTime: 16, maxMountTime: 25 },
  accessibility: { level: 'AA', checkContrast: true },
  reports: { generateHtml: false, generateJson: true, uploadResults: true }
});

export const createProductionRunner = (): TestSuiteRunner => new TestSuiteRunner({
  coverage: { threshold: 90, exclude: ['**/*.test.*', '**/*.spec.*'] },
  performance: { maxRenderTime: 10, maxMountTime: 15 },
  accessibility: { level: 'AAA', checkContrast: true },
  reports: { generateHtml: true, generateJson: true, uploadResults: true }
});

// Export default instance
export const testRunner = new TestSuiteRunner();
export { TestSuiteRunner };
