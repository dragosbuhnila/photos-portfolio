import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { createZipBuffer, collectDirectoryFiles, ZipEntry } from './zip';
import type {
  Photo,
  ResumeEntry,
  OwnerInfo,
  SocialLink,
  NavLink,
  ContentData,
} from '@/types/portfolio';

const DB_PATH = path.join(process.cwd(), 'db', 'portfolio.db');

let _db: Database.Database | null = null;
let _cleanupRegistered = false;

export function closeDb(): void {
  if (_db && _db.open) {
    try {
      _db.pragma('wal_checkpoint(TRUNCATE)');
      _db.close();
    } catch {
      // ignore
    }
    _db = null;
  }
}

function registerCleanup(): void {
  if (_cleanupRegistered) return;
  _cleanupRegistered = true;

  process.on('exit', () => closeDb());
  process.on('SIGINT', () => {
    closeDb();
    process.exit(0);
  });
  process.on('SIGTERM', () => {
    closeDb();
    process.exit(0);
  });
}

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma('journal_mode = WAL');
    _db.pragma('foreign_keys = ON');
    registerCleanup();
  }
  return _db;
}

/**
 * Checkpoints pending Write-Ahead Log (WAL) journal frames into the main SQLite database
 * file and truncates the WAL file to zero bytes.
 * This does not close the database connection, keeping all active and subsequent queries alive.
 */
export function checkpointDb(): void {
  const db = getDb();
  db.pragma('wal_checkpoint(TRUNCATE)');
}

/**
 * Ensures the database file has all pending changes synced from WAL/SHM,
 * and returns the binary Buffer of the updated SQLite database file.
 */
export function getDatabaseBackupBuffer(): Buffer {
  checkpointDb();
  if (!fs.existsSync(DB_PATH)) {
    throw new Error(`Database file not found at ${DB_PATH}`);
  }
  return fs.readFileSync(DB_PATH);
}

/**
 * Creates a complete ZIP backup containing:
 * 1. The fully checkpointed db/portfolio.db (all WAL/SHM frames merged and truncated)
 * 2. The entire public/ directory (including all project galleries and photos)
 * 
 * Returns the binary ZIP archive Buffer.
 */
export function getFullBackupZipBuffer(): Buffer {
  checkpointDb();

  if (!fs.existsSync(DB_PATH)) {
    throw new Error(`Database file not found at ${DB_PATH}`);
  }

  const entries: ZipEntry[] = [];

  // Add the database file at db/portfolio.db
  entries.push({
    name: 'db/portfolio.db',
    data: fs.readFileSync(DB_PATH),
  });

  // Add all public media (my_projects folders, images, etc.)
  const publicDir = path.join(process.cwd(), 'public');
  if (fs.existsSync(publicDir)) {
    const publicFiles = collectDirectoryFiles(publicDir, 'public');
    entries.push(...publicFiles);
  }

  return createZipBuffer(entries);
}

export interface DbProject {
  id: number;
  slug: string;
  title: string;
  display_order: number;
  created_at?: string;
  featured_images: string[];
  images?: string[];
}

// ── Public Photo Queries ──────────────────────────────────────────────

export function getFeaturedPhotos(): Photo[] {
  const db = getDb();
  const rows = db
    .prepare(`
      SELECT 
        p.*,
        (SELECT COUNT(*) FROM photos p2 WHERE p2.project_slug = p.project_slug) AS project_total
      FROM photos p 
      LEFT JOIN projects pr ON pr.slug = p.project_slug
      WHERE p.is_featured = 1 
      ORDER BY COALESCE(pr.display_order, 9999), p.display_order
    `)
    .all() as (Omit<Photo, 'is_featured'> & { is_featured: number })[];

  return rows.map((r) => ({
    ...r,
    is_featured: Boolean(r.is_featured),
  }));
}

export function getAllPhotos(): Photo[] {
  const db = getDb();
  const rows = db
    .prepare(`
      SELECT 
        p.*,
        (SELECT COUNT(*) FROM photos p2 WHERE p2.project_slug = p.project_slug) AS project_total
      FROM photos p 
      LEFT JOIN projects pr ON pr.slug = p.project_slug
      ORDER BY COALESCE(pr.display_order, 9999), p.display_order
    `)
    .all() as (Omit<Photo, 'is_featured'> & { is_featured: number })[];

  return rows.map((r) => ({
    ...r,
    is_featured: Boolean(r.is_featured),
  }));
}

export function getPhotosByProject(slug: string): Photo[] {
  const db = getDb();
  const rows = db
    .prepare(`
      SELECT 
        p.*,
        (SELECT COUNT(*) FROM photos p2 WHERE p2.project_slug = p.project_slug) AS project_total
      FROM photos p 
      WHERE p.project_slug = ?
      ORDER BY p.display_order
    `)
    .all(slug) as (Omit<Photo, 'is_featured'> & { is_featured: number })[];

  return rows.map((r) => ({
    ...r,
    is_featured: Boolean(r.is_featured),
  }));
}

// ── Resume Queries ───────────────────────────────────────────────────

export function getResumeEntries(): ResumeEntry[] {
  const db = getDb();
  return db
    .prepare('SELECT * FROM resume_entries ORDER BY section, display_order')
    .all() as ResumeEntry[];
}

export function updateResumeEntries(entries: ResumeEntry[]): void {
  const db = getDb();
  const insert = db.prepare(`
    INSERT INTO resume_entries (section, title, organization, period, display_order)
    VALUES (@section, @title, @organization, @period, @display_order)
  `);

  const tx = db.transaction(() => {
    db.prepare('DELETE FROM resume_entries').run();
    entries.forEach((e) => {
      insert.run({
        section: e.section,
        title: e.title,
        organization: e.organization,
        period: e.period,
        display_order: e.display_order,
      });
    });
  });

  tx();
}

// ── Site Settings & Content ──────────────────────────────────────────

const DEFAULT_BIO = [
  'Alex Moreau is a Berlin-based photographer working across documentary, editorial, and fine art photography.',
];

export function getOwnerInfo(): OwnerInfo {
  const db = getDb();
  const row = db.prepare('SELECT * FROM site_settings WHERE id = 1').get() as {
    name: string;
    email: string;
    location: string;
    available_for_travel: string;
    copyright_year: string;
    bio: string;
  } | undefined;

  if (!row) {
    return {
      name: 'Alex Moreau',
      email: 'alex@moreau.photo',
      location: 'Berlin, Germany',
      available_for_travel: 'Available for travel worldwide',
      copyright_year: '2026',
      bio: DEFAULT_BIO,
    };
  }

  let parsedBio: string[] = [];
  try {
    parsedBio = JSON.parse(row.bio);
    if (!Array.isArray(parsedBio)) parsedBio = DEFAULT_BIO;
  } catch {
    parsedBio = DEFAULT_BIO;
  }

  return {
    name: row.name,
    email: row.email,
    location: row.location,
    available_for_travel: row.available_for_travel,
    copyright_year: row.copyright_year,
    bio: parsedBio,
  };
}

export function getSocialLinks(): SocialLink[] {
  const db = getDb();
  return db
    .prepare('SELECT id, label, handle, url FROM social_links ORDER BY display_order ASC')
    .all() as SocialLink[];
}

export function getNavLinks(): NavLink[] {
  const db = getDb();
  const row = db.prepare('SELECT nav_links FROM site_settings WHERE id = 1').get() as { nav_links: string } | undefined;
  if (!row || !row.nav_links) {
    return [
      { label: 'Index', href: '/' },
      { label: 'Works', href: '/works' },
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Manage', href: '/manage' },
    ];
  }
  try {
    const parsed = JSON.parse(row.nav_links);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [];
  } catch {
    return [];
  }
}

export function getProjects(): DbProject[] {
  const db = getDb();
  const projects = db
    .prepare('SELECT * FROM projects ORDER BY display_order ASC')
    .all() as { id: number; slug: string; title: string; display_order: number; created_at: string }[];

  const featuredRows = db
    .prepare('SELECT project_slug, file_name FROM photos WHERE is_featured = 1 ORDER BY display_order ASC')
    .all() as { project_slug: string; file_name: string }[];

  const featuredMap = new Map<string, string[]>();
  featuredRows.forEach((r) => {
    if (!featuredMap.has(r.project_slug)) {
      featuredMap.set(r.project_slug, []);
    }
    featuredMap.get(r.project_slug)!.push(r.file_name);
  });

  return projects.map((p) => ({
    ...p,
    featured_images: featuredMap.get(p.slug) || [],
  }));
}

export function getAdminProjects(getDiskImages?: (slug: string) => string[]): DbProject[] {
  const projects = getProjects();
  const db = getDb();

  return projects.map((p) => {
    let images: string[];
    if (getDiskImages) {
      images = getDiskImages(p.slug);
    } else {
      const rows = db
        .prepare('SELECT file_name FROM photos WHERE project_slug = ? ORDER BY display_order ASC')
        .all(p.slug) as { file_name: string }[];
      images = rows.map((r) => r.file_name);
    }

    return {
      ...p,
      images,
    };
  });
}

export function getSiteContent(): ContentData {
  const owner = getOwnerInfo();
  const social_links = getSocialLinks();
  const nav_links = getNavLinks();
  const projects = getProjects();
  const resume = getResumeEntries();

  return {
    owner,
    social_links,
    nav_links,
    projects: projects.map((p) => ({
      slug: p.slug,
      title: p.title,
      featured_images: p.featured_images,
    })),
    resume,
  };
}

export function updateOwnerInfo(owner: Partial<OwnerInfo>): void {
  const db = getDb();
  const current = getOwnerInfo();
  const updated: OwnerInfo = {
    name: owner.name !== undefined ? String(owner.name).trim() : current.name,
    email: owner.email !== undefined ? String(owner.email).trim() : current.email,
    location: owner.location !== undefined ? String(owner.location).trim() : current.location,
    available_for_travel:
      owner.available_for_travel !== undefined
        ? String(owner.available_for_travel).trim()
        : current.available_for_travel,
    copyright_year:
      owner.copyright_year !== undefined
        ? String(owner.copyright_year).trim()
        : current.copyright_year,
    bio: Array.isArray(owner.bio) ? owner.bio.map(String) : current.bio,
  };

  db.prepare(`
    INSERT INTO site_settings (id, name, email, location, available_for_travel, copyright_year, bio)
    VALUES (1, @name, @email, @location, @available_for_travel, @copyright_year, @bio)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      email = excluded.email,
      location = excluded.location,
      available_for_travel = excluded.available_for_travel,
      copyright_year = excluded.copyright_year,
      bio = excluded.bio
  `).run({
    name: updated.name,
    email: updated.email,
    location: updated.location,
    available_for_travel: updated.available_for_travel || '',
    copyright_year: updated.copyright_year || '2026',
    bio: JSON.stringify(updated.bio),
  });
}

export function updateSocialLinks(links: SocialLink[]): void {
  const db = getDb();
  const insert = db.prepare(`
    INSERT INTO social_links (label, handle, url, display_order)
    VALUES (@label, @handle, @url, @display_order)
  `);

  const tx = db.transaction(() => {
    db.prepare('DELETE FROM social_links').run();
    links.forEach((link, idx) => {
      insert.run({
        label: String(link.label || '').trim(),
        handle: link.handle ? String(link.handle).trim() : null,
        url: String(link.url || '').trim(),
        display_order: idx + 1,
      });
    });
  });

  tx();
}

export function updateSiteContent(data: {
  owner?: Partial<OwnerInfo>;
  social_links?: SocialLink[];
  resume?: ResumeEntry[];
}): void {
  const db = getDb();
  const tx = db.transaction(() => {
    if (data.owner) {
      updateOwnerInfo(data.owner);
    }
    if (data.social_links) {
      updateSocialLinks(data.social_links);
    }
    if (data.resume) {
      updateResumeEntries(data.resume);
    }
  });

  tx();
}

// ── Project Mutations ────────────────────────────────────────────────

export function createProject(slug: string, title: string): DbProject {
  const db = getDb();
  const maxOrder = db.prepare('SELECT MAX(display_order) as maxOrder FROM projects').get() as {
    maxOrder: number | null;
  };
  const nextOrder = (maxOrder?.maxOrder || 0) + 1;

  const info = db
    .prepare(
      `
    INSERT INTO projects (slug, title, display_order)
    VALUES (?, ?, ?)
  `
    )
    .run(slug, title, nextOrder);

  return {
    id: Number(info.lastInsertRowid),
    slug,
    title,
    display_order: nextOrder,
    featured_images: [],
    images: [],
  };
}

export function updateProject(
  slug: string,
  data: { title?: string; featured_images?: string[] }
): void {
  const db = getDb();
  const tx = db.transaction(() => {
    if (data.title !== undefined) {
      db.prepare('UPDATE projects SET title = ? WHERE slug = ?').run(data.title, slug);
      db.prepare('UPDATE photos SET title = ? WHERE project_slug = ?').run(data.title, slug);
    }

    if (data.featured_images !== undefined) {
      // Set is_featured = 0 for all photos in this project
      db.prepare('UPDATE photos SET is_featured = 0 WHERE project_slug = ?').run(slug);

      // Set is_featured = 1 for the specified files
      if (data.featured_images.length > 0) {
        const updateFeatured = db.prepare(
          'UPDATE photos SET is_featured = 1 WHERE project_slug = ? AND file_name = ?'
        );
        for (const fileName of data.featured_images) {
          updateFeatured.run(slug, fileName);
        }
      }
    }
  });

  tx();
}

export function updateProjectOrder(slugs: string[]): void {
  const db = getDb();
  const stmt = db.prepare('UPDATE projects SET display_order = ? WHERE slug = ?');

  const tx = db.transaction(() => {
    slugs.forEach((slug, idx) => {
      stmt.run(idx + 1, slug);
    });
  });

  tx();
}

export function deleteProject(slug: string): void {
  const db = getDb();
  const tx = db.transaction(() => {
    db.prepare('DELETE FROM photos WHERE project_slug = ?').run(slug);
    db.prepare('DELETE FROM projects WHERE slug = ?').run(slug);
  });
  tx();
}

// ── Photo Mutations ──────────────────────────────────────────────────

export function addPhoto(data: {
  project_slug: string;
  file_name: string;
  title?: string;
  image_path: string;
  is_featured?: boolean;
  display_order?: number;
}): Photo {
  const db = getDb();
  let title: string | null = data.title ?? null;
  if (!title) {
    const proj = db.prepare('SELECT title FROM projects WHERE slug = ?').get(data.project_slug) as
      | { title: string }
      | undefined;
    title = proj?.title || null;
  }

  let order = data.display_order;
  if (order === undefined) {
    const max = db
      .prepare('SELECT MAX(display_order) as maxOrder FROM photos WHERE project_slug = ?')
      .get(data.project_slug) as { maxOrder: number | null };
    order = (max?.maxOrder || 0) + 1;
  }

  const isFeatured = data.is_featured ? 1 : 0;

  // Insert or update photo if file already exists in this project
  const existing = db
    .prepare('SELECT id FROM photos WHERE project_slug = ? AND file_name = ?')
    .get(data.project_slug, data.file_name) as { id: number } | undefined;

  if (existing) {
    db.prepare(
      `
      UPDATE photos 
      SET title = ?, image_path = ?, is_featured = ?, display_order = ?
      WHERE id = ?
    `
    ).run(title, data.image_path, isFeatured, order, existing.id);

    return {
      id: existing.id,
      project_slug: data.project_slug,
      file_name: data.file_name,
      title: title || null,
      image_path: data.image_path,
      is_featured: Boolean(data.is_featured),
      display_order: order,
    };
  }

  const stmt = db.prepare(`
    INSERT INTO photos (project_slug, file_name, title, image_path, is_featured, display_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const info = stmt.run(data.project_slug, data.file_name, title, data.image_path, isFeatured, order);

  return {
    id: Number(info.lastInsertRowid),
    project_slug: data.project_slug,
    file_name: data.file_name,
    title: title || null,
    image_path: data.image_path,
    is_featured: Boolean(data.is_featured),
    display_order: order,
  };
}

export function deletePhoto(project_slug: string, file_name: string): boolean {
  const db = getDb();
  const info = db
    .prepare('DELETE FROM photos WHERE project_slug = ? AND file_name = ?')
    .run(project_slug, file_name);
  return info.changes > 0;
}

export function setPhotoFeatured(
  project_slug: string,
  file_name: string,
  is_featured: boolean
): boolean {
  const db = getDb();
  const info = db
    .prepare('UPDATE photos SET is_featured = ? WHERE project_slug = ? AND file_name = ?')
    .run(is_featured ? 1 : 0, project_slug, file_name);
  return info.changes > 0;
}

export function getProjectImageFilesFromDb(slug: string): string[] {
  const db = getDb();
  const rows = db
    .prepare('SELECT file_name FROM photos WHERE project_slug = ? ORDER BY display_order ASC')
    .all(slug) as { file_name: string }[];
  return rows.map((r) => r.file_name);
}

export function getProjectFeaturedImagesFromDb(slug: string): string[] {
  const db = getDb();
  const rows = db
    .prepare(
      'SELECT file_name FROM photos WHERE project_slug = ? AND is_featured = 1 ORDER BY display_order ASC'
    )
    .all(slug) as { file_name: string }[];
  return rows.map((r) => r.file_name);
}
