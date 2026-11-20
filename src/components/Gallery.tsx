import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, ChevronLeft, ChevronRight } from 'lucide-react';
import { weddingConfig } from '../data/weddingConfig';
import { FadeIn } from './FadeIn';
import { GalleryModal } from './GalleryModal';

type ViewMode = 'swipe' | 'grid' | 'editorial';

interface ViewTab {
  id: ViewMode;
  label: string;
  enLabel: string;
}

const VIEW_TABS: readonly ViewTab[] = [
  { id: 'swipe', label: '스와이프', enLabel: 'Swipe' },
  { id: 'grid', label: '3열 그리드', enLabel: 'Grid' },
  { id: 'editorial', label: '에디토리얼 스토리', enLabel: 'Editorial' },
] as const;

const PLACEHOLDER_BACKDROPS = [
  'bg-gradient-to-br from-[#EAE3D9] via-[#E1D8CB] to-[#D6CAB9]',
  'bg-gradient-to-br from-[#E6DFD6] via-[#DCD3C6] to-[#CFC3B3]',
  'bg-gradient-to-br from-[#ECE6DD] via-[#E0D7CA] to-[#D3C7B7]',
] as const;

const EDITORIAL_TITLES = [
  'Moments',
  'Promise',
  'Together',
  'Warmth',
  'Stillness',
  'Sunlight',
  'Whisper',
  'Grace',
  'Bloom',
  'Serenity',
  'Always',
  'Devotion',
  'Harmony',
  'Forever',
  'May',
] as const;

const ROMAN_NUMERALS = [
  'i',
  'ii',
  'iii',
  'iv',
  'v',
  'vi',
  'vii',
  'viii',
  'ix',
  'x',
  'xi',
  'xii',
  'xiii',
  'xiv',
  'xv',
  'xvi',
  'xvii',
  'xviii',
  'xix',
  'xx',
] as const;

function getEditorialCaption(index: number): string {
  const numeral = ROMAN_NUMERALS[index] ?? String(index + 1);
  const title = EDITORIAL_TITLES[index % EDITORIAL_TITLES.length];
  return `${numeral}. ${title}`;
}

export function Gallery() {
  const images = weddingConfig.gallery;
  const trackRef = useRef<HTMLDivElement>(null);

  const [viewMode, setViewMode] = useState<ViewMode>('swipe');
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

  // 스와이프 모드로 복귀 시 마지막으로 보던 슬라이드 위치 동기화
  useEffect(() => {
    if (viewMode !== 'swipe') return;
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;

    track.scrollTo({
      left: activeIndex * track.clientWidth,
      behavior: 'auto',
    });
  }, [viewMode]); // eslint-disable-line react-hooks/exhaustive-deps

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

          {/* 뷰 모드 전환 탭 (Swipe / Grid / Editorial) */}
          <div
            role="tablist"
            aria-label="갤러리 보기 방식 선택"
            className="mt-7 inline-grid grid-cols-3 w-full max-w-[360px] p-1 rounded-full bg-ivory/80 border border-stone-line/90 shadow-[0_1px_2px_rgba(35,33,31,0.03)]"
          >
            {VIEW_TABS.map((tab) => {
              const isSelected = viewMode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  aria-controls={`gallery-panel-${tab.id}`}
                  id={`gallery-tab-${tab.id}`}
                  onClick={() => setViewMode(tab.id)}
                  className={`py-2 px-1.5 rounded-full transition-all duration-300 cursor-pointer flex flex-col items-center justify-center leading-tight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-taupe ${
                    isSelected
                      ? 'bg-ink text-ivory shadow-xs'
                      : 'text-taupe hover:text-ink'
                  }`}
                >
                  <span className="font-serif-kr text-[11px] tracking-tight whitespace-nowrap">
                    {tab.label}
                  </span>
                  <span
                    className={`mt-0.5 font-serif-en text-[10px] tracking-[0.14em] uppercase ${
                      isSelected ? 'text-ivory/75' : 'text-taupe/75'
                    }`}
                  >
                    {tab.enLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 선택된 뷰 모드 콘텐츠 */}
        <div
          key={viewMode}
          id={`gallery-panel-${viewMode}`}
          role="tabpanel"
          aria-labelledby={`gallery-tab-${viewMode}`}
          className="mt-9 animate-gallery-view"
        >
          {/* 1. 스와이프 (Swipe) — 기존 CSS Scroll Snap 캐러셀 */}
          {viewMode === 'swipe' && (
            <>
              <div className="relative">
                <div
                  ref={trackRef}
                  onScroll={handleTrackScroll}
                  className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none"
                  role="region"
                  aria-label="웨딩 사진 갤러리 스와이프"
                >
                  {images.map((image, index) => {
                    const isFallback = failedIds.has(image.id);
                    const backdropClass =
                      PLACEHOLDER_BACKDROPS[
                        index % PLACEHOLDER_BACKDROPS.length
                      ];

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
                <div className="flex items-center justify-center gap-2 flex-wrap">
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
            </>
          )}

          {/* 2. 3열 그리드 (Grid) — 인스타그램 프로필 피드 스타일 */}
          {viewMode === 'grid' && (
            <div className="px-4">
              <div className="grid grid-cols-3 gap-1">
                {images.map((image, index) => {
                  const isFallback = failedIds.has(image.id);
                  const backdropClass =
                    PLACEHOLDER_BACKDROPS[
                      index % PLACEHOLDER_BACKDROPS.length
                    ];

                  return (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => setModalIndex(index)}
                      aria-label={`${image.alt} 크게 보기`}
                      className="aspect-square overflow-hidden bg-ivory border border-stone-line/50 relative block cursor-pointer group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-taupe"
                    >
                      {!isFallback ? (
                        <img
                          src={image.src}
                          alt={image.alt}
                          loading={index < 6 ? 'eager' : 'lazy'}
                          decoding="async"
                          onError={() => handleImageError(image.id)}
                          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.04]"
                        />
                      ) : (
                        <div
                          className={`w-full h-full ${backdropClass} flex flex-col items-center justify-center p-2 text-center`}
                        >
                          <Camera
                            className="w-4 h-4 text-taupe/70 mb-1"
                            strokeWidth={1.35}
                          />
                          <span className="font-serif-en text-[10px] tracking-[0.18em] text-ink/65">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <p className="mt-5 text-center font-serif-kr text-[11.5px] text-taupe/80">
                사진을 누르면 크게 보실 수 있습니다
              </p>
            </div>
          )}

          {/* 3. 에디토리얼 스토리 (Editorial) — 킨포크 화보 잡지 스타일 */}
          {viewMode === 'editorial' && (
            <div className="px-6 space-y-12">
              {images.map((image, index) => {
                const isFallback = failedIds.has(image.id);
                const backdropClass =
                  PLACEHOLDER_BACKDROPS[index % PLACEHOLDER_BACKDROPS.length];
                const isPortrait = index % 2 === 0;
                const isLast = index === images.length - 1;

                return (
                  <article key={image.id} className="flex flex-col items-center">
                    <div className={isPortrait ? 'w-[86%]' : 'w-full'}>
                      <button
                        type="button"
                        onClick={() => setModalIndex(index)}
                        aria-label={`${image.alt} 크게 보기`}
                        className={`w-full ${
                          isPortrait ? 'aspect-[3/4]' : 'aspect-[4/3]'
                        } overflow-hidden border border-stone-line/90 bg-ivory relative block cursor-pointer group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-taupe`}
                      >
                        {!isFallback ? (
                          <img
                            src={image.src}
                            alt={image.alt}
                            loading={index < 2 ? 'eager' : 'lazy'}
                            decoding="async"
                            onError={() => handleImageError(image.id)}
                            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
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

                      {/* 은은한 매거진 캡션 */}
                      <div className="mt-3.5 flex items-center justify-between px-0.5">
                        <p className="font-serif-en italic text-[13.5px] tracking-[0.06em] text-taupe">
                          {getEditorialCaption(index)}
                        </p>
                        <span className="font-serif-en text-[11px] tracking-[0.2em] text-taupe/65 tabular-nums">
                          {String(index + 1).padStart(2, '0')} /{' '}
                          {String(images.length).padStart(2, '0')}
                        </span>
                      </div>
                    </div>

                    {/* 얇은 디바이더 라인 */}
                    {!isLast && (
                      <div
                        aria-hidden="true"
                        className="mt-10 w-10 h-px bg-stone-line"
                      />
                    )}
                  </article>
                );
              })}
            </div>
          )}
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
