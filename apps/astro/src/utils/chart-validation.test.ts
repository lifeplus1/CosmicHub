/**
 * Tests for chart validation utilities
 */
import { describe, it, expect } from 'vitest';
import { 
  validateChart, 
  parseChartSafely,
  getDataTypeName,
  validateUserProfile,
  validateNumerologyData,
  validateAstrologyData
} from './chart-validation';
import type { AstrologyChart, UserProfile, NumerologyData } from '@cosmichub/types';

// Test fixtures
const validChart: AstrologyChart = {
  planets: [
    { name: 'Sun', sign: 'Leo', degree: 15.25, position: 135.25, house: '5', aspects: [] },
    { name: 'Moon', sign: 'Aries', degree: 2.5, position: 12.5, house: '1', aspects: [] }
  ],
  houses: [
    { house: 1, number: 1, sign: 'Aries', degree: 0, cusp: 0, ruler: 'Mars' },
    { house: 2, number: 2, sign: 'Taurus', degree: 30, cusp: 30, ruler: 'Venus' },
    { house: 3, number: 3, sign: 'Gemini', degree: 60, cusp: 60, ruler: 'Mercury' },
    { house: 4, number: 4, sign: 'Cancer', degree: 90, cusp: 90, ruler: 'Moon' },
    { house: 5, number: 5, sign: 'Leo', degree: 120, cusp: 120, ruler: 'Sun' },
    { house: 6, number: 6, sign: 'Virgo', degree: 150, cusp: 150, ruler: 'Mercury' },
    { house: 7, number: 7, sign: 'Libra', degree: 180, cusp: 180, ruler: 'Venus' },
    { house: 8, number: 8, sign: 'Scorpio', degree: 210, cusp: 210, ruler: 'Pluto' },
    { house: 9, number: 9, sign: 'Sagittarius', degree: 240, cusp: 240, ruler: 'Jupiter' },
    { house: 10, number: 10, sign: 'Capricorn', degree: 270, cusp: 270, ruler: 'Saturn' },
    { house: 11, number: 11, sign: 'Aquarius', degree: 300, cusp: 300, ruler: 'Uranus' },
    { house: 12, number: 12, sign: 'Pisces', degree: 330, cusp: 330, ruler: 'Neptune' }
  ],
  aspects: [
    { planet1: 'Sun', planet2: 'Moon', type: 'Trine', orb: 5.0, applying: 'true' }
  ],
  asteroids: [
    { name: 'Ceres', sign: 'Virgo', degree: 10.0, house: '6' }
  ],
  angles: [
    { name: 'Ascendant', sign: 'Aries', degree: 0, position: 0 }
  ]
};

const validUserProfile: UserProfile = {
  userId: 'user123',
  birthData: {
    date: '1990-01-01',
    time: '12:00',
    location: 'New York, NY'
  }
};

const validNumerologyData: NumerologyData = {
  lifePath: 7,
  destiny: 9,
  personalYear: 3
};

describe('Chart Validation Utilities', () => {
  describe('validateChart', () => {
    it('should return null for valid charts', () => {
      const result = validateChart(validChart);
      expect(result).toBeNull();
    });
    
    it('should return errors for invalid charts', () => {
      const invalidChart = { ...validChart, planets: 'not an array' };
      const result = validateChart(invalidChart);
      expect(result).not.toBeNull();
      expect(Array.isArray(result)).toBe(true);
      expect(result!.length).toBeGreaterThan(0);
    });
    
    it('should detect missing required properties', () => {
      const incompleteChart = { ...validChart };
      // @ts-expect-error - Intentionally removing a required property for testing
      delete incompleteChart.planets;
      
      const result = validateChart(incompleteChart);
      expect(result).not.toBeNull();
      expect(result!.some(error => error.includes('planets'))).toBe(true);
    });
    
    it('should validate house count', () => {
      const chartWithTooFewHouses = {
        ...validChart,
        houses: validChart.houses.slice(0, 5) // Only 5 houses instead of 12
      };
      
      const result = validateChart(chartWithTooFewHouses);
      expect(result).not.toBeNull();
      expect(result!.some(error => error.includes('12 houses'))).toBe(true);
    });
  });
  
  describe('parseChartSafely', () => {
    it('should successfully parse valid chart JSON', () => {
      const json = JSON.stringify(validChart);
      const result = parseChartSafely(json);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.chart).toEqual(validChart);
    });
    
    it('should handle invalid JSON', () => {
      const invalidJson = '{not valid json}';
      const result = parseChartSafely(invalidJson);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.chart).toBeNull();
    });
    
    it('should validate chart structure after parsing', () => {
      const invalidChartJson = JSON.stringify({ ...validChart, planets: null });
      const result = parseChartSafely(invalidChartJson);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
  
  describe('getDataTypeName', () => {
    it('should identify chart data correctly', () => {
      expect(getDataTypeName(validChart)).toBe('Astrology Chart');
    });
    
    it('should identify user profile data correctly', () => {
      expect(getDataTypeName(validUserProfile)).toBe('User Profile');
    });
    
    it('should identify numerology data correctly', () => {
      expect(getDataTypeName(validNumerologyData)).toBe('Numerology Data');
    });
    
    it('should return Unknown Data for invalid types', () => {
      expect(getDataTypeName(null)).toBe('Unknown Data');
      expect(getDataTypeName({})).toBe('Unknown Data');
      expect(getDataTypeName('string')).toBe('Unknown Data');
    });
  });
  
  describe('validateUserProfile', () => {
    it('should return null for valid profiles', () => {
      const result = validateUserProfile(validUserProfile);
      expect(result).toBeNull();
    });
    
    it('should validate date format', () => {
      const profileWithInvalidDate = {
        ...validUserProfile,
        birthData: {
          ...validUserProfile.birthData,
          date: '01/01/1990' // Invalid format, should be YYYY-MM-DD
        }
      };
      
      const result = validateUserProfile(profileWithInvalidDate);
      expect(result).not.toBeNull();
      expect(result!.some(error => error.includes('date'))).toBe(true);
    });
    
    it('should validate time format', () => {
      const profileWithInvalidTime = {
        ...validUserProfile,
        birthData: {
          ...validUserProfile.birthData,
          time: '12pm' // Invalid format, should be HH:MM or HH:MM:SS
        }
      };
      
      const result = validateUserProfile(profileWithInvalidTime);
      expect(result).not.toBeNull();
      expect(result!.some(error => error.includes('time'))).toBe(true);
    });
  });
  
  describe('validateNumerologyData', () => {
    it('should return null for valid numerology data', () => {
      const result = validateNumerologyData(validNumerologyData);
      expect(result).toBeNull();
    });
    
    it('should validate life path number', () => {
      const invalidLifePath = {
        ...validNumerologyData,
        lifePath: 15 // Invalid, not 1-9 or 11,22,33
      };
      
      const result = validateNumerologyData(invalidLifePath);
      expect(result).not.toBeNull();
      expect(result!.some(error => error.includes('Life path'))).toBe(true);
    });
    
    it('should validate master numbers', () => {
      const withMasterNumbers = {
        lifePath: 11,
        destiny: 22,
        personalYear: 9
      };
      
      const result = validateNumerologyData(withMasterNumbers);
      expect(result).toBeNull(); // Should be valid
    });
  });
  
  describe('validateAstrologyData', () => {
    it('should automatically detect and validate chart data', () => {
      const result = validateAstrologyData(validChart);
      
      expect(result.type).toBe('Astrology Chart');
      expect(result.isValid).toBe(true);
      expect(result.errors).toBeNull();
    });
    
    it('should automatically detect and validate user profile data', () => {
      const result = validateAstrologyData(validUserProfile);
      
      expect(result.type).toBe('User Profile');
      expect(result.isValid).toBe(true);
      expect(result.errors).toBeNull();
    });
    
    it('should automatically detect and validate numerology data', () => {
      const result = validateAstrologyData(validNumerologyData);
      
      expect(result.type).toBe('Numerology Data');
      expect(result.isValid).toBe(true);
      expect(result.errors).toBeNull();
    });
    
    it('should handle unknown data types', () => {
      const result = validateAstrologyData({ random: 'object' });
      
      expect(result.type).toBe('Unknown Data');
      expect(result.isValid).toBe(false);
      expect(result.errors).not.toBeNull();
    });
  });
});
