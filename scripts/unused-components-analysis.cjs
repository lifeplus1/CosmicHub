#!/usr/bin/env node

/**
 * Unused Components Analysis
 * Identifies unused, test, demo, and duplicate components across all apps
 */

const fs = require('fs');
const path = require('path');

// Find all component files
function findComponentFiles(dir) {
  let components = [];
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules' && item !== '__tests__') {
        components.push(...findComponentFiles(fullPath));
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        const componentName = path.basename(item, path.extname(item));
        components.push({
          name: componentName,
          filePath: fullPath,
          relativePath: path.relative(process.cwd(), fullPath)
        });
      }
    }
  } catch (error) {
    // Skip directories that can't be read
  }
  
  return components;
}

// Find all usage references
function findUsageReferences(componentName, searchDirs) {
  let usages = [];
  
  for (const dir of searchDirs) {
    try {
      const files = findAllFiles(dir);
      for (const file of files) {
        if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js')) {
          const content = fs.readFileSync(file, 'utf8');
          
          // Check for imports and usage
          const importRegex = new RegExp(`import.*[\\{\\,\\s]${componentName}[\\}\\,\\s].*from`, 'g');
          const lazyImportRegex = new RegExp(`lazy\\(.*import\\(.*${componentName}`, 'g');
          const defaultImportRegex = new RegExp(`import\\s+${componentName}\\s+from`, 'g');
          const usageRegex = new RegExp(`<${componentName}[\\s/>]`, 'g');
          
          if (importRegex.test(content) || lazyImportRegex.test(content) || 
              defaultImportRegex.test(content) || usageRegex.test(content)) {
            usages.push(path.relative(process.cwd(), file));
          }
        }
      }
    } catch (error) {
      // Skip directories that can't be read
    }
  }
  
  return usages;
}

function findAllFiles(dir) {
  let files = [];
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        files.push(...findAllFiles(fullPath));
      } else if (stat.isFile()) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Skip directories that can't be read
  }
  
  return files;
}

// Component directories to analyze
const componentDirs = [
  'apps/healwave/src/components',
  'apps/astro/src/components',
  'apps/mobile/src/components',
  'packages/ui/src/components'
];

// Search directories for usage
const searchDirs = [
  'apps/healwave/src',
  'apps/astro/src', 
  'apps/mobile/src',
  'packages'
];

console.log('🔍 Analyzing Component Usage Across CosmicHub Apps\n');
console.log('='.repeat(80));

let allComponents = [];
for (const dir of componentDirs) {
  if (fs.existsSync(dir)) {
    allComponents.push(...findComponentFiles(dir));
  }
}

const unusedComponents = [];
const testComponents = [];
const demoComponents = [];
const duplicateComponents = [];

console.log(`\n📊 Found ${allComponents.length} total component files\n`);

for (const component of allComponents) {
  const usages = findUsageReferences(component.name, searchDirs);
  
  // Remove self-reference
  const filteredUsages = usages.filter(usage => usage !== component.relativePath);
  
  if (filteredUsages.length === 0) {
    // Check if it's a test/demo component
    if (component.name.toLowerCase().includes('test') || 
        component.name.toLowerCase().includes('demo') ||
        component.name.toLowerCase().includes('example')) {
      if (component.name.toLowerCase().includes('test')) {
        testComponents.push(component);
      } else {
        demoComponents.push(component);
      }
    } else {
      unusedComponents.push(component);
    }
  }
}

// Find potential duplicates
const componentsByName = {};
for (const comp of allComponents) {
  if (!componentsByName[comp.name]) {
    componentsByName[comp.name] = [];
  }
  componentsByName[comp.name].push(comp);
}

for (const [name, components] of Object.entries(componentsByName)) {
  if (components.length > 1) {
    duplicateComponents.push({ name, components });
  }
}

// Report Results
console.log('🚨 UNUSED COMPONENTS:');
console.log('-'.repeat(40));
if (unusedComponents.length === 0) {
  console.log('✅ No unused components found!');
} else {
  unusedComponents.forEach(comp => {
    console.log(`❌ ${comp.name}`);
    console.log(`   Path: ${comp.relativePath}`);
  });
}

console.log('\n🧪 TEST COMPONENTS:');
console.log('-'.repeat(40));
testComponents.forEach(comp => {
  console.log(`🔬 ${comp.name}`);
  console.log(`   Path: ${comp.relativePath}`);
});

console.log('\n🎭 DEMO COMPONENTS:');
console.log('-'.repeat(40));
demoComponents.forEach(comp => {
  console.log(`🎪 ${comp.name}`);
  console.log(`   Path: ${comp.relativePath}`);
});

console.log('\n👥 DUPLICATE COMPONENT NAMES:');
console.log('-'.repeat(40));
if (duplicateComponents.length === 0) {
  console.log('✅ No duplicate component names found!');
} else {
  duplicateComponents.forEach(({ name, components }) => {
    console.log(`⚠️  ${name} (${components.length} files):`);
    components.forEach(comp => {
      console.log(`     - ${comp.relativePath}`);
    });
  });
}

console.log('\n' + '='.repeat(80));
console.log('📝 SUMMARY:');
console.log(`   Total Components: ${allComponents.length}`);
console.log(`   Unused: ${unusedComponents.length}`);
console.log(`   Test Components: ${testComponents.length}`);
console.log(`   Demo Components: ${demoComponents.length}`);
console.log(`   Duplicate Names: ${duplicateComponents.length}`);

// Generate recommendations
console.log('\n💡 RECOMMENDATIONS:');
console.log('-'.repeat(40));

if (testComponents.length > 0) {
  console.log('🔬 Test Components:');
  console.log('   - Keep for development and testing purposes');
  console.log('   - Consider moving to a dedicated test directory if not already');
  console.log('   - Ensure they are excluded from production builds');
}

if (demoComponents.length > 0) {
  console.log('\n🎪 Demo Components:');
  console.log('   - Evaluate if still needed for documentation/examples');
  console.log('   - Consider moving to a separate demo/examples directory');
  console.log('   - Remove if no longer relevant to current features');
}

if (unusedComponents.length > 0) {
  console.log('\n❌ Unused Components:');
  console.log('   - SAFE TO REMOVE if confirmed not needed');
  console.log('   - Double-check for dynamic imports or string-based references');
  console.log('   - Consider if they are part of planned features');
}

if (duplicateComponents.length > 0) {
  console.log('\n👥 Duplicate Components:');
  console.log('   - Review for functionality overlap');
  console.log('   - Consolidate into shared packages if similar');
  console.log('   - Rename or refactor to avoid confusion');
}

console.log('\n✨ Next Steps:');
console.log('   1. Review each unused component individually');
console.log('   2. Check git history for recent usage patterns');
console.log('   3. Validate with team before removing');
console.log('   4. Create backup branch before cleanup');
console.log('   5. Run tests after any removals');
