# `src/app/api/contact/` — Contact API Endpoint (`GET /api/contact`)

This folder contains the route handler for retrieving photographer contact information and social profiles.

---

## Endpoint Details

- **Method:** `GET`
- **URL:** `/api/contact`
- **File:** [`route.ts`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/app/api/contact/route.ts)

---

## Response Schema

Returns a JSON object summarizing contact data extracted from SQLite (`site_settings` & `social_links`):

```json
{
  "name": "Alex Moreau",
  "email": "alex.moreau@photography.com",
  "location": "Berlin, Germany",
  "available_for_travel": "Worldwide",
  "social": [
    {
      "label": "Instagram",
      "handle": "@alexmoreau",
      "url": "https://instagram.com/alexmoreau"
    }
  ]
}
```

---

## Implementation Highlights

- Calls `getSiteContent()` from `src/lib/content.ts` (which queries SQLite).
- Serves as a read-only endpoint for external directories or contact aggregators.
