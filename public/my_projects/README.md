# Photo Projects Directory (`public/my_projects/`)

This directory contains the physical image files for all portfolio collections.

You can manage photos in two ways:

1. **Via Content Studio (`/manage/projects`):**
   - Upload images directly from your browser.
   - Files are automatically saved into their respective project subfolder.
   - Toggle which images appear on the landing page horizontal canvas (`★ Featured`).
   - All additions and removals are instantly recorded in the SQLite database.

2. **Direct Filesystem Management:**
   - Drop image files (`.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`, `.gif`) into each project subfolder.
   - Folder names correspond to the `slug` values of your projects (e.g. `urban-geometry`).
   - After manually adding or removing images in folders, run `npm run seed` to index them into SQLite.

## Example structure
```
public/my_projects/
├── urban-geometry/
│   ├── 01.jpg
│   ├── 02.jpg
│   └── 03.jpg
├── silver-coast/
│   └── 01.jpg
└── nocturne/
    └── 01.jpg
```
