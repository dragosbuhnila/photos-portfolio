# `db/` — SQLite Database & Migration Scripts

This directory houses the SQLite database and database management scripts for the portfolio.

---

## 1. Overview

The application relies on a local SQLite database ([`portfolio.db`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/db/portfolio.db)) as the single source of truth for:
- Photographer profile & biography (`site_settings`)
- Outbound social links & display order (`social_links`)
- Projects & galleries (`projects`)
- Photos metadata, featured canvas flags, and display order (`photos`)
- Career chronology & credentials (`resume_entries`)

The database connection is managed via `better-sqlite3` in **Write-Ahead Logging (`WAL`)** mode with foreign keys enabled.

---

## 2. Directory Inventory

| File | Purpose |
|---|---|
| [`schema.sql`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/db/schema.sql) | Authoritative SQLite schema definition, table structures, constraints, and index definitions. |
| [`portfolio.db`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/db/portfolio.db) | Active SQLite binary database file. |
| [`migrate.ts`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/db/migrate.ts) | One-time / reset migration script importing `content.json` seed data into SQLite. |
| [`seed.ts`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/db/seed.ts) | Filesystem synchronization tool that scans `public/my_projects/` and indexes photo folders into SQLite. |

---

## 3. Database Schema (`schema.sql`)

### Tables
- **`site_settings`**: `id` (CHECK id = 1), `name`, `email`, `location`, `available_for_travel`, `copyright_year`, `bio` (JSON array string), `nav_links` (JSON array string).
- **`social_links`**: `id`, `label`, `handle`, `url`, `display_order`.
- **`projects`**: `id`, `slug` (UNIQUE), `title`, `display_order`, `created_at`.
- **`photos`**: `id`, `project_slug`, `file_name`, `title`, `image_path`, `is_featured`, `display_order`.
- **`resume_entries`**: `id`, `section`, `title`, `organization`, `period`, `display_order`.
- **`admin_auth`**: `id`, `salt`, `password_hash`, `updated_at`.

### Indexes
- `idx_photos_project_slug` on `photos(project_slug)`
- `idx_photos_featured` on `photos(is_featured)`
- `idx_photos_order` on `photos(project_slug, display_order)`
- `idx_projects_order` on `projects(display_order)`
- `idx_resume_order` on `resume_entries(section, display_order)`
- `idx_social_order` on `social_links(display_order)`

---

## 4. Useful Commands

```bash
# Sync new folders or images from public/my_projects/ into SQLite
npm run seed

# Run one-time migration from content.json into SQLite
npm run migrate

# Force a WAL checkpoint and clean auxiliary -wal and -shm files
npm run db:clean
```
