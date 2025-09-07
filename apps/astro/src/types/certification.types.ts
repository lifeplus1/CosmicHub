/**
 * Certification Portal Type Definitions
 * Provides comprehensive type safety for certification management system
 */

import { z } from 'zod';

// Zod schemas for runtime validation
export const CertificationLevelSchema = z.enum(['foundation', 'intermediate', 'advanced', 'master']);
export const CertificationCategorySchema = z.enum(['practitioner', 'researcher', 'educator', 'clinical']);
export const CertificationFormatSchema = z.enum(['online', 'hybrid', 'in-person']);
export const ModuleTypeSchema = z.enum(['video', 'reading', 'assignment', 'quiz', 'practicum']);
export const CollaborationStatusSchema = z.enum(['interested', 'active', 'lead', 'advisor']);
export const ProgramStatusSchema = z.enum(['proposal', 'approved', 'active', 'completed', 'published']);

export const ModuleSchema = z.object({
  id: z.string(),
  title: z.string(),
  duration: z.string(),
  type: ModuleTypeSchema,
  description: z.string(),
  isCompleted: z.boolean().optional(),
  score: z.number().min(0).max(100).optional()
});

export const TestimonialSchema = z.object({
  id: z.string(),
  name: z.string(),
  title: z.string(),
  organization: z.string(),
  content: z.string(),
  rating: z.number().min(1).max(5),
  date: z.string()
});

export const CertificationProgramSchema = z.object({
  id: z.string(),
  title: z.string(),
  level: CertificationLevelSchema,
  category: CertificationCategorySchema,
  duration: z.string(),
  credits: z.number().min(1),
  price: z.number().min(0),
  description: z.string(),
  prerequisites: z.array(z.string()),
  learningOutcomes: z.array(z.string()),
  modules: z.array(ModuleSchema),
  instructors: z.array(z.string()),
  nextCohort: z.string(),
  enrollmentDeadline: z.string(),
  format: CertificationFormatSchema,
  accreditation: z.array(z.string()),
  testimonials: z.array(TestimonialSchema)
});

export const StudentProgressSchema = z.object({
  programId: z.string(),
  enrollmentDate: z.string(),
  completionPercentage: z.number().min(0).max(100),
  modulesCompleted: z.number().min(0),
  totalModules: z.number().min(1),
  currentModule: z.string(),
  estimatedCompletion: z.string(),
  grades: z.array(z.object({
    moduleId: z.string(),
    score: z.number().min(0).max(100),
    maxScore: z.number().min(1),
    feedback: z.string().optional()
  }))
});

export const CertificationDataSchema = z.object({
  id: z.string(),
  programId: z.string(),
  studentId: z.string(),
  issuedDate: z.string(),
  expirationDate: z.string().optional(),
  certificateNumber: z.string(),
  grade: z.string(),
  verificationUrl: z.string().url(),
  digitalBadgeUrl: z.string().url()
});

// TypeScript types derived from Zod schemas
export type CertificationLevel = z.infer<typeof CertificationLevelSchema>;
export type CertificationCategory = z.infer<typeof CertificationCategorySchema>;
export type CertificationFormat = z.infer<typeof CertificationFormatSchema>;
export type ModuleType = z.infer<typeof ModuleTypeSchema>;
export type CollaborationStatus = z.infer<typeof CollaborationStatusSchema>;
export type ProgramStatus = z.infer<typeof ProgramStatusSchema>;

export type Module = z.infer<typeof ModuleSchema>;
export type Testimonial = z.infer<typeof TestimonialSchema>;
export type CertificationProgram = z.infer<typeof CertificationProgramSchema>;
export type StudentProgress = z.infer<typeof StudentProgressSchema>;
export type CertificationData = z.infer<typeof CertificationDataSchema>;

// Component prop types
export interface CertificationPortalProps {
  initialPrograms?: CertificationProgram[];
  studentProgress?: StudentProgress;
}

export interface EnrollmentRequest {
  programId: string;
  studentId: string;
  preferredStartDate: string;
  specialRequests?: string;
}

// API response types
export interface CertificationApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

// Validation helpers
export function validateCertificationProgram(data: unknown): CertificationProgram {
  return CertificationProgramSchema.parse(data);
}

export function validateStudentProgress(data: unknown): StudentProgress {
  return StudentProgressSchema.parse(data);
}

export function validateCertificationData(data: unknown): CertificationData {
  return CertificationDataSchema.parse(data);
}

// Type guards
export function isCertificationProgram(data: unknown): data is CertificationProgram {
  try {
    CertificationProgramSchema.parse(data);
    return true;
  } catch {
    return false;
  }
}

export function isStudentProgress(data: unknown): data is StudentProgress {
  try {
    StudentProgressSchema.parse(data);
    return true;
  } catch {
    return false;
  }
}

// Utility types
export type CertificationProgramSummary = Pick<CertificationProgram, 'id' | 'title' | 'level' | 'category' | 'price' | 'duration'>;
export type ModuleSummary = Pick<Module, 'id' | 'title' | 'type' | 'isCompleted'>;
export type ProgressStats = Pick<StudentProgress, 'completionPercentage' | 'modulesCompleted' | 'totalModules'>;
