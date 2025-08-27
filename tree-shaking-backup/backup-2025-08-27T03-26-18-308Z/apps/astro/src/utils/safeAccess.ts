// Centralized safe access helpers for strict indexing rules
// Provides utilities that avoid unchecked index signature and array index assumptions.

export function hasIndex<T>(
  arr: readonly T[] | T[] | undefined | null,
  index: number
): arr is readonly T[] {
  return Array.isArray(arr) && index >= 0 && index < arr.length;
}

export function safeAt<T>(
  arr: readonly T[] | T[] | undefined | null,
  index: number
): T | undefined {
  if (!Array.isArray(arr)) return undefined;
  return index >= 0 && index < arr.length ? arr[index] : undefined;
}

export function first<T>(
  arr: readonly T[] | T[] | undefined | null
): T | undefined {
  if (!Array.isArray(arr) || arr.length === 0) return undefined;
  return arr[0];
}

export function assertDefined<T>(
  value: T | null | undefined,
  message = 'Expected value to be defined'
): T {
  if (value === null || value === undefined) throw new Error(message);
  return value;
}

export function coalesceNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && !Number.isNaN(value) ? value : fallback;
}

export function safeMap<T, R>(
  arr: readonly T[] | T[] | undefined | null,
  fn: (item: T, index: number) => R
): R[] {
  if (!Array.isArray(arr)) return [];
  const out: R[] = [];
  for (let i = 0; i < arr.length; i++) {
    out.push(fn(arr[i] as T, i));
  }
  return out;
}
