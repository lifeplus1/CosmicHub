const levelPriority = { debug: 10, info: 20, warn: 30, error: 40 };
export class BasicLogger {
    logLevel = 'info';
    seenMessages = new Set();
    prefix = '';
    constructor(prefix = '') {
        this.prefix = prefix;
    }
    setLevel(level) {
        this.logLevel = level;
    }
    child(context) {
        const childPrefix = Object.entries(context)
            .map(([key, value]) => `${key}=${String(value)}`)
            .join(' ');
        const fullPrefix = this.prefix ? `${this.prefix} ${childPrefix}` : childPrefix;
        const childLogger = new BasicLogger(fullPrefix);
        childLogger.logLevel = this.logLevel;
        childLogger.seenMessages = this.seenMessages; // Share seen messages
        return childLogger;
    }
    shouldLog(level) {
        return levelPriority[level] >= levelPriority[this.logLevel];
    }
    debug(message, data) {
        if (this.shouldLog('debug')) {
            const prefixedMessage = this.prefix ? `${this.prefix} ${message}` : message;
            console.log(`[debug] ${prefixedMessage}`, data ?? '');
        }
    }
    info(message, data) {
        if (this.shouldLog('info')) {
            const prefixedMessage = this.prefix ? `${this.prefix} ${message}` : message;
            console.log(`[info] ${prefixedMessage}`, data ?? '');
        }
    }
    warn(message, data) {
        if (this.shouldLog('warn')) {
            const prefixedMessage = this.prefix ? `${this.prefix} ${message}` : message;
            console.warn(`[warn] ${prefixedMessage}`, data ?? '');
        }
    }
    error(message, data) {
        if (this.shouldLog('error')) {
            const prefixedMessage = this.prefix ? `${this.prefix} ${message}` : message;
            console.error(`[error] ${prefixedMessage}`, data ?? '');
        }
    }
    // One-time logging to reduce noise
    once(level, key, message, data) {
        if (this.seenMessages.has(key))
            return;
        this.seenMessages.add(key);
        switch (level) {
            case 'debug':
                this.debug(message, data);
                break;
            case 'info':
                this.info(message, data);
                break;
            case 'warn':
                this.warn(message, data);
                break;
            case 'error':
                this.error(message, data);
                break;
        }
    }
}
export const logger = new BasicLogger();
// Test helper: silence all but errors
export const silenceLogsForTests = () => logger.setLevel('error');
//# sourceMappingURL=logger.js.map