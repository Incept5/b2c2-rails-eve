import { Injectable } from '@nestjs/common';
import { LoggingService } from '../logging/logging.service';

@Injectable()
export class MonitoringService {
  private readonly context = 'MonitoringService';

  constructor(private logger: LoggingService) {
    this.logger.info(this.context, 'Monitoring service initialized');
  }

  getHealth() {
    this.logger.info(this.context, 'Health check requested');
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
    this.logger.info(this.context, 'Health check response', health);
    return health;
  }

  shutdown() {
    this.logger.info(this.context, 'Application shutdown requested');
    setTimeout(() => {
      this.logger.info(this.context, 'Executing application shutdown');
      process.exit(0);
    }, 100);
    return { message: 'Application shutdown initiated' };
  }
}