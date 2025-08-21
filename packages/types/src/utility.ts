/**
 * Shared foundational utility types for cross-package use.
 * Centralizing these avoids re-defining loose "Record<string, any>" patterns
 * and encourages explicit unknown usage + gradual refinement.
 */

// JSON primitives and structured values
export type JSONPrimitive = string | number | boolean | null;
export type JSONValue = JSONPrimitive | JSONObject | JSONArray;
// Define JSON structures using interfaces with explicit members to satisfy lint rules
export interface JSONObject { [key: string]: JSONValue }
export type JSONArray = JSONValue[];

// Narrow record types
export type UnknownRecord = Record<string, unknown>;
export type StringMap<T = unknown> = Record<string, T>;

// Deep partial helper
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

// Brand utility (nominal typing)
export type Brand<T, B extends string> = T & { readonly __brand: B };

// Result discriminated unions
export interface Ok<T> { ok: true; value: T }
export interface Err<E = Error> { ok: false; error: E }
export type Result<T, E = Error> = Ok<T> | Err<E>;

// Function helpers
export type AsyncFn<TArgs extends unknown[] = unknown[], TReturn = unknown> = (...args: TArgs) => Promise<TReturn>;

// Predicate type
export type Predicate<T> = (value: unknown) => value is T;

// Exhaustive check helper
export function assertNever(x: never, message = 'Unexpected object'): never {
  throw new Error(`${message}: ${String(x)}`);
}
