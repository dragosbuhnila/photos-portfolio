import Database from 'better-sqlite3';
import path from 'path';
import type { Photo, ResumeEntry } from '@/types/portfolio';

const DB_PATH = path.join(process.cwd(), 'db', 'portfolio.db');

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH, { readonly: true });
    _db.pragma('journal_mode = WAL');
  }
  return _db;
}

export function getFeaturedPhotos(): Photo[] {
  const db = getDb();
  return db
    .prepare(`
      SELECT 
        p.*,
        (SELECT COUNT(*) FROM photos p2 WHERE p2.project_slug = p.project_slug) AS project_total
      FROM photos p 
      WHERE p.is_featured = 1 
      ORDER BY p.project_slug, p.display_order
    `)
    .all() as Photo[];
}

export function getAllPhotos(): Photo[] {
  const db = getDb();
  return db
    .prepare(`
      SELECT 
        p.*,
        (SELECT COUNT(*) FROM photos p2 WHERE p2.project_slug = p.project_slug) AS project_total
      FROM photos p 
      ORDER BY p.project_slug, p.display_order
    `)
    .all() as Photo[];
}

export function getResumeEntries(): ResumeEntry[] {
  const db = getDb();
  return db
    .prepare('SELECT * FROM resume_entries ORDER BY section, display_order')
    .all() as ResumeEntry[];
}
