/*
 Centralized devConsole for HealWave app to eliminate per-file raw console bindings.
 Only errors always log; other methods are development-only.
*/
/* eslint-disable no-console */
export const devConsole = {
  log: import.meta.env.DEV ? console.log.bind(console) : undefined,
  warn: import.meta.env.DEV ? console.warn.bind(console) : undefined,
  error: console.error.bind(console)
};
/* eslint-enable no-console */

export type DevConsole = typeof devConsole;
