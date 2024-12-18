import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AppLogger } from './app.logger';

@Injectable()
export class RequestLoggerInterceptor implements NestInterceptor {
  constructor(private readonly logger: AppLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url, body } = req;
    const startTime = Date.now();

    this.logger.debug(`[REQUEST] ${method} ${url}`, 'RequestLogger', {
      body: body || {},
      headers: req.headers,
    });

    return next.handle().pipe(
      tap({
        next: (data) => {
          const responseTime = Date.now() - startTime;
          this.logger.debug(`[RESPONSE] ${method} ${url} - ${responseTime}ms`, 'RequestLogger', {
            response: data,
          });
        },
        error: (error) => {
          const responseTime = Date.now() - startTime;
          this.logger.error(
            `[ERROR] ${method} ${url} - ${responseTime}ms - ${error.message}`,
            {
              error: error,
              stack: error.stack,
            },
            'RequestLogger'
          );
        },
      }),
    );
  }
}