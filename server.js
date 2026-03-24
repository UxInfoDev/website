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

// Construct connect string
const pool = new Pool({
  connectionString: 'postgres://postgres.vybnycqsikeebevzxyzg:SatSuresh123$$@aws-0-us-west-2.pooler.supabase.com:5432/postgres',
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
app.get('/projects', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/projects', upload.single('image'), async (req, res) => {
  const { title, category, status, description } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
  
  try {
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

app.put('/projects/:id', upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const { title, category, status, description } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
  
  try {
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

app.delete('/projects/:id', async (req, res) => {
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
app.get('/services', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM services ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/services', upload.single('image'), async (req, res) => {
  const { title, description, icon } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
  
  try {
    const result = await pool.query(
      'INSERT INTO services (title, description, icon, image) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, description, icon, imagePath]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/services/:id', upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const { title, description, icon } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
  
  try {
    if (imagePath) {
      const result = await pool.query(
        'UPDATE services SET title = $1, description = $2, icon = $3, image = $4 WHERE id = $5 RETURNING *',
        [title, description, icon, imagePath, id]
      );
      res.json(result.rows[0]);
    } else {
      const result = await pool.query(
        'UPDATE services SET title = $1, description = $2, icon = $3 WHERE id = $4 RETURNING *',
        [title, description, icon, id]
      );
      res.json(result.rows[0]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/services/:id', async (req, res) => {
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
app.get('/inquiries', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inquiries ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/inquiries', async (req, res) => {
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

app.put('/inquiries/:id', async (req, res) => {
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

app.delete('/inquiries/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM inquiries WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
