// Shared boolean/type guard helpers to satisfy strict-boolean-expressions without verbosity
export const isDefined = <T>(v: T | null | undefined): v is T =>
  v !== null && v !== undefined;
export const isNonEmptyString = (v: unknown): v is string =>
  typeof v === 'string' && v !== '';
export const isNonEmptyArray = <T>(v: unknown): v is T[] =>
  Array.isArray(v) && v.length > 0;
