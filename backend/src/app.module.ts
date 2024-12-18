import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MonitoringModule } from './modules/monitoring/monitoring.module';

@Module({
  imports: [MonitoringModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
