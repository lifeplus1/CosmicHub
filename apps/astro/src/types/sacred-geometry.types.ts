/**
 * Sacred Geometry Type Definitions
 * Provides type safety and validation for sacred geometry data structures
 */

import { z } from 'zod';

// Zod schemas for runtime validation
export const SacredGeometryDataSchema = z.object({
  golden_ratio_analysis: z.object({
    primary_phi_ratio: z.number().min(1.6).max(1.62),
    resonance_strength: z.number().min(0).max(1),
    optimal_meditation_times: z.array(z.string())
  }),
  platonic_solid_correspondences: z.record(
    z.object({
      value: z.string()
    })
  ),
  mandala_data: z.object({
    meditation_focus: z.string(),
    color_harmonics: z.array(z.string().regex(/^#[0-9A-F]{6}$/i))
  }),
  tcm_geometric_integration: z.object({
    five_element_geometry: z.record(
      z.object({
        resonance: z.number().min(0).max(100),
        geometry: z.enum(['tetrahedron', 'cube', 'octahedron', 'icosahedron', 'dodecahedron'])
      })
    )
  })
});

// TypeScript types derived from Zod schemas
export type SacredGeometryData = z.infer<typeof SacredGeometryDataSchema>;
export type GoldenRatioAnalysis = z.infer<typeof SacredGeometryDataSchema>['golden_ratio_analysis'];
export type PlatonicSolidCorrespondences = z.infer<typeof SacredGeometryDataSchema>['platonic_solid_correspondences'];
export type MandalaData = z.infer<typeof SacredGeometryDataSchema>['mandala_data'];
export type TCMGeometricIntegration = z.infer<typeof SacredGeometryDataSchema>['tcm_geometric_integration'];

// Element color mapping type
export type ElementColorMap = Record<string, string>;

// Component prop types
export interface SacredGeometryVisualizerProps {
  data: SacredGeometryData;
  expertMode: boolean;
}

export interface SacredGeometryDemoProps {
  initialData?: SacredGeometryData;
  onDataUpdate?: (data: SacredGeometryData) => void;
}

// API response types
export interface SacredGeometryApiResponse {
  success: boolean;
  data?: SacredGeometryData;
  error?: string;
  timestamp: string;
}

// Validation helper
export function validateSacredGeometryData(data: unknown): SacredGeometryData {
  return SacredGeometryDataSchema.parse(data);
}

// Type guards
export function isSacredGeometryData(data: unknown): data is SacredGeometryData {
  try {
    SacredGeometryDataSchema.parse(data);
    return true;
  } catch {
    return false;
  }
}
