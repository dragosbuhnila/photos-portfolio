# Photography Portfolio — Owner's Guide

Welcome to your photography portfolio website! This guide explains how to manage your website: adding new photos, organizing your projects, updating your bio/resume, and viewing your website locally on your computer.

The application relies directly on a high-performance local SQLite database (`db/portfolio.db`) as its single source of truth. You can manage everything directly from the built-in **Content Studio (`/manage`)** in your browser, or add photo folders manually into `public/my_projects/`.

---

## 🚀 Quick Start: Running Your Website

To preview and manage your website on your computer:

1. Open your terminal (PowerShell, Command Prompt, or Terminal in VS Code).
2. Make sure you are inside this project folder:
   ```bash
   cd c:\Users\Dragos\Roba\Lectures\Software\Websites\photos-portfolio
   ```
3. Start the website:
   ```bash
   npm run dev
   ```
4. Open your browser and go to:
   - 👉 **Public Site:** [http://localhost:3000](http://localhost:3000)
   - 👉 **Content Studio (Admin):** [http://localhost:3000/manage](http://localhost:3000/manage)

To stop the website at any time, press `Ctrl + C` in your terminal window.

---

## 🎛️ Option 1 (Recommended): Managing Everything via Content Studio (`/manage`)

Click on **Manage** in the site header or navigate to `http://localhost:3000/manage`. The studio provides four dedicated sections:

### 1. Projects & Photo Studio (`/manage/projects`)
- **Create New Projects:** Enter a title (e.g. `Nocturne`), and a clean URL slug is generated automatically.
- **Upload High-Res Imagery:** Drag-and-drop or select files directly in the browser (`.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`). Images are instantly saved into `public/my_projects/<slug>/` and recorded in SQLite.
- **Feature on Landing Canvas:** Click **`★ Featured`** on any photo to toggle whether it appears in the horizontal landing page showcase.
- **Reorder Projects:** Click `▲` and `▼` to change the project priority without typing numbers.
- **Delete Photos or Projects:** Safe deletion with inline confirmation.

### 2. Resume & Chronology (`/manage/resume`)
- Tabbed by category: **Work Experience**, **Education**, and **Exhibitions**.
- **Collision-Free Ordering:** Move items up and down with `▲` and `▼`. The system assigns sequential priority order automatically, eliminating duplicate order index errors.
- Add, edit, or delete credentials with real-time field validation.

### 3. Artist Profile (`/manage`)
- Update your photographer name, direct contact email, location, travel availability, and copyright year.
- **Editorial Bio Paragraphs:** Add, edit, or remove paragraphs dynamically. Each paragraph renders as a distinct block on the `/about` page.

### 4. Social Links (`/manage/social`)
- Add, edit, remove, and reorder external links (e.g. Instagram, Threads, Behance).
- Validates URLs and handles automatically.

*All updates made in Content Studio instantly update the SQLite database in real-time (< 1ms), with zero server lag.*

---

## 📁 Option 2 (Manual): Adding Photos & Projects via Filesystem

If you prefer to organize photos directly on your computer:

### Step 1: Create a Project Folder
Inside the project, locate the folder:
`public/my_projects/`

To add a new project, create a new subfolder with a simple name (lowercase with dashes, e.g. `summer-in-rome` or `street-portraits`):
```text
public/
  my_projects/
    summer-in-rome/
    street-portraits/
```

### Step 2: Add Images
Drop your image files (`.jpg`, `.jpeg`, `.png`, `.webp`) straight into that folder.

### Step 3: Sync Images to SQLite
Run this command in your terminal to index the new files into your database:
```bash
npm run seed
```

**What happens automatically:**
- The system discovers your new folder and image files.
- It formats the name into a clean title (e.g., `summer-in-rome` becomes `Summer In Rome`).
- All photos in that folder will immediately show up on your **Works** page (`/works`)!
- You can then visit `/manage/projects` to mark specific photos as **Featured** for the landing page or adjust titles.

---

## 🗄️ Database Architecture (`db/portfolio.db`)

The website uses a local SQLite database powered by `better-sqlite3` in Write-Ahead Logging (`WAL`) mode:
- **`site_settings`**: Stores photographer bio, email, location, travel availability, copyright year, and nav links.
- **`social_links`**: Stores social media profiles and ordering.
- **`projects`**: Stores project titles, slugs, and display order.
- **`photos`**: Stores all photo metadata, file paths, `is_featured` flags, and display order.
- **`resume_entries`**: Stores career chronology (experience, education, exhibitions).

> **Note on `content.json`:** The root `content.json` file served as the original seed source. All data has been migrated into `db/portfolio.db`. If you ever need to perform a clean import from `content.json`, run `npm run migrate`.

---

## 💡 Summary of Everyday Commands

| Goal | Command |
| :--- | :--- |
| **Start previewing website** | `npm run dev` |
| **Sync new folders/photos added to filesystem** | `npm run seed` |
| **Re-run initial migration from content.json** | `npm run migrate` |
| **Build for production** | `npm run build` |
| **Stop website server** | Press `Ctrl + C` in terminal |
