import { useEffect, useRef, type TouchEvent } from 'react';
import { Camera, ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { GalleryImage } from '../data/weddingConfig';

interface GalleryModalProps {
  images: GalleryImage[];
  currentIndex: number | null;
  failedIds: ReadonlySet<string>;
  onImageError: (id: string) => void;
  onClose: () => void;
  onChangeIndex: (nextIndex: number) => void;
}

export function GalleryModal({
  images,
  currentIndex,
  failedIds,
  onImageError,
  onClose,
  onChangeIndex,
}: GalleryModalProps) {
  const touchStartXRef = useRef<number | null>(null);
  const isOpen = currentIndex !== null;

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (currentIndex === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'ArrowLeft' && currentIndex > 0) {
        onChangeIndex(currentIndex - 1);
      } else if (
        event.key === 'ArrowRight' &&
        currentIndex < images.length - 1
      ) {
        onChangeIndex(currentIndex + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, images.length, onChangeIndex, onClose]);

  if (currentIndex === null) {
    return null;
  }

  const currentImage = images[currentIndex];
  if (!currentImage) {
    return null;
  }

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;
  const isFallback = failedIds.has(currentImage.id);

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const startX = touchStartXRef.current;
    touchStartXRef.current = null;
    if (startX === null) return;

    const endX = event.changedTouches[0]?.clientX;
    if (typeof endX !== 'number') return;

    const deltaX = endX - startX;
    if (Math.abs(deltaX) < 45) return;

    if (deltaX < 0 && hasNext) {
      onChangeIndex(currentIndex + 1);
    } else if (deltaX > 0 && hasPrev) {
      onChangeIndex(currentIndex - 1);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="웨딩 갤러리 확대 보기"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="fixed inset-0 z-50 bg-ink/95 text-ivory flex flex-col justify-between p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] select-none"
    >
      {/* 상단 인디케이터 & 닫기 버튼 */}
      <div
        className="flex items-center justify-between"
        onClick={(event) => event.stopPropagation()}
      >
        <span className="font-serif-en text-[13px] tracking-[0.2em] text-ivory/80 tabular-nums">
          {currentIndex + 1} / {images.length}
        </span>

        <button
          type="button"
          onClick={onClose}
          aria-label="라이트박스 닫기"
          className="w-9 h-9 rounded-full flex items-center justify-center text-ivory/80 hover:text-ivory hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" strokeWidth={1.5} />
        </button>
      </div>

      {/* 중앙 이미지 스테이지 */}
      <div className="relative flex-1 flex items-center justify-center my-4">
        {hasPrev && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onChangeIndex(currentIndex - 1);
            }}
            aria-label="이전 사진"
            className="absolute left-0 z-10 w-10 h-10 rounded-full bg-ink/50 border border-white/15 flex items-center justify-center text-ivory/85 hover:text-ivory hover:bg-ink/80 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>
        )}

        <div
          onClick={(event) => event.stopPropagation()}
          className="max-w-md w-full flex items-center justify-center px-2"
        >
          {!isFallback ? (
            <img
              src={currentImage.src}
              alt={currentImage.alt}
              onError={() => onImageError(currentImage.id)}
              className="max-h-[74dvh] max-w-full w-auto object-contain"
            />
          ) : (
            <div className="w-full max-w-[320px] aspect-[4/5] bg-[#332E29] border border-ivory/20 p-5 flex flex-col items-center justify-center text-center relative">
              <div className="absolute inset-3 border border-ivory/10 pointer-events-none" />
              <Camera
                className="w-6 h-6 text-ivory/50 mb-3"
                strokeWidth={1.25}
              />
              <p className="font-serif-en text-[12px] tracking-[0.24em] text-ivory/75">
                SCENE {String(currentIndex + 1).padStart(2, '0')}
              </p>
              <p className="mt-2 font-serif-kr text-[13px] text-ivory/60">
                {currentImage.alt}
              </p>
            </div>
          )}
        </div>

        {hasNext && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onChangeIndex(currentIndex + 1);
            }}
            aria-label="다음 사진"
            className="absolute right-0 z-10 w-10 h-10 rounded-full bg-ink/50 border border-white/15 flex items-center justify-center text-ivory/85 hover:text-ivory hover:bg-ink/80 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* 하단 안내 */}
      <p className="text-center font-serif-kr text-[12px] text-ivory/55">
        {currentImage.alt}
      </p>
    </div>
  );
}
