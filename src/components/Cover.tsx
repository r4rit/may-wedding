import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { weddingConfig } from '../data/weddingConfig';
import { formatKstCoverDate } from '../lib/date';

export function Cover() {
  const [imageFailed, setImageFailed] = useState(false);
  const { dotted, dayLabelEn } = formatKstCoverDate(weddingConfig.weddingDateISO);

  const handleScrollToGreeting = () => {
    const target = document.getElementById('greeting');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      aria-label="웨딩 커버"
      className="relative w-full h-dvh min-h-[600px] overflow-hidden bg-[#3B3530] text-ivory select-none"
    >
      {!imageFailed ? (
        <img
          src={weddingConfig.cover.imageSrc}
          alt={`${weddingConfig.groom.lastName}${weddingConfig.groom.firstName} 그리고 ${weddingConfig.bride.lastName}${weddingConfig.bride.firstName} 웨딩 스냅`}
          fetchPriority="high"
          loading="eager"
          decoding="async"
          onError={() => setImageFailed(true)}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#6E6358_0%,_#453E38_55%,_#272320_100%)]"
        >
          <div className="pointer-events-none absolute inset-5 border border-ivory/15" />
        </div>
      )}

      {/* 상·하단 그라데이션 스크림 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/60"
      />

      <div className="relative z-10 h-full flex flex-col justify-between items-center px-6 pt-14 pb-9 text-center">
        {/* 상단 영문 세리프 날짜 오버레이 */}
        <div className="space-y-2.5">
          <p className="font-serif-en text-[11px] uppercase tracking-[0.28em] text-ivory/80">
            {weddingConfig.cover.eyebrow}
          </p>
          <p className="font-serif-en text-[34px] font-light tracking-[0.14em] leading-none text-ivory">
            {dotted}
          </p>
          <p className="font-serif-en italic text-[13px] tracking-[0.18em] text-ivory/80">
            {dayLabelEn}
          </p>
        </div>

        {/* 하단 신랑·신부 성함 및 예식 안내 */}
        <div className="w-full flex flex-col items-center gap-5">
          <div className="space-y-2">
            <h1 className="font-serif-en text-[30px] font-light tracking-[0.16em] leading-tight text-ivory">
              {weddingConfig.groom.englishName.toUpperCase()}
              <span className="italic font-light text-[22px] mx-2.5 text-ivory/80">&amp;</span>
              {weddingConfig.bride.englishName.toUpperCase()}
            </h1>
            <p className="font-serif-kr text-[14.5px] tracking-[0.18em] text-ivory/90">
              {weddingConfig.groom.lastName}
              {weddingConfig.groom.firstName} · {weddingConfig.bride.lastName}
              {weddingConfig.bride.firstName}
            </p>
          </div>

          <div className="w-8 h-px bg-ivory/40" />

          <div className="space-y-1">
            <p className="font-serif-en text-[12px] tracking-[0.2em] text-ivory/85">
              {weddingConfig.cover.dateDisplay}
            </p>
            <p className="font-serif-kr text-[13px] tracking-wide text-ivory/85">
              {weddingConfig.cover.venueDisplay}
            </p>
          </div>

          <button
            type="button"
            onClick={handleScrollToGreeting}
            aria-label="본문으로 이동"
            className="mt-1 p-2 text-ivory/80 hover:text-ivory transition-colors cursor-pointer animate-scroll-hint"
          >
            <ChevronDown className="w-5 h-5" strokeWidth={1.25} />
          </button>
        </div>
      </div>
    </section>
  );
}
