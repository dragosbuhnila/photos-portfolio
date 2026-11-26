# `src/components/` — UI Component Architecture

This directory houses the reusable UI components for the portfolio.

---

## 1. The Mental Shift: Components in Next.js vs. React SPA

In a standard React SPA (Vite / CRA), every single component you write is rendered on the client browser. You could freely use `useState`, `useEffect`, `window`, and `onClick` in any file.

In Next.js App Router, there are **two types of components**:

```text
                         React Components
                                |
        +-----------------------+-----------------------+
        |                                               |
  Server Components                               Client Components
  (Default in Next.js)                           (Marked with 'use client')
  - Executed on server                            - Executed in browser (+ SSR)
  - Zero client JavaScript bundle                 - Can use useState, useEffect, useRef
  - Can read files & databases                    - Can use onClick, onWheel, gestures
  - Cannot use hooks or DOM events                - Cannot use server-only libraries (fs, sqlite)
  - Example: PageWrapper                          - Examples: HorizontalCanvas, Lightbox, AdminSidebar
```

---

## 2. Directory Structure by Feature Domain

Instead of dumping dozens of files into one folder or splitting artificially by atomic design (`atoms`, `molecules`), components are grouped by **feature domain**:

```text
src/components/
├── layout/     --> Shell framing used across all pages (Header, Footer, PageWrapper)
├── canvas/     --> Landing page horizontal slider & gesture translation
├── works/      --> Works grid, photo cards, and modal lightbox
├── contact/    --> Contact info & click-to-copy interactions
└── admin/      --> Content Studio controls (forms, reordering list, toast alerts, sidebar)
```

### Folder Directory Map

| Directory | Primary Role | Mode |
|---|---|---|
| [`layout/`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/components/layout/README.md) | Site header, dynamic navigation bar, footer with social links, and uniform page container. | Server & Client |
| [`canvas/`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/components/canvas/README.md) | Horizontal scrolling landing canvas with wheel translation, touch swipe, and infinite loop. | Client (`'use client'`) |
| [`works/`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/components/works/README.md) | Project masonry grids, hover overlays, deep-linking auto-highlight, and keyboard-accessible fullscreen lightbox. | Client (`'use client'`) |
| [`contact/`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/components/contact/README.md) | Editorial contact layout with copy-to-clipboard button and visual feedback. | Client (`'use client'`) |
| [`admin/`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/components/admin/README.md) | CMS form inputs, interactive priority reorder list, notification toasts, and admin sidebar with backup controls. | Client (`'use client'`) |

---

## 3. Best Practices Followed in This Project

1. **Keep Server-Side Data Fetching in `app/`:**
   - Components in this folder receive data as props. They do not call `fetch('/api/photos')` on mount when the page can supply data directly from SQLite.
2. **Push `'use client'` to the Leaves:**
   - Server components wrap client components. For example, [`src/app/page.tsx`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/app/page.tsx) (Server) fetches photos and passes them to `<HorizontalCanvas photos={featured} />` (Client).
3. **Subpath Asset Resolution:**
   - All image-rendering components (`CanvasPhotoItem`, `PhotoCard`, `Lightbox`) pass image paths through [`getAssetPath()`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/lib/assets.ts) to correctly resolve base paths when deployed to GitHub Pages.
4. **Adaptive Navigation:**
   - The `<Header />` component detects static export mode (`NEXT_PUBLIC_STATIC_EXPORT=true`) and automatically excludes the `/manage` studio link from the public navigation menu.
5. **Strict Darkroom / Cinema Styling:**
   - No rounded corners (`rounded-none`).
   - Deep matte charcoal (`bg-canvas` / `#121212`).
   - Muted typography (`text-text-muted` / `#A0A0A0`).
   - Zero drop shadows and zero borders.
