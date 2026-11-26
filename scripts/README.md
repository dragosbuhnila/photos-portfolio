# `scripts/` — Build Pipeline & Database Maintenance

This directory contains utility scripts that orchestrate application builds, static export generation, and database maintenance.

---

## 1. Script Inventory

| Script | Purpose |
|---|---|
| [`build.js`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/scripts/build.js) | Universal build router. If `STATIC_EXPORT === 'true'`, it delegates to `build-static.js`; otherwise, it executes `next build`. |
| [`build-static.js`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/scripts/build-static.js) | Isolates `/manage`, `/api`, and `/my_projects` routes, runs Next.js static export (`output: 'export'`), generates `.nojekyll`, and safely restores CMS routes. |
| [`clean-db.js`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/scripts/clean-db.js) | Checkpoints SQLite Write-Ahead Log (`wal_checkpoint(TRUNCATE)`) into `portfolio.db` and cleans up temporary `.db-wal` and `.db-shm` files. Runs automatically as `postbuild`. |

---

## 2. Static Export Pipeline (`scripts/build-static.js`)

When deploying to static web hosts (such as GitHub Pages):
1. **Route Isolation:** Temporarily renames `src/app/api`, `src/app/manage`, and `src/app/my_projects` to `_api`, `_manage`, and `_my_projects`. This prevents Next.js from failing on dynamic route handlers or exposing the private admin studio.
2. **Environment Configuration:** Sets `STATIC_EXPORT=true`, `NEXT_PUBLIC_STATIC_EXPORT=true`, and resolves `BASE_PATH` / `NEXT_PUBLIC_BASE_PATH`.
3. **Compilation:** Executes `npx next build` with `output: 'export'`. Next.js pre-renders all public pages (`/`, `/works`, `/about`, `/contact`) into `./out/`.
4. **GitHub Pages Readiness:** Emits an empty `./out/.nojekyll` file to bypass Jekyll processing on GitHub Pages.
5. **Restoration:** In the `finally` block, all renamed folders are immediately restored to their original locations and `clean-db.js` is executed to truncate WAL journals.

---

## 3. Database Checkpointing (`scripts/clean-db.js`)

SQLite uses Write-Ahead Logging (`WAL`), which writes changes into `portfolio.db-wal` before committing to the main `portfolio.db` file.
- `clean-db.js` connects via `better-sqlite3` and executes `PRAGMA wal_checkpoint(TRUNCATE)`.
- All pending journal transactions are safely merged into `portfolio.db`.
- The script unlinks `portfolio.db-wal` and `portfolio.db-shm` if they are not actively locked by another process.
- Can be invoked manually via `npm run db:clean`.
