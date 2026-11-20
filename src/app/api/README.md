# `src/app/api/` — Route Handlers (REST API Layer)

This directory houses the **REST API endpoints** for the application.

If you are accustomed to building backends with Express (`app.get('/api/...', (req, res) => ...)`), this folder is the exact Next.js equivalent.

---

## 1. Why Have API Routes When Server Components Can Query SQLite Directly?

A common question for developers new to Next.js fullstack is:
> *"If `src/app/page.tsx` and `src/app/works/page.tsx` can query the database directly with `getAllPhotos()`, why do we need `/api/photos`?"*

There are three key reasons:
1. **External Consumers & Headless Usage:** If a mobile app, external service, portfolio aggregator, or CLI wants to inspect photos or contact info, they can call `GET /api/photos` without scraping HTML.
2. **Client-Side Dynamic Fetching:** If a client component needs to lazily fetch additional data without a full page reload (e.g. infinite scroll, filter changes, search queries), it can invoke `fetch('/api/photos?featured=1')`.
3. **Decoupled Architecture:** Having clear API contracts ensures the data layer can be tested or consumed independently of the UI presentation.

---

## 2. API Endpoints Map

| Endpoint | File | Method | Description |
|---|---|---|---|
| `/api/photos` | [`photos/route.ts`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/app/api/photos/route.ts) | `GET` | Returns list of photos from SQLite. Supports `?featured=1` filter. |
| `/api/about` | [`about/route.ts`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/app/api/about/route.ts) | `GET` | Returns all resume/career entries from SQLite. |
| `/api/contact` | [`contact/route.ts`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/app/api/contact/route.ts) | `GET` | Returns contact details and social links from SQLite. |
| `/api/admin/content` | [`admin/content/route.ts`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/app/api/admin/content/route.ts) | `GET`, `PUT` | Fetches or updates site configuration, artist profile, social links, and reorders resume in SQLite. |
| `/api/admin/projects` | [`admin/projects/route.ts`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/app/api/admin/projects/route.ts) | `GET`, `POST` | Lists projects with disk images; creates new project folder and SQLite records. |
| `/api/admin/projects/[slug]` | [`admin/projects/[slug]/route.ts`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/app/api/admin/projects/[slug]/route.ts) | `PUT`, `DELETE` | Updates title/featured status; deletes project and all files from disk and SQLite. |
| `/api/admin/projects/[slug]/images` | [`admin/projects/[slug]/images/route.ts`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/app/api/admin/projects/[slug]/images/route.ts) | `POST`, `DELETE` | Multipart image uploader and single image deletion, synced to SQLite. |
| `/api/admin/projects/reorder` | [`admin/projects/reorder/route.ts`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/app/api/admin/projects/reorder/route.ts) | `PUT` | Reorders project sequence in SQLite. |

See the [`src/app/api/admin/README.md`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/app/api/admin/README.md) for full admin route documentation.

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
- **Standard Web APIs:** Uses the standard Web `Request` and `Response` interfaces (the same as fetch and service workers), not Express `req`/`res`.
- **HTTP Methods as Named Exports:** You export functions matching HTTP verbs: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`.
- **No CORS Issues for Internal Calls:** When called from the frontend within the same domain, same-origin applies automatically without extra middleware.
