import Knex from 'knex';
import { Model } from 'objection';
import { logger } from '@/utils/logger';

const knexConfig = {
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'bhramann',
    password: process.env.DB_PASSWORD || 'Summerof69@',
    database: process.env.DB_NAME || 'hotel_pms',
    charset: 'utf8mb4',
    timezone: 'UTC'
  },
  pool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 100
  },
  migrations: {
    directory: './src/database/migrations',
    extension: 'ts'
  },
  seeds: {
    directory: './src/database/seeds',
    extension: 'ts'
  },
  debug: process.env.NODE_ENV === 'development'
};

const knex = Knex(knexConfig);

export async function connectDatabase() {
  try {
    logger.info('Attempting database connection:', {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || '3306',
      user: process.env.DB_USER || 'root',
      database: process.env.DB_NAME || 'hotel_pms'
    });
    
    // Test the connection
    await knex.raw('SELECT 1');
    
    // Initialize Objection.js with Knex
    Model.knex(knex);
    
    logger.info('Database connection established successfully');
    
    // Run pending migrations in production
    if (process.env.NODE_ENV === 'production') {
      await knex.migrate.latest();
      logger.info('Database migrations completed');
    }
    
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
}

export { knex };
export default knex;