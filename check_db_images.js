const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgres://postgres.vybnycqsikeebevzxyzg:SatSuresh123$$@aws-0-us-west-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

pool.query('SELECT id, title, image FROM services').then(r => {
  console.table(r.rows);
  pool.end();
}).catch(e => {
  console.error(e);
  pool.end();
});
