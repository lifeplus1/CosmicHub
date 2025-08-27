/**
 * Numeric parsing helpers for ChartDisplay to consistently coerce unknown house values.
 */

/**
 * Safely parse an unknown "house" value that might be number | string | null | undefined.
 * Strips non-digits, defaults to fallback when parsing fails or result < 0.
 */
export function parseIntFromUnknown(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9]/g, '');
    if (cleaned.length === 0) return fallback;
    const parsed = parseInt(cleaned, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

/**
 * Clamp a house number into the canonical 1..12 range (wrapping) or fallback if invalid.
 */
export function normalizeHouseNumber(house: number, fallback = 1): number {
  if (!Number.isFinite(house)) return fallback;
  if (house >= 1 && house <= 12) return house;
  // Basic wrap: treat 0 as 12, >12 modulo 12
  const wrapped = ((house % 12) + 12) % 12; // => 0..11
  return wrapped === 0 ? 12 : wrapped;
}
