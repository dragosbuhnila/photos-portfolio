import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

// ── Paths ────────────────────────────────────────────────────────────────────
const ROOT = path.resolve(__dirname, '..');
const DB_PATH = path.join(__dirname, 'portfolio.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');
const CONTENT_PATH = path.join(ROOT, 'content.json');
const PROJECTS_DIR = path.join(ROOT, 'public', 'my_projects');

// ── Types ────────────────────────────────────────────────────────────────────
interface ProjectEntry {
  slug: string;
  title: string;
  featured_images: string[];
  photos_order?: Record<string, number>;
}

interface ResumeEntry {
  section: string;
  title: string;
  organization: string;
  period: string;
  display_order: number;
}

interface OwnerInfo {
  name: string;
  email: string;
  location: string;
  available_for_travel?: string;
  copyright_year?: string;
  bio: string[];
}

interface SocialLink {
  label: string;
  handle?: string;
  url: string;
}

interface NavLink {
  label: string;
  href: string;
}

interface ContentJson {
  owner?: OwnerInfo;
  social_links?: SocialLink[];
  nav_links?: NavLink[];
  projects: ProjectEntry[];
  resume: ResumeEntry[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif']);

function isImage(filename: string): boolean {
  return IMAGE_EXTENSIONS.has(path.extname(filename).toLowerCase());
}

/** Convert a folder slug like "urban-geometry" → "Urban Geometry" */
function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// ── Sync content.json projects with public/my_projects/ ──────────────────────
function syncProjects(content: ContentJson): { updated: boolean } {
  console.log('🔄  Syncing projects with filesystem…');

  if (!fs.existsSync(PROJECTS_DIR)) {
    console.warn(`  ⚠  Projects directory not found: ${PROJECTS_DIR}`);
    return { updated: false };
  }

  // All subfolders in public/my_projects/
  const foldersOnDisk = fs
    .readdirSync(PROJECTS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  // Build a map of existing projects for fast lookup (preserves title + featured_images)
  const existing = new Map<string, ProjectEntry>(
    content.projects.map((p) => [p.slug, p])
  );

  let updated = false;

  // ── Add new folders not yet in content.json ──────────────────────────────
  for (const slug of foldersOnDisk) {
    if (!existing.has(slug)) {
      const newProject: ProjectEntry = {
        slug,
        title: slugToTitle(slug),
        featured_images: [],
      };
      content.projects.push(newProject);
      existing.set(slug, newProject);
      console.log(`  ✚  New project detected: "${slug}" → added to content.json`);
      updated = true;
    }
  }

  // ── Warn about & remove projects whose folder no longer exists ───────────
  const diskSet = new Set(foldersOnDisk);
  const before = content.projects.length;
  content.projects = content.projects.filter((p) => {
    if (!diskSet.has(p.slug)) {
      console.warn(`  ✖  Folder removed: "${p.slug}" → removed from content.json`);
      updated = true;
      return false;
    }
    return true;
  });
  if (content.projects.length !== before) updated = true;

  // ── Write back if anything changed ──────────────────────────────────────
  if (updated) {
    fs.writeFileSync(CONTENT_PATH, JSON.stringify(content, null, 2) + '\n', 'utf-8');
    console.log('  ✓  content.json updated');
  } else {
    console.log('  ✓  content.json already in sync');
  }

  return { updated };
}

// ── Main seed ────────────────────────────────────────────────────────────────
function seed(): void {
  console.log('🌱  Seeding database…');

  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');

  // Apply schema
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  db.exec(schema);

  // Wipe existing data
  db.exec('DELETE FROM photos; DELETE FROM resume_entries;');

  // Load content.json and sync projects with filesystem first
  const content: ContentJson = JSON.parse(fs.readFileSync(CONTENT_PATH, 'utf-8'));
  syncProjects(content);

  // ── Seed photos ──────────────────────────────────────────────────────────
  const insertPhoto = db.prepare(`
    INSERT INTO photos (project_slug, file_name, title, image_path, is_featured, display_order, featured_order)
    VALUES (@project_slug, @file_name, @title, @image_path, @is_featured, @display_order, @featured_order)
  `);

  const seedPhotos = db.transaction(() => {
    let nextFeaturedOrder = 1;

    for (const project of content.projects) {
      const projectDir = path.join(PROJECTS_DIR, project.slug);

      if (!fs.existsSync(projectDir)) {
        console.warn(`  ⚠  Folder not found, skipping: ${projectDir}`);
        continue;
      }

      const files = fs
        .readdirSync(projectDir)
        .filter(isImage)
        .sort((a, b) =>
          a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
        );

      files.forEach((fileName, index) => {
        const imagePath = `/my_projects/${project.slug}/${fileName}`;
        const isFeatured = project.featured_images.includes(fileName) ? 1 : 0;
        const featuredOrder = isFeatured ? nextFeaturedOrder++ : 0;

        // Determine specific number/ID in collection:
        // 1. Explicit in content.json photos_order map
        // 2. Numerical prefix in filename (e.g. 01.jpg, 02_roof.png)
        // 3. Fallback to natural sorted position (index + 1)
        let order = index + 1;
        if (project.photos_order && typeof project.photos_order[fileName] === 'number') {
          order = project.photos_order[fileName];
        } else {
          const match = fileName.match(/^(\d+)/);
          if (match) {
            const parsed = parseInt(match[1], 10);
            if (!isNaN(parsed) && parsed > 0) order = parsed;
          }
        }

        insertPhoto.run({
          project_slug: project.slug,
          file_name: fileName,
          title: project.title,
          image_path: imagePath,
          is_featured: isFeatured,
          display_order: order,
          featured_order: featuredOrder,
        });
      });

      console.log(`  ✓  ${project.slug} (${files.length} images)`);
    }
  });

  seedPhotos();

  // ── Seed resume entries ──────────────────────────────────────────────────
  const insertResume = db.prepare(`
    INSERT INTO resume_entries (section, title, organization, period, display_order)
    VALUES (@section, @title, @organization, @period, @display_order)
  `);

  const seedResume = db.transaction(() => {
    for (const entry of content.resume) {
      insertResume.run(entry);
    }
  });

  seedResume();
  console.log(`  ✓  ${content.resume.length} resume entries`);

  db.close();
  console.log('✅  Seeding complete.');
}

seed();
