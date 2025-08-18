#!/usr/bin/env node
/* eslint-env node */
/* global process, console */
// Unified type-check script that optionally accepts --scope=<name> to run a subset
// of workspace type checks without forwarding unsupported flags to each package's tsc.
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Map of logical scopes to the concrete package scripts to invoke
const scopeMap = {
  all: ['astro', 'healwave'],
  astro: ['astro'],
  healwave: ['healwave'],
};

// Parse args (allow --scope or -s). Ignore other flags to prevent passing to tsc.
const rawArgs = process.argv.slice(2);
let scope = 'all';
for (const a of rawArgs) {
  if (a.startsWith('--scope=')) scope = a.split('=')[1] || 'all';
  else if (a === '--astro') scope = 'astro';
  else if (a === '--healwave') scope = 'healwave';
}

if (!scopeMap[scope]) {
  console.error(
    `Unknown scope "${scope}". Valid: ${Object.keys(scopeMap).join(', ')}`
  );
  process.exit(1);
}

const sequences = scopeMap[scope];

const run = (cmd, args, cwd) =>
  new Promise((resolvePromise, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit', cwd });
    child.on('exit', code => {
      if (code !== 0)
        reject(
          new Error(`Command failed: ${cmd} ${args.join(' ')} (code ${code})`)
        );
      else resolvePromise(undefined);
    });
  });

(async () => {
  try {
    for (const app of sequences) {
      if (app === 'astro') {
        await run(
          'pnpm',
          ['run', 'type-check:astro'],
          resolve(__dirname, '..')
        );
      } else if (app === 'healwave') {
        await run(
          'pnpm',
          ['run', 'type-check:healwave'],
          resolve(__dirname, '..')
        );
      }
    }
    console.log('Type checking completed successfully');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
})();
