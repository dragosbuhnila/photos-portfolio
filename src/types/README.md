# `src/types/` — TypeScript Contracts & Domain Models

This folder contains the **TypeScript interfaces and type declarations** used throughout the portfolio.

---

## 1. The Fullstack Advantage: End-to-End Type Safety

In a separated React + Express architecture, type definitions are often duplicated:
- A `types.ts` in the Express backend defining database rows.
- A `types.ts` in the React frontend defining API responses.
- If a field is renamed on the backend, the frontend breaks silently until runtime.

In Next.js fullstack, **both backend and frontend share the exact same type contracts**:

```
                         src/types/portfolio.ts
                                   |
        +--------------------------+--------------------------+
        |                          |                          |
   Backend Layer              API Layer                 Frontend Layer
   src/lib/db.ts         src/app/api/photos/        src/components/works/
   (SQLite query)            (NextResponse)             (PhotoGrid props)
```

If you rename `project_slug` to `project_id`, running `npx tsc` will instantly report every line of backend SQL mapping, API serialization, and React JSX that needs attention across the entire stack.

---

## 2. File Breakdown

### [`portfolio.ts`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/types/portfolio.ts)
Defines the core domain models:
- **`Photo`:** Matches the SQLite `photos` table schema (`id`, `project_slug`, `file_name`, `title`, `image_path`, `is_featured`, `display_order`, `project_total`).
- **`ResumeEntry`:** Matches career history stored in SQLite (`id?: number`, `section`, `title`, `organization`, `period`, `display_order`).
- **`ProjectGroup`:** Grouped photo collection used to render project clusters on the `/works` page.
- **`OwnerInfo` & `SocialLink` & `NavLink`:** Matches photographer metadata and navigation stored in SQLite (`site_settings` & `social_links`).
- **`ContentData`:** The complete validated schema representing the consolidated website metadata model.

### [`styles.d.ts`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/types/styles.d.ts)
- Ambient TypeScript module declaration enabling type checking for CSS module imports.

---

## 3. Strict Mode Directives

In accordance with project rules:
- All interfaces use strict TypeScript.
- No `any` types are permitted.
- Nullable fields (e.g. `title: string | null`) are explicitly typed to prevent undefined property errors during render.
