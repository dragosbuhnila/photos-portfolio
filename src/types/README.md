# `src/types/` — TypeScript Contracts & Domain Models

This folder contains the **TypeScript interfaces, domain contracts, and type declarations** used throughout the portfolio.

---

## 1. The Fullstack Advantage: End-to-End Type Safety

In a separated React + Express architecture, type definitions are frequently duplicated:
- A `types.ts` in the Express backend defining database rows.
- A `types.ts` in the React frontend defining API responses.
- If a field is renamed on the backend, the frontend breaks silently until runtime.

In Next.js fullstack, **both backend and frontend share the exact same type contracts**:

```text
                         src/types/portfolio.ts
                                   |
        +--------------------------+--------------------------+
        |                          |                          |
   Backend Layer              API Layer                 Frontend Layer
   src/lib/db.ts         src/app/api/photos/        src/components/works/
   (SQLite query)            (NextResponse)             (PhotoGrid props)
```

If you change a field in `portfolio.ts`, running `npx tsc` will instantly report every line of backend SQL mapping, API serialization, and React JSX that requires attention across the entire codebase.

---

## 2. File Breakdown

### [`portfolio.ts`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/types/portfolio.ts)
Defines the core domain models:
- **`Photo`:** Matches the SQLite `photos` table schema:
  - `id`: Unique identifier (`INTEGER`).
  - `project_slug`: Foreign key matching `projects.slug`.
  - `file_name`: Image filename on disk (e.g. `dome.jpg`).
  - `title`: Display title or project series name (`string | null`).
  - `image_path`: Resolved web path (e.g. `/my_projects/urban-geometry/dome.jpg`).
  - `is_featured`: Boolean flag governing appearance on the landing page canvas.
  - `display_order`: Numerical sequence order within the project.
  - `project_total?`: Optional total count of images in this project collection.
- **`ResumeEntry`:** Matches career history stored in SQLite:
  - `id?`: Unique identifier.
  - `section`: Category name (`experience`, `education`, `exhibition`).
  - `title`: Position, degree, or exhibition title.
  - `organization`: Company, institution, or gallery.
  - `period`: Date range or year string.
  - `display_order`: Numerical sequence order within the section.
- **`ProjectGroup`:** Grouped photo collection used to render project clusters on the `/works` page (`slug`, `title`, `photos: Photo[]`).
- **`OwnerInfo`:** Photographer details stored in `site_settings` (`name`, `email`, `location`, `available_for_travel?`, `copyright_year?`, `bio: string[]`).
- **`SocialLink`:** Outbound profiles stored in `social_links` (`id?`, `label`, `handle?`, `url`).
- **`NavLink`:** Header navigation links (`label`, `href`).
- **`ContentData`:** Consolidated schema representing site metadata, owner, social links, navigation, projects, and resume entries.

### [`styles.d.ts`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/types/styles.d.ts)
- Ambient TypeScript module declaration enabling type checking for CSS module imports.

---

## 3. Strict Mode Directives

In accordance with project rules:
- All interfaces use strict TypeScript.
- No `any` types are permitted.
- Nullable fields (e.g. `title: string | null`) are explicitly typed to prevent undefined property errors during render.
