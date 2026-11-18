# Photo Projects

Drop image files (`.jpg`, `.jpeg`, `.png`, `.webp`) into each project subfolder.
Folder names must exactly match the `slug` values in `content.json`.

After adding images, run `npm run seed` to rebuild the database, then restart the dev server.

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
