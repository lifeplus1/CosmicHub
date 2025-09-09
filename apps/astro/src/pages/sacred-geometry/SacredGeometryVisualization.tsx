/**
 * Phase 4: Sacred Geometry 3D Visualization Component
 * Three.js integration with proper TypeScript validation
 * Following Component Best Practices Checklist
 */

import React, { useRef, useState, useMemo, useCallback, useEffect, Suspense as _Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stats, Environment } from '@react-three/drei';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@cosmichub/ui';

// Import sacred geometry types and schemas
import { 
  GeometryPatternType, 
  GeometryPattern, 
  Point3D,
  Visualization3DConfig,
  GeometrySessionConfig,
  AnimationParameters,
  CameraControlConfig,
  CameraPreset,
  PerformanceConfig,
  GeometryPatternTypeSchema,
  Visualization3DConfigSchema,
  GeometrySessionConfigSchema,
  AnimationParametersSchema,
  CameraControlConfigSchema,
  CameraPresetSchema,
  PerformanceConfigSchema 
} from '../../schemas';

// Error Boundary for 3D Rendering
class SacredGeometryErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): {
    hasError: boolean;
    error: Error;
  } {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Sacred Geometry 3D Rendering Error:', error, errorInfo);
  }

  override render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <Card className='max-w-md mx-auto p-6 text-center bg-cosmic-dark border-cosmic-purple/30'>
          <h3 className='text-xl font-semibold text-cosmic-gold mb-4'>
            3D Rendering Error
          </h3>
          <p className='text-cosmic-silver mb-4'>
            {this.state.error?.message ?? 'Failed to render 3D geometry'}
          </p>
          <Button 
            variant='cosmic' 
            onClick={() => window.location.reload()}
            className='bg-cosmic-purple hover:bg-cosmic-purple/80'
          >
            Retry Visualization
          </Button>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Utility function to create geometry patterns
const createSacredGeometry = (type: GeometryPatternType, scale: number = 1): GeometryPattern => {
  const basePattern: GeometryPattern = {
    type,
    points: [],
    paths: [],
    colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
    frequency: 432, // Hz
    resonance: 0.618, // Golden ratio
    scale,
  };

  switch (type) {
    case 'flower_of_life':
      return createFlowerOfLife(basePattern, scale);
    case 'metatron_cube':
      return createMetatronCube(basePattern, scale);
    case 'golden_spiral':
      return createGoldenSpiral(basePattern, scale);
    case 'platonic_solid':
      return createPlatonicSolid(basePattern, scale);
    case 'sri_yantra':
      return createSriYantra(basePattern, scale);
    case 'merkaba':
      return createMerkaba(basePattern, scale);
    case 'torus_field':
      return createTorusField(basePattern, scale);
    default:
      return basePattern;
  }
};

// Flower of Life geometry
const createFlowerOfLife = (base: GeometryPattern, scale: number): GeometryPattern => {
  const points: Point3D[] = [];
  const paths: number[][] = [];
  const radius = scale;
  const _centerCount = 7; // Central circle + 6 surrounding
  
  // Central circle
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    points.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      z: 0
    });
  }
  paths.push([0, 1, 2, 3, 4, 5, 6, 7, 0]);

  // Six surrounding circles
  for (let circle = 0; circle < 6; circle++) {
    const centerAngle = (circle / 6) * Math.PI * 2;
    const centerX = Math.cos(centerAngle) * radius;
    const centerY = Math.sin(centerAngle) * radius;
    
    const startIndex = points.length;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      points.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        z: 0
      });
    }
    
    const circleIndices = [];
    for (let i = 0; i < 8; i++) {
      circleIndices.push(startIndex + i);
    }
    circleIndices.push(startIndex);
    paths.push(circleIndices);
  }

  return { ...base, points, paths };
};

// Metatron's Cube geometry
const createMetatronCube = (base: GeometryPattern, scale: number): GeometryPattern => {
  const points: Point3D[] = [];
  const paths: number[][] = [];
  const radius = scale;

  // 13 circles of Metatron's Cube
  const centers: Point3D[] = [
    { x: 0, y: 0, z: 0 }, // Center
    // Inner ring
    { x: radius, y: 0, z: 0 },
    { x: radius/2, y: radius * Math.sqrt(3)/2, z: 0 },
    { x: -radius/2, y: radius * Math.sqrt(3)/2, z: 0 },
    { x: -radius, y: 0, z: 0 },
    { x: -radius/2, y: -radius * Math.sqrt(3)/2, z: 0 },
    { x: radius/2, y: -radius * Math.sqrt(3)/2, z: 0 },
    // Outer ring
    { x: 2*radius, y: 0, z: 0 },
    { x: radius, y: radius * Math.sqrt(3), z: 0 },
    { x: -radius, y: radius * Math.sqrt(3), z: 0 },
    { x: -2*radius, y: 0, z: 0 },
    { x: -radius, y: -radius * Math.sqrt(3), z: 0 },
    { x: radius, y: -radius * Math.sqrt(3), z: 0 },
  ];

  centers.forEach(center => points.push(center));

  // Connect all points to create the cube structure
  for (let i = 0; i < centers.length; i++) {
    for (let j = i + 1; j < centers.length; j++) {
      paths.push([i, j]);
    }
  }

  return { ...base, points, paths };
};

// Golden Spiral geometry
const createGoldenSpiral = (base: GeometryPattern, scale: number): GeometryPattern => {
  const points: Point3D[] = [];
  const paths: number[][] = [];
  const phi = 1.618033988749; // Golden ratio
  const spiralPoints = 100;
  
  for (let i = 0; i < spiralPoints; i++) {
    const t = i / spiralPoints * 4 * Math.PI; // 2 full rotations
    const r = scale * Math.pow(phi, t / (2 * Math.PI));
    
    points.push({
      x: r * Math.cos(t),
      y: r * Math.sin(t),
      z: t * scale / 10
    });
  }
  
  // Connect consecutive points
  for (let i = 0; i < spiralPoints - 1; i++) {
    paths.push([i, i + 1]);
  }

  return { ...base, points, paths };
};

  // Platonic Solid (Dodecahedron) geometry
const createPlatonicSolid = (base: GeometryPattern, scale: number): GeometryPattern => {
  const points: Point3D[] = [];
  const paths: number[][] = [];
  const phi = 1.618033988749;
  const vertices: [number, number, number][] = [
    // 8 vertices of a cube
    [1, 1, 1], [1, 1, -1], [1, -1, 1], [1, -1, -1],
    [-1, 1, 1], [-1, 1, -1], [-1, -1, 1], [-1, -1, -1],
    // 12 vertices on edges
    [0, phi, 1/phi], [0, phi, -1/phi], [0, -phi, 1/phi], [0, -phi, -1/phi],
    [1/phi, 0, phi], [-1/phi, 0, phi], [1/phi, 0, -phi], [-1/phi, 0, -phi],
    [phi, 1/phi, 0], [phi, -1/phi, 0], [-phi, 1/phi, 0], [-phi, -1/phi, 0]
  ];

  vertices.forEach(([x, y, z]: [number, number, number]) => {
    points.push({ x: x * scale, y: y * scale, z: z * scale });
  });

  // Define faces of dodecahedron (simplified)
  const faces: number[][] = [
    [0, 16, 2, 17, 1],
    [0, 1, 9, 11, 8],
    [0, 8, 12, 4, 16],
    [1, 17, 10, 6, 9],
    [2, 16, 4, 18, 19],
    [2, 19, 7, 15, 17],
    [3, 14, 5, 11, 10],
    [3, 10, 17, 15, 14],
    [4, 12, 13, 6, 18],
    [5, 9, 6, 13, 20],
    [7, 19, 18, 13, 20],
    [8, 11, 5, 20, 12]
  ];

  faces.forEach((face: number[]) => {
    for (let i = 0; i < face.length; i++) {
      const currentIndex = face[i];
      const nextIndex = face[(i + 1) % face.length];
      if (currentIndex !== undefined && nextIndex !== undefined) {
        paths.push([currentIndex, nextIndex]);
      }
    }
  });

  return { ...base, points, paths };
};

// Sri Yantra geometry (simplified)
const createSriYantra = (base: GeometryPattern, scale: number): GeometryPattern => {
  const points: Point3D[] = [];
  const paths: number[][] = [];
  
  // Create concentric triangles
  const triangleLevels = 4;
  for (let level = 0; level < triangleLevels; level++) {
    const radius = scale * (1 - level * 0.2);
    
    // Upward triangle
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2 - Math.PI / 2;
      points.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        z: level * scale * 0.1
      });
    }
    
    // Downward triangle
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2 + Math.PI / 2;
      points.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        z: level * scale * 0.1
      });
    }
    
    const baseIndex = level * 6;
    // Connect upward triangle
    paths.push([baseIndex, baseIndex + 1, baseIndex + 2, baseIndex]);
    // Connect downward triangle
    paths.push([baseIndex + 3, baseIndex + 4, baseIndex + 5, baseIndex + 3]);
  }

  return { ...base, points, paths };
};

// Merkaba geometry
const createMerkaba = (base: GeometryPattern, scale: number): GeometryPattern => {
  const points: Point3D[] = [];
  const paths: number[][] = [];
  
  // Two intersecting tetrahedra
  const height = scale * Math.sqrt(2/3);
  
  // First tetrahedron (upward)
  points.push(
    { x: 0, y: 0, z: height }, // Top
    { x: scale, y: 0, z: -height/3 }, // Base vertices
    { x: -scale/2, y: scale * Math.sqrt(3)/2, z: -height/3 },
    { x: -scale/2, y: -scale * Math.sqrt(3)/2, z: -height/3 }
  );
  
  // Second tetrahedron (downward)
  points.push(
    { x: 0, y: 0, z: -height }, // Bottom
    { x: scale, y: 0, z: height/3 }, // Base vertices
    { x: -scale/2, y: scale * Math.sqrt(3)/2, z: height/3 },
    { x: -scale/2, y: -scale * Math.sqrt(3)/2, z: height/3 }
  );
  
  // Connect first tetrahedron
  paths.push([0, 1], [0, 2], [0, 3], [1, 2], [2, 3], [3, 1]);
  // Connect second tetrahedron
  paths.push([4, 5], [4, 6], [4, 7], [5, 6], [6, 7], [7, 5]);

  return { ...base, points, paths };
};

// Torus Field geometry
const createTorusField = (base: GeometryPattern, scale: number): GeometryPattern => {
  const points: Point3D[] = [];
  const paths: number[][] = [];
  
  const majorRadius = scale;
  const minorRadius = scale * 0.3;
  const majorSegments = 16;
  const minorSegments = 8;
  
  for (let i = 0; i < majorSegments; i++) {
    for (let j = 0; j < minorSegments; j++) {
      const u = (i / majorSegments) * Math.PI * 2;
      const v = (j / minorSegments) * Math.PI * 2;
      
      const x = (majorRadius + minorRadius * Math.cos(v)) * Math.cos(u);
      const y = (majorRadius + minorRadius * Math.cos(v)) * Math.sin(u);
      const z = minorRadius * Math.sin(v);
      
      points.push({ x, y, z });
    }
  }
  
  // Connect torus segments
  for (let i = 0; i < majorSegments; i++) {
    for (let j = 0; j < minorSegments; j++) {
      const current = i * minorSegments + j;
      const next = ((i + 1) % majorSegments) * minorSegments + j;
      const nextJ = i * minorSegments + ((j + 1) % minorSegments);
      
      paths.push([current, next]);
      paths.push([current, nextJ]);
    }
  }

  return { ...base, points, paths };
};

// Advanced Camera Controls Component
interface AdvancedCameraControlsProps {
  config: CameraControlConfig;
  presets: CameraPreset[];
  onConfigChange: (updates: Partial<CameraControlConfig>) => void;
  onPresetSelect: (preset: CameraPreset) => void;
}

const AdvancedCameraControls: React.FC<AdvancedCameraControlsProps> = ({ 
  config, 
  presets: _presets, // Future enhancement: preset selector UI
  onConfigChange: _onConfigChange, // Future enhancement: dynamic config updates
  onPresetSelect 
}) => {
  const { camera } = useThree();
  const controlsRef = useRef<THREE.Object3D>(null); // Use generic THREE.Object3D ref

  // Animation function for smooth camera transitions
  const animateToPreset = useCallback((preset: CameraPreset) => {
    if (!camera) return;

    const startPosition = camera.position.clone();
    const startRotation = camera.rotation.clone();
    const targetPosition = new THREE.Vector3(preset.position.x, preset.position.y, preset.position.z);
    
    // Handle optional rotation - use camera's current rotation if not specified
    const targetQuaternion = preset.rotation 
      ? new THREE.Quaternion().setFromEuler(
          new THREE.Euler(preset.rotation.x, preset.rotation.y, preset.rotation.z)
        )
      : camera.quaternion.clone();

    let progress = 0;
    const duration = 2000; // 2 seconds
    const startTime = performance.now();

    const animate = () => {
      const elapsed = performance.now() - startTime;
      progress = Math.min(elapsed / duration, 1);

      // Smooth interpolation using easing
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      // Interpolate position
      camera.position.lerpVectors(startPosition, targetPosition, easedProgress);

      // Interpolate rotation
      camera.quaternion.slerpQuaternions(
        new THREE.Quaternion().setFromEuler(startRotation),
        targetQuaternion,
        easedProgress
      );

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        onPresetSelect(preset);
      }
    };

    animate();
  }, [camera, onPresetSelect]);

  // Expose animation function to parent component with type safety
  useEffect(() => {
    const controls = controlsRef.current as unknown as { animateToPreset?: (preset: CameraPreset) => void };
    if (controls && typeof controls === 'object') {
      controls.animateToPreset = animateToPreset;
    }
  }, [animateToPreset]);

  // Convert config.target to THREE.Vector3 for compatibility
  const processedConfig = {
    ...config,
    target: new THREE.Vector3(config.target.x, config.target.y, config.target.z)
  };

  return <OrbitControls {...processedConfig} />;
};

// Performance Monitor Component
interface PerformanceMonitorProps {
  config: PerformanceConfig;
  onPerformanceUpdate: (metrics: { fps: number; frameTime: number }) => void;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ config, onPerformanceUpdate }) => {
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const fpsHistory = useRef<number[]>([]);

  useFrame(() => {
    frameCount.current++;
    const currentTime = performance.now();
    const deltaTime = currentTime - lastTime.current;

    if (deltaTime >= 1000) { // Update every second
      const fps = Math.round((frameCount.current * 1000) / deltaTime);
      const frameTime = deltaTime / frameCount.current;

      fpsHistory.current.push(fps);
      if (fpsHistory.current.length > 10) {
        fpsHistory.current.shift();
      }

      const avgFps = fpsHistory.current.reduce((a, b) => a + b, 0) / fpsHistory.current.length;

      onPerformanceUpdate({ fps: avgFps, frameTime });

      frameCount.current = 0;
      lastTime.current = currentTime;
    }
  });

  return config.adaptiveQuality ? <Stats /> : null;
};

// Three.js Geometry Component
interface GeometryMeshProps {
  pattern: GeometryPattern;
  animation: AnimationParameters;
  config: Visualization3DConfig;
}

const GeometryMesh: React.FC<GeometryMeshProps> = ({ pattern, animation, config }) => {
  const meshRef = useRef<THREE.Group>(null);
  const { scene: _scene } = useThree();

  useFrame((state, _delta) => {
    if (!meshRef.current) return;
    
    const time = state.clock.getElapsedTime();
    
    switch (animation.type) {
      case 'rotation': {
        meshRef.current.rotation.x = time * animation.speed * 0.5;
        meshRef.current.rotation.y = time * animation.speed;
        meshRef.current.rotation.z = time * animation.speed * 0.3;
        break;
      }
      case 'pulse': {
        const pulseScale = 1 + Math.sin(time * animation.frequency) * animation.amplitude * 0.1;
        meshRef.current.scale.setScalar(pulseScale);
        break;
      }
      case 'flow': {
        meshRef.current.position.y = Math.sin(time * animation.frequency) * animation.amplitude * 0.5;
        break;
      }
    }
  });

  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    
    // Convert points to Three.js format
    const vertices = new Float32Array(pattern.points.length * 3);
    pattern.points.forEach((point: Point3D, i: number) => {
      vertices[i * 3] = point.x;
      vertices[i * 3 + 1] = point.y;
      vertices[i * 3 + 2] = point.z ?? 0;
    });
    
    geom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    
    return geom;
  }, [pattern]);

  const lineGeometry = useMemo(() => {
    const lineGeom = new THREE.BufferGeometry();
    const lineVertices: number[] = [];
    
    pattern.paths.forEach((path: number[]) => {
      for (let i = 0; i < path.length - 1; i++) {
        const indexA = path[i];
        const indexB = path[i + 1];
        if (indexA !== undefined && indexB !== undefined) {
          const pointA = pattern.points[indexA];
          const pointB = pattern.points[indexB];
          
          if (pointA && pointB) {
            lineVertices.push(pointA.x, pointA.y, pointA.z ?? 0);
            lineVertices.push(pointB.x, pointB.y, pointB.z ?? 0);
          }
        }
      }
    });
    
    lineGeom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(lineVertices), 3));
    return lineGeom;
  }, [pattern]);

  return (
    <group ref={meshRef}>
      {config.mode === 'wireframe' || config.mode === 'hybrid' ? (
        <primitive object={new THREE.LineSegments(lineGeometry, new THREE.LineBasicMaterial({ color: pattern.colors[0] }))} />
      ) : null}
      
      {config.mode === 'points' || config.mode === 'hybrid' ? (
        <points geometry={geometry}>
          <pointsMaterial color={pattern.colors[1]} size={0.1} />
        </points>
      ) : null}
      
      {config.mode === 'solid' || config.mode === 'hybrid' ? (
        <mesh geometry={geometry}>
          <meshStandardMaterial 
            color={pattern.colors[2]} 
            wireframe={false}
            transparent
            opacity={0.7}
          />
        </mesh>
      ) : null}
    </group>
  );
};

// Main Sacred Geometry Visualization Component
const SacredGeometryVisualizationComponent: React.FC = React.memo(() => {
  // State with proper validation
  const [selectedPattern, setSelectedPattern] = useState<GeometryPatternType>('flower_of_life');
  const [visualConfig, setVisualConfig] = useState<Visualization3DConfig>({
    mode: 'hybrid',
    quality: 'high',
    cameraType: 'perspective',
    autoRotate: true,
    rotationSpeed: 1,
    enableInteraction: true,
    enableVR: false,
    enableAR: false,
    antialias: true,
    shadows: true,
    postProcessing: false,
  });
  
  const [animation, setAnimation] = useState<AnimationParameters>({
    type: 'rotation',
    speed: 1,
    amplitude: 1,
    frequency: 1,
    easing: 'linear',
    loop: true,
    pingPong: false,
  });

  // Advanced camera controls with validation
  const [cameraConfig, setCameraConfig] = useState<CameraControlConfig>({
    enableRotate: true,
    enableZoom: true,
    enablePan: true,
    autoRotate: false,
    autoRotateSpeed: 2.0,
    enableDamping: true,
    dampingFactor: 0.05,
    minDistance: 1,
    maxDistance: 100,
    minPolarAngle: 0,
    maxPolarAngle: Math.PI,
    minAzimuthAngle: -Infinity,
    maxAzimuthAngle: Infinity,
    rotateSpeed: 1.0,
    zoomSpeed: 1.0,
    panSpeed: 1.0,
    keyPanSpeed: 7.0,
    screenSpacePanning: true,
    target: { x: 0, y: 0, z: 0 },
  });

  // Performance configuration with validation
  const [performanceConfig, setPerformanceConfig] = useState<PerformanceConfig>({
    enableLOD: true,
    frustumCulling: true,
    maxPolygons: 100000,
    targetFPS: 60,
    adaptiveQuality: true,
    memoryLimit: 1024,
  });

  // Camera presets with validation
  const [cameraPresets] = useState<CameraPreset[]>([
    {
      name: 'Front View',
      position: { x: 0, y: 0, z: 5 },
      target: { x: 0, y: 0, z: 0 },
      description: 'Direct front view of the geometry',
      animationDuration: 1.5,
    },
    {
      name: 'Isometric',
      position: { x: 5, y: 5, z: 5 },
      target: { x: 0, y: 0, z: 0 },
      description: 'Classic isometric perspective',
      animationDuration: 2.0,
    },
    {
      name: 'Top Down',
      position: { x: 0, y: 10, z: 0 },
      target: { x: 0, y: 0, z: 0 },
      description: 'Bird\'s eye view',
      animationDuration: 1.0,
    },
    {
      name: 'Side View',
      position: { x: 8, y: 0, z: 0 },
      target: { x: 0, y: 0, z: 0 },
      description: 'Pure side profile',
      animationDuration: 1.5,
    },
  ]);

  const [geometryScale, setGeometryScale] = useState<number>(1);
  const [sessionActive, setSessionActive] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<{ fps: number; frameTime: number }>({
    fps: 60,
    frameTime: 16.67,
  });
  const [showAdvancedControls, setShowAdvancedControls] = useState<boolean>(false);

  // Memoized geometry pattern with validation
  const currentPattern = useMemo(() => {
    try {
      const pattern = createSacredGeometry(selectedPattern, geometryScale);
      GeometryPatternTypeSchema.parse(selectedPattern); // Validate
      return pattern;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setErrors(prev => [...prev, `Invalid pattern: ${errorMessage}`]);
      return createSacredGeometry('flower_of_life', 1); // Fallback
    }
  }, [selectedPattern, geometryScale]);

  // Validated configuration update handlers
  const updateVisualConfig = useCallback((updates: Partial<Visualization3DConfig>) => {
    try {
      const newConfig = { ...visualConfig, ...updates };
      Visualization3DConfigSchema.parse(newConfig);
      setVisualConfig(newConfig);
      setErrors(prev => prev.filter(err => !err.includes('visual config')));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setErrors(prev => [...prev, `Invalid visual config: ${errorMessage}`]);
    }
  }, [visualConfig]);

  const updateAnimation = useCallback((updates: Partial<AnimationParameters>) => {
    try {
      const newAnimation = { ...animation, ...updates };
      AnimationParametersSchema.parse(newAnimation);
      setAnimation(newAnimation);
      setErrors(prev => prev.filter(err => !err.includes('animation')));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setErrors(prev => [...prev, `Invalid animation: ${errorMessage}`]);
    }
  }, [animation]);

  // Advanced camera controls validation and updates
  const updateCameraConfig = useCallback((updates: Partial<CameraControlConfig>) => {
    try {
      const newConfig = { ...cameraConfig, ...updates };
      CameraControlConfigSchema.parse(newConfig);
      setCameraConfig(newConfig);
      setErrors(prev => prev.filter(err => !err.includes('camera config')));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setErrors(prev => [...prev, `Invalid camera config: ${errorMessage}`]);
    }
  }, [cameraConfig]);

  const updatePerformanceConfig = useCallback((updates: Partial<PerformanceConfig>) => {
    try {
      const newConfig = { ...performanceConfig, ...updates };
      PerformanceConfigSchema.parse(newConfig);
      setPerformanceConfig(newConfig);
      setErrors(prev => prev.filter(err => !err.includes('performance config')));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setErrors(prev => [...prev, `Invalid performance config: ${errorMessage}`]);
    }
  }, [performanceConfig]);

  // Camera preset selection with validation and type safety
  const selectCameraPreset = useCallback((preset: CameraPreset) => {
    try {
      CameraPresetSchema.parse(preset);
      // Note: Direct camera animation would need to be handled via the AdvancedCameraControls component
      console.log('Camera preset selected:', preset.name);
      setErrors(prev => prev.filter(err => !err.includes('camera preset')));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setErrors(prev => [...prev, `Invalid camera preset: ${errorMessage}`]);
    }
  }, []);

  // Performance monitoring callback
  const handlePerformanceUpdate = useCallback((metrics: { fps: number; frameTime: number }) => {
    setPerformanceMetrics(metrics);
    
    // Adaptive quality based on performance
    if (performanceConfig.adaptiveQuality) {
      if (metrics.fps < performanceConfig.targetFPS * 0.8) {
        // Reduce quality if FPS is too low
        updateVisualConfig({ quality: 'medium' });
      } else if (metrics.fps > performanceConfig.targetFPS * 1.1) {
        // Increase quality if performance allows
        updateVisualConfig({ quality: 'high' });
      }
    }
  }, [performanceConfig, updateVisualConfig]);

  // Start meditation session with validation
  const startSession = useCallback(() => {
    try {
      const sessionConfig: GeometrySessionConfig = {
        id: `session-${Date.now()}`,
        userId: 'current-user', // Would come from auth context
        patternType: selectedPattern,
        frequency: currentPattern.frequency,
        duration: 600, // 10 minutes
        visualConfig,
        biometricTracking: false,
        audioEnabled: true,
        hapticsEnabled: false,
        progressiveDisclosure: true,
      };
      
      GeometrySessionConfigSchema.parse(sessionConfig);
      setSessionActive(true);
      setErrors(prev => prev.filter(err => !err.includes('session')));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setErrors(prev => [...prev, `Invalid session config: ${errorMessage}`]);
    }
  }, [selectedPattern, currentPattern.frequency, visualConfig]);

  return (
    <SacredGeometryErrorBoundary>
      <div className="w-full h-screen bg-gray-900 text-white">
      {/* Header Controls */}
      <div className="absolute top-4 left-4 z-10 space-y-4">
        <Card className="bg-black/80 backdrop-blur-sm border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-yellow-400">Sacred Geometry Visualization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Pattern Selection */}
            <div>
              <label htmlFor="pattern-select" className="text-sm font-medium text-gray-300 mb-2 block">
                Geometry Pattern
              </label>
              <select
                id="pattern-select"
                value={selectedPattern}
                onChange={(e) => setSelectedPattern(e.target.value as GeometryPatternType)}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
              >
                <option value="flower_of_life">Flower of Life</option>
                <option value="metatron_cube">Metatron&apos;s Cube</option>
                <option value="golden_spiral">Golden Spiral</option>
                <option value="platonic_solid">Platonic Solid</option>
                <option value="sri_yantra">Sri Yantra</option>
                <option value="merkaba">Merkaba</option>
                <option value="torus_field">Torus Field</option>
              </select>
            </div>

            {/* Visualization Mode */}
            <div>
              <label htmlFor="render-mode-select" className="text-sm font-medium text-gray-300 mb-2 block">
                Render Mode
              </label>
              <select
                id="render-mode-select"
                value={visualConfig.mode}
                onChange={(e) => updateVisualConfig({ mode: e.target.value as Visualization3DConfig['mode'] })}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
              >
                <option value="wireframe">Wireframe</option>
                <option value="solid">Solid</option>
                <option value="points">Points</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            {/* Scale Control */}
            <div>
              <label htmlFor="scale-control" className="text-sm font-medium text-gray-300 mb-2 block">
                Scale: {geometryScale.toFixed(1)}
              </label>
              <input
                id="scale-control"
                type="range"
                min={0.1}
                max={3}
                step={0.1}
                value={geometryScale}
                onChange={(e) => setGeometryScale(parseFloat(e.target.value))}
                className="w-full"
                aria-label={`Geometry scale: ${geometryScale.toFixed(1)}`}
              />
            </div>

            {/* Animation Controls */}
            <div>
              <label htmlFor="animation-select" className="text-sm font-medium text-gray-300 mb-2 block">
                Animation
              </label>
              <select
                id="animation-select"
                value={animation.type}
                onChange={(e) => updateAnimation({ type: e.target.value as AnimationParameters['type'] })}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
              >
                <option value="rotation">Rotation</option>
                <option value="pulse">Pulse</option>
                <option value="flow">Flow</option>
                <option value="scale">Scale</option>
                <option value="morph">Morph</option>
              </select>
            </div>

            {/* Animation Speed */}
            <div>
              <label htmlFor="speed-control" className="text-sm font-medium text-gray-300 mb-2 block">
                Speed: {animation.speed.toFixed(1)}
              </label>
              <input
                id="speed-control"
                type="range"
                min={0.1}
                max={5}
                step={0.1}
                value={animation.speed}
                onChange={(e) => updateAnimation({ speed: parseFloat(e.target.value) })}
                className="w-full"
                aria-label={`Animation speed: ${animation.speed.toFixed(1)}`}
              />
            </div>

            {/* Session Control */}
            <Button 
              onClick={sessionActive ? () => setSessionActive(false) : startSession}
              className={`w-full ${sessionActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {sessionActive ? 'Stop Session' : 'Start Meditation Session'}
            </Button>

            {/* Advanced Controls Toggle */}
            <Button
              onClick={() => setShowAdvancedControls(!showAdvancedControls)}
              variant="outline"
              className="w-full border-cosmic-blue text-cosmic-blue hover:bg-cosmic-blue hover:text-white"
            >
              {showAdvancedControls ? 'Hide Advanced Controls' : 'Show Advanced Controls'}
            </Button>

            {/* Status Indicators */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-blue-500 text-blue-400">
                {currentPattern.frequency} Hz
              </Badge>
              <Badge variant="outline" className="border-yellow-500 text-yellow-400">
                {currentPattern.points.length} Points
              </Badge>
              {sessionActive && (
                <Badge variant="outline" className="border-green-500 text-green-400">
                  Active Session
                </Badge>
              )}
            </div>

            {/* Error Display */}
            {errors.length > 0 && (
              <div className="bg-red-900/50 border border-red-600 rounded p-2 text-sm">
                {errors.map((error, index) => (
                  <div key={index} className="text-red-300">{error}</div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Advanced Controls Panel */}
        {showAdvancedControls && (
          <Card className="bg-black/80 backdrop-blur-sm border-gray-700 mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-blue-400">Advanced Camera Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Camera Presets */}
              <div>
                <div className="text-sm font-medium text-gray-300 mb-2 block">
                  Camera Presets
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {cameraPresets.map((preset) => (
                    <Button
                      key={preset.name}
                      onClick={() => selectCameraPreset(preset)}
                      variant="outline"
                      size="sm"
                      className="text-xs border-gray-600 text-gray-300 hover:bg-gray-700"
                      aria-label={preset.description}
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Auto Rotate Settings */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="auto-rotate"
                    checked={cameraConfig.autoRotate}
                    onChange={(e) => updateCameraConfig({ autoRotate: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="auto-rotate" className="text-sm text-gray-300">
                    Auto Rotate
                  </label>
                </div>
                
                {cameraConfig.autoRotate && (
                  <div>
                    <label htmlFor="auto-rotate-speed" className="text-sm text-gray-300 mb-1 block">
                      Speed: {cameraConfig.autoRotateSpeed.toFixed(1)}
                    </label>
                    <input
                      id="auto-rotate-speed"
                      type="range"
                      min={-5}
                      max={5}
                      step={0.1}
                      value={cameraConfig.autoRotateSpeed}
                      onChange={(e) => updateCameraConfig({ autoRotateSpeed: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                )}
              </div>

              {/* Damping Settings */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="enable-damping"
                    checked={cameraConfig.enableDamping}
                    onChange={(e) => updateCameraConfig({ enableDamping: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="enable-damping" className="text-sm text-gray-300">
                    Enable Damping
                  </label>
                </div>
                
                {cameraConfig.enableDamping && (
                  <div>
                    <label htmlFor="damping-factor" className="text-sm text-gray-300 mb-1 block">
                      Factor: {cameraConfig.dampingFactor.toFixed(3)}
                    </label>
                    <input
                      id="damping-factor"
                      type="range"
                      min={0.001}
                      max={0.5}
                      step={0.001}
                      value={cameraConfig.dampingFactor}
                      onChange={(e) => updateCameraConfig({ dampingFactor: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                )}
              </div>

              {/* Distance Constraints */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="min-distance" className="text-sm text-gray-300 mb-1 block">
                    Min Distance: {cameraConfig.minDistance.toFixed(1)}
                  </label>
                  <input
                    id="min-distance"
                    type="range"
                    min={0.1}
                    max={10}
                    step={0.1}
                    value={cameraConfig.minDistance}
                    onChange={(e) => updateCameraConfig({ minDistance: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label htmlFor="max-distance" className="text-sm text-gray-300 mb-1 block">
                    Max Distance: {cameraConfig.maxDistance.toFixed(1)}
                  </label>
                  <input
                    id="max-distance"
                    type="range"
                    min={10}
                    max={200}
                    step={5}
                    value={cameraConfig.maxDistance}
                    onChange={(e) => updateCameraConfig({ maxDistance: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Control Speeds */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label htmlFor="rotate-speed" className="text-sm text-gray-300 mb-1 block">
                    Rotate: {cameraConfig.rotateSpeed.toFixed(1)}
                  </label>
                  <input
                    id="rotate-speed"
                    type="range"
                    min={0.1}
                    max={5}
                    step={0.1}
                    value={cameraConfig.rotateSpeed}
                    onChange={(e) => updateCameraConfig({ rotateSpeed: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label htmlFor="zoom-speed" className="text-sm text-gray-300 mb-1 block">
                    Zoom: {cameraConfig.zoomSpeed.toFixed(1)}
                  </label>
                  <input
                    id="zoom-speed"
                    type="range"
                    min={0.1}
                    max={5}
                    step={0.1}
                    value={cameraConfig.zoomSpeed}
                    onChange={(e) => updateCameraConfig({ zoomSpeed: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label htmlFor="pan-speed" className="text-sm text-gray-300 mb-1 block">
                    Pan: {cameraConfig.panSpeed.toFixed(1)}
                  </label>
                  <input
                    id="pan-speed"
                    type="range"
                    min={0.1}
                    max={5}
                    step={0.1}
                    value={cameraConfig.panSpeed}
                    onChange={(e) => updateCameraConfig({ panSpeed: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Control Toggles */}
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="enable-rotate"
                    checked={cameraConfig.enableRotate}
                    onChange={(e) => updateCameraConfig({ enableRotate: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="enable-rotate" className="text-xs text-gray-300">
                    Rotate
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="enable-zoom"
                    checked={cameraConfig.enableZoom}
                    onChange={(e) => updateCameraConfig({ enableZoom: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="enable-zoom" className="text-xs text-gray-300">
                    Zoom
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="enable-pan"
                    checked={cameraConfig.enablePan}
                    onChange={(e) => updateCameraConfig({ enablePan: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="enable-pan" className="text-xs text-gray-300">
                    Pan
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Performance Panel */}
      {showAdvancedControls && (
        <div className="absolute top-4 right-4 z-10">
          <Card className="bg-black/80 backdrop-blur-sm border-gray-700 w-64">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-green-400">Performance Monitor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Performance Metrics */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">FPS:</span>
                  <span className={`font-mono ${performanceMetrics.fps >= performanceConfig.targetFPS * 0.9 ? 'text-green-400' : performanceMetrics.fps >= performanceConfig.targetFPS * 0.7 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {performanceMetrics.fps.toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Frame Time:</span>
                  <span className="text-cosmic-text font-mono">
                    {performanceMetrics.frameTime.toFixed(2)}ms
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Target FPS:</span>
                  <span className="text-cosmic-text font-mono">
                    {performanceConfig.targetFPS}
                  </span>
                </div>
              </div>

              {/* Performance Settings */}
              <div className="space-y-2 pt-2 border-t border-gray-600">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="adaptive-quality"
                    checked={performanceConfig.adaptiveQuality}
                    onChange={(e) => updatePerformanceConfig({ adaptiveQuality: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="adaptive-quality" className="text-xs text-gray-300">
                    Adaptive Quality
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="enable-lod"
                    checked={performanceConfig.enableLOD}
                    onChange={(e) => updatePerformanceConfig({ enableLOD: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="enable-lod" className="text-xs text-gray-300">
                    Level of Detail
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 3D Visualization Canvas */}
      <Canvas
        camera={{ 
          position: [5, 5, 5], 
          fov: 75,
          type: visualConfig.cameraType 
        }}
        shadows={visualConfig.shadows}
        gl={{ 
          antialias: visualConfig.antialias,
          alpha: true 
        }}
      >
        {/* Environment and Lighting */}
        <Environment preset="night" />
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4ECDC4" />

        {/* Sacred Geometry Mesh */}
        <GeometryMesh 
          pattern={currentPattern}
          animation={animation}
          config={visualConfig}
        />

        {/* Advanced Camera Controls */}
        <AdvancedCameraControls
          config={cameraConfig}
          presets={cameraPresets}
          onConfigChange={updateCameraConfig}
          onPresetSelect={selectCameraPreset}
        />

        {/* Performance Monitor */}
        <PerformanceMonitor
          config={performanceConfig}
          onPerformanceUpdate={handlePerformanceUpdate}
        />

        {/* Performance Stats */}
        {visualConfig.quality === 'ultra' && <Stats />}
      </Canvas>

      {/* Pattern Information Overlay */}
      <div className="absolute bottom-4 right-4 z-10">
        <Card className="bg-black/80 backdrop-blur-sm border-gray-700 w-64">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold text-yellow-400 mb-2">
              {selectedPattern.replace('_', ' ').toUpperCase()}
            </h3>
            <div className="text-sm text-gray-300 space-y-1">
              <div>Frequency: {currentPattern.frequency} Hz</div>
              <div>Resonance: {currentPattern.resonance.toFixed(3)}</div>
              <div>Vertices: {currentPattern.points.length}</div>
              <div>Paths: {currentPattern.paths.length}</div>
              <div>Scale: {geometryScale.toFixed(1)}x</div>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </SacredGeometryErrorBoundary>
  );
});

SacredGeometryVisualizationComponent.displayName = 'SacredGeometryVisualizationComponent';

// Memoized export following best practices
const MemoizedSacredGeometryVisualization = React.memo(SacredGeometryVisualizationComponent);
MemoizedSacredGeometryVisualization.displayName = 'SacredGeometryVisualization';

export { MemoizedSacredGeometryVisualization as SacredGeometryVisualization };
export default MemoizedSacredGeometryVisualization;
