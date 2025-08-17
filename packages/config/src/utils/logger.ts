/* Lightweight structured logger for CosmicHub config/testing utilities */

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error';

interface LoggerOptions {
  level?: LogLevel;
  enabled?: boolean;
  redactKeys?: string[];
  baseFields?: Record<string, unknown>;
  json?: boolean;
}

const levelOrder: LogLevel[] = ['trace', 'debug', 'info', 'warn', 'error'];

function shouldLog(current: LogLevel, target: LogLevel): boolean {
  return levelOrder.indexOf(target) >= levelOrder.indexOf(current);
}

function redact(value: unknown, keys: string[]): unknown {
  if (value === null) return value;
  if (Array.isArray(value)) return value.map(v => redact(v, keys));
  if (typeof value !== 'object') return value;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (keys.includes(k)) {
      out[k] = '[REDACTED]';
      continue;
    }
    if (v !== null && typeof v === 'object') {
      out[k] = redact(v, keys);
    } else {
      out[k] = v;
    }
  }
  return out;
}

export class Logger {
  private level: LogLevel;
  private enabled: boolean;
  private redactKeys: string[];
  private base: Record<string, unknown>;
  private json: boolean;

  constructor(opts: LoggerOptions = {}) {
    // Obtain log level from environment safely (works in browser + node)
    interface GlobalWithProcess { process?: { env?: { LOG_LEVEL?: unknown } } }
    const globalObj: GlobalWithProcess = typeof globalThis !== 'undefined' ? (globalThis as GlobalWithProcess) : {};
    let envLevel: LogLevel | undefined;
    const rawLevel = typeof globalObj.process?.env?.LOG_LEVEL === 'string' ? globalObj.process?.env?.LOG_LEVEL : undefined;
    if (rawLevel === 'trace' || rawLevel === 'debug' || rawLevel === 'info' || rawLevel === 'warn' || rawLevel === 'error') {
      envLevel = rawLevel;
    }
    this.level = opts.level ?? envLevel ?? 'info';
    this.enabled = opts.enabled ?? true;
    this.redactKeys = opts.redactKeys ?? ['password', 'secret', 'token', 'apiKey'];
    this.base = opts.baseFields ?? {};
    this.json = opts.json ?? true;
  }

  child(extra: Record<string, unknown>): Logger {
    return new Logger({
      level: this.level,
      enabled: this.enabled,
      redactKeys: this.redactKeys,
      baseFields: { ...this.base, ...extra },
      json: this.json
    });
  }

  setLevel(level: LogLevel): void { this.level = level; }

  private emit(level: LogLevel, msg: string, data?: Record<string, unknown>): void {
    if (!this.enabled || !shouldLog(this.level, level)) return;
    const time = new Date().toISOString();
    const redacted = data ? redact(data, this.redactKeys) : undefined;
    const payload: Record<string, unknown> = { time, level, msg, ...this.base };
    if (redacted !== undefined && redacted !== null && typeof redacted === 'object' && !Array.isArray(redacted)) {
      Object.assign(payload, redacted as Record<string, unknown>);
    }
    if (this.json) {
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(payload));
    } else {
      // eslint-disable-next-line no-console
      console.log(`[${String(payload.time)}] ${level.toUpperCase()} ${msg}`, redacted ?? '');
    }
  }

  trace(msg: string, data?: Record<string, unknown>): void { this.emit('trace', msg, data); }
  debug(msg: string, data?: Record<string, unknown>): void { this.emit('debug', msg, data); }
  info(msg: string, data?: Record<string, unknown>): void { this.emit('info', msg, data); }
  warn(msg: string, data?: Record<string, unknown>): void { this.emit('warn', msg, data); }
  error(msg: string, data?: Record<string, unknown>): void { this.emit('error', msg, data); }
}

export const logger = new Logger();
