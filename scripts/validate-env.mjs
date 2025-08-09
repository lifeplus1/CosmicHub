#!/usr/bin/env node
// Environment validation script
// Fails (exit 1) if critical issues found for production build.
import fs from 'fs';
import path from 'path';

// Load first existing env file (local override priority)
const envFile = ['.env.local', '.env', '.env.production']
  .map(f => path.resolve(process.cwd(), f))
  .find(p => fs.existsSync(p));
// Track which keys were loaded from the file so we don't warn on globally-set shell vars
const loadedFromFile = new Set();
if (envFile) {
  const lines = fs.readFileSync(envFile, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    if (!line || line.trim().startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim();
  if (process.env[key] === undefined) process.env[key] = val;
  loadedFromFile.add(key);
  }
}

const isCI = !!process.env.CI;
const mode = process.env.NODE_ENV || 'development';

const publicAllowList = [
  'VITE_API_URL',
  'VITE_FIREBASE_API_KEY','VITE_FIREBASE_AUTH_DOMAIN','VITE_FIREBASE_PROJECT_ID','VITE_FIREBASE_STORAGE_BUCKET','VITE_FIREBASE_MESSAGING_SENDER_ID','VITE_FIREBASE_APP_ID',
  'VITE_ENABLE_ANALYTICS','VITE_ENABLE_MONITORING','VITE_ENABLE_ERROR_REPORTING','VITE_ENABLE_PERFORMANCE_MONITORING',
  'VITE_BUNDLE_ANALYZER','VITE_COMPRESSION',
  'VITE_USE_HTTPS','VITE_CSP_ENABLED','VITE_SECURITY_HEADERS',
  'VITE_CDN_URL','VITE_STATIC_ASSETS_URL'
];

const requiredPublic = ['VITE_API_URL','VITE_FIREBASE_API_KEY','VITE_FIREBASE_PROJECT_ID','VITE_FIREBASE_APP_ID'];
const serverOnly = ['DATABASE_URL','REDIS_URL','SMTP_PASS','GOOGLE_CLIENT_SECRET','NEW_RELIC_LICENSE_KEY'];

const errors = [];
const warnings = [];

// Detect server-only file presence (informational only; do not warn)
if (fs.existsSync(path.resolve(process.cwd(), '.env.production.server'))) {
  console.log('\nℹ️  .env.production.server detected (expected). Ensure it is excluded from frontend build contexts.');
}

// 1. Required public vars
for (const k of requiredPublic) {
  if (!process.env[k]) {
    const msg = `Missing required public variable: ${k}`;
    (mode === 'production') ? errors.push(msg) : warnings.push(msg);
  }
}

// 2. Detect leaked secrets via VITE_ prefix
for (const [k,v] of Object.entries(process.env)) {
  if (!k.startsWith('VITE_')) continue;
  if (!publicAllowList.includes(k)) {
    if (/SECRET|PASS|PASSWORD|DATABASE|REDIS|LICENSE|KEY/i.test(k) && k !== 'VITE_FIREBASE_API_KEY') {
      errors.push(`Potential secret exposed to client (rename without VITE_): ${k}`);
    } else {
      warnings.push(`Non-whitelisted VITE_ var: ${k} (consider allow list or rename)`);
    }
  }
  if (v && v.startsWith('postgres://')) errors.push(`Postgres connection string exposed via ${k}`);
}

// 3. Ensure server-only not duplicated with VITE_
for (const k of serverOnly) {
  const viteVariant = `VITE_${k}`;
  if (process.env[viteVariant]) {
    errors.push(`Remove client exposure of server secret: ${viteVariant}`);
  }
}

// 4. Basic URL validation for primary API
if (process.env.VITE_API_URL && !/^https?:\/\//.test(process.env.VITE_API_URL)) {
  errors.push('VITE_API_URL must start with http:// or https://');
}

// 4b. Enforce HTTPS for production API URL
if (mode === 'production' && process.env.VITE_API_URL && !/^https:\/\//.test(process.env.VITE_API_URL)) {
  errors.push('Production VITE_API_URL must use HTTPS');
}

// 5. Firebase minimal coherence
if (process.env.VITE_FIREBASE_API_KEY && process.env.VITE_FIREBASE_API_KEY.length < 20) {
  warnings.push('VITE_FIREBASE_API_KEY appears unusually short');
}

// 6. Disallow API_URL leakage in client env, but only if it came from the loaded .env file
if (loadedFromFile.has('API_URL')) {
  warnings.push('API_URL found in .env; move to server-only env (e.g., .env.production.server) and remove from client env');
}

// 7. Unexpected non-prefixed public-style variables
for (const k of Object.keys(process.env)) {
  if (/^(NEXT_PUBLIC_|REACT_APP_)/.test(k)) {
    warnings.push(`Legacy public prefix variable detected: ${k} (migrate to VITE_*)`);
  }
}

// Report
const heading = (arr,label,color) => {
  if (!arr.length) return; console.log(`\n${color}${label} (${arr.length})\x1b[0m`); arr.forEach(m=>console.log(' •', m));
};
heading(errors,'Errors','\x1b[31m');
heading(warnings,'Warnings','\x1b[33m');

if (errors.length) {
  console.error(`\nEnvironment validation failed with ${errors.length} error(s).`);
  process.exit(1);
} else {
  console.log(`\n✅ Environment validation passed (${warnings.length} warning(s))`);
  if (isCI && warnings.length) console.log('Proceeding (warnings do not fail build).');
}
