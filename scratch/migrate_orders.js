require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL || 'postgres://postgres.vybnycqsikeebevzxyzg:SatSuresh123$$@aws-0-us-west-2.pooler.supabase.com:5432/postgres', 
  ssl: { rejectUnauthorized: false } 
});

async function run() {
  try {
    console.log('Migrating display_order columns...');
    await pool.query('ALTER TABLE projects ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;');
    console.log('Added display_order to projects');
    await pool.query('ALTER TABLE team ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;');
    console.log('Added display_order to team');
    console.log('Schema migration successful!');
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    await pool.end();
  }
}

run();
