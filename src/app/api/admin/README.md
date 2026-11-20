# `src/app/api/admin/` — Admin REST Endpoints (Mutation Layer)

This directory houses the backend **mutation and asset management endpoints** that power the Content Studio (`/manage`).

---

## 1. Request Lifecycle & Architecture

All admin endpoints perform **authoritative in-memory SQLite mutations**:

```
[ HTTP Request (PUT/POST/DELETE) ]
               │
               ▼
       1. requireAuth()           <-- Security checkpoint (placeholder for session/token verification)
               │
               ▼
       2. Validate Payload        <-- Checks input types, URL/email formats, slugs, and required fields
               │
               ▼
       3. Direct DB & Disk Action <-- Executes fast parameterized SQL queries via src/lib/db.ts
               │                      and manages physical files in public/my_projects/<slug>/
               ▼
       4. HTTP 200/201 JSON       <-- Returns updated state instantly (< 1ms execution)
```

Every endpoint enforces `export const dynamic = 'force-dynamic'` to prevent route caching.

---

## 2. Endpoints Inventory

### 1. `GET /api/admin/content` & `PUT /api/admin/content`
- **File:** [`content/route.ts`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/app/api/admin/content/route.ts)
- **GET:** Returns the full consolidated `ContentData` object directly from SQLite.
- **PUT:** Updates `owner` profile details, dynamic bio paragraphs, `social_links`, and `resume` entries in SQLite:
  - Automatically reassigns consecutive `display_order` values (1, 2, 3...) per resume section to prevent index collisions.
  - Enforces email, URL, and year validations.

### 2. `GET /api/admin/projects` & `POST /api/admin/projects`
- **File:** [`projects/route.ts`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/app/api/admin/projects/route.ts)
- **GET:** Returns all projects from SQLite enriched with an array of actual image filenames currently present in `public/my_projects/<slug>/`.
- **POST:** Creates a new project:
  - Validates slug format and uniqueness.
  - Creates the physical folder `public/my_projects/<slug>/`.
  - Inserts the project record into the `projects` table with automatic display ordering.

### 3. `PUT /api/admin/projects/[slug]` & `DELETE /api/admin/projects/[slug]`
- **File:** [`projects/[slug]/route.ts`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/app/api/admin/projects/[slug]/route.ts)
- **PUT:** Updates project `title` and/or `featured_images` list:
  - Verifies that featured image filenames actually exist in the project folder.
  - Atomically updates project and photo records in SQLite.
- **DELETE:** Permanently deletes a project:
  - Removes project and photo records from SQLite.
  - Recursively deletes the physical directory `public/my_projects/<slug>/`.

### 4. `POST /api/admin/projects/[slug]/images` & `DELETE /api/admin/projects/[slug]/images`
- **File:** [`projects/[slug]/images/route.ts`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/app/api/admin/projects/[slug]/images/route.ts)
- **POST:** Multipart form data file uploader:
  - Accepts one or multiple image files (`multipart/form-data`).
  - Restricts extensions to `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`, `.gif`.
  - Sanitizes filenames against directory traversal (`../`).
  - Writes image buffers to disk and inserts photo records into the SQLite `photos` table.
- **DELETE:** Deletes a specific photo:
  - Deletes the file from disk via `deleteProjectImage()`.
  - Deletes the photo record from the SQLite `photos` table.

### 5. `PUT /api/admin/projects/reorder`
- **File:** [`projects/reorder/route.ts`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/app/api/admin/projects/reorder/route.ts)
- **PUT:** Accepts an ordered array of project slugs `{ slugs: string[] }`:
  - Updates the `display_order` column for each project in SQLite in a single transaction.

---

## 3. Error Handling & Standard Responses

All routes return standard JSON responses with appropriate HTTP status codes:
- **`200 OK` / `201 Created`:** `{ success: true, ...data }`
- **`400 Bad Request`:** `{ error: string, errors?: FieldError[] }`
- **`404 Not Found`:** `{ error: string }`
- **`500 Internal Server Error`:** `{ error: string }`
