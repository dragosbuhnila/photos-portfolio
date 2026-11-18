'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Photo, ProjectGroup } from '@/types/portfolio';
import PhotoCard from './PhotoCard';
import Lightbox from './Lightbox';

interface PhotoGridProps {
  groups: ProjectGroup[];
  initialHighlightId?: number;
}

interface ActiveLightboxState {
  photo: Photo;
  groupPhotos: Photo[];
  index: number;
}

export default function PhotoGrid({ groups, initialHighlightId }: PhotoGridProps) {
  const [activeLightbox, setActiveLightbox] = useState<ActiveLightboxState | null>(null);
  const [highlightedId, setHighlightedId] = useState<number | null>(
    initialHighlightId ?? null
  );

  // Initialize highlight from prop, search param, or hash
  useEffect(() => {
    let targetId = initialHighlightId;

    if (!targetId && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const paramHighlight = params.get('highlight');
      if (paramHighlight) {
        targetId = parseInt(paramHighlight, 10);
      } else if (window.location.hash.startsWith('#photo-')) {
        targetId = parseInt(window.location.hash.replace('#photo-', ''), 10);
      }
    }

    if (targetId && !isNaN(targetId)) {
      setHighlightedId(targetId);

      // Scroll smoothly to target photo in viewport
      const timer = setTimeout(() => {
        const el = document.getElementById(`photo-${targetId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 120);

      return () => clearTimeout(timer);
    }
  }, [initialHighlightId]);

  // Dismiss highlight on any subsequent click without blocking the click's normal action
  useEffect(() => {
    if (!highlightedId) return;

    const handleWindowClick = () => {
      setHighlightedId(null);
      if (window.history.replaceState) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    };

    // Attach after a short delay so the initial navigation click doesn't dismiss the highlight
    const timer = setTimeout(() => {
      window.addEventListener('click', handleWindowClick);
    }, 60);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', handleWindowClick);
    };
  }, [highlightedId]);

  const openLightbox = useCallback(
    (photo: Photo, groupPhotos: Photo[], index: number) => {
      // Clear highlight upon opening lightbox
      setHighlightedId(null);
      if (typeof window !== 'undefined' && window.history.replaceState) {
        window.history.replaceState(null, '', window.location.pathname);
      }

      setActiveLightbox({
        photo,
        groupPhotos,
        index,
      });
    },
    []
  );

  const closeLightbox = useCallback(() => {
    setActiveLightbox(null);
  }, []);

  const handlePrev = useCallback(() => {
    if (!activeLightbox) return;
    const { groupPhotos, index } = activeLightbox;
    const newIndex = (index - 1 + groupPhotos.length) % groupPhotos.length;
    setActiveLightbox({
      photo: groupPhotos[newIndex],
      groupPhotos,
      index: newIndex,
    });
  }, [activeLightbox]);

  const handleNext = useCallback(() => {
    if (!activeLightbox) return;
    const { groupPhotos, index } = activeLightbox;
    const newIndex = (index + 1) % groupPhotos.length;
    setActiveLightbox({
      photo: groupPhotos[newIndex],
      groupPhotos,
      index: newIndex,
    });
  }, [activeLightbox]);

  if (groups.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="text-neutral-600 text-xs tracking-[0.25em] uppercase">
          No projects found
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-24">
        {groups.map((group) => {
          const groupTitle =
            group.title ??
            group.slug
              .split('-')
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(' ');

          return (
            <section
              key={group.slug}
              id={`project-${group.slug}`}
              className="space-y-8 scroll-mt-24"
            >
              {/* Project Section Header */}
              <div className="flex items-baseline justify-between border-b border-neutral-800 pb-3">
                <h2 className="text-xs tracking-[0.25em] uppercase text-text-bright font-light">
                  {groupTitle}
                </h2>
                <span className="text-[11px] font-mono text-neutral-600 tracking-wider">
                  {group.photos.length} {group.photos.length === 1 ? 'WORK' : 'WORKS'}
                </span>
              </div>

              {/* Visually Separated Photo Objects Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 lg:gap-14">
                {group.photos.map((photo, index) => (
                  <PhotoCard
                    key={photo.id}
                    photo={photo}
                    index={index}
                    isHighlighted={photo.id === highlightedId}
                    onOpenLightbox={(selectedPhoto) =>
                      openLightbox(selectedPhoto, group.photos, index)
                    }
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {activeLightbox && (
        <Lightbox
          photo={activeLightbox.photo}
          onClose={closeLightbox}
          onPrev={handlePrev}
          onNext={handleNext}
          hasPrev={activeLightbox.groupPhotos.length > 1}
          hasNext={activeLightbox.groupPhotos.length > 1}
        />
      )}
    </>
  );
}
