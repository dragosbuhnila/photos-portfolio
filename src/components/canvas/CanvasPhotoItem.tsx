'use client';

import Image from 'next/image';
import type { Photo } from '@/types/portfolio';

export interface CanvasPhotoItemProps {
  photo: Photo;
  index?: number;
  total?: number;
  priority?: boolean;
  onPhotoClick?: (photo: Photo) => void;
}

export default function CanvasPhotoItem({
  photo,
  index,
  total,
  priority = false,
  onPhotoClick,
}: CanvasPhotoItemProps) {
  const displayTitle =
    photo.title ??
    photo.project_slug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

  // Number of the image within its own project collection
  const orderNumber = photo.display_order ?? (index !== undefined ? index + 1 : 1);
  const totalInProject = photo.project_total ?? total ?? orderNumber;

  const formattedOrder = String(orderNumber).padStart(2, '0');
  const formattedTotal = String(totalInProject).padStart(2, '0');

  return (
    <div
      className="w-full h-full flex-shrink-0 flex flex-col items-center justify-center px-4 sm:px-8 md:px-14 py-2 md:py-4 select-none"
      role="group"
      aria-roledescription="slide"
      aria-label={`${displayTitle} (${formattedOrder} of ${formattedTotal} in project)`}
    >
      <div
        className="relative w-full h-full max-w-3xl flex flex-col items-center justify-center cursor-pointer group"
        onClick={() => onPhotoClick?.(photo)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onPhotoClick?.(photo);
          }
        }}
        aria-label={`Open ${displayTitle} in works`}
      >
        {/* Photo Container with ~70% proportional scale and hover feedback */}
        <div className="relative w-full flex-1 max-h-[46vh] md:max-h-[50vh] flex items-center justify-center">
          <Image
            src={photo.image_path}
            alt={photo.title ?? `Photo from ${photo.project_slug}`}
            fill
            sizes="(max-width: 768px) 85vw, (max-width: 1200px) 60vw, 800px"
            className="object-contain pointer-events-none select-none transition-transform duration-500 ease-out group-hover:scale-[1.01]"
            priority={priority}
            draggable={false}
          />
        </div>

        {/* Minimalist Darkroom Caption Bar */}
        <div className="w-full max-w-2xl pt-3 px-1 flex items-center justify-between text-xs tracking-[0.2em] uppercase">
          <div className="flex items-center gap-2 truncate pr-4">
            <p className="text-text-bright font-light truncate text-[11px] md:text-xs group-hover:text-white transition-colors">
              {displayTitle}
            </p>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-[10px] text-neutral-500 tracking-widest hidden sm:inline">
              [View in Works]
            </span>
          </div>
          <p className="text-neutral-500 font-mono flex-shrink-0 text-[10px] md:text-[11px]">
            {formattedOrder}&thinsp;/&thinsp;{formattedTotal}
          </p>
        </div>
      </div>
    </div>
  );
}
