import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import * as path from 'path';

@Injectable()
export class LoggingService {
  private logger: winston.Logger;

  constructor() {
    const isTest = process.env.NODE_ENV === 'test';
    const logsDir = isTest ? 'logs/test' : 'logs';
    
    const humanReadableFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
        const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
        return `${timestamp} [${level.toUpperCase()}] [${context}] ${message}${metaStr}`;
      })
    );

    const fileTransport = new winston.transports.DailyRotateFile({
      dirname: path.join(__dirname, '../../../', logsDir),
      filename: 'application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: humanReadableFormat,
    });

    this.logger = winston.createLogger({
      level: 'info',
      format: humanReadableFormat,
      transports: [
        fileTransport,
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        }),
      ],
    });
  }

  info(context: string, message: string, meta?: any) {
    this.logger.info(message, { context, ...meta });
  }

  error(context: string, message: string, trace?: string, meta?: any) {
    this.logger.error(message, { context, trace, ...meta });
  }

  warn(context: string, message: string, meta?: any) {
    this.logger.warn(message, { context, ...meta });
  }

  debug(context: string, message: string, meta?: any) {
    this.logger.debug(message, { context, ...meta });
  }
}