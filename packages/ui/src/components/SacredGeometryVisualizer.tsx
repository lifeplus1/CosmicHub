import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Center, Float } from '@react-three/drei';
import * as THREE from 'three';
import styles from '../styles/modules/components/SacredGeometryVisualizer.module.css';

// Simple className utility
const cn = (...classes: (string | undefined)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Expert-recommended types for sacred geometry data
interface SacredGeometryData {
  golden_ratio_analysis: {
    primary_phi_ratio: number;
    resonance_strength: number;
    optimal_meditation_times: string[];
  };
  platonic_solid_correspondences: Record<string, { value: string }>;
  mandala_data: {
    meditation_focus: string;
    color_harmonics: string[];
  };
  tcm_geometric_integration: {
    five_element_geometry: Record<string, unknown>;
  };
}

// Core geometric primitives based on expert specifications
interface PlatonicSolidProps {
  element: string;
  color: string;
  position: [number, number, number];
  scale: number;
  rotation: [number, number, number];
  animationSpeed: number;
}

// Tetrahedron (Fire element) - Expert specified
const Tetrahedron: React.FC<PlatonicSolidProps> = React.memo(({ 
  color, position, scale, rotation, animationSpeed 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += animationSpeed * 0.01;
      meshRef.current.rotation.x += animationSpeed * 0.005;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
      <mesh ref={meshRef} position={position} scale={scale} rotation={rotation}>
        <tetrahedronGeometry args={[1, 0]} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.8} 
          wireframe={false}
        />
      </mesh>
    </Float>
  );
});

Tetrahedron.displayName = 'Tetrahedron';

// Cube (Earth element) - Expert specified  
const Cube: React.FC<PlatonicSolidProps> = React.memo(({ 
  color, position, scale, rotation, animationSpeed 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += animationSpeed * 0.008;
      meshRef.current.rotation.z += animationSpeed * 0.003;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.1}>
      <mesh ref={meshRef} position={position} scale={scale} rotation={rotation}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.85} 
        />
      </mesh>
    </Float>
  );
});

Cube.displayName = 'Cube';

// Octahedron (Air element)
const Octahedron: React.FC<PlatonicSolidProps> = React.memo(({ 
  color, position, scale, rotation, animationSpeed 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += animationSpeed * 0.012;
      meshRef.current.rotation.y += animationSpeed * 0.007;
    }
  });

  return (
    <Float speed={2.5} rotationIntensity={0.15} floatIntensity={0.3}>
      <mesh ref={meshRef} position={position} scale={scale} rotation={rotation}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.75} 
        />
      </mesh>
    </Float>
  );
});

Octahedron.displayName = 'Octahedron';

// Icosahedron (Water element)
const Icosahedron: React.FC<PlatonicSolidProps> = React.memo(({ 
  color, position, scale, rotation, animationSpeed 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += animationSpeed * 0.006;
      meshRef.current.rotation.x += animationSpeed * 0.009;
    }
  });

  return (
    <Float speed={1.8} rotationIntensity={0.1} floatIntensity={0.2}>
      <mesh ref={meshRef} position={position} scale={scale} rotation={rotation}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.7} 
        />
      </mesh>
    </Float>
  );
});

Icosahedron.displayName = 'Icosahedron';

// Dodecahedron (Ether/Spirit element)
const Dodecahedron: React.FC<PlatonicSolidProps> = React.memo(({ 
  color, position, scale, rotation, animationSpeed 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += animationSpeed * 0.004;
      meshRef.current.rotation.z += animationSpeed * 0.008;
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.05} floatIntensity={0.15}>
      <mesh ref={meshRef} position={position} scale={scale} rotation={rotation}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.9} 
        />
      </mesh>
    </Float>
  );
});

Dodecahedron.displayName = 'Dodecahedron';

// Golden Ratio Spiral - Expert recommended visualization
const GoldenSpiral: React.FC<{ 
  scale: number; 
  color: string;
  animationSpeed: number;
}> = React.memo(({ scale, color, animationSpeed }) => {
  const points = useMemo(() => {
    const phi = 1.618033988749; // Golden ratio from SPIRITUAL-003.5
    const curve = new THREE.CatmullRomCurve3([]);
    const spiralPoints: THREE.Vector3[] = [];
    
    for (let i = 0; i <= 100; i++) {
      const angle = (i / 100) * Math.PI * 4;
      const radius = Math.pow(phi, angle / (Math.PI * 2)) * 0.1;
      spiralPoints.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        i * 0.02 - 1
      ));
    }
    
    curve.points = spiralPoints;
    return curve;
  }, []);

  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.z += animationSpeed * 0.005;
    }
  });

  return (
    <mesh ref={meshRef} scale={scale}>
      <tubeGeometry args={[points, 100, 0.01, 8, false]} />
      <meshStandardMaterial 
        color={color} 
        emissive={color} 
        emissiveIntensity={0.3}
      />
    </mesh>
  );
});

GoldenSpiral.displayName = 'GoldenSpiral';

// Main Sacred Geometry Scene - Expert-guided implementation
interface SacredGeometrySceneProps {
  data: SacredGeometryData;
  elementColors: Record<string, string>;
  showGoldenSpiral: boolean;
  animationSpeed: number;
}

const SacredGeometryScene: React.FC<SacredGeometrySceneProps> = ({
  data,
  elementColors,
  showGoldenSpiral,
  animationSpeed
}) => {
  const { camera } = useThree();
  
  useEffect(() => {
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  // Expert-specified elemental mapping
  const elementPositions: Record<string, [number, number, number]> = {
    fire: [2, 2, 0],
    earth: [-2, -2, 0],
    air: [2, -2, 0],
    water: [-2, 2, 0],
    ether: [0, 0, 2]
  };

  return (
    <>
      {/* Ambient and directional lighting for proper 3D visualization */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <pointLight position={[-10, -10, -10]} intensity={0.3} />
      
      {/* Platonic Solids with TCM Element Integration */}
      <Tetrahedron
        element="fire"
        color={elementColors.fire ?? '#FF4444'}
        position={elementPositions.fire ?? [2, 2, 0]}
        scale={1}
        rotation={[0, 0, 0]}
        animationSpeed={animationSpeed}
      />
      
      <Cube
        element="earth"
        color={elementColors.earth ?? '#8B4513'}
        position={elementPositions.earth ?? [-2, -2, 0]}
        scale={1}
        rotation={[0, 0, 0]}
        animationSpeed={animationSpeed}
      />
      
      <Octahedron
        element="air"
        color={elementColors.air ?? '#87CEEB'}
        position={elementPositions.air ?? [2, -2, 0]}
        scale={1}
        rotation={[0, 0, 0]}
        animationSpeed={animationSpeed}
      />
      
      <Icosahedron
        element="water"
        color={elementColors.water ?? '#4169E1'}
        position={elementPositions.water ?? [-2, 2, 0]}
        scale={1}
        rotation={[0, 0, 0]}
        animationSpeed={animationSpeed}
      />
      
      <Dodecahedron
        element="ether"
        color={elementColors.ether ?? '#9370DB'}
        position={elementPositions.ether ?? [0, 0, 2]}
        scale={1}
        rotation={[0, 0, 0]}
        animationSpeed={animationSpeed}
      />
      
      {/* Golden Ratio Spiral - Expert recommended */}
      {showGoldenSpiral && (
        <GoldenSpiral 
          scale={2} 
          color="#FFD700" 
          animationSpeed={animationSpeed}
        />
      )}
      
      {/* Meditation focus indicator - Simple placeholder */}
      {data.mandala_data.meditation_focus && (
        <Center position={[0, -3, 0]}>
          <mesh>
            <boxGeometry args={[0.1, 0.1, 0.1]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
        </Center>
      )}
      
      <OrbitControls />
    </>
  );
};

// Main component interface - Expert-guided progressive disclosure
interface SacredGeometryVisualizerProps {
  data: SacredGeometryData;
  className?: string;
  height?: string;
  expertMode?: boolean;
  showControls?: boolean;
}

export const SacredGeometryVisualizer: React.FC<SacredGeometryVisualizerProps> = React.memo(({
  data,
  className,
  height = '500px',
  expertMode = false,
  showControls = true
}) => {
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [showGoldenSpiral, setShowGoldenSpiral] = useState(true);

  const handleAnimationSpeedChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setAnimationSpeed(parseFloat(e.target.value));
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setShowGoldenSpiral(!showGoldenSpiral);
    }
  }, [showGoldenSpiral]);

  const toggleGoldenSpiral = useCallback(() => {
    setShowGoldenSpiral(!showGoldenSpiral);
  }, [showGoldenSpiral]);

  // Expert-recommended TCM color harmonics integration
  const elementColors = useMemo(() => {
    const colors = data.mandala_data.color_harmonics;
    return {
      fire: colors[0] ?? '#FF4444',
      earth: colors[1] ?? '#8B4513', 
      air: colors[2] ?? '#87CEEB',
      water: colors[3] ?? '#4169E1',
      ether: colors[4] ?? '#9370DB'
    };
  }, [data.mandala_data.color_harmonics]);

  // Determine height class based on height prop
  const getHeightClass = (heightProp: string) => {
    switch (heightProp) {
      case '300px': return styles.canvasContainerSmall;
      case '400px': return styles.canvasContainerMedium;
      case '600px': return styles.canvasContainerLarge;
      case '100vh': return styles.canvasContainerFull;
      default: return styles.canvasContainerDefault;
    }
  };

  return (
    <div className={cn(styles.visualizerContainer, className)}>
      {/* 3D Canvas with expert-specified performance settings */}
      <div className={cn(styles.canvasContainer, getHeightClass(height))}>
        <Canvas
          camera={{ position: [5, 5, 5], fov: 75 }}
          dpr={[1, 2]}
          gl={{ 
            antialias: true, 
            alpha: true,
            powerPreference: "high-performance"
          }}
        >
          <SacredGeometryScene
            data={data}
            elementColors={elementColors}
            showGoldenSpiral={showGoldenSpiral}
            animationSpeed={animationSpeed}
          />
        </Canvas>
      </div>

      {/* Expert-recommended progressive disclosure controls */}
      {showControls && expertMode && (
        <div className={styles.expertControls}>
          <div className={styles.controlsTitle}>
            Sacred Geometry Controls
          </div>
          
          <div className={styles.controlGroup}>
            <label htmlFor="animation-speed" className={styles.controlLabel}>
              Animation Speed
            </label>
            <input
              id="animation-speed"
              type="range"
              min="0"
              max="3"
              step="0.1"
              value={animationSpeed}
              onChange={handleAnimationSpeedChange}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                }
              }}
              className={styles.customSlider}
              aria-label="Animation Speed Control"
            />
          </div>
          
          <div className={styles.switchContainer}>
            <label htmlFor="golden-spiral" className={styles.switchLabel}>
              Golden Ratio Spiral
            </label>
            <button
              type="button"
              role="switch"
              aria-checked={showGoldenSpiral}
              onClick={toggleGoldenSpiral}
              onKeyDown={handleKeyDown}
              className={`${styles.customSwitch} ${showGoldenSpiral ? styles.customSwitchChecked : ''}`}
              aria-label="Toggle Golden Ratio Spiral"
            >
              <span className={`${styles.customSwitchThumb} ${showGoldenSpiral ? styles.customSwitchThumbChecked : ''}`} />
            </button>
          </div>
        </div>
      )}      {/* Golden ratio analysis display - Expert specified */}
      <div className={styles.goldenRatioDisplay}>
        <div className={styles.goldenRatioTitle}>
          Golden Ratio Analysis
        </div>
        <div className={styles.goldenRatioValue}>
          φ = {data.golden_ratio_analysis.primary_phi_ratio.toFixed(6)}
        </div>
        <div className={styles.resonanceText}>
          Resonance: {(data.golden_ratio_analysis.resonance_strength * 100).toFixed(1)}%
        </div>
      </div>
    </div>
  );
});

SacredGeometryVisualizer.displayName = 'SacredGeometryVisualizer';

export default SacredGeometryVisualizer;
