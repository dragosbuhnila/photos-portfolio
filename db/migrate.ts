import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(__dirname, '..');
const DB_PATH = path.join(__dirname, 'portfolio.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');
const CONTENT_PATH = path.join(ROOT, 'content.json');
const PROJECTS_DIR = path.join(ROOT, 'public', 'my_projects');

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif']);

function isImage(filename: string): boolean {
  return IMAGE_EXTENSIONS.has(path.extname(filename).toLowerCase());
}

function runMigration() {
  console.log('🚀 Starting SQLite migration...');

  if (!fs.existsSync(DB_PATH)) {
    console.log(`Database does not exist yet at ${DB_PATH}. It will be created.`);
  }

  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // 1. Apply schema
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  db.exec(schema);
  console.log('✓ Schema applied successfully.');

  // 2. Read content.json if present
  if (!fs.existsSync(CONTENT_PATH)) {
    console.warn('⚠ content.json not found, skipping data import.');
    db.close();
    return;
  }

  const contentRaw = fs.readFileSync(CONTENT_PATH, 'utf-8');
  const content = JSON.parse(contentRaw);

  const migrateTx = db.transaction(() => {
    // 3. Site Settings (Owner & Nav Links)
    const owner = content.owner || {};
    const navLinks = content.nav_links || [];

    const upsertSettings = db.prepare(`
      INSERT INTO site_settings (id, name, email, location, available_for_travel, copyright_year, bio, nav_links)
      VALUES (1, @name, @email, @location, @available_for_travel, @copyright_year, @bio, @nav_links)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        email = excluded.email,
        location = excluded.location,
        available_for_travel = excluded.available_for_travel,
        copyright_year = excluded.copyright_year,
        bio = excluded.bio,
        nav_links = excluded.nav_links
    `);

    upsertSettings.run({
      name: String(owner.name || ''),
      email: String(owner.email || ''),
      location: String(owner.location || ''),
      available_for_travel: String(owner.available_for_travel || ''),
      copyright_year: String(owner.copyright_year || '2026'),
      bio: JSON.stringify(Array.isArray(owner.bio) ? owner.bio : []),
      nav_links: JSON.stringify(Array.isArray(navLinks) ? navLinks : []),
    });
    console.log('✓ Site settings migrated.');

    // 4. Social Links
    db.prepare('DELETE FROM social_links').run();
    const insertSocial = db.prepare(`
      INSERT INTO social_links (label, handle, url, display_order)
      VALUES (@label, @handle, @url, @display_order)
    `);

    if (Array.isArray(content.social_links)) {
      content.social_links.forEach((link: { label: string; handle?: string; url: string }, idx: number) => {
        insertSocial.run({
          label: String(link.label || ''),
          handle: link.handle ? String(link.handle) : null,
          url: String(link.url || ''),
          display_order: idx + 1,
        });
      });
    }
    console.log(`✓ ${content.social_links?.length || 0} social links migrated.`);

    // 5. Projects
    const upsertProject = db.prepare(`
      INSERT INTO projects (slug, title, display_order)
      VALUES (@slug, @title, @display_order)
      ON CONFLICT(slug) DO UPDATE SET
        title = excluded.title,
        display_order = excluded.display_order
    `);

    const projectsList = Array.isArray(content.projects) ? content.projects : [];
    projectsList.forEach((proj: { slug: string; title: string }, idx: number) => {
      upsertProject.run({
        slug: proj.slug,
        title: proj.title,
        display_order: idx + 1,
      });
    });
    console.log(`✓ ${projectsList.length} projects migrated.`);

    // 6. Photos
    // Make sure all photos on disk are represented and featured flags match
    const existingPhotos = db.prepare('SELECT id, project_slug, file_name FROM photos').all() as {
      id: number;
      project_slug: string;
      file_name: string;
    }[];
    const photoKeyMap = new Map<string, number>();
    existingPhotos.forEach((p) => photoKeyMap.set(`${p.project_slug}::${p.file_name}`, p.id));

    const insertPhoto = db.prepare(`
      INSERT INTO photos (project_slug, file_name, title, image_path, is_featured, display_order)
      VALUES (@project_slug, @file_name, @title, @image_path, @is_featured, @display_order)
    `);

    const updatePhoto = db.prepare(`
      UPDATE photos
      SET title = @title, is_featured = @is_featured, display_order = @display_order
      WHERE id = @id
    `);

    for (const project of projectsList) {
      const projectDir = path.join(PROJECTS_DIR, project.slug);
      const featuredSet = new Set(project.featured_images || []);

      if (fs.existsSync(projectDir)) {
        const files = fs
          .readdirSync(projectDir)
          .filter(isImage)
          .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

        files.forEach((fileName, index) => {
          const isFeatured = featuredSet.has(fileName) ? 1 : 0;
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

          const key = `${project.slug}::${fileName}`;
          const existingId = photoKeyMap.get(key);

          if (existingId !== undefined) {
            updatePhoto.run({
              id: existingId,
              title: project.title,
              is_featured: isFeatured,
              display_order: order,
            });
          } else {
            insertPhoto.run({
              project_slug: project.slug,
              file_name: fileName,
              title: project.title,
              image_path: `/my_projects/${project.slug}/${fileName}`,
              is_featured: isFeatured,
              display_order: order,
            });
          }
        });
      }
    }
    console.log('✓ Photos synchronized and verified.');

    // 7. Resume entries
    db.prepare('DELETE FROM resume_entries').run();
    const insertResume = db.prepare(`
      INSERT INTO resume_entries (section, title, organization, period, display_order)
      VALUES (@section, @title, @organization, @period, @display_order)
    `);

    if (Array.isArray(content.resume)) {
      content.resume.forEach((r: {
        section: string;
        title: string;
        organization: string;
        period: string;
        display_order: number;
      }) => {
        insertResume.run({
          section: String(r.section),
          title: String(r.title),
          organization: String(r.organization),
          period: String(r.period),
          display_order: Number(r.display_order) || 0,
        });
      });
    }
    console.log(`✓ ${content.resume?.length || 0} resume entries migrated.`);
  });

  migrateTx();

  // Verification counts
  const settingsCount = db.prepare('SELECT COUNT(*) as count FROM site_settings').get() as { count: number };
  const socialCount = db.prepare('SELECT COUNT(*) as count FROM social_links').get() as { count: number };
  const projectsCount = db.prepare('SELECT COUNT(*) as count FROM projects').get() as { count: number };
  const photosCount = db.prepare('SELECT COUNT(*) as count FROM photos').get() as { count: number };
  const resumeCount = db.prepare('SELECT COUNT(*) as count FROM resume_entries').get() as { count: number };

  console.log('\n📊 Migration Summary:');
  console.log(`  - site_settings: ${settingsCount.count} row(s)`);
  console.log(`  - social_links:  ${socialCount.count} row(s)`);
  console.log(`  - projects:      ${projectsCount.count} row(s)`);
  console.log(`  - photos:        ${photosCount.count} row(s)`);
  console.log(`  - resume_entries:${resumeCount.count} row(s)`);

  db.close();
  console.log('✅ Migration completed successfully!');
}

runMigration();
