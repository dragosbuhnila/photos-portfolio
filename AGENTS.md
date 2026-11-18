# Project Specification: Photography Portfolio

## 1. Project Overview
A modern, minimalist photography portfolio featuring a lateral-scrolling landing canvas, a complete works index, and an editorial about page. The application relies on a file-based CMS approach: data is managed manually in a JSON file and local folders, which seeds a local SQLite database for fast querying by the frontend.

## 2. Tech Stack & Architecture
- **Language:** TypeScript (Strict mode)
- **Framework:** Next.js
- **Database:** SQLite (using `better-sqlite3`)
- **Styling:** Tailwind CSS
- **Data Pipeline:** A `seed.ts` script that parses a root `content.json` file and the `public/my_projects/` directory to wipe and populate the SQLite database on build/startup.

## 3. Visual & Aesthetic Rules (Darkroom / Cinema Style)
- **Backgrounds:** Deep matte charcoal (`#121212` or Tailwind `neutral-950`). Strictly NO pure black (`#000000`).
- **Typography:** Muted silver/gray text (`#A0A0A0` or Tailwind `neutral-400`) for body, and a slightly brighter off-white (`#E5E5E5`) for headers/titles.
- **Layout:** Remove screen glare. Images act as the sole light source. Wide margins, zero borders, no drop shadows, no rounded corners (0px radius).
- **Vibe:** Moody, high-end lookbook. Avoid heavy component libraries, neon gradients, or glassmorphism.

## 4. Content Management & Database Schema

### File Structure (Source of Truth)
- `content.json`: Contains JSON arrays for `projects` (metadata) and `resume` entries.
- `public/my_projects/`: Contains subfolders named exactly after project slugs (e.g., `public/my_projects/tokyo-nights/`), containing the raw image files.

### Database Schema (SQLite)
**Table: `photos`**
- `id`: INTEGER PRIMARY KEY AUTOINCREMENT
- `project_slug`: TEXT NOT NULL (Maps to folder name in `/my_projects/`)
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

### Global Layout (`Layout.tsx`)
- **Header:** Sticky top bar containing the photographer's name (left) and navigation links (`Index`, `Works`, `About`, `Contact`) on the right.
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

## 6. Directory Structure Target
```text
├── content.json          <-- Manual data entry
├── db/
│   ├── schema.sql
│   ├── seed.ts           <-- Reads content.json & folders to build SQLite DB
│   └── portfolio.db
├── public/
│   └── my_projects/      <-- Manual photo folders
│       ├── project-one/
│       └── project-two/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── PageWrapper.tsx
│   │   ├── canvas/
│   │   │   └── HorizontalCanvas.tsx
│   │   └── works/
│   │       ├── PhotoGrid.tsx
│   │       └── Lightbox.tsx
│   ├── app/
│   │   ├── index.tsx
│   │   ├── works.tsx
│   │   ├── about.tsx
│   │   ├── contact.tsx
│   │   └── api/
│   │       ├── photos.ts
│   │       ├── about.ts
│   │       └── contact.ts
│   └── types/
│       └── portfolio.ts
└── package.json

## 7. System Rules & Agent Directives
1. **Source of Truth:** This file (`AGENTS.md`) is the absolute source of truth. Do not deviate from its tech stack, database schema, or design system without explicit user permission.
2. **TypeScript:** Write clean, strict TypeScript. Do not use `any`.
3. **Aesthetic Enforcement:** This project uses a "Darkroom / Cinema" aesthetic. Never use bright backgrounds, heavy borders, rounded corners (always 0px), or drop shadows. Rely entirely on Tailwind utility classes.
4. **Database Guardrails:** The database is seeded exclusively via `seed.ts` from `content.json` and the `public/my_projects/` directory. Do not build web-based upload forms or mutations.