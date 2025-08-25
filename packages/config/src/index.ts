/**
 * Configuration exports for CosmicHub monorepo
 * Essential exports only to avoid complex type errors
 */

// Core configuration
export * from './config';
export * from './env';

// Hooks (from hooks folder)
export * from './hooks/index';

// Lazy loading (working module)
export * from './lazy-loading';

// Performance & monitoring
export * from './performance';

// Firebase integration utilities (selective to avoid name collisions)
export {
  app,
  auth,
  db,
  enableFirestoreNetwork,
  disableFirestoreNetwork,
  hasAuthAvailable,
  isEmulator,
  projectId,
  getFirebasePerformanceInfo,
} from './firebase';

// Component architecture (component-library alias)
export * from './component-library';

// Push notifications and background sync
export * from './push-notifications';
export * from './background-sync-enhanced';
// Explicit notification stats/type re-export (clarity for consumers and tree-shaking)
export type {
  NotificationStats,
  NotificationPreferences,
  PushNotificationManager,
} from './push-notifications';
// Unified ApiResult helpers (explicit first to guarantee visibility)
export {
  ok,
  fail,
  toFailure,
  isSuccess,
  isFailure,
  unwrap,
  unwrapOr,
  mapResult,
  mapSuccess,
  mapFailure,
  ErrorCode,
} from './utils/api/result';
export type {
  ApiResult,
  ApiSuccess,
  ApiFailure,
  ErrorCodeValue,
} from './utils/api/result';
// Logger abstraction
export { logger, silenceLogsForTests } from './utils/logger';
// Feature keys (centralized identifiers)
export * from './featureKeys';
// Shared API utilities
export * from './utils/api/error';
export {
  mockHttpError,
  failureFromStatus,
  rawFailure,
} from './utils/api/test-helpers';
export {
  mockAuthFailure,
  mockNotFoundFailure,
  mockValidationFailure,
  isAuthFailure,
  isNotFoundFailure,
  isValidationFailure,
} from './utils/api/network-mocks';
// (avoid duplicate star export of result to prevent potential resolution quirks)

// Convenience re-exports for discriminated union helpers
// Explicit type export above; removed duplicate line.
