/**
 * Enhanced JSON Serialization for CosmicHub Chart Data
 * Alternative to Avro with better TypeScript integration and smaller payloads
 */

// Define proper types for chart data
interface PlanetData {
  position: number;
  house?: number;
  retrograde?: boolean;
}

interface HouseData {
  number: number;
  cusp: number;
  sign: string;
}

interface AspectData {
  point1: string;
  point2: string;
  aspect: string;
  orb: number;
}

interface ChartData {
  planets: Record<string, PlanetData>;
  houses: HouseData[];
  aspects: AspectData[];
  asteroids?: Record<string, PlanetData>;
}

interface OptimizedChartData {
  // Use arrays instead of objects for better compression
  planets: [string, number, number, boolean][]; // [name, position, house, retrograde]
  houses: [number, number, string][]; // [number, cusp, sign]
  aspects: [number, number, string, number][]; // [planet1_idx, planet2_idx, type, orb]
  asteroids?: [string, number, number][]; // [name, position, house]
  meta: {
    planet_names: string[]; // Index mapping for aspects
    timestamp: number;
  };
}
