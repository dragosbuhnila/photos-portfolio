# Project Specification: Photography Portfolio

## 1. Project Overview
A modern, minimalist photography portfolio featuring a lateral-scrolling landing canvas, a complete works index, an editorial about page, and a built-in Content Studio (`/manage`). The application relies directly on a local SQLite database (`db/portfolio.db`) as its single source of truth for all projects, photos, metadata, bio, and resume entries.

## 2. Tech Stack & Architecture
- **Language:** TypeScript (Strict mode)
- **Framework:** Next.js (App Router)
- **Database:** SQLite (using `better-sqlite3` in WAL mode)
- **Styling:** Tailwind CSS
- **Data Layer:** Unified read/write service (`src/lib/db.ts`) executing direct, transactional SQLite queries, with one-time migration and folder sync scripts (`db/migrate.ts`, `db/seed.ts`).

## 3. Visual & Aesthetic Rules (Darkroom / Cinema Style)
- **Backgrounds:** Deep matte charcoal (`#121212` or Tailwind `neutral-950`). Strictly NO pure black (`#000000`).
- **Typography:** Muted silver/gray text (`#A0A0A0` or Tailwind `neutral-400`) for body, and a slightly brighter off-white (`#E5E5E5`) for headers/titles.
- **Layout:** Remove screen glare. Images act as the sole light source. Wide margins, zero borders, no drop shadows, no rounded corners (0px radius).
- **Vibe:** Moody, high-end lookbook. Avoid heavy component libraries, neon gradients, or glassmorphism.

## 4. Content Management & Database Schema

### Source of Truth
- `db/portfolio.db`: SQLite database storing all portfolio entities in WAL mode.
- `public/my_projects/`: Contains subfolders named after project slugs (e.g., `public/my_projects/tokyo-nights/`), containing the raw image files.

### Database Schema (SQLite)
**Table: `site_settings`**
- `id`: INTEGER PRIMARY KEY CHECK (id = 1)
- `name`: TEXT NOT NULL
- `email`: TEXT NOT NULL
- `location`: TEXT NOT NULL
- `available_for_travel`: TEXT
- `copyright_year`: TEXT
- `bio`: TEXT (JSON array string)
- `nav_links`: TEXT (JSON array string)

**Table: `social_links`**
- `id`: INTEGER PRIMARY KEY AUTOINCREMENT
- `label`: TEXT NOT NULL
- `handle`: TEXT
- `url`: TEXT NOT NULL
- `display_order`: INTEGER NOT NULL

**Table: `projects`**
- `id`: INTEGER PRIMARY KEY AUTOINCREMENT
- `slug`: TEXT UNIQUE NOT NULL
- `title`: TEXT NOT NULL
- `display_order`: INTEGER NOT NULL
- `created_at`: DATETIME DEFAULT CURRENT_TIMESTAMP

**Table: `photos`**
- `id`: INTEGER PRIMARY KEY AUTOINCREMENT
- `project_slug`: TEXT NOT NULL (Maps to `projects.slug`)
- `file_name`: TEXT NOT NULL
- `title`: TEXT
- `image_path`: TEXT NOT NULL (e.g., `/my_projects/tokyo-nights/01.jpg`)
- `is_featured`: BOOLEAN DEFAULT 0 (For the Landing Page horizontal canvas)
- `display_order`: INTEGER NOT NULL

**Table: `resume_entries`**
- `id`: INTEGER PRIMARY KEY AUTOINCREMENT
- `section`: TEXT NOT NULL (experience, education, exhibition)
- `title`: TEXT NOT NULL
- `organization`: TEXT NOT NULL
- `period`: TEXT NOT NULL
- `display_order`: INTEGER NOT NULL

## 5. Application Routes

### Global Layout (`layout.tsx`)
- **Header:** Sticky top bar containing the photographer's name (left) and navigation links (`Index`, `Works`, `About`, `Contact`, `Manage`) on the right.
- **Footer:** Direct email link, social links, and copyright notice ("© 2026 [Name]. All rights reserved.").

### Route 1: Landing Page (`/`)
- **Feature:** Horizontal Scroll Canvas displaying records from `photos` where `is_featured = 1`.
- **Behavior:** Horizontal overflow container with smooth wheel-to-horizontal scroll translation. 
- **Layout:** Vertical scrolling should be minimal, only enough to reveal the footer.

### Route 2: Works Page (`/works`)
- **Feature:** Displays all projects/photos grouped by `project_slug`.
- **Interactivity:** Clean masonry or uniform grid. Clicking a photo opens a fullscreen lightbox modal.

### Route 3: About Page (`/about`)
- **Feature:** Two-column editorial layout. Left: Photographer bio. Right: Structured lists pulled from the `resume_entries` table.

### Route 4: Contact Page (`/contact`)
- **Feature:** Minimalist static page displaying click-to-copy email address, location, and social links. No forms.

### Route 5: Content Studio (`/manage`)
- **Feature:** In-browser admin panel to update artist profile, projects, photos, featured images, and resume entries with direct SQLite persistence.

## 6. Directory Structure Target
```text
├── db/
│   ├── schema.sql
│   ├── migrate.ts        <-- One-time / sync migration script
│   ├── seed.ts           <-- Filesystem folder sync tool
│   └── portfolio.db      <-- SQLite Database (Single Source of Truth)
├── public/
│   └── my_projects/      <-- Project photo folders
│       ├── project-one/
│       └── project-two/
├── src/
│   ├── components/
│   │   ├── admin/
│   │   ├── canvas/
│   │   ├── contact/
│   │   ├── layout/
│   │   └── works/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── works/page.tsx
│   │   ├── about/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── manage/
│   │   └── api/
│   ├── lib/
│   │   ├── db.ts         <-- Direct SQLite query & mutation layer
│   │   ├── admin.ts      <-- Filesystem helpers
│   │   └── validation.ts <-- Isomorphic validation
│   └── types/
│       └── portfolio.ts
└── package.json
```

## 7. System Rules & Agent Directives
1. **Source of Truth:** This file (`AGENTS.md`) is the absolute source of truth. Do not deviate from its tech stack, database schema, or design system without explicit user permission.
2. **TypeScript:** Write clean, strict TypeScript. Do not use `any`.
3. **Aesthetic Enforcement:** This project uses a "Darkroom / Cinema" aesthetic. Never use bright backgrounds, heavy borders, rounded corners (always 0px), or drop shadows. Rely entirely on Tailwind utility classes.
4. **Database Guardrails:** The database is SQLite (`db/portfolio.db`) in WAL mode. Mutations execute in-process via `src/lib/db.ts`.
