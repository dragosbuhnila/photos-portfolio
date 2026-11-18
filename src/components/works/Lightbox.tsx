'use client';

import { useEffect, useCallback } from 'react';
import Image from 'next/image';
import type { Photo } from '@/types/portfolio';

export interface LightboxProps {
  photo: Photo;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export default function Lightbox({
  photo,
  onClose,
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false,
}: LightboxProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && onPrev && hasPrev) {
        onPrev();
      } else if (e.key === 'ArrowRight' && onNext && hasNext) {
        onNext();
      }
    },
    [onClose, onPrev, onNext, hasPrev, hasNext]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const displayTitle =
    photo.title ??
    photo.file_name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 select-none"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Photo lightbox: ${displayTitle}`}
    >
      {/* Top Bar with Title and Close Button */}
      <div className="absolute top-0 left-0 right-0 px-8 py-6 flex items-center justify-between z-10 pointer-events-none">
        <p className="text-xs tracking-[0.2em] uppercase text-text-muted font-light">
          {displayTitle}
        </p>
        <button
          onClick={onClose}
          className="text-text-muted hover:text-text-bright text-xs tracking-[0.25em] uppercase transition-colors pointer-events-auto p-2"
          aria-label="Close lightbox"
        >
          Close [Esc]
        </button>
      </div>

      {/* Main Image Stage */}
      <div
        className="relative max-w-6xl max-h-[82vh] w-full h-full mx-8 flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full h-full max-h-[82vh] flex items-center justify-center">
          <Image
            src={photo.image_path}
            alt={photo.title ?? photo.file_name}
            fill
            sizes="95vw"
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Prev Navigation Arrow */}
      {onPrev && hasPrev && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="absolute left-6 top-1/2 -translate-y-1/2 p-4 text-neutral-500 hover:text-text-bright transition-colors focus:outline-none"
          aria-label="Previous photo"
        >
          <svg
            className="w-6 h-6 stroke-current stroke-2 fill-none"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Next Navigation Arrow */}
      {onNext && hasNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-6 top-1/2 -translate-y-1/2 p-4 text-neutral-500 hover:text-text-bright transition-colors focus:outline-none"
          aria-label="Next photo"
        >
          <svg
            className="w-6 h-6 stroke-current stroke-2 fill-none"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}
