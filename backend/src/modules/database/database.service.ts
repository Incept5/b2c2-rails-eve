import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import knex, { Knex } from 'knex';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private knexInstance: Knex;

  constructor(private configService: ConfigService) {
    this.knexInstance = knex(this.configService.get('database'));
  }

  async onModuleInit() {
    // Run migrations on startup
    await this.knexInstance.migrate.latest();
  }

  async onShutdown() {
    await this.knexInstance.destroy();
  }

  get knex(): Knex {
    return this.knexInstance;
  }
}