const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres.vybnycqsikeebevzxyzg:SatSuresh123$$@aws-0-us-west-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false },
});

const patterns = [
  'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f8fafc 100%)',
  'radial-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(145deg, #ffffff 0%, #f1f5f9 100%)',
  'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
  'linear-gradient(145deg, #fafaf9 0%, #f5f5f4 50%, #ffffff 100%)',
  'linear-gradient(135deg, #fff7ed 0%, #ffedd5 30%, #ffffff 100%)'
];

async function updateBanners() {
  try {
    const res = await pool.query('SELECT id FROM carousels ORDER BY display_order ASC, created_at ASC LIMIT 5');
    const ids = res.rows.map(r => r.id);
    
    for (let i = 0; i < ids.length; i++) {
      console.log(`Updating banner ${ids[i]} with pattern ${i + 1}...`);
      await pool.query('UPDATE carousels SET background_pattern = $1 WHERE id = $2', [patterns[i], ids[i]]);
    }
    console.log('Successfully updated 5 banners with patterns.');
  } catch (err) {
    console.error('Update failed:', err.message);
  } finally {
    await pool.end();
  }
}

updateBanners();
