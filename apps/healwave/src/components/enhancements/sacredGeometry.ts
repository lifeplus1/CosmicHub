/**
 * Sacred Geometry Calculations for HealWave Frequency Visualization
 * 
 * This module provides mathematical functions for generating sacred geometric
 * patterns based on audio frequencies, creating visual meditation aids that
 * enhance the therapeutic experience.
 */

export interface GeometryPattern {
  type: 'flower_of_life' | 'metatron_cube' | 'golden_spiral' | 'platonic_solid';
  points: Array<{ x: number; y: number; z?: number }>;
  paths: Array<Array<number>>; // Indices into points array
  colors: string[];
  frequency: number;
  resonance: number; // 0-1 indicating how well frequency matches sacred ratios
}

export interface SacredRatio {
  name: string;
  value: number;
  frequencies: readonly number[];
  meaning: string;
}

// Sacred mathematical ratios found in nature and spirituality
export const SACRED_RATIOS = {
  golden: {
    name: 'Golden Ratio (φ)',
    value: 1.618033988749,
    frequencies: [432, 528, 639, 741], // Frequencies that harmonize with φ
    meaning: 'Divine proportion found throughout nature'
  },
  pi: {
    name: 'Pi (π)',
    value: Math.PI,
    frequencies: [314, 628, 942], // π * 100, π * 200, π * 300
    meaning: 'Cosmic circle representing wholeness and unity'
  },
  euler: {
    name: "Euler's Number (e)",
    value: Math.E,
    frequencies: [272, 544, 816], // e * 100, e * 200, e * 300
    meaning: 'Natural growth and transformation'
  },
  sqrt2: {
    name: 'Square Root of 2',
    value: Math.sqrt(2),
    frequencies: [141, 282, 565], // √2 * 100, √2 * 200, √2 * 400
    meaning: 'Diagonal harmony and balance'
  }
} as const;

/**
 * Calculate sacred geometry pattern for a given frequency
 */
export function calculateSacredPattern(frequency: number, size: number = 300): GeometryPattern {
  const resonance = calculateResonance(frequency);
  const _ratio = findClosestSacredRatio(frequency);
  
  if (frequency >= 396 && frequency <= 417) {
    return generateFlowerOfLife(frequency, size, resonance);
  } else if (frequency >= 528 && frequency <= 639) {
    return generateMetatronCube(frequency, size, resonance);
  } else if (frequency >= 741 && frequency <= 852) {
    return generateGoldenSpiral(frequency, size, resonance);
  } else {
    return generatePlatonicSolid(frequency, size, resonance);
  }
}

/**
 * Calculate how well a frequency resonates with sacred ratios
 */
export function calculateResonance(frequency: number): number {
  let bestResonance = 0;
  
  Object.values(SACRED_RATIOS).forEach(ratio => {
    ratio.frequencies.forEach(sacredFreq => {
      const distance = Math.abs(frequency - sacredFreq) / sacredFreq;
      const resonance = Math.max(0, 1 - distance * 2); // Linear falloff
      bestResonance = Math.max(bestResonance, resonance);
    });
  });
  
  return bestResonance;
}

/**
 * Find the sacred ratio closest to the given frequency
 */
export function findClosestSacredRatio(frequency: number): SacredRatio {
  let closestRatio: SacredRatio | null = null;
  let smallestDistance = Infinity;
  
  Object.values(SACRED_RATIOS).forEach(ratio => {
    ratio.frequencies.forEach(sacredFreq => {
      const distance = Math.abs(frequency - sacredFreq);
      if (distance < smallestDistance) {
        smallestDistance = distance;
        closestRatio = ratio;
      }
    });
  });
  
  // Ensure we always return a valid SacredRatio
  if (closestRatio === null) {
    return SACRED_RATIOS.golden;
  }
  return closestRatio;
}

/**
 * Generate Flower of Life pattern (Root/Sacral chakras)
 */
function generateFlowerOfLife(frequency: number, size: number, resonance: number): GeometryPattern {
  const points: Array<{ x: number; y: number }> = [];
  const paths: Array<Array<number>> = [];
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.15;
  
  // Create 7 overlapping circles in the flower of life pattern
  const centers = [
    { x: centerX, y: centerY }, // Center circle
    { x: centerX + radius, y: centerY },
    { x: centerX - radius, y: centerY },
    { x: centerX + radius/2, y: centerY + radius * Math.sin(Math.PI/3) },
    { x: centerX - radius/2, y: centerY + radius * Math.sin(Math.PI/3) },
    { x: centerX + radius/2, y: centerY - radius * Math.sin(Math.PI/3) },
    { x: centerX - radius/2, y: centerY - radius * Math.sin(Math.PI/3) },
  ];
  
  centers.forEach((center, _circleIndex) => {
    const startIndex = points.length;
    const circlePoints: number[] = [];
    
    // Generate points for each circle
    const segments = Math.floor(32 + resonance * 16); // More points for higher resonance
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * 2 * Math.PI;
      const x = center.x + radius * Math.cos(angle);
      const y = center.y + radius * Math.sin(angle);
      points.push({ x, y });
      circlePoints.push(startIndex + i);
    }
    
    paths.push(circlePoints);
  });
  
  // Generate colors based on frequency and resonance
  const baseHue = (frequency % 360);
  const colors = centers.map((_, index) => 
    `hsl(${(baseHue + index * 30) % 360}, ${70 + resonance * 30}%, ${50 + resonance * 20}%)`
  );
  
  return {
    type: 'flower_of_life',
    points,
    paths,
    colors,
    frequency,
    resonance
  };
}

/**
 * Generate Metatron's Cube pattern (Solar Plexus/Heart chakras)
 */
function generateMetatronCube(frequency: number, size: number, resonance: number): GeometryPattern {
  const points: Array<{ x: number; y: number }> = [];
  const paths: Array<Array<number>> = [];
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.3;
  
  // Create the 13 circles of Metatron's Cube
  const circlePositions = [
    { x: 0, y: 0 }, // Center
    { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }, // Inner ring
    { x: 0.866, y: 0.5 }, { x: 0.866, y: -0.5 }, { x: -0.866, y: 0.5 }, { x: -0.866, y: -0.5 }, // Outer ring
    { x: 1.732, y: 0 }, { x: -1.732, y: 0 }, { x: 0, y: 1.732 }, { x: 0, y: -1.732 }
  ];
  
  circlePositions.forEach((pos, _circleIndex) => {
    const startIndex = points.length;
    const circlePoints: number[] = [];
    const circleRadius = radius * 0.3;
    
    const segments = Math.floor(24 + resonance * 12);
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * 2 * Math.PI;
      const x = centerX + pos.x * radius * 0.6 + circleRadius * Math.cos(angle);
      const y = centerY + pos.y * radius * 0.6 + circleRadius * Math.sin(angle);
      points.push({ x, y });
      circlePoints.push(startIndex + i);
    }
    
    paths.push(circlePoints);
  });
  
  // Add connecting lines between circles for the cube structure
  const connections: Array<[number, number]> = [
    [0, 1], [0, 2], [0, 3], [0, 4], // Center to inner ring
    [1, 5], [1, 6], [2, 7], [2, 8], // Inner to outer
    [5, 9], [6, 9], [7, 10], [8, 10] // Outer connections
  ];
  
  connections.forEach(([from, to]) => {
    if (from >= circlePositions.length || to >= circlePositions.length) return;
    
    const fromCenter = circlePositions[from];
    const toCenter = circlePositions[to];
    if (!fromCenter || !toCenter) return;
    
    const linePoints: number[] = [];
    
    for (let t = 0; t <= 1; t += 0.1) {
      const x = centerX + (fromCenter.x + t * (toCenter.x - fromCenter.x)) * radius * 0.6;
      const y = centerY + (fromCenter.y + t * (toCenter.y - fromCenter.y)) * radius * 0.6;
      points.push({ x, y });
      linePoints.push(points.length - 1);
    }
    
    paths.push(linePoints);
  });
  
  const baseHue = (frequency % 360);
  const colors = paths.map((_, index) => 
    `hsl(${(baseHue + index * 25) % 360}, ${60 + resonance * 30}%, ${45 + resonance * 25}%)`
  );
  
  return {
    type: 'metatron_cube',
    points,
    paths,
    colors,
    frequency,
    resonance
  };
}

/**
 * Generate Golden Spiral pattern (Throat/Third Eye chakras)
 */
function generateGoldenSpiral(frequency: number, size: number, resonance: number): GeometryPattern {
  const points: Array<{ x: number; y: number }> = [];
  const paths: Array<Array<number>> = [];
  const centerX = size / 2;
  const centerY = size / 2;
  const maxRadius = size * 0.4;
  
  const spiralPoints: number[] = [];
  const goldenRatio = SACRED_RATIOS.golden?.value ?? 1.618033988749;
  const turns = 3 + resonance * 2; // More turns for higher resonance
  const totalPoints = Math.floor(200 + resonance * 100);
  
  for (let i = 0; i < totalPoints; i++) {
    const t = i / totalPoints;
    const angle = t * turns * 2 * Math.PI;
    const radius = maxRadius * Math.pow(goldenRatio, -t * 2);
    
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
    points.push({ x, y });
    spiralPoints.push(i);
  }
  
  paths.push(spiralPoints);
  
  // Add fibonacci rectangles
  let fibA = 1, fibB = 1;
  const _rectangles: number[] = [];
  
  for (let i = 0; i < 8; i++) {
    const nextFib = fibA + fibB;
    const scale = Math.min(size / (nextFib * 10), 1);
    
    // Create rectangle points
    const rectSize = nextFib * scale * 10;
    const rectX = centerX - rectSize / 2;
    const rectY = centerY - rectSize / 2;
    
    const rectPoints = [
      { x: rectX, y: rectY },
      { x: rectX + rectSize, y: rectY },
      { x: rectX + rectSize, y: rectY + rectSize },
      { x: rectX, y: rectY + rectSize }
    ];
    
    const rectIndices: number[] = [];
    rectPoints.forEach(point => {
      points.push(point);
      rectIndices.push(points.length - 1);
    });
    if (rectIndices.length > 0) {
      const firstIndex = rectIndices[0];
      if (firstIndex !== undefined) {
        rectIndices.push(firstIndex); // Close the rectangle
      }
    }
    
    paths.push(rectIndices);
    
    fibA = fibB;
    fibB = nextFib;
  }
  
  const baseHue = (frequency % 360);
  const colors = paths.map((_, index) => 
    index === 0 
      ? `hsl(${baseHue}, ${80 + resonance * 20}%, ${60 + resonance * 20}%)` // Spiral
      : `hsl(${(baseHue + index * 40) % 360}, ${50 + resonance * 30}%, ${40 + resonance * 20}%)` // Rectangles
  );
  
  return {
    type: 'golden_spiral',
    points,
    paths,
    colors,
    frequency,
    resonance
  };
}

/**
 * Generate Platonic Solid pattern (Crown chakra and custom frequencies)
 */
function generatePlatonicSolid(frequency: number, size: number, resonance: number): GeometryPattern {
  const points: Array<{ x: number; y: number; z?: number }> = [];
  const paths: Array<Array<number>> = [];
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.3;
  
  // Generate icosahedron (20-sided) - the most complex platonic solid
  const goldenRatio = SACRED_RATIOS.golden?.value ?? 1.618033988749;
  const vertices3D = [
    [-1, goldenRatio, 0], [1, goldenRatio, 0], [-1, -goldenRatio, 0], [1, -goldenRatio, 0],
    [0, -1, goldenRatio], [0, 1, goldenRatio], [0, -1, -goldenRatio], [0, 1, -goldenRatio],
    [goldenRatio, 0, -1], [goldenRatio, 0, 1], [-goldenRatio, 0, -1], [-goldenRatio, 0, 1]
  ];
  
  // Project 3D vertices to 2D with rotation based on frequency
  const rotationSpeed = frequency / 1000;
  vertices3D.forEach((vertex, _index) => {
    const [x, y, z] = vertex;
    if (x === undefined || y === undefined || z === undefined) return;
    
    const rotatedX = x * Math.cos(rotationSpeed) - z * Math.sin(rotationSpeed);
    const rotatedZ = x * Math.sin(rotationSpeed) + z * Math.cos(rotationSpeed);
    
    // Simple orthographic projection
    const projectedX = centerX + rotatedX * radius;
    const projectedY = centerY + y * radius;
    
    points.push({ x: projectedX, y: projectedY, z: rotatedZ });
  });
  
  // Define icosahedron edges
  const edges = [
    [0, 11], [0, 5], [0, 1], [0, 7], [0, 10], [1, 5], [5, 11], [11, 10], [10, 7], [7, 1],
    [3, 9], [3, 4], [3, 2], [3, 6], [3, 8], [4, 9], [9, 8], [8, 6], [6, 2], [2, 4],
    [1, 9], [5, 4], [11, 2], [10, 6], [7, 8], [0, 3], [1, 8], [5, 9], [11, 4], [10, 2], [7, 6]
  ];
  
  // Create paths for each edge
  edges.forEach((edge) => { 
    const [start, end] = edge; 
    if (start === undefined || end === undefined) return;
    if (start >= points.length || end >= points.length) return;
    
    const edgePoints: number[] = [];
    const segments = Math.floor(5 + resonance * 5);
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const startPoint = points[start];
      const endPoint = points[end];
      if (!startPoint || !endPoint) continue;
      
      const x = startPoint.x + t * (endPoint.x - startPoint.x);
      const y = startPoint.y + t * (endPoint.y - startPoint.y);
      
      points.push({ x, y });
      edgePoints.push(points.length - 1);
    }
    
    paths.push(edgePoints);
  });
  
  const baseHue = (frequency % 360);
  const colors = paths.map((_, index) => 
    `hsl(${(baseHue + index * 15) % 360}, ${70 + resonance * 30}%, ${50 + resonance * 25}%)`
  );
  
  return {
    type: 'platonic_solid',
    points,
    paths,
    colors,
    frequency,
    resonance
  };
}

/**
 * Animate geometry pattern based on audio intensity
 */
export function animatePattern(
  pattern: GeometryPattern, 
  audioIntensity: number, 
  time: number
): GeometryPattern {
  const animatedPoints = pattern.points.map((point, index) => {
    const pulsePhase = (time * 0.001 + index * 0.1) % (2 * Math.PI);
    const pulse = 1 + audioIntensity * 0.3 * Math.sin(pulsePhase);
    
    const centerX = 300 / 2; // Assume 300px canvas
    const centerY = 300 / 2;
    
    return {
      x: centerX + (point.x - centerX) * pulse,
      y: centerY + (point.y - centerY) * pulse,
      z: point.z
    };
  });
  
  return {
    ...pattern,
    points: animatedPoints
  };
}

export default {
  calculateSacredPattern,
  calculateResonance,
  findClosestSacredRatio,
  animatePattern,
  SACRED_RATIOS
};
