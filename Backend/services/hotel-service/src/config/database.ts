import knex from 'knex';
import * as path from 'path';

// Database configuration
const config = {
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hotel_pms',
    charset: 'utf8mb4',
    timezone: 'UTC'
  },
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: path.join(__dirname, '../../../src/database/migrations'),
    extension: 'ts'
  },
  seeds: {
    directory: path.join(__dirname, '../../../src/database/seeds'),
    extension: 'ts'
  }
};

// Create database instance
export const db = knex(config);

// Test database connection
export const testConnection = async (): Promise<boolean> => {
  try {
    await db.raw('SELECT 1');
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
};

// Close database connection
export const closeConnection = async (): Promise<void> => {
  await db.destroy();
};

export default db;