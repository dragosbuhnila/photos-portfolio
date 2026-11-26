# `src/app/api/about/` — About & Resume API Endpoint (`GET /api/about`)

This folder contains the route handler for retrieving career and resume history from the SQLite database.

---

## Endpoint Details

- **Method:** `GET`
- **URL:** `/api/about`
- **File:** [`route.ts`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/app/api/about/route.ts)

---

## Response Schema

Returns a JSON array of `ResumeEntry` objects ordered by section and display order:

```json
[
  {
    "id": 1,
    "section": "experience",
    "title": "Lead Photographer",
    "organization": "Studio Noir",
    "period": "2021 — Present",
    "display_order": 1
  },
  {
    "id": 2,
    "section": "education",
    "title": "BFA Photography",
    "organization": "Berlin University of the Arts",
    "period": "2016 — 2020",
    "display_order": 1
  }
]
```

---

## Implementation Highlights

- **Dynamic Execution:** Configured with `export const dynamic = 'force-dynamic'` for fresh execution.
- **Data Source:** Calls `getResumeEntries()` from [`src/lib/db.ts`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/lib/db.ts).
- Useful for external portfolio widgets, resume exports, or headless integrations.
