#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Known duplicate components from Phase 1 analysis
const DUPLICATE_GROUPS = [
    {
        name: 'ErrorBoundary',
        files: [
            'apps/healwave/src/components/ErrorBoundary.tsx',
            'apps/astro/src/components/ErrorBoundary.tsx'
        ],
        target: 'packages/shared/src/components/ErrorBoundary.tsx',
        action: 'consolidate'
    },
    {
        name: 'ProgressBar',
        files: [
            'apps/healwave/src/components/ProgressBar.tsx',
            'apps/astro/src/components/ProgressBar.tsx'
        ],
        target: 'packages/shared/src/components/ProgressBar.tsx',
        action: 'consolidate'
    },
    {
        name: 'ChartPreferences',
        files: [
            'apps/healwave/src/components/ChartPreferences.tsx',
            'apps/astro/src/components/ChartPreferences.tsx'
        ],
        target: 'packages/shared/src/components/ChartPreferences.tsx',
        action: 'review' // Needs manual review for functionality differences
    }
];

class DuplicateResolver {
    constructor() {
        this.baseDir = process.cwd();
    }

    async analyzeDuplicates() {
        console.log('🔍 Phase 2: Duplicate Component Resolution Analysis\n');
        
        for (const group of DUPLICATE_GROUPS) {
            console.log(`📋 Analyzing: ${group.name}`);
            console.log(`   Action: ${group.action}`);
            console.log(`   Target: ${group.target}`);
            
            // Check if files exist
            const existingFiles = [];
            for (const file of group.files) {
                const fullPath = path.join(this.baseDir, file);
                if (fs.existsSync(fullPath)) {
                    existingFiles.push(file);
                }
            }
            
            console.log(`   Existing files: ${existingFiles.length}/${group.files.length}`);
            
            if (existingFiles.length > 1) {
                // Compare file contents
                await this.compareFiles(existingFiles, group.name);
            }
            
            console.log('');
        }
    }

    async compareFiles(files, componentName) {
        console.log(`   🔍 Comparing ${componentName} implementations:`);
        
        const contents = {};
        const stats = {};
        
        for (const file of files) {
            const fullPath = path.join(this.baseDir, file);
            try {
                const content = fs.readFileSync(fullPath, 'utf8');
                contents[file] = content;
                stats[file] = {
                    lines: content.split('\n').length,
                    size: content.length,
                    imports: this.extractImports(content),
                    exports: this.extractExports(content)
                };
                
                console.log(`     📄 ${file}:`);
                console.log(`        Lines: ${stats[file].lines}, Size: ${stats[file].size} chars`);
                console.log(`        Imports: ${stats[file].imports.length}`);
                console.log(`        Exports: ${stats[file].exports.length}`);
            } catch (error) {
                console.log(`     ❌ Error reading ${file}: ${error.message}`);
            }
        }
        
        // Check for identical files
        const fileContents = Object.values(contents);
        if (fileContents.length === 2 && fileContents[0] === fileContents[1]) {
            console.log(`     ✅ Files are identical - safe to consolidate`);
        } else {
            console.log(`     ⚠️  Files have differences - requires manual review`);
        }
    }

    extractImports(content) {
        const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
        const imports = [];
        let match;
        while ((match = importRegex.exec(content)) !== null) {
            imports.push(match[1]);
        }
        return imports;
    }

    extractExports(content) {
        const exportRegex = /export\s+(?:default\s+)?(?:const\s+|function\s+|class\s+)?(\w+)/g;
        const exports = [];
        let match;
        while ((match = exportRegex.exec(content)) !== null) {
            exports.push(match[1]);
        }
        return exports;
    }

    async consolidateComponent(group) {
        console.log(`🔧 Consolidating ${group.name}...`);
        
        // Find the "best" implementation (usually the one with more functionality)
        const implementations = [];
        
        for (const file of group.files) {
            const fullPath = path.join(this.baseDir, file);
            if (fs.existsSync(fullPath)) {
                const content = fs.readFileSync(fullPath, 'utf8');
                implementations.push({
                    file,
                    content,
                    size: content.length,
                    complexity: this.calculateComplexity(content)
                });
            }
        }
        
        if (implementations.length < 2) {
            console.log(`   ⚠️  Less than 2 implementations found, skipping`);
            return false;
        }
        
        // Choose the more complex/complete implementation
        const bestImpl = implementations.sort((a, b) => b.complexity - a.complexity)[0];
        console.log(`   ✅ Selected ${bestImpl.file} as base implementation`);
        
        // Create shared package directory if it doesn't exist
        const targetDir = path.dirname(path.join(this.baseDir, group.target));
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
            console.log(`   📁 Created directory: ${targetDir}`);
        }
        
        // Copy the best implementation to shared package
        const targetPath = path.join(this.baseDir, group.target);
        fs.writeFileSync(targetPath, bestImpl.content);
        console.log(`   📄 Created shared component: ${group.target}`);
        
        return {
            sourceFile: bestImpl.file,
            targetFile: group.target,
            filesToUpdate: group.files.filter(f => f !== bestImpl.file)
        };
    }

    calculateComplexity(content) {
        // Simple complexity calculation based on various factors
        const lines = content.split('\n').length;
        const functions = (content.match(/function|const\s+\w+\s*=/g) || []).length;
        const hooks = (content.match(/use\w+/g) || []).length;
        const imports = (content.match(/import/g) || []).length;
        
        return lines + (functions * 5) + (hooks * 3) + imports;
    }

    async updateImportPaths(consolidation) {
        console.log(`🔄 Updating import paths for ${consolidation.targetFile}...`);
        
        const componentName = path.basename(consolidation.targetFile, path.extname(consolidation.targetFile));
        const newImportPath = `@cosmichub/shared/src/components/${componentName}`;
        
        // Find all files that import from the old locations
        const appDirs = ['apps/healwave', 'apps/astro', 'apps/mobile'];
        
        for (const appDir of appDirs) {
            const fullAppDir = path.join(this.baseDir, appDir);
            if (fs.existsSync(fullAppDir)) {
                await this.updateImportsInDirectory(fullAppDir, consolidation.filesToUpdate, newImportPath, componentName);
            }
        }
    }

    async updateImportsInDirectory(directory, oldPaths, newImportPath, componentName) {
        const files = this.getAllTsxFiles(directory);
        
        for (const file of files) {
            let content = fs.readFileSync(file, 'utf8');
            let modified = false;
            
            // Update imports from old paths
            for (const oldPath of oldPaths) {
                const relativePath = path.relative(path.dirname(file), path.join(this.baseDir, oldPath));
                const oldImportRegex = new RegExp(`from\\s+['"]${relativePath.replace(/\\/g, '\\\\')}['"]`, 'g');
                
                if (oldImportRegex.test(content)) {
                    content = content.replace(oldImportRegex, `from '${newImportPath}'`);
                    modified = true;
                    console.log(`   ✅ Updated import in ${path.relative(this.baseDir, file)}`);
                }
            }
            
            if (modified) {
                fs.writeFileSync(file, content);
            }
        }
    }

    getAllTsxFiles(directory) {
        const files = [];
        
        function traverse(dir) {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                
                if (entry.isDirectory() && entry.name !== 'node_modules' && !entry.name.startsWith('.')) {
                    traverse(fullPath);
                } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
                    files.push(fullPath);
                }
            }
        }
        
        traverse(directory);
        return files;
    }

    async removeOldFiles(consolidation) {
        console.log(`🗑️  Removing old duplicate files...`);
        
        for (const file of consolidation.filesToUpdate) {
            const fullPath = path.join(this.baseDir, file);
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
                console.log(`   ❌ Removed ${file}`);
            }
        }
    }
}

async function main() {
    const resolver = new DuplicateResolver();
    
    const command = process.argv[2];
    
    switch (command) {
        case 'analyze':
        case undefined:
            await resolver.analyzeDuplicates();
            break;
            
        case 'consolidate':
            const componentName = process.argv[3];
            if (!componentName) {
                console.log('Usage: node phase2-duplicate-resolution.cjs consolidate <component-name>');
                process.exit(1);
            }
            
            const group = DUPLICATE_GROUPS.find(g => g.name.toLowerCase() === componentName.toLowerCase());
            if (!group) {
                console.log(`Component ${componentName} not found in duplicate groups`);
                process.exit(1);
            }
            
            if (group.action === 'review') {
                console.log(`⚠️  Component ${componentName} requires manual review before consolidation`);
                await resolver.analyzeDuplicates();
                break;
            }
            
            const consolidation = await resolver.consolidateComponent(group);
            if (consolidation) {
                await resolver.updateImportPaths(consolidation);
                await resolver.removeOldFiles(consolidation);
                console.log(`✅ Successfully consolidated ${componentName}`);
            }
            break;
            
        default:
            console.log('Available commands:');
            console.log('  analyze (default) - Analyze duplicate components');
            console.log('  consolidate <name> - Consolidate a specific component');
    }
}

if (require.main === module) {
    main().catch(console.error);
}
