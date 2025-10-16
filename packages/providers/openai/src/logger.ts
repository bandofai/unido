/**
 * Logger utility for OpenAI MCP Server
 * Configurable verbosity via UNIDO_LOG_LEVEL environment variable
 */

export type LogLevel = 'silent' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

interface LoggerOptions {
  level?: LogLevel;
  prefix?: string;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  silent: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5,
};

export class Logger {
  private level: LogLevel;
  private numericLevel: number;
  private prefix: string;

  constructor(options: LoggerOptions = {}) {
    // Default to 'info', can be overridden by env var or options
    const envLevel = (process.env.UNIDO_LOG_LEVEL?.toLowerCase() || 'info') as LogLevel;
    this.level = options.level || envLevel;
    this.numericLevel = LOG_LEVELS[this.level] ?? LOG_LEVELS.info;
    this.prefix = options.prefix || '[unido]';
  }

  /**
   * Check if a log level should be output
   */
  private shouldLog(level: LogLevel): boolean {
    return this.numericLevel >= LOG_LEVELS[level];
  }

  /**
   * Format timestamp for logs
   */
  private timestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Format log message with metadata
   */
  private format(level: string, message: string, meta?: Record<string, unknown>): string {
    const parts = [this.timestamp(), this.prefix, `[${level.toUpperCase()}]`, message];

    if (meta && Object.keys(meta).length > 0) {
      parts.push(JSON.stringify(meta));
    }

    return parts.join(' ');
  }

  /**
   * Log error messages (always shown unless silent)
   */
  error(message: string, error?: Error | unknown, meta?: Record<string, unknown>): void {
    if (!this.shouldLog('error')) return;

    const fullMeta = { ...meta };
    if (error instanceof Error) {
      fullMeta.error = {
        message: error.message,
        stack: error.stack,
        name: error.name,
      };
    } else if (error) {
      fullMeta.error = String(error);
    }

    console.error(this.format('error', message, fullMeta));
  }

  /**
   * Log warning messages
   */
  warn(message: string, meta?: Record<string, unknown>): void {
    if (!this.shouldLog('warn')) return;
    console.warn(this.format('warn', message, meta));
  }

  /**
   * Log informational messages (default level)
   */
  info(message: string, meta?: Record<string, unknown>): void {
    if (!this.shouldLog('info')) return;
    console.log(this.format('info', message, meta));
  }

  /**
   * Log debug messages (verbose)
   */
  debug(message: string, meta?: Record<string, unknown>): void {
    if (!this.shouldLog('debug')) return;
    console.log(this.format('debug', message, meta));
  }

  /**
   * Log trace messages (very verbose)
   */
  trace(message: string, meta?: Record<string, unknown>): void {
    if (!this.shouldLog('trace')) return;
    console.log(this.format('trace', message, meta));
  }

  /**
   * Create a child logger with additional prefix
   */
  child(prefix: string): Logger {
    return new Logger({
      level: this.level,
      prefix: `${this.prefix}:${prefix}`,
    });
  }

  /**
   * Get current log level
   */
  getLevel(): LogLevel {
    return this.level;
  }

  /**
   * Set log level dynamically
   */
  setLevel(level: LogLevel): void {
    this.level = level;
    this.numericLevel = LOG_LEVELS[level] ?? LOG_LEVELS.info;
  }
}

/**
 * Default logger instance
 */
export const defaultLogger = new Logger({ prefix: '[unido:openai]' });

/**
 * Create a new logger instance
 */
export function createLogger(options?: LoggerOptions): Logger {
  return new Logger(options);
}
