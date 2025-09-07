import React, { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Center, Float } from '@react-three/drei';
import * as THREE from 'three';

// Simple className utility
const cn = (...classes: (string | undefined)[]): string => {
  return classes.filter(Boolean).join(' ');
};

interface FlowerOfLifeViewerProps {
  expertMode?: boolean;
  showMetatronsCube?: boolean;
  chakraIntegration?: boolean;
  data?: {
    sacred_patterns: {
      flower_of_life: {
        circles: number;
        golden_ratio_factor: number;
        sacred_radius: number;
      };
      metatrons_cube: {
        vertices: number[];
        connections: number[][];
        platonic_revelation: boolean;
      };
    };
    chakra_correspondences?: {
      root: { color: string; frequency: number };
      sacral: { color: string; frequency: number };
      solar: { color: string; frequency: number };
      heart: { color: string; frequency: number };
      throat: { color: string; frequency: number };
      third_eye: { color: string; frequency: number };
      crown: { color: string; frequency: number };
    };
  };
}

// Flower of Life Circle Component
const FlowerOfLifeCircle: React.FC<{
  position: [number, number, number];
  radius: number;
  color: string;
  opacity: number;
}> = ({ position, radius, color, opacity }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Subtle breathing animation
      const breathe = Math.sin(state.clock.elapsedTime * 0.5) * 0.02 + 1;
      meshRef.current.scale.setScalar(breathe);
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <ringGeometry args={[radius * 0.95, radius, 32]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} side={THREE.DoubleSide} />
    </mesh>
  );
};

// Metatron's Cube Component
const MetatronsCube: React.FC<{
  visible: boolean;
  chakraColors?: { [key: string]: { color: string; frequency: number } };
}> = ({ visible, chakraColors }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current && visible) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.1;
    }
  });

  // Metatron's Cube vertices (simplified for sacred geometry)
  const vertices = useMemo(() => [
    [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], // Back face
    [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],   // Front face
    [0, 0, -1.5], [0, 0, 1.5], // Top and bottom centers
    [-1.5, 0, 0], [1.5, 0, 0], [0, -1.5, 0], [0, 1.5, 0] // Side centers
  ], []);

  // Sacred connections forming Metatron's Cube
  const connections = useMemo(() => [
    [0, 1], [1, 2], [2, 3], [3, 0], // Back face
    [4, 5], [5, 6], [6, 7], [7, 4], // Front face
    [0, 4], [1, 5], [2, 6], [3, 7], // Connecting faces
    [8, 0], [8, 1], [8, 2], [8, 3], // Top center connections
    [9, 4], [9, 5], [9, 6], [9, 7], // Bottom center connections
    [10, 0], [10, 3], [10, 4], [10, 7], // Left connections
    [11, 1], [11, 2], [11, 5], [11, 6], // Right connections
    [12, 0], [12, 1], [12, 4], [12, 5], // Bottom connections
    [13, 2], [13, 3], [13, 6], [13, 7]  // Top connections
  ], []);

  if (!visible) return null;

  return (
    <group ref={groupRef}>
      {/* Vertices */}
      {vertices.map((vertex, index) => {
        const chakraKeys = Object.keys(chakraColors ?? {});
        const chakraKey = chakraKeys[index % chakraKeys.length];
        const chakraColor = chakraColors && chakraKey 
          ? chakraColors[chakraKey]?.color 
          : '#ffffff';
        
        return (
          <mesh key={index} position={vertex as [number, number, number]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshBasicMaterial color={chakraColor} />
          </mesh>
        );
      })}

      {/* Edge lines */}
      {connections.map((connection, index) => {
        const startIndex = connection[0];
        const endIndex = connection[1];
        
        if (startIndex === undefined || endIndex === undefined || 
            startIndex >= vertices.length || endIndex >= vertices.length) {
          return null;
        }
        
        const start = vertices[startIndex];
        const end = vertices[endIndex];
        
        if (!start || !end || start.length < 3 || end.length < 3) {
          return null;
        }
        
        const midpoint = [
          (start[0]! + end[0]!) / 2,
          (start[1]! + end[1]!) / 2,
          (start[2]! + end[2]!) / 2
        ];
        const length = Math.sqrt(
          Math.pow(end[0]! - start[0]!, 2) +
          Math.pow(end[1]! - start[1]!, 2) +
          Math.pow(end[2]! - start[2]!, 2)
        );
        
        return (
          <mesh key={index} position={midpoint as [number, number, number]}>
            <cylinderGeometry args={[0.02, 0.02, length, 8]} />
            <meshBasicMaterial color="#6366f1" transparent opacity={0.3} />
          </mesh>
        );
      })}
    </group>
  );
};

// Platonic Solids Revelation Component
const PlatonicRevelation: React.FC<{ 
  visible: boolean; 
  platonicSolids: string[] 
}> = ({ visible, platonicSolids }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current && visible) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
  });

  if (!visible) return null;

  const solidPositions = [
    [-2, 2, 0], [2, 2, 0], [-2, -2, 0], [2, -2, 0], [0, 0, 0]
  ];

  const solidColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'];

  return (
    <group ref={groupRef}>
      {platonicSolids.slice(0, 5).map((solid, index) => (
        <Float key={solid} speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <mesh position={solidPositions[index] as [number, number, number]}>
            {solid === 'tetrahedron' && <tetrahedronGeometry args={[0.8]} />}
            {solid === 'cube' && <boxGeometry args={[0.8, 0.8, 0.8]} />}
            {solid === 'octahedron' && <octahedronGeometry args={[0.8]} />}
            {solid === 'icosahedron' && <icosahedronGeometry args={[0.8]} />}
            {solid === 'dodecahedron' && <dodecahedronGeometry args={[0.8]} />}
            <meshPhongMaterial 
              color={solidColors[index]} 
              transparent 
              opacity={0.7}
              wireframe={false}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
};

// Main Scene Component
const FlowerOfLifeScene: React.FC<FlowerOfLifeViewerProps> = ({ 
  expertMode = false, 
  showMetatronsCube = false, 
  chakraIntegration = false,
  data 
}) => {
  const [_revelationActive] = useState(false);

  // Generate Flower of Life pattern
  const flowerCircles = useMemo(() => {
    const circles: Array<{ position: [number, number, number]; id: number }> = [];
    const radius = data?.sacred_patterns.flower_of_life.sacred_radius ?? 1;
    const goldenRatio = data?.sacred_patterns.flower_of_life.golden_ratio_factor ?? 1.618;
    
    // Central circle
    circles.push({ position: [0, 0, 0], id: 0 });
    
    // First ring (6 circles)
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      circles.push({ position: [x, y, 0], id: i + 1 });
    }
    
    // Second ring (12 circles)
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI * 2) / 12;
      const x = Math.cos(angle) * radius * goldenRatio;
      const y = Math.sin(angle) * radius * goldenRatio;
      circles.push({ position: [x, y, 0], id: i + 7 });
    }
    
    return circles;
  }, [data]);

  return (
    <>
      {/* Flower of Life Circles */}
      {flowerCircles.map((circle) => (
        <FlowerOfLifeCircle
          key={circle.id}
          position={circle.position}
          radius={0.5}
          color={chakraIntegration ? "#ffd700" : "#ffffff"}
          opacity={0.6}
        />
      ))}

      {/* Metatron's Cube */}
      <MetatronsCube 
        visible={showMetatronsCube} 
        chakraColors={data?.chakra_correspondences}
      />

      {/* Platonic Solids Revelation */}
      <PlatonicRevelation 
        visible={_revelationActive && expertMode}
        platonicSolids={['tetrahedron', 'cube', 'octahedron', 'icosahedron', 'dodecahedron']}
      />

      {/* Ambient lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
    </>
  );
};

// Main Component
const FlowerOfLifeViewer: React.FC<FlowerOfLifeViewerProps> = (props) => {
  const [showMetatronsCube, setShowMetatronsCube] = useState(false);
  const [chakraIntegration, setChakraIntegration] = useState(false);

  return (
    <div className="w-full">
      {/* Controls */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setShowMetatronsCube(!showMetatronsCube)} aria-label="Button"
          className={cn(
            "px-3 py-1 rounded text-sm transition-colors",
            showMetatronsCube 
              ? "bg-gold text-cosmic-dark" 
              : "bg-cosmic-purple text-white"
          )}
        >
          {showMetatronsCube ? "Hide" : "Show"} Metatron&apos;s Cube
        </button>
        
        <button
          onClick={() => setChakraIntegration(!chakraIntegration)} aria-label="Button"
          className={cn(
            "px-3 py-1 rounded text-sm transition-colors",
            chakraIntegration 
              ? "bg-green-600 text-white" 
              : "bg-cosmic-purple text-white"
          )}
        >
          {chakraIntegration ? "Disable" : "Enable"} Chakra Integration
        </button>
      </div>

      {/* 3D Canvas */}
      <div className="w-full h-96 overflow-hidden rounded-lg bg-gradient-to-b from-cosmic-dark to-cosmic-blue">
        <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
          <OrbitControls />
          <Center>
            <FlowerOfLifeScene 
              {...props}
              showMetatronsCube={showMetatronsCube}
              chakraIntegration={chakraIntegration}
            />
          </Center>
        </Canvas>
      </div>

      {/* Information Panel */}
      {props.expertMode && (
        <div className="mt-4 p-4 bg-cosmic-purple/20 rounded-lg">
          <h4 className="text-lg font-semibold text-purple-300 mb-2">
            Sacred Geometry Insights
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong className="text-blue-300">Flower of Life:</strong>
              <p className="text-gray-300">
                Ancient symbol containing the patterns of creation. Each circle represents 
                consciousness expanding through sacred proportion.
              </p>
            </div>
            <div>
              <strong className="text-gold">Metatron&apos;s Cube:</strong>
              <p className="text-gray-300">
                Contains all five Platonic solids, representing the geometric patterns 
                that act as templates for physical reality.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


// Memoize the component to prevent unnecessary re-renders
const MemoizedFlowerOfLifeViewer = React.memo(FlowerOfLifeViewer);
MemoizedFlowerOfLifeViewer.displayName = 'FlowerOfLifeViewer';

export { MemoizedFlowerOfLifeViewer as FlowerOfLifeViewer };
export default MemoizedFlowerOfLifeViewer;