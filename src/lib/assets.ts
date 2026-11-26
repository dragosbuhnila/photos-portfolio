/**
 * Resolves a public asset path, taking into account NEXT_PUBLIC_BASE_PATH
 * (used when deployed under a subpath, e.g. on GitHub Pages).
 */
export function getAssetPath(path: string | null | undefined): string {
  if (!path) return '';
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return path;
  }
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (basePath && !normalizedPath.startsWith(`${basePath}/`)) {
    return `${basePath}${normalizedPath}`;
  }
  return normalizedPath;
}
