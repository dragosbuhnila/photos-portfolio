# Photography Portfolio — Owner's & Developer's Guide

Welcome to your photography portfolio website! This guide explains how to run, manage, and deploy your website: adding new photos, curating projects, updating your bio and resume, backing up your data, and publishing your portfolio.

The application relies directly on a high-performance local SQLite database ([`db/portfolio.db`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/db/portfolio.db)) as its single source of truth. You can manage everything directly from the built-in **Content Studio (`/manage`)** in your browser, or manage photo folders directly in [`public/my_projects/`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/public/my_projects/).

---

## 🚀 Quick Start: Running Your Website Locally

To preview and manage your website on your computer:

1. Open your terminal (PowerShell, Command Prompt, or Terminal in VS Code).
2. Ensure you are inside the project folder:
   ```bash
   cd c:\Users\Dragos\Roba\Lectures\Software\Websites\photos-portfolio
   ```
3. Start the local server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to:
   - 👉 **Public Portfolio:** [http://localhost:3000](http://localhost:3000)
   - 👉 **Content Studio (CMS):** [http://localhost:3000/manage](http://localhost:3000/manage)

To stop the website server at any time, press `Ctrl + C` in your terminal.

---

## 🎛️ Option 1: Managing via Content Studio (`/manage`)

Click on **Manage** in the site header or navigate to `http://localhost:3000/manage`. The studio provides five dedicated management sections:

### 1. Projects & Photo Studio (`/manage/projects`)
- **Create New Projects:** Enter a title (e.g. `Nocturne`), and a clean URL slug is generated automatically.
- **Upload High-Res Imagery:** Drag-and-drop or select files directly in the browser (`.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`, `.gif`). Images are instantly saved into `public/my_projects/<slug>/` and recorded in SQLite.
- **Feature on Landing Canvas:** Click **`★ Featured`** on any photo to toggle whether it appears on the horizontal landing page showcase.
- **Reorder Projects:** Click `▲` and `▼` to change project priority without manual index typing.
- **Delete Photos or Projects:** Safe deletion with inline confirmation that cleans up both SQLite records and physical disk files.

### 2. Resume & Chronology (`/manage/resume`)
- Tabbed by category: **Work Experience**, **Education**, and **Exhibitions**.
- **Collision-Free Ordering:** Move entries up and down with `▲` and `▼`. The system assigns sequential priority order automatically, eliminating duplicate order index errors.
- Add, edit, or delete credentials with real-time field validation.

### 3. Artist Profile (`/manage`)
- Update photographer name, contact email, location, travel availability, and copyright year.
- **Editorial Bio Paragraphs:** Add, edit, or remove paragraphs dynamically. Each paragraph renders as a distinct block on the `/about` page.

### 4. Social Links (`/manage/social`)
- Add, edit, remove, and reorder external links (e.g. Instagram, Threads, Behance).
- Validates URLs and handles automatically.

### 5. Backup & Archive (`/manage/backup`)
- **Full Snapshot Download:** With one click, the system checkpoints SQLite's Write-Ahead Log (`WAL`) journal into `portfolio.db` and packages the database file alongside the entire `public/` imagery folder into a downloadable `.zip` archive (`portfolio-backup-<timestamp>.zip`).
- Provides offline preservation and zero-dependency migration.

*All mutations made in Content Studio instantly update the SQLite database in real-time (< 1ms).*

---

## 📁 Option 2: Managing Photos via the Filesystem

If you prefer to organize photos directly on your computer:

### Step 1: Create a Project Folder
Inside [`public/my_projects/`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/public/my_projects/), create a subfolder using lowercase letters and dashes (e.g. `summer-in-rome` or `street-portraits`):
```text
public/
  my_projects/
    summer-in-rome/
    street-portraits/
```

### Step 2: Add Images
Drop your image files (`.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`, `.gif`) straight into that folder.

### Step 3: Sync Images to SQLite
Run the seed command in your terminal:
```bash
npm run seed
```

**What happens automatically:**
- The system discovers new folders and files.
- It converts folder slugs into readable titles (e.g. `summer-in-rome` → `Summer In Rome`).
- All photos immediately appear in your **Works** page (`/works`).
- You can visit `/manage/projects` anytime to mark specific photos as **Featured** for the landing page or adjust titles.

---

## 🌐 Deployment & Architecture

The application supports a **dual runtime architecture**:

1. **Local Dynamic CMS Mode (`npm run dev` / `npm run build`):**
   - Fullstack Next.js (App Router) executing on Node.js.
   - Embedded Content Studio at `/manage` for live editing and uploads.
   - Dynamic image streaming with path traversal protection at `/my_projects/[...path]`.
   - SQLite (`better-sqlite3`) in Write-Ahead Logging (`WAL`) mode with foreign keys enabled.

2. **Static Export Mode (`npm run build:static` / GitHub Pages):**
   - Pre-renders all public routes (`/`, `/works`, `/about`, `/contact`) into static HTML/CSS/JS inside `out/`.
   - The build script ([`scripts/build-static.js`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/scripts/build-static.js)) temporarily isolates `/manage`, `/api`, and `/my_projects` routes so the static compiler outputs pure client-ready pages.
   - The site header automatically hides the `Manage` navigation link when built for static export (`NEXT_PUBLIC_STATIC_EXPORT=true`).
   - Handles repository subpath deployments via `NEXT_PUBLIC_BASE_PATH` and the asset path resolver ([`src/lib/assets.ts`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/lib/assets.ts)).
   - Fully automated deployment to GitHub Pages via [`.github/workflows/deploy.yml`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/.github/workflows/deploy.yml).

---

## 🗄️ Database Architecture (`db/portfolio.db`)

The website uses a local SQLite database powered by `better-sqlite3` in Write-Ahead Logging (`WAL`) mode:
- **`site_settings`**: Stores photographer bio, email, location, travel availability, copyright year, and nav links.
- **`social_links`**: Stores social media profiles and display ordering.
- **`projects`**: Stores project titles, slugs, and display order.
- **`photos`**: Stores photo metadata, file paths, `is_featured` flags, and display order within projects.
- **`resume_entries`**: Stores career chronology (experience, education, exhibitions).

> **Database Maintenance:** Run `npm run db:clean` to force a `wal_checkpoint(TRUNCATE)`, flushing all write journals into `portfolio.db` and cleanly removing `-wal` and `-shm` auxiliary files.

---

## 💡 Summary of Everyday Commands

| Goal | Command | Description |
| :--- | :--- | :--- |
| **Start local development & CMS** | `npm run dev` | Runs Next.js dev server with public site and Content Studio at `localhost:3000`. |
| **Sync new folders/photos to SQLite** | `npm run seed` | Discovers filesystem folders and indexes photos into `db/portfolio.db`. |
| **Checkpoint and clean WAL journal** | `npm run db:clean` | Truncates WAL log into `portfolio.db` and cleans `-wal` and `-shm` files. |
| **Export static site for hosting** | `npm run build:static` | Builds static site into `./out` ready for GitHub Pages or static CDN. |
| **Production build (Node.js)** | `npm run build` | Builds optimized application bundle. |
| **Re-run initial JSON migration** | `npm run migrate` | Seeds database from `content.json` (one-time setup/reset). |
| **Stop website server** | `Ctrl + C` | Stops the running terminal process. |
