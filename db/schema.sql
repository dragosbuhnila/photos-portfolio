CREATE TABLE IF NOT EXISTS photos (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  project_slug  TEXT    NOT NULL,
  file_name     TEXT    NOT NULL,
  title         TEXT,
  image_path    TEXT    NOT NULL,
  is_featured   BOOLEAN NOT NULL DEFAULT 0,
  display_order INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS resume_entries (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  section       TEXT    NOT NULL,
  title         TEXT    NOT NULL,
  organization  TEXT    NOT NULL,
  period        TEXT    NOT NULL,
  display_order INTEGER NOT NULL
);
