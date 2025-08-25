#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

// Simple story index report (parses *.stories.tsx)
const SRC_DIR = path.resolve(process.cwd(), 'src');
const STORY_GLOB = /\.stories\.(tsx|ts)$/;

/** Recursively walk */
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(d => {
    const full = path.join(dir, d.name);
    if (d.isDirectory()) return walk(full);
    if (STORY_GLOB.test(d.name)) return [full];
    return [];
  });
}

const stories = walk(SRC_DIR);
const summary = stories.map(f => {
  const content = fs.readFileSync(f, 'utf8');
  const exports = Array.from(content.matchAll(/export const (\w+)/g)).map(
    m => m[1]
  );
  return { file: path.relative(SRC_DIR, f), exports };
});

const out = {
  generatedAt: new Date().toISOString(),
  totalStories: summary.reduce((a, s) => a + s.exports.length, 0),
  files: summary,
};

fs.writeFileSync('storybook-report.json', JSON.stringify(out, null, 2));
console.log(
  `Story report written: storybook-report.json (stories: ${out.totalStories})`
);
