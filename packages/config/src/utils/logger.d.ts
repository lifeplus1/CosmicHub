/** Minimal logger abstraction with level filtering and one-time messages. */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export interface LoggerConfig {
    level?: LogLevel;
}
export declare class BasicLogger {
    private logLevel;
    private seenMessages;
    private prefix;
    constructor(prefix?: string);
    setLevel(level: LogLevel): void;
    child(context: Record<string, unknown>): BasicLogger;
    private shouldLog;
    debug(message: string, data?: unknown): void;
    info(message: string, data?: unknown): void;
    warn(message: string, data?: unknown): void;
    error(message: string, data?: unknown): void;
    once(level: LogLevel, key: string, message: string, data?: unknown): void;
}
export declare const logger: BasicLogger;
export declare const silenceLogsForTests: () => void;
//# sourceMappingURL=logger.d.ts.map