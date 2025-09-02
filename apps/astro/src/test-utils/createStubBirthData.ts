import type { ExtendedBirthData } from '@cosmichub/types';

/**
 * Factory for an ExtendedBirthData object with sensible defaults for tests.
 * Accepts partial overrides.
 */
export function createStubBirthData(
  overrides: Partial<ExtendedBirthData> = {}
): ExtendedBirthData {
  const base: ExtendedBirthData = {
    year: 1990,
    month: 1,
    day: 1,
    hour: 12,
    minute: 0,
    latitude: 40.0,
    longitude: -73.0,
    city: 'Test City',
    timezone: 'UTC',
  } as ExtendedBirthData; // base conforms sufficiently for UI tests
  return { ...base, ...overrides } as ExtendedBirthData;
}

export default createStubBirthData;
