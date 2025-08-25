/*
 Centralized logger for HealWave app using structured logging.
 Replaces devConsole with proper logger instance.
*/

import { logger } from '@cosmichub/config';

// Create HealWave-specific logger
export const devConsole = logger.child({ module: 'HealWave' });

export type DevConsole = typeof devConsole;
