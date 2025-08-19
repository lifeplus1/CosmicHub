/**
 * Structured logging utility for CosmicHub
 */
export class Logger {
  private static formatMessage(level: string, message: string, data?: unknown): string {
    const timestamp = new Date().toISOString();
  return `[${timestamp}] ${level.toUpperCase()}: ${message}${data !== undefined ? ` - ${JSON.stringify(data)}` : ''}`;
  }

  static debug(message: string, data?: unknown): void {
  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.debug(this.formatMessage('debug', message, data));
    }
  }

  static info(message: string, data?: unknown): void {
    // eslint-disable-next-line no-console
    console.info(this.formatMessage('info', message, data));
  }

  static warn(message: string, data?: unknown): void {
    // eslint-disable-next-line no-console
    console.warn(this.formatMessage('warn', message, data));
  }

  static error(message: string, error?: Error | unknown): void {
    // eslint-disable-next-line no-console
    console.error(this.formatMessage('error', message, {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }));
  }
}
