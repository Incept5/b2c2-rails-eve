import { Controller, Get } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('api/monitoring')
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Public()
  @Get('health')
  getHealth() {
    return this.monitoringService.getHealth();
  }
}