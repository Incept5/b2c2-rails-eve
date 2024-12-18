import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppLogger } from './modules/logging/app.logger';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';
import { join } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('The API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  
  // Serve Swagger documentation at /api/docs
  SwaggerModule.setup('api/docs', app, document);
  
  // Serve OpenAPI documentation
  SwaggerModule.setup('api/docs', app, document, {
    jsonDocumentUrl: '/api/docs-json',
    yamlDocumentUrl: '/api/docs-yaml'
  });

  // Serve static frontend files
  const frontendPath = join(__dirname, '../../frontend/build');
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
