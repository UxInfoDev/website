require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres.vybnycqsikeebevzxyzg:SatSuresh123$$@aws-0-us-west-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false },
});

async function check() {
  try {
    console.log('Checking projects...');
    const projects = await pool.query('SELECT id, title, image FROM projects');
    projects.rows.forEach(p => {
      if (p.image && p.image.startsWith('http')) {
        console.log(`Project ${p.id} has absolute image: ${p.image}`);
      }
    });

    console.log('Checking services...');
    const services = await pool.query('SELECT id, title, image FROM services');
    services.rows.forEach(s => {
      if (s.image && s.image.startsWith('http')) {
        console.log(`Service ${s.id} has absolute image: ${s.image}`);
      }
    });

    console.log('Checking settings...');
    const settings = await pool.query('SELECT logo_url, favicon_url FROM settings');
    settings.rows.forEach(s => {
      if (s.logo_url && s.logo_url.startsWith('http')) {
        console.log(`Logo has absolute URL: ${s.logo_url}`);
      }
      if (s.favicon_url && s.favicon_url.startsWith('http')) {
        console.log(`Favicon has absolute URL: ${s.favicon_url}`);
      }
    });

    console.log('Check completed.');
  } catch (err) {
    console.error('Check failed:', err);
  } finally {
    await pool.end();
  }
}

check();
