#!/usr/bin/env node

import fs from 'fs';

const packageJsonPath = './package.json';
const backupPath = './package.json.pre-consolidation.backup';

// Read current package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Create backup
fs.writeFileSync(backupPath, JSON.stringify(packageJson, null, 2));
console.log('✅ Created backup:', backupPath);

// Define script categories and their consolidation rules
const scriptCategories = {
  // Development workflow scripts
  development: [
    'dev',
    'dev:astro',
    'dev:healwave',
    'dev:mobile',
    'dev:backend',
    'dev-frontend',
    'preview',
    'preview:astro',
    'preview:healwave',
    'storybook',
    'build-storybook',
    'env:sync',
    'validate-env',
    'validate-experiments',
  ],

  // Build system scripts
  build: [
    'build',
    'build:astro',
    'build:healwave',
    'build:analytics',
    'build:astro:analyze',
  ],

  // Docker scripts
  docker: ['docker:build', 'docker:up', 'docker:down', 'docker:logs'],

  // Testing scripts
  testing: [
    'test',
    'test:watch',
    'test:ui',
    'test:astro',
    'test:healwave',
    'test:packages',
    'test:backend',
    'benchmark:synastry',
  ],

  // Type checking scripts
  typecheck: [
    'type-check',
    'type-check:tests',
    'type-check:astro',
    'type-check:astro:stories',
    'type-check:healwave',
    'type-check:types',
    'type-check:all',
    'type-check:ratchet',
    'type-check:strict:pilot',
    'type:ratchet',
    'any:ratchet',
  ],

  // Coverage scripts
  coverage: ['coverage:ratchet', 'coverage:ratchet:check', 'coverage:report'],

  // Linting scripts - core
  lintCore: [
    'lint',
    'lint:astro',
    'lint:healwave',
    'lint:types',
    'lint:backend',
  ],

  // Linting scripts - AI coordination
  lintAI: [
    'lint:parallel',
    'lint:ai-coord',
    'lint:ai-coord-enhanced',
    'lint:ai-coord-safe',
    'lint:preprocess',
    'lint:rebalance',
    'lint:enhanced-workflow',
    'lint:refresh-agent',
  ],

  // Linting scripts - agents
  lintAgents: [
    'lint:agent:agent-1-astro-components',
    'lint:agent:agent-2-astro-features',
    'lint:agent:agent-3-astro-pages-context',
    'lint:agent:agent-4-astro-services-types',
    'lint:agent:agent-5-ui-package',
    'lint:agent:agent-6-config-package',
    'lint:agent:agent-7-apps-small-packages',
  ],

  // Linting scripts - quality gates
  lintQuality: [
    'lint:ratchet',
    'lint:changed:strict',
    'lint:guard',
    'lint:fail-usage',
    'lint:delta',
    'lint:update-doc',
    'lint:badge',
  ],

  // Formatting scripts
  formatting: [
    'format',
    'format:astro',
    'format:healwave',
    'format:backend',
    'markdownlint',
  ],

  // Quality assurance
  qa: ['quality:all', 'a11y:check'],

  // Maintenance scripts
  maintenance: [
    'install:all',
    'clean',
    'clean:astro',
    'clean:healwave',
    'clean:backend',
    'setup',
    'setup:backend',
    'deps:outdated',
    'audit:prod',
    'cleanup:report',
    'cleanup',
  ],

  // Lifecycle scripts (keep at end)
  lifecycle: ['postinstall', 'prepare'],
};

// Create consolidated scripts object
const consolidatedScripts = {};

// Add scripts in category order
const categoryOrder = [
  'development',
  'build',
  'docker',
  'testing',
  'typecheck',
  'coverage',
  'lintCore',
  'lintAI',
  'lintAgents',
  'lintQuality',
  'formatting',
  'qa',
  'maintenance',
  'lifecycle',
];

categoryOrder.forEach(category => {
  if (scriptCategories[category]) {
    scriptCategories[category].forEach(scriptName => {
      if (packageJson.scripts[scriptName]) {
        consolidatedScripts[scriptName] = packageJson.scripts[scriptName];
      }
    });

    // Add separator comment for readability (as a script comment)
    if (category !== 'lifecycle') {
      const nextCategory = categoryOrder[categoryOrder.indexOf(category) + 1];
      if (nextCategory) {
        consolidatedScripts[`_${category}_end`] =
          `echo "--- End ${category} scripts ---"`;
      }
    }
  }
});

// Add any scripts not categorized
const categorizedScripts = new Set();
categoryOrder.forEach(cat => {
  if (scriptCategories[cat]) {
    scriptCategories[cat].forEach(script => categorizedScripts.add(script));
  }
});

const uncategorizedScripts = {};
Object.keys(packageJson.scripts).forEach(script => {
  if (!categorizedScripts.has(script)) {
    uncategorizedScripts[script] = packageJson.scripts[script];
    console.log('⚠️  Uncategorized script:', script);
  }
});

// Remove separator comments (they were just for organization)
Object.keys(consolidatedScripts).forEach(key => {
  if (key.startsWith('_') && key.endsWith('_end')) {
    delete consolidatedScripts[key];
  }
});

// Create new package.json with consolidated scripts
const newPackageJson = {
  ...packageJson,
  scripts: {
    ...consolidatedScripts,
    ...uncategorizedScripts,
  },
};

// Write consolidated package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(newPackageJson, null, 2));

console.log('✅ Script consolidation completed');
console.log(`📊 Scripts organized: ${Object.keys(consolidatedScripts).length}`);
console.log(
  `⚠️  Uncategorized scripts: ${Object.keys(uncategorizedScripts).length}`
);
console.log(
  `📉 Total scripts: ${Object.keys(packageJson.scripts).length} → ${Object.keys(newPackageJson.scripts).length}`
);

if (Object.keys(uncategorizedScripts).length > 0) {
  console.log('\nUncategorized scripts:');
  Object.keys(uncategorizedScripts).forEach(script => {
    console.log(`  - ${script}`);
  });
}
