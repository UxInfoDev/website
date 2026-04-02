require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from public/uploads
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Setup multer for physical path storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Promisify multer callback middleware so we can await it in async handlers
function runUpload(middleware, req, res) {
  return new Promise((resolve, reject) => {
    middleware(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

// Construct connect string
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres.vybnycqsikeebevzxyzg:SatSuresh123$$@aws-0-us-west-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Initialize DB schema automatically
const initDb = async () => {
    try {
        const sql = fs.readFileSync(path.join(__dirname, 'init.sql')).toString();
        await pool.query(sql);
        console.log('Database initialized successfully.');
    } catch (err) {
        console.error('Error initializing database', err);
    }
};
initDb();

// Projects API -----------------------------------------
app.get('/api/projects', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/projects/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    await runUpload(upload.single('image'), req, res);
    const { title, category, status, description } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    const result = await pool.query(
      'INSERT INTO projects (title, category, image, status, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, category, imagePath, status, description]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/projects/:id', async (req, res) => {
  try {
    await runUpload(upload.single('image'), req, res);
    const { id } = req.params;
    const { title, category, status, description } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    if (imagePath) {
      const result = await pool.query(
        'UPDATE projects SET title = $1, category = $2, image = $3, status = $4, description = $5 WHERE id = $6 RETURNING *',
        [title, category, imagePath, status, description, id]
      );
      res.json(result.rows[0]);
    } else {
      const result = await pool.query(
        'UPDATE projects SET title = $1, category = $2, status = $3, description = $4 WHERE id = $5 RETURNING *',
        [title, category, status, description, id]
      );
      res.json(result.rows[0]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/projects/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM projects WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Services API -----------------------------------------
app.get('/api/services', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM services ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/services/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM services WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/services', async (req, res) => {
  try {
    await runUpload(upload.single('image'), req, res);
    const { title, description, short_description, icon } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    const result = await pool.query(
      'INSERT INTO services (title, description, short_description, icon, image) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, description, short_description || null, icon, imagePath]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/services/:id', async (req, res) => {
  try {
    await runUpload(upload.single('image'), req, res);
    const { id } = req.params;
    const { title, description, short_description, icon } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    if (imagePath) {
      const result = await pool.query(
        'UPDATE services SET title = $1, description = $2, short_description = $3, icon = $4, image = $5 WHERE id = $6 RETURNING *',
        [title, description, short_description || null, icon, imagePath, id]
      );
      res.json(result.rows[0]);
    } else {
      const result = await pool.query(
        'UPDATE services SET title = $1, description = $2, short_description = $3, icon = $4 WHERE id = $5 RETURNING *',
        [title, description, short_description || null, icon, id]
      );
      res.json(result.rows[0]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/services/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM services WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Inquiries API -----------------------------------------
app.get('/api/inquiries', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inquiries ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/inquiries', async (req, res) => {
  const { name, email, subject, message } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO inquiries (name, email, subject, message) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, subject, message]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/inquiries/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE inquiries SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/inquiries/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM inquiries WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Banners API -----------------------------------------
app.get('/api/banners', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM carousels ORDER BY created_at ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/banners', async (req, res) => {
  try {
    await runUpload(upload.single('image'), req, res);
    const { title, description, cta_text, cta_link, cta_alt } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    const result = await pool.query(
      'INSERT INTO carousels (title, description, image, cta_text, cta_link, cta_alt) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, description, imagePath, cta_text, cta_link, cta_alt]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/banners/:id', async (req, res) => {
  try {
    await runUpload(upload.single('image'), req, res);
    const { id } = req.params;
    const { title, description, cta_text, cta_link, cta_alt } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    if (imagePath) {
      const result = await pool.query(
        'UPDATE carousels SET title = $1, description = $2, image = $3, cta_text = $4, cta_link = $5, cta_alt = $6 WHERE id = $7 RETURNING *',
        [title, description, imagePath, cta_text, cta_link, cta_alt, id]
      );
      res.json(result.rows[0]);
    } else {
      const result = await pool.query(
        'UPDATE carousels SET title = $1, description = $2, cta_text = $3, cta_link = $4, cta_alt = $5 WHERE id = $6 RETURNING *',
        [title, description, cta_text, cta_link, cta_alt, id]
      );
      res.json(result.rows[0]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/banners/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM carousels WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Team API -----------------------------------------
app.get('/api/team', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM team ORDER BY created_at ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/team', async (req, res) => {
  try {
    await runUpload(upload.single('image'), req, res);
    const { name, role, bio, linkedin, twitter, github } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    const result = await pool.query(
      'INSERT INTO team (name, role, bio, image, linkedin, twitter, github) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [name, role, bio, imagePath, linkedin, twitter, github]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/team/:id', async (req, res) => {
  try {
    await runUpload(upload.single('image'), req, res);
    const { id } = req.params;
    const { name, role, bio, linkedin, twitter, github } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    if (imagePath) {
      const result = await pool.query(
        'UPDATE team SET name = $1, role = $2, bio = $3, image = $4, linkedin = $5, twitter = $6, github = $7 WHERE id = $8 RETURNING *',
        [name, role, bio, imagePath, linkedin, twitter, github, id]
      );
      res.json(result.rows[0]);
    } else {
      const result = await pool.query(
        'UPDATE team SET name = $1, role = $2, bio = $3, linkedin = $4, twitter = $5, github = $6 WHERE id = $7 RETURNING *',
        [name, role, bio, linkedin, twitter, github, id]
      );
      res.json(result.rows[0]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/team/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM team WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Settings API -----------------------------------------
app.get('/api/settings', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM settings WHERE id = 1');
    res.json(result.rows[0] || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    await runUpload(upload.single('logo'), req, res);
    const { site_name, site_description, phone, email, address, facebook_url, twitter_url, linkedin_url, youtube_url } = req.body;
    const logoPath = req.file ? `/uploads/${req.file.filename}` : null;
    let result;
    if (logoPath) {
      result = await pool.query(
        `INSERT INTO settings (id, site_name, site_description, phone, email, address, facebook_url, twitter_url, linkedin_url, youtube_url, logo_url, updated_at)
         VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO UPDATE SET
           site_name = $1, site_description = $2, phone = $3, email = $4, address = $5,
           facebook_url = $6, twitter_url = $7, linkedin_url = $8, youtube_url = $9,
           logo_url = $10, updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [site_name, site_description, phone, email, address, facebook_url, twitter_url, linkedin_url, youtube_url, logoPath]
      );
    } else {
      result = await pool.query(
        `INSERT INTO settings (id, site_name, site_description, phone, email, address, facebook_url, twitter_url, linkedin_url, youtube_url, updated_at)
         VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO UPDATE SET
           site_name = $1, site_description = $2, phone = $3, email = $4, address = $5,
           facebook_url = $6, twitter_url = $7, linkedin_url = $8, youtube_url = $9,
           updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [site_name, site_description, phone, email, address, facebook_url, twitter_url, linkedin_url, youtube_url]
      );
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Settings PUT error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve Production React SPA Bundles
const frontendDist = path.join(__dirname, 'dist');
const adminDist = path.join(__dirname, 'dist-admin');

// 1. Serve Admin Assets
app.use('/admin', express.static(adminDist));

// 2. Admin Catch-all (must be before frontend catch-all)
app.get(/^\/admin(\/.*)?$/, (req, res) => {
  const adminHtml = path.join(adminDist, 'admin.html');
  if (fs.existsSync(adminHtml)) {
    res.sendFile(adminHtml);
  } else {
    res.status(404).send('Admin dashboard not found. Please run npm run build');
  }
});

// 3. Serve Frontend Assets
app.use(express.static(frontendDist));

// 4. Frontend Catch-all
app.get('/{*path}', (req, res) => {
  const indexHtml = path.join(frontendDist, 'index.html');
  if (fs.existsSync(indexHtml)) {
    res.sendFile(indexHtml);
  } else {
    res.status(404).send('Frontend application not found. Please run npm run build');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
