# `src/` — Architecture & Fullstack Mental Model

Welcome to the core codebase of the photography portfolio!

If you are coming from a traditional **decoupled React SPA + separate backend (Express, Django, FastAPI, Go, etc.)**, this document explains how Next.js unifies both worlds into a single repository and how this specific project is structured.

---

## 1. The Mental Shift: React SPA vs. Fullstack Next.js (App Router)

### Traditional Decoupled Stack
```text
[ Browser (React SPA) ]  <--- HTTP JSON API --->  [ Node.js / Express Server ]  <--->  [ Database ]
  - Vite / CRA bundle                               - Express / Fastify routes
  - useEffect + fetch()                             - CORS configuration
  - Loading spinners                                - ORM / SQL queries
  - Client-side routing                             - Auth & cookies
```
In that model, your frontend and backend are two distinct programs:
1. The browser downloads a large JS bundle with an empty `<div id="root"></div>`.
2. A React component mounts, triggers `useEffect`, and calls `fetch('https://api.domain.com/photos')`.
3. The Express backend receives the HTTP request, queries SQLite/PostgreSQL, and responds with JSON.
4. React receives the JSON, updates state (`setPhotos`), and re-renders the DOM.

---

### Next.js App Router (Fullstack in One Framework)
```text
[ Browser ]                  [ Next.js Server Runtime (Node.js) ]           [ SQLite (portfolio.db) ]
     |                                      |                                    |
     |--- 1. HTTP GET /works -------------->|                                    |
     |                                      |--- 2. Direct SQLite Query -------->| (WAL mode via better-sqlite3)
     |                                      |<-- 3. Returns Row Data ------------|
     |                                      |
     |                                      | (Renders React Server Components)
     |<-- 4. Pre-rendered HTML + CSS -------|
     |    (Zero client JS for static parts) |
     |                                      |
     |--- 5. Client Component Hydration --->| (Only for interactive components like Lightbox)
```

In Next.js 14 App Router:
1. **Server Components by Default:** Every file inside `src/app/` (e.g. `page.tsx`) is a **React Server Component (RSC)** unless marked with `'use client'`. Server components run **only on the server**.
2. **Direct Data Access (No Internal REST Roundtrips):** Because `page.tsx` runs inside Node.js on the server, it can import `@/lib/db` and execute SQLite queries **directly**. You do *not* need to create an API route and fetch from it just to render a page!
3. **Selective Client Hydration (`'use client'`):** When a component needs browser APIs, event listeners (`onClick`, `onWheel`), or React hooks (`useState`, `useEffect`, `useRef`), you mark that specific component with `'use client'`. It runs on the client while receiving data passed as props from server components.
4. **Built-in Route Handlers (`src/app/api/`):** When you *do* need a REST API (for external consumers or client-side form submissions), Next.js provides `route.ts` files that act just like Express route handlers.

---

## 2. Directory Layout at a Glance

| Directory | Role in the Application | Runs On |
|---|---|---|
| [`src/app/`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/app/README.md) | **Routing & Page Composition**<br>Defines URLs, layouts, and page entrypoints. Includes public routes (`/`, `/works`, `/about`, `/contact`), dynamic image streaming (`/my_projects/*`), and the `/manage` Content Studio. | Server & Client |
| [`src/app/api/`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/app/api/README.md) | **REST API Route Handlers**<br>Endpoints that return raw JSON (`/api/photos`, `/api/about`, `/api/contact`), handle admin mutations (`/api/admin/*`), and generate full snapshot backup archives (`/api/admin/backup`). | Server (Node.js) |
| [`src/components/`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/components/README.md) | **UI Component Library**<br>Interactive widgets, layouts, sliders, grids, modal lightboxes, and admin studio controls. | Mostly Client (`'use client'`) |
| [`src/lib/`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/lib/README.md) | **Backend Services & Core Utilities**<br>SQLite database (`better-sqlite3`), transactional read/write layer, backup packager (`zip.ts`), asset path resolver (`assets.ts`), admin filesystem operations (`admin.ts`), and isomorphic validation (`validation.ts`). | Server & Shared |
| [`src/types/`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/types/README.md) | **TypeScript Contracts**<br>Shared interfaces used across DB queries, API responses, form validation, and React props. | Type system (Build/Compile) |

---

## 3. How Data Flows Through the Project

Here is the exact lifecycle of operations in this portfolio:

### A. Public Request Lifecycle (e.g. Navigating to `/works`):
1. Next.js matches the route to `src/app/works/page.tsx`.
2. Being a Server Component, `WorksPage` invokes `getAllPhotos()` from [`src/lib/db.ts`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/lib/db.ts).
3. `src/lib/db.ts` executes a parameterized SQL query synchronously against `db/portfolio.db` (< 1ms).
4. `WorksPage` groups the returned photos into `ProjectGroup[]` arrays.
5. `WorksPage` renders the server shell (Header, Title, Footer) and embeds `<PhotoGrid groups={groups} />`.
6. Next.js sends the initial HTML immediately so the user sees the photos without layout shift.
7. React hydrates the interactive handlers: clicking a photo opens `<Lightbox />`, arrow keys navigate slides, and URL parameters (`?highlight=ID`) trigger auto-scrolling.

### B. In-Browser Content Management (`/manage`):
1. The site owner edits profile details, creates projects, uploads imagery, or reorders resume entries via `/manage`.
2. Client and server validation ([`src/lib/validation.ts`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/lib/validation.ts)) prevents invalid inputs and priority collisions.
3. Route handlers (`src/app/api/admin/*`) execute direct SQL mutations in `src/lib/db.ts` and manage files on disk via `src/lib/admin.ts`.
4. The database updates instantly on disk without server restarts.

### C. Backup & Data Preservation (`/manage/backup`):
1. Initiating a backup triggers `GET /api/admin/backup`.
2. The server executes `wal_checkpoint(TRUNCATE)` on SQLite to flush journal frames into `portfolio.db`.
3. [`src/lib/zip.ts`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/lib/zip.ts) creates a pure PKZIP 2.0 archive in-memory containing `db/portfolio.db` and the full `public/` directory.
4. The client browser automatically downloads `portfolio-backup-<timestamp>.zip`.

### D. Static Site Generation & Deployment:
1. Running `npm run build:static` invokes [`scripts/build-static.js`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/scripts/build-static.js).
2. The script temporarily isolates `/manage`, `/api`, and `/my_projects` routes.
3. Next.js executes `next build` with `output: 'export'` and `NEXT_PUBLIC_STATIC_EXPORT=true`.
4. Header navigation automatically omits the `/manage` link.
5. All asset paths are resolved with repository subpath support via [`src/lib/assets.ts`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/lib/assets.ts).
6. The compiled static website is written into `./out/` and deployed to GitHub Pages via GitHub Actions.
7. Local routes and files are cleanly restored once the static build completes.

---

## 4. Key Rules & Conventions

- **Path Aliases:** `@/` is configured in `tsconfig.json` to map directly to `src/` (e.g. `@/lib/db`, `@/components/layout/Header`).
- **Strict TypeScript:** No `any`. All database models and props adhere to types defined in [`src/types/portfolio.ts`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/types/portfolio.ts).
- **Aesthetic Enforcement:** "Darkroom / Cinema" style. Matte charcoal background (`#121212`), muted silver/gray text, zero border-radius (`rounded-none`), zero drop-shadows. Images are the primary light source.
