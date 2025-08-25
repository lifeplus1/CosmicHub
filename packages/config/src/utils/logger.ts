/** Enhanced logger with file output for production and structured logging */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const levelPriority: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };

export interface LoggerConfig { level?: LogLevel; }
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module?: string;
  message: string;
  data?: unknown;
}

export class BasicLogger {
  private logLevel: LogLevel = 'info';
  private seenMessages = new Set<string>();
  private prefix: string = '';
  private isDevelopment = process.env.NODE_ENV === 'development';

  constructor(prefix: string = '') {
    this.prefix = prefix;
  }

  private formatLogEntry(level: LogLevel, message: string, data?: unknown): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      module: this.prefix || undefined,
      message,
      data
    };
  }

  private writeToFile(entry: LogEntry): void {
    if (this.isDevelopment || typeof window !== 'undefined') return; // No file writing in dev/browser

    try {
      // In production, this would write to actual log files
      // For now, we'll use structured console output that can be captured by log aggregators
      console.log(JSON.stringify(entry));
    } catch (error) {
      // Fallback to standard console
      console.error('[Logger] File write failed:', error);
    }
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
    if (!this.shouldLog('debug')) return;
    
    const entry = this.formatLogEntry('debug', message, data);
    const prefixedMessage = this.prefix ? `${this.prefix} ${message}` : message;
    
    if (this.isDevelopment) {
      console.log(`[debug] ${prefixedMessage}`, data ?? '');
    } else {
      this.writeToFile(entry);
    }
  }

  info(message: string, data?: unknown): void {
    if (!this.shouldLog('info')) return;
    
    const entry = this.formatLogEntry('info', message, data);
    const prefixedMessage = this.prefix ? `${this.prefix} ${message}` : message;
    
    if (this.isDevelopment) {
      console.log(`[info] ${prefixedMessage}`, data ?? '');
    } else {
      this.writeToFile(entry);
    }
  }

  warn(message: string, data?: unknown): void {
    if (!this.shouldLog('warn')) return;
    
    const entry = this.formatLogEntry('warn', message, data);
    const prefixedMessage = this.prefix ? `${this.prefix} ${message}` : message;
    
    if (this.isDevelopment) {
      console.warn(`[warn] ${prefixedMessage}`, data ?? '');
    } else {
      this.writeToFile(entry);
    }
  }

  error(message: string, data?: unknown): void {
    if (!this.shouldLog('error')) return;
    
    const entry = this.formatLogEntry('error', message, data);
    const prefixedMessage = this.prefix ? `${this.prefix} ${message}` : message;
    
    if (this.isDevelopment) {
      console.error(`[error] ${prefixedMessage}`, data ?? '');
    } else {
      this.writeToFile(entry);
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

// Console replacement functions for easy migration
export const consoleReplacements = {
  log: (message: string, data?: unknown) => logger.info(message, data),
  info: (message: string, data?: unknown) => logger.info(message, data),
  warn: (message: string, data?: unknown) => logger.warn(message, data),
  error: (message: string, data?: unknown) => logger.error(message, data),
  debug: (message: string, data?: unknown) => logger.debug(message, data)
};

// Development console helper (preserves existing devConsole patterns)
export const createDevConsole = (module?: string) => {
  const moduleLogger = module ? logger.child({ module }) : logger;
  
  return {
    log: process.env.NODE_ENV === 'development' 
      ? (message: string, data?: unknown) => moduleLogger.info(message, data)
      : undefined,
    warn: process.env.NODE_ENV === 'development'
      ? (message: string, data?: unknown) => moduleLogger.warn(message, data)
      : undefined,
    error: (message: string, data?: unknown) => moduleLogger.error(message, data),
    info: process.env.NODE_ENV === 'development'
      ? (message: string, data?: unknown) => moduleLogger.info(message, data)
      : undefined
  };
};

// Test helper: silence all but errors
export const silenceLogsForTests = () => logger.setLevel('error');
