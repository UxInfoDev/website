const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgres://postgres.vybnycqsikeebevzxyzg:SatSuresh123$$@aws-0-us-west-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false },
});

async function check() {
  try {
    const res = await pool.query('SELECT title, image FROM services LIMIT 10');
    console.log('SERVICES_ROWS:' + JSON.stringify(res.rows));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
check();
