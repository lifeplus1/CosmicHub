import { Logger } from './logger';

// Thin wrapper around Logger for component-specific logging
// Provides consistent interface and easy enablement/disablement of debug logs
export const componentLogger = {
  debug: (component: string, message: string, ...meta: unknown[]): void => {
    Logger.debug(`[${component}] ${message}`, ...meta);
  },
  info: (component: string, message: string, ...meta: unknown[]): void => {
    Logger.info(`[${component}] ${message}`, ...meta);
  },
  warn: (component: string, message: string, ...meta: unknown[]): void => {
    Logger.warn(`[${component}] ${message}`, ...meta);
  },
  error: (component: string, message: string, ...meta: unknown[]): void => {
    const err = meta.find(m => m instanceof Error);
    Logger.error(`[${component}] ${message}`, err);
  }
};
