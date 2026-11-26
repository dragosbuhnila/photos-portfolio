PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS site_settings (
  id                    INTEGER PRIMARY KEY CHECK (id = 1),
  name                  TEXT NOT NULL DEFAULT '',
  email                 TEXT NOT NULL DEFAULT '',
  location              TEXT NOT NULL DEFAULT '',
  available_for_travel  TEXT NOT NULL DEFAULT '',
  copyright_year        TEXT NOT NULL DEFAULT '2026',
  bio                   TEXT NOT NULL DEFAULT '[]',
  nav_links             TEXT NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS social_links (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  label         TEXT NOT NULL,
  handle        TEXT,
  url           TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS projects (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  slug          TEXT UNIQUE NOT NULL,
  title         TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS photos (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  project_slug   TEXT    NOT NULL,
  file_name      TEXT    NOT NULL,
  title          TEXT,
  image_path     TEXT    NOT NULL,
  is_featured    BOOLEAN NOT NULL DEFAULT 0,
  display_order  INTEGER NOT NULL DEFAULT 0,
  featured_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS resume_entries (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  section       TEXT    NOT NULL,
  title         TEXT    NOT NULL,
  organization  TEXT    NOT NULL,
  period        TEXT    NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS admin_auth (
  id            INTEGER PRIMARY KEY CHECK (id = 1),
  salt          TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_photos_project_slug ON photos(project_slug);
CREATE INDEX IF NOT EXISTS idx_photos_featured ON photos(is_featured);
CREATE INDEX IF NOT EXISTS idx_photos_featured_order ON photos(is_featured, featured_order);
CREATE INDEX IF NOT EXISTS idx_photos_order ON photos(project_slug, display_order);
CREATE INDEX IF NOT EXISTS idx_projects_order ON projects(display_order);
CREATE INDEX IF NOT EXISTS idx_resume_order ON resume_entries(section, display_order);
CREATE INDEX IF NOT EXISTS idx_social_order ON social_links(display_order);
