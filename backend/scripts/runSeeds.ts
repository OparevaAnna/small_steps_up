import fs from 'fs';
import path from 'path';
import pool from '../src/config/database';

async function runSeeds(): Promise<void> {
  console.log('Running seeds...');
  
  const seedsDir = path.resolve(__dirname, '../seeds');
  const files = fs.readdirSync(seedsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();
  
  const client = await pool.connect();
  
  try {
    for (const file of files) {
      const sql = fs.readFileSync(path.join(seedsDir, file), 'utf-8');
      
      try {
        await client.query(sql);
        console.log(`  ✓ Seeded ${file}`);
      } catch (err) {
        const error = err as Error;
        console.error(`  ⚠ Seed ${file}: ${error.message} (continuing)`);
      }
    }
    
    console.log('All seeds completed!');
  } finally {
    client.release();
    await pool.end();
  }
}

runSeeds().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});