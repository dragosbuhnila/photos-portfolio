# `src/app/api/photos/` — Photos API Endpoint (`GET /api/photos`)

This folder contains the route handler for retrieving photo records from the SQLite database.

---

## Endpoint Details

- **Method:** `GET`
- **URL:** `/api/photos`
- **File:** [`route.ts`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/app/api/photos/route.ts)

---

## Query Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `featured` | `string` (`"1"` or `"0"`) | No | `null` | When set to `"1"`, returns only photos marked as `is_featured = 1` for the landing page canvas. Otherwise, returns all photos. |

---

## Example Usage

### Request (All Photos):
```http
GET /api/photos HTTP/1.1
Host: localhost:3000
```

### Request (Featured Only):
```http
GET /api/photos?featured=1 HTTP/1.1
Host: localhost:3000
```

### Example Response:
```json
[
  {
    "id": 1,
    "project_slug": "urban-geometry",
    "file_name": "01.jpg",
    "title": "Urban Geometry",
    "image_path": "/my_projects/urban-geometry/01.jpg",
    "is_featured": 1,
    "display_order": 1,
    "project_total": 9
  }
]
```

---

## Implementation Highlights

- **Dynamic Execution:** Configured with `export const dynamic = 'force-dynamic'` so queries reflect real-time database updates without build caching.
- **Data Source:** Calls `getFeaturedPhotos()` or `getAllPhotos()` from `src/lib/db.ts`, which queries SQLite using `better-sqlite3`.
