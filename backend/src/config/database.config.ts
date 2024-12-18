import { registerAs } from '@nestjs/config';
import { Knex } from 'knex';
import * as path from 'path';

export const databaseConfig = registerAs('database', () => {
  const env = process.env.NODE_ENV || 'dev';
  
  const configs: Record<string, Knex.Config> = {
    test: {
      client: 'sqlite3',
      connection: ':memory:',
      useNullAsDefault: true,
      migrations: {
        directory: path.join(__dirname, '../migrations'),
        extension: 'ts',
      },
    },
    dev: {
      client: 'sqlite3',
      connection: {
        filename: path.join(process.cwd(), '../../dev.sqlite3'),
      },
      useNullAsDefault: true,
      migrations: {
        directory: path.join(__dirname, '../migrations'),
        extension: 'js',
      },
    },
    prod: {
      client: 'pg',
      connection: {
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: 'postgres',
        database: 'postgres',
      },
      migrations: {
        directory: path.join(__dirname, '../migrations'),
        extension: 'js',
      },
    },
  };

  return configs[env] || configs.dev;
});