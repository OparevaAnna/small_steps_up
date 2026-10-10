import fs from 'fs';
import path from 'path';
import pool from '../src/config/database';

async function runMigrations(): Promise<void> {
  console.log('Running migrations...');
  
  const migrationsDir = path.resolve(__dirname, '../migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();
  
  const client = await pool.connect();
  
  try {
    // Create migrations tracking table
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(256) UNIQUE NOT NULL,
        executed_at TIMESTAMPTZ DEFAULT now()
      )
    `);
    
    for (const file of files) {
      const { rowCount } = await client.query(
        'SELECT id FROM _migrations WHERE filename = $1',
        [file]
      );
      
      if (rowCount && rowCount > 0) {
        console.log(`  ↻ Skipped ${file} (already executed)`);
        continue;
      }
      
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
      
      try {
        await client.query(sql);
        await client.query(
          'INSERT INTO _migrations (filename) VALUES ($1)',
          [file]
        );
        console.log(`  ✓ Executed ${file}`);
      } catch (err) {
        const error = err as Error;
        console.error(`  ✗ Failed ${file}: ${error.message}`);
        throw err;
      }
    }
    
    console.log('All migrations completed successfully!');
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});