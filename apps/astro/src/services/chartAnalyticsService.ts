/**
 * Advanced Chart Analytics and Interpretation Service
 * Provides real-time astrological insights and pattern recognition
 */

import type { ChartData, Planet, Aspect } from './api.types';
// NOTE: We intentionally import only types from api.types to avoid runtime coupling.

// Internal utility types & helpers
// Using string key allows extended dynamic planets; PlanetName subset is enforced where needed.
type PlanetEntries = Array<[string, Planet]>;

function getPlanetEntries(chartData: ChartData): PlanetEntries {
  return Object.entries(chartData.planets) as PlanetEntries;
}

/** Type guard for Aspect interface */
function isAspect(value: unknown): value is Aspect {
  return (
    typeof value === 'object' &&
    value !== null &&
    'orb' in value &&
    typeof (value as Aspect).orb === 'number' &&
    Number.isFinite((value as Aspect).orb) &&
    'planet1' in value &&
    typeof (value as Aspect).planet1 === 'string' &&
    'planet2' in value &&
    typeof (value as Aspect).planet2 === 'string'
  );
}

function forEachAspect(chartData: ChartData, cb: (aspect: Aspect) => void): void {
  const aspects = chartData.aspects;
  if (Array.isArray(aspects)) {
    for (const aspect of aspects) {
      if (isAspect(aspect)) {
        cb(aspect);
      }
    }
  }
}

export interface ChartPattern {
  id: string;
  name: string;
  type: 'stellium' | 'grand-trine' | 'grand-cross' | 't-square' | 'yod' | 'kite' | 'mystic-rectangle';
  planets: string[];
  houses?: number[];
  signs?: string[];
  strength: number; // 0-100
  interpretation: string;
  keywords: string[];
}

export interface ChartAnalysis {
  chartId: string;
  dominantElement: Element;
  dominantQuality: Quality;
  dominantPlanet: string;
  chartShape: ChartShape;
  patterns: ChartPattern[];
  strengths: string[];
  challenges: string[];
  lifeThemes: string[];
  currentTransitHighlights: string[];
  upcomingEvents: UpcomingEvent[];
  energyLevel: number; // 0-100
  emotionalClimate: string;
  recommendations: string[];
  lastAnalyzed: Date;
}

export interface UpcomingEvent {
  date: Date;
  type: 'transit' | 'progression' | 'return';
  description: string;
  significance: 'low' | 'medium' | 'high' | 'critical';
  affectedAreas: string[];
  advice: string;
}

export interface PersonalityInsight {
  trait: string;
  strength: number; // 0-100
  source: string; // Which planets/aspects contribute
  description: string;
  development: string; // How to develop this trait
}

export enum ChartShape {
  Undefined = 'undefined',
  Bundle = 'Bundle',
  Bowl = 'Bowl',
  Locomotive = 'Locomotive',
  Splash = 'Splash'
}

export enum Element {
  Fire = 'Fire',
  Earth = 'Earth',
  Air = 'Air',
  Water = 'Water',
  Unknown = 'Unknown'
}

export enum Quality {
  Cardinal = 'Cardinal',
  Fixed = 'Fixed',
  Mutable = 'Mutable',
  Unknown = 'Unknown'
}

class ChartAnalyticsService {
  private analysisCache: Map<string, ChartAnalysis> = new Map();
  private patternRecognizers: Map<string, (chart: ChartData) => ChartPattern[]> = new Map();

  constructor() {
    this.initializePatternRecognizers();
  }

  /**
   * Perform comprehensive chart analysis
   */
  analyzeChart(chartId: string, chartData: ChartData, transitData?: Record<string, Planet>): ChartAnalysis {
    const analysis: ChartAnalysis = {
      chartId,
      dominantElement: this.calculateDominantElement(chartData),
      dominantQuality: this.calculateDominantQuality(chartData),
      dominantPlanet: this.calculateDominantPlanet(chartData),
      chartShape: this.determineChartShape(chartData),
      patterns: this.detectPatterns(chartData),
      strengths: this.identifyStrengths(chartData),
      challenges: this.identifyChallenges(chartData),
      lifeThemes: this.extractLifeThemes(chartData),
      currentTransitHighlights: transitData !== undefined ? this.analyzeCurrentTransits(chartData, transitData) : [],
      upcomingEvents: [], // Would be populated with ephemeris calculations
      energyLevel: this.calculateEnergyLevel(chartData, transitData),
      emotionalClimate: this.assessEmotionalClimate(chartData, transitData),
      recommendations: this.generateRecommendations(chartData, transitData),
      lastAnalyzed: new Date()
    };

    this.analysisCache.set(chartId, analysis);
    return analysis;
  }

  /**
   * Get personality insights from chart
   */
  getPersonalityInsights(chartData: ChartData): PersonalityInsight[] {
    const insights: PersonalityInsight[] = [];

    // Sun sign insights
    const sunPosition = chartData.planets.sun?.position ?? 0;
    const sunSign = this.getSignFromPosition(sunPosition);
    insights.push({
      trait: `${sunSign} Core Identity`,
      strength: 85,
      source: 'Sun',
      description: this.getSunSignDescription(sunSign),
      development: this.getSunSignDevelopment(sunSign)
    });

    // Moon sign insights
    const moonPosition = chartData.planets.moon?.position ?? 0;
    const moonSign = this.getSignFromPosition(moonPosition);
    insights.push({
      trait: `${moonSign} Emotional Nature`,
      strength: 80,
      source: 'Moon',
      description: this.getMoonSignDescription(moonSign),
      development: this.getMoonSignDevelopment(moonSign)
    });

    // Rising sign insights
    const ascendant = chartData.angles?.ascendant ?? 0;
    const risingSign = this.getSignFromPosition(ascendant);
    insights.push({
      trait: `${risingSign} Outer Persona`,
      strength: 75,
      source: 'Ascendant',
      description: this.getRisingSignDescription(risingSign),
      development: this.getRisingSignDevelopment(risingSign)
    });

    // Add more insights based on planetary placements and aspects
    insights.push(...this.analyzePlanetaryInsights(chartData));

    return insights.sort((a, b) => b.strength - a.strength);
  }

  /**
   * Calculate dominant element (Fire, Earth, Air, Water)
   */
  private calculateDominantElement(chartData: ChartData): Element {
    const elementCounts: Record<Element, number> = {
      [Element.Fire]: 0,
      [Element.Earth]: 0,
      [Element.Air]: 0,
      [Element.Water]: 0,
      [Element.Unknown]: 0
    };
    
    Object.values(chartData.planets).forEach(planet => {
      const sign = this.getSignFromPosition(planet.position);
      const element = this.getElementFromSign(sign);
      elementCounts[element]++;
    });

    // Filter out unknown elements and find the most frequent
    const validElements = Object.entries(elementCounts).filter(([key]) => {
      const elementKey = key as Element;
      return elementKey !== Element.Unknown;
    });
    
    if (validElements.length === 0) {
      return Element.Unknown;
    }
    
    return validElements.reduce((a, b) => {
      const aKey = a[0] as Element;
      const bKey = b[0] as Element;
      return elementCounts[aKey] > elementCounts[bKey] ? a : b;
    })[0] as Element;
  }

  /**
   * Calculate dominant quality (Cardinal, Fixed, Mutable)
   */
  private calculateDominantQuality(chartData: ChartData): Quality {
    const qualityCounts: Record<Quality, number> = {
      [Quality.Cardinal]: 0,
      [Quality.Fixed]: 0,
      [Quality.Mutable]: 0,
      [Quality.Unknown]: 0
    };
    
    Object.values(chartData.planets).forEach(planet => {
      const sign = this.getSignFromPosition(planet.position);
      const quality = this.getQualityFromSign(sign);
      qualityCounts[quality]++;
    });

    // Filter out unknown qualities and find the most frequent
    const validQualities = Object.entries(qualityCounts).filter(([key]) => {
      const qualityKey = key as Quality;
      return qualityKey !== Quality.Unknown;
    });
    
    if (validQualities.length === 0) {
      return Quality.Unknown;
    }
    
    return validQualities.reduce((a, b) => {
      const aKey = a[0] as Quality;
      const bKey = b[0] as Quality;
      return qualityCounts[aKey] > qualityCounts[bKey] ? a : b;
    })[0] as Quality;
  }

  /**
   * Determine the most prominent planet
   */
  private calculateDominantPlanet(chartData: ChartData): string {
    const planetScores: Record<string, number> = {};

    // Score planets based on various factors
  getPlanetEntries(chartData).forEach(([name, planet]) => {
      let score = 0;

      // Angular houses get higher scores
      const houseNumber = planet.house;
      if (typeof houseNumber === 'number' && Number.isFinite(houseNumber) && [1, 4, 7, 10].includes(houseNumber)) {
        score += 3;
      }

      // Exact aspects add to score
      forEachAspect(chartData, (aspect) => {
        // Only natal aspects considered here (transit aspects would be supplied separately)
        const p1 = aspect.planet1;
        const p2 = aspect.planet2;
        const orb = aspect.orb;
        if ((p1 === name || p2 === name) && typeof orb === 'number' && Number.isFinite(orb)) {
          if (orb < 1) score += 2;
          else if (orb < 3) score += 1;
        }
      });

      // Personal planets get base scores
      const personalPlanets = ['sun', 'moon', 'mercury', 'venus', 'mars'];
      if (personalPlanets.includes(name)) {
        score += 2;
      }

      planetScores[name] = score;
    });

    return Object.entries(planetScores).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  }

  /**
   * Determine overall chart shape/pattern
   */
  private determineChartShape(chartData: ChartData): ChartShape {
  const planetPositions = getPlanetEntries(chartData)
    .map(([, p]) => p.position)
    .filter((pos): pos is number => typeof pos === 'number' && Number.isFinite(pos))
    .sort((a, b) => a - b);
    
    if (planetPositions.length <= 1) {
      return ChartShape.Undefined;
    }

    const spans = planetPositions.map((pos, i) => {
      const nextPos = planetPositions[i + 1] ?? (planetPositions[0] + 360);
      return nextPos - pos;
    });

    const maxSpan = Math.max(...spans);
    const totalSpan = planetPositions[planetPositions.length - 1] - planetPositions[0];

    if (maxSpan > 120) return ChartShape.Bundle;
    if (totalSpan <= 120) return ChartShape.Bundle;
    if (totalSpan <= 240) return ChartShape.Bowl;
    if (maxSpan > 60) return ChartShape.Locomotive;
    return ChartShape.Splash;
  }

  /**
   * Initialize pattern recognition algorithms
   */
  private initializePatternRecognizers(): void {
    this.patternRecognizers.set('stellium', this.detectStelliums.bind(this));
    this.patternRecognizers.set('grand-trine', this.detectGrandTrines.bind(this));
    this.patternRecognizers.set('t-square', this.detectTSquares.bind(this));
    this.patternRecognizers.set('grand-cross', this.detectGrandCrosses.bind(this));
    this.patternRecognizers.set('yod', this.detectYods.bind(this));
  }

  /**
   * Detect all patterns in a chart
   */
  private detectPatterns(chartData: ChartData): ChartPattern[] {
    const patterns: ChartPattern[] = [];

    this.patternRecognizers.forEach((recognizer) => {
      try {
        const detectedPatterns = recognizer(chartData);
        patterns.push(...detectedPatterns);
      } catch {
        // TODO: Replace with structured logging
      }
    });

    return patterns.sort((a, b) => b.strength - a.strength);
  }

  /**
   * Detect stelliums (3+ planets in same sign/house)
   */
  private detectStelliums(chartData: ChartData): ChartPattern[] {
    const patterns: ChartPattern[] = [];
    const signGroups: Record<string, string[]> = {};
    const houseGroups: Record<number, string[]> = {};

    // Group planets by sign and house
  getPlanetEntries(chartData).forEach(([name, planet]) => {
      const sign = this.getSignFromPosition(planet.position);
      signGroups[sign] ??= [];
      signGroups[sign].push(name);

      if (planet.house !== null && planet.house !== undefined) {
        houseGroups[planet.house] ??= [];
        houseGroups[planet.house].push(name);
      }
    });

    // Check for sign stelliums
    Object.entries(signGroups).forEach(([sign, planets]) => {
      if (planets.length >= 3) {
        patterns.push({
          id: `stellium-${sign}`,
          name: `${sign} Stellium`,
          type: 'stellium',
          planets,
          signs: [sign],
          strength: Math.min(100, planets.length * 20),
          interpretation: `Strong emphasis on ${sign} energy and characteristics`,
          keywords: [`${sign} focus`, 'concentrated energy', 'specialization']
        });
      }
    });

    // Check for house stelliums
    Object.entries(houseGroups).forEach(([house, planets]) => {
      if (planets.length >= 3) {
        patterns.push({
          id: `stellium-house-${house}`,
          name: `House ${house} Stellium`,
          type: 'stellium',
          planets,
          houses: [parseInt(house)],
          strength: Math.min(100, planets.length * 20),
          interpretation: `Major life focus in House ${house} themes`,
          keywords: [`House ${house} emphasis`, 'life theme concentration']
        });
      }
    });

    return patterns;
  }

  /**
   * Detect grand trines
   */
  private detectGrandTrines(chartData: ChartData): ChartPattern[] {
    const patterns: ChartPattern[] = [];
  const planets = getPlanetEntries(chartData);

    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        for (let k = j + 1; k < planets.length; k++) {
          const [name1, planet1] = planets[i];
          const [name2, planet2] = planets[j];
          const [name3, planet3] = planets[k];

          // Ensure all positions are valid numbers
          // Validate planet positions
          if (!this.isValidPosition(planet1.position) || 
              !this.isValidPosition(planet2.position) || 
              !this.isValidPosition(planet3.position)) {
            continue;
          }

          const pos1 = planet1.position;
          const pos2 = planet2.position;
          const pos3 = planet3.position;

          if (this.isGrandTrine(pos1, pos2, pos3)) {
            const element = this.getElementFromPosition(pos1);
            patterns.push({
              id: `grand-trine-${name1}-${name2}-${name3}`,
              name: `${element} Grand Trine`,
              type: 'grand-trine',
              planets: [name1, name2, name3],
              strength: 85,
              interpretation: `Natural talent and easy flow of ${element} energy`,
              keywords: [`${element} harmony`, 'natural gifts', 'easy flow']
            });
          }
        }
      }
    }

    return patterns;
  }

  /**
   * Detect T-Squares
   */
  private detectTSquares(chartData: ChartData): ChartPattern[] {
    const patterns: ChartPattern[] = [];
  const planets = getPlanetEntries(chartData);

    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        for (let k = j + 1; k < planets.length; k++) {
          const [name1, planet1] = planets[i];
          const [name2, planet2] = planets[j];
          const [name3, planet3] = planets[k];

          if (this.isTSquare(planet1.position, planet2.position, planet3.position)) {
            patterns.push({
              id: `t-square-${name1}-${name2}-${name3}`,
              name: 'T-Square',
              type: 't-square',
              planets: [name1, name2, name3],
              strength: 80,
              interpretation: 'Dynamic tension that creates motivation and drive',
              keywords: ['tension', 'motivation', 'achievement drive', 'challenge']
            });
          }
        }
      }
    }

    return patterns;
  }

  /**
   * Detect Grand Crosses
   */
  private detectGrandCrosses(chartData: ChartData): ChartPattern[] {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _chartData = chartData;
    // Implementation for grand cross detection
    return [];
  }

  /**
   * Detect Yods (Finger of God)
   */
  private detectYods(chartData: ChartData): ChartPattern[] {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _chartData = chartData;
    // Implementation for yod detection
    return [];
  }

  /**
   * Helper method to check if three planets form a grand trine
   */
  private isGrandTrine(pos1: number, pos2: number, pos3: number, orb = 8): boolean {
    const angles = [
      this.normalizeAngle(Math.abs(pos1 - pos2)),
      this.normalizeAngle(Math.abs(pos2 - pos3)),
      this.normalizeAngle(Math.abs(pos3 - pos1))
    ];

    return angles.every(angle => Math.abs(angle - 120) <= orb || Math.abs(angle - 240) <= orb);
  }

  /**
   * Helper method to check if three planets form a T-square
   */
  private isTSquare(pos1: number, pos2: number, pos3: number, orb = 8): boolean {
    const angles = [
      this.normalizeAngle(Math.abs(pos1 - pos2)),
      this.normalizeAngle(Math.abs(pos2 - pos3)),
      this.normalizeAngle(Math.abs(pos3 - pos1))
    ];

    const hasOpposition = angles.some(angle => Math.abs(angle - 180) <= orb);
    const hasSquares = angles.filter(angle => Math.abs(angle - 90) <= orb).length >= 2;

    return hasOpposition && hasSquares;
  }

  /**
   * Normalize angle to 0-180 range
   */
  private normalizeAngle(angle: number): number {
    angle = angle % 360;
    return angle > 180 ? 360 - angle : angle;
  }

  /**
   * Check if a position value is valid
   */
  private isValidPosition(position: unknown): position is number {
    return typeof position === 'number' && Number.isFinite(position);
  }

  /**
   * Get zodiac sign from position
   */
  private getSignFromPosition(position: number): string {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                   'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    return signs[Math.floor(position / 30)];
  }

  /**
   * Get element from sign
   */
  private getElementFromSign(sign: string): Element {
    const elements: Record<string, Element> = {
      Aries: Element.Fire, Taurus: Element.Earth, Gemini: Element.Air, Cancer: Element.Water,
      Leo: Element.Fire, Virgo: Element.Earth, Libra: Element.Air, Scorpio: Element.Water,
      Sagittarius: Element.Fire, Capricorn: Element.Earth, Aquarius: Element.Air, Pisces: Element.Water
    };
    return elements[sign] ?? Element.Unknown;
  }

  /**
   * Get element from position
   */
  private getElementFromPosition(position: number): string {
    const sign = this.getSignFromPosition(position);
    return this.getElementFromSign(sign);
  }

  /**
   * Get quality from sign
   */
  private getQualityFromSign(sign: string): Quality {
    const qualities: Record<string, Quality> = {
      Aries: Quality.Cardinal, Taurus: Quality.Fixed, Gemini: Quality.Mutable, Cancer: Quality.Cardinal,
      Leo: Quality.Fixed, Virgo: Quality.Mutable, Libra: Quality.Cardinal, Scorpio: Quality.Fixed,
      Sagittarius: Quality.Mutable, Capricorn: Quality.Cardinal, Aquarius: Quality.Fixed, Pisces: Quality.Mutable
    };
    return qualities[sign] ?? Quality.Unknown;
  }

  // Additional methods for analysis (implementations would be expanded)
  private identifyStrengths(chartData: ChartData): string[] {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _chartData = chartData;
    return ['Leadership abilities', 'Creative expression', 'Emotional intelligence'];
  }

  private identifyChallenges(chartData: ChartData): string[] {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _chartData = chartData;
    return ['Impatience with details', 'Tendency to overthink', 'Need for more self-confidence'];
  }

  private extractLifeThemes(chartData: ChartData): string[] {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _chartData = chartData;
    return ['Personal transformation', 'Creative self-expression', 'Service to others'];
  }

  private analyzeCurrentTransits(natalChart: ChartData, transits: Record<string, Planet>): string[] {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _natalChart = natalChart;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _transits = transits;
    return ['Jupiter enhancing optimism', 'Saturn encouraging discipline', 'Mercury improving communication'];
  }

  private calculateEnergyLevel(chartData: ChartData, transitData?: Record<string, Planet>): number {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _chartData = chartData;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _transitData = transitData;
    return 75; // Placeholder - would calculate based on current planetary energies
  }

  private assessEmotionalClimate(chartData: ChartData, transitData?: Record<string, Planet>): string {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _chartData = chartData;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _transitData = transitData;
    return 'Optimistic with creative potential';
  }

  private generateRecommendations(chartData: ChartData, transitData?: Record<string, Planet>): string[] {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _chartData = chartData;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _transitData = transitData;
    return [
      'Focus on creative projects this month',
      'Practice patience in communications',
      'Take time for self-reflection and meditation'
    ];
  }

  private analyzePlanetaryInsights(chartData: ChartData): PersonalityInsight[] {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _chartData = chartData;
    // Placeholder - would analyze each planet's placement and aspects
    return [];
  }

  private getSunSignDescription(sign: string): string {
    const descriptions: Record<string, string> = {
      Aries: 'Bold, pioneering, and naturally inclined to lead',
      Taurus: 'Stable, practical, and appreciates beauty and comfort',
      // Add all signs...
    };
    return descriptions[sign] ?? 'Unique cosmic signature';
  }

  private getSunSignDevelopment(sign: string): string {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _sign = sign;
    return 'Focus on authentic self-expression and leadership development';
  }

  private getMoonSignDescription(sign: string): string {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _sign = sign;
    return 'Your emotional nature and inner world tendencies';
  }

  private getMoonSignDevelopment(sign: string): string {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _sign = sign;
    return 'Develop emotional intelligence and intuitive abilities';
  }

  private getRisingSignDescription(sign: string): string {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _sign = sign;
    return 'Your natural approach to life and first impressions';
  }

  private getRisingSignDevelopment(sign: string): string {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _sign = sign;
    return 'Cultivate your natural presentation and social skills';
  }

  /**
   * Get cached analysis
   */
  getCachedAnalysis(chartId: string): ChartAnalysis | undefined {
    return this.analysisCache.get(chartId);
  }

  /**
   * Clear analysis cache
   */
  clearCache(): void {
    this.analysisCache.clear();
  }
}

// Singleton instance
let chartAnalyticsService: ChartAnalyticsService | null = null;

export const getChartAnalyticsService = (): ChartAnalyticsService => {
  chartAnalyticsService ??= new ChartAnalyticsService();
  return chartAnalyticsService;
};

export default ChartAnalyticsService;
