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

  private writeToFile(message: any, logLevel: string, context?: string, meta?: any) {
    const timestamp = new Date().toISOString();
    const contextMessage = context ? ` [${context}]` : '';
    const formattedMessage = typeof message === 'string' ? message : JSON.stringify(message);
    const metaString = meta ? `\n${JSON.stringify(meta, null, 2)}` : '';
    
    this.fileLogger.write(
      `${timestamp} ${logLevel}${contextMessage}: ${formattedMessage}${metaString}\n`
    );
  }

  log(message: any, context?: string, meta?: any) {
    super.log(message, context);
    this.writeToFile(message, 'INFO', context, meta);
  }

  error(message: any, meta?: any, context?: string) {
    super.error(message, meta?.stack, context);
    this.writeToFile(message, 'ERROR', context, meta);
  }

  warn(message: any, context?: string, meta?: any) {
    super.warn(message, context);
    this.writeToFile(message, 'WARN', context, meta);
  }

  debug(message: any, context?: string, meta?: any) {
    // Debug only goes to file, not console
    this.writeToFile(message, 'DEBUG', context, meta);
  }

  verbose(message: any, context?: string, meta?: any) {
    // Verbose only goes to file, not console
    this.writeToFile(message, 'VERBOSE', context, meta);
  }

  onApplicationShutdown() {
    return new Promise<void>((resolve) => {
      this.fileLogger.end(() => resolve());
    });
  }
}