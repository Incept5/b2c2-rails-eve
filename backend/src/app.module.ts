import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MonitoringModule } from './modules/monitoring/monitoring.module';
import { DatabaseModule } from './modules/database/database.module';
import { LoggingModule } from './modules/logging/logging.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConditionalAuthGuard } from './modules/auth/guards/conditional-auth.guard';
import { SwaggerModule } from './modules/swagger/swagger.module';
import { authConfig } from './config/auth.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
      load: [authConfig],
    }),
    LoggingModule,
    DatabaseModule,
    MonitoringModule,
    AuthModule,
    SwaggerModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ConditionalAuthGuard,
    },
  ],
})
export class AppModule {}
