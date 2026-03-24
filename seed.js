require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgres://postgres.vybnycqsikeebevzxyzg:SatSuresh123$$@aws-0-us-west-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function seed() {
  try {
    console.log('Clearing existing data...');
    await pool.query('DELETE FROM projects');
    await pool.query('DELETE FROM services');

    console.log('Inserting projects...');
    await pool.query(`
      INSERT INTO projects (title, category, image, status, description) VALUES
      ('E-Commerce Platform', 'web-development', '/images/project-01.jpg', 'completed', 'Full-featured e-commerce platform with payment integration'),
      ('Mobile Banking App', 'mobile', '/images/project-02.jpg', 'completed', 'Secure banking application for iOS and Android'),
      ('SaaS Dashboard', 'web-development', '/images/project-03.jpg', 'in-progress', 'Analytics dashboard for enterprise SaaS product'),
      ('Travel Booking App', 'mobile', '/images/project-04.jpg', 'pending', 'Cross-platform travel booking and management app'),
      ('Fitness Tracking App', 'mobile', '/images/project-06.jpg', 'pending', 'Health and fitness tracking application')
    `);

    console.log('Inserting services...');
    await pool.query(`
      INSERT INTO services (title, description, icon, image) VALUES
      ('Web Development', 'We build responsive, fast, and scalable web applications.', 'FaLaptopCode', '/images/service-01.jpg'),
      ('Mobile Development', 'Native and cross-platform mobile apps for iOS and Android.', 'FaMobileAlt', '/images/service-02.jpg'),
      ('UI/UX Design', 'Beautiful, intuitive user interfaces that engage users.', 'FaPaintBrush', '/images/service-03.jpg'),
      ('Cloud Hosting', 'Reliable, scalable cloud infrastructure and deployment.', 'FaCloud', '/images/service-04.jpg'),
      ('SEO Optimization', 'Improve your search rankings and drive more organic traffic.', 'FaSearch', '/images/service-05.jpg')
    `);

    console.log('Database seeded successfully!');
  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    await pool.end();
  }
}

seed();
