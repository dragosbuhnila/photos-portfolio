# Photo Projects Directory (`public/my_projects/`)

This directory contains the physical image files for all portfolio collections.

You can manage photos in two ways:

1. **Via Content Studio (`/manage/projects`):**
   - Upload high-resolution images directly from your browser (drag-and-drop or file selector).
   - Supported extensions: `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`, `.gif`.
   - Files are automatically saved into their respective project subfolder on disk.
   - Toggle which images appear on the landing page horizontal canvas (`★ Featured`).
   - All additions, renames, and deletions are instantly synchronized with the SQLite database.

2. **Direct Filesystem Management:**
   - Drop image files straight into each project subfolder.
   - Folder names correspond to the `slug` values of your projects (e.g. `urban-geometry`, `nocturne`, `silver-coast`).
   - After manually adding or removing images in folders, run `npm run seed` in your terminal to index them into SQLite.

---

## Example Directory Structure

```text
public/my_projects/
├── urban-geometry/
│   ├── bike_and_stairs.jpg
│   ├── dome.jpg
│   └── intersection.jpg
├── silver-coast/
│   ├── cityscape.jpg
│   ├── coast1.jpg
│   ├── coast2.jpg
│   └── penguin.jpg
└── nocturne/
    ├── fireworks.jpg
    ├── moon.jpg
    └── woods.jpg
```

---

## Serving & Backup Architecture

- **Dynamic Image Route (`/my_projects/*`):** In local development and Node.js mode, images are served with MIME-type headers, immutable cache controls (`Cache-Control: public, max-age=31536000, immutable`), and directory traversal protection via [`src/app/my_projects/[...path]/route.ts`](file:///c:/Users/Dragos/Roba/Lectures/Software/Websites/photos-portfolio/src/app/my_projects/[...path]/route.ts).
- **Static Export (`out/`):** During static builds (`npm run build:static`), Next.js copies the public media files directly into the static distribution directory alongside the pre-rendered HTML.
- **One-Click Backup:** You can download a complete backup of all image files alongside the checkpointed SQLite database at any time from `/manage/backup` or via the endpoint `GET /api/admin/backup`.
