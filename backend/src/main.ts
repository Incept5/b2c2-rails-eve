import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppLogger } from './modules/logging/app.logger';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';
import { join } from 'path';
import { SwaggerService } from './modules/swagger/swagger.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });
  
  // Set up custom logger
  const logger = app.get(AppLogger);
  app.useLogger(logger);

  // Set up API prefix for all backend routes
  app.setGlobalPrefix('api');

  // Set up Swagger documentation
  const swaggerService = app.get(SwaggerService);
  swaggerService.setup(app);

  // Serve static frontend files
  const frontendPath = join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendPath));

  // Handle frontend routing - serve index.html for non-API routes
  app.use('*', (req, res, next) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(join(frontendPath, 'index.html'));
    } else {
      next();
    }
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
