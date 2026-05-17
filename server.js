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
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w-]+/g, '')   // Remove all non-word chars
    .replace(/--+/g, '-');    // Replace multiple - with single -
};

const app = express();

// Security and Optimization Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());
app.use(morgan('combined'));

app.use(cors());
app.use(express.json());

// Serve static files from public/uploads
const uploadDir = path.resolve(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Debug middleware for uploads - LOCAL ONLY
app.use('/uploads', (req, res, next) => {
  const filePath = path.join(uploadDir, req.url);
  if (fs.existsSync(filePath)) {
    // console.log(`[DEBUG] Serving image: ${filePath}`);
  } else {
    console.warn(`[DEBUG] Image NOT FOUND: ${filePath}`);
  }
  next();
});

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

// Auth API -----------------------------------------
// Credentials come from environment variables — never hardcoded in frontend
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const adminEmail    = process.env.ADMIN_EMAIL    || 'admin@uxinfotech.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'SatSuresh123$$';

  if (email === adminEmail && password === adminPassword) {
    // Simple token — in production replace with a proper JWT library
    const token = 'admin-session-' + Date.now();
    return res.json({ token, email: adminEmail });
  }
  return res.status(401).json({ error: 'Invalid email or password' });
});

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

app.get('/api/projects/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const isId = /^\d+$/.test(idOrSlug);
    const query = isId ? 'SELECT * FROM projects WHERE id = $1' : 'SELECT * FROM projects WHERE slug = $1';
    const result = await pool.query(query, [isId ? parseInt(idOrSlug) : idOrSlug]);
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
    const slug = slugify(title);
    const result = await pool.query(
      'INSERT INTO projects (title, category, image, status, description, is_active, website_link, slug) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [title, category, imagePath, status, description, isActive, website_link, slug]
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
    const slug = slugify(title);
    if (imagePath) {
      const result = await pool.query(
        'UPDATE projects SET title = $1, category = $2, image = $3, status = $4, description = $5, is_active = $6, website_link = $7, slug = $8 WHERE id = $9 RETURNING *',
        [title, category, imagePath, status, description, isActive, website_link, slug, id]
      );
      res.json(result.rows[0]);
    } else {
      const result = await pool.query(
        'UPDATE projects SET title = $1, category = $2, status = $3, description = $4, is_active = $5, website_link = $6, slug = $7 WHERE id = $8 RETURNING *',
        [title, category, status, description, isActive, website_link, slug, id]
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

app.get('/api/services/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const isId = /^\d+$/.test(idOrSlug);
    const query = isId ? 'SELECT * FROM services WHERE id = $1' : 'SELECT * FROM services WHERE slug = $1';
    const result = await pool.query(query, [isId ? parseInt(idOrSlug) : idOrSlug]);
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
    const slug = slugify(title);
    const result = await pool.query(
      'INSERT INTO services (title, short_description, description, icon, image, display_order, slug) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [title, short_description, description, icon, imagePath, display_order || 0, slug]
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
    const slug = slugify(title);
    if (imagePath) {
      const result = await pool.query(
        'UPDATE services SET title = $1, short_description = $2, description = $3, icon = $4, image = $5, display_order = $6, slug = $7 WHERE id = $8 RETURNING *',
        [title, short_description, description, icon, imagePath, display_order || 0, slug, id]
      );
      res.json(result.rows[0]);
    } else {
      const result = await pool.query(
        'UPDATE services SET title = $1, short_description = $2, description = $3, icon = $4, display_order = $5, slug = $6 WHERE id = $7 RETURNING *',
        [title, short_description, description, icon, display_order || 0, slug, id]
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
    const { title, subtitle, description, cta_text, cta_link, cta_alt, is_active, display_order, background_pattern } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    const result = await pool.query(
      'INSERT INTO carousels (title, subtitle, description, image, cta_text, cta_link, cta_alt, is_active, display_order, background_pattern) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [title, subtitle || '', description, imagePath, cta_text, cta_link, cta_alt, is_active !== 'false', display_order || 0, background_pattern || null]
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
    const { title, subtitle, description, cta_text, cta_link, cta_alt, is_active, display_order, background_pattern } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    if (imagePath) {
      const result = await pool.query(
        'UPDATE carousels SET title = $1, subtitle = $2, description = $3, image = $4, cta_text = $5, cta_link = $6, cta_alt = $7, is_active = $8, display_order = $9, background_pattern = $10 WHERE id = $11 RETURNING *',
        [title, subtitle || '', description, imagePath, cta_text, cta_link, cta_alt, is_active !== 'false', display_order || 0, background_pattern || null, id]
      );
      res.json(result.rows[0]);
    } else {
      const result = await pool.query(
        'UPDATE carousels SET title = $1, subtitle = $2, description = $3, cta_text = $4, cta_link = $5, cta_alt = $6, is_active = $7, display_order = $8, background_pattern = $9 WHERE id = $10 RETURNING *',
        [title, subtitle || '', description, cta_text, cta_link, cta_alt, is_active !== 'false', display_order || 0, background_pattern || null, id]
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

    const { site_name, site_description, phone, email, address, facebook_url, twitter_url, linkedin_url, youtube_url, banner_rotation_speed, active_template } = req.body;
    
    // Helper to convert file to Base64
    const fileToBase64 = (file) => {
      if (!file) return null;
      const data = fs.readFileSync(file.path);
      return `data:${file.mimetype};base64,${data.toString('base64')}`;
    };

    let logoData = null;
    if (req.files?.['logo']) {
      logoData = fileToBase64(req.files['logo'][0]);
    }
    
    let faviconData = null;
    if (req.files?.['favicon']) {
      faviconData = fileToBase64(req.files['favicon'][0]);
      
      // Also keep legacy file sync for root fevicon.png fallback
      try {
        const file = req.files['favicon'][0];
        const targetName = 'fevicon.png';
        const publicDir = path.join(__dirname, 'public');
        if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
        
        fs.copyFileSync(file.path, path.join(publicDir, targetName));
        const distDir = path.join(__dirname, 'dist');
        if (fs.existsSync(distDir)) fs.copyFileSync(file.path, path.join(distDir, targetName));
        fs.copyFileSync(file.path, path.join(__dirname, targetName));
      } catch (fErr) {
        console.error('Favicon legacy sync error:', fErr);
      }
    }
    
    const rotationSpeed = banner_rotation_speed ? parseInt(banner_rotation_speed) : 10000;
    const templateId = active_template || current?.active_template || 'default';

    const currentSettingsRes = await pool.query('SELECT * FROM settings WHERE id = 1');
    const current = currentSettingsRes.rows[0] || {};

    const finalLogo = logoData || current.logo_url;
    const finalFavicon = faviconData || current.favicon_url;

    const result = await pool.query(
      `INSERT INTO settings (id, site_name, site_description, phone, email, address, facebook_url, twitter_url, linkedin_url, youtube_url, logo_url, favicon_url, banner_rotation_speed, active_template, updated_at)
       VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE SET
         site_name = $1, site_description = $2, phone = $3, email = $4, address = $5,
         facebook_url = $6, twitter_url = $7, linkedin_url = $8, youtube_url = $9,
         logo_url = $10, favicon_url = $11, banner_rotation_speed = $12, active_template = $13, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [site_name, site_description, phone, email, address, facebook_url, twitter_url, linkedin_url, youtube_url, finalLogo, finalFavicon, rotationSpeed, templateId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Settings PUT error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── Media Library API ─────────────────────────────────────────────────────────

// Multer instance specifically for media uploads (accept images only)
const mediaStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, unique + path.extname(file.originalname).toLowerCase());
  }
});
const mediaUpload = multer({
  storage: mediaStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB per file
  fileFilter: (req, file, cb) => {
    if (/^image\//i.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  }
});

// GET /api/media – list images (with optional folder, search, pagination)
app.get('/api/media', async (req, res) => {
  try {
    const { folder, search, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conditions = [];
    const values = [];

    if (folder && folder !== 'all') {
      conditions.push(`folder = $${values.length + 1}`);
      values.push(folder);
    }
    if (search) {
      conditions.push(`(original_name ILIKE $${values.length + 1} OR alt_text ILIKE $${values.length + 1} OR tags ILIKE $${values.length + 1})`);
      values.push(`%${search}%`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countResult = await pool.query(`SELECT COUNT(*) FROM media_library ${where}`, values);
    const total = parseInt(countResult.rows[0].count);

    values.push(parseInt(limit), offset);
    const result = await pool.query(
      `SELECT * FROM media_library ${where} ORDER BY created_at DESC LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values
    );

    // Also return distinct folders
    const foldersResult = await pool.query(
      `SELECT DISTINCT folder FROM media_library ORDER BY folder ASC`
    );

    res.json({
      items: result.rows,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      folders: foldersResult.rows.map(r => r.folder)
    });
  } catch (err) {
    console.error('Media GET error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/media/upload – upload one or more images
app.post('/api/media/upload', (req, res) => {
  mediaUpload.array('images', 20)(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    try {
      const folder = req.body.folder || 'Uncategorized';
      const inserted = [];

      for (const file of req.files) {
        const url = `/uploads/${file.filename}`;
        const result = await pool.query(
          `INSERT INTO media_library (filename, original_name, url, mime_type, size_bytes, folder)
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
          [file.filename, file.originalname, url, file.mimetype, file.size, folder]
        );
        inserted.push(result.rows[0]);
      }

      res.json({ uploaded: inserted.length, items: inserted });
    } catch (err) {
      console.error('Media upload DB error:', err);
      res.status(500).json({ error: 'Failed to save media metadata' });
    }
  });
});

// PATCH /api/media/:id – update alt_text, tags, or move to folder
app.patch('/api/media/:id', async (req, res) => {
  const { id } = req.params;
  const { alt_text, tags, folder } = req.body;
  try {
    const result = await pool.query(
      `UPDATE media_library
       SET alt_text = COALESCE($1, alt_text),
           tags     = COALESCE($2, tags),
           folder   = COALESCE($3, folder),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 RETURNING *`,
      [alt_text ?? null, tags ?? null, folder ?? null, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Media PATCH error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/media/:id – delete record and physical file
app.delete('/api/media/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM media_library WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });

    const filePath = path.join(uploadDir, result.rows[0].filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Media DELETE error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/media (bulk) – delete multiple items
app.delete('/api/media', async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'ids array required' });
  }
  try {
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');
    const result = await pool.query(
      `DELETE FROM media_library WHERE id IN (${placeholders}) RETURNING *`,
      ids
    );
    for (const row of result.rows) {
      const filePath = path.join(uploadDir, row.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    res.json({ deleted: result.rows.length });
  } catch (err) {
    console.error('Media bulk DELETE error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/media/bulk/move – bulk move to folder
app.patch('/api/media/bulk/move', async (req, res) => {
  const { ids, folder } = req.body;
  if (!Array.isArray(ids) || !folder) {
    return res.status(400).json({ error: 'ids and folder required' });
  }
  try {
    const placeholders = ids.map((_, i) => `$${i + 2}`).join(',');
    await pool.query(
      `UPDATE media_library SET folder = $1, updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`,
      [folder, ...ids]
    );
    res.json({ moved: ids.length });
  } catch (err) {
    console.error('Media bulk MOVE error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── End Media Library API ─────────────────────────────────────────────────────


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
      pool.query('SELECT id, slug, created_at FROM services ORDER BY display_order ASC'),
      pool.query('SELECT id, slug, created_at FROM projects ORDER BY created_at DESC')
    ]);

    const baseUrl = process.env.BASE_URL || 'https://uxinfotech.com';
    const now = new Date().toISOString();

    let xml = '<?xml version="1.0" encoding="UTF-8"?>';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">';
    
    // Core Static Pages
    xml += `<url><loc>${baseUrl}/</loc><lastmod>${now}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>`;
    xml += `<url><loc>${baseUrl}/services</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>`;
    xml += `<url><loc>${baseUrl}/search</loc><changefreq>monthly</changefreq><priority>0.3</priority></url>`;

    // Dynamic Service Pages
    services.rows.forEach(s => {
      const lastmod = s.created_at ? new Date(s.created_at).toISOString() : now;
      const slug = s.slug || s.id;
      xml += `<url><loc>${baseUrl}/service/${slug}</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`;
    });

    // Dynamic Project Pages
    projects.rows.forEach(p => {
      const lastmod = p.created_at ? new Date(p.created_at).toISOString() : now;
      const slug = p.slug || p.id;
      xml += `<url><loc>${baseUrl}/project/${slug}</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`;
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

// 4. Frontend Catch-all - Use middleware to avoid Express 5 regex issues
app.use((req, res, next) => {
  // Only handle GET requests that didn't match previous routes
  if (req.method !== 'GET') return next();
  
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
