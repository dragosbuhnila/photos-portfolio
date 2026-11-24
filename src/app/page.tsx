import { getFeaturedPhotos } from '@/lib/db';
import HorizontalCanvas from '@/components/canvas/HorizontalCanvas';

// Force dynamic rendering so the DB is queried at request time


export default function HomePage() {
  const featured = getFeaturedPhotos();

  return (
    <div
      className="flex-1 flex flex-col justify-center items-center w-full min-h-0 overflow-hidden"
      style={{ height: 'calc(100vh - 56px - 57px)' }}
    >
      <div
        className="w-full max-w-6xl flex flex-col h-full"
        style={{ height: 'calc((100vh - 113px) * 0.70)', maxHeight: '70vh', minHeight: '380px' }}
      >
        <HorizontalCanvas photos={featured} />
      </div>
    </div>
  );
}
