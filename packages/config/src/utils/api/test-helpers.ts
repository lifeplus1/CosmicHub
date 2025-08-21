import { ApiFailure, fail, toFailure } from './result';

/**
 * Build a mock error object shaped like Axios/fetch error with a response.status.
 */
export const mockHttpError = (status: number): unknown => ({ response: { status } });

/**
 * Quickly produce a mapped ApiFailure for a given HTTP status using provided defaults.
 */
export const failureFromStatus = (
  status: number,
  messages: { defaultMsg: string; auth?: string; notFound?: string; validation?: string }
): ApiFailure => toFailure(mockHttpError(status), messages);

/**
 * Build a raw failure (bypassing mapping) useful for testing consumer edge cases.
 */
export const rawFailure = (error: string, code?: string): ApiFailure => fail(error, code);
