import fs from 'fs';
import path from 'path';
import { requireAuth, AuthError } from './auth';

export { requireAuth, AuthError };

const PROJECTS_DIR = path.join(process.cwd(), 'public', 'my_projects');
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif']);

/**
 * Lists image files in a project folder (public/my_projects/{slug}/).
 * Supports: .jpg, .jpeg, .png, .webp, .avif, .gif
 */
export function getProjectImageFiles(slug: string): string[] {
  const projectDir = path.join(PROJECTS_DIR, slug);
  if (!fs.existsSync(projectDir)) {
    return [];
  }
  const entries = fs.readdirSync(projectDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
}

/**
 * Creates project folder if missing.
 */
export function ensureProjectDir(slug: string): void {
  const projectDir = path.join(PROJECTS_DIR, slug);
  if (!fs.existsSync(projectDir)) {
    fs.mkdirSync(projectDir, { recursive: true });
  }
}

/**
 * Removes project folder recursively.
 */
export function deleteProjectDir(slug: string): void {
  const projectDir = path.join(PROJECTS_DIR, slug);
  if (fs.existsSync(projectDir)) {
    fs.rmSync(projectDir, { recursive: true, force: true });
  }
}

/**
 * Deletes a single image from a project folder.
 * Returns true if the file existed and was deleted, false otherwise.
 */
export function deleteProjectImage(slug: string, fileName: string): boolean {
  const filePath = path.join(PROJECTS_DIR, slug, fileName);
  if (fs.existsSync(filePath)) {
    const stat = fs.statSync(filePath);
    if (stat.isFile()) {
      fs.unlinkSync(filePath);
      return true;
    }
  }
  return false;
}

/**
 * Saves an image to disk in the project folder.
 */
export function saveProjectImage(slug: string, fileName: string, buffer: Buffer): void {
  ensureProjectDir(slug);
  const filePath = path.join(PROJECTS_DIR, slug, fileName);
  fs.writeFileSync(filePath, buffer);
}
