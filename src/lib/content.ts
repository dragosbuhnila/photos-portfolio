import fs from 'fs';
import path from 'path';
import type { ContentData } from '@/types/portfolio';

const CONTENT_PATH = path.join(process.cwd(), 'content.json');

const DEFAULT_CONTENT: ContentData = {
  owner: {
    name: '---',
    email: '---@gmail.com',
    location: 'Berlin, Germany',
    available_for_travel: '',
    copyright_year: '2026',
    bio: [
      'Alex Moreau is a Berlin-based photographer working across documentary, editorial, and fine art photography. His work examines the quiet tensions between light and shadow in urban environments, drawing on a visual language shaped by years spent between European capitals and remote coastlines.',
      'His photographs have appeared in Vogue Italia, Le Monde Magazine, and several international group exhibitions. He is represented by Gallery Noir, Berlin.',
      'Moreau approaches photography as a slowcraft — each frame the product of extended periods of observation rather than reactive capture. His series often develop over months or years, tracing the same locations across different seasons and light conditions.',
    ],
  },
  social_links: [
    {
      label: 'Instagram',
      handle: '@alexmoreau',
      url: 'https://instagram.com',
    },
  ],
  nav_links: [
    { label: 'Index', href: '/' },
    { label: 'Works', href: '/works' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ],
  projects: [],
  resume: [],
};

export function getSiteContent(): ContentData {
  try {
    if (fs.existsSync(CONTENT_PATH)) {
      const fileData = fs.readFileSync(CONTENT_PATH, 'utf-8');
      const parsed = JSON.parse(fileData);
      return {
        owner: {
          ...DEFAULT_CONTENT.owner,
          ...(parsed.owner || {}),
        },
        social_links: parsed.social_links ?? DEFAULT_CONTENT.social_links,
        nav_links: parsed.nav_links ?? DEFAULT_CONTENT.nav_links,
        projects: parsed.projects ?? [],
        resume: parsed.resume ?? [],
      };
    }
  } catch (err) {
    console.error('[getSiteContent] Error reading content.json:', err);
  }
  return DEFAULT_CONTENT;
}
