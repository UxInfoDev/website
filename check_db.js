require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgres://postgres.vybnycqsikeebevzxyzg:SatSuresh123$$@aws-0-us-west-2.pooler.supabase.com:5432/postgres', ssl: { rejectUnauthorized: false } });

pool.query("SELECT id, title, image FROM carousels;")
  .then(res => { console.log(res.rows); pool.end(); })
  .catch(err => { console.error(err); pool.end(); });
