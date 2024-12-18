import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppLogger } from './modules/logging/app.logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  
  // Set up custom logger
  const logger = app.get(AppLogger);
  app.useLogger(logger);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
