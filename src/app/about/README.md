# `src/app/about/` — Editorial About Page (`/about`)

This folder defines the `/about` route for the portfolio.

---

## What Happens Here

This route implements an **editorial two-column layout**:
- **Left Column:** Photographer bio paragraphs loaded dynamically from SQLite (`site_settings`).
- **Right Column:** Structured career history (Experience, Education, Exhibitions) pulled directly from SQLite (`resume_entries`).

---

## File Breakdown

- [`page.tsx`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/app/about/page.tsx): The page component that executes on the server.

---

## Fullstack React/Express Comparison

### In Traditional React + Express:
```tsx
// Client component in React SPA:
function AboutPage() {
  const [bio, setBio] = useState('');
  const [resume, setResume] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/about-bio').then(r => r.json()),
      fetch('/api/resume').then(r => r.json())
    ]).then(([bioData, resumeData]) => {
      setBio(bioData);
      setResume(resumeData);
      setLoading(false);
    });
  }, []);

  if (loading) return <Spinner />;
  return <div>...</div>;
}
```

### In Next.js (This Implementation):
```tsx
// src/app/about/page.tsx (Server Component)
export default function AboutPage() {
  const content = getSiteContent();    // Reads owner bio and metadata from SQLite
  const entries = getResumeEntries();  // Executes SQL query against resume_entries table
  const sections = groupBySection(entries);

  // Directly returns the final JSX pre-rendered on the server:
  return (
    <PageWrapper>
      {/* Editorial layout */}
    </PageWrapper>
  );
}
```

### Why this is a win:
1. **Zero Client-Side JavaScript:** Because this page contains no interactive state, Next.js ships pure HTML and CSS to the browser.
2. **Instant Render:** The browser receives the complete biography and resume in the very first byte stream. No spinners or layout shifts.
3. **Unified SQLite Data Architecture:** Bio metadata and resume chronology are queried cleanly in-process through the unified SQLite database without REST roundtrips.
