#!/usr/bin/env node
/* eslint-env node */
/* global console */
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const baseline = JSON.parse(readFileSync('.lint-baseline.json','utf8'));
const tracked = Object.keys(baseline.rules);

function run() {
  const targets = ['apps/astro/src','apps/healwave/src','packages/*/src'].join(' ');
  const ignorePatterns = [
    '**/.storybook/**','**/dist/**','**/build/**','**/public/**','**/node_modules/**','**/*.test.*','**/*.spec.*','**/__tests__/**'
  ];
  const ignore = ignorePatterns.map(p=>`--ignore-pattern "${p}"`).join(' ');
  let raw;
  try {
    raw = execSync(`npx eslint ${targets} --ext .ts,.tsx -f json ${ignore}`, { stdio:'pipe', encoding:'utf8', maxBuffer:20*1024*1024 });
  } catch (e) {
    raw = (e.stdout && e.stdout.toString()) || '[]';
  }
  const data = JSON.parse(raw||'[]');
  const counts = Object.create(null);
  for (const f of data) {
    for (const m of f.messages || []) {
      if (m.severity === 2 && m.ruleId && tracked.includes(m.ruleId)) {
        counts[m.ruleId] = (counts[m.ruleId] || 0) + 1;
      }
    }
  }
  for (const r of tracked) counts[r] = counts[r] || 0;
  const deltas = tracked.map(r => ({
    rule: r,
    baseline: baseline.rules[r] ?? 0,
    current: counts[r],
    delta: counts[r] - (baseline.rules[r] ?? 0),
    reduction: (( (baseline.rules[r] ?? 0) - counts[r]) / Math.max(1,(baseline.rules[r] ?? 0))) * 100
  }));
  const summary = {
    generated: new Date().toISOString(),
    totalBaseline: Object.values(baseline.rules).reduce((a,b)=>a+b,0),
    totalCurrent: Object.values(counts).reduce((a,b)=>a+b,0),
    totalDelta: tracked.reduce((acc,r)=> acc + (counts[r] - (baseline.rules[r]||0)),0),
    rules: deltas
  };
  console.log(JSON.stringify(summary,null,2));
}

run();
