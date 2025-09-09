/*
 Centralized logger for HealWave app using structured logging.
 Replaces devConsole with proper logger instance.
*/

import { logger } from '@cosmichub/config';

// Create HealWave-specific logger. In test, proxy info messages to console.info
const base = logger.child ? logger.child({ module: 'HealWave' }) : logger;

interface ConsoleLike {
	info: (...args: unknown[]) => void;
	warn: (...args: unknown[]) => void;
	error: (...args: unknown[]) => void;
}

const testAware: ConsoleLike = {
  info: (...args) => {
    if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'test') {
      // Mirror to console.info so tests can spy
      // eslint-disable-next-line no-console
      console.info(...args);
    }
    (base as unknown as ConsoleLike).info?.(...args);
  },
	warn: (...args) => (base as unknown as ConsoleLike).warn?.(...args),
	error: (...args) => (base as unknown as ConsoleLike).error?.(...args),
};

export const devConsole: ConsoleLike = testAware;
