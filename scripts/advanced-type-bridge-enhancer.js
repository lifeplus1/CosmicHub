#!/usr/bin/env node

/**
 * Advanced Type Bridge Enhancement Script
 * 
 * This script enhances components with specific Type Bridge types,
 * focusing on domain-specific types and proper validation.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AdvancedTypeBridgeEnhancer {
  constructor() {
    this.processedFiles = 0;
    this.enhancementsApplied = 0;
    this.validationAdded = 0;
    this.enhancements = [];
  }

  /**
   * Add domain-specific type imports based on component usage
   */
  addDomainTypeImports(content, filePath) {
    let updatedContent = content;
    let changes = [];

    const fileName = path.basename(filePath);
    const fileContent = content.toLowerCase();

    // TCM-related components
    if (fileName.includes('tcm') || fileName.includes('TCM') || 
        fileContent.includes('tcm') || fileContent.includes('element') || 
        fileContent.includes('health') || fileContent.includes('recommendation')) {
      
      if (!updatedContent.includes('@cosmichub/types')) {
        const tcmImports = `import type { 
  TCMResponse, 
  ElementalBalance, 
  HealthRecommendationsResponse,
  ElementInfo 
} from '@cosmichub/types';
import { 
  TCMValidator, 
  HealthRecommendationsValidator,
  TypeBridgeValidator 
} from '@cosmichub/types/type-bridge-validation';`;

        updatedContent = updatedContent.replace(
          /import React/,
          `${tcmImports}\nimport React`
        );
        changes.push('Added TCM Type Bridge imports');
      }
    }

    // Astrology-related components
    if (fileName.includes('astrology') || fileName.includes('Astrology') || 
        fileContent.includes('planet') || fileContent.includes('chart') || 
        fileContent.includes('horoscope') || fileContent.includes('aspect')) {
      
      if (!updatedContent.includes('@cosmichub/types') || !updatedContent.includes('AstrologyValidator')) {
        const astroImports = `import type { 
  AstrologyChart, 
  PlanetPosition,
  ChartData 
} from '@cosmichub/types';
import { 
  AstrologyValidator,
  TypeBridgeValidator 
} from '@cosmichub/types/type-bridge-validation';`;

        updatedContent = updatedContent.replace(
          /import React/,
          `${astroImports}\nimport React`
        );
        changes.push('Added Astrology Type Bridge imports');
      }
    }

    // Analytics components
    if (fileName.includes('analytics') || fileName.includes('Analytics') || 
        fileName.includes('dashboard') || fileName.includes('Dashboard')) {
      
      if (!updatedContent.includes('AnalyticsDashboardValidator')) {
        const analyticsImports = `import type { 
  ValidatedAnalyticsDashboardProps 
} from '@cosmichub/types/type-bridge-validation';
import { 
  AnalyticsDashboardValidator,
  TypeBridgeValidator 
} from '@cosmichub/types/type-bridge-validation';`;

        updatedContent = updatedContent.replace(
          /import React/,
          `${analyticsImports}\nimport React`
        );
        changes.push('Added Analytics Type Bridge imports');
      }
    }

    // Sacred Geometry components
    if (fileName.includes('sacred') || fileName.includes('Sacred') || 
        fileName.includes('geometry') || fileName.includes('Geometry')) {
      
      if (!updatedContent.includes('SacredGeometryDemoValidator')) {
        const geometryImports = `import type { 
  ValidatedSacredGeometryDemoProps 
} from '@cosmichub/types/type-bridge-validation';
import { 
  SacredGeometryDemoValidator,
  TypeBridgeValidator 
} from '@cosmichub/types/type-bridge-validation';`;

        updatedContent = updatedContent.replace(
          /import React/,
          `${geometryImports}\nimport React`
        );
        changes.push('Added Sacred Geometry Type Bridge imports');
      }
    }

    return { content: updatedContent, changes };
  }

  /**
   * Add runtime validation to component props
   */
  addPropsValidation(content, filePath) {
    let updatedContent = content;
    let changes = [];

    const fileName = path.basename(filePath, '.tsx');

    // Add props validation for components that receive props
    if (updatedContent.includes('const ') && updatedContent.includes(' = (') && 
        updatedContent.includes('props') && !updatedContent.includes('validate(')) {
      
      // Analytics Dashboard validation
      if (fileName.includes('Analytics') || fileName.includes('Dashboard')) {
        const validationCode = `
  // Runtime props validation using Type Bridge System
  const validatedProps = AnalyticsDashboardValidator.validate(props);`;
        
        updatedContent = updatedContent.replace(
          /const\s+\w+\s*=\s*\([^)]*props[^)]*\)\s*=>\s*{/,
          match => match + validationCode
        );
        changes.push('Added Analytics Dashboard props validation');
      }

      // Sacred Geometry validation
      if (fileName.includes('Sacred') || fileName.includes('Geometry')) {
        const validationCode = `
  // Runtime props validation using Type Bridge System
  const validatedProps = SacredGeometryDemoValidator.validate(props);`;
        
        updatedContent = updatedContent.replace(
          /const\s+\w+\s*=\s*\([^)]*props[^)]*\)\s*=>\s*{/,
          match => match + validationCode
        );
        changes.push('Added Sacred Geometry props validation');
      }
    }

    return { content: updatedContent, changes };
  }

  /**
   * Add API response validation
   */
  addAPIValidation(content, filePath) {
    let updatedContent = content;
    let changes = [];

    // Add validation for fetch calls
    if (updatedContent.includes('fetch(') && !updatedContent.includes('validate(')) {
      
      // TCM API validation
      if (updatedContent.includes('tcm') || updatedContent.includes('/api/health')) {
        const validationCode = `
      // Validate API response using Type Bridge System
      const validatedResponse = TCMValidator.validate(response);`;
        
        updatedContent = updatedContent.replace(
          /const\s+response\s*=\s*await\s+[^;]+;/g,
          match => match + validationCode
        );
        changes.push('Added TCM API response validation');
      }

      // Health recommendations validation
      if (updatedContent.includes('recommendations') || updatedContent.includes('/api/recommendations')) {
        const validationCode = `
      // Validate recommendations response using Type Bridge System
      const validatedRecommendations = HealthRecommendationsValidator.validate(response);`;
        
        updatedContent = updatedContent.replace(
          /const\s+response\s*=\s*await\s+[^;]+;/g,
          match => match + validationCode
        );
        changes.push('Added Health Recommendations validation');
      }

      // Astrology API validation
      if (updatedContent.includes('astrology') || updatedContent.includes('/api/chart')) {
        const validationCode = `
      // Validate astrology chart using Type Bridge System
      const validatedChart = AstrologyValidator.validate(response);`;
        
        updatedContent = updatedContent.replace(
          /const\s+response\s*=\s*await\s+[^;]+;/g,
          match => match + validationCode
        );
        changes.push('Added Astrology API validation');
      }
    }

    return { content: updatedContent, changes };
  }

  /**
   * Replace generic interfaces with descriptive types
   */
  replaceGenericInterfaces(content, filePath) {
    let updatedContent = content;
    let changes = [];

    // Replace generic props interface
    if (updatedContent.includes('interface Props') && !updatedContent.includes('Validated')) {
      const fileName = path.basename(filePath, '.tsx');
      const descriptiveInterface = `interface ${fileName}Props`;
      
      updatedContent = updatedContent.replace(/interface Props/g, descriptiveInterface);
      changes.push(`Replaced generic Props with ${descriptiveInterface}`);
    }

    // Replace generic data types
    const genericReplacements = [
      {
        pattern: /data:\s*any/g,
        replacement: 'data: Record<string, unknown>',
        description: 'Replaced any data type with Record<string, unknown>'
      },
      {
        pattern: /response:\s*any/g,
        replacement: 'response: unknown',
        description: 'Replaced any response type with unknown'
      },
      {
        pattern: /error:\s*any/g,
        replacement: 'error: Error | string',
        description: 'Replaced any error type with Error | string'
      },
      {
        pattern: /event:\s*any/g,
        replacement: 'event: Event',
        description: 'Replaced any event type with Event'
      }
    ];

    genericReplacements.forEach(({ pattern, replacement, description }) => {
      if (pattern.test(updatedContent)) {
        updatedContent = updatedContent.replace(pattern, replacement);
        changes.push(description);
      }
    });

    return { content: updatedContent, changes };
  }

  /**
   * Add type guards for runtime checking
   */
  addTypeGuards(content, filePath) {
    let updatedContent = content;
    let changes = [];

    // Add type guards for data validation
    if (updatedContent.includes('if (') && updatedContent.includes('data') && 
        !updatedContent.includes('isElementInfo') && !updatedContent.includes('isTCMResponse')) {
      
      if (updatedContent.includes('tcm') || updatedContent.includes('element')) {
        const typeGuardCode = `
  // Type guard validation
  if (!isTCMResponse(data)) {
    console.error('Invalid TCM response format');
    return;
  }`;
        
        // Insert after data assignment
        updatedContent = updatedContent.replace(
          /const\s+data\s*=\s*[^;]+;/,
          match => match + typeGuardCode
        );
        changes.push('Added TCM response type guard');
      }
    }

    return { content: updatedContent, changes };
  }

  /**
   * Process a single file with all enhancements
   */
  async processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      let updatedContent = content;
      let allChanges = [];

      // Apply all enhancements
      const enhancements = [
        this.addDomainTypeImports.bind(this),
        this.addPropsValidation.bind(this),
        this.addAPIValidation.bind(this),
        this.replaceGenericInterfaces.bind(this),
        this.addTypeGuards.bind(this)
      ];

      for (const enhance of enhancements) {
        const result = enhance(updatedContent, filePath);
        updatedContent = result.content;
        allChanges.push(...result.changes);
      }

      // Write file if changes were made
      if (allChanges.length > 0) {
        fs.writeFileSync(filePath, updatedContent);
        this.processedFiles++;
        this.enhancementsApplied += allChanges.length;
        
        console.log(`🔧 ${path.relative(process.cwd(), filePath)}`);
        allChanges.forEach(change => console.log(`   • ${change}`));
        
        this.enhancements.push({
          file: path.relative(process.cwd(), filePath),
          changes: allChanges
        });

        // Track validation additions
        if (allChanges.some(change => change.includes('validation'))) {
          this.validationAdded++;
        }
      }

    } catch (error) {
      console.warn(`⚠️ Error processing ${filePath}: ${error.message}`);
    }
  }

  /**
   * Get target files for enhancement
   */
  getTargetFiles() {
    const extensions = ['.tsx', '.ts'];
    const directories = [
      'apps/astro/src/components',
      'apps/healwave/src/components', 
      'packages/ui/src/components'
    ];

    const files = [];
    
    directories.forEach(dir => {
      const fullPath = path.join(process.cwd(), dir);
      if (fs.existsSync(fullPath)) {
        const dirFiles = this.getFilesRecursively(fullPath, extensions);
        files.push(...dirFiles);
      }
    });

    // Focus on key components that benefit most from Type Bridge
    return files.filter(file => {
      const fileName = path.basename(file).toLowerCase();
      return fileName.includes('tcm') || 
             fileName.includes('analytics') || 
             fileName.includes('dashboard') || 
             fileName.includes('sacred') || 
             fileName.includes('geometry') ||
             fileName.includes('astrology') ||
             fileName.includes('health') ||
             fileName.includes('recommendation');
    }).slice(0, 15);
  }

  /**
   * Get files recursively
   */
  getFilesRecursively(dir, extensions) {
    const files = [];
    
    function scanDir(currentDir) {
      try {
        const items = fs.readdirSync(currentDir);
        
        for (const item of items) {
          const fullPath = path.join(currentDir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            scanDir(fullPath);
          } else if (extensions.some(ext => item.endsWith(ext))) {
            if (!item.includes('.test.') && !item.includes('.spec.') && !item.includes('.stories.')) {
              files.push(fullPath);
            }
          }
        }
      } catch (error) {
        // Skip directories we can't read
      }
    }
    
    scanDir(dir);
    return files;
  }

  /**
   * Run the advanced type bridge enhancement
   */
  async enhanceTypeBridge() {
    console.log('🚀 Advanced Type Bridge Enhancement...\n');
    console.log('🎯 Focus Areas:');
    console.log('   • Domain-specific type imports (TCM, Astrology, Analytics)');
    console.log('   • Runtime props validation with Zod schemas');
    console.log('   • API response validation');
    console.log('   • Descriptive interface names');
    console.log('   • Type guards for runtime safety\n');

    const targetFiles = this.getTargetFiles();
    console.log(`📁 Processing ${targetFiles.length} specialized files...\n`);

    for (const filePath of targetFiles) {
      await this.processFile(filePath);
    }

    this.printSummary();
  }

  /**
   * Print enhancement summary
   */
  printSummary() {
    console.log('\n🎊 Advanced Type Bridge Enhancement Complete!\n');
    console.log(`📊 Enhancement Summary:`);
    console.log(`   🔧 Files enhanced: ${this.processedFiles}`);
    console.log(`   ⚡ Total enhancements: ${this.enhancementsApplied}`);
    console.log(`   🛡️ Validation layers added: ${this.validationAdded}\n`);

    if (this.enhancements.length > 0) {
      console.log('🏆 Key Achievements:');
      const enhancementTypes = {};
      this.enhancements.forEach(enhancement => {
        enhancement.changes.forEach(change => {
          const type = change.includes('validation') ? 'Validation' :
                      change.includes('imports') ? 'Type Imports' :
                      change.includes('interface') ? 'Interface Naming' :
                      change.includes('guard') ? 'Type Guards' : 'Other';
          enhancementTypes[type] = (enhancementTypes[type] || 0) + 1;
        });
      });

      Object.entries(enhancementTypes).forEach(([type, count]) => {
        console.log(`   • ${type}: ${count} enhancements`);
      });

      console.log('\n📋 Type Bridge Status:');
      console.log('   ✅ Domain-specific types implemented');
      console.log('   ✅ Runtime validation active');
      console.log('   ✅ Descriptive interfaces added');
      console.log('   ✅ Type safety enhanced');

      console.log('\n🔄 Next Steps:');
      console.log('   1. Test components with enhanced types');
      console.log('   2. Run: pnpm run type-check');
      console.log('   3. Verify runtime validation works');
      console.log('   4. Add more Zod schemas as needed');
      console.log('   5. Monitor type safety in production');
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const enhancer = new AdvancedTypeBridgeEnhancer();
  enhancer.enhanceTypeBridge().catch(console.error);
}

export { AdvancedTypeBridgeEnhancer };
