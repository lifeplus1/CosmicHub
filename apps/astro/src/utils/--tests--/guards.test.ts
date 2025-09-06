import { describe, it, expect } from 'vitest';
import { isDefined, isNonEmptyString, isNonEmptyArray } from '../guards';

describe('guards utility functions', () => {
  describe('isDefined', () => {
    it('returns true for defined values', () => {
      expect(isDefined(0)).toBe(true);
      expect(isDefined('')).toBe(true);
      expect(isDefined(false)).toBe(true);
      expect(isDefined([])).toBe(true);
      expect(isDefined({})).toBe(true);
      expect(isDefined('string')).toBe(true);
      expect(isDefined(123)).toBe(true);
    });

    it('returns false for null and undefined', () => {
      expect(isDefined(null)).toBe(false);
      expect(isDefined(undefined)).toBe(false);
    });

    it('provides proper type narrowing', () => {
      const value: string | null = Math.random() > 0.5 ? 'test' : null;
      
      if (isDefined(value)) {
        // TypeScript should know this is string, not string | null
        expect(typeof value).toBe('string');
        expect(value.length).toBeGreaterThanOrEqual(0); // This would error if type narrowing failed
      }
    });
  });

  describe('isNonEmptyString', () => {
    it('returns true for non-empty strings', () => {
      expect(isNonEmptyString('hello')).toBe(true);
      expect(isNonEmptyString('a')).toBe(true);
      expect(isNonEmptyString('123')).toBe(true);
      expect(isNonEmptyString(' ')).toBe(true); // space is not empty
      expect(isNonEmptyString('\n')).toBe(true); // newline is not empty
    });

    it('returns false for empty strings', () => {
      expect(isNonEmptyString('')).toBe(false);
    });

    it('returns false for non-string values', () => {
      expect(isNonEmptyString(null)).toBe(false);
      expect(isNonEmptyString(undefined)).toBe(false);
      expect(isNonEmptyString(0)).toBe(false);
      expect(isNonEmptyString(false)).toBe(false);
      expect(isNonEmptyString([])).toBe(false);
      expect(isNonEmptyString({})).toBe(false);
      expect(isNonEmptyString(123)).toBe(false);
    });

    it('provides proper type narrowing', () => {
      const value: unknown = 'test string';
      
      if (isNonEmptyString(value)) {
        // TypeScript should know this is string
        expect(value.toUpperCase()).toBe('TEST STRING');
        expect(value.length).toBeGreaterThan(0);
      }
    });
  });

  describe('isNonEmptyArray', () => {
    it('returns true for non-empty arrays', () => {
      expect(isNonEmptyArray([1])).toBe(true);
      expect(isNonEmptyArray([1, 2, 3])).toBe(true);
      expect(isNonEmptyArray(['a', 'b'])).toBe(true);
      expect(isNonEmptyArray([null, undefined])).toBe(true); // array with elements is non-empty
      expect(isNonEmptyArray([{}])).toBe(true);
    });

    it('returns false for empty arrays', () => {
      expect(isNonEmptyArray([])).toBe(false);
    });

    it('returns false for non-array values', () => {
      expect(isNonEmptyArray(null)).toBe(false);
      expect(isNonEmptyArray(undefined)).toBe(false);
      expect(isNonEmptyArray('')).toBe(false);
      expect(isNonEmptyArray('string')).toBe(false);
      expect(isNonEmptyArray(0)).toBe(false);
      expect(isNonEmptyArray(123)).toBe(false);
      expect(isNonEmptyArray(false)).toBe(false);
      expect(isNonEmptyArray({})).toBe(false);
    });

    it('provides proper type narrowing with generic types', () => {
      const value: unknown = [1, 2, 3];
      
      if (isNonEmptyArray(value)) {
        // TypeScript should know this is an array
        expect(value.length).toBeGreaterThan(0);
        expect(Array.isArray(value)).toBe(true);
        expect(value[0]).toBeDefined();
      }
    });

    it('works with typed arrays', () => {
      const numbers: (number | undefined)[] = [1, 2, 3];
      const maybeNumbers: unknown = numbers;
      
      if (isNonEmptyArray<number>(maybeNumbers)) {
        expect(maybeNumbers.length).toBe(3);
        expect(typeof maybeNumbers[0]).toBe('number');
      }
    });
  });

  describe('combined usage scenarios', () => {
    it('can be used together for complex validations', () => {
      const data: unknown = {
        items: ['a', 'b', 'c'],
        name: 'test'
      };

      // Cast to access properties for testing
      const obj = data as { items?: unknown; name?: unknown };
      
      expect(isDefined(obj.items)).toBe(true);
      expect(isNonEmptyArray(obj.items)).toBe(true);
      expect(isDefined(obj.name)).toBe(true);
      expect(isNonEmptyString(obj.name)).toBe(true);
    });

    it('properly handles edge cases in combination', () => {
      const testCases = [
        { value: null, defined: false, nonEmptyString: false, nonEmptyArray: false },
        { value: undefined, defined: false, nonEmptyString: false, nonEmptyArray: false },
        { value: '', defined: true, nonEmptyString: false, nonEmptyArray: false },
        { value: [], defined: true, nonEmptyString: false, nonEmptyArray: false },
        { value: 'test', defined: true, nonEmptyString: true, nonEmptyArray: false },
        { value: ['test'], defined: true, nonEmptyString: false, nonEmptyArray: true },
      ];

      testCases.forEach(({ value, defined, nonEmptyString, nonEmptyArray }) => {
        expect(isDefined(value)).toBe(defined);
        expect(isNonEmptyString(value)).toBe(nonEmptyString);
        expect(isNonEmptyArray(value)).toBe(nonEmptyArray);
      });
    });
  });
});
