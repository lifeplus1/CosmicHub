/** Minimal logger abstraction with level filtering and one-time messages. */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const levelPriority: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };

export interface LoggerConfig { level?: LogLevel; }

export class BasicLogger {
  private logLevel: LogLevel = 'info';
  private seenMessages = new Set<string>();
  private prefix: string = '';

  constructor(prefix: string = '') {
    this.prefix = prefix;
  }

  setLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  child(context: Record<string, unknown>): BasicLogger {
    const childPrefix = Object.entries(context)
      .map(([key, value]) => `${key}=${String(value)}`)
      .join(' ');
    const fullPrefix = this.prefix ? `${this.prefix} ${childPrefix}` : childPrefix;
    const childLogger = new BasicLogger(fullPrefix);
    childLogger.logLevel = this.logLevel;
    childLogger.seenMessages = this.seenMessages; // Share seen messages
    return childLogger;
  }

  private shouldLog(level: LogLevel): boolean {
    return levelPriority[level] >= levelPriority[this.logLevel];
  }

  debug(message: string, data?: unknown): void {
    if (this.shouldLog('debug')) {
    const prefixedMessage = this.prefix ? `${this.prefix} ${message}` : message;
    console.log(`[debug] ${prefixedMessage}`, data ?? '');
    }
  }

  info(message: string, data?: unknown): void {
    if (this.shouldLog('info')) {
    const prefixedMessage = this.prefix ? `${this.prefix} ${message}` : message;
    console.log(`[info] ${prefixedMessage}`, data ?? '');
    }
  }

  warn(message: string, data?: unknown): void {
    if (this.shouldLog('warn')) {
    const prefixedMessage = this.prefix ? `${this.prefix} ${message}` : message;
    console.warn(`[warn] ${prefixedMessage}`, data ?? '');
    }
  }

  error(message: string, data?: unknown): void {
    if (this.shouldLog('error')) {
    const prefixedMessage = this.prefix ? `${this.prefix} ${message}` : message;
    console.error(`[error] ${prefixedMessage}`, data ?? '');
    }
  }

  // One-time logging to reduce noise
  once(level: LogLevel, key: string, message: string, data?: unknown): void {
    if (this.seenMessages.has(key)) return;
    this.seenMessages.add(key);
    
    switch (level) {
      case 'debug': this.debug(message, data); break;
      case 'info': this.info(message, data); break;
      case 'warn': this.warn(message, data); break;
      case 'error': this.error(message, data); break;
    }
  }
}

export const logger = new BasicLogger();

// Test helper: silence all but errors
export const silenceLogsForTests = () => logger.setLevel('error');
