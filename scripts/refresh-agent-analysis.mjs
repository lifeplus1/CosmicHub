#!/usr/bin/env node
/**
 * Refresh Agent Analysis Tool
 * Updates specific agent analysis files after manual fixes
 */

import { spawn } from 'node:child_process';
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const COORDINATION_DIR = join(ROOT, 'ai-agent-coordination');

// Agent configurations matching the main coordinator
const AGENT_CONFIGS = {
  'agent-1-astro-components': {
    command: 'npx eslint apps/astro/src/components --ext .ts,.tsx --max-warnings=30 --config eslint.config.js',
    agent: 'ComponentFixAgent',
    targets: ['apps/astro/src/components'],
    maxWarnings: 30,
    specialization: 'React component lint fixes'
  },
  'agent-2-astro-features': {
    command: 'npx eslint apps/astro/src/features --ext .ts,.tsx --max-warnings=15 --config eslint.config.js',
    agent: 'FeatureFixAgent', 
    targets: ['apps/astro/src/features'],
    maxWarnings: 15,
    specialization: 'Feature module lint fixes'
  },
  'agent-3-astro-pages-context': {
    command: 'npx eslint apps/astro/src/pages apps/astro/src/contexts apps/astro/src/hooks --ext .ts,.tsx --max-warnings=30 --config eslint.config.js',
    agent: 'PagesContextAgent',
    targets: ['apps/astro/src/pages', 'apps/astro/src/contexts', 'apps/astro/src/hooks'],
    maxWarnings: 30,
    specialization: 'Page routing and context management fixes'
  },
  'agent-4-astro-services-types': {
    command: 'npx eslint apps/astro/src/services apps/astro/src/types apps/astro/src/config --ext .ts,.tsx --max-warnings=25 --config eslint.config.js',
    agent: 'ServicesTypesAgent',
    targets: ['apps/astro/src/services', 'apps/astro/src/types', 'apps/astro/src/config'],
    maxWarnings: 25,
    specialization: 'Service layer and type definitions'
  },
  'agent-5-ui-package': {
    command: 'npx eslint packages/ui/src --ext .ts,.tsx --max-warnings=25 --config eslint.config.js',
    agent: 'UIPackageAgent',
    targets: ['packages/ui/src'],
    maxWarnings: 25,
    specialization: 'Shared UI component fixes'
  },
  'agent-6-config-package': {
    command: 'npx eslint packages/config/src --ext .ts,.tsx --max-warnings=20 --config eslint.config.js',
    agent: 'ConfigPackageAgent',
    targets: ['packages/config/src'],
    maxWarnings: 20,
    specialization: 'Configuration and build setup'
  },
  'agent-7-apps-small-packages': {
    command: 'npx eslint apps/healwave/src apps/mobile/src packages/auth/src packages/frequency/src packages/hooks/src packages/integrations/src packages/pwa/src packages/storage/src packages/subscriptions/src packages/types/src --ext .ts,.tsx --max-warnings=35 --config eslint.config.js',
    agent: 'AppsPackagesAgent',
    targets: ['apps/healwave/src', 'apps/mobile/src', 'packages/auth/src', 'packages/frequency/src', 'packages/hooks/src', 'packages/integrations/src', 'packages/pwa/src', 'packages/storage/src', 'packages/subscriptions/src', 'packages/types/src'],
    maxWarnings: 35,
    specialization: 'Secondary apps and utility packages'
  }
};

function colorize(text, color) {
  const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    bright: '\x1b[1m',
    reset: '\x1b[0m'
  };
  return `${colors[color] || ''}${text}${colors.reset}`;
}

async function refreshAgentAnalysis(agentId) {
  const config = AGENT_CONFIGS[agentId];
  if (!config) {
    console.error(colorize(`❌ Unknown agent: ${agentId}`, 'red'));
    console.log(colorize('Available agents:', 'blue'));
    Object.keys(AGENT_CONFIGS).forEach(id => {
      console.log(colorize(`  - ${id}`, 'cyan'));
    });
    process.exit(1);
  }

  console.log(colorize(`🔄 Refreshing analysis for: ${agentId}`, 'bright'));
  console.log(colorize(`🤖 Agent: ${config.agent}`, 'blue'));
  console.log(colorize(`📁 Targets: ${config.targets.join(', ')}`, 'blue'));
  console.log('');

  return new Promise((resolve) => {
    const startTime = Date.now();
    
    // Run ESLint with JSON output to update analysis file
    const analysisFile = join(COORDINATION_DIR, `${agentId}-analysis.json`);
    const cmdWithOutput = `${config.command} --format json > ${analysisFile}`;
    
    console.log(colorize('Running ESLint analysis...', 'cyan'));
    
    const child = spawn('bash', ['-c', cmdWithOutput], {
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
      
      // Parse the generated analysis file to get counts
      let errorCount = 0;
      let warningCount = 0;
      let success = false;
      
      if (existsSync(analysisFile)) {
        try {
          const analysisContent = require(analysisFile);
          if (Array.isArray(analysisContent)) {
            errorCount = analysisContent.reduce((sum, file) => sum + file.errorCount, 0);
            warningCount = analysisContent.reduce((sum, file) => sum + file.warningCount, 0);
          }
        } catch (err) {
          // Empty file means no issues
          errorCount = 0;
          warningCount = 0;
        }
      }
      
      success = code === 0 && errorCount === 0 && warningCount <= config.maxWarnings;
      
      console.log(colorize(`✅ Analysis updated: ${analysisFile}`, 'green'));
      console.log(colorize(`⏱️  Duration: ${(duration/1000).toFixed(2)}s`, 'blue'));
      console.log(colorize(`📊 Results: ${errorCount} errors, ${warningCount} warnings`, errorCount > 0 ? 'red' : warningCount > 0 ? 'yellow' : 'green'));
      console.log(colorize(`🎯 Status: ${success ? 'READY' : 'NEEDS ATTENTION'}`, success ? 'green' : 'red'));
      
      resolve({ success, errorCount, warningCount, duration });
    });
  });
}

async function main() {
  // Ensure coordination directory exists
  if (!existsSync(COORDINATION_DIR)) {
    mkdirSync(COORDINATION_DIR, { recursive: true });
  }

  const agentId = process.argv[2];
  
  if (!agentId) {
    console.log(colorize('🔄 Agent Analysis Refresh Tool', 'bright'));
    console.log(colorize('Updates analysis files after manual ESLint fixes', 'blue'));
    console.log('');
    console.log(colorize('Usage:', 'bright'));
    console.log(colorize('  npm run lint:refresh-agent <agent-id>', 'cyan'));
    console.log(colorize('  node scripts/refresh-agent-analysis.mjs <agent-id>', 'cyan'));
    console.log('');
    console.log(colorize('Available agents:', 'bright'));
    Object.entries(AGENT_CONFIGS).forEach(([id, config]) => {
      console.log(colorize(`  ${id}`, 'cyan'), colorize(`- ${config.agent}`, 'blue'));
    });
    console.log('');
    console.log(colorize('Examples:', 'bright'));
    console.log(colorize('  npm run lint:refresh-agent agent-7-apps-small-packages', 'yellow'));
    console.log(colorize('  npm run lint:refresh-agent agent-1-astro-components', 'yellow'));
    process.exit(0);
  }

  await refreshAgentAnalysis(agentId);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(colorize('💥 Refresh error:', 'red'), error);
    process.exit(1);
  });
}

export { refreshAgentAnalysis, AGENT_CONFIGS };
