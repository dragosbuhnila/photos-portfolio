# `src/components/contact/` — Contact UI & Clipboard Interactions

This folder contains the interactive UI component for the `/contact` route.

---

## What Happens Here

Implements a minimalist darkroom contact interface:
- Displays photographer contact information: email, location, travel availability, and social links.
- Provides a one-click **copy email to clipboard** button with smooth visual feedback ("Copied!").
- Enforces the project's zero-border, zero-shadow aesthetic (no contact forms or inputs).

---

## File Breakdown

- [`ContactContent.tsx`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/components/contact/ContactContent.tsx) (`'use client'`):
  - **Props:** Receives `owner` and `socialLinks` passed down from `src/app/contact/page.tsx`.
  - **Clipboard API:** Uses `navigator.clipboard.writeText()` with a fallback for older browsers.
  - **State Management:** Uses `useState<boolean>` to track the copied state.
  - **Timer Cleanup:** Sets a 2-second timeout to reset the copied state, properly cleaning up with `useEffect` or timeout cancellation to avoid memory leaks.

---

## Why Is This a Client Component?

`ContactContent.tsx` has `'use client'` at the top because:
1. It uses React state (`useState`) to toggle the "Copied!" button indicator.
2. It calls browser-only APIs (`navigator.clipboard`).
3. It handles DOM event clicks (`onClick`).

The data itself originates from SQLite and is read by the parent Server Component (`src/app/contact/page.tsx`), which then passes it down as static props.
