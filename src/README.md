# `src/` — Architecture & Fullstack Mental Model

Welcome to the core codebase of the photography portfolio!

If you are coming from a traditional **decoupled React SPA + separate backend (Express, Django, FastAPI, Go, etc.)**, this document explains how Next.js unifies both worlds into a single repository and how this specific project is structured.

---

## 1. The Mental Shift: React SPA vs. Fullstack Next.js (App Router)

### Traditional Decoupled Stack
```
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
```
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
4. **Built-in Route Handlers (`src/app/api/`):** When you *do* need a REST API (for external consumers, webhooks, or dynamic client-side fetching), Next.js provides `route.ts` files that act just like Express route handlers.

---

## 2. Directory Layout at a Glance

| Directory | Role in the Application | Runs On |
|---|---|---|
| [`src/app/`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/app/README.md) | **Routing & Page Composition**<br>Defines URLs, layouts, and page entrypoints. Includes public routes and the `/manage` Content Studio. | Server & Client |
| [`src/app/api/`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/app/api/README.md) | **REST API Route Handlers**<br>Endpoints that return raw JSON (`/api/photos`, `/api/about`, `/api/contact`) and handle admin mutations (`/api/admin/*`). | Server (Node.js) |
| [`src/components/`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/components/README.md) | **UI Component Library**<br>Interactive widgets, layouts, sliders, grids, modal lightboxes, and admin studio components. | Mostly Client (`'use client'`) |
| [`src/lib/`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/lib/README.md) | **Backend Services & Data Layer**<br>SQLite database (`better-sqlite3`), read/write query layer, admin filesystem operations, and validation. | Server & Shared |
| [`src/types/`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/types/README.md) | **TypeScript Contracts**<br>Shared interfaces used across DB queries, API responses, form validation, and React props. | Type system (Build/Compile) |

---

## 3. How Data Flows Through the Project

Here is the exact lifecycle of a request in this portfolio:

1. **Database as Single Source of Truth:**
   - All projects, photos, featured states, site profile data, social links, and resume entries live in `db/portfolio.db`.
   - `better-sqlite3` runs in WAL (Write-Ahead Logging) mode with transactional safety.

2. **Incoming Request (e.g. User navigates to `/works`):**
   - Next.js matches the route to `src/app/works/page.tsx`.
   - Being a Server Component, `WorksPage` invokes `getAllPhotos()` from `src/lib/db.ts`.
   - `src/lib/db.ts` executes a parameterized SQL query synchronously against `db/portfolio.db` (< 1ms).
   - `WorksPage` groups the returned photos into `ProjectGroup[]` arrays.
   - `WorksPage` renders the server shell (Header, Title, Footer) and embeds `<PhotoGrid groups={groups} />`.

3. **Client-Side Interactivity:**
   - `<PhotoGrid />` and `<Lightbox />` are marked `'use client'`.
   - Next.js sends the initial HTML immediately so the user sees the photos without any layout shift.
   - In the browser, React mounts (`hydrates`) the interactive handlers: clicking a photo opens the Lightbox modal, arrow keys navigate between slides, and the URL updates with `?highlight=ID`.

4. **In-Browser Content Management (`/manage`):**
   - The owner edits profile details, creates projects, uploads imagery, or reorders resume entries via `/manage`.
   - Client and server validation (`src/lib/validation.ts`) prevents invalid inputs and priority collisions.
   - Route handlers (`src/app/api/admin/*`) execute direct SQL mutations in `src/lib/db.ts` and manage files on disk.
   - The database updates instantly in-memory without child processes or server restarts.

---

## 4. Key Rules & Conventions

- **Path Aliases:** `@/` is configured in `tsconfig.json` to map directly to `src/` (e.g. `@/lib/db`, `@/components/layout/Header`).
- **Strict TypeScript:** No `any`. All database models and props adhere to types defined in `src/types/portfolio.ts`.
- **Aesthetic Enforcement:** "Darkroom / Cinema" style. Matte charcoal background (`#121212`), muted silver/gray text, zero border-radius (`rounded-none`), zero drop-shadows. Images are the primary light source.
