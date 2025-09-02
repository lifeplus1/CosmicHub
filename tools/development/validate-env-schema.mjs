#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import Ajv from 'ajv';

const ajv = new Ajv({ allErrors: true });
const schemaPath = path.resolve('schema/env.schema.json');
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
const validate = ajv.compile(schema);

// Load candidate env (similar logic to primary validator, but only public subset)
const envFile = ['.env.production', '.env', '.env.local']
  .map(f => path.resolve(f))
  .find(p => fs.existsSync(p));

if (!envFile) {
  console.error('No env file found to validate against schema.');
  process.exit(1);
}

const raw = fs.readFileSync(envFile, 'utf8').split(/\r?\n/);
const data = {};
for (const line of raw) {
  if (!line || line.startsWith('#')) continue;
  const idx = line.indexOf('=');
  if (idx === -1) continue;
  const k = line.slice(0, idx).trim();
  const v = line.slice(idx + 1).trim();
  if (k.startsWith('VITE_')) data[k] = v;
}

const valid = validate(data);
if (!valid) {
  console.error('\nSchema validation failed:');
  for (const err of validate.errors) {
    console.error(` • ${err.instancePath || '(root)'} ${err.message}`);
  }
  process.exit(1);
}

console.log('✅ Env schema validation passed');
