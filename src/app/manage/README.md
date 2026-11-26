# `src/app/manage/` — Content Studio (Portfolio Management)

This directory implements the in-browser **Content Studio** where the website owner manages all portfolio content, images, resume records, and backups.

---

## 1. Architecture & Mental Model

In traditional headless CMS setups, the backend admin lives on a third-party hosted service (e.g. Sanity, Strapi, Contentful). In this portfolio, the management interface is **embedded natively into the local application**:

```text
[ Browser: /manage/* ]  <--- Fetch JSON & Multipart --->  [ API Handlers: /api/admin/* ]
         |                                                               |
         |                                                +--------------+---------------+
         |                                                |                              |
         v                                                v                              v
  React Client Forms                               SQLite Database              public/my_projects/
  (AdminField, ReorderList, Toast)             (Direct transactional writes)   (Physical image files)
```

1. **Persistent Admin Frame:** [`layout.tsx`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/app/manage/layout.tsx) wraps all subpages with [`<AdminSidebar>`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/components/admin/AdminSidebar.tsx).
2. **Real-time Client Validation:** All form inputs run validation rules from [`@/lib/validation`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/lib/validation.ts) before network calls are dispatched.
3. **Instant Database Updates:** Every mutation immediately executes direct SQLite queries via `src/lib/db.ts` and saves or removes files in `public/my_projects/`. Operations complete in < 1ms without child processes or server restarts.

---

## 2. Subpages Directory Map

| Route | File | Mode | Description |
|---|---|---|---|
| `/manage` | [`page.tsx`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/app/manage/page.tsx) | Client (`'use client'`) | **Artist Profile:** Edit photographer name, email, location, copyright year, and dynamic bio paragraphs. |
| `/manage/projects` | [`projects/page.tsx`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/app/manage/projects/page.tsx) | Client (`'use client'`) | **Projects & Galleries:** Create project collections, upload high-res imagery, toggle landing page featured images (`★`), reorder projects, and delete assets. |
| `/manage/resume` | [`resume/page.tsx`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/app/manage/resume/page.tsx) | Client (`'use client'`) | **Resume & Chronology:** Tabbed management for Experience, Education, and Exhibitions with collision-free priority reordering. |
| `/manage/social` | [`social/page.tsx`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/app/manage/social/page.tsx) | Client (`'use client'`) | **Social Links:** CRUD and priority ordering for outbound profile links and handles. |
| `/manage/backup` | [`backup/page.tsx`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/app/manage/backup/page.tsx) | Client (`'use client'`) | **Backup & Archive:** One-click full snapshot that checkpoints SQLite WAL into `portfolio.db` and downloads database + photos as a single `.zip` file. |

---

## 3. Key Design & UX Features

### A. Zero Collision Reordering
Instead of allowing users to type numerical indices (which causes duplicate order index bugs), reordering is handled visually via [`ReorderList`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/components/admin/ReorderList.tsx). The application automatically derives consecutive 1-based `display_order` values upon save.

### B. Landing Page Featured Selector
Within `/manage/projects`, each image thumbnail has a **`★ Featured`** button. Clicking it updates the photo's `is_featured` status in SQLite, directly governing which photos appear on the homepage lateral scroll canvas.

### C. Inline Confirmations
To adhere to the darkroom aesthetic and avoid jarring browser `window.confirm()` alert dialogs, deletions (projects, photos, resume entries, links) use two-step inline confirmation buttons.

### D. Checkpointed ZIP Backups
Within `/manage/backup`, clicking **Download Backup** triggers a server-side Write-Ahead Log (`WAL`) checkpoint to ensure all data is consolidated into `portfolio.db`, then streams a complete PKZIP archive containing both the SQLite database and all photo folders in `public/`.

---

## 4. Local CMS & Static Build Lifecycle

The Content Studio operates in the **local-first workflow**:
- **Running Locally:** You curate your content and upload photos in Content Studio while running `npm run dev`. All changes are written directly into local SQLite and filesystem directories.
- **Publishing:** When deploying statically (e.g. GitHub Pages via `npm run build:static`), the build script isolates `/manage` and `/api` so that private administration endpoints are not exposed to the public static build, and the site header automatically excludes the `Manage` navigation link.
