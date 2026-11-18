# Photography Portfolio — Owner's Guide

Welcome to your photography portfolio website! This guide explains how to add new photos, organize your projects, update your bio/resume, and view your website locally on your computer.

No coding experience is required. Everything is driven by putting images into folders and updating a simple text file.

---

## 🚀 Quick Start: Running Your Website

To preview your website on your computer:

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
   👉 **[http://localhost:3000](http://localhost:3000)**

> **Note:** Whenever you run `npm run dev`, the system automatically scans your photo folders, updates your project list, and refreshes the database before launching the site!

To stop the website at any time, press `Ctrl + C` in your terminal window.

---

## 📸 Adding New Photos & Projects

The website automatically detects any photo folders you create.

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

### Step 3: Sync & Update
Run this command in your terminal:
```bash
npm run seed
```

**What happens automatically:**
- The system discovers your new folder.
- It formats the name into a clean title (e.g., `summer-in-rome` becomes `Summer In Rome`).
- It automatically adds the project into your `content.json` file.
- All photos in that folder will immediately show up on your **Works** page (`/works`)!

---

## 🎨 Customizing Projects & Homepage Slideshow (`content.json`)

Open the `content.json` file in the root folder using any text editor (like VS Code or Notepad).

Here is what a project entry looks like:

```json
{
  "slug": "summer-in-rome",
  "title": "Summer In Rome",
  "featured_images": [
    "sunset-colosseum.jpg"
  ]
}
```

### Changing the Project Title
Edit the `"title"` field to whatever you want displayed on the site.

### Choosing Homepage / Landing Page Photos ("Featured Images")
The homepage displays a full-screen, horizontal scrolling canvas. Only photos listed in `"featured_images"` will appear on the homepage.

- Copy the exact file name of the photo (including extension like `.jpg` or `.png`).
- Add it inside the quotes within `featured_images`:
  ```json
  "featured_images": [
    "photo-1.jpg",
    "photo-2.jpg"
  ]
  ```
- If you don't want any photos from this project on the homepage, leave it empty:
  ```json
  "featured_images": []
  ```

---

## 📄 Updating Your About / Resume Page

Inside `content.json`, scroll down to the `"resume"` section. You will see entries grouped into three categories:
- `exhibition` (Exhibitions & shows)
- `experience` (Work history & editorial clients)
- `education` (Degrees & training)

### Adding an Entry
You can copy and paste an existing entry and change the details:

```json
{
  "section": "exhibition",
  "title": "Solo Exhibition: Shadows & Form",
  "organization": "Modern Art Gallery, Milan",
  "period": "2026",
  "display_order": 1
}
```

- **`section`**: Must be either `"exhibition"`, `"experience"`, or `"education"`.
- **`title`**: The name of the exhibition, your role, or degree.
- **`organization`**: The gallery, client, magazine, or school.
- **`period`**: The year or year range (e.g. `"2025"`, `"2022 – Present"`).
- **`display_order`**: A number determining which item appears first (`1` is at the top).

---

## 🔄 Applying Your Changes

Whenever you:
- Add or remove images,
- Add or rename project folders, or
- Edit `content.json`

Just run:
```bash
npm run seed
```
Then refresh your browser page to see the changes immediately!

---

## 💡 Summary of Everyday Commands

| Goal | Command |
| :--- | :--- |
| **Start previewing website** | `npm run dev` |
| **Refresh database after changing photos or content.json** | `npm run seed` |
| **Stop website server** | Press `Ctrl + C` in terminal |
