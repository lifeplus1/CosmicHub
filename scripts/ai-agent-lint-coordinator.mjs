#!/usr/bin/env node
/**
 * AI Agent Lint Coordination System for CosmicHub
 * 
 * Orchestrates 6-7 optimized batches for parallel AI agent lint error resolution.
 * Each batch is designed for independent AI agent processing with conflict prevention.
 */

import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync, renameSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const COORDINATION_DIR = join(ROOT, 'ai-agent-coordination');

// Enhanced 6-7 batch configuration optimized for AI agents
const AI_AGENT_BATCHES = [
  {
    id: 'agent-1-astro-components',
    name: 'Astro Components',
    agent: 'ComponentFixAgent',
    priority: 3,
    targets: ['apps/astro/src/components'],
    estimatedFiles: 65,
    maxWarnings: 30,
    specialization: 'React component lint fixes',
    commonIssues: ['unused-vars', 'react-hooks', 'jsx-a11y'],
    dependencies: [],
    conflictRisk: 'low'
  },
  {
    id: 'agent-2-astro-features',
    name: 'Astro Features',
    agent: 'FeatureFixAgent',
    priority: 3,
    targets: ['apps/astro/src/features'],
    estimatedFiles: 25,
    maxWarnings: 15,
    specialization: 'Feature module lint fixes',
    commonIssues: ['unused-vars', 'no-explicit-any'],
    dependencies: ['agent-1-astro-components'],
    conflictRisk: 'low'
  },
  {
    id: 'agent-3-astro-pages-context',
    name: 'Astro Pages & Context',
    agent: 'PagesContextAgent',
    priority: 2,
    targets: ['apps/astro/src/pages', 'apps/astro/src/contexts', 'apps/astro/src/hooks'],
    estimatedFiles: 70,
    maxWarnings: 30,
    specialization: 'Page routing and context management fixes',
    commonIssues: ['prefer-nullish-coalescing', 'no-unsafe-assignment'],
    dependencies: ['agent-1-astro-components'],
    conflictRisk: 'medium'
  },
  {
    id: 'agent-4-astro-services-types',
    name: 'Astro Services & Types',
    agent: 'ServicesTypesAgent',
    priority: 1,
    targets: ['apps/astro/src/services', 'apps/astro/src/types', 'apps/astro/src/config'],
    estimatedFiles: 65,
    maxWarnings: 25,
    specialization: 'Service layer and type definitions',
    commonIssues: ['no-explicit-any', 'strict-boolean-expressions'],
    dependencies: [],
    conflictRisk: 'high'
  },
  {
    id: 'agent-5-ui-package',
    name: 'UI Package',
    agent: 'UIPackageAgent',
    priority: 2,
    targets: ['packages/ui/src'],
    estimatedFiles: 54,
    maxWarnings: 25,
    specialization: 'Shared UI component fixes',
    commonIssues: ['unused-vars', 'react-hooks', 'jsx-a11y'],
    dependencies: [],
    conflictRisk: 'high'
  },
  {
    id: 'agent-6-config-package',
    name: 'Config Package',
    agent: 'ConfigPackageAgent',
    priority: 1,
    targets: ['packages/config/src'],
    estimatedFiles: 48,
    maxWarnings: 20,
    specialization: 'Configuration and build setup',
    commonIssues: ['no-explicit-any', 'unused-vars'],
    dependencies: [],
    conflictRisk: 'high'
  },
  {
    id: 'agent-7-apps-small-packages',
    name: 'Apps & Small Packages',
    agent: 'AppsPackagesAgent',
    priority: 4,
    targets: [
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
    estimatedFiles: 79,
    maxWarnings: 35,
    specialization: 'Secondary apps and utility packages',
    commonIssues: ['no-unsafe-assignment', 'unused-vars', 'no-explicit-any'],
    dependencies: ['agent-4-astro-services-types', 'agent-5-ui-package', 'agent-6-config-package'],
    conflictRisk: 'medium'
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
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

class AIAgentCoordinator {
  constructor() {
    this.state = {
      completed: new Set(),
      inProgress: new Set(),
      failed: new Set(),
      results: new Map(),
      conflicts: new Map()
    };
    this.ensureCoordinationDirectory();
  }

  ensureCoordinationDirectory() {
    if (!existsSync(COORDINATION_DIR)) {
      mkdirSync(COORDINATION_DIR, { recursive: true });
    }
  }

  async generateAgentInstructions() {
    console.log(colorize('\n🤖 Generating AI Agent Instructions', 'bright'));
    console.log(colorize('═'.repeat(50), 'blue'));

    for (const batch of AI_AGENT_BATCHES) {
      const instructions = this.createAgentInstructions(batch);
      const filePath = join(COORDINATION_DIR, `${batch.id}-instructions.md`);
      writeFileSync(filePath, instructions);
      console.log(colorize(`✅ Generated instructions for ${batch.agent}`, 'green'));
    }

    // Create coordination manifest
    const manifest = this.createCoordinationManifest();
    writeFileSync(join(COORDINATION_DIR, 'coordination-manifest.json'), JSON.stringify(manifest, null, 2));
    console.log(colorize(`✅ Created coordination manifest`, 'green'));
  }

  createAgentInstructions(batch) {
    return `# ${batch.agent} - Lint Fix Instructions

## Mission
Fix all ESLint errors and warnings in: **${batch.name}**

## Target Files
${batch.targets.map(target => `- \`${target}\``).join('\n')}

## Specialization
${batch.specialization}

## Common Issues to Fix
${batch.commonIssues.map(issue => `- \`${issue}\``).join('\n')}

## Performance Targets
- **Estimated Files**: ~${batch.estimatedFiles}
- **Max Warnings**: ${batch.maxWarnings}
- **Priority Level**: ${batch.priority}/5
- **Conflict Risk**: ${batch.conflictRisk}

## Dependencies
${batch.dependencies.length > 0 
  ? batch.dependencies.map(dep => `- Wait for completion of: \`${dep}\``).join('\n')
  : '- None (can start immediately)'
}

## Pre-Execution Checklist
1. [ ] Check coordination manifest for conflicts
2. [ ] Run batch-specific lint analysis: \`npm run lint:agent:${batch.id}\`
3. [ ] Review error patterns in coordination directory
4. [ ] Verify dependencies are complete

## Execution Commands

### Analysis Phase
\`\`\`bash
# Run targeted lint analysis (OVERWRITES existing analysis file)
npx eslint ${batch.targets.join(' ')} ${EXTENSIONS} ${ESLINT_CONFIG} ${IGNORE_PATTERNS} --max-warnings=${batch.maxWarnings} --format json > ai-agent-coordination/${batch.id}-analysis.json

# Generate fix suggestions (temporary file - will be cleaned up)  
npx eslint ${batch.targets.join(' ')} ${EXTENSIONS} ${ESLINT_CONFIG} ${IGNORE_PATTERNS} --fix-dry-run --format json > /tmp/${batch.id}-fixes-temp.json
\`\`\`

### Fix Phase
\`\`\`bash
# Apply automatic fixes
npx eslint ${batch.targets.join(' ')} ${EXTENSIONS} ${ESLINT_CONFIG} ${IGNORE_PATTERNS} --fix

# Verify fixes (use standard analysis filename)
npm run lint:agent:${batch.id}
\`\`\`

## Success Criteria
- [ ] Zero ESLint errors in target files
- [ ] Warnings under ${batch.maxWarnings} limit
- [ ] No new TypeScript compilation errors
- [ ] No broken imports or dependencies
- [ ] All tests pass in affected areas

## Conflict Prevention
- Update \`ai-agent-coordination/${batch.id}-status.json\` during execution
- Check for conflicts before making cross-file changes
- Coordinate with dependent agents: ${batch.dependencies.join(', ') || 'None'}

## Completion Report
Create \`ai-agent-coordination/${batch.id}-completion.json\` with:
- Files modified
- Errors fixed
- Warnings remaining
- Any conflicts encountered
- Recommendations for dependent agents

---
**Generated**: ${new Date().toISOString()}
**Coordination ID**: ${batch.id}
`;
  }

  createCoordinationManifest() {
    return {
      version: '1.0.0',
      generated: new Date().toISOString(),
      totalBatches: AI_AGENT_BATCHES.length,
      estimatedFiles: AI_AGENT_BATCHES.reduce((sum, batch) => sum + batch.estimatedFiles, 0),
      executionOrder: this.calculateExecutionOrder(),
      conflictMatrix: this.generateConflictMatrix(),
      batches: AI_AGENT_BATCHES.map(batch => ({
        id: batch.id,
        agent: batch.agent,
        name: batch.name,
        priority: batch.priority,
        estimatedFiles: batch.estimatedFiles,
        dependencies: batch.dependencies,
        conflictRisk: batch.conflictRisk,
        targets: batch.targets
      })),
      coordinationRules: {
        'high-conflict-agents': ['agent-4-astro-services-types', 'agent-5-ui-package', 'agent-6-config-package'],
        'sequential-execution': ['agent-4-astro-services-types', 'agent-5-ui-package'],
        'parallel-safe': ['agent-1-astro-components', 'agent-2-astro-features'],
        'final-stage': ['agent-7-apps-small-packages']
      }
    };
  }

  calculateExecutionOrder() {
    // OPTIMIZED AGGRESSIVE PARALLEL APPROACH
    // Maximizes parallelism for 5 agents simultaneously
    
    // Stage 1: Independent packages + low-risk astro components (5 parallel)
    // - Agents 4,5,6 are completely independent packages
    // - Agents 1,2 have low conflict risk for lint-only changes
    const stage1 = [
      'agent-4-astro-services-types',    // Independent: services/types/config
      'agent-5-ui-package',             // Independent: shared UI components  
      'agent-6-config-package',         // Independent: configuration
      'agent-1-astro-components',       // Low risk: astro components
      'agent-2-astro-features'          // Low risk: astro features
    ];
    
    // Stage 2: Dependent agents that need Stage 1 foundations (2 parallel)
    // - Agent 3 depends on Agent 1 (pages depend on components)
    // - Agent 7 depends on Agents 4,5,6 (apps depend on packages)
    const stage2 = [
      'agent-3-astro-pages-context',    // Depends on: agent-1 (components)
      'agent-7-apps-small-packages'     // Depends on: agent-4,5,6 (packages)
    ];

    return {
      stage1,
      stage2
    };
  }

  generateConflictMatrix() {
    const matrix = {};
    
    AI_AGENT_BATCHES.forEach(batchA => {
      matrix[batchA.id] = {};
      AI_AGENT_BATCHES.forEach(batchB => {
        if (batchA.id === batchB.id) {
          matrix[batchA.id][batchB.id] = 'self';
        } else if (batchA.dependencies.includes(batchB.id) || batchB.dependencies.includes(batchA.id)) {
          matrix[batchA.id][batchB.id] = 'dependent';
        } else if (this.hasSharedTargets(batchA, batchB)) {
          matrix[batchA.id][batchB.id] = 'conflict';
        } else {
          matrix[batchA.id][batchB.id] = 'safe';
        }
      });
    });

    return matrix;
  }

  hasSharedTargets(batchA, batchB) {
    return batchA.targets.some(targetA => 
      batchB.targets.some(targetB => 
        targetA === targetB || targetA.includes(targetB) || targetB.includes(targetA)
      )
    );
  }

  async runCoordinatedAnalysis() {
    console.log(colorize('\n🔍 Running Coordinated Batch Analysis', 'bright'));
    console.log(colorize('Optimized 7-batch configuration for AI agents', 'blue'));
    console.log(colorize('═'.repeat(60), 'blue'));

    // Display execution plan
    console.log(colorize('\n📋 AI Agent Execution Plan:', 'bright'));
    const executionOrder = this.calculateExecutionOrder();
    
    Object.entries(executionOrder).forEach(([stage, agents]) => {
      console.log(colorize(`\n${stage.toUpperCase()}:`, 'cyan'));
      agents.forEach(agentId => {
        const batch = AI_AGENT_BATCHES.find(b => b.id === agentId);
        console.log(colorize(`  • ${batch.agent}: ${batch.name} (~${batch.estimatedFiles} files)`, 'blue'));
      });
    });

    const totalFiles = AI_AGENT_BATCHES.reduce((sum, batch) => sum + batch.estimatedFiles, 0);
    console.log(colorize(`\nTotal files: ${totalFiles} across ${AI_AGENT_BATCHES.length} agents`, 'green'));
    console.log(colorize('Starting coordinated analysis...\n', 'green'));

    const startTime = Date.now();
    
    try {
      // Run all batch analyses in parallel (for speed)
      const analysisPromises = AI_AGENT_BATCHES.map((batch, index) => this.runBatchAnalysis(batch, index));
      const results = await Promise.all(analysisPromises);
      
      const totalTime = Date.now() - startTime;
      console.log(colorize(`\n⏱️  Total analysis time: ${(totalTime / 1000).toFixed(2)}s`, 'green'));
      
      this.printCoordinatedSummary(results);
      
      return results;
      
    } catch (error) {
      console.error(colorize('\n💥 Fatal error during coordinated analysis:', 'red'), error);
      process.exit(1);
    }
  }

  async runBatchAnalysis(batch, index) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      // Build exact command to match package.json lint scripts
      let cmd;
      if (batch.id === 'agent-1-astro-components') {
        cmd = 'npx eslint apps/astro/src/components --ext .ts,.tsx --max-warnings=30 --config eslint.config.js';
      } else if (batch.id === 'agent-2-astro-features') {
        cmd = 'npx eslint apps/astro/src/features --ext .ts,.tsx --max-warnings=15 --config eslint.config.js';
      } else if (batch.id === 'agent-3-astro-pages-context') {
        cmd = 'npx eslint apps/astro/src/pages apps/astro/src/contexts apps/astro/src/hooks --ext .ts,.tsx --max-warnings=30 --config eslint.config.js';
      } else if (batch.id === 'agent-4-astro-services-types') {
        cmd = 'npx eslint apps/astro/src/services apps/astro/src/types apps/astro/src/config --ext .ts,.tsx --max-warnings=25 --config eslint.config.js';
      } else if (batch.id === 'agent-5-ui-package') {
        cmd = 'npx eslint packages/ui/src --ext .ts,.tsx --max-warnings=25 --config eslint.config.js';
      } else if (batch.id === 'agent-6-config-package') {
        cmd = 'npx eslint packages/config/src --ext .ts,.tsx --max-warnings=20 --config eslint.config.js';
      } else if (batch.id === 'agent-7-apps-small-packages') {
        cmd = 'npx eslint apps/healwave/src apps/mobile/src packages/auth/src packages/frequency/src packages/hooks/src packages/integrations/src packages/pwa/src packages/storage/src packages/subscriptions/src packages/types/src --ext .ts,.tsx --max-warnings=35 --config eslint.config.js';
      } else {
        cmd = `npx eslint ${batch.targets.join(' ')} ${EXTENSIONS} --max-warnings=${batch.maxWarnings} ${ESLINT_CONFIG} ${IGNORE_PATTERNS}`;
      }
      
      console.log(colorize(`🤖 Agent ${index + 1}/7: ${batch.agent}`, 'cyan'));
      console.log(colorize(`   Mission: ${batch.specialization}`, 'blue'));
      console.log(colorize(`   Targets: ${batch.targets.length} directories (~${batch.estimatedFiles} files)`, 'blue'));
      console.log(colorize(`   Priority: ${batch.priority}/5 | Conflict Risk: ${batch.conflictRisk}`, 'gray'));
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
        
        // Parse actual errors and warnings from output
        let errorCount = 0;
        let warningCount = 0;
        let hasLintOutput = false;
        
        // Check both stdout and stderr for lint problems (ESLint can output to either)
        const allOutput = (stdout || '') + '\n' + (stderr || '');
        if (allOutput && allOutput.includes('✖')) {
          hasLintOutput = true;
          // Extract error/warning counts from output
          const problemMatch = allOutput.match(/✖ (\d+) problems? \((\d+) errors?, (\d+) warnings?\)/);
          if (problemMatch) {
            errorCount = parseInt(problemMatch[2], 10);
            warningCount = parseInt(problemMatch[3], 10);
          }
        }
        
        // Agent is only successful if:
        // 1. Exit code is 0 AND
        // 2. No errors AND  
        // 3. Warnings are under the agent's limit
        const actualSuccess = code === 0 && errorCount === 0 && (warningCount <= batch.maxWarnings);
        
        const result = {
          batch,
          index: index + 1,
          code,
          stdout,
          stderr,
          duration,
          errorCount,
          warningCount,
          hasLintOutput,
          success: actualSuccess
        };
        
        // Save analysis for AI agent use
        this.saveAgentAnalysis(batch, result);
        
        // Print result immediately
        this.printBatchResult(result);
        resolve(result);
      });
    });
  }

  saveAgentAnalysis(batch, result) {
    const analysis = {
      agentId: batch.id,
      agent: batch.agent,
      timestamp: new Date().toISOString(),
      success: result.success,
      duration: result.duration,
      targets: batch.targets,
      estimatedFiles: batch.estimatedFiles,
      maxWarnings: batch.maxWarnings,
      specialization: batch.specialization,
      commonIssues: batch.commonIssues,
      dependencies: batch.dependencies,
      conflictRisk: batch.conflictRisk,
      lintOutput: result.stderr, // ESLint outputs to stderr
      errors: result.stdout, // Command output/logs to stdout
      exitCode: result.code,
      errorCount: result.errorCount || 0,
      warningCount: result.warningCount || 0,
      hasLintOutput: result.hasLintOutput || false,
      readyForExecution: result.success
    };

    // ALWAYS use consistent filename - atomic overwrite to prevent locking issues
    const analysisFile = join(COORDINATION_DIR, `${batch.id}-analysis.json`);
    const tempFile = `${analysisFile}.tmp`;
    
    try {
      // Write to temp file first, then atomically rename
      writeFileSync(tempFile, JSON.stringify(analysis, null, 2));
      
      // Atomic rename prevents file locking issues
      if (existsSync(analysisFile)) {
        unlinkSync(analysisFile);
      }
      renameSync(tempFile, analysisFile);
      
    } catch (error) {
      // Cleanup temp file if write failed
      if (existsSync(tempFile)) {
        unlinkSync(tempFile);
      }
      throw error;
    }
    
    console.log(colorize(`📊 Updated analysis: ${analysisFile}`, 'gray'));
  }

  printBatchResult(result) {
    const { batch, index, code, stdout, stderr, duration, success } = result;
    const durationSec = (duration / 1000).toFixed(2);
    
    console.log(colorize(`\n🤖 Agent ${index} Results: ${batch.agent}`, 'bright'));
    console.log(colorize(`⏱️  Duration: ${durationSec}s`, 'blue'));
    
    if (success) {
      console.log(colorize('✅ Status: READY FOR EXECUTION', 'green'));
    } else {
      console.log(colorize(`❌ Status: NEEDS ATTENTION (exit code ${code})`, 'red'));
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
      const lines = stdout.trim().split('\n').slice(0, 3);
      if (lines.length > 0) {
        console.log(colorize('📝 Sample issues:', 'blue'));
        lines.forEach(line => {
          if (line.trim()) {
            console.log(`   ${line.substring(0, 120)}${line.length > 120 ? '...' : ''}`);
          }
        });
      }
    }
    
    console.log(colorize('─'.repeat(80), 'blue'));
  }

  printCoordinatedSummary(results) {
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0) / 1000;
    const maxDuration = Math.max(...results.map(r => r.duration)) / 1000;
    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;
    
    console.log(colorize('\n🎯 AI AGENT COORDINATION SUMMARY', 'bright'));
    console.log(colorize('═'.repeat(60), 'blue'));
    
    console.log(colorize(`🤖 Total AI Agents: ${results.length}`, 'blue'));
    console.log(colorize(`✅ Ready for Execution: ${successful}`, successful === results.length ? 'green' : 'yellow'));
    console.log(colorize(`❌ Need Attention: ${failed}`, failed === 0 ? 'blue' : 'red'));
    
    console.log(colorize(`⏱️  Total Analysis Time: ${totalDuration.toFixed(2)}s`, 'blue'));
    console.log(colorize(`⚡ Max Agent Duration: ${maxDuration.toFixed(2)}s`, 'blue'));
    console.log(colorize(`🚀 Coordination Efficiency: ${((totalDuration / maxDuration) * 100 / results.length).toFixed(1)}%`, 'cyan'));
    
    // Show agent readiness
    console.log(colorize('\n🤖 Agent Readiness Status:', 'bright'));
    results.forEach((result, i) => {
      const status = result.success ? colorize('READY', 'green') : colorize('NEEDS WORK', 'red');
      const duration = (result.duration / 1000).toFixed(2);
      const risk = colorize(`[${result.batch.conflictRisk.toUpperCase()}]`, 
        result.batch.conflictRisk === 'high' ? 'red' : 
        result.batch.conflictRisk === 'medium' ? 'yellow' : 'green');
      console.log(`   ${i + 1}. ${result.batch.agent}: ${status} (${duration}s) ${risk}`);
    });

    // Execution recommendations
    console.log(colorize('\n🚀 EXECUTION RECOMMENDATIONS:', 'bright'));
    const executionOrder = this.calculateExecutionOrder();
    
    console.log(colorize('\n📅 Suggested Execution Sequence:', 'cyan'));
    Object.entries(executionOrder).forEach(([stage, agentIds]) => {
      console.log(colorize(`${stage.toUpperCase()}:`, 'yellow'));
      agentIds.forEach(agentId => {
        const batch = AI_AGENT_BATCHES.find(b => b.id === agentId);
        const result = results.find(r => r.batch.id === agentId);
        const status = result.success ? '✅' : '❌';
        console.log(`   ${status} ${batch.agent} (${batch.conflictRisk} risk)`);
      });
    });

    // Add dependency clarification
    console.log(colorize('\n🔗 Critical Dependencies:', 'cyan'));
    console.log('   • Agent 3 (PagesContextAgent) depends on Agent 1 (ComponentFixAgent)');
    console.log('     → Pages/contexts use components, so components must be fixed first');
    console.log('   • Agent 7 (AppsPackagesAgent) depends on Agents 4,5,6 (Services/UI/Config)');
    console.log('     → Apps consume shared packages, so packages must be stable first');

    console.log(colorize(`\n📁 Coordination files created in: ${COORDINATION_DIR}`, 'cyan'));
    console.log(colorize(`📋 Instructions and analysis ready for AI agents`, 'green'));
    
    if (failed === 0) {
      console.log(colorize('\n🎉 All agents ready for coordinated execution!', 'green'));
    } else {
      console.log(colorize(`\n⚠️  ${failed} agent(s) need preliminary fixes before coordination.`, 'yellow'));
    }
  }
}

// CLI support and package.json integration
async function main() {
  console.log(colorize('🤖 AI Agent Lint Coordination System', 'bright'));
  console.log(colorize('Optimized 7-batch configuration for parallel processing', 'blue'));
  console.log(colorize('═'.repeat(60), 'blue'));
  
  const coordinator = new AIAgentCoordinator();
  
  // Generate instructions for AI agents
  await coordinator.generateAgentInstructions();
  
  // Run coordinated analysis
  await coordinator.runCoordinatedAnalysis();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(colorize('💥 Coordination system error:', 'red'), error);
    process.exit(1);
  });
}

export { AIAgentCoordinator, AI_AGENT_BATCHES };
