import { registerAs } from '@nestjs/config';
import { Knex } from 'knex';
import * as path from 'path';

export const databaseConfig = registerAs('database', () => {
  const env = process.env.NODE_ENV || 'dev';
  
  const configs: Record<string, Knex.Config> = {
    test: {
      client: 'pg',
      connection: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'fullstack_starter',
      },
      migrations: {
        directory: path.join(__dirname, '../migrations'),
        extension: 'ts',
      },
      pool: {
        min: 2,
        max: 10,
      },
    },
    dev: {
      client: 'pg',
      connection: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'fullstack_starter',
      },
      migrations: {
        directory: path.join(__dirname, '../migrations'),
        extension: 'js',
      },
      pool: {
        min: 2,
        max: 10,
      },
    },
    prod: {
      client: 'pg',
      connection: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'fullstack_starter',
      },
      migrations: {
        directory: path.join(__dirname, '../migrations'),
        extension: 'js',
      },
      pool: {
        min: 2,
        max: 10,
      },
    },
  };

  return configs[env] || configs.dev;
});
