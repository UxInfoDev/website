require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgres://postgres.vybnycqsikeebevzxyzg:SatSuresh123$$@aws-0-us-west-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false },
});

async function migrate() {
  try {
    console.log('Changing settings columns to TEXT...');
    await pool.query('ALTER TABLE settings ALTER COLUMN logo_url TYPE TEXT');
    await pool.query('ALTER TABLE settings ALTER COLUMN favicon_url TYPE TEXT');
    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

migrate();
