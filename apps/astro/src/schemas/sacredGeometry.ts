/**
 * Sacred Geometry & 3D Visualization Zod Schemas
 * Phase 4 Implementation - Three.js integration with proper type validation
 */

import { z } from 'zod';

// Sacred Geometry Types
export const GeometryPatternTypeSchema = z.enum([
  'flower_of_life',
  'metatron_cube', 
  'golden_spiral',
  'platonic_solid',
  'sri_yantra',
  'merkaba',
  'torus_field'
]);

export const SacredRatioNameSchema = z.enum([
  'golden',
  'pi', 
  'euler',
  'sqrt2',
  'phi',
  'fibonacci'
]);

// 3D Coordinates Schema
export const Vector3DSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
});

export const Point2DSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const Point3DSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number().optional(),
});

// Sacred Ratio Schema
export const SacredRatioSchema = z.object({
  name: z.string().min(1),
  value: z.number().positive(),
  frequencies: z.array(z.number().positive()),
  meaning: z.string().min(1),
  mathematicalConstant: z.boolean().default(false),
});

// Geometry Pattern Schema
export const GeometryPatternSchema = z.object({
  type: GeometryPatternTypeSchema,
  points: z.array(Point3DSchema),
  paths: z.array(z.array(z.number().int().min(0))), // Indices into points array
  colors: z.array(z.string().regex(/^#[0-9A-F]{6}$/i).or(z.string().regex(/^hsl\(\d+,\s*\d+%,\s*\d+%\)$/))),
  frequency: z.number().positive(),
  resonance: z.number().min(0).max(1),
  animationSpeed: z.number().min(0).max(10).optional(),
  scale: z.number().positive().default(1),
});

// 3D Visualization Configuration
export const VisualizationModeSchema = z.enum([
  'wireframe',
  'solid',
  'points',
  'hybrid'
]);

export const RenderQualitySchema = z.enum([
  'low',
  'medium', 
  'high',
  'ultra'
]);

export const CameraTypeSchema = z.enum([
  'perspective',
  'orthographic'
]);

export const Visualization3DConfigSchema = z.object({
  mode: VisualizationModeSchema,
  quality: RenderQualitySchema,
  cameraType: CameraTypeSchema,
  autoRotate: z.boolean().default(false),
  rotationSpeed: z.number().min(0).max(5).default(1),
  enableInteraction: z.boolean().default(true),
  enableVR: z.boolean().default(false),
  enableAR: z.boolean().default(false),
  antialias: z.boolean().default(true),
  shadows: z.boolean().default(true),
  postProcessing: z.boolean().default(false),
});

// Sacred Geometry Session Configuration
export const GeometrySessionConfigSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  patternType: GeometryPatternTypeSchema,
  frequency: z.number().positive(),
  duration: z.number().int().positive(), // seconds
  visualConfig: Visualization3DConfigSchema,
  biometricTracking: z.boolean().default(false),
  audioEnabled: z.boolean().default(true),
  hapticsEnabled: z.boolean().default(false),
  progressiveDisclosure: z.boolean().default(true),
});

// Biometric Integration Schema for 3D Sessions
export const Session3DBiometricSchema = z.object({
  sessionId: z.string().min(1),
  timestamp: z.string().datetime(),
  heartRate: z.number().int().min(30).max(220).optional(),
  heartRateVariability: z.number().min(0).max(200),
  skinConductance: z.number().min(0).optional(),
  bodyTemperature: z.number().min(30).max(45).optional(), // Celsius
  brainwaveAlpha: z.number().min(0).max(100).optional(),
  brainwaveBeta: z.number().min(0).max(100).optional(),
  brainwaveTheta: z.number().min(0).max(100).optional(),
  brainwaveDelta: z.number().min(0).max(100).optional(),
  stressLevel: z.number().min(0).max(100),
  focusLevel: z.number().min(0).max(100),
  meditationDepth: z.number().min(0).max(100),
  geometricResonance: z.number().min(0).max(1),
  spatialAwareness: z.number().min(0).max(100).optional(),
});

// Progressive Disclosure Level Schema
export const DisclosureLevelSchema = z.enum([
  'beginner',
  'intermediate', 
  'advanced',
  'expert'
]);

export const ProgressiveDisclosureSchema = z.object({
  level: DisclosureLevelSchema,
  unlockedPatterns: z.array(GeometryPatternTypeSchema),
  availableFeatures: z.array(z.string()),
  nextUnlock: z.object({
    requirement: z.string(),
    progress: z.number().min(0).max(100),
  }).optional(),
});

// Frequency Response Schema
export const FrequencyResponseSchema = z.object({
  frequency: z.number().positive(),
  amplitude: z.number().min(0).max(1),
  phase: z.number().min(0).max(360), // degrees
  resonanceCoefficient: z.number().min(0).max(1),
  harmonics: z.array(z.object({
    frequency: z.number().positive(),
    amplitude: z.number().min(0).max(1),
  })),
});

// Animation Parameters Schema
export const AnimationParametersSchema = z.object({
  type: z.enum(['rotation', 'scale', 'morph', 'flow', 'pulse']),
  speed: z.number().min(0).max(10),
  amplitude: z.number().min(0).max(5),
  frequency: z.number().positive(),
  easing: z.enum(['linear', 'ease-in', 'ease-out', 'ease-in-out', 'bounce']),
  loop: z.boolean().default(true),
  pingPong: z.boolean().default(false),
});

// Advanced Camera Control Schema
export const CameraControlConfigSchema = z.object({
  enableRotate: z.boolean().default(true),
  enableZoom: z.boolean().default(true),
  enablePan: z.boolean().default(true),
  autoRotate: z.boolean().default(false),
  autoRotateSpeed: z.number().min(-10).max(10).default(2.0),
  enableDamping: z.boolean().default(true),
  dampingFactor: z.number().min(0).max(1).default(0.05),
  minDistance: z.number().min(0.1).max(1000).default(1),
  maxDistance: z.number().min(1).max(10000).default(100),
  minPolarAngle: z.number().min(0).max(Math.PI).default(0),
  maxPolarAngle: z.number().min(0).max(Math.PI).default(Math.PI),
  minAzimuthAngle: z.number().min(-Math.PI * 2).max(Math.PI * 2).default(-Infinity),
  maxAzimuthAngle: z.number().min(-Math.PI * 2).max(Math.PI * 2).default(Infinity),
  rotateSpeed: z.number().min(0).max(10).default(1.0),
  zoomSpeed: z.number().min(0).max(10).default(1.0),
  panSpeed: z.number().min(0).max(10).default(1.0),
  keyPanSpeed: z.number().min(0).max(100).default(7.0),
  screenSpacePanning: z.boolean().default(true),
  target: Vector3DSchema.default({ x: 0, y: 0, z: 0 }),
});

// Camera Position Preset Schema
export const CameraPresetSchema = z.object({
  name: z.string().min(1),
  position: Vector3DSchema,
  target: Vector3DSchema,
  rotation: Vector3DSchema.optional(), // Euler angles in radians for precise camera orientation
  description: z.string().optional(),
  fov: z.number().min(1).max(179).optional(),
  animationDuration: z.number().min(0).max(10).default(1.5),
  up: Vector3DSchema.optional(), // Camera up vector for complete orientation control
});

// Performance Optimization Schema
export const PerformanceConfigSchema = z.object({
  enableLOD: z.boolean().default(true),
  frustumCulling: z.boolean().default(true),
  maxPolygons: z.number().int().min(1000).max(10000000).default(100000),
  targetFPS: z.number().min(30).max(240).default(60),
  adaptiveQuality: z.boolean().default(true),
  memoryLimit: z.number().min(100).max(8192).default(1024), // MB
});

// Geometric Transformation Schema
export const GeometricTransformationSchema = z.object({
  translation: Vector3DSchema.optional(),
  rotation: Vector3DSchema.optional(), // Euler angles in radians
  scale: Vector3DSchema.optional(),
  matrix: z.array(z.number()).length(16).optional(), // 4x4 transformation matrix
});

// Platonic Solid Types
export const PlatonicSolidTypeSchema = z.enum([
  'tetrahedron',
  'cube', 
  'octahedron',
  'dodecahedron',
  'icosahedron'
]);

// Sacred Geometry Calculation Result Schema
export const GeometryCalculationResultSchema = z.object({
  pattern: GeometryPatternSchema,
  calculation: z.object({
    vertices: z.number().int().min(0),
    edges: z.number().int().min(0),
    faces: z.number().int().min(0),
    volume: z.number().optional(),
    surfaceArea: z.number().optional(),
    centerPoint: Vector3DSchema,
    boundingBox: z.object({
      min: Vector3DSchema,
      max: Vector3DSchema,
    }),
  }),
  metadata: z.object({
    complexity: z.number().min(0).max(10),
    renderTime: z.number().min(0), // milliseconds
    memoryUsage: z.number().min(0), // bytes
    polycount: z.number().int().min(0),
  }),
});

// VR/AR Configuration Schema
export const ImmersiveConfigSchema = z.object({
  enableVR: z.boolean().default(false),
  enableAR: z.boolean().default(false),
  controllerSupport: z.boolean().default(true),
  handTracking: z.boolean().default(false),
  eyeTracking: z.boolean().default(false),
  roomScale: z.boolean().default(false),
  hapticFeedback: z.boolean().default(false),
  spatialAudio: z.boolean().default(true),
});

// Performance Metrics Schema
export const RenderPerformanceSchema = z.object({
  fps: z.number().min(0).max(240),
  frameTime: z.number().min(0), // milliseconds
  drawCalls: z.number().int().min(0),
  triangles: z.number().int().min(0),
  memoryUsage: z.object({
    geometries: z.number().min(0), // bytes
    textures: z.number().min(0),
    total: z.number().min(0),
  }),
  gpuUtilization: z.number().min(0).max(100).optional(),
  cpuUtilization: z.number().min(0).max(100).optional(),
});

// Export all types
export type GeometryPatternType = z.infer<typeof GeometryPatternTypeSchema>;
export type SacredRatioName = z.infer<typeof SacredRatioNameSchema>;
export type Vector3D = z.infer<typeof Vector3DSchema>;
export type Point2D = z.infer<typeof Point2DSchema>;
export type Point3D = z.infer<typeof Point3DSchema>;
export type SacredRatio = z.infer<typeof SacredRatioSchema>;
export type GeometryPattern = z.infer<typeof GeometryPatternSchema>;
export type VisualizationMode = z.infer<typeof VisualizationModeSchema>;
export type RenderQuality = z.infer<typeof RenderQualitySchema>;
export type CameraType = z.infer<typeof CameraTypeSchema>;
export type Visualization3DConfig = z.infer<typeof Visualization3DConfigSchema>;
export type GeometrySessionConfig = z.infer<typeof GeometrySessionConfigSchema>;
export type Session3DBiometric = z.infer<typeof Session3DBiometricSchema>;
export type DisclosureLevel = z.infer<typeof DisclosureLevelSchema>;
export type ProgressiveDisclosure = z.infer<typeof ProgressiveDisclosureSchema>;
export type FrequencyResponse = z.infer<typeof FrequencyResponseSchema>;
export type AnimationParameters = z.infer<typeof AnimationParametersSchema>;
export type CameraControlConfig = z.infer<typeof CameraControlConfigSchema>;
export type CameraPreset = z.infer<typeof CameraPresetSchema>;
export type PerformanceConfig = z.infer<typeof PerformanceConfigSchema>;
export type GeometricTransformation = z.infer<typeof GeometricTransformationSchema>;
export type PlatonicSolidType = z.infer<typeof PlatonicSolidTypeSchema>;
export type GeometryCalculationResult = z.infer<typeof GeometryCalculationResultSchema>;
export type ImmersiveConfig = z.infer<typeof ImmersiveConfigSchema>;
export type RenderPerformance = z.infer<typeof RenderPerformanceSchema>;
