import { LoggerService } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export class TestLogger implements LoggerService {
  private logStream: fs.WriteStream;

  constructor() {
    const logDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    this.logStream = fs.createWriteStream(path.join(logDir, 'test.log'), { flags: 'a' });
  }

  private writeLog(message: any, context?: string) {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` [${context}]` : '';
    this.logStream.write(`${timestamp}${contextStr}: ${message}\n`);
  }

  log(message: any, context?: string) {
    this.writeLog(message, context);
  }

  error(message: any, trace?: string, context?: string) {
    this.writeLog(`ERROR: ${message}${trace ? `\n${trace}` : ''}`, context);
  }

  warn(message: any, context?: string) {
    this.writeLog(`WARN: ${message}`, context);
  }

  debug(message: any, context?: string) {
    this.writeLog(`DEBUG: ${message}`, context);
  }

  verbose(message: any, context?: string) {
    this.writeLog(`VERBOSE: ${message}`, context);
  }

  close() {
    return new Promise<void>((resolve) => {
      this.logStream.end(() => {
        resolve();
      });
    });
  }
}