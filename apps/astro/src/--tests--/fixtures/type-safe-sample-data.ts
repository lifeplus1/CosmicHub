/**
 * Type-safe sample data that follows the Type Bridge System
 * Uses proper lowercase planet names, numeric houses, and boolean applying values
 */

import { Planet, House, Aspect, AstrologyChart } from '@cosmichub/types';

export const samplePlanetData: Record<string, Planet> = {
  sun: {
    name: 'sun',
    position: 150.0,
    degree: 150.0,
    sign: 'leo',
    house: 5,
    retrograde: false,
    speed: 1.0,
  },
  moon: {
    name: 'moon',
    position: 120.0,
    degree: 120.0,
    sign: 'cancer',
    house: 4,
    retrograde: false,
    speed: 12.0,
  },
  mercury: {
    name: 'mercury',
    position: 140.0,
    degree: 140.0,
    sign: 'leo',
    house: 5,
    retrograde: false,
    speed: 1.2,
  },
};

export const sampleHouseData: House[] = [
  {
    number: 1,
    cusp: 0,
    sign: 'aries',
    ruler: 'mars',
    degree: 0,
    size: 30,
  },
  {
    number: 2,
    cusp: 30,
    sign: 'taurus',
    ruler: 'venus',
    degree: 30,
    size: 30,
  },
  {
    number: 3,
    cusp: 60,
    sign: 'gemini',
    ruler: 'mercury',
    degree: 60,
    size: 30,
  },
];

export const sampleAspectData: Aspect[] = [
  {
    aspect_type: 'trine',
    planet1: 'sun',
    planet2: 'moon',
    orb: 2.1,
    applying: true,
    exact: false,
    power: 0.8,
    aspect_angle: 120,
  },
  {
    aspect_type: 'conjunction',
    planet1: 'sun',
    planet2: 'mercury',
    orb: 5.0,
    applying: false,
    exact: true,
    power: 1.0,
    aspect_angle: 0,
  },
];

export const sampleChartAngles = {
  ascendant: 0,
  midheaven: 90,
  descendant: 180,
  imumcoeli: 270,
  vertex: 45,
  part_of_fortune: 30,
};

export const typeSafeChartData: AstrologyChart = {
  planets: {
    sun: {
      name: 'sun',
      position: 150.0,
      degree: 150.0,
      sign: 'leo',
      house: 5,
      retrograde: false,
      speed: 1.0,
      dignity: 'domicile',
      essential_dignity: 0.8,
    },
    moon: {
      name: 'moon',
      position: 120.0,
      degree: 120.0,
      sign: 'cancer',
      house: 4,
      retrograde: false,
      speed: 12.0,
      dignity: 'domicile',
      essential_dignity: 0.9,
    },
    mercury: {
      name: 'mercury',
      position: 140.0,
      degree: 140.0,
      sign: 'leo',
      house: 5,
      retrograde: false,
      speed: 1.2,
    },
  },
  houses: sampleHouseData.map(house => ({
    number: house.number,
    cusp: house.cusp,
    sign: house.sign,
    ruler: house.ruler ?? 'mars',
    degree: house.degree ?? house.cusp,
    size: house.size ?? 30,
    contains_planets: house.contains_planets ?? [],
  })),
  aspects: sampleAspectData.map(aspect => ({
    aspect_type: aspect.aspect_type,
    planet1: aspect.planet1,
    planet2: aspect.planet2,
    orb: aspect.orb,
    applying: aspect.applying,
    exact: aspect.exact ?? false,
    power: aspect.power ?? 0.5,
    aspect_angle: aspect.aspect_angle ?? 0,
    separating: aspect.separating,
    mutual_reception: aspect.mutual_reception,
    dignity_interaction: aspect.dignity_interaction,
    timing: aspect.timing,
  })),
  angles: sampleChartAngles,
  latitude: 40.7128,
  longitude: -74.0060,
  timezone: 'America/New_York',
  julian_day: 2447893.0,
  house_system: 'placidus',
  sidereal: {
    ayanamsa: 'lahiri',
    offset: 0,
  },
  chart_metadata: {
    calculation_timestamp: new Date().toISOString(),
    ephemeris_source: 'swiss',
    coordinate_system: 'tropical',
  },
};
