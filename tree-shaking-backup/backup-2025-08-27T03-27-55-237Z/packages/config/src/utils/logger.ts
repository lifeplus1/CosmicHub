/** Enhanced logger with file output for production and structured logging */

const levelPriority: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

}
  level: LogLevel;
  module?: string;
  message: string;
  data?: unknown;
}

export const logger = new BasicLogger();

// Console replacement functions for easy migration

// Development console helper (preserves existing devConsole patterns)

  return {
    log:
      process.env.NODE_ENV === 'development'
        ? (message: string, data?: unknown) => moduleLogger.info(message, data)
        : undefined,
    warn:
      process.env.NODE_ENV === 'development'
        ? (message: string, data?: unknown) => moduleLogger.warn(message, data)
        : undefined,
    error: (message: string, data?: unknown) =>
      moduleLogger.error(message, data),
    info:
      process.env.NODE_ENV === 'development'
        ? (message: string, data?: unknown) => moduleLogger.info(message, data)
        : undefined,
  };
};

// Test helper: silence all but errors
