// packages/types/src/experiments.ts
import { z } from 'zod';

// Experiment Status Enum
export const ExperimentStatus = {
  PLANNED: 'planned',
  RUNNING: 'running',
  COMPLETED: 'completed',
  ABORTED: 'aborted',
  ANALYZING: 'analyzing',
} as const;

// Experiment Configuration Schema
  .strict();

  .strict();

  .strict();

// Core Experiment Registry Schema
export const experimentRegistrySchema = z
  .object({
    id: z
      .string()
      .min(1, 'Experiment ID is required')
      .max(100, 'Experiment ID too long')
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        'Experiment ID can only contain letters, numbers, underscores, and hyphens'
      )
      .describe('Unique identifier for the experiment'),

    name: z
      .string()
      .min(1, 'Experiment name is required')
      .max(200, 'Experiment name too long')
      .describe('Human-readable name of the experiment'),

    hypothesis: z
      .string()
      .min(10, 'Hypothesis must be at least 10 characters')
      .max(1000, 'Hypothesis too long')
      .describe('Detailed description of the experiment hypothesis'),

    description: z
      .string()
      .max(2000, 'Description too long')
      .optional()
      .describe('Additional context and background for the experiment'),

    metrics: experimentMetricsSchema.describe(
      'Metrics configuration for the experiment'
    ),

    variants: z
      .array(experimentVariantSchema)
      .min(2, 'Experiment must have at least 2 variants (control + treatment)')
      .max(
        10,
        'Too many variants - consider splitting into multiple experiments'
      )
      .refine(
        variants => {
          const totalTraffic = variants.reduce(
            (sum, v) => sum + v.traffic_percentage,
            0
          );
          return Math.abs(totalTraffic - 100) < 0.01; // Allow for floating point precision
        },
        { message: 'Variant traffic percentages must sum to 100%' }
      )
      .describe('Array of experiment variants'),

    start_date: z
      .string()
      .datetime({ offset: true })
      .describe('Start date and time of the experiment in ISO 8601 format'),

    end_date: z
      .string()
      .datetime({ offset: true })
      .describe('End date and time of the experiment in ISO 8601 format'),

    segment: z
      .string()
      .min(1, 'Target segment is required')
      .max(100, 'Segment name too long')
      .describe('User segment or group targeted by the experiment'),

    owner: z
      .string()
      .min(1, 'Owner is required')
      .max(100, 'Owner name too long')
      .email('Owner must be a valid email address')
      .describe('Owner or responsible party for the experiment'),

    status: z
      .enum(Object.values(ExperimentStatus) as [string, ...string[]])
      .describe('Current status of the experiment'),

    tags: z
      .array(z.string())
      .max(10, 'Too many tags')
      .optional()
      .describe('Tags for categorizing and searching experiments'),

    config: experimentConfigSchema
      .optional()
      .describe('Statistical and technical configuration for the experiment'),

    created_at: z
      .string()
      .datetime({ offset: true })
      .optional()
      .describe('Timestamp when the experiment was created'),

    updated_at: z
      .string()
      .datetime({ offset: true })
      .optional()
      .describe('Timestamp when the experiment was last updated'),

    version: z
      .number()
      .int()
      .min(1)
      .default(1)
      .describe('Schema version for migration support'),
  })
  .strict()
  .refine(data => new Date(data.end_date) > new Date(data.start_date), {
    message: 'End date must be after start date',
    path: ['end_date'],
  })
  .refine(
    data => {
      const now = new Date();
      const startDate = new Date(data.start_date);

      // Allow experiments to start in the past only if they're already running/completed
      if (data.status === 'planned' && startDate < now) {
        return false;
      }
      return true;
    },
    {
      message: 'Planned experiments cannot have a start date in the past',
      path: ['start_date'],
    }
  );

// Experiment Batch Schema (for bulk operations)
export const experimentBatchSchema = z
  .object({
    experiments: z
      .array(experimentRegistrySchema)
      .min(1, 'Batch must contain at least one experiment')
      .max(50, 'Batch too large - maximum 50 experiments at once'),

    batch_id: z.string().min(1, 'Batch ID is required').optional(),

    validation_mode: z
      .enum(['strict', 'lenient'])
      .default('strict')
      .describe(
        'Validation mode: strict (fail on any error) or lenient (continue with warnings)'
      ),
  })
  .strict();

// Experiment Migration Schema
export const experimentMigrationSchema = z
  .object({
    from_version: z.number().int().min(1),
    to_version: z.number().int().min(1),
    experiment_ids: z.array(z.string()).optional(),
    dry_run: z.boolean().default(true),
    backup_created: z.boolean().default(false),
  })
  .strict();

// Type exports

// Validation result types
      data: T;
      warnings?: string[];
    }
  | {
      success: false;
      error: {
        message: string;
        issues: z.ZodIssue[];
        code: 'VALIDATION_ERROR' | 'BUSINESS_RULE_ERROR';
      };
    };

// Experiment validation state for UI
  errors: Record<string, string[]>;
  warnings: Record<string, string[]>;
  isValidating: boolean;
}

// Export schemas for external use
