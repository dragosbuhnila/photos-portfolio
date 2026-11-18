'use client';

import Image from 'next/image';
import type { Photo } from '@/types/portfolio';

export interface PhotoCardProps {
  photo: Photo;
  index: number;
  isHighlighted?: boolean;
  onOpenLightbox: (photo: Photo) => void;
}

export default function PhotoCard({
  photo,
  index,
  isHighlighted = false,
  onOpenLightbox,
}: PhotoCardProps) {
  const displayTitle =
    photo.title ??
    photo.file_name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

  return (
    <div
      id={`photo-${photo.id}`}
      className="group flex flex-col cursor-pointer select-none scroll-mt-28"
      onClick={() => onOpenLightbox(photo)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenLightbox(photo);
        }
      }}
      aria-label={`View ${displayTitle} in full screen`}
    >
      {/* Photo Frame Container with visual separation & highlight frame */}
      <div
        className={`relative aspect-[3/2] w-full overflow-hidden bg-neutral-900 transition-all duration-500 ${
          isHighlighted
            ? 'outline outline-2 outline-text-bright outline-offset-4 ring-1 ring-white/20'
            : ''
        }`}
      >
        <Image
          src={photo.image_path}
          alt={photo.title ?? photo.file_name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          draggable={false}
        />
        {/* Subtle darkroom exposure hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300 pointer-events-none" />
      </div>

      {/* Editorial Caption Bar */}
      <div className="mt-3 flex items-center justify-between text-xs tracking-[0.15em] uppercase">
        <span
          className={`transition-colors duration-200 truncate pr-4 font-light ${
            isHighlighted
              ? 'text-white font-medium'
              : 'text-text-muted group-hover:text-text-bright'
          }`}
        >
          {displayTitle}
        </span>
        <span
          className={`font-mono flex-shrink-0 text-[11px] ${
            isHighlighted ? 'text-text-bright' : 'text-neutral-600'
          }`}
        >
          {String(photo.display_order ?? index + 1).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}

// Export PhotoObject alias as requested
export { PhotoCard as PhotoObject };
