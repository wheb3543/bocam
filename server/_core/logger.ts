/**
 * Custom Logger Utility
 *
 * نظام تسجيل مخصص يدعم مستويات مختلفة من التسجيل
 * مع إمكانية التحكم عبر environment variables
 * ويدعم تنسيق JSON للـ structured logging
 *
 * @module logger
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4,
}

interface LogEntry {
  timestamp: string;
  level: string;
  prefix?: string;
  message: string;
  args?: unknown[];
  environment?: string;
  service?: string;
}

class Logger {
  private level: LogLevel;
  private prefix: string;
  private useJsonFormat: boolean;
  private service: string;

  constructor(prefix: string = '') {
    this.prefix = prefix;
    this.level = this.getLogLevelFromEnv();
    this.useJsonFormat = process.env.LOG_FORMAT === 'json';
    this.service = process.env.SERVICE_NAME || 'bocam-server';
  }

  private getLogLevelFromEnv(): LogLevel {
    const envLevel = process.env.LOG_LEVEL?.toUpperCase();
    switch (envLevel) {
      case 'DEBUG':
        return LogLevel.DEBUG;
      case 'INFO':
        return LogLevel.INFO;
      case 'WARN':
        return LogLevel.WARN;
      case 'ERROR':
        return LogLevel.ERROR;
      case 'SILENT':
        return LogLevel.SILENT;
      default:
        // في development، نستخدم INFO
        // في production، نستخدم WARN
        return process.env.NODE_ENV === 'production' ? LogLevel.WARN : LogLevel.INFO;
    }
  }

  private formatMessage(level: string, message: string, ..._args: unknown[]): string {
    const timestamp = new Date().toISOString();
    const prefix = this.prefix ? `[${this.prefix}]` : '';
    return `${timestamp} ${prefix} [${level}] ${message}`;
  }

  private formatLogEntry(level: string, message: string, ...args: unknown[]): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      prefix: this.prefix || undefined,
      message,
      args: args.length > 0 ? args : undefined,
      environment: process.env.NODE_ENV,
      service: this.service,
    };
  }

  private log(level: string, logLevel: LogLevel, message: string, ...args: unknown[]): void {
    if (this.level <= logLevel) {
      if (this.useJsonFormat) {
        const entry = this.formatLogEntry(level, message, ...args);
        // eslint-disable-next-line no-console
        console.log(JSON.stringify(entry));
      } else {
        // eslint-disable-next-line no-console
        console.log(this.formatMessage(level, message), ...args);
      }
    }
  }

  debug(message: string, ...args: unknown[]): void {
    this.log('DEBUG', LogLevel.DEBUG, message, ...args);
  }

  info(message: string, ...args: unknown[]): void {
    this.log('INFO', LogLevel.INFO, message, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.useJsonFormat) {
      const entry = this.formatLogEntry('WARN', message, ...args);
      console.warn(JSON.stringify(entry));
    } else {
      console.warn(this.formatMessage('WARN', message), ...args);
    }
  }

  error(message: string, ...args: unknown[]): void {
    if (this.useJsonFormat) {
      const entry = this.formatLogEntry('ERROR', message, ...args);
      console.error(JSON.stringify(entry));
    } else {
      console.error(this.formatMessage('ERROR', message), ...args);
    }
  }

  // اختصارات للإيموجي الشائعة
  heartbeat(message: string, ...args: unknown[]): void {
    this.info(`💓 ${message}`, ...args);
  }

  security(message: string, ...args: unknown[]): void {
    this.error(`🚨 ${message}`, ...args);
  }

  success(message: string, ...args: unknown[]): void {
    this.info(`✅ ${message}`, ...args);
  }

  infoWithIcon(icon: string, message: string, ...args: unknown[]): void {
    this.info(`${icon} ${message}`, ...args);
  }
}

/**
 * إنشاء logger instance جديد مع prefix مخصص
 */
export function createLogger(prefix: string): Logger {
  return new Logger(prefix);
}

/**
 * Logger عام بدون prefix
 */
export const logger = new Logger();
