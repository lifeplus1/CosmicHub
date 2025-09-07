/**
 * Research Platform Zod Schemas
 * Provides runtime validation for research platform data structures
 */

import { z } from 'zod';

// Base Research Types
export const ResearchStatusSchema = z.enum(['planning', 'active', 'completed', 'published']);
export const CollaborationLevelSchema = z.enum(['prospective', 'discussing', 'active', 'strategic']);
export const TrendSchema = z.enum(['up', 'down', 'stable']);
export const MessageTypeSchema = z.enum(['proposal', 'update', 'question', 'invitation']);
export const InstitutionTypeSchema = z.enum(['university', 'research_institute', 'medical_center', 'foundation']);
export const CollaborationStatusSchema = z.enum(['interested', 'active', 'lead', 'advisor']);

// Research Project Schema
export const ResearchProjectSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(200),
  status: ResearchStatusSchema,
  institution: z.string().min(1),
  principalInvestigator: z.string().min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  progress: z.number().min(0).max(100),
  participants: z.number().int().min(0),
  dataPoints: z.number().int().min(0),
  publications: z.array(z.string()).optional(),
  tags: z.array(z.string()),
});

// Academic Partner Schema
export const AcademicPartnerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  institution: z.string().min(1),
  department: z.string().min(1),
  specialization: z.array(z.string()),
  collaborationLevel: CollaborationLevelSchema,
  joinDate: z.string().datetime(),
  projects: z.array(z.string()),
});

// Research Metric Schema
export const ResearchMetricSchema = z.object({
  name: z.string().min(1),
  value: z.number(),
  unit: z.string().min(1),
  trend: TrendSchema,
  description: z.string().min(1),
});

// Biometric Data Schema
export const BiometricDataSchema = z.object({
  timestamp: z.string().datetime(),
  heartRateVariability: z.number().min(0).max(200),
  stressLevel: z.number().min(0).max(100),
  meditationDepth: z.number().min(0).max(100),
  sacredGeometryResonance: z.number().min(0).max(1),
  participantId: z.string().min(1),
});

// Institution Schema
export const InstitutionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: InstitutionTypeSchema,
  location: z.string().min(1),
  website: z.string().url(),
  collaborationLevel: CollaborationLevelSchema,
  establishedDate: z.string().datetime().optional(),
  focus: z.array(z.string()),
  activeProjects: z.number().int().min(0),
  totalPublications: z.number().int().min(0),
});

// Researcher Schema
export const ResearcherSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  title: z.string().min(1),
  institution: z.string().min(1),
  department: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  specializations: z.array(z.string()),
  hIndex: z.number().int().min(0),
  citationCount: z.number().int().min(0),
  activeProjects: z.array(z.string()),
  collaborationStatus: CollaborationStatusSchema,
  profileUrl: z.string().url().optional(),
  lastContact: z.string().datetime(),
});

// Message Schema
export const MessageSchema = z.object({
  id: z.string().min(1),
  from: z.string().min(1),
  to: z.string().min(1),
  subject: z.string().min(1).max(200),
  content: z.string().min(1),
  timestamp: z.string().datetime(),
  type: MessageTypeSchema,
  isRead: z.boolean(),
  attachments: z.array(z.string()).optional(),
});

// Certification Program Schema
export const CertificationLevelSchema = z.enum(['foundation', 'advanced', 'master']);
export const ModuleTypeSchema = z.enum(['video', 'reading', 'assignment', 'practicum']);
export const ProgramStatusSchema = z.enum(['draft', 'active', 'archived']);
export const EnrollmentStatusSchema = z.enum(['enrolled', 'in_progress', 'completed', 'dropped']);

export const CertificationModuleSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  type: ModuleTypeSchema,
  duration: z.number().int().min(1), // minutes
  completed: z.boolean(),
  content: z.string().optional(),
});

export const CertificationProgramSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  level: CertificationLevelSchema,
  duration: z.string().min(1),
  price: z.number().min(0),
  status: ProgramStatusSchema,
  description: z.string().min(1),
  modules: z.array(CertificationModuleSchema),
  prerequisites: z.array(z.string()),
  accreditation: z.array(z.string()),
  enrolledStudents: z.number().int().min(0),
  completionRate: z.number().min(0).max(100),
});

// Student Progress Schema
export const StudentProgressSchema = z.object({
  studentId: z.string().min(1),
  programId: z.string().min(1),
  enrollmentDate: z.string().datetime(),
  status: EnrollmentStatusSchema,
  completedModules: z.array(z.string()),
  currentModule: z.string().optional(),
  progressPercentage: z.number().min(0).max(100),
  timeSpent: z.number().int().min(0), // minutes
  lastActivity: z.string().datetime(),
});

// Certification Schema
export const CertificationSchema = z.object({
  id: z.string().min(1),
  studentId: z.string().min(1),
  programId: z.string().min(1),
  issuedDate: z.string().datetime(),
  expiryDate: z.string().datetime().optional(),
  credentialUrl: z.string().url(),
  verificationCode: z.string().min(1),
});

// Metric Data Schema (for visualization)
export const MetricDataSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  value: z.number(),
  previousValue: z.number(),
  unit: z.string().min(1),
  change: z.number(),
  trend: TrendSchema,
  category: z.enum(['engagement', 'research', 'performance', 'collaboration']),
  timeframe: z.enum(['24h', '7d', '30d', '90d']),
});

// Chart Data Schema
export const ChartDataSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  type: z.enum(['line', 'bar', 'pie', 'area']),
  data: z.array(z.object({
    label: z.string(),
    value: z.number(),
    color: z.string().optional(),
  })),
  timeRange: z.string().min(1),
});

// Export all types
export type ResearchProject = z.infer<typeof ResearchProjectSchema>;
export type AcademicPartner = z.infer<typeof AcademicPartnerSchema>;
export type ResearchMetric = z.infer<typeof ResearchMetricSchema>;
export type BiometricData = z.infer<typeof BiometricDataSchema>;
export type Institution = z.infer<typeof InstitutionSchema>;
export type Researcher = z.infer<typeof ResearcherSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type CertificationProgram = z.infer<typeof CertificationProgramSchema>;
export type CertificationModule = z.infer<typeof CertificationModuleSchema>;
export type StudentProgress = z.infer<typeof StudentProgressSchema>;
export type Certification = z.infer<typeof CertificationSchema>;
export type MetricData = z.infer<typeof MetricDataSchema>;
export type ChartData = z.infer<typeof ChartDataSchema>;

// Research status types
export type ResearchStatus = z.infer<typeof ResearchStatusSchema>;
export type CollaborationLevel = z.infer<typeof CollaborationLevelSchema>;
export type Trend = z.infer<typeof TrendSchema>;
export type MessageType = z.infer<typeof MessageTypeSchema>;
export type InstitutionType = z.infer<typeof InstitutionTypeSchema>;
export type CollaborationStatus = z.infer<typeof CollaborationStatusSchema>;
export type CertificationLevel = z.infer<typeof CertificationLevelSchema>;
export type ModuleType = z.infer<typeof ModuleTypeSchema>;
export type ProgramStatus = z.infer<typeof ProgramStatusSchema>;
export type EnrollmentStatus = z.infer<typeof EnrollmentStatusSchema>;
