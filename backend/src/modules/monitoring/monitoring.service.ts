import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);

  constructor() {
    this.logger.log('Monitoring service initialized');
  }

  getHealth() {
    this.logger.log('Health check requested');
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
    this.logger.log('Health check response', health);
    return health;
  }
}