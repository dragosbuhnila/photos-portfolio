# `src/app/contact/` — Contact Page (`/contact`)

This folder defines the `/contact` route for the portfolio.

---

## What Happens Here

This route presents a minimalist, static contact view displaying the photographer's email address, physical location, availability for travel, and external social media links. It does not use input forms (in adherence to the darkroom portfolio specification).

---

## File Breakdown

- [`page.tsx`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/app/contact/page.tsx): The Server Component entrypoint for `/contact`.

---

## Fullstack Architecture Pattern: The Server-to-Client Hand-off

A common question when moving from React + Express to Next.js is:
> *"Where do I put `useState` and click handlers if pages are Server Components?"*

This page demonstrates the canonical Next.js solution:

```
[ src/app/contact/page.tsx ] (Server Component)
    |
    |-- 1. Reads contact info and social links from SQLite on the server:
    |      const content = getSiteContent();
    |
    |-- 2. Passes server data as serializable props:
    |      <ContactContent owner={content.owner} socialLinks={content.social_links} />
    v
[ src/components/contact/ContactContent.tsx ] (Client Component)
    |
    |-- 3. Runs in browser with 'use client'
    |-- 4. Manages clipboard interaction (navigator.clipboard.writeText)
    |-- 5. Manages UI state: useState for temporary "Copied!" notification
```

### Why Not Make `page.tsx` a Client Component Directly?
You *could* add `'use client'` to `page.tsx`, but then it wouldn't be able to query SQLite on the server!
By keeping `page.tsx` as a Server Component and isolating the interactivity into `<ContactContent />`, you get:
- Fast server-side data loading (no client fetch).
- Immediate SEO/metadata availability.
- Interactive browser features where needed.
