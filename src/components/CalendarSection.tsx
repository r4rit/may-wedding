import { useEffect, useMemo, useState } from 'react';
import { Heart } from 'lucide-react';
import { weddingConfig } from '../data/weddingConfig';
import {
  buildKstCalendarGrid,
  formatKstKoreanDateTime,
  getKstDDay,
} from '../lib/date';
import { FadeIn } from './FadeIn';

const WEEKDAY_HEADERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;

export function CalendarSection() {
  const calendar = useMemo(
    () => buildKstCalendarGrid(weddingConfig.weddingDateISO),
    [],
  );
  const koreanDateTime = useMemo(
    () => formatKstKoreanDateTime(weddingConfig.weddingDateISO),
    [],
  );

  const [dday, setDday] = useState(() => getKstDDay(weddingConfig.weddingDateISO));

  useEffect(() => {
    const updateDDay = () => {
      setDday(getKstDDay(weddingConfig.weddingDateISO));
    };

    updateDDay();
    const intervalId = window.setInterval(updateDDay, 60_000);
    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <section
      id="calendar"
      className="bg-linen py-24 px-6 text-center border-y border-stone-line/70"
    >
      <FadeIn>
        <p className="editorial-eyebrow">CALENDAR</p>
        <h2 className="mt-3 font-serif-en text-[32px] font-light tracking-[0.06em] text-ink">
          {calendar.monthNameEn} {calendar.year}
        </h2>
        <p className="mt-2 font-serif-kr text-[14px] text-taupe tracking-wide">
          {koreanDateTime}
        </p>

        {/* 가로폭 75% 미니멀 달력 */}
        <div className="w-[75%] mx-auto mt-10 border-y border-stone-line py-5">
          <div className="grid grid-cols-7 mb-3">
            {WEEKDAY_HEADERS.map((label, idx) => (
              <div
                key={label + idx}
                className={`font-serif-en text-[11px] tracking-[0.14em] ${
                  idx === 0 ? 'text-rose-clay' : 'text-taupe'
                }`}
              >
                {label}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-2.5">
            {calendar.cells.map((cell) => {
              if (cell.day === null) {
                return <div key={cell.key} className="h-8" aria-hidden="true" />;
              }

              if (cell.isWeddingDay) {
                return (
                  <div
                    key={cell.key}
                    className="h-8 flex items-center justify-center"
                    aria-label={`예식일 ${calendar.month}월 ${cell.day}일`}
                  >
                    <div className="relative w-7 h-7 rounded-full bg-rose-clay text-ivory flex items-center justify-center shadow-[0_2px_8px_rgba(158,107,100,0.28)]">
                      <Heart
                        aria-hidden="true"
                        className="w-2.5 h-2.5 fill-rose-clay text-rose-clay absolute -top-2"
                        strokeWidth={1.5}
                      />
                      <span className="font-serif-en text-[13.5px] font-medium tabular-nums leading-none">
                        {cell.day}
                      </span>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={cell.key}
                  className={`h-8 flex items-center justify-center font-serif-en text-[14px] tabular-nums ${
                    cell.isSunday ? 'text-rose-clay/85' : 'text-ink/85'
                  }`}
                >
                  {cell.day}
                </div>
              );
            })}
          </div>
        </div>

        {/* KST 기준 실시간 D-Day 텍스트 바 */}
        <div className="mt-9">
          <p className="inline-block font-serif-kr text-[13.5px] text-ink/85 tracking-wide">
            {dday.status === 'before' && (
              <>
                {weddingConfig.groom.firstName}{' '}
                <span className="text-rose-clay mx-0.5" aria-hidden="true">
                  ♥
                </span>{' '}
                {weddingConfig.bride.firstName}의 결혼식이{' '}
                <span className="font-sans font-medium text-rose-clay tabular-nums">
                  {dday.absDays}일
                </span>{' '}
                남았습니다
              </>
            )}
            {dday.status === 'today' && (
              <span className="text-rose-clay font-medium">
                오늘, 두 사람의 결혼식이 진행됩니다
              </span>
            )}
            {dday.status === 'after' && (
              <>
                결혼식으로부터{' '}
                <span className="font-sans font-medium text-rose-clay tabular-nums">
                  {dday.absDays}일
                </span>
                이 지났습니다 · 함께해 주셔서 감사합니다
              </>
            )}
          </p>
        </div>
      </FadeIn>
    </section>
  );
}
