'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Photo } from '@/types/portfolio';
import CanvasPhotoItem from './CanvasPhotoItem';

const MAX_PHOTOS = 10;
const WHEEL_COOLDOWN_MS = 450;
const SWIPE_THRESHOLD_PX = 40;

interface HorizontalCanvasProps {
  photos: Photo[];
}

export default function HorizontalCanvas({ photos }: HorizontalCanvasProps) {
  const router = useRouter();

  // Cap displayed photos to 10
  const displayedPhotos = photos.slice(0, MAX_PHOTOS);
  const total = displayedPhotos.length;

  // Log warning to console if incoming photos exceed the limit
  useEffect(() => {
    if (photos.length > MAX_PHOTOS) {
      console.warn(
        `[HorizontalCanvas] Photo cap reached: received ${photos.length} photos, displaying first ${MAX_PHOTOS}.`
      );
    }
  }, [photos.length]);

  // For infinite looping with smooth transition, clone last item at start and first at end
  // Cloned track: [photo[N-1], photo[0], photo[1], ..., photo[N-1], photo[0]]
  // Index 1 corresponds to photo[0], Index N corresponds to photo[N-1]
  const slides = total > 1
    ? [displayedPhotos[total - 1], ...displayedPhotos, displayedPhotos[0]]
    : displayedPhotos;

  const [currentIndex, setCurrentIndex] = useState(total > 1 ? 1 : 0);
  const [enableTransition, setEnableTransition] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const isTransitioningRef = useRef(false);
  const lastWheelTimeRef = useRef<number>(0);
  const touchStartXRef = useRef<number | null>(null);
  const isSwipingRef = useRef(false);

  // Active dot index mapped from clone index
  const activeDotIndex = total > 1 ? (currentIndex - 1 + total) % total : 0;

  const goToNext = useCallback(() => {
    if (total <= 1 || isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setEnableTransition(true);
    setCurrentIndex((prev) => prev + 1);

    // Fallback safety timeout in case onTransitionEnd doesn't fire
    window.setTimeout(() => {
      isTransitioningRef.current = false;
    }, 600);
  }, [total]);

  const goToPrev = useCallback(() => {
    if (total <= 1 || isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setEnableTransition(true);
    setCurrentIndex((prev) => prev - 1);

    // Fallback safety timeout
    window.setTimeout(() => {
      isTransitioningRef.current = false;
    }, 600);
  }, [total]);

  const goToIndex = useCallback(
    (targetPhotoIdx: number) => {
      if (total <= 1 || isTransitioningRef.current) return;
      isTransitioningRef.current = true;
      setEnableTransition(true);
      setCurrentIndex(targetPhotoIdx + 1);

      window.setTimeout(() => {
        isTransitioningRef.current = false;
      }, 600);
    },
    [total]
  );

  // Reset to original slide without transition when reaching cloned bounds
  const handleTransitionEnd = () => {
    if (total <= 1) {
      isTransitioningRef.current = false;
      return;
    }

    if (currentIndex === slides.length - 1) {
      // Reached trailing clone of photo[0] -> jump to real photo[0] (index 1)
      setEnableTransition(false);
      setCurrentIndex(1);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setEnableTransition(true);
          isTransitioningRef.current = false;
        });
      });
    } else if (currentIndex === 0) {
      // Reached leading clone of photo[N-1] -> jump to real photo[N-1] (index total)
      setEnableTransition(false);
      setCurrentIndex(total);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setEnableTransition(true);
          isTransitioningRef.current = false;
        });
      });
    } else {
      isTransitioningRef.current = false;
    }
  };

  // Quantized wheel scrolling
  const onWheel = useCallback(
    (e: WheelEvent) => {
      if (total <= 1) return;
      const dominantDelta =
        Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;

      if (Math.abs(dominantDelta) < 20) return;

      e.preventDefault();

      const now = Date.now();
      if (now - lastWheelTimeRef.current < WHEEL_COOLDOWN_MS) {
        return;
      }
      lastWheelTimeRef.current = now;

      if (dominantDelta > 0) {
        goToNext();
      } else {
        goToPrev();
      }
    },
    [total, goToNext, goToPrev]
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [onWheel]);

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        goToPrev();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [goToNext, goToPrev]);

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = e.touches[0].clientX;
    isSwipingRef.current = false;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;

    if (Math.abs(diff) >= SWIPE_THRESHOLD_PX) {
      isSwipingRef.current = true;
      if (diff > 0) {
        goToNext();
      } else {
        goToPrev();
      }
      setTimeout(() => {
        isSwipingRef.current = false;
      }, 200);
    }
    touchStartXRef.current = null;
  };

  // Navigate to works and highlight photo
  const handlePhotoClick = useCallback(
    (photo: Photo) => {
      if (isSwipingRef.current) return;
      router.push(`/works?project=${photo.project_slug}&highlight=${photo.id}#photo-${photo.id}`);
    },
    [router]
  );

  if (total === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-neutral-600 text-xs tracking-[0.25em] uppercase">
          No featured images yet
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative flex-1 w-full h-full flex flex-col justify-between overflow-hidden bg-canvas select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="Photography featured canvas showcase"
    >
      {/* Sliding Track Viewport */}
      <div className="relative flex-1 w-full overflow-hidden flex items-center">
        <div
          className={`flex h-full w-full ${
            enableTransition ? 'transition-transform duration-500 ease-out' : ''
          }`}
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {slides.map((photo, i) => {
            // Determine logical index for display (0 to total-1)
            let logicalIndex = 0;
            if (total === 1) {
              logicalIndex = 0;
            } else if (i === 0) {
              logicalIndex = total - 1;
            } else if (i === slides.length - 1) {
              logicalIndex = 0;
            } else {
              logicalIndex = i - 1;
            }

            return (
              <CanvasPhotoItem
                key={`${photo.id}-${i}`}
                photo={photo}
                index={logicalIndex}
                total={total}
                priority={i === currentIndex}
                onPhotoClick={handlePhotoClick}
              />
            );
          })}
        </div>
      </div>

      {/* Left Click Zone & Arrow */}
      {total > 1 && (
        <button
          type="button"
          onClick={goToPrev}
          aria-label="Previous photo"
          className="absolute left-0 top-0 bottom-14 w-1/6 min-w-[50px] max-w-[120px] z-20 flex items-center justify-start pl-4 md:pl-8 text-neutral-500 hover:text-text-bright transition-colors duration-200 group focus:outline-none cursor-pointer"
        >
          <div className="p-2 md:p-3 bg-canvas/40 hover:bg-neutral-900/80 transition-colors">
            <svg
              className="w-5 h-5 stroke-current stroke-2 fill-none transform transition-transform group-hover:-translate-x-1"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </div>
        </button>
      )}

      {/* Right Click Zone & Arrow */}
      {total > 1 && (
        <button
          type="button"
          onClick={goToNext}
          aria-label="Next photo"
          className="absolute right-0 top-0 bottom-14 w-1/6 min-w-[50px] max-w-[120px] z-20 flex items-center justify-end pr-4 md:pr-8 text-neutral-500 hover:text-text-bright transition-colors duration-200 group focus:outline-none cursor-pointer"
        >
          <div className="p-2 md:p-3 bg-canvas/40 hover:bg-neutral-900/80 transition-colors">
            <svg
              className="w-5 h-5 stroke-current stroke-2 fill-none transform transition-transform group-hover:translate-x-1"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      )}

      {/* Dots Indicator */}
      {total > 1 && (
        <nav
          className="relative z-30 pb-4 pt-1 flex items-center justify-center gap-3"
          aria-label="Slideshow pagination"
        >
          {displayedPhotos.map((photo, idx) => {
            const isActive = idx === activeDotIndex;
            return (
              <button
                key={photo.id}
                type="button"
                onClick={() => goToIndex(idx)}
                aria-label={`Go to photo ${idx + 1}`}
                aria-current={isActive ? 'true' : undefined}
                className="group py-2 px-1 focus:outline-none"
              >
                <span
                  className={`block transition-all duration-300 ${
                    isActive
                      ? 'w-5 h-1.5 bg-text-bright'
                      : 'w-1.5 h-1.5 rounded-full bg-neutral-700 group-hover:bg-neutral-500'
                  }`}
                />
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}
