# `src/components/admin/` — Content Studio UI Components

This directory contains the reusable UI controls and navigation components that power the in-browser Content Studio (`/manage`).

---

## 1. Design System & Aesthetic Principles

Like the public portfolio, all admin components strictly adhere to the **Darkroom / Cinema** design rules:
- **Zero Border Radius (`rounded-none`):** Absolutely no rounded corners on inputs, buttons, cards, or badges.
- **No Drop Shadows:** Flat, matte presentation; depth is conveyed solely through contrast and subtle `border-neutral-800` dividers.
- **Matte Charcoal Backgrounds:** Uses `bg-neutral-900` and `bg-neutral-950` over matte `#121212` (`bg-canvas`). Strictly no pure black (`#000000`).
- **Typography:** Muted uppercase labels with letter tracking (`tracking-[0.15em]`), bright off-white values (`#E5E5E5`).

---

## 2. Component Inventory

### 1. [`AdminField.tsx`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/components/admin/AdminField.tsx) (`'use client'`)
A standardized form field component supporting `text`, `email`, `url`, `number`, and multi-line `textarea` inputs.
- **Props:** `label`, `value`, `onChange`, `type`, `error`, `placeholder`, `required`, `disabled`, `rows`, `hint`.
- **Validation Display:** Automatically renders red validation error messages below the input when validation fails.
- **Focus States:** High-contrast neutral border transitions without glow or shadow.

### 2. [`ReorderList.tsx`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/components/admin/ReorderList.tsx) (`'use client'`)
A TypeScript generic (`<T>`) interactive list component that allows the user to adjust the priority order of items.
- **Collision Prevention:** Eliminates manual numerical index inputs. Items are shifted up or down with dedicated `▲` / `▼` priority buttons.
- **Position Badges:** Renders formatted position counters (`01`, `02`, `03`...).
- **Boundary Guards:** Automatically disables the `▲` button for the first element and `▼` for the last element.

### 3. [`AdminSidebar.tsx`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/components/admin/AdminSidebar.tsx) (`'use client'`)
The left navigation panel for the Content Studio.
- **Active Route Detection:** Uses Next.js `usePathname()` to highlight the active section with a vertical border indicator (`border-l-2 border-text-bright`).
- **Responsive Layout:** Displays as a left sidebar on desktop (`w-64`) and converts to a scrollable top bar on mobile devices.
- **Nav Links:**
  - **Profile (`/manage`):** Owner details & bio.
  - **Projects (`/manage/projects`):** Galleries, uploads & featured toggles.
  - **Resume (`/manage/resume`):** Experience, education & exhibitions.
  - **Social Links (`/manage/social`):** Handles & outbound links.
  - **Backup (`/manage/backup`):** Full snapshot packaging (database & photos).

### 4. [`AdminToast.tsx`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/components/admin/AdminToast.tsx) (`'use client'`)
A minimalist notification toast fixed to the bottom-right of the screen.
- **Auto-Dismiss:** Clears messages automatically after a configurable duration (default: 3500ms).
- **Status Variants:** Supports `success` (subtle emerald border), `error` (subtle crimson border), and `info`.
- **Manual Dismiss:** Includes a `✕` close button.
