// packages/types/src/experiment-validators.ts
import { z } from 'zod';
import {
  experimentRegistrySchema,
  experimentBatchSchema,
  experimentMigrationSchema,
  type ExperimentRegistry,
  type ExperimentBatch,
  type ValidationResult,
  ExperimentStatus,
} from './experiments.js';

/**
 * User-friendly error message mapping for common validation errors
 */
const ERROR_MESSAGES: Record<string, string> = {
  // ID validation
  'id.too_small': 'Experiment ID cannot be empty',
  'id.too_big': 'Experiment ID is too long (maximum 100 characters)',
  'id.invalid_string': 'Experiment ID must contain only letters, numbers, underscores, and hyphens',
  
  // Name validation
  'name.too_small': 'Experiment name is required',
  'name.too_big': 'Experiment name is too long (maximum 200 characters)',
  
  // Hypothesis validation
  'hypothesis.too_small': 'Hypothesis must be at least 10 characters long',
  'hypothesis.too_big': 'Hypothesis is too long (maximum 1000 characters)',
  
  // Metrics validation
  'metrics.primary.too_small': 'Primary metric name is required',
  'metrics.guardrails.too_small': 'At least one guardrail metric is recommended for safety',
  
  // Date validation
  'start_date.invalid_string': 'Start date must be in ISO 8601 format (e.g., 2025-08-25T10:00:00Z)',
  'end_date.invalid_string': 'End date must be in ISO 8601 format (e.g., 2025-08-25T10:00:00Z)',
  
  // Owner validation
  'owner.invalid_string': 'Owner must be a valid email address',
  
  // Variants validation
  'variants.too_small': 'Experiment must have at least 2 variants (control and treatment)',
  'variants.too_big': 'Too many variants - consider splitting into separate experiments (maximum 10)',
  
  // Traffic allocation
  'traffic_allocation': 'Variant traffic percentages must sum to exactly 100%',
  
  // Status validation
  'status.invalid_enum_value': 'Status must be one of: planned, running, completed, aborted, analyzing',
};

/**
 * Generate user-friendly error message from Zod issue
 */
function getUserFriendlyMessage(issue: z.ZodIssue): string {
  const path = issue.path.join('.');
  const key = `${path}.${issue.code}`;
  
  // Check for specific error message mapping
  if (ERROR_MESSAGES[key]) {
    return ERROR_MESSAGES[key];
  }
  
  // Check for path-specific messages
  if (ERROR_MESSAGES[path]) {
    return ERROR_MESSAGES[path];
  }
  
  // Handle custom validation messages
  if (issue.message && issue.message !== 'Invalid input') {
    return issue.message;
  }
  
  // Fallback to generic message based on code
  switch (issue.code) {
    case 'too_small':
      return `${path} is too short or missing`;
    case 'too_big':
      return `${path} is too long`;
    case 'invalid_string':
      return `${path} has an invalid format`;
    case 'invalid_enum_value':
      return `${path} has an invalid value`;
    case 'invalid_type':
      return `${path} has the wrong data type`;
    case 'custom':
      return issue.message;
    default:
      return `${path}: ${issue.message}`;
  }
}

/**
 * Validate a single experiment configuration
 */
export function validateExperiment(data: unknown): ValidationResult<ExperimentRegistry> {
  try {
    const result = experimentRegistrySchema.safeParse(data);
    
    if (result.success) {
      // Additional business rule validations
      const warnings: string[] = [];
      
      // Check for potential issues
      if (result.data.variants.length > 5) {
        warnings.push('Consider reducing the number of variants for clearer results');
      }
      
      // Check traffic allocation balance
      const controlVariants = result.data.variants.filter(v => 
        v.id.toLowerCase().includes('control') || v.id.toLowerCase().includes('baseline')
      );
      if (controlVariants.length === 0) {
        warnings.push('Consider having a clear control/baseline variant for comparison');
      }
      
      // Check experiment duration
      const startDate = new Date(result.data.start_date);
      const endDate = new Date(result.data.end_date);
      const durationDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (durationDays < 7) {
        warnings.push('Experiments shorter than 1 week may not capture weekly patterns');
      } else if (durationDays > 90) {
        warnings.push('Long experiments may be affected by external factors - consider shorter duration');
      }
      
      return {
        success: true,
        data: result.data,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    } else {
      return {
        success: false,
        error: {
          message: 'Experiment validation failed',
          issues: result.error.issues,
          code: 'VALIDATION_ERROR',
        },
      };
    }
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Unknown validation error',
        issues: [],
        code: 'VALIDATION_ERROR',
      },
    };
  }
}

/**
 * Validate a batch of experiments
 */
export function validateExperimentBatch(data: unknown): ValidationResult<ExperimentBatch> {
  try {
    const result = experimentBatchSchema.safeParse(data);
    
    if (result.success) {
      const warnings: string[] = [];
      
      // Validate each experiment individually and collect warnings
      result.data.experiments.forEach((exp, index) => {
        const validation = validateExperiment(exp);
        if (validation.success && validation.warnings) {
          warnings.push(...validation.warnings.map(w => `Experiment ${index + 1}: ${w}`));
        }
      });
      
      // Check for duplicate IDs within batch
      const ids = result.data.experiments.map(exp => exp.id);
      const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
      if (duplicateIds.length > 0) {
        return {
          success: false,
          error: {
            message: `Duplicate experiment IDs found in batch: ${duplicateIds.join(', ')}`,
            issues: [],
            code: 'BUSINESS_RULE_ERROR',
          },
        };
      }
      
      return {
        success: true,
        data: result.data,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    } else {
      return {
        success: false,
        error: {
          message: 'Batch validation failed',
          issues: result.error.issues,
          code: 'VALIDATION_ERROR',
        },
      };
    }
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Unknown batch validation error',
        issues: [],
        code: 'VALIDATION_ERROR',
      },
    };
  }
}

/**
 * Format validation errors for UI display
 */
export function formatValidationErrors<T>(result: ValidationResult<T>): Record<string, string[]> {
  if (result.success) {
    return {};
  }
  
  const errors: Record<string, string[]> = {};
  
  result.error.issues.forEach(issue => {
    const path = issue.path.length > 0 ? issue.path.join('.') : 'root';
    const message = getUserFriendlyMessage(issue);
    
    errors[path] ??= [];
    errors[path].push(message);
  });
  
  return errors;
}

/**
 * Check if experiment can be started (business rules)
 */
export function canStartExperiment(experiment: ExperimentRegistry): ValidationResult<boolean> {
  const issues: z.ZodIssue[] = [];
  
  // Check status
  if (experiment.status !== ExperimentStatus.PLANNED) {
    issues.push({
      code: 'custom',
      path: ['status'],
      message: 'Only planned experiments can be started',
    });
  }
  
  // Check start date
  const now = new Date();
  const startDate = new Date(experiment.start_date);
  
  if (startDate > new Date(now.getTime() + 24 * 60 * 60 * 1000)) {
    issues.push({
      code: 'custom',
      path: ['start_date'],
      message: 'Cannot start experiment more than 24 hours in the future',
    });
  }
  
  // Check variants have valid configuration
  const hasInvalidVariants = experiment.variants.some(variant => 
    !variant.config || Object.keys(variant.config).length === 0
  );
  
  if (hasInvalidVariants) {
    issues.push({
      code: 'custom',
      path: ['variants'],
      message: 'All variants must have configuration defined before starting',
    });
  }
  
  if (issues.length > 0) {
    return {
      success: false,
      error: {
        message: 'Experiment cannot be started',
        issues,
        code: 'BUSINESS_RULE_ERROR',
      },
    };
  }
  
  return {
    success: true,
    data: true,
  };
}

/**
 * Migration utilities for existing experiment data
 */
export class ExperimentMigration {
  /**
   * Migrate experiment from version 1 to version 2
   * (Add config field and default statistical settings)
   */
  static migrateV1toV2(experimentV1: Record<string, unknown>): ExperimentRegistry {
    const migrated = {
      ...experimentV1,
      config: (experimentV1.config as Record<string, unknown>) ?? {
        statistical_power: 0.8,
        significance_level: 0.05,
        randomization_unit: 'user' as const,
      },
      version: 2,
      updated_at: new Date().toISOString(),
    };
    
    // Validate the migrated experiment
    const validation = validateExperiment(migrated);
    if (!validation.success) {
      throw new Error(`Migration failed: ${validation.error.message}`);
    }
    
    return validation.data;
  }
  
  /**
   * Auto-detect version and apply appropriate migration
   */
  static migrate(experiment: Record<string, unknown>): ExperimentRegistry {
    const version = (experiment.version as number) ?? 1;
    
    switch (version) {
      case 1:
        return this.migrateV1toV2(experiment);
      default: {
        // Validate current version
        const validation = validateExperiment(experiment);
        if (!validation.success) {
          throw new Error(`Invalid experiment data: ${validation.error.message}`);
        }
        return validation.data;
      }
    }
  }
  
  /**
   * Validate migration configuration
   */
  static validateMigration(data: unknown): ValidationResult<{ from_version: number; to_version: number; experiment_ids?: string[]; dry_run: boolean; backup_created: boolean }> {
    const result = experimentMigrationSchema.safeParse(data);
    
    if (result.success) {
      return {
        success: true,
        data: result.data,
      };
    } else {
      return {
        success: false,
        error: {
          message: 'Migration configuration validation failed',
          issues: result.error.issues,
          code: 'VALIDATION_ERROR',
        },
      };
    }
  }
}

/**
 * Utility functions for common validations
 */
export const ExperimentValidation = {
  validateExperiment,
  validateExperimentBatch,
  formatValidationErrors,
  canStartExperiment,
  getUserFriendlyMessage,
  
  // Quick validation helpers
  isValidExperimentId: (id: string): boolean => {
    return /^[a-zA-Z0-9_-]+$/.test(id) && id.length > 0 && id.length <= 100;
  },
  
  isValidStatus: (status: string): status is keyof typeof ExperimentStatus => {
    return Object.values(ExperimentStatus).includes(status as typeof ExperimentStatus[keyof typeof ExperimentStatus]);
  },
  
  isValidDateRange: (startDate: string, endDate: string): boolean => {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      return start < end && !isNaN(start.getTime()) && !isNaN(end.getTime());
    } catch {
      return false;
    }
  },
  
  isValidTrafficAllocation: (variants: { traffic_percentage: number }[]): boolean => {
    const total = variants.reduce((sum, v) => sum + v.traffic_percentage, 0);
    return Math.abs(total - 100) < 0.01;
  },
} as const;
