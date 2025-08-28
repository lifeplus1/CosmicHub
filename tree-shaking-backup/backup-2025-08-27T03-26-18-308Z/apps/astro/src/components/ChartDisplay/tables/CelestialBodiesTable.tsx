import React, { memo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@cosmichub/ui';
import {
  getPlanetSymbol,
  getSignSymbol,
  getAsteroidSymbol,
  getElementColor,
} from './tableUtils';
import {
  getRulerFromSign,
  getSignFromDegrees,
  calculateHousePosition,
  ZodiacSign,
} from '../../../utils/astrologyUtils';
import { AstrologySettings } from '../AstrologySettings';
import {
  getCelestialBodyCategory,
  CelestialBodyCategory,
} from '../../../utils/celestialBodyCategorization';
import { AstroSymbol } from '../AstroSymbol';

// Unified celestial body interface
export interface CelestialBody {
  name: string;
  symbol?: string;
  position?: number; // degrees 0-360
  degree?: number; // degree within sign 0-30
  sign: string;
  house: string;
  retrograde?: boolean;
  category:
    | 'planets'
    | 'nodes'
    | 'major_asteroids'
    | 'minor_asteroids'
    | 'angles'
    | 'points';
}

interface CelestialBodiesTableProps {
  bodies: CelestialBody[];
  showHouseRulers?: boolean;
  settings?: AstrologySettings;
}

// Categorization and ordering logic
const CATEGORY_ORDER = {
  planets: 1,
  nodes: 2,
  major_asteroids: 3,
  minor_asteroids: 4,
  angles: 5,
  points: 6,
};

const BODY_ORDER_WITHIN_CATEGORY: Record<string, number> = {
  // Classical planets (traditional order)
  Sun: 1,
  Moon: 2,
  Mercury: 3,
  Venus: 4,
  Mars: 5,
  Jupiter: 6,
  Saturn: 7,
  // Modern planets
  Uranus: 8,
  Neptune: 9,
  Pluto: 10,
  // Nodes
  North_node: 11,
  South_node: 12,
  'North Node': 11,
  'South Node': 12,
  // Major asteroids
  Chiron: 13,
  Ceres: 14,
  Pallas: 15,
  Juno: 16,
  Vesta: 17,
  // Angles
  Ascendant: 18,
  Midheaven: 19,
  Descendant: 20,
  IC: 21,
  Imumcoeli: 21,
  // Points
  Vertex: 22,
  Antivertex: 23,
  'Part of Fortune': 24,
};

const CATEGORY_LABELS = {
  planets: '☉ Planets',
  nodes: '☊ Lunar Nodes',
  major_asteroids: '⚷ Major Asteroids',
  minor_asteroids: '⚳ Minor Asteroids',
  angles: '⊡ Angles',
  points: '◊ Special Points',
};

// Auto-categorize celestial body based on name
// Map our centralized categories to the display categories used by this component
const CATEGORY_MAPPING: Record<
  CelestialBodyCategory,
  CelestialBody['category']
> = {
  traditional_planets: 'planets',
  modern_planets: 'planets',
  major_asteroids: 'major_asteroids',
  minor_asteroids: 'minor_asteroids',
  lunar_nodes: 'nodes',
  lilith_points: 'points',
  angles: 'angles',
  special_points: 'points',
  hypothetical: 'points',
};

function categorizeCelestialBody(name: string): CelestialBody['category'] {
  // Use centralized categorization system
  const centralizedCategory = getCelestialBodyCategory(name);

  if (centralizedCategory && CATEGORY_MAPPING[centralizedCategory]) {
    return CATEGORY_MAPPING[centralizedCategory];
  }

  // Fallback to minor_asteroids for unknown bodies
  return 'minor_asteroids';
}

function formatDegree(
  degree: number | undefined,
  position: number | undefined
): string {
  if (degree !== undefined) {
    return `${Math.floor(degree)}°${String(Math.floor((degree % 1) * 60)).padStart(2, '0')}'`;
  }
  if (position !== undefined) {
    const degWithinSign = position % 30;
    return `${Math.floor(degWithinSign)}°${String(Math.floor((degWithinSign % 1) * 60)).padStart(2, '0')}'`;
  }
  return '--';
}

function getSymbolForBody(body: CelestialBody): string {
  // Try planet symbols first, then asteroid symbols
  const planetSymbol = getPlanetSymbol(body.name);
  if (planetSymbol !== '●') return planetSymbol;

  const asteroidSymbol = getAsteroidSymbol(body.name);
  if (asteroidSymbol !== '●') return asteroidSymbol;

  return body.symbol ?? '●';
}

function CelestialBodiesTable({
  bodies,
  showHouseRulers = false,
  settings,
}: CelestialBodiesTableProps) {
  console.log('🔍 CelestialBodiesTable: Bodies count:', bodies.length);
  console.log('🔍 CelestialBodiesTable: Settings:', settings);

  // Enhanced filtering based on granular settings and centralized categorization
  const filteredBodies = bodies.filter(body => {
    if (!settings) return true; // Show all if no settings provided

    // Use centralized categorization system
    const category = getCelestialBodyCategory(body.name);
    console.log(`🔍 Body: ${body.name}, Category: ${category}`);

    if (!category) return true; // Show uncategorized bodies

    // Apply granular filtering based on category
    switch (category) {
      case 'traditional_planets':
        console.log(
          `🔍 ${body.name}: traditionalPlanets = ${settings.celestialBodies.traditionalPlanets}`
        );
        return settings.celestialBodies.traditionalPlanets;
      case 'modern_planets':
        console.log(
          `🔍 ${body.name}: modernPlanets = ${settings.celestialBodies.modernPlanets}`
        );
        return settings.celestialBodies.modernPlanets;
      case 'major_asteroids':
        console.log(
          `🔍 ${body.name}: majorAsteroids = ${settings.celestialBodies.majorAsteroids}`
        );
        return settings.celestialBodies.majorAsteroids;
      case 'minor_asteroids':
        console.log(
          `🔍 ${body.name}: minorAsteroids = ${settings.celestialBodies.minorAsteroids}`
        );
        return settings.celestialBodies.minorAsteroids;
      case 'lunar_nodes':
        console.log(
          `🔍 ${body.name}: lunarNodes = ${settings.celestialBodies.lunarNodes}`
        );
        return settings.celestialBodies.lunarNodes;
      case 'lilith_points':
        console.log(
          `🔍 ${body.name}: lilithPoints = ${settings.celestialBodies.lilithPoints}`
        );
        return settings.celestialBodies.lilithPoints;
      case 'special_points':
        console.log(
          `🔍 ${body.name}: specialPoints = ${settings.celestialBodies.specialPoints}`
        );
        return settings.celestialBodies.specialPoints;
      case 'hypothetical':
        console.log(
          `🔍 ${body.name}: hypotheticalPoints = ${settings.celestialBodies.hypotheticalPoints}`
        );
        return settings.celestialBodies.hypotheticalPoints;
      case 'angles':
        console.log(`🔍 ${body.name}: angles always shown`);
        return true; // Always show angles as they're fundamental chart structure
      default: {
        console.log(`🔍 ${body.name}: fallback to legacy settings`);
        // Fallback to legacy settings for backward compatibility
        const bodyName = body.name.toLowerCase();
        if (bodyName.includes('lilith')) return settings.celestialBodies.lilith;
        if (body.category === 'planets')
          return settings.celestialBodies.planets;
        if (
          body.category === 'major_asteroids' ||
          body.category === 'minor_asteroids'
        )
          return settings.celestialBodies.asteroids;
        if (body.category === 'points') return settings.celestialBodies.points;
        return true;
      }
    }
  });

  console.log(
    '🔍 CelestialBodiesTable: Filtered bodies count:',
    filteredBodies.length
  );

  // Auto-categorize and sort filtered bodies
  const categorizedBodies = filteredBodies.map(body => ({
    ...body,
    category: body.category || categorizeCelestialBody(body.name),
  }));

  const sortedBodies = categorizedBodies.sort((a, b) => {
    // First sort by category
    const catA = CATEGORY_ORDER[a.category] || 999;
    const catB = CATEGORY_ORDER[b.category] || 999;
    if (catA !== catB) return catA - catB;

    // Then sort within category
    const orderA = BODY_ORDER_WITHIN_CATEGORY[a.name] ?? 999;
    const orderB = BODY_ORDER_WITHIN_CATEGORY[b.name] ?? 999;
    if (orderA !== orderB) return orderA - orderB;

    // Finally alphabetical
    return a.name.localeCompare(b.name);
  });

  // Group by category for display
  const groupedBodies = sortedBodies.reduce(
    (groups, body) => {
      const category = body.category;
      groups[category] ??= [];
      groups[category].push(body);
      return groups;
    },
    {} as Record<string, CelestialBody[]>
  );

  return (
    <div className='space-y-6'>
      {Object.entries(groupedBodies).map(([category, categoryBodies]) => (
        <div key={category} className='space-y-2'>
          <h3 className='text-lg font-semibold text-cosmic-gold border-b border-cosmic-gold/30 pb-1'>
            {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] ??
              `${category.charAt(0).toUpperCase() + category.slice(1)}`}
          </h3>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Body</TableHead>
                <TableHead>Sign</TableHead>
                {(!settings || settings.displayOptions.showDegrees) && (
                  <TableHead>Degree</TableHead>
                )}
                <TableHead>House</TableHead>
                {showHouseRulers && category === 'angles' && (
                  <TableHead>Ruler</TableHead>
                )}
                {category !== 'angles' &&
                  (!settings || settings.displayOptions.showRetrograde) && (
                    <TableHead>Status</TableHead>
                  )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {categoryBodies.map((body, index) => {
                const symbol = getSymbolForBody(body);
                const signSymbol = getSignSymbol(body.sign);

                return (
                  <TableRow key={`${category}-${body.name}-${index}`}>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <AstroSymbol
                          symbol={symbol}
                          size='md'
                          title={body.name}
                        />
                        <span className='font-medium'>{body.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <AstroSymbol
                          symbol={signSymbol}
                          size='md'
                          title={body.sign}
                          className={getElementColor(body.sign)}
                        />
                        <span className='capitalize'>{body.sign}</span>
                      </div>
                    </TableCell>
                    {(!settings || settings.displayOptions.showDegrees) && (
                      <TableCell className='font-mono'>
                        {formatDegree(body.degree, body.position)}
                      </TableCell>
                    )}
                    <TableCell>{body.house}</TableCell>

                    {/* Conditional column for house rulers or status */}
                    {showHouseRulers && category === 'angles' ? (
                      <TableCell>
                        {(() => {
                          try {
                            const ruler = getRulerFromSign(
                              body.sign.toLowerCase() as ZodiacSign
                            );
                            const rulerSymbol = getPlanetSymbol(ruler);
                            return (
                              <div className='flex items-center gap-2'>
                                {rulerSymbol !== '●' && (
                                  <AstroSymbol
                                    symbol={rulerSymbol}
                                    size='md'
                                    title={ruler}
                                  />
                                )}
                                <span className='capitalize'>{ruler}</span>
                              </div>
                            );
                          } catch {
                            return <span className='text-gray-400'>--</span>;
                          }
                        })()}
                      </TableCell>
                    ) : category !== 'angles' &&
                      (!settings || settings.displayOptions.showRetrograde) ? (
                      <TableCell>
                        <div className='flex items-center gap-1'>
                          <span
                            className={`${
                              body.retrograde
                                ? 'text-cosmic-red font-bold text-lg'
                                : 'text-cosmic-gold opacity-60'
                            }`}
                          >
                            {body.retrograde ? '℞' : 'D'}
                          </span>
                          <span
                            className={`text-xs ${
                              body.retrograde
                                ? 'text-cosmic-red'
                                : 'text-cosmic-silver opacity-60'
                            }`}
                          >
                            {body.retrograde ? 'Retrograde' : 'Direct'}
                          </span>
                        </div>
                      </TableCell>
                    ) : null}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  );
}

// Type interfaces for conversion function
interface PlanetInput {
  name: string;
  sign: string;
  house: string;
  position?: number;
  degree?: number;
  retrograde?: boolean;
}

interface AsteroidInput {
  name: string;
  sign: string;
  house: string;
  position?: number;
  degree?: number;
}

interface PointInput {
  name: string;
  sign: string;
  house: string;
  position?: number;
  degree?: number;
  retrograde?: boolean;
}

interface HouseInput {
  number?: number;
  cusp: number;
  vertex?: number;
  antivertex?: number;
  part_of_fortune?: number;
}

// Helper function to convert existing data structures to CelestialBody format
export function convertToCelestialBodies(chartData: {
  planets?: PlanetInput[];
  asteroids?: AsteroidInput[];
  points?: PointInput[];
  angles?: {
    ascendant: number;
    midheaven: number;
    descendant: number;
    imumcoeli: number;
    vertex?: number;
    antivertex?: number;
    part_of_fortune?: number;
  };
  houses?: HouseInput[];
}): CelestialBody[] {
  const bodies: CelestialBody[] = [];

  // Convert planets
  if (chartData.planets) {
    chartData.planets.forEach(planet => {
      bodies.push({
        name: planet.name,
        sign: planet.sign,
        house: planet.house,
        position: planet.position,
        degree: planet.degree,
        retrograde: planet.retrograde,
        category: categorizeCelestialBody(planet.name),
      });
    });
  }

  // Convert asteroids
  if (chartData.asteroids) {
    chartData.asteroids.forEach(asteroid => {
      bodies.push({
        name: asteroid.name,
        sign: asteroid.sign,
        house: asteroid.house,
        position: asteroid.position,
        degree: asteroid.degree,
        category: categorizeCelestialBody(asteroid.name),
      });
    });
  }

  // Convert points (nodes, Lilith, etc.)
  if (chartData.points) {
    chartData.points.forEach(point => {
      bodies.push({
        name: point.name,
        sign: point.sign,
        house: point.house,
        position: point.position,
        degree: point.degree,
        retrograde: point.retrograde,
        category: categorizeCelestialBody(point.name), // This will categorize nodes/lilith correctly
      });
    });
  }

  // Convert angles
  if (chartData.angles) {
    const angleEntries = [
      { name: 'ascendant', position: chartData.angles.ascendant },
      { name: 'midheaven', position: chartData.angles.midheaven },
      { name: 'descendant', position: chartData.angles.descendant },
      { name: 'imumcoeli', position: chartData.angles.imumcoeli },
    ];

    // Add optional angles if they exist
    if (chartData.angles.vertex !== undefined) {
      angleEntries.push({ name: 'vertex', position: chartData.angles.vertex });
    }
    if (chartData.angles.antivertex !== undefined) {
      angleEntries.push({
        name: 'antivertex',
        position: chartData.angles.antivertex,
      });
    }
    if (chartData.angles.part_of_fortune !== undefined) {
      angleEntries.push({
        name: 'part_of_fortune',
        position: chartData.angles.part_of_fortune,
      });
    }

    angleEntries.forEach(angle => {
      if (typeof angle.position === 'number') {
        bodies.push({
          name: angle.name,
          sign: getSignFromDegrees(angle.position),
          house: calculateHousePosition(
            angle.position,
            chartData.houses?.map(h => h.cusp) ?? []
          ).toString(),
          position: angle.position,
          degree: angle.position % 30, // Position within sign
          category:
            angle.name === 'vertex' ||
            angle.name === 'antivertex' ||
            angle.name === 'part_of_fortune'
              ? 'points'
              : 'angles',
        });
      }
    });
  }

  // Extract additional points from houses (Vertex, Antivertex, Part of Fortune)
  if (chartData.houses) {
    chartData.houses.forEach(house => {
      // Check if house data contains special points
      (['vertex', 'antivertex', 'part_of_fortune'] as const).forEach(
        pointName => {
          if (house[pointName] !== undefined) {
            const position = house[pointName];
            if (typeof position === 'number') {
              bodies.push({
                name: pointName
                  .replace('_', ' ')
                  .replace(/\b\w/g, l => l.toUpperCase()),
                sign: '', // Will be calculated from position
                house: String(house.number ?? '--'),
                position,
                category: 'points',
              });
            }
          }
        }
      );
    });
  }

  return bodies;
}

export default memo(CelestialBodiesTable);
