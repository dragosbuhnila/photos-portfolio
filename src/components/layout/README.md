# `src/components/layout/` — Global Shell & Framing

This folder contains the structural frame that wraps every page of the portfolio.

---

## What Happens Here

Provides a persistent frame across all routes:
- **Header:** Sticky top navigation bar displaying the photographer's name (left) and links to `Index`, `Works`, `About`, `Contact`, and `Manage` (right).
- **Footer:** Bottom bar displaying direct mail contact, social links, and the copyright notice (`© 2026 [Name]. All rights reserved.`).
- **PageWrapper:** Standardized container maintaining darkroom margins and padding across all routes.

These components are assembled inside [`src/app/layout.tsx`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/app/layout.tsx), ensuring they do not re-mount when the user navigates between routes.

---

## File Breakdown

### 1. [`Header.tsx`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/components/layout/Header.tsx) (`'use client'`)
- **Active Link Highlighting:** Uses `usePathname()` from `next/navigation` to detect the currently active URL path (e.g. `/works`) and highlight the corresponding link in brighter text (`text-text-bright`).
- **Sticky Positioning:** Sits fixed at the top with `sticky top-0 z-40 bg-canvas/90 backdrop-blur-sm`.

### 2. [`Footer.tsx`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/components/layout/Footer.tsx)
- Renders external links and copyright information passed from `getSiteContent()`.
- Does not require hooks, so it can be evaluated efficiently.

### 3. [`PageWrapper.tsx`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/components/layout/PageWrapper.tsx)
- A lightweight Server Component wrapper.
- Applies consistent horizontal padding (`px-6 md:px-12`) and vertical spacing across editorial views (`/works`, `/about`, `/contact`).

---

## Key Concept: Persistent Layouts in Next.js

In a standard React SPA, routing libraries often re-render the entire component tree unless carefully optimized. In Next.js App Router:
- The root layout (`src/app/layout.tsx`) remains mounted.
- Only the `{children}` within `<main>` are swapped out when changing routes.
- State in `<Header>` and `<Footer>` is preserved during client-side navigation.
