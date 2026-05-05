require('dotenv').config();
const { Pool } = require('pg');

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres.vybnycqsikeebevzxyzg:SatSuresh123$$@aws-0-us-west-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false },
});

async function migrate() {
  try {
    console.log('Adding slug columns...');
    await pool.query('ALTER TABLE projects ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE');
    await pool.query('ALTER TABLE services ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE');

    console.log('Migrating projects...');
    const projects = await pool.query('SELECT id, title FROM projects');
    for (const p of projects.rows) {
      const slug = slugify(p.title);
      await pool.query('UPDATE projects SET slug = $1 WHERE id = $2', [slug, p.id]);
      console.log(`Updated project ${p.id} with slug: ${slug}`);
    }

    console.log('Migrating services...');
    const services = await pool.query('SELECT id, title FROM services');
    for (const s of services.rows) {
      const slug = slugify(s.title);
      await pool.query('UPDATE services SET slug = $1 WHERE id = $2', [slug, s.id]);
      console.log(`Updated service ${s.id} with slug: ${slug}`);
    }

    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

migrate();
