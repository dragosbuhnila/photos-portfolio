# `src/app/works/` — Complete Works Archive (`/works`)

This folder defines the `/works` route for the portfolio.

---

## What Happens Here

This route serves as the complete archive and catalog of all photographic series:
- Fetches all photos across all projects from the SQLite database via `getAllPhotos()`.
- Organizes the flat photo records into structured project groups (`ProjectGroup[]`) keyed by `project_slug`.
- Passes the grouped data into the interactive [`<PhotoGrid />`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/components/works/PhotoGrid.tsx) component.
- Supports client-side deep-linking: navigating with `?highlight=ID` or `#photo-ID` automatically scrolls to the photo and applies a highlight frame.

---

## File Breakdown

- [`page.tsx`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/app/works/page.tsx): Server Component entrypoint for `/works`.

---

## Fullstack Concepts in Action

### 1. Server-Side Data Transformation
Rather than offloading grouping and aggregation to the browser or running complex SQL queries with joins, the server component handles transformation using standard JavaScript:
```tsx
const photos = getAllPhotos(); // Flat array of Photo objects from SQLite

const groupMap = new Map<string, ProjectGroup>();
for (const photo of photos) {
  const existing = groupMap.get(photo.project_slug);
  if (existing) {
    existing.photos.push(photo);
  } else {
    groupMap.set(photo.project_slug, {
      slug: photo.project_slug,
      title: photo.title,
      photos: [photo],
    });
  }
}
const groups = Array.from(groupMap.values());
```
This data transformation happens **once on the server** during rendering. The client receives clean, structured data ready for display.

### 2. Client-Side Highlighting & Static Export Compatibility
To maintain full compatibility with both dynamic server rendering and static site exports (`output: 'export'`), deep linking (e.g. clicking a featured image on `/` that navigates to `/works?highlight=42`):
- Is handled inside the client component [`PhotoGrid.tsx`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/components/works/PhotoGrid.tsx) using `window.location.search`.
- Detects the target photo ID, scrolls it smoothly into the center of the viewport, and highlights it with an outline frame.
- Avoids blocking static export prerendering because the server component does not rely on dynamic request-time search parameters.
