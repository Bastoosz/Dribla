type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: any;
  userId?: string;
  endpoint?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private log(level: LogLevel, message: string, context?: any) {
    const entry: LogEntry = {
      timestamp: this.formatTimestamp(),
      level,
      message,
      context,
    };

    if (this.isDevelopment) {
      const color = {
        info: '\x1b[36m',
        warn: '\x1b[33m',
        error: '\x1b[31m',
        debug: '\x1b[35m',
      }[level];
      const reset = '\x1b[0m';
      
      console.log(`${color}[${entry.timestamp}] [${level.toUpperCase()}]${reset} ${message}`);
      if (context) {
        console.log(context);
      }
    } else {
      console.log(JSON.stringify(entry));
    }
  }

  info(message: string, context?: any) {
    this.log('info', message, context);
  }

  warn(message: string, context?: any) {
    this.log('warn', message, context);
  }

  error(message: string, context?: any) {
    this.log('error', message, context);
  }

  debug(message: string, context?: any) {
    if (this.isDevelopment) {
      this.log('debug', message, context);
    }
  }

  api(endpoint: string, method: string, userId?: string, statusCode?: number, duration?: number) {
    this.info(`API ${method} ${endpoint}`, {
      endpoint,
      method,
      userId,
      statusCode,
      duration: duration ? `${duration}ms` : undefined,
    });
  }
}

export const logger = new Logger();
