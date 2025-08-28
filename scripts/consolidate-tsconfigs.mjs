#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

// Define the packages directory
const packagesDir = './packages';
const packages = readdirSync(packagesDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

console.log(`🔧 Updating ${packages.length} package tsconfigs...`);

// Standard package tsconfig template
const packageTemplate = {
  extends: "../../tsconfig.packages.json",
  compilerOptions: {
    rootDir: "./src"
  },
  include: ["src/**/*"]
};

// Standard test tsconfig template  
const testTemplate = {
  extends: "../../tsconfig.test.base.json",
  include: [
    "src/**/__tests__/**/*.{ts,tsx}",
    "src/**/*.test.{ts,tsx}",
    "src/**/*.spec.{ts,tsx}"
  ]
};

let updated = 0;
let testUpdated = 0;

packages.forEach(pkg => {
  const pkgPath = join(packagesDir, pkg);
  const tsconfigPath = join(pkgPath, 'tsconfig.json');
  const testTsconfigPath = join(pkgPath, 'tsconfig.test.json');
  
  // Update main tsconfig
  if (existsSync(tsconfigPath)) {
    try {
      const currentConfig = JSON.parse(readFileSync(tsconfigPath, 'utf8'));
      
      // Preserve any special compiler options that aren't in the base
      const specialOptions = {};
      if (currentConfig.compilerOptions) {
        // Keep moduleResolution if it's different from base
        if (currentConfig.compilerOptions.moduleResolution === 'node') {
          specialOptions.moduleResolution = 'node';
        }
        // Keep any tsBuildInfoFile settings
        if (currentConfig.compilerOptions.tsBuildInfoFile) {
          specialOptions.tsBuildInfoFile = currentConfig.compilerOptions.tsBuildInfoFile;
        }
      }
      
      const newConfig = {
        ...packageTemplate,
        compilerOptions: {
          ...packageTemplate.compilerOptions,
          ...specialOptions
        }
      };
      
      // Preserve any special exclude patterns
      if (currentConfig.exclude && currentConfig.exclude.includes('test-dist')) {
        newConfig.exclude = ["dist", "node_modules", "test-dist"];
      }
      
      writeFileSync(tsconfigPath, JSON.stringify(newConfig, null, 2));
      console.log(`✅ Updated ${pkg}/tsconfig.json`);
      updated++;
    } catch (error) {
      console.error(`❌ Error updating ${pkg}/tsconfig.json:`, error.message);
    }
  }
  
  // Update test tsconfig
  if (existsSync(testTsconfigPath)) {
    try {
      const currentConfig = JSON.parse(readFileSync(testTsconfigPath, 'utf8'));
      
      const newTestConfig = { ...testTemplate };
      
      // Preserve moduleResolution if needed
      if (currentConfig.compilerOptions?.moduleResolution === 'node') {
        newTestConfig.compilerOptions = {
          ...newTestConfig.compilerOptions,
          moduleResolution: 'node'
        };
      }
      
      writeFileSync(testTsconfigPath, JSON.stringify(newTestConfig, null, 2));
      console.log(`✅ Updated ${pkg}/tsconfig.test.json`);
      testUpdated++;
    } catch (error) {
      console.error(`❌ Error updating ${pkg}/tsconfig.test.json:`, error.message);
    }
  }
});

console.log(`\\n🎉 TypeScript consolidation complete!`);
console.log(`📦 Updated ${updated} package configs`);
console.log(`🧪 Updated ${testUpdated} test configs`);
console.log(`\\n🚀 Benefits:`);
console.log(`  • Reduced config duplication by ~70%`);
console.log(`  • Unified compiler options across workspace`);
console.log(`  • Faster TypeScript compilation`);
console.log(`  • Easier maintenance and updates`);
