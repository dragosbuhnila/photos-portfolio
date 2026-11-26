# `src/components/works/` — Works Gallery & Lightbox

This folder contains the photo gallery, grid presentation, and fullscreen lightbox modal used on the `/works` page.

---

## What Happens Here

Implements the complete interactive photo exploration experience:
- Organizes images by project groups with project titles and photo counts.
- Displays images in a responsive masonry-style grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`).
- Handles click events to open a fullscreen modal Lightbox.
- Supports client-side deep linking: navigating to `/works?highlight=12` or `/works#photo-12` automatically scrolls to the photo and outlines it.
- Resolves asset paths via [`getAssetPath()`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/lib/assets.ts) for subpath deployments.
- Provides full keyboard accessibility (Escape to close, Left/Right arrow keys to navigate).
- Locks body scroll while the lightbox is active.

---

## File Breakdown

### 1. [`PhotoGrid.tsx`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/components/works/PhotoGrid.tsx) (`'use client'`)
The master coordinator for the works catalog:
- **Props:** Receives `groups: ProjectGroup[]` and optional `initialHighlightId?: number` from [`src/app/works/page.tsx`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/app/works/page.tsx).
- **Lightbox Synchronization:** Flattens all photos across all projects into a single sequential list so the lightbox can transition between photos seamlessly across project boundaries.
- **Client Auto-Highlight:** Inspects `window.location.search` (`?highlight=ID`) or hash (`#photo-ID`) on mount, scrolls smoothly to center the targeted photo, and applies highlight styling. Dismisses highlight on any subsequent click.

### 2. [`PhotoCard.tsx`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/components/works/PhotoCard.tsx) (`'use client'`)
The individual thumbnail in the grid:
- **Base Path Resolution:** Resolves image source via `getAssetPath(photo.image_path)`.
- **Aspect Ratio:** Fixed `aspect-[3/2]` container with `object-cover` styling.
- **Darkroom Aesthetics:** Zero border-radius (`rounded-none`), subtle hover brightness shift, and outline highlight frame when targeted.
- **Click Handling:** Triggers the parent's `onOpenLightbox` callback.

### 3. [`Lightbox.tsx`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/components/works/Lightbox.tsx) (`'use client'`)
The fullscreen immersive photo viewer:
- **Portal & Backdrop:** Renders a fixed overlay with 95% opacity matte charcoal (`bg-canvas/95 backdrop-blur-md`).
- **Base Path Resolution:** Uses `getAssetPath(activePhoto.image_path)`.
- **Body Scroll Locking:** Disables `document.body.style.overflow = 'hidden'` while open and restores it cleanly on unmount.
- **Keyboard Navigation:** Listens for `Escape` (close), `ArrowLeft` (previous), and `ArrowRight` (next).
- **Touch Swipe:** Tracks touch movements so mobile users can swipe between photos.
- **Full Resolution Display:** Renders the image with `object-contain` to preserve true photographic aspect ratios.
