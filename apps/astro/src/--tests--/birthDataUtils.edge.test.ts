import { describe, it, expect } from 'vitest';
import {
  parseTextBirthData,
  toUnifiedBirthData,
  type TextBirthData,
} from '@cosmichub/types';

// Edge & validation focused tests

describe('Birth Data Converters - Edge Cases', () => {
  it('trims whitespace in date/time and city/timezone', () => {
    const text: TextBirthData = {
      birth_date: ' 2024-02-29 ',
      birth_time: ' 09:05 ',
      city: '  Paris ',
      timezone: ' Europe/Paris ',
    } as any; // latitude/longitude optional
    const parsed = parseTextBirthData(text);
    expect(parsed).toMatchObject({
      year: 2024,
      month: 2,
      day: 29,
      hour: 9,
      minute: 5,
      city: 'Paris',
      timezone: 'Europe/Paris',
    });
  });

  it('rejects invalid calendar date (Feb 30)', () => {
    const text: TextBirthData = {
      birth_date: '2023-02-30',
      birth_time: '12:00',
    };
    expect(() => parseTextBirthData(text)).toThrow(/Invalid calendar date/);
  });

  it('rejects invalid hour (24)', () => {
    const text: TextBirthData = {
      birth_date: '2023-03-10',
      birth_time: '24:00',
    };
    expect(() => parseTextBirthData(text)).toThrow(/Invalid hour/);
  });

  it('rejects invalid minute (60)', () => {
    const text: TextBirthData = {
      birth_date: '2023-03-10',
      birth_time: '23:60',
    };
    expect(() => parseTextBirthData(text)).toThrow(/Invalid minute/);
  });

  it('rejects malformed date format', () => {
    const text: TextBirthData = {
      birth_date: '03/10/2023',
      birth_time: '12:00',
    } as any;
    expect(() => parseTextBirthData(text)).toThrow(/Invalid birth_date format/);
  });

  it('rejects malformed time format', () => {
    const text: TextBirthData = {
      birth_date: '2023-03-10',
      birth_time: '7:5',
    } as any;
    expect(() => parseTextBirthData(text)).toThrow(/Invalid birth_time format/);
  });

  it('still converts through dispatcher for valid leap day', () => {
    const text: TextBirthData = {
      birth_date: '2024-02-29',
      birth_time: '00:00',
    };
    const unified = toUnifiedBirthData(text);
    expect(unified).toMatchObject({
      year: 2024,
      month: 2,
      day: 29,
      hour: 0,
      minute: 0,
    });
  });
});
