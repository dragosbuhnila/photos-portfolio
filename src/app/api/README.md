# `src/app/api/` — Route Handlers (REST API Layer)

This directory houses the **REST API endpoints** for the application.

If you are accustomed to building backends with Express (`app.get('/api/...', (req, res) => ...)`), this folder is the exact Next.js equivalent.

---

## 1. Why Have API Routes When Server Components Can Query SQLite Directly?

A common question for developers new to Next.js fullstack is:
> *"If `src/app/page.tsx` and `src/app/works/page.tsx` can query the database directly with `getAllPhotos()`, why do we need `/api/photos`?"*

There are three key reasons:
1. **External Consumers & Headless Usage:** If an external client, portfolio aggregator, or CLI wants to inspect photos or contact info, they can call `GET /api/photos` without scraping HTML.
2. **Client-Side Form Submissions & Mutations:** Interactive client pages in `/manage` dispatch standard HTTP requests (`POST`, `PUT`, `DELETE`) to `/api/admin/*` to perform transactions in SQLite.
3. **Binary Streaming & Backups:** Generating and streaming binary files (such as `.zip` archive backups via `GET /api/admin/backup`) requires a dedicated HTTP route handler.

---

## 2. API Endpoints Map

| Endpoint | File | Method | Description |
|---|---|---|---|
| `/api/photos` | [`photos/route.ts`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/app/api/photos/route.ts) | `GET` | Returns list of photos from SQLite. Supports `?featured=1` filter. |
| `/api/about` | [`about/route.ts`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/app/api/about/route.ts) | `GET` | Returns all resume and career entries from SQLite. |
| `/api/contact` | [`contact/route.ts`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/app/api/contact/route.ts) | `GET` | Returns contact details and social links from SQLite. |
| `/api/admin/content` | [`admin/content/route.ts`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/app/api/admin/content/route.ts) | `GET`, `PUT` | Fetches or updates site configuration, artist profile, social links, and reorders resume in SQLite. |
| `/api/admin/projects` | [`admin/projects/route.ts`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/app/api/admin/projects/route.ts) | `GET`, `POST` | Lists projects with disk images; creates new project folder and SQLite records. |
| `/api/admin/projects/[slug]` | [`admin/projects/[slug]/route.ts`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/app/api/admin/projects/[slug]/route.ts) | `PUT`, `DELETE` | Updates title/featured status; deletes project and all files from disk and SQLite. |
| `/api/admin/projects/[slug]/images` | [`admin/projects/[slug]/images/route.ts`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/app/api/admin/projects/[slug]/images/route.ts) | `POST`, `DELETE` | Multipart image uploader and single image deletion, synchronized to SQLite. |
| `/api/admin/projects/reorder` | [`admin/projects/reorder/route.ts`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/app/api/admin/projects/reorder/route.ts) | `PUT` | Reorders project sequence in SQLite in a single transaction. |
| `/api/admin/backup` | [`admin/backup/route.ts`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/app/api/admin/backup/route.ts) | `GET` | Truncates WAL log into `portfolio.db` and streams a complete PKZIP 2.0 archive containing database and media files. |

> See [`src/app/api/admin/README.md`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/app/api/admin/README.md) for full admin route documentation.

---

## 3. How Next.js Route Handlers Work

In Next.js App Router, any file named `route.ts` inside `src/app/api/` becomes an HTTP handler.

### Comparing Express vs. Next.js Route Handlers

**Express:**
```ts
// server.js
import express from 'express';
const app = express();

app.get('/api/photos', (req, res) => {
  const featured = req.query.featured;
  const photos = featured === '1' ? getFeaturedPhotos() : getAllPhotos();
  res.json(photos);
});
```

**Next.js (`src/app/api/photos/route.ts`):**
```ts
import { NextResponse } from 'next/server';
import { getFeaturedPhotos, getAllPhotos } from '@/lib/db';

export const dynamic = 'force-dynamic';

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const featured = searchParams.get('featured');

  const photos = featured === '1' ? getFeaturedPhotos() : getAllPhotos();
  return NextResponse.json(photos);
}
```

### Key Differences & Benefits:
- **Standard Web APIs:** Uses standard Web `Request` and `Response` interfaces (the same as fetch and service workers).
- **HTTP Methods as Named Exports:** You export functions matching HTTP verbs: `GET`, `POST`, `PUT`, `DELETE`.
- **Force Dynamic:** All API route handlers export `export const dynamic = 'force-dynamic'` to ensure fresh database query execution on every request.
