import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import knex, { Knex } from 'knex';
import { LoggingService } from '../logging/logging.service';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private knexInstance: Knex;
  private readonly context = 'DatabaseService';

  constructor(
    private configService: ConfigService,
    private logger: LoggingService
  ) {
    const dbConfig = this.configService.get('database');
    this.knexInstance = knex(dbConfig);
    
    this.logger.info(this.context, 'Database service initialized', {
      client: dbConfig.client,
      migrationsDir: dbConfig.migrations.directory,
      environment: process.env.NODE_ENV || 'dev'
    });
  }

  async onModuleInit() {
    try {
      const dbConfig = this.configService.get('database');
      this.logger.info(this.context, 'Starting database migrations', {
        migrationsDir: dbConfig.migrations.directory,
        extension: dbConfig.migrations.extension
      });
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