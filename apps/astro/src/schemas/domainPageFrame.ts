/**
 * Domain Page Frame Component Schemas
 * Following unified type validation strategy with Zod schemas
 */

import { z } from 'zod';

/**
 * Schema for DomainPageFrame component props
 * Validates all input props at runtime
 */
export const DomainPageFramePropsSchema = z.object({
  /** Page title displayed in the header */
  title: z.string().min(1, 'Title must not be empty').max(100, 'Title must be less than 100 characters'),
  
  /** Optional refresh handler for page content */
  onRefresh: z.function().optional(),
  
  /** Loading state indicator for refresh operation */
  isRefreshing: z.boolean().optional().default(false),
  
  /** Error state to display error messages */
  error: z.instanceof(Error).nullable().optional(),
  
  /** Additional action buttons for the header */
  actions: z.any().optional(), // ReactNode type - can't be validated by Zod
  
  /** Main page content */
  children: z.any(), // ReactNode type - can't be validated by Zod
  
  /** Optional CSS class name for custom styling */
  className: z.string().optional(),
  
  /** Test identifier for component testing */
  'data-testid': z.string().optional(),
  
  /** ARIA label for accessibility */
  'aria-label': z.string().optional(),
});

/**
 * Inferred TypeScript type from Zod schema
 */
export type DomainPageFramePropsType = z.infer<typeof DomainPageFramePropsSchema>;

/**
 * Schema for validating page refresh action
 */
export const PageRefreshActionSchema = z.object({
  isRefreshing: z.boolean(),
  timestamp: z.number().optional(),
  source: z.enum(['user', 'auto', 'error']).optional(),
});

export type PageRefreshAction = z.infer<typeof PageRefreshActionSchema>;

/**
 * Schema for page error states
 */
export const PageErrorStateSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
  timestamp: z.number().optional(),
  stack: z.string().optional(),
  recoverable: z.boolean().default(true),
});

export type PageErrorState = z.infer<typeof PageErrorStateSchema>;

/**
 * Validation helper function for DomainPageFrame props
 * @param props - Props to validate
 * @returns Validated props or throws validation error
 */
export function validateDomainPageFrameProps(props: unknown): DomainPageFramePropsType {
  return DomainPageFramePropsSchema.parse(props);
}

/**
 * Safe validation helper that returns success/error result
 * @param props - Props to validate
 * @returns Validation result with success flag and data/errors
 */
export function safeParseDomainPageFrameProps(props: unknown) {
  return DomainPageFramePropsSchema.safeParse(props);
}
