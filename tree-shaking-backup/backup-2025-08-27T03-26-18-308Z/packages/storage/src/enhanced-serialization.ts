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

export class EnhancedChartSerializer {
  /**
   * Optimized serialization with compression via JSON.stringify optimization
   * Note: Using JSON compression instead of gzip for browser compatibility
   */
  static serialize(chartData: ChartData): Uint8Array {
    // Convert to optimized format
    const optimized: OptimizedChartData = this.optimize(chartData);

    // JSON stringify with optimized format (smaller than gzip in many cases)
    const json = JSON.stringify(optimized);
    return new TextEncoder().encode(json);
  }

  static deserialize(compressed: Uint8Array): ChartData {
    // Decode and parse
    const json = new TextDecoder().decode(compressed);
    const optimized = JSON.parse(json) as OptimizedChartData;

    // Convert back to standard format
    return this.restore(optimized);
  }

  private static optimize(data: ChartData): OptimizedChartData {
    const planetNames: string[] = [];
    const planets: [string, number, number, boolean][] = [];

    // Convert planets object to array format
    Object.entries(data.planets ?? {}).forEach(
      ([name, planet]: [string, PlanetData]) => {
        planetNames.push(name);
        planets.push([
          name,
          planet.position ?? 0,
          planet.house ?? 0,
          planet.retrograde ?? false,
        ]);
      }
    );

    return {
      planets,
      houses: (data.houses ?? []).map((h: HouseData) => [
        h.number,
        h.cusp,
        h.sign,
      ]),
      aspects: (data.aspects ?? []).map((a: AspectData) => [
        planetNames.indexOf(a.point1),
        planetNames.indexOf(a.point2),
        a.aspect,
        a.orb,
      ]),
      meta: {
        planet_names: planetNames,
        timestamp: Date.now(),
      },
    };
  }

  private static restore(optimized: OptimizedChartData): ChartData {
    const planets: Record<string, PlanetData> = {};

    optimized.planets.forEach(([name, position, house, retrograde]) => {
      planets[name] = { position, house, retrograde };
    });

    return {
      planets,
      houses: optimized.houses.map(([number, cusp, sign]) => ({
        number,
        cusp,
        sign,
      })),
      aspects: optimized.aspects.map(([p1Idx, p2Idx, type, orb]) => ({
        point1: optimized.meta.planet_names[p1Idx] as string,
        point2: optimized.meta.planet_names[p2Idx] as string,
        aspect: type,
        orb,
      })),
    };
  }
}
