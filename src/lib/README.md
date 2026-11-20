# `src/lib/` — Backend Data Layer & Database Services

This directory contains the **server-side data access utilities** for the portfolio.

If you are coming from an Express/Node background, this folder is the equivalent of your `models/` or `services/` directory.

---

## 1. What Happens Here

This directory manages the core services and data sources that power the application:
1. **The SQLite Database (`db.ts`):** Complete read-write query and mutation layer against `db/portfolio.db` via `better-sqlite3`.
2. **The Content Proxy (`content.ts`):** High-level helper providing typed site metadata (`getSiteContent()`) sourced directly from SQLite.
3. **The Admin Filesystem Layer (`admin.ts`):** Server-side filesystem operations (image saves, deletions, directory management) and future authentication gatekeeper.
4. **Shared Validation (`validation.ts`):** Isomorphic validation functions for URLs, emails, slugs, 4-digit years, and form constraints. Runs in both browser and Node.js environments.

---

## 2. File Breakdown

### [`db.ts`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/lib/db.ts) (SQLite Data Access & Mutations)
- **Engine:** Uses `better-sqlite3` (a synchronous, high-performance SQLite driver).
- **Read-Write Singleton:** Connects in read-write mode with Write-Ahead Logging (`WAL` mode) and foreign keys enabled.
- **Exported Public Queries:**
  - `getFeaturedPhotos()`: Retrieves photos flagged with `is_featured = 1` for the landing canvas, ordered by project sequence and photo order.
  - `getAllPhotos()`: Retrieves every photo across all projects for the `/works` archive.
  - `getPhotosByProject(slug)`: Retrieves all photos for a single project collection.
  - `getResumeEntries()`: Retrieves structured career history for `/about`.
  - `getOwnerInfo()`, `getSocialLinks()`, `getNavLinks()`: Retrieves profile information, external links, and header navigation.
  - `getSiteContent()`: Returns the complete consolidated `ContentData` model.
- **Exported Admin Mutations:**
  - `createProject(slug, title)`: Inserts a new project into the `projects` table with automatic display order.
  - `updateProject(slug, { title, featured_images })`: Updates project title and synchronizes `is_featured` flags.
  - `updateProjectOrder(slugs)`: Atomically updates project priority order.
  - `deleteProject(slug)`: Cascades deletion across project and photo records.
  - `addPhoto(data)`: Inserts or updates an image record in the `photos` table.
  - `deletePhoto(project_slug, file_name)`: Removes photo record from SQLite.
  - `setPhotoFeatured(project_slug, file_name, is_featured)`: Toggles featured status.
  - `updateOwnerInfo(owner)`, `updateSocialLinks(links)`, `updateResumeEntries(entries)`, `updateSiteContent(data)`.

### [`content.ts`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/lib/content.ts) (Content Adaptor)
- **Engine:** Proxies calls to `getSiteContent()` in `db.ts`.
- **Purpose:** Preserves backward-compatible imports for server pages and API routes without reading disk JSON files at runtime.

### [`admin.ts`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/lib/admin.ts) (Admin Filesystem Manager)
- **Engine:** Uses Node.js `fs` and `path`.
- **Server Only:** Never imported into client components.
- **Exported Functions:**
  - `requireAuth()`: Centralized placeholder for future auth middleware / session validation.
  - `getProjectImageFiles(slug)`: Inspects `public/my_projects/<slug>/` and returns actual image filenames from disk.
  - `saveProjectImage(slug, fileName, buffer)`: Writes uploaded image bytes into the project folder.
  - `deleteProjectImage(slug, fileName)`: Removes single image file from disk.
  - `ensureProjectDir(slug)` & `deleteProjectDir(slug)`: Manages project folder lifecycle on disk.

### [`validation.ts`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/lib/validation.ts) (Isomorphic Validators)
- **Engine:** Zero external dependencies; no Node.js built-ins.
- **Browser & Node Safe:** Imported by React client forms and Next.js route handlers.
- **Exported Functions:**
  - `isValidEmail(val)`, `isValidUrl(val)`, `isValidSlug(val)`, `isValidYear(val)`, `isValidPeriod(val)`.
  - `validateOwner(data)`: Validates name presence, email syntax, and 4-digit copyright year.
  - `validateSocialLink(data)`: Validates label presence and URL syntax.
  - `validateResumeEntry(data)`: Validates section category, role, organization, and period.
  - `validateProject(data, existingSlugs)`: Validates project title, slug syntax, and uniqueness.
  - `toSlug(str)`: Generates clean lowercase URL slugs from strings.

---

## 3. Crucial Fullstack Rule: Server-Only Execution

Because `db.ts` uses native Node.js C++ bindings (`better-sqlite3`), **it can only execute in a Node.js server environment**.

```
              Where Can You Import @/lib/db?
                            |
         +------------------+------------------+
         |                                     |
     ALLOWED (Server)                   FORBIDDEN (Browser)
  - src/app/page.tsx (Server Component)  - src/components/canvas/HorizontalCanvas.tsx
  - src/app/works/page.tsx               - src/components/works/Lightbox.tsx
  - src/app/about/page.tsx               - Any file starting with 'use client'
  - src/app/api/* (Route Handlers)       - Webpack will throw a compile error!
  - src/app/layout.tsx
```

If an interactive Client Component needs data from SQLite:
1. The parent Server Component in `src/app/` calls `@/lib/db`.
2. The Server Component passes the resulting data down as props to the Client Component.
3. Or, the Client Component calls `fetch('/api/photos')`.
