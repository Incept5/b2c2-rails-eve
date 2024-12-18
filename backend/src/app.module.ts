import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MonitoringModule } from './modules/monitoring/monitoring.module';
import { DatabaseModule } from './modules/database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    MonitoringModule,
  ]
})
export class AppModule {}
