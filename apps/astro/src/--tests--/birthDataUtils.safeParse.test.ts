import { describe, it, expect } from 'vitest';
import { parseTextBirthData, type TextBirthData } from '@cosmichub/types';

describe('parseTextBirthData', () => {
  it('parses valid input correctly', () => {
    const text: TextBirthData = {
      birth_date: '2024-02-29',
      birth_time: '07:15',
    } as any;
    const result = parseTextBirthData(text);
    expect(result).toMatchObject({
      year: 2024,
      month: 2,
      day: 29,
      hour: 7,
      minute: 15,
    });
  });

  it('throws error for invalid input', () => {
    const text: TextBirthData = {
      birth_date: '2023-02-30',
      birth_time: '12:00',
    } as any; // invalid date
    expect(() => parseTextBirthData(text)).toThrow(/Invalid calendar date/);
  });
});
