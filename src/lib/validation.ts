/**
 * Shared validation utilities for both client-side and server-side environments.
 * DO NOT import any Node.js modules (fs, path, etc.) into this file.
 */

export const RESUME_SECTIONS = ['experience', 'education', 'exhibition'] as const;

export type ResumeSection = (typeof RESUME_SECTIONS)[number];

export interface FieldError {
  field: string;
  message: string;
}

/**
 * Validates email format. An empty string returns true (for optional fields).
 */
export function isValidEmail(value: string): boolean {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

/**
 * Validates URL format (http or https). An empty string returns true (for optional fields).
 */
export function isValidUrl(value: string): boolean {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed) return true;
  try {
    const url = new URL(trimmed);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validates slug format: lowercase letters, numbers, hyphens, no leading/trailing hyphens.
 */
export function isValidSlug(value: string): boolean {
  if (typeof value !== 'string') return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

/**
 * Validates that trimmed string length is greater than 0.
 */
export function isNonEmpty(value: string): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validates that a string is a 4-digit year. Empty string returns true.
 */
export function isValidYear(value: string): boolean {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed) return true;
  return /^\d{4}$/.test(trimmed);
}

/**
 * Validates that a path/href starts with '/'.
 */
export function isValidHref(value: string): boolean {
  if (typeof value !== 'string') return false;
  return value.trim().startsWith('/');
}

/**
 * Validates that a period string is non-empty.
 */
export function isValidPeriod(value: string): boolean {
  return isNonEmpty(value);
}

/**
 * Type guard for ResumeSection.
 */
export function isValidSection(value: string): value is ResumeSection {
  return (RESUME_SECTIONS as readonly string[]).includes(value);
}

/**
 * Converts a title to a valid URL-friendly slug.
 */
export function toSlug(value: string): string {
  if (typeof value !== 'string') return '';
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Validates owner information: name required, email format, copyright_year format.
 */
export function validateOwner(owner: Record<string, unknown>): FieldError[] {
  const errors: FieldError[] = [];
  if (!owner || typeof owner !== 'object') {
    return [{ field: 'owner', message: 'Owner data must be an object' }];
  }

  const name = typeof owner.name === 'string' ? owner.name : '';
  if (!isNonEmpty(name)) {
    errors.push({ field: 'name', message: 'Name is required' });
  }

  const email = typeof owner.email === 'string' ? owner.email : '';
  if (!isValidEmail(email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }

  const copyrightYear =
    typeof owner.copyright_year === 'string' ? owner.copyright_year : '';
  if (!isValidYear(copyrightYear)) {
    errors.push({ field: 'copyright_year', message: 'Copyright year must be a 4-digit year' });
  }

  return errors;
}

/**
 * Validates social link: label required, url format.
 */
export function validateSocialLink(link: Record<string, unknown>): FieldError[] {
  const errors: FieldError[] = [];
  if (!link || typeof link !== 'object') {
    return [{ field: 'link', message: 'Social link data must be an object' }];
  }

  const label = typeof link.label === 'string' ? link.label : '';
  if (!isNonEmpty(label)) {
    errors.push({ field: 'label', message: 'Label is required' });
  }

  const url = typeof link.url === 'string' ? link.url : '';
  if (!isValidUrl(url)) {
    errors.push({ field: 'url', message: 'Invalid URL format' });
  }

  return errors;
}

/**
 * Validates resume entry: section valid, title/organization/period required.
 */
export function validateResumeEntry(entry: Record<string, unknown>): FieldError[] {
  const errors: FieldError[] = [];
  if (!entry || typeof entry !== 'object') {
    return [{ field: 'entry', message: 'Resume entry data must be an object' }];
  }

  const section = typeof entry.section === 'string' ? entry.section : '';
  if (!isValidSection(section)) {
    errors.push({
      field: 'section',
      message: `Section must be one of: ${RESUME_SECTIONS.join(', ')}`,
    });
  }

  const title = typeof entry.title === 'string' ? entry.title : '';
  if (!isNonEmpty(title)) {
    errors.push({ field: 'title', message: 'Title is required' });
  }

  const org =
    typeof entry.organization === 'string'
      ? entry.organization
      : typeof entry.org === 'string'
      ? entry.org
      : '';
  const orgField =
    entry.org !== undefined && entry.organization === undefined
      ? 'org'
      : 'organization';
  if (!isNonEmpty(org)) {
    errors.push({ field: orgField, message: 'Organization is required' });
  }

  const period = typeof entry.period === 'string' ? entry.period : '';
  if (!isValidPeriod(period)) {
    errors.push({ field: 'period', message: 'Period is required' });
  }

  return errors;
}

/**
 * Validates project: slug format/uniqueness, title required.
 */
export function validateProject(
  project: Record<string, unknown>,
  existingSlugs: string[] = []
): FieldError[] {
  const errors: FieldError[] = [];
  if (!project || typeof project !== 'object') {
    return [{ field: 'project', message: 'Project data must be an object' }];
  }

  const slug = typeof project.slug === 'string' ? project.slug : '';
  if (!isNonEmpty(slug)) {
    errors.push({ field: 'slug', message: 'Slug is required' });
  } else if (!isValidSlug(slug)) {
    errors.push({
      field: 'slug',
      message: 'Slug must contain only lowercase letters, numbers, and hyphens without leading or trailing hyphens',
    });
  } else if (existingSlugs.includes(slug)) {
    errors.push({ field: 'slug', message: 'Slug already exists' });
  }

  const title = typeof project.title === 'string' ? project.title : '';
  if (!isNonEmpty(title)) {
    errors.push({ field: 'title', message: 'Title is required' });
  }

  return errors;
}
