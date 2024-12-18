import { Controller, Get, Post } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';

@Controller('api/monitoring')
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get('health')
  getHealth() {
    return this.monitoringService.getHealth();
  }

  @Post('shutdown')
  shutdown() {
    return this.monitoringService.shutdown();
  }
}