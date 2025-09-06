// Test file to verify type consolidation
import { describe, it, expect } from 'vitest';
import type { 
  PlanetData, 
  ChartData, 
  ChartType,
  Planet, 
  House, 
  Aspect 
} from '../index';

describe('Type Consolidation', () => {
  it('should create valid PlanetData objects', () => {
    const testPlanetData: PlanetData = {
      name: 'sun',
      sign: 'aries',
      house: 1, // number
      degree: 15.5,
      aspects: [{ type: 'trine', target: 'moon', orb: 3.2 }]
    };

    expect(testPlanetData.name).toBe('sun');
    expect(testPlanetData.degree).toBe(15.5);
    expect(testPlanetData.aspects).toHaveLength(1);
  });

  it('should create valid Planet objects', () => {
    const testPlanet: Planet = {
      name: 'moon',
      sign: 'cancer', 
      degree: 10.3,
      position: 100.3,
      house: '4', // string
      retrograde: false
    };

    expect(testPlanet.name).toBe('moon');
    expect(testPlanet.house).toBe('4');
    expect(testPlanet.retrograde).toBe(false);
  });

  it('should create valid ChartData objects', () => {
    const testChartData: ChartData = {
      planets: [],
      asteroids: [],
      angles: [],
      houses: [],
      aspects: []
    };

    expect(Array.isArray(testChartData.planets)).toBe(true);
    expect(Array.isArray(testChartData.houses)).toBe(true);
  });

  it('should validate ChartType values', () => {
    const testChartType: ChartType = 'natal';
    expect(['natal', 'composite', 'synastry', 'transit']).toContain(testChartType);
  });

  it('should create valid House objects', () => {
    const testHouse: House = {
      house: 1,
      number: 1,
      sign: 'aries',
      degree: 0,
      cusp: 0,
      ruler: 'mars'
    };

    expect(testHouse.number).toBe(1);
    expect(testHouse.sign).toBe('aries');
  });

  it('should create valid Aspect objects', () => {
    const testAspect: Aspect = {
      planet1: 'sun',
      planet2: 'moon', 
      type: 'trine',
      orb: 3.2,
      applying: 'separating'
    };

    expect(testAspect.type).toBe('trine');
    expect(testAspect.orb).toBe(3.2);
  });
});
