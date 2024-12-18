import { Global, Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';
import { databaseConfig } from '../../config/database.config';
import { DatabaseService } from './database.service';
import { Knex } from 'knex';

@Global()
@Module({
  imports: [ConfigModule.forFeature(databaseConfig)],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule implements OnApplicationShutdown {
  constructor(private moduleRef: ModuleRef) {}

  async onApplicationShutdown() {
    const dbService = this.moduleRef.get(DatabaseService);
    await dbService.onShutdown();
  }
}