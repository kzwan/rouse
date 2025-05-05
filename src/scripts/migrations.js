// src/scripts/migrations.js
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Get current filename and directory when using ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

// Create a database connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

// Table to track migrations
const MIGRATIONS_TABLE = 'schema_migrations';

async function initialize() {
  console.log('Initializing migrations table...');
  
  // Create migrations table if it doesn't exist
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

async function getMigrationsToRun() {
  // Get list of migrations that have been applied
  const result = await pool.query(`SELECT name FROM ${MIGRATIONS_TABLE} ORDER BY id`);
  const appliedMigrations = new Set(result.rows.map(row => row.name));
  
  // Get list of migration files
  const migrationsDir = path.join(__dirname, 'migrations');
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort(); // Sort to ensure they run in order
  
  // Return files that haven't been applied yet
  return migrationFiles.filter(file => !appliedMigrations.has(file));
}

async function runMigration(filename) {
  console.log(`Running migration: ${filename}`);
  
  const migrationsDir = path.join(__dirname, 'migrations');
  const filePath = path.join(migrationsDir, filename);
  const sql = fs.readFileSync(filePath, 'utf8');
  
  // Start a transaction
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Run the migration script
    await client.query(sql);
    
    // Record the migration
    await client.query(
      `INSERT INTO ${MIGRATIONS_TABLE} (name) VALUES ($1)`,
      [filename]
    );
    
    await client.query('COMMIT');
    console.log(`Migration ${filename} completed successfully`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`Error in migration ${filename}:`, error);
    throw error;
  } finally {
    client.release();
  }
}

async function runMigrations() {
  try {
    // Initialize migrations table
    await initialize();
    
    // Get migrations that need to be run
    const pendingMigrations = await getMigrationsToRun();
    
    if (pendingMigrations.length === 0) {
      console.log('No pending migrations to run');
      return;
    }
    
    console.log(`Found ${pendingMigrations.length} migrations to run`);
    
    // Run each migration in order
    for (const migration of pendingMigrations) {
      await runMigration(migration);
    }
    
    console.log('All migrations completed successfully');
  } finally {
    await pool.end();
  }
}

// Run the migrations
runMigrations().catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
});