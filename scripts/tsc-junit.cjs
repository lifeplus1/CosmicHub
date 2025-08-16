#!/usr/bin/env node
/**
 * Generate a minimal JUnit XML report from a TypeScript (tsc) log.
 * Usage: node scripts/tsc-junit.cjs <logPath> <outputXml>
 */
const fs = require('fs');
const path = require('path');

const [,, logPath, outPath] = process.argv;
if (!logPath || !outPath) {
  console.error('Usage: node scripts/tsc-junit.cjs <logPath> <outputXml>');
  process.exit(2);
}

let log = '';
try { log = fs.readFileSync(logPath, 'utf8'); } catch { /* ignore */ }

const errorRegex = /^.*error TS\d+:.+$/gm;
const errors = log.match(errorRegex) || [];
const failure = errors.length > 0;

// Limit embedded log size
const snippet = log.length > 20000 ? log.slice(0, 20000) + '\n... (truncated)' : log;

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<testsuites tests="1" failures="${failure ? 1 : 0}" name="typescript">\n  <testsuite name="typescript-compile" tests="1" failures="${failure ? 1 : 0}">\n    <testcase name="compile" classname="tsc">${failure ? `\n      <failure message="TypeScript compile errors" type="TSCompileError"><![CDATA[${errors.slice(0,20).join('\n')}\n\n--- Full Log ---\n${snippet}]]></failure>` : ''}\n    </testcase>\n  </testsuite>\n</testsuites>\n`;

fs.writeFileSync(outPath, xml, 'utf8');
console.log(`JUnit report written: ${outPath} (errors: ${errors.length})`);
