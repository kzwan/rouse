import * as pg from 'pg';
import env from './env.js';
import logger from './logger.js';

const { Pool } = pg;
let pool: InstanceType<typeof Pool> | null = null;

interface QueryResult<T> extends pg.QueryResult {
  rows: T[];
}

// Initialize database connection
const initializeDatabase = async (): Promise<InstanceType<typeof Pool>> => {
  try {
    const config: pg.PoolConfig = {
      user: env.DB_USER,
      host: env.DB_HOST,
      database: env.DB_NAME,
      password: env.DB_PASSWORD,
      port: env.DB_PORT,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000
    };
    
    pool = new Pool(config);
    await pool.query('SELECT NOW()'); // Test connection
    logger.info('Database connection established');
    
    return pool;
  } catch (error) {
    logger.error({ error }, 'Failed to initialize database');
    throw error;
  }
};

// Basic query function
const query = async <T = any>(text: string, params: any[] = []): Promise<QueryResult<T>> => {
  if (!pool) {
    throw new Error('Database not initialized');
  }
  
  const start = Date.now();
  
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    logger.debug({
      query: text,
      duration,
      rows: result.rowCount
    }, 'Executed query');
    
    return result as QueryResult<T>;
  } catch (error) {
    logger.error({
      error,
      query: text,
      params
    }, 'Database query error');
    
    throw error;
  }
};

// Get the pool
export const getPool = (): InstanceType<typeof Pool> | null => pool;

export default {
  initializeDatabase,
  query,
  getPool
};