export interface Photo {
  id: number;
  project_slug: string;
  file_name: string;
  title: string | null;
  image_path: string;
  is_featured: boolean;
  display_order: number;
  featured_order?: number;
  project_total?: number;
}

export interface ResumeEntry {
  id?: number;
  section: string;
  title: string;
  organization: string;
  period: string;
  display_order: number;
}

export interface ProjectGroup {
  slug: string;
  title: string | null;
  photos: Photo[];
}

export interface OwnerInfo {
  name: string;
  email: string;
  location: string;
  available_for_travel?: string;
  copyright_year?: string;
  bio: string[];
}

export interface SocialLink {
  label: string;
  handle?: string;
  url: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface ContentData {
  owner: OwnerInfo;
  social_links: SocialLink[];
  nav_links: NavLink[];
  projects: {
    slug: string;
    title: string;
    featured_images: string[];
    photos_order?: Record<string, number>;
  }[];
  resume: ResumeEntry[];
}
