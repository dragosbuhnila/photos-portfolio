# `src/components/canvas/` — Landing Page Horizontal Canvas

This folder contains the core visual feature of the landing page (`/`): a lateral-scrolling photography canvas.

---

## What Happens Here

Instead of standard vertical website scrolling, the landing page uses an interactive horizontal showcase:
- Displays records from the `photos` SQLite table where `is_featured = 1` (capped at 10 items).
- Translates vertical mouse wheel rotation into horizontal slide transitions.
- Supports mobile touch swipe gestures (threshold of 40px).
- Employs an infinite looping slide buffer.
- Provides keyboard navigation (Left / Right arrow keys).
- Clicking any slide navigates the user to the Works page with the photo highlighted: `/works?highlight=ID&project=slug`.

---

## File Breakdown

### 1. [`HorizontalCanvas.tsx`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/components/canvas/HorizontalCanvas.tsx) (`'use client'`)
The container managing navigation, slide transitions, and user inputs:
- **Infinite Loop Technique:** Clones the last slide to index `0` and the first slide to index `N+1`. When transitioning past the ends, it jumps seamlessly without animation (`enableTransition: false`), creating an illusion of infinite looping.
- **Wheel Translation:** Intercepts `onWheel` events and triggers next/previous slide transitions with a 450ms cooldown to prevent accidental rapid skips.
- **Touch Gesture Handling:** Tracks `touchstart` and `touchend` client coordinates to detect left/right swipes on touchscreens.
- **Dots & Arrows:** Minimalist indicators and subtle chevron buttons that appear on hover.

### 2. [`CanvasPhotoItem.tsx`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/components/canvas/CanvasPhotoItem.tsx) (`'use client'`)
The individual slide renderer:
- **Aspect Ratio & Fit:** Uses `object-contain` with letterboxing against `#121212` so the entire photograph is visible without cropping.
- **Cinematic Hover State:** Subtle zoom (`scale-[1.015]`) and darkened contrast transition.
- **Darkroom Metadata Bar:** Displays project title, frame index (`01 / 09`), and a "View in Works" link.

---

## React Concepts Demonstrated

- `useRef` for tracking swipe coordinates and cooldown timestamps without triggering unnecessary re-renders.
- `useCallback` and `useEffect` for global window keyboard listener binding.
- Client-side navigation via `useRouter()` from `next/navigation`.
