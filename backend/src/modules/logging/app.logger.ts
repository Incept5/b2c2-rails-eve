import { ConsoleLogger, LogLevel } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export class AppLogger extends ConsoleLogger {
  private fileLogger: fs.WriteStream;

  constructor() {
    // Set console to only show info and above
    super('AppLogger', {
      logLevels: ['error', 'warn', 'log']
    });

    // Create logs directory if it doesn't exist
    const logDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    // Create or append to app.log file
    this.fileLogger = fs.createWriteStream(
      path.join(logDir, 'app.log'),
      { flags: 'a' }
    );
  }

  private writeToFile(message: any, logLevel: string, context?: string) {
    const timestamp = new Date().toISOString();
    const contextMessage = context ? ` [${context}]` : '';
    this.fileLogger.write(
      `${timestamp} ${logLevel}${contextMessage}: ${message}\n`
    );
  }

  log(message: any, context?: string) {
    super.log(message, context);
    this.writeToFile(message, 'INFO', context);
  }

  error(message: any, stack?: string, context?: string) {
    super.error(message, stack, context);
    this.writeToFile(
      `${message}${stack ? `\n${stack}` : ''}`,
      'ERROR',
      context
    );
  }

  warn(message: any, context?: string) {
    super.warn(message, context);
    this.writeToFile(message, 'WARN', context);
  }

  debug(message: any, context?: string) {
    // Debug only goes to file, not console
    this.writeToFile(message, 'DEBUG', context);
  }

  verbose(message: any, context?: string) {
    // Verbose only goes to file, not console
    this.writeToFile(message, 'VERBOSE', context);
  }

  onApplicationShutdown() {
    return new Promise<void>((resolve) => {
      this.fileLogger.end(() => resolve());
    });
  }
}