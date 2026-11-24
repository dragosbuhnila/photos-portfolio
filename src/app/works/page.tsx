import { getAllPhotos } from '@/lib/db';
import PageWrapper from '@/components/layout/PageWrapper';
import PhotoGrid from '@/components/works/PhotoGrid';
import type { ProjectGroup } from '@/types/portfolio';



export default function WorksPage() {
  const photos = getAllPhotos();

  // Group by project_slug
  const groupMap = new Map<string, ProjectGroup>();
  for (const photo of photos) {
    const existing = groupMap.get(photo.project_slug);
    if (existing) {
      existing.photos.push(photo);
    } else {
      groupMap.set(photo.project_slug, {
        slug: photo.project_slug,
        title: photo.title,
        photos: [photo],
      });
    }
  }

  const groups = Array.from(groupMap.values());

  return (
    <PageWrapper>
      <div className="mb-12">
        <h1 className="text-text-bright text-sm tracking-[0.3em] uppercase">Works</h1>
        <p className="mt-2 text-xs text-neutral-600 tracking-widest">
          {groups.length} projects
        </p>
      </div>

      <PhotoGrid groups={groups} />
    </PageWrapper>
  );
}
