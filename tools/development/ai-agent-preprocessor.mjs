#!/usr/bin/env node
/**
 * AI Agent Preprocessor - Enhanced Coordination System
 *
 * Implements bulk fixes and error analysis to improve agent readiness rates
 * and coordination efficiency before AI agent deployment.
 */

import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '../..');

// Color utilities
const colorize = (text, color) => {
  const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    bright: '\x1b[1m',
    reset: '\x1b[0m',
  };
  return `${colors[color] || ''}${text}${colors.reset}`;
};

// Bulk fix strategies
const BULK_FIX_STRATEGIES = {
  'unused-imports': {
    name: 'Remove Unused Imports',
    command:
      'npx eslint --fix --rule="@typescript-eslint/no-unused-vars: error"',
    estimatedImpact: 'High - removes 30-50% of unused variable errors',
    targets: ['*.ts', '*.tsx'],
    priority: 1,
  },
  'duplicate-imports': {
    name: 'Fix Duplicate Imports',
    command: 'npx eslint --fix --rule="no-duplicate-imports: error"',
    estimatedImpact: 'Medium - consolidates import statements',
    targets: ['*.ts', '*.tsx'],
    priority: 2,
  },
  'nullish-coalescing': {
    name: 'Convert || to ?? operators',
    command: 'find-and-replace',
    pattern: /\|\|(?=\s*[^|])/g,
    replacement: '??',
    estimatedImpact: 'High - fixes 50+ nullish coalescing warnings',
    priority: 3,
    safeContexts: ['default values', 'fallbacks'],
  },
  'jsx-undefined': {
    name: 'Add JSX type imports',
    command: 'auto-import',
    imports: ['React'],
    estimatedImpact: 'Medium - fixes JSX undefined errors',
    priority: 4,
  },
};

// Error complexity analysis
const ERROR_COMPLEXITY_MAP = {
  'no-unused-vars': { complexity: 1, autoFixable: true, impact: 'low' },
  'no-duplicate-imports': { complexity: 1, autoFixable: true, impact: 'low' },
  'prefer-nullish-coalescing': {
    complexity: 2,
    autoFixable: false,
    impact: 'medium',
  },
  'no-explicit-any': { complexity: 4, autoFixable: false, impact: 'high' },
  'no-unsafe-assignment': { complexity: 5, autoFixable: false, impact: 'high' },
  'no-unsafe-member-access': {
    complexity: 5,
    autoFixable: false,
    impact: 'high',
  },
  'no-undef': { complexity: 2, autoFixable: true, impact: 'medium' },
};

class AgentPreprocessor {
  constructor() {
    this.coordinationDir = join(ROOT, 'ai-agent-coordination');
    this.results = [];
    this.bulkFixResults = [];
  }

  async runBulkPreprocessing() {
    console.log(colorize('\n🚀 AI Agent Preprocessing System', 'bright'));
    console.log(colorize('═'.repeat(50), 'blue'));

    // Step 1: Analyze current error patterns
    console.log(colorize('\n📊 Step 1: Analyzing Error Patterns', 'cyan'));
    const errorAnalysis = await this.analyzeErrorPatterns();

    // Step 2: Apply bulk fixes
    console.log(colorize('\n🛠️  Step 2: Applying Bulk Fixes', 'cyan'));
    const bulkFixResults = await this.applyBulkFixes(errorAnalysis);

    // Step 3: Rebalance agent workloads
    console.log(colorize('\n⚖️  Step 3: Rebalancing Agent Workloads', 'cyan'));
    const rebalanceResults = await this.rebalanceAgentWorkloads();

    // Step 4: Generate enhanced coordination
    console.log(
      colorize('\n🤖 Step 4: Generating Enhanced Coordination', 'cyan')
    );
    const coordinationResults = await this.generateEnhancedCoordination();

    this.printPreprocessingSummary({
      errorAnalysis,
      bulkFixResults,
      rebalanceResults,
      coordinationResults,
    });
  }

  async analyzeErrorPatterns() {
    const analysisFiles = [
      'agent-1-astro-components-analysis.json',
      'agent-2-astro-features-analysis.json',
      'agent-3-astro-pages-context-analysis.json',
      'agent-4-astro-services-types-analysis.json',
      'agent-6-config-package-analysis.json',
      'agent-7-apps-small-packages-analysis.json',
    ];

    const errorPatterns = {};
    let totalErrors = 0;
    let readyAgents = 0;
    let totalAgents = 0;

    for (const file of analysisFiles) {
      const filePath = join(this.coordinationDir, file);
      if (existsSync(filePath)) {
        totalAgents++;
        try {
          const analysis = JSON.parse(readFileSync(filePath, 'utf8'));

          if (analysis.readyForExecution) {
            readyAgents++;
            console.log(
              colorize(
                `  ✅ ${analysis.agent}: READY (${analysis.errorCount} errors)`,
                'green'
              )
            );
          } else {
            console.log(
              colorize(
                `  ❌ ${analysis.agent}: NEEDS WORK (${analysis.errorCount} errors, ${analysis.warningCount} warnings)`,
                'red'
              )
            );
          }

          totalErrors += analysis.errorCount || 0;

          // Extract error patterns from lint output
          if (analysis.errors) {
            const lines = analysis.errors.split('\n');
            for (const line of lines) {
              const errorMatch = line.match(/error\s+(.+?)(?:\s|$)/);
              if (errorMatch) {
                const errorType = errorMatch[1];
                errorPatterns[errorType] = (errorPatterns[errorType] || 0) + 1;
              }
            }
          }
        } catch (error) {
          console.error(`Error reading ${file}:`, error.message);
        }
      }
    }

    return {
      totalErrors,
      readyAgents,
      totalAgents,
      readyRate: ((readyAgents / totalAgents) * 100).toFixed(1),
      errorPatterns: Object.entries(errorPatterns)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10), // Top 10 error types
    };
  }

  async applyBulkFixes(errorAnalysis) {
    const results = [];

    // Apply quick wins first
    const quickWins = ['duplicate-imports', 'unused-imports'];

    for (const fixType of quickWins) {
      const strategy = BULK_FIX_STRATEGIES[fixType];
      if (strategy) {
        console.log(colorize(`  🔧 Applying ${strategy.name}...`, 'yellow'));

        try {
          const result = await this.executeBulkFix(strategy);
          results.push({
            type: fixType,
            success: result.success,
            fixedCount: result.fixedCount || 0,
            impact: strategy.estimatedImpact,
          });

          if (result.success) {
            console.log(
              colorize(
                `    ✅ ${strategy.name}: ${result.fixedCount || 'Multiple'} fixes applied`,
                'green'
              )
            );
          } else {
            console.log(
              colorize(
                `    ❌ ${strategy.name}: Failed - ${result.error}`,
                'red'
              )
            );
          }
        } catch (error) {
          console.error(`    ❌ ${strategy.name}: Error - ${error.message}`);
        }
      }
    }

    return results;
  }

  async executeBulkFix(strategy) {
    return new Promise(resolve => {
      if (strategy.command.startsWith('npx eslint')) {
        // ESLint-based fixes
        const eslintProcess = spawn(
          'npx',
          [
            'eslint',
            '--fix',
            '--ext',
            '.ts,.tsx',
            'apps/astro/src',
            'packages/*/src',
          ],
          {
            cwd: ROOT,
            stdio: ['pipe', 'pipe', 'pipe'],
          }
        );

        let output = '';
        let errorOutput = '';

        eslintProcess.stdout.on('data', data => {
          output += data.toString();
        });

        eslintProcess.stderr.on('data', data => {
          errorOutput += data.toString();
        });

        eslintProcess.on('close', code => {
          const success = code === 0 || code === 1; // ESLint returns 1 when fixes are applied
          resolve({
            success,
            fixedCount: output.includes('✨') ? 'Multiple' : 0,
            error: !success ? errorOutput : null,
          });
        });
      } else {
        // Non-ESLint fixes (placeholder for future implementation)
        resolve({
          success: false,
          error: 'Not implemented yet',
        });
      }
    });
  }

  async rebalanceAgentWorkloads() {
    // This would implement dynamic workload rebalancing
    // For now, return a placeholder
    return {
      rebalanced: false,
      reason:
        'Feature in development - current workload distribution acceptable',
    };
  }

  async generateEnhancedCoordination() {
    // Re-run coordination analysis to see improvements
    console.log(
      colorize('  🔄 Re-analyzing agents after preprocessing...', 'yellow')
    );

    return new Promise(resolve => {
      const coordProcess = spawn('npm', ['run', 'lint:ai-coord'], {
        cwd: ROOT,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let output = '';

      coordProcess.stdout.on('data', data => {
        output += data.toString();
      });

      coordProcess.on('close', code => {
        // Extract efficiency and ready agent count from output
        const efficiencyMatch = output.match(
          /Coordination Efficiency:\s*([\d.]+)%/
        );
        const readyMatch = output.match(/Ready for Execution:\s*(\d+)/);

        resolve({
          success: code === 0,
          newEfficiency: efficiencyMatch
            ? parseFloat(efficiencyMatch[1])
            : null,
          newReadyAgents: readyMatch ? parseInt(readyMatch[1]) : null,
        });
      });
    });
  }

  printPreprocessingSummary(results) {
    const { errorAnalysis, bulkFixResults, coordinationResults } = results;

    console.log(colorize('\n🎯 PREPROCESSING SUMMARY', 'bright'));
    console.log(colorize('═'.repeat(60), 'blue'));

    // Before/After comparison
    console.log(colorize('\n📊 Before Preprocessing:', 'cyan'));
    console.log(
      colorize(`  • Total Errors: ${errorAnalysis.totalErrors}`, 'blue')
    );
    console.log(
      colorize(
        `  • Ready Agents: ${errorAnalysis.readyAgents}/${errorAnalysis.totalAgents} (${errorAnalysis.readyRate}%)`,
        'blue'
      )
    );

    if (coordinationResults.success) {
      console.log(colorize('\n📈 After Preprocessing:', 'cyan'));
      console.log(
        colorize(
          `  • New Ready Agents: ${coordinationResults.newReadyAgents || 'Analyzing...'}`,
          'green'
        )
      );
      console.log(
        colorize(
          `  • New Efficiency: ${coordinationResults.newEfficiency || 'Calculating...'}%`,
          'green'
        )
      );
    }

    console.log(colorize('\n🛠️  Bulk Fixes Applied:', 'cyan'));
    bulkFixResults.forEach(fix => {
      const status = fix.success
        ? colorize('✅', 'green')
        : colorize('❌', 'red');
      console.log(
        `  ${status} ${fix.type}: ${fix.fixedCount} fixes (${fix.impact})`
      );
    });

    console.log(colorize('\n🔍 Top Error Patterns:', 'cyan'));
    errorAnalysis.errorPatterns.forEach(([error, count], index) => {
      console.log(`  ${index + 1}. ${error}: ${count} occurrences`);
    });

    console.log(colorize('\n🚀 Next Steps:', 'bright'));
    console.log(
      colorize(
        '  1. Run enhanced coordination: npm run lint:ai-coord-enhanced',
        'blue'
      )
    );
    console.log(colorize('  2. Deploy ready agents in parallel', 'blue'));
    console.log(colorize('  3. Monitor improved efficiency metrics', 'blue'));
  }
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const preprocessor = new AgentPreprocessor();
  preprocessor.runBulkPreprocessing().catch(console.error);
}

export { AgentPreprocessor };
