#!/usr/bin/env node
// Type Error Ratchet: Fails if TypeScript error count rises above baseline.
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.cwd());
const BASELINE_PATH = path.join(ROOT, '.type-errors-baseline.json');
const TSC_CMD = ['pnpm','exec','tsc','--noEmit'];

function runTSC(){
  const res = spawnSync(TSC_CMD[0], TSC_CMD.slice(1), { encoding:'utf8' });
  const stdout = res.stdout + res.stderr;
  // If tsc returns non-zero, approximate error count via TS error lines; else 0
  let errorCount = 0;
  if(res.status !== 0){
    errorCount = (stdout.match(/error TS\d+/g) || []).length || 1;
  }
  return { errorCount, output: stdout.trim(), status: res.status };
}

function loadBaseline(){
  if(!existsSync(BASELINE_PATH)) return null;
  return JSON.parse(readFileSync(BASELINE_PATH,'utf8'));
}

function saveBaseline(count){
  writeFileSync(BASELINE_PATH, JSON.stringify({ errorCount: count, updated: new Date().toISOString() }, null, 2));
}

const current = runTSC();
const baseline = loadBaseline();

if(!baseline){
  saveBaseline(current.errorCount);
  console.log(`Initialized type error baseline at ${current.errorCount}`);
  process.exit(0);
}

if(current.errorCount > baseline.errorCount){
  console.error(`Type error count regressed: ${current.errorCount} > baseline ${baseline.errorCount}`);
  process.exit(1);
}

if(current.errorCount < baseline.errorCount){
  console.log(`Great! Type errors reduced ${baseline.errorCount} -> ${current.errorCount}. Updating baseline.`);
  saveBaseline(current.errorCount);
  process.exit(0);
}

console.log(`Type errors unchanged at ${current.errorCount}`);
process.exit(0);
