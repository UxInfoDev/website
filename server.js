require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// Security and Optimization Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for local development / dynamic scripts
  crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.use(morgan('combined'));

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
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Dedicated upload handler for settings logo: keep original filename
const logoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const logoUpload = multer({ storage: logoStorage });

// Promisify multer callback middleware so we can await it in async handlers
function runUpload(middleware, req, res) {
  return new Promise((resolve, reject) => {
    middleware(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

// Database connection - use explicit credentials (Supabase pooler)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres.vybnycqsikeebevzxyzg:SatSuresh123$$@aws-0-us-west-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false },
  max: 3,                    // Small pool size for Supabase PgBouncer compatibility
  idleTimeoutMillis: 10000,  // Close idle connections after 10s (before Supabase times them out)
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  // Log but don't crash - pool will create new connections automatically
  console.error('DB pool idle client error (auto-recovering):', err.message);
});

// Initialize DB schema automatically
const initDb = async () => {
    try {
        const sql = fs.readFileSync(path.join(__dirname, 'init.sql')).toString();
        await pool.query(sql);
        console.log('Database initialized successfully.');
    } catch (err) {
        // Schema init errors are non-fatal (tables may already exist)
        console.error('DB schema init warning (non-fatal):', err.message);
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
    const { title, category, status, description, is_active, website_link } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    const isActive = is_active === 'false' ? false : true;
    const result = await pool.query(
      'INSERT INTO projects (title, category, image, status, description, is_active, website_link) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [title, category, imagePath, status, description, isActive, website_link]
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
    const { title, category, status, description, is_active, website_link } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    const isActive = is_active === 'false' ? false : true;
    if (imagePath) {
      const result = await pool.query(
        'UPDATE projects SET title = $1, category = $2, image = $3, status = $4, description = $5, is_active = $6, website_link = $7 WHERE id = $8 RETURNING *',
        [title, category, imagePath, status, description, isActive, website_link, id]
      );
      res.json(result.rows[0]);
    } else {
      const result = await pool.query(
        'UPDATE projects SET title = $1, category = $2, status = $3, description = $4, is_active = $5, website_link = $6 WHERE id = $7 RETURNING *',
        [title, category, status, description, isActive, website_link, id]
      );
      res.json(result.rows[0]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/api/projects/:id/toggle-active', async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;
  try {
    const result = await pool.query(
      'UPDATE projects SET is_active = $1 WHERE id = $2 RETURNING *',
      [is_active, id]
    );
    res.json(result.rows[0]);
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
    const result = await pool.query('SELECT * FROM services ORDER BY display_order ASC, created_at DESC');
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
    const { title, short_description, description, icon, display_order } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    const result = await pool.query(
      'INSERT INTO services (title, short_description, description, icon, image, display_order) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, short_description, description, icon, imagePath, display_order || 0]
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
    const { title, short_description, description, icon, display_order } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    if (imagePath) {
      const result = await pool.query(
        'UPDATE services SET title = $1, short_description = $2, description = $3, icon = $4, image = $5, display_order = $6 WHERE id = $7 RETURNING *',
        [title, short_description, description, icon, imagePath, display_order || 0, id]
      );
      res.json(result.rows[0]);
    } else {
      const result = await pool.query(
        'UPDATE services SET title = $1, short_description = $2, description = $3, icon = $4, display_order = $5 WHERE id = $6 RETURNING *',
        [title, short_description, description, icon, display_order || 0, id]
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

app.post('/api/services/reorder', async (req, res) => {
  const { items } = req.body; // Array of { id, display_order }
  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const item of items) {
        await client.query('UPDATE services SET display_order = $1 WHERE id = $2', [item.display_order, item.id]);
      }
      await client.query('COMMIT');
      res.json({ success: true });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
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
    let query = 'SELECT * FROM carousels';
    if (req.query.active === 'true') {
      query += ' WHERE is_active = true';
    }
    query += ' ORDER BY display_order ASC, created_at ASC';
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/banners', async (req, res) => {
  try {
    await runUpload(upload.single('image'), req, res);
    const { title, subtitle, description, cta_text, cta_link, cta_alt, is_active, display_order } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    const result = await pool.query(
      'INSERT INTO carousels (title, subtitle, description, image, cta_text, cta_link, cta_alt, is_active, display_order) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [title, subtitle || '', description, imagePath, cta_text, cta_link, cta_alt, is_active !== 'false', display_order || 0]
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
    const { title, subtitle, description, cta_text, cta_link, cta_alt, is_active, display_order } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    if (imagePath) {
      const result = await pool.query(
        'UPDATE carousels SET title = $1, subtitle = $2, description = $3, image = $4, cta_text = $5, cta_link = $6, cta_alt = $7, is_active = $8, display_order = $9 WHERE id = $10 RETURNING *',
        [title, subtitle || '', description, imagePath, cta_text, cta_link, cta_alt, is_active !== 'false', display_order || 0, id]
      );
      res.json(result.rows[0]);
    } else {
      const result = await pool.query(
        'UPDATE carousels SET title = $1, subtitle = $2, description = $3, cta_text = $4, cta_link = $5, cta_alt = $6, is_active = $7, display_order = $8 WHERE id = $9 RETURNING *',
        [title, subtitle || '', description, cta_text, cta_link, cta_alt, is_active !== 'false', display_order || 0, id]
      );
      res.json(result.rows[0]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/api/banners/:id/toggle-active', async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;
  try {
    const result = await pool.query(
      'UPDATE carousels SET is_active = $1 WHERE id = $2 RETURNING *',
      [is_active, id]
    );
    res.json(result.rows[0]);
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

app.post('/api/banners/reorder', async (req, res) => {
  const { items } = req.body; // Array of { id, display_order }
  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const item of items) {
        await client.query('UPDATE carousels SET display_order = $1 WHERE id = $2', [item.display_order, item.id]);
      }
      await client.query('COMMIT');
      res.json({ success: true });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
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
    await runUpload(logoUpload.fields([
      { name: 'logo', maxCount: 1 },
      { name: 'favicon', maxCount: 1 }
    ]), req, res);

    const { site_name, site_description, phone, email, address, facebook_url, twitter_url, linkedin_url, youtube_url, banner_rotation_speed } = req.body;
    
    // Extract file paths from req.files
    const logoPath = req.files?.['logo'] ? `/uploads/${req.files['logo'][0].filename}` : null;
    
    // Special handling for Favicon: always save as favicon.png in root
    let faviconPath = null;
    if (req.files?.['favicon']) {
      const file = req.files['favicon'][0];
      const targetName = 'favicon.png';
      
      // Copy to public folder (for dev/consistency)
      const publicPath = path.join(__dirname, 'public', targetName);
      fs.copyFileSync(file.path, publicPath);
      
      // Copy to dist folder (for production serving)
      const distPath = path.join(__dirname, 'dist', targetName);
      if (fs.existsSync(path.join(__dirname, 'dist'))) {
        fs.copyFileSync(file.path, distPath);
      }
      
      faviconPath = `/${targetName}`;
    }
    
    // Ensure banner_rotation_speed is a valid integer or null
    const rotationSpeed = banner_rotation_speed ? parseInt(banner_rotation_speed) : 10000;

    // Build the query dynamically or handle cases
    const currentSettingsRes = await pool.query('SELECT * FROM settings WHERE id = 1');
    const current = currentSettingsRes.rows[0] || {};

    const finalLogo = logoPath || current.logo_url;
    const finalFavicon = faviconPath || current.favicon_url;

    const result = await pool.query(
      `INSERT INTO settings (id, site_name, site_description, phone, email, address, facebook_url, twitter_url, linkedin_url, youtube_url, logo_url, favicon_url, banner_rotation_speed, updated_at)
       VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE SET
         site_name = $1, site_description = $2, phone = $3, email = $4, address = $5,
         facebook_url = $6, twitter_url = $7, linkedin_url = $8, youtube_url = $9,
         logo_url = $10, favicon_url = $11, banner_rotation_speed = $12, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [site_name, site_description, phone, email, address, facebook_url, twitter_url, linkedin_url, youtube_url, finalLogo, finalFavicon, rotationSpeed]
    );

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

// 3. Dynamic Sitemap for SEO
app.get('/sitemap.xml', async (req, res) => {
  try {
    const [services, projects] = await Promise.all([
      pool.query('SELECT id, updated_at FROM services ORDER BY display_order ASC'),
      pool.query('SELECT id, updated_at FROM projects ORDER BY created_at DESC')
    ]);

    const baseUrl = process.env.BASE_URL || 'https://uxinfotech.com';
    const now = new Date().toISOString();

    let xml = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    xml += `<url><loc>${baseUrl}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>`;
    xml += `<url><loc>${baseUrl}/services</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`;
    xml += `<url><loc>${baseUrl}/search</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>`;

    services.rows.forEach(s => {
      const lastmod = s.updated_at ? new Date(s.updated_at).toISOString() : now;
      xml += `<url><loc>${baseUrl}/service/${s.id}</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`;
    });

    projects.rows.forEach(p => {
      const lastmod = p.updated_at ? new Date(p.updated_at).toISOString() : now;
      xml += `<url><loc>${baseUrl}/project/${p.id}</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`;
    });

    xml += '</urlset>';
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    console.error('Sitemap generation error:', err);
    res.status(500).send('Error generating sitemap');
  }
});

// 4. Serve Frontend Assets
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

// 5. Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
