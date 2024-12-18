import { Injectable } from '@nestjs/common';

@Injectable()
export class MonitoringService {
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  shutdown() {
    setTimeout(() => {
      process.exit(0);
    }, 100);
    return { message: 'Application shutdown initiated' };
  }
}