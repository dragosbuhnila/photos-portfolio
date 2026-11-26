# `src/lib/` — Backend Data Layer, Database & Core Utilities

This directory contains the **server-side data access utilities, database layer, and helper services** for the portfolio.

If you are coming from an Express/Node background, this folder is the equivalent of your `models/` and `services/` directory.

---

## 1. What Happens Here

This directory manages the core services and data sources that power the application:
1. **The SQLite Database ([`db.ts`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/lib/db.ts)):** Complete read-write query, mutation, WAL checkpointing, and backup extraction layer against `db/portfolio.db` via `better-sqlite3`.
2. **Subpath Asset Resolver ([`assets.ts`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/lib/assets.ts)):** Pure helper that prefixes image paths with `NEXT_PUBLIC_BASE_PATH` when deployed to repository subpaths (e.g. GitHub Pages).
3. **Zero-Dependency Backup Archiver ([`zip.ts`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/lib/zip.ts)):** In-memory PKZIP 2.0 generator using Node's built-in `zlib` and IEEE 802.3 CRC-32 calculation.
4. **The Admin Filesystem Layer ([`admin.ts`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/lib/admin.ts)):** Server-side disk file manager for images (`public/my_projects/<slug>/`).
5. **The Content Proxy ([`content.ts`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/lib/content.ts)):** High-level helper providing typed site metadata (`getSiteContent()`) sourced from SQLite.
6. **Shared Validation ([`validation.ts`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/lib/validation.ts)):** Isomorphic validation functions for URLs, emails, slugs, 4-digit years, and constraints. Runs safely in both browser and Node.js environments.

---

## 2. File Breakdown

### [`db.ts`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/lib/db.ts) (SQLite Data Access, Mutations & Backups)
- **Engine:** `better-sqlite3` executing synchronously with Write-Ahead Logging (`WAL` mode) and foreign keys enabled.
- **Connection & Checkpointing:**
  - `getDb()`: Lazy-initialized singleton connection with automatic process cleanup handlers (`exit`, `SIGINT`, `SIGTERM`).
  - `closeDb()`: Executes `wal_checkpoint(TRUNCATE)` and closes the active connection cleanly.
  - `checkpointDb()`: Merges all pending Write-Ahead Log frames into `portfolio.db` and truncates the WAL to zero bytes without closing the connection.
  - `getDatabaseBackupBuffer()`: Checkpoints WAL and returns the raw SQLite database file buffer.
  - `getFullBackupZipBuffer()`: Checkpoints WAL and returns a binary ZIP buffer containing `db/portfolio.db` and the entire `public/` directory.
- **Public Queries:**
  - `getFeaturedPhotos()`: Retrieves photos with `is_featured = 1`, enriched with `project_total` counts and resolved asset paths.
  - `getAllPhotos()`: Retrieves all photos across all projects with resolved asset paths.
  - `getPhotosByProject(slug)`: Retrieves all photos for a specific project.
  - `getResumeEntries()`: Retrieves career history ordered by section and display order.
  - `getOwnerInfo()`, `getSocialLinks()`, `getNavLinks()`: Site configuration and metadata.
  - `getProjects()`: Retrieves all project records with their featured image filenames.
  - `getAdminProjects(getDiskImages?)`: Enriches projects with current physical filenames on disk.
  - `getSiteContent()`: Consolidated `ContentData` model.
- **Admin Mutations:**
  - `updateOwnerInfo(owner)`, `updateSocialLinks(links)`, `updateResumeEntries(entries)`, `updateSiteContent(data)`.
  - `createProject(slug, title)`: Inserts new project record with automatic sequential display ordering.
  - `updateProject(slug, data)`: Synchronizes title and `is_featured` flags.
  - `updateProjectOrder(slugs)`: Atomically updates project ordering sequence in a single transaction.
  - `deleteProject(slug)`: Cascades deletion across project and photo records.
  - `addPhoto(data)`: Inserts or updates an image record with automatic order assignment.
  - `deletePhoto(project_slug, file_name)`: Removes photo record.
  - `setPhotoFeatured(project_slug, file_name, is_featured)`: Toggles landing canvas featured flag.

### [`assets.ts`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/lib/assets.ts) (Asset Path Resolver)
- **Engine:** Pure TypeScript.
- **Exported Function:**
  - `getAssetPath(path)`: Checks if a path is absolute, external (`http://`, `https://`), or a data/blob URI. If relative and `NEXT_PUBLIC_BASE_PATH` is defined, prepends the base path prefix so assets resolve accurately on GitHub Pages subpaths.

### [`zip.ts`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/lib/zip.ts) (Zero-Dependency ZIP Archiver)
- **Engine:** Node.js built-in `zlib` and `Buffer`.
- **Exported Functions:**
  - `computeCrc32(buf)`: Standard IEEE 802.3 32-bit CRC checksum calculation using a precomputed 256-entry lookup table.
  - `createZipBuffer(entries: ZipEntry[])`: Constructs a valid PKZIP 2.0 archive in-memory, writing Local File Headers, raw Deflate payloads, Central Directory records, and End of Central Directory (EOCD).
  - `collectDirectoryFiles(dirPath, relativePrefix)`: Recursively scans a filesystem folder and returns an array of `{ name, data }` entries ready for archiving.

### [`admin.ts`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/lib/admin.ts) (Filesystem Operations)
- **Engine:** Node.js `fs` and `path`.
- **Server Only:** Never imported into client components.
- **Exported Functions:**
  - `getProjectImageFiles(slug)`: Lists valid image files (`.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`, `.gif`) in `public/my_projects/<slug>/`.
  - `ensureProjectDir(slug)`: Creates project directory if missing.
  - `deleteProjectDir(slug)`: Recursively deletes project folder and all contained images.
  - `deleteProjectImage(slug, fileName)`: Deletes a specific photo file from disk.
  - `saveProjectImage(slug, fileName, buffer)`: Writes an uploaded image buffer to disk.

### [`content.ts`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/lib/content.ts) (Content Adaptor)
- **Exported Function:**
  - `getSiteContent()`: Proxies calls to `getSiteContentFromDb()` in `db.ts` to provide typed site metadata.

### [`validation.ts`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/lib/validation.ts) (Isomorphic Validators)
- **Engine:** Pure JavaScript/TypeScript with zero external dependencies.
- **Browser & Server Safe:** Shared between React forms and Next.js route handlers.
- **Exported Functions:**
  - `isValidEmail`, `isValidUrl`, `isValidSlug`, `isValidYear`, `isValidPeriod`, `isNonEmpty`.
  - `validateOwner(data)`: Validates photographer name, email syntax, and 4-digit copyright year.
  - `validateSocialLink(data)`: Validates label presence and URL syntax.
  - `validateResumeEntry(data)`: Validates category, title, organization, and date period.
  - `validateProject(data, existingSlugs)`: Validates title, slug syntax, and uniqueness.
  - `toSlug(str)`: Generates clean lowercase URL slugs.

---

## 3. Crucial Fullstack Rule: Server-Only Execution

Because `db.ts`, `zip.ts`, and `admin.ts` rely on native Node.js C++ bindings (`better-sqlite3`) and Node built-ins (`fs`, `path`, `zlib`), **they can only execute in a Node.js server environment**.

```text
              Where Can You Import @/lib/db?
                            |
         +------------------+------------------+
         |                                     |
     ALLOWED (Server)                   FORBIDDEN (Browser)
  - src/app/page.tsx (Server Component)  - src/components/canvas/HorizontalCanvas.tsx
  - src/app/works/page.tsx               - src/components/works/Lightbox.tsx
  - src/app/about/page.tsx               - Any file starting with 'use client'
  - src/app/api/* (Route Handlers)       - Webpack/Turbopack will throw a compile error!
  - src/app/layout.tsx
```

If an interactive Client Component needs data from SQLite:
1. The parent Server Component in `src/app/` calls `@/lib/db`.
2. The Server Component passes the resulting data down as serializable props to the Client Component.
3. Or, the Client Component calls `fetch('/api/admin/...')` to perform mutations.
