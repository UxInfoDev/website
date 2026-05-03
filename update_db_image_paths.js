const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgres://postgres.vybnycqsikeebevzxyzg:SatSuresh123$$@aws-0-us-west-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function updatePaths() {
  try {
    const res = await pool.query('SELECT id, image FROM services');
    for (const row of res.rows) {
      if (row.image && row.image.startsWith('/images/services/')) {
        const newPath = row.image.replace('/images/services/', '/uploads/services/');
        await pool.query('UPDATE services SET image = $1 WHERE id = $2', [newPath, row.id]);
        console.log(`Updated ID ${row.id}: ${newPath}`);
      }
    }
    console.log('Database image paths updated to use /uploads/');
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
updatePaths();
