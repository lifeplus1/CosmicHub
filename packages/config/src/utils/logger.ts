/** Minimal logger abstraction with level filtering and one-time messages. */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const levelPriority: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };

export interface LoggerConfig { level?: LogLevel; }

class BasicLogger {
  private level: LogLevel;
  private onceKeys = new Set<string>();
  constructor(cfg: LoggerConfig = {}) { this.level = cfg.level ?? 'info'; }
  setLevel(l: LogLevel) { this.level = l; }
  private allowed(l: LogLevel) { return levelPriority[l] >= levelPriority[this.level]; }
  debug(msg: string, meta?: unknown) { if (this.allowed('debug')) console.debug(`[debug] ${msg}`, meta ?? ''); }
  info(msg: string, meta?: unknown) { if (this.allowed('info')) console.info(`[info] ${msg}`, meta ?? ''); }
  warn(msg: string, meta?: unknown) { if (this.allowed('warn')) console.warn(`[warn] ${msg}`, meta ?? ''); }
  error(msg: string, meta?: unknown) { if (this.allowed('error')) console.error(`[error] ${msg}`, meta ?? ''); }
  once(key: string, level: LogLevel, msg: string, meta?: unknown) {
    if (this.onceKeys.has(key)) return;
    this.onceKeys.add(key);
    switch (level) {
      case 'debug': this.debug(msg, meta); break;
      case 'info': this.info(msg, meta); break;
      case 'warn': this.warn(msg, meta); break;
      case 'error': this.error(msg, meta); break;
    }
  }
}

export const logger = new BasicLogger();

// Test helper: silence all but errors
export const silenceLogsForTests = () => logger.setLevel('error');
