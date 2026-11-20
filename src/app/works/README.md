# `src/app/works/` — Complete Works Archive (`/works`)

This folder defines the `/works` route for the portfolio.

---

## What Happens Here

This route serves as the complete archive and catalog of all photographic series.
- Fetches all photos across all projects from the SQLite database.
- Organizes the flat photo records into structured project groups (`ProjectGroup[]`) keyed by `project_slug`.
- Parses URL search parameters (e.g. `?highlight=12`) to support deep-linking from the landing page.
- Passes the grouped data into the interactive `<PhotoGrid />` component.

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
This data transformation happens **once on the server** during the request. The client receives clean, structured data ready for rendering.

### 2. Deep Linking with Server `searchParams`
In React Router, you would read URL parameters using `useSearchParams()` or `useLocation()`.
In Next.js App Router, page components receive query parameters directly via their `props`:
```tsx
interface WorksPageProps {
  searchParams?: {
    highlight?: string; // e.g. /works?highlight=42
    project?: string;   // e.g. /works?project=tokyo-nights
  };
}

export default function WorksPage({ searchParams }: WorksPageProps) {
  const initialHighlightId = searchParams?.highlight
    ? parseInt(searchParams.highlight, 10)
    : undefined;

  return <PhotoGrid groups={groups} initialHighlightId={initialHighlightId} />;
}
```
When a user clicks a photo on the home page canvas, the router navigates to `/works?highlight=42`. The `WorksPage` reads this ID on the server and passes it down so the `<PhotoGrid>` component can immediately open the fullscreen Lightbox for photo #42.
