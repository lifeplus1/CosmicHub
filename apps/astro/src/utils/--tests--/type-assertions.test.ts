import { describe, it, expect } from 'vitest';
import {
  isPlanetLike,
  isAspectLike,
  isHouseLike,
  assertPlanetType,
  assertAspectType,
  assertHouseType
} from '../type-assertions';

describe('type-assertions', () => {
  describe('type guards', () => {
    describe('isPlanetLike', () => {
      it('returns true for object-like values', () => {
        expect(isPlanetLike({})).toBe(true);
        expect(isPlanetLike({ name: 'sun' })).toBe(true);
        expect(isPlanetLike({ position: 0 })).toBe(true);
      });

      it('returns false for non-object values', () => {
        expect(isPlanetLike(null)).toBe(false);
        expect(isPlanetLike(undefined)).toBe(false);
        expect(isPlanetLike('')).toBe(false);
        expect(isPlanetLike(123)).toBe(false);
        expect(isPlanetLike([])).toBe(false);
      });
    });

    describe('isAspectLike', () => {
      it('returns true for object-like values', () => {
        expect(isAspectLike({})).toBe(true);
        expect(isAspectLike({ aspect_type: 'conjunction' })).toBe(true);
      });

      it('returns false for non-object values', () => {
        expect(isAspectLike(null)).toBe(false);
        expect(isAspectLike([])).toBe(false);
        expect(isAspectLike('string')).toBe(false);
      });
    });

    describe('isHouseLike', () => {
      it('returns true for object-like values', () => {
        expect(isHouseLike({})).toBe(true);
        expect(isHouseLike({ house: 1 })).toBe(true);
      });

      it('returns false for non-object values', () => {
        expect(isHouseLike(null)).toBe(false);
        expect(isHouseLike([])).toBe(false);
        expect(isHouseLike('string')).toBe(false);
      });
    });
  });

  describe('assertPlanetType', () => {
    it('converts valid planet data', () => {
      const input = {
        name: 'mars',
        position: 15.5,
        degree: 15.5,
        sign: 'leo',
        house: 5,
        retrograde: true,
        speed: 0.5,
        dignity: 'domicile',
        element: 'fire',
        modality: 'fixed'
      };

      const result = assertPlanetType(input);

      expect(result).toEqual({
        name: 'mars',
        position: 15.5,
        degree: 15.5,
        sign: 'leo',
        house: 5,
        retrograde: true,
        speed: 0.5,
        dignity: 'domicile',
        essential_dignity: undefined,
        aspects: [],
        element: 'fire',
        modality: 'fixed',
        house_position: undefined
      });
    });

    it('provides defaults for missing required fields', () => {
      const result = assertPlanetType({});

      expect(result.name).toBe('sun');
      expect(result.position).toBe(0);
      expect(result.sign).toBe('aries');
      expect(result.house).toBe(1);
      expect(result.retrograde).toBe(false);
      expect(result.aspects).toEqual([]);
    });

    it('normalizes planet names to lowercase', () => {
      const result = assertPlanetType({ name: 'VENUS' });
      expect(result.name).toBe('venus');
    });

    it('falls back to default for invalid planet names', () => {
      const result = assertPlanetType({ name: 'invalid_planet' });
      expect(result.name).toBe('sun');
    });

    it('normalizes zodiac signs to lowercase', () => {
      const result = assertPlanetType({ sign: 'SCORPIO' });
      expect(result.sign).toBe('scorpio');
    });

    it('falls back to default for invalid zodiac signs', () => {
      const result = assertPlanetType({ sign: 'invalid_sign' });
      expect(result.sign).toBe('aries');
    });

    it('converts string house numbers to integers', () => {
      const result = assertPlanetType({ house: '7' });
      expect(result.house).toBe(7);
    });

    it('falls back to 1 for invalid house numbers', () => {
      const result = assertPlanetType({ house: 'invalid' });
      expect(result.house).toBe(1);
    });

    it('handles degree fallback to position', () => {
      const result = assertPlanetType({ position: 25.5 });
      expect(result.degree).toBe(25.5);
    });

    it('validates and filters valid dignities', () => {
      expect(assertPlanetType({ dignity: 'exaltation' }).dignity).toBe('exaltation');
      expect(assertPlanetType({ dignity: 'invalid' }).dignity).toBeUndefined();
    });

    it('validates and filters valid elements', () => {
      expect(assertPlanetType({ element: 'water' }).element).toBe('water');
      expect(assertPlanetType({ element: 'invalid' }).element).toBeUndefined();
    });

    it('validates and filters valid modalities', () => {
      expect(assertPlanetType({ modality: 'cardinal' }).modality).toBe('cardinal');
      expect(assertPlanetType({ modality: 'invalid' }).modality).toBeUndefined();
    });

    it('validates and filters valid house positions', () => {
      expect(assertPlanetType({ house_position: 'middle' }).house_position).toBe('middle');
      expect(assertPlanetType({ house_position: 'invalid' }).house_position).toBeUndefined();
    });

    it('preserves valid aspects array', () => {
      const aspects = [{ aspect_type: 'trine', planet1: 'sun', planet2: 'mars' }];
      const result = assertPlanetType({ aspects });
      expect(result.aspects).toBe(aspects);
    });

    it('defaults to empty array for non-array aspects', () => {
      const result = assertPlanetType({ aspects: 'invalid' });
      expect(result.aspects).toEqual([]);
    });

    it('throws error for non-object inputs', () => {
      expect(() => assertPlanetType(null)).toThrow('Invalid planet data: expected object, got object');
      expect(() => assertPlanetType('string')).toThrow('Invalid planet data: expected object, got string');
      expect(() => assertPlanetType(123)).toThrow('Invalid planet data: expected object, got number');
    });
  });

  describe('assertAspectType', () => {
    it('converts valid aspect data', () => {
      const input = {
        aspect_type: 'trine',
        planet1: 'sun',
        planet2: 'mars',
        orb: 2.5,
        applying: true,
        exact: false,
        power: 0.8,
        aspect_angle: 120,
        separating: false,
        mutual_reception: true,
        dignity_interaction: 'enhancement'
      };

      const result = assertAspectType(input);

      expect(result).toEqual({
        aspect_type: 'trine',
        planet1: 'sun',
        planet2: 'mars',
        orb: 2.5,
        applying: true,
        exact: false,
        power: 0.8,
        aspect_angle: 120,
        separating: false,
        mutual_reception: true,
        dignity_interaction: 'enhancement',
        timing: undefined
      });
    });

    it('provides defaults for missing fields', () => {
      const result = assertAspectType({});

      expect(result.aspect_type).toBe('conjunction');
      expect(result.planet1).toBe('sun');
      expect(result.planet2).toBe('moon');
      expect(result.orb).toBe(0);
      expect(result.applying).toBe(false);
      expect(result.exact).toBe(false);
      expect(result.power).toBe(0.5);
    });

    it('falls back to type field if aspect_type is missing', () => {
      const result = assertAspectType({ type: 'square' });
      expect(result.aspect_type).toBe('square');
    });

    it('falls back to point fields if planet fields are missing', () => {
      const result = assertAspectType({ 
        point1: 'mercury', 
        point2: 'venus' 
      });
      expect(result.planet1).toBe('mercury');
      expect(result.planet2).toBe('venus');
    });

    it('normalizes aspect types to lowercase', () => {
      const result = assertAspectType({ aspect_type: 'OPPOSITION' });
      expect(result.aspect_type).toBe('opposition');
    });

    it('falls back to default for invalid aspect types', () => {
      const result = assertAspectType({ aspect_type: 'invalid_aspect' });
      expect(result.aspect_type).toBe('conjunction');
    });

    it('normalizes planet names to lowercase', () => {
      const result = assertAspectType({ 
        planet1: 'JUPITER', 
        planet2: 'SATURN' 
      });
      expect(result.planet1).toBe('jupiter');
      expect(result.planet2).toBe('saturn');
    });

    it('falls back to defaults for invalid planet names', () => {
      const result = assertAspectType({ 
        planet1: 'invalid_planet', 
        planet2: 'another_invalid' 
      });
      expect(result.planet1).toBe('sun');
      expect(result.planet2).toBe('moon');
    });

    it('handles string applying values', () => {
      expect(assertAspectType({ applying: 'applying' }).applying).toBe(true);
      expect(assertAspectType({ applying: 'true' }).applying).toBe(true);
      expect(assertAspectType({ applying: 'separating' }).applying).toBe(false);
      expect(assertAspectType({ applying: 'false' }).applying).toBe(false);
    });

    it('validates dignity interaction', () => {
      expect(assertAspectType({ dignity_interaction: 'conflict' }).dignity_interaction).toBe('conflict');
      expect(assertAspectType({ dignity_interaction: 'neutral' }).dignity_interaction).toBe('neutral');
      expect(assertAspectType({ dignity_interaction: 'invalid' }).dignity_interaction).toBeUndefined();
    });

    it('preserves timing object', () => {
      const timing = { exact_date: '2024-01-01', duration: '3 days' };
      const result = assertAspectType({ timing });
      expect(result.timing).toBe(timing);
    });

    it('throws error for non-object inputs', () => {
      expect(() => assertAspectType(null)).toThrow('Invalid aspect data: expected object, got object');
      expect(() => assertAspectType('string')).toThrow('Invalid aspect data: expected object, got string');
    });
  });

  describe('assertHouseType', () => {
    it('converts valid house data', () => {
      const input = {
        house: 3,
        cusp: 45.5,
        degree: 45.5,
        sign: 'gemini',
        ruler: 'mercury',
        modern_ruler: 'mercury',
        size: 35,
        contains_planets: ['mercury', 'venus']
      };

      const result = assertHouseType(input);

      expect(result).toEqual({
        number: 3,
        cusp: 45.5,
        sign: 'gemini',
        ruler: 'mercury',
        modern_ruler: 'mercury',
        degree: 45.5,
        size: 35,
        contains_planets: ['mercury', 'venus']
      });
    });

    it('provides defaults for missing fields', () => {
      const result = assertHouseType({});

      expect(result.number).toBe(1);
      expect(result.cusp).toBe(0);
      expect(result.sign).toBe('aries');
      expect(result.degree).toBe(0);
      expect(result.size).toBe(30);
      expect(result.contains_planets).toEqual([]);
    });

    it('uses number field if house field is missing', () => {
      const result = assertHouseType({ number: 7 });
      expect(result.number).toBe(7);
    });

    it('converts string house numbers to integers', () => {
      const result = assertHouseType({ house: '9' });
      expect(result.number).toBe(9);
    });

    it('clamps house numbers to valid range (1-12)', () => {
      expect(assertHouseType({ house: 0 }).number).toBe(1);
      expect(assertHouseType({ house: 15 }).number).toBe(12);
      expect(assertHouseType({ house: -5 }).number).toBe(1);
    });

    it('falls back to degree if cusp is missing', () => {
      const result = assertHouseType({ degree: 22.5 });
      expect(result.cusp).toBe(22.5);
    });

    it('falls back to cusp if degree is missing', () => {
      const result = assertHouseType({ cusp: 30.5 });
      expect(result.degree).toBe(30.5);
    });

    it('normalizes zodiac signs to lowercase', () => {
      const result = assertHouseType({ sign: 'CAPRICORN' });
      expect(result.sign).toBe('capricorn');
    });

    it('falls back to default for invalid zodiac signs', () => {
      const result = assertHouseType({ sign: 'invalid_sign' });
      expect(result.sign).toBe('aries');
    });

    it('validates and normalizes ruler planet names', () => {
      expect(assertHouseType({ ruler: 'MARS' }).ruler).toBe('mars');
      expect(assertHouseType({ ruler: 'invalid_planet' }).ruler).toBeUndefined();
    });

    it('validates and normalizes modern ruler planet names', () => {
      expect(assertHouseType({ modern_ruler: 'URANUS' }).modern_ruler).toBe('uranus');
      expect(assertHouseType({ modern_ruler: 'invalid_planet' }).modern_ruler).toBeUndefined();
    });

    it('filters and validates planets in contains_planets array', () => {
      const input = {
        contains_planets: ['sun', 'MOON', 'invalid_planet', 'mars', 123, null]
      };
      const result = assertHouseType(input);
      expect(result.contains_planets).toEqual(['moon', 'mars']);
    });

    it('defaults to empty array for non-array contains_planets', () => {
      const result = assertHouseType({ contains_planets: 'invalid' });
      expect(result.contains_planets).toEqual([]);
    });

    it('throws error for non-object inputs', () => {
      expect(() => assertHouseType(null)).toThrow('Invalid house data: expected object, got object');
      expect(() => assertHouseType('string')).toThrow('Invalid house data: expected object, got string');
    });
  });

  describe('integration scenarios', () => {
    it('handles complex planet with all optional fields', () => {
      const input = {
        name: 'JUPITER',
        position: 135.75,
        sign: 'LEO',
        house: '8',
        retrograde: 'true', // string that should be converted to boolean
        speed: '0.25',
        dignity: 'exaltation',
        element: 'FIRE',
        modality: 'FIXED',
        house_position: 'LATE',
        aspects: [{ type: 'trine', planet1: 'sun' }]
      };

      const result = assertPlanetType(input);

      expect(result.name).toBe('jupiter');
      expect(result.sign).toBe('leo');
      expect(result.house).toBe(8);
      expect(result.retrograde).toBe(true);
      expect(result.dignity).toBe('exaltation');
      expect(result.element).toBe('fire');
      expect(result.modality).toBe('fixed');
      expect(result.house_position).toBe('late');
    });

    it('handles backend data with alternative field names', () => {
      const backendAspect = {
        type: 'SQUARE', // instead of aspect_type
        point1: 'SUN',  // instead of planet1
        point2: 'MARS', // instead of planet2
        applying: 'separating' // string instead of boolean
      };

      const result = assertAspectType(backendAspect);

      expect(result.aspect_type).toBe('square');
      expect(result.planet1).toBe('sun');
      expect(result.planet2).toBe('mars');
      expect(result.applying).toBe(false);
    });

    it('handles mixed case and alternative house field names', () => {
      const backendHouse = {
        number: '10',
        degree: '280.5', // instead of cusp
        sign: 'AQUARIUS',
        contains_planets: ['URANUS', 'invalid', 'SATURN']
      };

      const result = assertHouseType(backendHouse);

      expect(result.number).toBe(10);
      expect(result.cusp).toBe(280.5);
      expect(result.sign).toBe('aquarius');
      expect(result.contains_planets).toEqual(['saturn']); // uranus gets filtered out as invalid
    });
  });
});
