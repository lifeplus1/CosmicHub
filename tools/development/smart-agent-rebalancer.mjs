#!/usr/bin/env node
/**
 * Smart Agent Rebalancer
 *
 * Analyzes error patterns and complexity to create optimally balanced
 * AI agent workloads for maximum coordination efficiency.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '../..');

// Error complexity scoring system
const ERROR_COMPLEXITY_SCORES = {
  // Low complexity (auto-fixable)
  'no-unused-vars': 1,
  'no-duplicate-imports': 1,
  '@typescript-eslint/no-unused-vars': 1,
  'no-undef': 2,

  // Medium complexity (pattern-based fixes)
  'prefer-nullish-coalescing': 3,
  'no-unnecessary-type-assertion': 3,
  'restrict-template-expressions': 3,

  // High complexity (requires type analysis)
  'no-explicit-any': 5,
  'no-unsafe-assignment': 6,
  'no-unsafe-member-access': 6,
  'no-unsafe-argument': 6,
  'no-unsafe-return': 6,
  'no-unsafe-call': 6,

  // Very high complexity (architectural changes needed)
  'jsx-a11y': 4,
  'react-hooks': 7,
};

class SmartAgentRebalancer {
  constructor() {
    this.coordinationDir = join(ROOT, 'ai-agent-coordination');
    this.originalBatches = this.loadOriginalBatches();
    this.errorAnalysis = {};
  }

  async analyzeAndRebalance() {
    console.log('🔄 Smart Agent Rebalancing System');
    console.log('═'.repeat(50));

    // Step 1: Analyze current error distribution
    const errorDistribution = await this.analyzeErrorDistribution();

    // Step 2: Calculate complexity scores
    const complexityAnalysis =
      this.calculateComplexityScores(errorDistribution);

    // Step 3: Create optimized batches
    const optimizedBatches = this.createOptimizedBatches(complexityAnalysis);

    // Step 4: Generate new agent configurations
    const newAgentConfig = this.generateNewAgentConfiguration(optimizedBatches);

    return {
      errorDistribution,
      complexityAnalysis,
      optimizedBatches,
      newAgentConfig,
      recommendations: this.generateRecommendations(newAgentConfig),
    };
  }

  async analyzeErrorDistribution() {
    const agentFiles = [
      'agent-1-astro-components-analysis.json',
      'agent-2-astro-features-analysis.json',
      'agent-3-astro-pages-context-analysis.json',
      'agent-4-astro-services-types-analysis.json',
      'agent-6-config-package-analysis.json',
      'agent-7-apps-small-packages-analysis.json',
    ];

    const distribution = {};

    for (const file of agentFiles) {
      const filePath = join(this.coordinationDir, file);
      if (existsSync(filePath)) {
        try {
          const analysis = JSON.parse(readFileSync(filePath, 'utf8'));
          const agentId =
            analysis.agentId || file.replace('-analysis.json', '');

          distribution[agentId] = {
            errorCount: analysis.errorCount || 0,
            warningCount: analysis.warningCount || 0,
            duration: analysis.duration || 0,
            ready: analysis.readyForExecution || false,
            errorPatterns: this.extractErrorPatterns(analysis.errors || ''),
            targets: analysis.targets || [],
          };
        } catch (error) {
          console.error(`Error reading ${file}:`, error.message);
        }
      }
    }

    return distribution;
  }

  extractErrorPatterns(errorText) {
    const patterns = {};
    const lines = errorText.split('\n');

    for (const line of lines) {
      // Extract error type from ESLint output
      const errorMatch = line.match(
        /error\s+(.+?)\s+(@typescript-eslint\/[\w-]+|[\w-]+)/
      );
      if (errorMatch) {
        const errorRule = errorMatch[2];
        patterns[errorRule] = (patterns[errorRule] || 0) + 1;
      }
    }

    return patterns;
  }

  calculateComplexityScores(errorDistribution) {
    const analysis = {};

    for (const [agentId, data] of Object.entries(errorDistribution)) {
      let totalComplexity = 0;
      const errorBreakdown = {};

      for (const [errorType, count] of Object.entries(data.errorPatterns)) {
        const complexity = ERROR_COMPLEXITY_SCORES[errorType] || 4; // Default medium complexity
        const errorComplexity = complexity * count;
        totalComplexity += errorComplexity;

        errorBreakdown[errorType] = {
          count,
          complexity,
          totalComplexity: errorComplexity,
        };
      }

      analysis[agentId] = {
        ...data,
        totalComplexity,
        complexityPerError:
          data.errorCount > 0 ? totalComplexity / data.errorCount : 0,
        errorBreakdown,
        workloadScore: this.calculateWorkloadScore(data, totalComplexity),
      };
    }

    return analysis;
  }

  calculateWorkloadScore(data, totalComplexity) {
    // Normalize workload considering error count, complexity, and duration
    const errorWeight = data.errorCount * 1.0;
    const complexityWeight = totalComplexity * 0.8;
    const durationWeight = (data.duration / 1000) * 0.5;

    return errorWeight + complexityWeight + durationWeight;
  }

  createOptimizedBatches(complexityAnalysis) {
    // Sort agents by workload score
    const agentWorkloads = Object.entries(complexityAnalysis).sort(
      ([, a], [, b]) => a.workloadScore - b.workloadScore
    );

    // Create balanced batches
    const optimizedBatches = {
      'quick-wins': {
        name: 'Quick Wins Agent',
        agents: [],
        targetComplexity: 1 - 2,
        estimatedDuration: '3-5s',
        description: 'Auto-fixable errors and simple patterns',
      },
      'medium-complexity': {
        name: 'Medium Complexity Agent',
        agents: [],
        targetComplexity: 3 - 4,
        estimatedDuration: '6-8s',
        description: 'Pattern-based fixes and moderate refactoring',
      },
      'high-complexity': {
        name: 'High Complexity Agent',
        agents: [],
        targetComplexity: 5 - 7,
        estimatedDuration: '9-12s',
        description: 'Type safety and architectural improvements',
      },
    };

    // Distribute agents based on error complexity
    for (const [agentId, analysis] of agentWorkloads) {
      const avgComplexity = analysis.complexityPerError;

      if (avgComplexity <= 2) {
        optimizedBatches['quick-wins'].agents.push({ agentId, analysis });
      } else if (avgComplexity <= 4) {
        optimizedBatches['medium-complexity'].agents.push({
          agentId,
          analysis,
        });
      } else {
        optimizedBatches['high-complexity'].agents.push({ agentId, analysis });
      }
    }

    return optimizedBatches;
  }

  generateNewAgentConfiguration(optimizedBatches) {
    const newConfig = {
      version: '2.0.0',
      rebalancingApplied: true,
      rebalancingDate: new Date().toISOString(),
      totalAgents: Object.values(optimizedBatches).reduce(
        (sum, batch) => sum + batch.agents.length,
        0
      ),
      batches: optimizedBatches,
      executionStrategy: {
        parallel: ['quick-wins'],
        sequential: ['medium-complexity', 'high-complexity'],
        dependencies: {
          'medium-complexity': ['quick-wins'],
          'high-complexity': ['quick-wins', 'medium-complexity'],
        },
      },
    };

    return newConfig;
  }

  generateRecommendations(newAgentConfig) {
    const recommendations = [];

    // Analyze batch balance
    const batchSizes = Object.values(newAgentConfig.batches).map(
      b => b.agents.length
    );
    const maxBatchSize = Math.max(...batchSizes);
    const minBatchSize = Math.min(...batchSizes);

    if (maxBatchSize - minBatchSize > 2) {
      recommendations.push({
        type: 'rebalancing',
        priority: 'high',
        message: 'Consider redistributing agents for better workload balance',
      });
    }

    // Check for ready agents
    const totalReadyAgents = Object.values(newAgentConfig.batches).reduce(
      (sum, batch) => sum + batch.agents.filter(a => a.analysis.ready).length,
      0
    );

    if (totalReadyAgents < newAgentConfig.totalAgents * 0.6) {
      recommendations.push({
        type: 'preprocessing',
        priority: 'high',
        message: 'Run bulk preprocessing to increase ready agent count',
      });
    }

    // Efficiency recommendations
    recommendations.push({
      type: 'efficiency',
      priority: 'medium',
      message: 'Execute quick-wins agents first to unblock dependent agents',
    });

    return recommendations;
  }

  loadOriginalBatches() {
    // Placeholder for loading original batch configuration
    return [];
  }

  async saveRebalancedConfiguration(config) {
    const configPath = join(
      this.coordinationDir,
      'rebalanced-agent-config.json'
    );
    writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`✅ Rebalanced configuration saved to: ${configPath}`);
  }
}

// CLI interface
async function main() {
  const rebalancer = new SmartAgentRebalancer();

  try {
    console.log('🎯 Starting Smart Agent Rebalancing...\n');

    const results = await rebalancer.analyzeAndRebalance();

    console.log('\n📊 Rebalancing Results:');
    console.log('═'.repeat(40));

    // Print complexity analysis summary
    console.log('\n🔍 Complexity Analysis:');
    Object.entries(results.complexityAnalysis).forEach(
      ([agentId, analysis]) => {
        const status = analysis.ready ? '✅' : '❌';
        console.log(
          `  ${status} ${agentId}: ${analysis.errorCount} errors, complexity score: ${analysis.totalComplexity.toFixed(1)}`
        );
      }
    );

    console.log('\n⚖️  Optimized Batches:');
    // eslint-disable-next-line no-unused-vars
    Object.entries(results.optimizedBatches).forEach(([_, batch]) => {
      console.log(
        `  📦 ${batch.name}: ${batch.agents.length} agents (${batch.estimatedDuration})`
      );
      batch.agents.forEach(({ agentId }) => {
        console.log(`    - ${agentId}`);
      });
    });

    console.log('\n💡 Recommendations:');
    results.recommendations.forEach((rec) => {
      const priority =
        rec.priority === 'high'
          ? '🔴'
          : rec.priority === 'medium'
            ? '🟡'
            : '🟢';
      console.log(`  ${priority} ${rec.message}`);
    });

    // Save results
    await rebalancer.saveRebalancedConfiguration(results.newAgentConfig);

    console.log('\n🎉 Smart rebalancing complete!');
  } catch (error) {
    console.error('💥 Rebalancing failed:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { SmartAgentRebalancer };
