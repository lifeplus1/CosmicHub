import { describe, it, expect } from 'vitest';
import { safeParseTextBirthData, type TextBirthData } from '@cosmichub/types';

describe('safeParseTextBirthData', () => {
  it('returns success for valid input', () => {
    const text: TextBirthData = {
      birth_date: '2024-02-29',
      birth_time: '07:15',
    } as any;
    const result = safeParseTextBirthData(text);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toMatchObject({
        year: 2024,
        month: 2,
        day: 29,
        hour: 7,
        minute: 15,
      });
    }
  });

  it('returns failure for invalid input instead of throwing', () => {
    const text: TextBirthData = {
      birth_date: '2023-02-30',
      birth_time: '12:00',
    } as any; // invalid date
    const result = safeParseTextBirthData(text);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error.message).toMatch(/Invalid calendar date/);
    }
  });
});
