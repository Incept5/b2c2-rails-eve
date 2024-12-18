import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import knex, { Knex } from 'knex';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private knexInstance: Knex;
  private readonly logger = new Logger(DatabaseService.name);
  private readonly knexConfig: Knex.Config;

  constructor(
    private configService: ConfigService
  ) {
    this.knexConfig = this.configService.get('database');
    this.knexInstance = knex(this.knexConfig);
    
    this.logger.log('Database service initialized', {
      config: this.knexConfig,
      environment: process.env.NODE_ENV || 'dev'
    });
  }

  async onModuleInit() {
    try {
      this.logger.log('Starting database migrations');
      const [batchNo, log] = await this.knexInstance.migrate.latest();
      this.logger.log('Database migrations completed successfully', {
        batchNumber: batchNo,
        migrationsRun: log
      });
    } catch (error) {
      this.logger.error('Failed to run database migrations', error.stack);
      throw error;
    }
  }

  async onShutdown() {
    try {
      this.logger.log('Shutting down database connection');
      await this.knexInstance.destroy();
      this.logger.log('Database connection closed successfully');
    } catch (error) {
      this.logger.error('Error shutting down database connection', error.stack);
      throw error;
    }
  }

  get knex(): Knex {
    return this.knexInstance;
  }
}