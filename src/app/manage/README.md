# `src/app/manage/` — Content Studio (Portfolio Management)

This directory implements the in-browser **Content Studio** where the website owner manages all knowledge and assets.

---

## 1. Architecture & Mental Model

In traditional headless CMS setups, the backend admin lives on a third-party service (e.g. Sanity, Strapi, Contentful). In this portfolio, the management interface is **embedded natively into the application**:

```
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

---

## 3. Key Design & UX Features

### A. Zero Collision Reordering
Instead of allowing users to type numerical indices (which causes duplicate order index bugs), reordering is handled visually via [`ReorderList`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/components/admin/ReorderList.tsx). The application automatically derives consecutive 1-based `display_order` values upon save.

### B. Landing Page Featured Selector
Within `/manage/projects`, each image thumbnail has a **`★ Featured`** button. Clicking it updates the photo's `is_featured` status in SQLite, directly governing which photos appear on the homepage lateral scroll canvas.

### C. Inline Confirmations
To adhere to the darkroom aesthetic and avoid jarring browser `window.confirm()` alert dialogs, deletions (projects, photos, resume entries, links) use two-step inline confirmation buttons.

---

## 4. Authentication Readiness

This route group is designed for frictionless auth integration:
- All data mutations pass through `src/app/api/admin/*`, where each route handler invokes `requireAuth()` from `src/lib/admin.ts`.
- When login is implemented, `requireAuth()` will check session cookies or tokens.
- Next.js edge middleware can protect the entire `/manage/:path*` route tree in a single rule.
