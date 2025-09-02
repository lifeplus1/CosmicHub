#!/usr/bin/env node
/**
 * Enhanced AI Agent Coordination Workflow
 *
 * Combines preprocessing, dynamic rebalancing, and intelligent error analysis
 * to maximize coordination efficiency and agent readiness rates.
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
    magenta: '\x1b[35m',
    bright: '\x1b[1m',
    reset: '\x1b[0m',
  };
  return `${colors[color] || ''}${text}${colors.reset}`;
};

class EnhancedCoordinationWorkflow {
  constructor() {
    this.coordinationDir = join(ROOT, 'ai-agent-coordination');
    this.metrics = {
      startTime: Date.now(),
      phases: [],
      improvements: {},
    };
  }

  async runEnhancedWorkflow() {
    console.log(
      colorize('🚀 ENHANCED AI AGENT COORDINATION WORKFLOW', 'bright')
    );
    console.log(colorize('═'.repeat(70), 'blue'));
    console.log(
      colorize(
        'Implementing advanced preprocessing, rebalancing, and optimization',
        'cyan'
      )
    );

    try {
      // Phase 1: Baseline Assessment
      const baseline = await this.runPhase('Baseline Assessment', () =>
        this.assessBaseline()
      );

      // Phase 2: Smart Preprocessing
      const preprocessing = await this.runPhase('Smart Preprocessing', () =>
        this.runSmartPreprocessing()
      );

      // Phase 3: Dynamic Rebalancing
      const rebalancing = await this.runPhase('Dynamic Rebalancing', () =>
        this.performDynamicRebalancing()
      );

      // Phase 4: Final Coordination
      const finalCoordination = await this.runPhase('Final Coordination', () =>
        this.runFinalCoordination()
      );

      // Phase 5: Performance Analysis
      const analysis = await this.runPhase('Performance Analysis', () =>
        this.analyzePerformanceGains()
      );

      this.printComprehensiveSummary({
        baseline,
        preprocessing,
        rebalancing,
        finalCoordination,
        analysis,
      });
    } catch (error) {
      console.error(colorize('💥 Workflow failed:', 'red'), error.message);
      process.exit(1);
    }
  }

  async runPhase(phaseName, phaseFunction) {
    const startTime = Date.now();
    console.log(colorize(`\n📊 Phase: ${phaseName}`, 'magenta'));
    console.log(colorize('─'.repeat(50), 'blue'));

    try {
      const result = await phaseFunction();
      const duration = Date.now() - startTime;

      this.metrics.phases.push({
        name: phaseName,
        duration,
        success: true,
        result,
      });

      console.log(
        colorize(
          `✅ ${phaseName} completed in ${(duration / 1000).toFixed(2)}s`,
          'green'
        )
      );
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.metrics.phases.push({
        name: phaseName,
        duration,
        success: false,
        error: error.message,
      });

      console.log(
        colorize(
          `❌ ${phaseName} failed in ${(duration / 1000).toFixed(2)}s: ${error.message}`,
          'red'
        )
      );
      throw error;
    }
  }

  async assessBaseline() {
    console.log(
      colorize('  🔍 Analyzing current coordination state...', 'yellow')
    );

    const result = await this.runCommand('npm', [
      'run',
      'lint:ai-coord-enhanced',
    ]);

    // Parse baseline metrics from output
    const efficiencyMatch = result.output.match(
      /Coordination Efficiency:\s*([\d.]+)%/
    );
    const readyMatch = result.output.match(/Ready for Execution:\s*(\d+)/);
    const totalMatch = result.output.match(/Total AI Agents:\s*(\d+)/);

    const baseline = {
      efficiency: efficiencyMatch ? parseFloat(efficiencyMatch[1]) : 0,
      readyAgents: readyMatch ? parseInt(readyMatch[1]) : 0,
      totalAgents: totalMatch ? parseInt(totalMatch[1]) : 7,
      readyRate: 0,
    };

    baseline.readyRate =
      baseline.totalAgents > 0
        ? (baseline.readyAgents / baseline.totalAgents) * 100
        : 0;

    console.log(
      colorize(`    • Current Efficiency: ${baseline.efficiency}%`, 'blue')
    );
    console.log(
      colorize(
        `    • Ready Agents: ${baseline.readyAgents}/${baseline.totalAgents} (${baseline.readyRate.toFixed(1)}%)`,
        'blue'
      )
    );

    return baseline;
  }

  async runSmartPreprocessing() {
    console.log(colorize('  🛠️  Applying intelligent bulk fixes...', 'yellow'));

    // Quick auto-fixable issues
    const eslintResult = await this.runCommand('npx', [
      'eslint',
      '--fix',
      '--ext',
      '.ts,.tsx',
      '--rule',
      'no-unused-vars: off', // Focus on fixable issues
      'apps/astro/src/components',
      'apps/astro/src/features',
      'packages/ui/src',
    ]);

    // Count fixes applied
    const fixCount = (eslintResult.output.match(/✨/g) || []).length;

    console.log(colorize(`    • Applied ${fixCount} automatic fixes`, 'green'));

    return {
      success: eslintResult.success,
      fixesApplied: fixCount,
      focusAreas: ['components', 'features', 'ui-package'],
    };
  }

  async performDynamicRebalancing() {
    console.log(colorize('  ⚖️  Analyzing workload distribution...', 'yellow'));

    // Read current agent analyses to understand workload imbalance
    const agentFiles = [
      'agent-1-astro-components-analysis.json',
      'agent-2-astro-features-analysis.json',
      'agent-3-astro-pages-context-analysis.json',
      'agent-4-astro-services-types-analysis.json',
      'agent-5-ui-package-analysis.json',
      'agent-6-config-package-analysis.json',
      'agent-7-apps-small-packages-analysis.json',
    ];

    const workloadAnalysis = [];

    for (const file of agentFiles) {
      const filePath = join(this.coordinationDir, file);
      if (existsSync(filePath)) {
        try {
          const analysis = JSON.parse(readFileSync(filePath, 'utf8'));
          workloadAnalysis.push({
            agent: analysis.agent,
            duration: analysis.duration || 0,
            errorCount: analysis.errorCount || 0,
            ready: analysis.readyForExecution || false,
          });
        } catch (error) {
          console.log(colorize(`    ⚠️  Could not read ${file}`, 'yellow'));
        }
      }
    }

    // Calculate workload metrics
    const durations = workloadAnalysis.map(a => a.duration);
    const maxDuration = Math.max(...durations);
    const minDuration = Math.min(...durations);
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const workloadVariance = maxDuration - minDuration;

    console.log(
      colorize(
        `    • Workload variance: ${(workloadVariance / 1000).toFixed(2)}s`,
        'blue'
      )
    );
    console.log(
      colorize(
        `    • Average duration: ${(avgDuration / 1000).toFixed(2)}s`,
        'blue'
      )
    );

    return {
      workloadVariance,
      avgDuration,
      balanceScore: Math.max(0, 100 - (workloadVariance / avgDuration) * 100),
      recommendation:
        workloadVariance > 3000
          ? 'Rebalancing needed'
          : 'Acceptable distribution',
    };
  }

  async runFinalCoordination() {
    console.log(colorize('  🎯 Running optimized coordination...', 'yellow'));

    const result = await this.runCommand('npm', [
      'run',
      'lint:ai-coord-enhanced',
    ]);

    // Parse final metrics
    const efficiencyMatch = result.output.match(
      /Coordination Efficiency:\s*([\d.]+)%/
    );
    const readyMatch = result.output.match(/Ready for Execution:\s*(\d+)/);
    const scoreMatch = result.output.match(
      /Overall Performance Score:\s*([\d.]+)%/
    );

    // Display the detailed agent results from coordination
    console.log(colorize('  📋 Agent Status Details:', 'cyan'));
    this.displayAgentResults(result.output);

    return {
      efficiency: efficiencyMatch ? parseFloat(efficiencyMatch[1]) : 0,
      readyAgents: readyMatch ? parseInt(readyMatch[1]) : 0,
      performanceScore: scoreMatch ? parseFloat(scoreMatch[1]) : 0,
      output: result.output,
    };
  }

  displayAgentResults(coordinationOutput) {
    // Extract agent readiness information from coordination output
    const agentSectionMatch = coordinationOutput.match(
      /🤖 Agent Readiness Status:([\s\S]*?)(?=\n\n🚀|$)/
    );

    if (agentSectionMatch) {
      const agentSection = agentSectionMatch[1];
      const agentLines = agentSection
        .split('\n')
        .filter(line => line.trim().match(/^\d+\./));

      agentLines.forEach(line => {
        const cleanLine = line.trim();
        // Parse agent status: "1. AgentName: STATUS (duration) [RISK]"
        const match = cleanLine.match(
          /(\d+)\.\s+(.+?):\s+(READY|NEEDS WORK)\s+\((.+?)\)\s+\[(.+?)\]/
        );

        if (match) {
          const [, num, agentName, status, duration, risk] = match;
          const statusIcon = status === 'READY' ? '✅' : '❌';
          const riskColor =
            risk === 'HIGH' ? 'red' : risk === 'MEDIUM' ? 'yellow' : 'green';
          const statusColor = status === 'READY' ? 'green' : 'red';

          console.log(
            `    Agent ${num}/7: ${statusIcon} ${colorize(agentName, statusColor)} (${duration}) ${colorize(`[${risk}]`, riskColor)}`
          );
        }
      });
    } else {
      console.log(
        colorize(
          '    • Detailed agent status not found in coordination output',
          'yellow'
        )
      );
    }

    // Extract and display execution recommendations
    this.displayExecutionSequence(coordinationOutput);
  }

  displayExecutionSequence(coordinationOutput) {
    // Look for execution recommendations in the output
    const executionMatch = coordinationOutput.match(
      /📅 Suggested Execution Sequence:([\s\S]*?)(?=\n\n🔗|$)/
    );

    if (executionMatch) {
      console.log(colorize('\n  📅 Suggested Execution Sequence:', 'cyan'));
      const executionSection = executionMatch[1];
      const lines = executionSection
        .split('\n')
        .filter(line => line.trim().length > 0);

      lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.includes('STAGE')) {
          console.log(colorize(`    ${trimmed}`, 'yellow'));
        } else if (
          trimmed.startsWith('•') ||
          trimmed.startsWith('✅') ||
          trimmed.startsWith('❌')
        ) {
          console.log(`      ${trimmed}`);
        }
      });
    }

    // Extract and display dependencies
    const depsMatch = coordinationOutput.match(
      /🔗 Critical Dependencies:([\s\S]*?)(?=\n\n📁|$)/
    );

    if (depsMatch) {
      console.log(colorize('\n  🔗 Critical Dependencies:', 'cyan'));
      const depsSection = depsMatch[1];
      const lines = depsSection
        .split('\n')
        .filter(line => line.trim().length > 0 && line.includes('•'));

      lines.forEach(line => {
        console.log(`    ${line.trim()}`);
      });
    }
  }

  showAgentReadinessFromFiles() {
    const coordinationDir = join(ROOT, 'ai-agent-coordination');

    // Define agents with their stage and dependency information
    const agentConfig = [
      {
        file: 'agent-1-astro-components-analysis.json',
        number: 1,
        stage: 'STAGE1',
        dependencies: [],
        name: 'ComponentFixAgent',
      },
      {
        file: 'agent-2-astro-features-analysis.json',
        number: 2,
        stage: 'STAGE1',
        dependencies: ['agent-1-astro-components'],
        name: 'FeatureFixAgent',
      },
      {
        file: 'agent-3-astro-pages-context-analysis.json',
        number: 3,
        stage: 'STAGE2',
        dependencies: ['agent-1-astro-components'],
        name: 'PagesContextAgent',
      },
      {
        file: 'agent-4-astro-services-types-analysis.json',
        number: 4,
        stage: 'STAGE1',
        dependencies: [],
        name: 'ServicesTypesAgent',
      },
      {
        file: 'agent-5-ui-package-analysis.json',
        number: 5,
        stage: 'STAGE1',
        dependencies: [],
        name: 'UIPackageAgent',
      },
      {
        file: 'agent-6-config-package-analysis.json',
        number: 6,
        stage: 'STAGE1',
        dependencies: [],
        name: 'ConfigPackageAgent',
      },
      {
        file: 'agent-7-apps-small-packages-analysis.json',
        number: 7,
        stage: 'STAGE2',
        dependencies: [
          'agent-4-astro-services-types',
          'agent-5-ui-package',
          'agent-6-config-package',
        ],
        name: 'AppsPackagesAgent',
      },
    ];

    let readyCount = 0;
    let totalCount = 0;
    const stageGroups = { STAGE1: [], STAGE2: [] };

    agentConfig.forEach(config => {
      const filePath = join(coordinationDir, config.file);
      if (existsSync(filePath)) {
        try {
          const analysis = JSON.parse(readFileSync(filePath, 'utf8'));
          totalCount++;

          const ready = analysis.readyForExecution || false;
          const errorCount = analysis.errorCount || 0;
          const duration = analysis.duration
            ? (analysis.duration / 1000).toFixed(2)
            : 'N/A';
          const conflictRisk = analysis.conflictRisk || 'unknown';

          const agentInfo = {
            ...config,
            ready,
            errorCount,
            duration,
            conflictRisk,
          };

          stageGroups[config.stage].push(agentInfo);

          if (ready) {
            readyCount++;
          }
        } catch (error) {
          console.log(
            colorize(`  ⚠️  ${config.name}: Could not read analysis`, 'yellow')
          );
        }
      }
    });

    // Display by stages
    Object.entries(stageGroups).forEach(([stage, agents]) => {
      if (agents.length > 0) {
        console.log(colorize(`\n  📋 ${stage}:`, 'yellow'));
        agents.forEach(agent => {
          const statusIcon = agent.ready ? '✅' : '❌';
          const statusColor = agent.ready ? 'green' : 'red';
          const riskColor =
            agent.conflictRisk === 'high'
              ? 'red'
              : agent.conflictRisk === 'medium'
                ? 'yellow'
                : 'green';

          const depInfo =
            agent.dependencies.length > 0
              ? ` (depends: ${agent.dependencies.join(', ')})`
              : '';

          console.log(
            `    Agent ${agent.number}/7: ${statusIcon} ${colorize(agent.name, statusColor)} - ${agent.errorCount} errors, ${agent.duration}s ${colorize(`[${agent.conflictRisk}]`, riskColor)}${depInfo}`
          );
        });
      }
    });

    console.log(
      colorize(
        `\n  📊 Summary: ${readyCount}/${totalCount} agents ready (${((readyCount / totalCount) * 100).toFixed(1)}%)`,
        readyCount === totalCount ? 'green' : 'yellow'
      )
    );

    // Show execution recommendations
    console.log(colorize('\n  🚀 Execution Recommendations:', 'cyan'));
    console.log(
      colorize('    STAGE1 (Parallel execution possible):', 'yellow')
    );
    stageGroups.STAGE1.forEach(agent => {
      const status = agent.ready ? 'DEPLOY' : 'NEEDS WORK';
      const color = agent.ready ? 'green' : 'red';
      console.log(`    • ${colorize(status, color)}: ${agent.name}`);
    });

    if (stageGroups.STAGE2.length > 0) {
      console.log(colorize('    STAGE2 (After STAGE1 completion):', 'yellow'));
      stageGroups.STAGE2.forEach(agent => {
        const status = agent.ready ? 'DEPLOY' : 'NEEDS WORK';
        const color = agent.ready ? 'green' : 'red';
        console.log(`    • ${colorize(status, color)}: ${agent.name}`);
      });
    }
  }

  async analyzePerformanceGains() {
    console.log(
      colorize('  📈 Calculating performance improvements...', 'yellow')
    );

    const baseline = this.metrics.phases.find(
      p => p.name === 'Baseline Assessment'
    )?.result;
    const final = this.metrics.phases.find(
      p => p.name === 'Final Coordination'
    )?.result;

    if (baseline && final) {
      const gains = {
        efficiencyGain: final.efficiency - baseline.efficiency,
        readyAgentGain: final.readyAgents - baseline.readyAgents,
        readyRateGain: (final.readyAgents / 7) * 100 - baseline.readyRate,
        performanceScoreImprovement: final.performanceScore,
      };

      console.log(
        colorize(
          `    • Efficiency improved by: +${gains.efficiencyGain.toFixed(1)}%`,
          gains.efficiencyGain > 0 ? 'green' : 'red'
        )
      );
      console.log(
        colorize(
          `    • Ready agents increased by: +${gains.readyAgentGain}`,
          gains.readyAgentGain > 0 ? 'green' : 'red'
        )
      );
      console.log(
        colorize(
          `    • Ready rate improved by: +${gains.readyRateGain.toFixed(1)}%`,
          gains.readyRateGain > 0 ? 'green' : 'red'
        )
      );

      return gains;
    }

    return { efficiencyGain: 0, readyAgentGain: 0, readyRateGain: 0 };
  }

  async runCommand(command, args) {
    return new Promise((resolve, reject) => {
      const process = spawn(command, args, {
        cwd: ROOT,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let output = '';
      let errorOutput = '';

      process.stdout.on('data', data => {
        output += data.toString();
      });

      process.stderr.on('data', data => {
        errorOutput += data.toString();
      });

      process.on('close', code => {
        resolve({
          success: code === 0,
          output,
          error: errorOutput,
          exitCode: code,
        });
      });

      process.on('error', error => {
        reject(error);
      });
    });
  }

  printComprehensiveSummary(results) {
    const totalDuration = Date.now() - this.metrics.startTime;
    const { baseline, finalCoordination, analysis } = results;

    console.log(
      colorize('\n🎉 ENHANCED COORDINATION WORKFLOW COMPLETE', 'bright')
    );
    console.log(colorize('═'.repeat(70), 'blue'));

    console.log(colorize('\n📊 Performance Improvements:', 'cyan'));
    console.log(
      colorize(
        `  • Workflow Duration: ${(totalDuration / 1000).toFixed(2)}s`,
        'blue'
      )
    );

    if (analysis) {
      console.log(
        colorize(
          `  • Efficiency Gain: ${analysis.efficiencyGain > 0 ? '+' : ''}${analysis.efficiencyGain.toFixed(1)}%`,
          analysis.efficiencyGain > 0 ? 'green' : 'red'
        )
      );
      console.log(
        colorize(
          `  • Ready Agents Gain: +${analysis.readyAgentGain}`,
          analysis.readyAgentGain > 0 ? 'green' : 'red'
        )
      );
      console.log(
        colorize(
          `  • Ready Rate Improvement: ${analysis.readyRateGain > 0 ? '+' : ''}${analysis.readyRateGain.toFixed(1)}%`,
          analysis.readyRateGain > 0 ? 'green' : 'red'
        )
      );
    }

    console.log(colorize('\n🎯 Final Metrics:', 'cyan'));
    if (baseline && finalCoordination) {
      console.log(
        colorize(
          `  • Before: ${baseline.efficiency}% efficiency, ${baseline.readyAgents}/${baseline.totalAgents} agents ready`,
          'blue'
        )
      );
      console.log(
        colorize(
          `  • After: ${finalCoordination.efficiency}% efficiency, ${finalCoordination.readyAgents}/7 agents ready`,
          'green'
        )
      );
      console.log(
        colorize(
          `  • Performance Score: ${finalCoordination.performanceScore}%`,
          finalCoordination.performanceScore >= 85 ? 'green' : 'yellow'
        )
      );
    }

    // Show detailed agent readiness information
    console.log(colorize('\n🤖 Agent Readiness Overview:', 'cyan'));
    this.showAgentReadinessFromFiles();

    console.log(colorize('\n🚀 Next Steps:', 'bright'));
    console.log(
      colorize('  1. Deploy ready agents: npm run lint:agent:agent-X', 'blue')
    );
    console.log(
      colorize('  2. Monitor coordination efficiency in production', 'blue')
    );
    console.log(
      colorize('  3. Iterate on workload balancing based on results', 'blue')
    );

    // Success criteria assessment
    const success =
      analysis && analysis.readyAgentGain > 0 && analysis.efficiencyGain >= 0;
    console.log(
      colorize(
        success
          ? '\n✅ Workflow SUCCESS: Significant improvements achieved!'
          : '\n⚠️  Workflow PARTIAL: Some improvements made',
        success ? 'green' : 'yellow'
      )
    );
  }
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const workflow = new EnhancedCoordinationWorkflow();
  workflow.runEnhancedWorkflow().catch(console.error);
}

export { EnhancedCoordinationWorkflow };
