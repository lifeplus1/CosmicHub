/**
 * Collaboration Hub Type Definitions
 * Provides comprehensive type safety for academic collaboration system
 */

import { z } from 'zod';

// Zod schemas for runtime validation
export const InstitutionTypeSchema = z.enum(['university', 'research_institute', 'medical_center', 'foundation']);
export const CollaborationLevelSchema = z.enum(['prospective', 'discussing', 'active', 'strategic']);
export const CollaborationStatusSchema = z.enum(['interested', 'active', 'lead', 'advisor']);
export const MessageTypeSchema = z.enum(['proposal', 'update', 'question', 'invitation']);
export const ProjectStatusSchema = z.enum(['proposal', 'approved', 'active', 'completed', 'published']);

export const InstitutionSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: InstitutionTypeSchema,
  location: z.string(),
  website: z.string().url(),
  collaborationLevel: CollaborationLevelSchema,
  establishedDate: z.string().optional(),
  focus: z.array(z.string()),
  activeProjects: z.number().min(0),
  totalPublications: z.number().min(0)
});

export const ResearcherSchema = z.object({
  id: z.string(),
  name: z.string(),
  title: z.string(),
  institution: z.string(),
  department: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  specializations: z.array(z.string()),
  hIndex: z.number().min(0),
  citationCount: z.number().min(0),
  activeProjects: z.array(z.string()),
  collaborationStatus: CollaborationStatusSchema,
  profileUrl: z.string().url().optional(),
  lastContact: z.string()
});

export const CollaborationProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: ProjectStatusSchema,
  leadInstitution: z.string(),
  collaboratingInstitutions: z.array(z.string()),
  principalInvestigators: z.array(z.string()),
  budget: z.number().min(0),
  duration: z.string(),
  startDate: z.string(),
  expectedEndDate: z.string(),
  milestones: z.array(z.object({
    id: z.string(),
    title: z.string(),
    dueDate: z.string(),
    completed: z.boolean(),
    description: z.string()
  })),
  publications: z.array(z.string())
});

export const MessageSchema = z.object({
  id: z.string(),
  from: z.string(),
  to: z.string(),
  subject: z.string(),
  content: z.string(),
  timestamp: z.string(),
  type: MessageTypeSchema,
  isRead: z.boolean(),
  attachments: z.array(z.string()).optional()
});

// TypeScript types derived from Zod schemas
export type InstitutionType = z.infer<typeof InstitutionTypeSchema>;
export type CollaborationLevel = z.infer<typeof CollaborationLevelSchema>;
export type CollaborationStatus = z.infer<typeof CollaborationStatusSchema>;
export type MessageType = z.infer<typeof MessageTypeSchema>;
export type ProjectStatus = z.infer<typeof ProjectStatusSchema>;

export type Institution = z.infer<typeof InstitutionSchema>;
export type Researcher = z.infer<typeof ResearcherSchema>;
export type CollaborationProject = z.infer<typeof CollaborationProjectSchema>;
export type Message = z.infer<typeof MessageSchema>;

// Component prop types
export interface CollaborationHubProps {
  initialInstitutions?: Institution[];
  initialResearchers?: Researcher[];
  initialMessages?: Message[];
}

export interface ContactRequest {
  researcherId: string;
  subject: string;
  message: string;
  requestType: 'collaboration' | 'consultation' | 'interview' | 'general';
}

export interface MeetingRequest {
  institutionId: string;
  requestedDate: string;
  duration: number; // in minutes
  purpose: string;
  participants: string[];
}

// API response types
export interface CollaborationApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

// Search and filter types
export interface InstitutionFilters {
  collaborationLevel?: CollaborationLevel[];
  institutionType?: InstitutionType[];
  focusAreas?: string[];
  location?: string;
}

export interface ResearcherFilters {
  collaborationStatus?: CollaborationStatus[];
  specializations?: string[];
  institution?: string;
  minHIndex?: number;
  minCitations?: number;
}

// Statistics types
export interface CollaborationStats {
  totalInstitutions: number;
  activeResearchers: number;
  activeProjects: number;
  totalPublications: number;
  unreadMessages: number;
}

// Validation helpers
export function validateInstitution(data: unknown): Institution {
  return InstitutionSchema.parse(data);
}

export function validateResearcher(data: unknown): Researcher {
  return ResearcherSchema.parse(data);
}

export function validateCollaborationProject(data: unknown): CollaborationProject {
  return CollaborationProjectSchema.parse(data);
}

export function validateMessage(data: unknown): Message {
  return MessageSchema.parse(data);
}

// Type guards
export function isInstitution(data: unknown): data is Institution {
  try {
    InstitutionSchema.parse(data);
    return true;
  } catch {
    return false;
  }
}

export function isResearcher(data: unknown): data is Researcher {
  try {
    ResearcherSchema.parse(data);
    return true;
  } catch {
    return false;
  }
}

export function isMessage(data: unknown): data is Message {
  try {
    MessageSchema.parse(data);
    return true;
  } catch {
    return false;
  }
}

// Utility types
export type InstitutionSummary = Pick<Institution, 'id' | 'name' | 'type' | 'collaborationLevel' | 'activeProjects'>;
export type ResearcherSummary = Pick<Researcher, 'id' | 'name' | 'title' | 'institution' | 'collaborationStatus'>;
export type MessageSummary = Pick<Message, 'id' | 'from' | 'subject' | 'timestamp' | 'type' | 'isRead'>;
export type ProjectSummary = Pick<CollaborationProject, 'id' | 'title' | 'status' | 'leadInstitution'>;

// Sorting and ordering types
export type InstitutionSortField = 'name' | 'collaborationLevel' | 'activeProjects' | 'totalPublications' | 'establishedDate';
export type ResearcherSortField = 'name' | 'hIndex' | 'citationCount' | 'lastContact' | 'collaborationStatus';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig<T extends string> {
  field: T;
  direction: SortDirection;
}
