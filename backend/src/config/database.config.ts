import { registerAs } from '@nestjs/config';
import { Knex } from 'knex';
import * as path from 'path';

export const databaseConfig = registerAs('database', () => {
  const env = process.env.NODE_ENV || 'dev';
  
  const baseConfig: Knex.Config = {
    migrations: {
      directory: path.join(__dirname, '../migrations'),
      extension: 'js',
    },
  };

  const configs: Record<string, Knex.Config> = {
    test: {
      ...baseConfig,
      client: 'sqlite3',
      connection: ':memory:',
      useNullAsDefault: true,
    },
    dev: {
      ...baseConfig,
      client: 'sqlite3',
      connection: {
        filename: path.join(process.cwd(), '../../dev.sqlite3'),
      },
      useNullAsDefault: true,
    },
    prod: {
      ...baseConfig,
      client: 'pg',
      connection: {
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: 'postgres',
        database: 'postgres',
      },
    },
  };

  return configs[env] || configs.dev;
});