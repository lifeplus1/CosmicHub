/**
 * Tests for chart validation utilities
 */
import { describe, it, expect } from 'vitest';
import {
  validateChart,
  parseChartSafely,
  getDataTypeName,
} from '../chart-validation';
// Test utilities - commented out until test factory is implemented
// import { createTestChart, createTestPlanet, createTestHouse, createTestAspect } from '../../__tests__/utils/test-data-factory';

// Simple mock chart for testing
const createMockChart = () => ({
  planets: {
    sun: { position: 120, sign: 'leo', house: 5 },
    moon: { position: 250, sign: 'sagittarius', house: 8 }
  },
  houses: [
    { number: 1, cusp: 0, sign: 'aries' },
    { number: 2, cusp: 30, sign: 'taurus' }
  ],
  aspects: [
    { planet1: 'sun', planet2: 'moon', type: 'trine', orb: 4.2 }
  ]
});

describe('Chart Validation', () => {
  describe('validateChart', () => {
    it('should validate a correct chart', () => {
      const validChart = createMockChart();
      const result = validateChart(validChart);
      expect(result).toBe(null); // null means valid
    });

    it('should reject invalid chart data', () => {
      const invalidChart = { invalid: 'data' } as any;
      const result = validateChart(invalidChart);
      expect(result).not.toBe(null);
      expect(Array.isArray(result)).toBe(true);
      if (result) {
        expect(result.length).toBeGreaterThan(0);
      }
    });

    it('should handle null/undefined input', () => {
      const result1 = validateChart(null);
      const result2 = validateChart(undefined);
      expect(result1).not.toBe(null);
      expect(result2).not.toBe(null);
    });
  });

  describe('parseChartSafely', () => {
    it('should parse valid JSON chart data', () => {
      const validChart = createMockChart();
      const jsonString = JSON.stringify(validChart);
      const result = parseChartSafely(jsonString);
      expect(result.isValid).toBe(true);
      expect(result.chart).toBeDefined();
      expect(result.errors).toHaveLength(0);
    });

    it('should handle invalid JSON', () => {
      const result = parseChartSafely('invalid json');
      expect(result.isValid).toBe(false);
      expect(result.chart).toBe(null);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle valid JSON with invalid chart structure', () => {
      const invalidChartJson = JSON.stringify({ not: 'a chart' });
      const result = parseChartSafely(invalidChartJson);
      expect(result.isValid).toBe(false);
      expect(result.chart).toBe(null);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('getDataTypeName', () => {
    it('should identify chart type correctly', () => {
      const validChart = createMockChart();
      expect(getDataTypeName(validChart)).toBe('AstrologyChart');
    });

    it('should return "Unknown" for invalid data', () => {
      expect(getDataTypeName({ random: 'object' })).toBe('Unknown');
      expect(getDataTypeName(null)).toBe('Unknown');
      expect(getDataTypeName(undefined)).toBe('Unknown');
    });
  });
});

describe('Edge Cases', () => {
  it('should handle charts with minimal required data', () => {
    const validChart = createMockChart();
    const result = validateChart(validChart);
    expect(result).toBe(null); // null means valid
  });
});
