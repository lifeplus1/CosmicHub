# 🧪 Experiment Registry Schema Validator (EXP-010)

> **Status**: ✅ **COMPLETE**  
> **Implementation**: Full schema validation system with TypeScript types, JSON schema, and CLI
> validation tools  
> **Test Coverage**: 20 passing tests covering all validation scenarios

## 📋 **Overview**

The Experiment Registry Schema Validator provides a comprehensive validation system for user
experiments and configurations in CosmicHub. This implementation includes:

- ✅ **Runtime Validation**: TypeScript/Zod-based validation with detailed error messages
- ✅ **JSON Schema**: Standards-compliant schema for external validation
- ✅ **Migration Support**: Automatic migration from older schema versions
- ✅ **CLI Tool**: Command-line validation script for development workflow
- ✅ **User-Friendly Errors**: Clear, actionable error messages for developers

## 🏗️ **Architecture**

### **Core Components**

```text
📁 packages/types/src/
├── experiments.ts           # Core schema definitions and types
├── experiment-validators.ts # Validation functions and migration utilities
└── experiments.test.ts      # Comprehensive test suite (20 tests)

📁 schema/
└── experiment-registry.schema.json # JSON Schema for external tools

📁 scripts/
└── validate-experiments.mjs # CLI validation tool
```

### **Type System**

```typescript
// Core experiment registry type
interface ExperimentRegistry {
  id: string;
  name: string;
  hypothesis: string;
  metrics: {
    primary: string;
    guardrails: string[];
    secondary?: string[];
  };
  variants: ExperimentVariant[];
  start_date: string;
  end_date: string;
  segment: string;
  owner: string;
  status: 'planned' | 'running' | 'completed' | 'aborted' | 'analyzing';
  tags?: string[];
  config?: ExperimentConfig;
  version: number;
}
```

## 🚀 **Usage**

### **1. TypeScript Validation**

```typescript
import { validateExperiment, ExperimentRegistry } from '@cosmichub/types';

const experiment: ExperimentRegistry = {
  id: 'ai_interpretation_test_001',
  name: 'AI Interpretation A/B Test',
  hypothesis: 'Users prefer detailed interpretations over concise ones',
  // ... rest of configuration
};

const result = validateExperiment(experiment);
if (result.success) {
  console.log('Valid experiment:', result.data);
  if (result.warnings) {
    console.warn('Warnings:', result.warnings);
  }
} else {
  console.error('Validation errors:', result.error);
}
```

### **2. CLI Validation**

```bash
# Validate experiments in specific directory
pnpm run validate-experiments tests/fixtures/experiments

# Validate all standard experiment locations
pnpm run validate-experiments

# Direct script usage
node scripts/validate-experiments.mjs path/to/experiments/
```

### **3. JSON Schema Validation**

The JSON schema at `schema/experiment-registry.schema.json` can be used with any JSON Schema
validator:

```javascript
import Ajv from 'ajv';
import schema from './schema/experiment-registry.schema.json';

const ajv = new Ajv();
const validate = ajv.compile(schema);
const valid = validate(experimentData);
```

## 📊 **Validation Features**

### **Schema Validation**

- **Required Fields**: Ensures all mandatory fields are present
- **Format Validation**: ID patterns, email formats, date-time strings
- **Range Validation**: Traffic percentages, sample sizes, statistical parameters
- **Business Rules**: Traffic allocation sums to 100%, end date after start date

### **Business Logic Validation**

- **Experiment Lifecycle**: Status transition validation
- **Configuration Completeness**: All variants have proper configuration
- **Safety Checks**: Guardrail metrics defined, reasonable durations
- **Best Practices**: Control variant presence, variant count recommendations

### **User-Friendly Error Messages**

```text
❌ Validation Errors:
   - id: Experiment ID can only contain letters, numbers, underscores, and hyphens
   - variants: Traffic percentages must sum to exactly 100%
   - owner: Owner must be a valid email address

⚠️  Warnings:
   - Consider reducing the number of variants for clearer results
   - Experiment duration is less than 1 week - may not capture weekly patterns
```

## 🔄 **Migration System**

### **Automatic Version Detection**

```typescript
import { ExperimentMigration } from '@cosmichub/types';

// Auto-migrate any version to current schema
const migratedExperiment = ExperimentMigration.migrate(oldExperimentData);

// Specific version migration
const v2Experiment = ExperimentMigration.migrateV1toV2(v1ExperimentData);
```

### **Migration Path: V1 → V2**

- **Added**: `config` field with statistical parameters
- **Added**: `secondary` metrics array
- **Added**: `tags` for categorization
- **Default Values**: Statistical power (0.8), significance level (0.05)

## 📋 **Validation Rules**

### **Required Fields**

- `id`: 1-100 chars, alphanumeric + underscores/hyphens
- `name`: 1-200 chars, human-readable name
- `hypothesis`: 10-1000 chars, detailed hypothesis
- `metrics.primary`: Primary success metric
- `variants`: 2-10 variants, traffic sums to 100%
- `start_date`: ISO 8601 datetime
- `end_date`: ISO 8601 datetime (after start_date)
- `segment`: Target user segment
- `owner`: Valid email address
- `status`: One of planned/running/completed/aborted/analyzing

### **Optional Fields**

- `description`: Additional context (max 2000 chars)
- `metrics.secondary`: Additional metrics to track
- `tags`: Categorization tags (max 10)
- `config`: Statistical configuration
- `created_at`/`updated_at`: Timestamps
- `version`: Schema version (defaults to 1)

### **Business Rules**

- Variants traffic percentages must sum to 100%
- End date must be after start date
- Planned experiments cannot start in the past
- All variants must have configuration before starting
- Maximum 10 variants per experiment
- Maximum 20 guardrail metrics

## 🧪 **Testing**

### **Test Coverage: 20 Tests**

```bash
cd packages/types
npm test -- experiments

✓ Basic Schema Validation (4 tests)
✓ Validation Functions (4 tests)
✓ Business Rules Validation (3 tests)
✓ Utility Functions (4 tests)
✓ Migration (2 tests)
✓ Edge Cases (2 tests)
✓ Integration with Firestore (1 test)
```

### **Test Categories**

- **Schema Validation**: Valid/invalid experiment configurations
- **Error Messages**: User-friendly error message generation
- **Business Rules**: Experiment lifecycle and safety validations
- **Utilities**: Helper functions for common validations
- **Migration**: Version upgrade scenarios
- **Edge Cases**: Boundary conditions and extreme values

## 📁 **Example Experiment**

```json
{
  "id": "ai_interpretation_length_test",
  "name": "AI Interpretation Length A/B Test",
  "hypothesis": "Users prefer detailed interpretations over concise ones, leading to higher engagement",
  "metrics": {
    "primary": "user_engagement_score",
    "guardrails": ["session_duration", "bounce_rate", "error_rate"],
    "secondary": ["interpretation_rating", "time_on_page"]
  },
  "variants": [
    {
      "id": "control",
      "name": "Current (Concise)",
      "traffic_percentage": 50,
      "config": {
        "max_interpretation_length": 500,
        "include_examples": false
      }
    },
    {
      "id": "detailed",
      "name": "Detailed Interpretations",
      "traffic_percentage": 50,
      "config": {
        "max_interpretation_length": 1500,
        "include_examples": true
      }
    }
  ],
  "start_date": "2025-09-01T00:00:00Z",
  "end_date": "2025-09-30T23:59:59Z",
  "segment": "premium_users",
  "owner": "experiments@cosmichub.app",
  "status": "planned",
  "tags": ["ai", "ux", "engagement"],
  "config": {
    "sample_size": 1000,
    "statistical_power": 0.8,
    "significance_level": 0.05,
    "randomization_unit": "user"
  },
  "version": 1
}
```

## 🔧 **Integration Points**

### **Frontend (React/TypeScript)**

```typescript
import { ExperimentValidationState, formatValidationErrors } from '@cosmichub/types';

// Form validation state
const [validationState, setValidationState] = useState<ExperimentValidationState>({
  isValid: false,
  errors: {},
  warnings: {},
  isValidating: false,
});

// Real-time validation
const handleExperimentChange = (experiment: Partial<ExperimentRegistry>) => {
  const result = validateExperiment(experiment);
  setValidationState({
    isValid: result.success,
    errors: result.success ? {} : formatValidationErrors(result),
    warnings: result.success ? result.warnings || [] : [],
    isValidating: false,
  });
};
```

### **Backend (Python/FastAPI)**

```python
# Backend validation can use the JSON schema
import jsonschema

with open('schema/experiment-registry.schema.json') as f:
    schema = json.load(f)

try:
    jsonschema.validate(experiment_data, schema)
except jsonschema.ValidationError as e:
    return {"error": f"Invalid experiment: {e.message}"}
```

### **Database (Firestore)**

```typescript
// Validate before saving to Firestore
const saveExperiment = async (experiment: unknown) => {
  const result = validateExperiment(experiment);

  if (!result.success) {
    throw new Error(`Invalid experiment: ${result.error.message}`);
  }

  const doc = {
    ...result.data,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  await db.collection('experiments').doc(result.data.id).set(doc);
};
```

## 📈 **Benefits**

### **Development Experience**

- **Type Safety**: Full TypeScript support with IntelliSense
- **Fast Feedback**: Real-time validation during development
- **Clear Errors**: User-friendly error messages with suggestions
- **CLI Integration**: Easy validation in CI/CD pipelines

### **Data Quality**

- **Schema Validation**: Prevents malformed experiment configurations
- **Business Rules**: Ensures experiments follow best practices
- **Migration Support**: Seamless upgrades when schema evolves
- **Consistency**: Uniform experiment structure across platform

### **Operational Benefits**

- **Early Error Detection**: Catch issues before deployment
- **Automated Validation**: CI/CD integration prevents bad experiments
- **Debugging Support**: Clear validation errors aid troubleshooting
- **Documentation**: Self-documenting schema with examples

## 🎯 **Future Enhancements**

### **Planned Features**

- **Visual Schema Editor**: UI for creating/editing experiment schemas
- **Integration Tests**: End-to-end validation with Firestore
- **Performance Optimization**: Validation caching for large batches
- **Advanced Business Rules**: Statistical power validation, A/B test design rules

### **Extensibility**

- **Custom Validators**: Plugin system for domain-specific validation
- **Schema Extensions**: Support for experiment-type-specific fields
- **Metrics Integration**: Validation against available metrics in system
- **Approval Workflows**: Validation steps for experiment approval process

---

## 📞 **Quick Commands**

```bash
# Test the validation system
cd packages/types && npm test -- experiments

# Validate experiment files
pnpm run validate-experiments

# Build type definitions
cd packages/types && npm run build

# Check schema compliance
node -e "console.log(require('./schema/experiment-registry.schema.json'))"
```

**Status**: ✅ **EXP-010 Implementation Complete** - Full experiment registry schema validation
system operational with comprehensive testing and documentation.
