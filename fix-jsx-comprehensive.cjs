#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

function fixJSXSyntax(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Fix pattern: / aria-label="..." > (malformed closing)
  const oldContent = content;
  content = content.replace(/\/ aria-label="([^"]*)">/g, 'aria-label="$1" />');
  if (content !== oldContent) {
    changed = true;
    console.log(`Fixed malformed aria-label in ${filePath}`);
  }

  // Fix pattern where aria-label is on a separate line after required
  content = content.replace(
    /(.*?)\s*required\s*\n\s*aria-label="([^"]*)"\s*\n\s*<\/div>/g,
    '$1 required aria-label="$2" />\n          </div>'
  );
  
  // Fix pattern where attributes are split across lines improperly
  content = content.replace(
    /(\s*)(onChange={[^}]*})\s*\n\s*className="[^"]*"\s*\n\s*placeholder="[^"]*"\s*\n\s*required\s*\n\s*aria-label="([^"]*)"\s*\n\s*<\/div>/g,
    (match, indent, onChange, ariaLabel) => {
      return match.replace(/required\s*\n\s*aria-label="([^"]*)"\s*\n/, `required\n${indent}  aria-label="$1"\n${indent}/>\n`);
    }
  );

  // Fix self-closing tags that aren't properly closed
  content = content.replace(
    /(<input[^>]*)\s+aria-label="([^"]*)"\s*\n\s*<\/div>/g,
    '$1 aria-label="$2" />\n          </div>'
  );

  if (content !== fs.readFileSync(filePath, 'utf8')) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed JSX syntax in ${filePath}`);
    return true;
  }
  
  return false;
}

// Find all TSX files
const tsxFiles = glob.sync('apps/astro/src/**/*.tsx', { 
  cwd: '/Users/Chris/Projects/CosmicHub'
});

let fixedCount = 0;
for (const file of tsxFiles) {
  const fullPath = path.join('/Users/Chris/Projects/CosmicHub', file);
  if (fixJSXSyntax(fullPath)) {
    fixedCount++;
  }
}

console.log(`\n🎉 Fixed JSX syntax in ${fixedCount} files`);
