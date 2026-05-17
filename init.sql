CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    image VARCHAR(255),
    status VARCHAR(50) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    website_link VARCHAR(255),
    slug VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    short_description TEXT,
    description TEXT,
    icon VARCHAR(100),
    image VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    slug VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inquiries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS carousels (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image VARCHAR(255),
    cta_text VARCHAR(100),
    cta_link VARCHAR(255),
    cta_alt VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS team (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    bio TEXT,
    image VARCHAR(255),
    linkedin VARCHAR(255),
    twitter VARCHAR(255),
    github VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    site_name VARCHAR(255),
    site_description TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    facebook_url VARCHAR(255),
    twitter_url VARCHAR(255),
    linkedin_url VARCHAR(255),
    youtube_url VARCHAR(255),
    logo_url VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add columns if upgrading from older schema
ALTER TABLE settings ADD COLUMN IF NOT EXISTS logo_url VARCHAR(255);
ALTER TABLE settings ADD COLUMN IF NOT EXISTS favicon_url VARCHAR(255);
ALTER TABLE settings ADD COLUMN IF NOT EXISTS banner_rotation_speed INTEGER DEFAULT 10000;
ALTER TABLE services ADD COLUMN IF NOT EXISTS short_description TEXT;

-- Add short_description column to services if upgrading from older schema
ALTER TABLE services ADD COLUMN IF NOT EXISTS short_description VARCHAR(500);

INSERT INTO settings (id, site_name, site_description, phone, email, address, facebook_url, twitter_url, linkedin_url, youtube_url)
SELECT 1, 'UX Infotech', 'UX Design & Web Development Agency', '+91 98765 43210', 'hello@uxinfotech.com', 'Ahmedabad, Gujarat, India', '#', '#', '#', '#'
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE id = 1);

-- Add is_active and website_link columns to projects if upgrading from older schema
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS website_link VARCHAR(255);

-- Add is_active column to carousels if upgrading from older schema
ALTER TABLE carousels ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Add subtitle column to carousels for the tagline above banner title
ALTER TABLE carousels ADD COLUMN IF NOT EXISTS subtitle VARCHAR(255);

-- Add display_order columns for reordering functionality
    ALTER TABLE carousels ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
    ALTER TABLE carousels ADD COLUMN IF NOT EXISTS background_pattern TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Media Library: standalone image management
CREATE TABLE IF NOT EXISTS media_library (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    url VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100),
    size_bytes INTEGER,
    width INTEGER,
    height INTEGER,
    alt_text VARCHAR(500),
    folder VARCHAR(255) DEFAULT 'Uncategorized',
    tags TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for fast filtering
CREATE INDEX IF NOT EXISTS idx_media_folder ON media_library(folder);
CREATE INDEX IF NOT EXISTS idx_media_created ON media_library(created_at DESC);

-- Template system: store the active template ID
ALTER TABLE settings ADD COLUMN IF NOT EXISTS active_template VARCHAR(50) DEFAULT 'default';
