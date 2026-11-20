import { useCallback, useRef, useState } from 'react';
import { Camera, ChevronLeft, ChevronRight } from 'lucide-react';
import { weddingConfig } from '../data/weddingConfig';
import { FadeIn } from './FadeIn';
import { GalleryModal } from './GalleryModal';

const PLACEHOLDER_BACKDROPS = [
  'bg-gradient-to-br from-[#EAE3D9] via-[#E1D8CB] to-[#D6CAB9]',
  'bg-gradient-to-br from-[#E6DFD6] via-[#DCD3C6] to-[#CFC3B3]',
  'bg-gradient-to-br from-[#ECE6DD] via-[#E0D7CA] to-[#D3C7B7]',
] as const;

export function Gallery() {
  const images = weddingConfig.gallery;
  const trackRef = useRef<HTMLDivElement>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const [failedIds, setFailedIds] = useState<Set<string>>(() => new Set());

  const handleImageError = useCallback((id: string) => {
    setFailedIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const handleTrackScroll = () => {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;

    const nextIndex = Math.min(
      images.length - 1,
      Math.max(0, Math.round(track.scrollLeft / track.clientWidth)),
    );
    if (nextIndex !== activeIndex) {
      setActiveIndex(nextIndex);
    }
  };

  const scrollToSlide = (targetIndex: number) => {
    const track = trackRef.current;
    if (!track) return;

    const clamped = Math.min(images.length - 1, Math.max(0, targetIndex));
    track.scrollTo({
      left: clamped * track.clientWidth,
      behavior: 'smooth',
    });
    setActiveIndex(clamped);
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <section
      id="gallery"
      className="bg-linen py-24 border-y border-stone-line/70"
    >
      <FadeIn>
        <div className="px-6 text-center">
          <p className="editorial-eyebrow">GALLERY</p>
          <h2 className="mt-3 font-serif-kr text-[19px] font-normal tracking-wide text-ink">
            우리의 순간들
          </h2>
        </div>

        {/* 인스타그램 스타일 가로 스와이프 캐러셀 */}
        <div className="mt-10 relative">
          <div
            ref={trackRef}
            onScroll={handleTrackScroll}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none"
            role="region"
            aria-label="웨딩 사진 갤러리"
          >
            {images.map((image, index) => {
              const isFallback = failedIds.has(image.id);
              const backdropClass =
                PLACEHOLDER_BACKDROPS[index % PLACEHOLDER_BACKDROPS.length];

              return (
                <div
                  key={image.id}
                  className="w-full shrink-0 snap-center px-6"
                >
                  <button
                    type="button"
                    onClick={() => setModalIndex(index)}
                    aria-label={`${image.alt} 크게 보기`}
                    className="w-full aspect-[4/5] overflow-hidden border border-stone-line bg-ivory relative block cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-taupe"
                  >
                    {!isFallback ? (
                      <img
                        src={image.src}
                        alt={image.alt}
                        loading={index < 2 ? 'eager' : 'lazy'}
                        decoding="async"
                        onError={() => handleImageError(image.id)}
                        className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-[1.015]"
                      />
                    ) : (
                      <div
                        className={`w-full h-full ${backdropClass} flex flex-col items-center justify-center p-6 text-center relative`}
                      >
                        <div className="absolute inset-4 border border-ink/10 pointer-events-none" />
                        <Camera
                          className="w-5 h-5 text-taupe/70 mb-3"
                          strokeWidth={1.35}
                        />
                        <p className="font-serif-en text-[12px] tracking-[0.26em] text-ink/70">
                          SCENE {String(index + 1).padStart(2, '0')}
                        </p>
                        <p className="mt-2 font-serif-kr text-[12.5px] text-taupe">
                          {image.alt}
                        </p>
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {activeIndex > 0 && (
            <button
              type="button"
              onClick={() => scrollToSlide(activeIndex - 1)}
              aria-label="이전 슬라이드"
              className="hidden sm:flex absolute left-8 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-ivory/85 border border-stone-line items-center justify-center text-ink/75 hover:text-ink hover:bg-ivory shadow-sm transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={1.6} />
            </button>
          )}

          {activeIndex < images.length - 1 && (
            <button
              type="button"
              onClick={() => scrollToSlide(activeIndex + 1)}
              aria-label="다음 슬라이드"
              className="hidden sm:flex absolute right-8 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-ivory/85 border border-stone-line items-center justify-center text-ink/75 hover:text-ink hover:bg-ivory shadow-sm transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" strokeWidth={1.6} />
            </button>
          )}
        </div>

        {/* 도트 인디케이터 + 슬라이드 인덱스 */}
        <div className="mt-5 px-6 flex flex-col items-center gap-2.5">
          <div className="flex items-center justify-center gap-2">
            {images.map((image, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => scrollToSlide(index)}
                  aria-label={`${index + 1}번 사진으로 이동`}
                  aria-current={isActive ? 'true' : undefined}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'w-5 bg-bronze'
                      : 'w-1.5 bg-stone-line hover:bg-taupe/60'
                  }`}
                />
              );
            })}
          </div>

          <p className="font-serif-en text-[12px] tracking-[0.22em] text-taupe tabular-nums">
            {activeIndex + 1} / {images.length}
          </p>
        </div>
      </FadeIn>

      <GalleryModal
        images={images}
        currentIndex={modalIndex}
        failedIds={failedIds}
        onImageError={handleImageError}
        onClose={() => setModalIndex(null)}
        onChangeIndex={setModalIndex}
      />
    </section>
  );
}
