const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgres://postgres.vybnycqsikeebevzxyzg:SatSuresh123$$@aws-0-us-west-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function addDisplayOrder() {
  try {
    await pool.query('ALTER TABLE carousels ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0');
    await pool.query('ALTER TABLE services ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0');
    console.log('Added display_order columns.');
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
addDisplayOrder();
