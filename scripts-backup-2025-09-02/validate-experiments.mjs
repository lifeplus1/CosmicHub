#!/usr/bin/env node
// scripts/validate-experiments.mjs
import fs from 'fs';
import path from 'path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

// Load the JSON schema
const schemaPath = path.resolve('schema/experiment-registry.schema.json');
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

// Setup AJV validator
const ajv = new Ajv({ allErrors: true, verbose: true });
addFormats(ajv);
const validate = ajv.compile(schema);

/**
 * Validate experiment files in a directory
 * @param {string} dir - Directory to search for experiment files
 * @returns {boolean} - True if all experiments are valid
 */
function validateExperimentsInDirectory(dir) {
  if (!fs.existsSync(dir)) {
    console.warn(`Directory ${dir} does not exist, skipping...`);
    return true;
  }

  const files = fs
    .readdirSync(dir)
    .filter(file => file.endsWith('.json') && !file.includes('schema'))
    .map(file => path.join(dir, file));

  if (files.length === 0) {
    console.log(`No experiment JSON files found in ${dir}`);
    return true;
  }

  let allValid = true;

  for (const file of files) {
    console.log(`\nValidating: ${file}`);

    try {
      const data = JSON.parse(fs.readFileSync(file, 'utf8'));
      const isValid = validate(data);

      if (isValid) {
        console.log(`✅ ${path.basename(file)} - Valid`);

        // Additional business rule validations
        const warnings = performBusinessRuleChecks(data);
        if (warnings.length > 0) {
          console.log('⚠️  Warnings:');
          warnings.forEach(warning => console.log(`   - ${warning}`));
        }
      } else {
        console.log(`❌ ${path.basename(file)} - Invalid`);
        console.log('Errors:');
        validate.errors?.forEach(error => {
          const path = error.instancePath || '(root)';
          console.log(`   - ${path}: ${error.message}`);
        });
        allValid = false;
      }
    } catch (error) {
      console.log(`❌ ${path.basename(file)} - Parse Error: ${error.message}`);
      allValid = false;
    }
  }

  return allValid;
}

/**
 * Perform additional business rule checks
 * @param {object} experiment - Experiment configuration
 * @returns {string[]} - Array of warnings
 */
function performBusinessRuleChecks(experiment) {
  const warnings = [];

  // Check experiment duration
  const startDate = new Date(experiment.start_date);
  const endDate = new Date(experiment.end_date);
  const durationDays = (endDate - startDate) / (1000 * 60 * 60 * 24);

  if (durationDays < 7) {
    warnings.push(
      'Experiment duration is less than 1 week - may not capture weekly patterns'
    );
  } else if (durationDays > 90) {
    warnings.push(
      'Experiment duration is over 90 days - may be affected by external factors'
    );
  }

  // Check for control variant
  const hasControl = experiment.variants.some(
    v =>
      v.id.toLowerCase().includes('control') ||
      v.id.toLowerCase().includes('baseline')
  );
  if (!hasControl) {
    warnings.push(
      'No clear control/baseline variant found - consider adding one for comparison'
    );
  }

  // Check variant count
  if (experiment.variants.length > 5) {
    warnings.push(
      `${experiment.variants.length} variants may be too many for clear results - consider reducing`
    );
  }

  // Check traffic allocation balance
  const totalTraffic = experiment.variants.reduce(
    (sum, v) => sum + v.traffic_percentage,
    0
  );
  if (Math.abs(totalTraffic - 100) > 0.01) {
    warnings.push(
      `Traffic allocation sums to ${totalTraffic}% instead of 100%`
    );
  }

  // Check if experiment is starting in the past
  if (experiment.status === 'planned' && startDate < new Date()) {
    warnings.push('Planned experiment has start date in the past');
  }

  return warnings;
}

/**
 * Main validation function
 */
function main() {
  console.log('🧪 CosmicHub Experiment Validator');
  console.log('==================================');

  const args = process.argv.slice(2);
  const directories =
    args.length > 0
      ? args
      : [
          'docs/archive/experiments',
          'backend/experiments',
          'apps/astro/experiments',
          'apps/healwave/experiments',
          'tests/fixtures/experiments',
        ];

  let allValid = true;

  for (const dir of directories) {
    console.log(`\n📁 Checking directory: ${dir}`);
    const dirValid = validateExperimentsInDirectory(dir);
    allValid = allValid && dirValid;
  }

  console.log('\n' + '='.repeat(50));

  if (allValid) {
    console.log('✅ All experiment configurations are valid!');
    process.exit(0);
  } else {
    console.log('❌ Some experiment configurations have errors.');
    console.log('Please fix the errors above before proceeding.');
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
