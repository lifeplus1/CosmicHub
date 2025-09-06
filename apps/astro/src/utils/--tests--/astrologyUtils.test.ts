/**
 * Comprehensive Unit Tests for Astrology Utilities
 *
 * Tests all functions in the centralized astrologyUtils module to ensure
 * consistent and correct astrological calculations across the application.
 */

import { describe, it, expect } from 'vitest';
import {
  // Main calculation functions
  getSignFromDegrees,
  getSignFromDegreesCapitalized,
  getDegreeWithinSign,
  getAstrologicalSign,
  calculateHousePosition,

  // Element/Quality/Ruler functions
  getElementFromSign,
  getQualityFromSign,
  getRulerFromSign,

  // Angle utilities
  normalizeAngle,
  angleDifference,

  // Validation functions
  isValidPosition,
  isZodiacSign,
  isHouseNumber,

  // Format functions
  formatPlanetPosition,

  // Constants
  ZODIAC_SIGNS,
  ZODIAC_SIGNS_CAPITALIZED,
  SIGN_ELEMENTS,
  SIGN_QUALITIES,
  SIGN_RULERS,

  // Types
  type ZodiacSign,
} from '../astrologyUtils';

describe('Astrology Utilities', () => {
  describe('Constants', () => {
    it('should have 12 zodiac signs', () => {
      expect(ZODIAC_SIGNS).toHaveLength(12);
      expect(ZODIAC_SIGNS_CAPITALIZED).toHaveLength(12);
    });

    it('should have complete element mappings', () => {
      expect(Object.keys(SIGN_ELEMENTS)).toHaveLength(12);
      ZODIAC_SIGNS.forEach(sign => {
        expect(SIGN_ELEMENTS[sign]).toBeDefined();
        expect(['fire', 'earth', 'air', 'water']).toContain(
          SIGN_ELEMENTS[sign]
        );
      });
    });

    it('should have complete quality mappings', () => {
      expect(Object.keys(SIGN_QUALITIES)).toHaveLength(12);
      ZODIAC_SIGNS.forEach(sign => {
        expect(SIGN_QUALITIES[sign]).toBeDefined();
        expect(['cardinal', 'fixed', 'mutable']).toContain(
          SIGN_QUALITIES[sign]
        );
      });
    });

    it('should have complete ruler mappings', () => {
      expect(Object.keys(SIGN_RULERS)).toHaveLength(12);
      ZODIAC_SIGNS.forEach(sign => {
        expect(SIGN_RULERS[sign]).toBeDefined();
        expect(typeof SIGN_RULERS[sign]).toBe('string');
      });
    });
  });

  describe('getSignFromDegrees', () => {
    it('should correctly identify signs at exact boundaries', () => {
      expect(getSignFromDegrees(0)).toBe('aries'); // 0° Aries
      expect(getSignFromDegrees(30)).toBe('taurus'); // 0° Taurus
      expect(getSignFromDegrees(60)).toBe('gemini'); // 0° Gemini
      expect(getSignFromDegrees(90)).toBe('cancer'); // 0° Cancer
      expect(getSignFromDegrees(120)).toBe('leo'); // 0° Leo
      expect(getSignFromDegrees(150)).toBe('virgo'); // 0° Virgo
      expect(getSignFromDegrees(180)).toBe('libra'); // 0° Libra
      expect(getSignFromDegrees(210)).toBe('scorpio'); // 0° Scorpio
      expect(getSignFromDegrees(240)).toBe('sagittarius'); // 0° Sagittarius
      expect(getSignFromDegrees(270)).toBe('capricorn'); // 0° Capricorn
      expect(getSignFromDegrees(300)).toBe('aquarius'); // 0° Aquarius
      expect(getSignFromDegrees(330)).toBe('pisces'); // 0° Pisces
    });

    it('should correctly identify signs in the middle of ranges', () => {
      expect(getSignFromDegrees(15)).toBe('aries'); // 15° Aries
      expect(getSignFromDegrees(45)).toBe('taurus'); // 15° Taurus
      expect(getSignFromDegrees(195)).toBe('libra'); // 15° Libra
      expect(getSignFromDegrees(285)).toBe('capricorn'); // 15° Capricorn
    });

    it('should handle degrees just before boundaries', () => {
      expect(getSignFromDegrees(29.99)).toBe('aries');
      expect(getSignFromDegrees(59.99)).toBe('taurus');
      expect(getSignFromDegrees(359.99)).toBe('pisces');
    });

    it('should normalize negative degrees', () => {
      expect(getSignFromDegrees(-30)).toBe('pisces'); // -30° = 330°
      expect(getSignFromDegrees(-60)).toBe('aquarius'); // -60° = 300°
      expect(getSignFromDegrees(-1)).toBe('pisces'); // -1° = 359°
    });

    it('should normalize degrees over 360', () => {
      expect(getSignFromDegrees(360)).toBe('aries'); // 360° = 0°
      expect(getSignFromDegrees(390)).toBe('taurus'); // 390° = 30°
      expect(getSignFromDegrees(720)).toBe('aries'); // 720° = 0°
    });

    it('should handle large positive and negative values', () => {
      expect(getSignFromDegrees(1080)).toBe('aries'); // 1080° = 0°
      expect(getSignFromDegrees(-720)).toBe('aries'); // -720° = 0°
    });
  });

  describe('getSignFromDegreesCapitalized', () => {
    it('should return capitalized sign names', () => {
      expect(getSignFromDegreesCapitalized(0)).toBe('Aries');
      expect(getSignFromDegreesCapitalized(30)).toBe('Taurus');
      expect(getSignFromDegreesCapitalized(180)).toBe('Libra');
      expect(getSignFromDegreesCapitalized(330)).toBe('Pisces');
    });

    it('should handle edge cases like regular function', () => {
      expect(getSignFromDegreesCapitalized(-30)).toBe('Pisces');
      expect(getSignFromDegreesCapitalized(390)).toBe('Taurus');
    });
  });

  describe('getDegreeWithinSign', () => {
    it('should return correct degrees within sign', () => {
      expect(getDegreeWithinSign(0)).toBe(0);
      expect(getDegreeWithinSign(15)).toBe(15);
      expect(getDegreeWithinSign(29.99)).toBeCloseTo(29.99);
      expect(getDegreeWithinSign(30)).toBe(0); // Start of next sign
      expect(getDegreeWithinSign(45)).toBe(15); // 15° into Taurus
    });

    it('should handle full circle', () => {
      expect(getDegreeWithinSign(360)).toBe(0);
      expect(getDegreeWithinSign(390)).toBe(0); // 30° = 0° of Taurus
      expect(getDegreeWithinSign(405)).toBe(15); // 45° = 15° of Taurus
    });

    it('should handle negative degrees', () => {
      expect(getDegreeWithinSign(-1)).toBeCloseTo(29); // -1° = 359° = 29° Pisces
      expect(getDegreeWithinSign(-30)).toBe(0); // -30° = 330° = 0° Pisces
    });
  });

  describe('getAstrologicalSign', () => {
    it('should return detailed sign information', () => {
      const result = getAstrologicalSign(15.75);
      expect(result.sign).toBe('Aries');
      expect(result.signDegrees).toBe(15);
      expect(result.signMinutes).toBe(45); // 0.75 * 60 = 45 minutes
    });

    it('should handle exact degrees', () => {
      const result = getAstrologicalSign(30);
      expect(result.sign).toBe('Taurus');
      expect(result.signDegrees).toBe(0);
      expect(result.signMinutes).toBe(0);
    });

    it('should handle edge cases', () => {
      const result = getAstrologicalSign(-1);
      expect(result.sign).toBe('Pisces');
      expect(result.signDegrees).toBe(29);
    });

    it('should calculate minutes correctly', () => {
      const result = getAstrologicalSign(45.5); // 15° 30' Taurus
      expect(result.sign).toBe('Taurus');
      expect(result.signDegrees).toBe(15);
      expect(result.signMinutes).toBe(30);
    });
  });

  describe('calculateHousePosition', () => {
    const standardCusps = [
      0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330,
    ];

    it('should calculate correct house positions', () => {
      expect(calculateHousePosition(15, standardCusps)).toBe(1); // 15° in House 1
      expect(calculateHousePosition(45, standardCusps)).toBe(2); // 45° in House 2
      expect(calculateHousePosition(195, standardCusps)).toBe(7); // 195° in House 7 (between 180° and 210°)
    });

    it('should handle positions at exact cusps', () => {
      expect(calculateHousePosition(0, standardCusps)).toBe(1); // Exactly on 1st cusp
      expect(calculateHousePosition(30, standardCusps)).toBe(2); // Exactly on 2nd cusp
      expect(calculateHousePosition(180, standardCusps)).toBe(7); // Exactly on 7th cusp
    });

    it('should handle crossing 0 degrees (Ascendant/Midheaven axis)', () => {
      const cuspsWithCrossing = [
        350, 20, 50, 80, 110, 140, 170, 200, 230, 260, 290, 320,
      ];
      expect(calculateHousePosition(355, cuspsWithCrossing)).toBe(1); // 355° in House 1
      expect(calculateHousePosition(5, cuspsWithCrossing)).toBe(1); // 5° in House 1
      expect(calculateHousePosition(25, cuspsWithCrossing)).toBe(2); // 25° in House 2
    });

    it('should handle empty or invalid cusp arrays', () => {
      expect(calculateHousePosition(15, [])).toBe(1);
      expect(calculateHousePosition(15, [1, 2, 3])).toBe(1); // Less than 12 cusps
    });

    it('should handle invalid cusp values', () => {
      const invalidCusps = [
        0,
        30,
        undefined,
        90,
        null,
        150,
        180,
        210,
        240,
        270,
        300,
        330,
      ] as any;
      // Should still work for valid cusps and skip invalid ones
      const result = calculateHousePosition(15, invalidCusps);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(12);
    });

    it('should normalize planet positions', () => {
      expect(calculateHousePosition(-15, standardCusps)).toBe(12); // -15° = 345°, in House 12
      expect(calculateHousePosition(375, standardCusps)).toBe(1); // 375° = 15°, in House 1
    });
  });

  describe('getElementFromSign', () => {
    it('should return correct elements for fire signs', () => {
      expect(getElementFromSign('aries')).toBe('fire');
      expect(getElementFromSign('leo')).toBe('fire');
      expect(getElementFromSign('sagittarius')).toBe('fire');
    });

    it('should return correct elements for earth signs', () => {
      expect(getElementFromSign('taurus')).toBe('earth');
      expect(getElementFromSign('virgo')).toBe('earth');
      expect(getElementFromSign('capricorn')).toBe('earth');
    });

    it('should return correct elements for air signs', () => {
      expect(getElementFromSign('gemini')).toBe('air');
      expect(getElementFromSign('libra')).toBe('air');
      expect(getElementFromSign('aquarius')).toBe('air');
    });

    it('should return correct elements for water signs', () => {
      expect(getElementFromSign('cancer')).toBe('water');
      expect(getElementFromSign('scorpio')).toBe('water');
      expect(getElementFromSign('pisces')).toBe('water');
    });
  });

  describe('getQualityFromSign', () => {
    it('should return correct qualities for cardinal signs', () => {
      expect(getQualityFromSign('aries')).toBe('cardinal');
      expect(getQualityFromSign('cancer')).toBe('cardinal');
      expect(getQualityFromSign('libra')).toBe('cardinal');
      expect(getQualityFromSign('capricorn')).toBe('cardinal');
    });

    it('should return correct qualities for fixed signs', () => {
      expect(getQualityFromSign('taurus')).toBe('fixed');
      expect(getQualityFromSign('leo')).toBe('fixed');
      expect(getQualityFromSign('scorpio')).toBe('fixed');
      expect(getQualityFromSign('aquarius')).toBe('fixed');
    });

    it('should return correct qualities for mutable signs', () => {
      expect(getQualityFromSign('gemini')).toBe('mutable');
      expect(getQualityFromSign('virgo')).toBe('mutable');
      expect(getQualityFromSign('sagittarius')).toBe('mutable');
      expect(getQualityFromSign('pisces')).toBe('mutable');
    });
  });

  describe('getRulerFromSign', () => {
    it('should return correct traditional rulers', () => {
      expect(getRulerFromSign('aries')).toBe('Mars');
      expect(getRulerFromSign('taurus')).toBe('Venus');
      expect(getRulerFromSign('gemini')).toBe('Mercury');
      expect(getRulerFromSign('cancer')).toBe('Moon');
      expect(getRulerFromSign('leo')).toBe('Sun');
      expect(getRulerFromSign('virgo')).toBe('Mercury');
    });

    it('should return correct modern rulers', () => {
      expect(getRulerFromSign('scorpio')).toBe('Pluto');
      expect(getRulerFromSign('aquarius')).toBe('Uranus');
      expect(getRulerFromSign('pisces')).toBe('Neptune');
    });

    it('should return correct remaining rulers', () => {
      expect(getRulerFromSign('libra')).toBe('Venus');
      expect(getRulerFromSign('sagittarius')).toBe('Jupiter');
      expect(getRulerFromSign('capricorn')).toBe('Saturn');
    });
  });

  describe('normalizeAngle', () => {
    it('should leave valid angles unchanged', () => {
      expect(normalizeAngle(0)).toBe(0);
      expect(normalizeAngle(180)).toBe(180);
      expect(normalizeAngle(359.99)).toBeCloseTo(359.99);
    });

    it('should normalize angles over 360', () => {
      expect(normalizeAngle(360)).toBe(0);
      expect(normalizeAngle(450)).toBe(90);
      expect(normalizeAngle(720)).toBe(0);
    });

    it('should normalize negative angles', () => {
      expect(normalizeAngle(-90)).toBe(270);
      expect(normalizeAngle(-180)).toBe(180);
      expect(normalizeAngle(-270)).toBe(90);
      expect(normalizeAngle(-360)).toBe(0);
    });

    it('should handle large values', () => {
      expect(normalizeAngle(1080)).toBe(0); // 3 full rotations
      expect(normalizeAngle(-1080)).toBe(0); // -3 full rotations
    });
  });

  describe('angleDifference', () => {
    it('should calculate simple differences', () => {
      expect(angleDifference(0, 90)).toBe(90);
      expect(angleDifference(90, 0)).toBe(-90);
      expect(angleDifference(0, 180)).toBe(180);
    });

    it('should take shortest path across 0°', () => {
      expect(angleDifference(350, 10)).toBe(20); // 20° clockwise
      expect(angleDifference(10, 350)).toBe(-20); // 20° counter-clockwise
    });

    it('should handle exactly opposite angles', () => {
      expect(angleDifference(0, 180)).toBe(180);
      expect(Math.abs(angleDifference(180, 0))).toBe(180); // Could be 180 or -180, both valid
      expect(angleDifference(90, 270)).toBe(180);
    });

    it('should return values in -180 to 180 range', () => {
      const result1 = angleDifference(10, 350);
      const result2 = angleDifference(350, 10);

      expect(result1).toBeGreaterThanOrEqual(-180);
      expect(result1).toBeLessThanOrEqual(180);
      expect(result2).toBeGreaterThanOrEqual(-180);
      expect(result2).toBeLessThanOrEqual(180);
    });
  });

  describe('isValidPosition', () => {
    it('should return true for valid numbers', () => {
      expect(isValidPosition(0)).toBe(true);
      expect(isValidPosition(123.45)).toBe(true);
      expect(isValidPosition(-180)).toBe(true);
    });

    it('should return false for invalid numbers', () => {
      expect(isValidPosition(NaN)).toBe(false);
      expect(isValidPosition(Infinity)).toBe(false);
      expect(isValidPosition(-Infinity)).toBe(false);
    });

    it('should return false for non-numbers', () => {
      expect(isValidPosition('123')).toBe(false);
      expect(isValidPosition(null)).toBe(false);
      expect(isValidPosition(undefined)).toBe(false);
      expect(isValidPosition({})).toBe(false);
      expect(isValidPosition([])).toBe(false);
    });
  });

  describe('formatPlanetPosition', () => {
    it('should format positions with default precision', () => {
      expect(formatPlanetPosition(123.456)).toBe('123.46°');
      expect(formatPlanetPosition(0)).toBe('0.00°');
    });

    it('should format positions with custom precision', () => {
      expect(formatPlanetPosition(123.456, false, 0)).toBe('123°');
      expect(formatPlanetPosition(123.456, false, 1)).toBe('123.5°');
      expect(formatPlanetPosition(123.456, false, 3)).toBe('123.456°');
    });

    it('should add retrograde symbol when needed', () => {
      expect(formatPlanetPosition(123.45, true)).toBe('123.45° ℞');
      expect(formatPlanetPosition(123.45, false)).toBe('123.45°');
    });

    it('should handle edge cases', () => {
      expect(formatPlanetPosition(0, true, 0)).toBe('0° ℞');
      expect(formatPlanetPosition(359.999, false, 2)).toBe('360.00°');
    });
  });

  describe('isZodiacSign', () => {
    it('should return true for valid zodiac signs', () => {
      ZODIAC_SIGNS.forEach(sign => {
        expect(isZodiacSign(sign)).toBe(true);
      });
    });

    it('should return false for invalid signs', () => {
      expect(isZodiacSign('Aries')).toBe(false); // Capitalized
      expect(isZodiacSign('ophiuchus')).toBe(false);
      expect(isZodiacSign('mars')).toBe(false);
      expect(isZodiacSign('')).toBe(false);
    });

    it('should return false for non-strings', () => {
      expect(isZodiacSign(null)).toBe(false);
      expect(isZodiacSign(undefined)).toBe(false);
      expect(isZodiacSign(123)).toBe(false);
      expect(isZodiacSign({})).toBe(false);
    });
  });

  describe('isHouseNumber', () => {
    it('should return true for valid house numbers', () => {
      for (let i = 1; i <= 12; i++) {
        expect(isHouseNumber(i)).toBe(true);
      }
    });

    it('should return false for invalid house numbers', () => {
      expect(isHouseNumber(0)).toBe(false);
      expect(isHouseNumber(13)).toBe(false);
      expect(isHouseNumber(-1)).toBe(false);
      expect(isHouseNumber(1.5)).toBe(false); // Should be integer
    });

    it('should return false for non-numbers', () => {
      expect(isHouseNumber('1')).toBe(false);
      expect(isHouseNumber(null)).toBe(false);
      expect(isHouseNumber(undefined)).toBe(false);
    });
  });

  describe('Integration Tests', () => {
    it('should maintain consistency across related functions', () => {
      const testDegree = 45.75; // 15° 45' Taurus

      const sign = getSignFromDegrees(testDegree);
      const capitalizedSign = getSignFromDegreesCapitalized(testDegree);
      const degreeInSign = getDegreeWithinSign(testDegree);
      const detailedSign = getAstrologicalSign(testDegree);

      expect(sign).toBe('taurus');
      expect(capitalizedSign).toBe('Taurus');
      expect(degreeInSign).toBeCloseTo(15.75);
      expect(detailedSign.sign).toBe('Taurus');
      expect(detailedSign.signDegrees).toBe(15);
      expect(detailedSign.signMinutes).toBe(45);
    });

    it('should work correctly for all 12 signs', () => {
      for (let i = 0; i < 12; i++) {
        const testDegree = i * 30 + 15; // Middle of each sign
        const sign = getSignFromDegrees(testDegree);
        const element = getElementFromSign(sign);
        const quality = getQualityFromSign(sign);
        const ruler = getRulerFromSign(sign);

        expect(ZODIAC_SIGNS).toContain(sign);
        expect(['fire', 'earth', 'air', 'water']).toContain(element);
        expect(['cardinal', 'fixed', 'mutable']).toContain(quality);
        expect(typeof ruler).toBe('string');
        expect(ruler.length).toBeGreaterThan(0);
      }
    });

    it('should handle complete astrological calculations', () => {
      const planetDegree = 135.25; // 15° 15' Leo
      const houseCusps = [
        0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330,
      ];

      const sign = getSignFromDegrees(planetDegree);
      const house = calculateHousePosition(planetDegree, houseCusps);
      const element = getElementFromSign(sign);
      const quality = getQualityFromSign(sign);
      const ruler = getRulerFromSign(sign);
      const formatted = formatPlanetPosition(planetDegree);

      expect(sign).toBe('leo');
      expect(house).toBe(5); // Leo naturally rules 5th house
      expect(element).toBe('fire');
      expect(quality).toBe('fixed');
      expect(ruler).toBe('Sun');
      expect(formatted).toBe('135.25°');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle extreme degree values gracefully', () => {
      const extremeValues = [
        Number.MAX_SAFE_INTEGER,
        -Number.MAX_SAFE_INTEGER,
        1e10,
        -1e10,
      ];

      extremeValues.forEach(value => {
        expect(() => getSignFromDegrees(value)).not.toThrow();
        expect(() => normalizeAngle(value)).not.toThrow();
        expect(() => getDegreeWithinSign(value)).not.toThrow();
      });
    });

    it('should provide fallback values for invalid inputs', () => {
      // Functions should return sensible defaults rather than throw
      expect(getSignFromDegrees(NaN)).toBe('aries'); // fallback to first sign
      expect(calculateHousePosition(15, [])).toBe(1); // fallback to first house
      expect(getElementFromSign('invalid' as ZodiacSign)).toBe('fire'); // fallback to first element
    });
  });
});
