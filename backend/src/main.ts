import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppLogger } from './modules/logging/app.logger';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';
import { join } from 'path';
import { SwaggerService } from './modules/swagger/swagger.service';
import { RequestLoggerInterceptor } from './modules/logging/request-logger.interceptor';
import { GlobalValidationPipe } from './modules/validation/validation.pipe';
import { GlobalExceptionFilter } from './modules/error/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  // Enable CORS for all origins
  app.enableCors({
    origin: true, // Allow all origins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  
  // Set up custom logger
  const logger = app.get(AppLogger);
  app.useLogger(logger);

  // Set up global request logger interceptor
  app.useGlobalInterceptors(new RequestLoggerInterceptor(logger));

  // Set up global validation pipe
  app.useGlobalPipes(new GlobalValidationPipe());

  // Set up global error filter
  app.useGlobalFilters(new GlobalExceptionFilter(logger));

  // Set up Swagger documentation
  const swaggerService = app.get(SwaggerService);
  swaggerService.setup(app);

  // Serve static frontend files
  const frontendPath = join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendPath));

  // Define all API routes first (Nest controllers handle /api internally)
  // After that, define a fallback route for non-API:
  app.use((req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      // Let Nest handle this as an API route
      logger.log(`API request: ${req.method} ${req.originalUrl}`, 'Router', { url: req.originalUrl, method: req.method });
      return next();
    }
    // Else serve the frontend
    logger.log(`Frontend request: ${req.method} ${req.originalUrl}`, 'Router', { url: req.originalUrl, method: req.method });
    res.sendFile(join(frontendPath, 'index.html'));
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`, 'Bootstrap', { port });
}
bootstrap();
