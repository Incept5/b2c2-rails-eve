import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import knex, { Knex } from 'knex';
import { LoggingService } from '../logging/logging.service';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private knexInstance: Knex;
  private readonly context = 'DatabaseService';
  private readonly knexConfig: Knex.Config;

  constructor(
    private configService: ConfigService,
    private logger: LoggingService
  ) {
    this.knexConfig = this.configService.get('database');
    this.knexInstance = knex(this.knexConfig);
    
    this.logger.info(this.context, 'Database service initialized', {
      config: this.knexConfig,
      environment: process.env.NODE_ENV || 'dev'
    });
  }

  async onModuleInit() {
    try {
      this.logger.info(this.context, 'Starting database migrations')
      const [batchNo, log] = await this.knexInstance.migrate.latest();
      this.logger.info(this.context, 'Database migrations completed successfully', {
        batchNumber: batchNo,
        migrationsRun: log
      });
    } catch (error) {
      this.logger.error(this.context, 'Failed to run database migrations', error.stack);
      throw error;
    }
  }

  async onShutdown() {
    try {
      this.logger.info(this.context, 'Shutting down database connection');
      await this.knexInstance.destroy();
      this.logger.info(this.context, 'Database connection closed successfully');
    } catch (error) {
      this.logger.error(this.context, 'Error shutting down database connection', error.stack);
      throw error;
    }
  }

  get knex(): Knex {
    return this.knexInstance;
  }
}