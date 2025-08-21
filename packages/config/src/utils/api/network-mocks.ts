/** Centralized lightweight network mock/error factories for tests */
import { failureFromStatus } from './test-helpers';
import { ErrorCode } from './result';

export const mockAuthFailure = (msg = 'Authentication required') => (
  failureFromStatus(401, { defaultMsg: msg, auth: msg })
);

export const mockNotFoundFailure = (msg = 'Resource not found') => (
  failureFromStatus(404, { defaultMsg: msg, notFound: msg })
);

export const mockValidationFailure = (msg = 'Validation error') => (
  failureFromStatus(400, { defaultMsg: msg, validation: msg })
);

export const isAuthFailure = (code?: string) => code === ErrorCode.AUTH;
export const isNotFoundFailure = (code?: string) => code === ErrorCode.NOT_FOUND;
export const isValidationFailure = (code?: string) => code === ErrorCode.VALIDATION;
