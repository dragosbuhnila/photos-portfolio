# `src/app/` — Next.js App Router & Server Pages

This folder contains the **App Router** for the portfolio. In Next.js 13+, directory structure directly dictates the application's URL paths and server execution pipeline.

---

## 1. What's Happening Here? (The React + Express Analogy)

In a traditional React + Express setup:
1. **React Router** in the browser checks the URL and mounts a client-side component:
   ```tsx
   <Routes>
     <Route path="/works" element={<WorksPage />} />
   </Routes>
   ```
2. `WorksPage` mounts and fires a network request to an Express route:
   ```ts
   // Express server
   app.get('/api/works', (req, res) => {
     const data = db.all('SELECT * FROM photos');
     res.json(data);
   });
   ```
3. React renders a blank loading state until the JSON arrives.

### How Next.js App Router Replaces This
In Next.js, the folder structure **is** the router, and every `page.tsx` is an **async React Server Component (RSC)**:
- Navigating to `/works` executes `src/app/works/page.tsx` directly inside Node.js.
- `WorksPage` calls the database directly:
  ```tsx
  // src/app/works/page.tsx (Runs on the Server)
  import { getAllPhotos } from '@/lib/db';

  export default function WorksPage() {
    const photos = getAllPhotos(); // Direct SQLite call!
    return <PhotoGrid photos={photos} />;
  }
  ```
- The server computes the initial HTML containing the photos and delivers it in the initial HTTP response. No loading flicker, no client-side fetch, and no separate backend process.

---

## 2. Directory & Route Map

| Folder / File | URL Route | Type | Description |
|---|---|---|---|
| [`layout.tsx`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/app/layout.tsx) | *Global Shell* | Server Component | The root HTML wrapper. Renders `<html>`, `<body>`, `<Header>`, `<main>`, and `<Footer>`. Persists across all page transitions. |
| [`page.tsx`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/app/page.tsx) | `/` (Home) | Server Component | Landing page. Fetches featured photos from SQLite and renders the lateral-scrolling canvas. |
| [`globals.css`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/app/globals.css) | *Global Styles* | CSS | Tailwind CSS directives, custom utilities (e.g. scrollbar hiding), and theme overrides. |
| [`about/`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/app/about/README.md) | `/about` | Server Component | Two-column editorial about page (bio & structured resume). |
| [`contact/`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/app/contact/README.md) | `/contact` | Server Component | Contact information & click-to-copy email interactions. |
| [`works/`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/app/works/README.md) | `/works` | Server Component | Complete catalog of photos grouped by project slug with lightbox support. |
| [`manage/`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/app/manage/README.md) | `/manage/*` | Server Layout + Client Subpages | Content Studio for photographer bio, photo uploads, project management, and collision-free resume ordering. |
| [`api/`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/app/api/README.md) | `/api/*` | Route Handlers | HTTP API endpoints returning JSON for REST consumers and admin mutation routes. |

---

## 3. Key Concepts to Know

### `export const dynamic = 'force-dynamic'`
At the top of several pages and routes, you will see:
```ts
export const dynamic = 'force-dynamic';
```
- By default, Next.js tries to statically pre-render (SSG) pages at build time.
- Because this portfolio uses a local SQLite database that can be re-seeded or modified without rebuilding the entire JavaScript application, `force-dynamic` tells Next.js to execute the server component and query the database **at the time of every incoming request**.

### Server Components vs. Client Components Boundary
Pages in `src/app/` are Server Components. They do not have access to:
- Browser APIs (`window`, `document`, `navigator.clipboard`, `localStorage`).
- React state hooks (`useState`, `useReducer`, `useEffect`, `useRef`).
- DOM event handlers (`onClick`, `onKeyDown`, `onWheel`).

Whenever interactivity is needed (e.g. lightbox modal, swipe slider, clipboard copying), the Server Page imports and renders a component from `src/components/` marked with `'use client'`.
