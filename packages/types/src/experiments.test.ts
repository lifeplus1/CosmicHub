// packages/types/src/experiments.test.ts
import { describe, it, expect } from 'vitest';
import {
  experimentRegistrySchema,
  ExperimentStatus,
  type ExperimentRegistry,
} from './experiments.js';
import {
  validateExperiment,
  validateExperimentBatch,
  formatValidationErrors,
  canStartExperiment,
  ExperimentValidation,
  ExperimentMigration,
} from './experiment-validators.js';

describe('Experiment Schema Validation', () => {
  const validExperiment: ExperimentRegistry = {
    id: 'test_experiment_001',
    name: 'Test Experiment',
    hypothesis: 'This is a test hypothesis for validation purposes',
    metrics: {
      primary: 'conversion_rate',
      guardrails: ['error_rate', 'bounce_rate'],
    },
    variants: [
      {
        id: 'control',
        name: 'Control Variant',
        traffic_percentage: 50,
        config: { feature_enabled: false },
      },
      {
        id: 'treatment',
        name: 'Treatment Variant',
        traffic_percentage: 50,
        config: { feature_enabled: true },
      },
    ],
    start_date: '2025-09-01T00:00:00Z',
    end_date: '2025-09-30T23:59:59Z',
    segment: 'all_users',
    owner: 'test@cosmichub.app',
    status: ExperimentStatus.PLANNED,
    version: 1,
  };

  describe('Basic Schema Validation', () => {
    it('should validate a correct experiment', () => {
      const result = experimentRegistrySchema.safeParse(validExperiment);
      expect(result.success).toBe(true);
    });

    it('should reject experiment with invalid ID format', () => {
      const invalidExperiment = {
        ...validExperiment,
        id: 'invalid id with spaces',
      };
      const result = experimentRegistrySchema.safeParse(invalidExperiment);
      expect(result.success).toBe(false);
    });

    it('should reject experiment with invalid traffic allocation', () => {
      const invalidExperiment = {
        ...validExperiment,
        variants: [
          { ...validExperiment.variants[0], traffic_percentage: 60 },
          { ...validExperiment.variants[1], traffic_percentage: 60 },
        ],
      };
      const result = experimentRegistrySchema.safeParse(invalidExperiment);
      expect(result.success).toBe(false);
    });

    it('should reject experiment with end date before start date', () => {
      const invalidExperiment = {
        ...validExperiment,
        start_date: '2025-09-30T00:00:00Z',
        end_date: '2025-09-01T23:59:59Z',
      };
      const result = experimentRegistrySchema.safeParse(invalidExperiment);
      expect(result.success).toBe(false);
    });
  });

  describe('Validation Functions', () => {
    it('should validate experiment with warnings', () => {
      const result = validateExperiment(validExperiment);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe(validExperiment.id);
      }
    });

    it('should return user-friendly error messages', () => {
      const invalidExperiment = {
        ...validExperiment,
        id: '',
        owner: 'invalid-email',
      };
      const result = validateExperiment(invalidExperiment);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const errors = formatValidationErrors(result);
        expect(errors).toHaveProperty('id');
        expect(errors).toHaveProperty('owner');
      }
    });

    it('should validate experiment batch', () => {
      const batch = {
        experiments: [validExperiment],
        validation_mode: 'strict' as const,
      };
      const result = validateExperimentBatch(batch);
      expect(result.success).toBe(true);
    });

    it('should detect duplicate IDs in batch', () => {
      const batch = {
        experiments: [validExperiment, validExperiment],
        validation_mode: 'strict' as const,
      };
      const result = validateExperimentBatch(batch);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('Duplicate experiment IDs');
      }
    });
  });

  describe('Business Rules Validation', () => {
    it('should allow starting a planned experiment', () => {
      const experiment = {
        ...validExperiment,
        status: ExperimentStatus.PLANNED,
        start_date: new Date().toISOString(),
      };
      const result = canStartExperiment(experiment);
      expect(result.success).toBe(true);
    });

    it('should prevent starting a running experiment', () => {
      const experiment = {
        ...validExperiment,
        status: ExperimentStatus.RUNNING,
      };
      const result = canStartExperiment(experiment);
      expect(result.success).toBe(false);
    });

    it('should prevent starting experiment without variant configs', () => {
      const experiment = {
        ...validExperiment,
        variants: validExperiment.variants.map(v => ({ ...v, config: undefined })),
      };
      const result = canStartExperiment(experiment);
      expect(result.success).toBe(false);
    });
  });

  describe('Utility Functions', () => {
    it('should validate experiment ID format', () => {
      expect(ExperimentValidation.isValidExperimentId('valid_id_123')).toBe(true);
      expect(ExperimentValidation.isValidExperimentId('invalid id')).toBe(false);
      expect(ExperimentValidation.isValidExperimentId('')).toBe(false);
    });

    it('should validate experiment status', () => {
      expect(ExperimentValidation.isValidStatus('planned')).toBe(true);
      expect(ExperimentValidation.isValidStatus('invalid')).toBe(false);
    });

    it('should validate date range', () => {
      expect(
        ExperimentValidation.isValidDateRange(
          '2025-01-01T00:00:00Z',
          '2025-01-31T23:59:59Z'
        )
      ).toBe(true);
      expect(
        ExperimentValidation.isValidDateRange(
          '2025-01-31T00:00:00Z',
          '2025-01-01T23:59:59Z'
        )
      ).toBe(false);
    });

    it('should validate traffic allocation', () => {
      const validVariants = [
        { traffic_percentage: 50 },
        { traffic_percentage: 50 },
      ];
      const invalidVariants = [
        { traffic_percentage: 60 },
        { traffic_percentage: 60 },
      ];
      
      expect(ExperimentValidation.isValidTrafficAllocation(validVariants)).toBe(true);
      expect(ExperimentValidation.isValidTrafficAllocation(invalidVariants)).toBe(false);
    });
  });

  describe('Migration', () => {
    it('should migrate v1 experiment to v2', () => {
      const v1Experiment = {
        ...validExperiment,
        version: undefined,
        config: undefined,
      };
      
      const migrated = ExperimentMigration.migrateV1toV2(v1Experiment);
      expect(migrated.version).toBe(2);
      expect(migrated.config).toBeDefined();
      expect(migrated.config?.statistical_power).toBe(0.8);
    });

    it('should auto-detect and migrate experiment', () => {
      const oldExperiment = {
        ...validExperiment,
        version: 1,
        config: undefined,
      };
      
      const migrated = ExperimentMigration.migrate(oldExperiment);
      expect(migrated.version).toBe(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle minimum and maximum values', () => {
      const extremeExperiment = {
        ...validExperiment,
        variants: Array.from({ length: 10 }, (_, i) => ({
          id: `variant_${i}`,
          name: `Variant ${i}`,
          traffic_percentage: 10,
          config: {},
        })),
        config: {
          sample_size: 10,
          statistical_power: 0.1,
          significance_level: 0.1,
          minimum_detectable_effect: 0.001,
          randomization_unit: 'pageview' as const,
        },
      };
      
      const result = validateExperiment(extremeExperiment);
      expect(result.success).toBe(true);
    });

    it('should reject experiment exceeding limits', () => {
      const invalidExperiment = {
        ...validExperiment,
        variants: Array.from({ length: 15 }, (_, i) => ({
          id: `variant_${i}`,
          name: `Variant ${i}`,
          traffic_percentage: 100 / 15,
          config: {},
        })),
      };
      
      const result = validateExperiment(invalidExperiment);
      expect(result.success).toBe(false);
    });
  });
});

describe('Integration with Firestore', () => {
  const validExperiment: ExperimentRegistry = {
    id: 'firestore_test_001',
    name: 'Firestore Integration Test',
    hypothesis: 'This experiment tests Firestore document creation',
    metrics: {
      primary: 'conversion_rate',
      guardrails: ['error_rate'],
    },
    variants: [
      {
        id: 'control',
        name: 'Control',
        traffic_percentage: 50,
        config: { enabled: false },
      },
      {
        id: 'treatment',
        name: 'Treatment',
        traffic_percentage: 50,
        config: { enabled: true },
      },
    ],
    start_date: '2025-09-01T00:00:00Z',
    end_date: '2025-09-30T23:59:59Z',
    segment: 'test_users',
    owner: 'test@cosmichub.app',
    status: ExperimentStatus.PLANNED,
    version: 1,
  };

  it('should create valid document for Firestore', () => {
    const result = validateExperiment(validExperiment);
    
    if (result.success) {
      // Simulate Firestore document creation
      const doc = {
        ...result.data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      expect(doc.id).toBeTruthy();
      expect(doc.created_at).toBeTruthy();
      expect(doc.updated_at).toBeTruthy();
    }
  });
});
