const KST_TIME_ZONE = 'Asia/Seoul';
const MS_PER_DAY = 86_400_000;

const WEEKDAYS_EN_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const WEEKDAYS_EN_UPPER = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
] as const;
const WEEKDAYS_KO = ['일', '월', '화', '수', '목', '금', '토'] as const;

const MONTHS_EN_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

const MONTHS_EN_UPPER = [
  'JANUARY',
  'FEBRUARY',
  'MARCH',
  'APRIL',
  'MAY',
  'JUNE',
  'JULY',
  'AUGUST',
  'SEPTEMBER',
  'OCTOBER',
  'NOVEMBER',
  'DECEMBER',
] as const;

export interface KstDateParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  weekdayIndex: number;
}

export interface CalendarCell {
  key: string;
  day: number | null;
  weekdayIndex: number;
  isSunday: boolean;
  isSaturday: boolean;
  isWeddingDay: boolean;
}

export interface DDayInfo {
  diffDays: number;
  status: 'before' | 'today' | 'after';
  absDays: number;
}

const kstFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: KST_TIME_ZONE,
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

export function getKstDateParts(date: Date): KstDateParts {
  const parts = kstFormatter.formatToParts(date);
  const map = new Map<string, string>();
  for (const part of parts) {
    if (part.type !== 'literal') {
      map.set(part.type, part.value);
    }
  }

  const rawHour = Number(map.get('hour') ?? '0');
  const hour = rawHour === 24 ? 0 : rawHour;
  const weekdayShort = map.get('weekday') ?? 'Sun';
  const weekdayIndex = Math.max(
    0,
    WEEKDAYS_EN_SHORT.indexOf(weekdayShort as (typeof WEEKDAYS_EN_SHORT)[number]),
  );

  return {
    year: Number(map.get('year') ?? '0'),
    month: Number(map.get('month') ?? '1'),
    day: Number(map.get('day') ?? '1'),
    hour,
    minute: Number(map.get('minute') ?? '0'),
    weekdayIndex,
  };
}

export function getKstDDay(weddingDateISO: string, now: Date = new Date()): DDayInfo {
  const weddingParts = getKstDateParts(new Date(weddingDateISO));
  const nowParts = getKstDateParts(now);

  const weddingUtc = Date.UTC(weddingParts.year, weddingParts.month - 1, weddingParts.day);
  const nowUtc = Date.UTC(nowParts.year, nowParts.month - 1, nowParts.day);

  const diffDays = Math.round((weddingUtc - nowUtc) / MS_PER_DAY);
  const status = diffDays > 0 ? 'before' : diffDays === 0 ? 'today' : 'after';

  return {
    diffDays,
    status,
    absDays: Math.abs(diffDays),
  };
}

export function buildKstCalendarGrid(weddingDateISO: string): {
  year: number;
  month: number;
  monthNameEn: string;
  weddingDay: number;
  cells: CalendarCell[];
} {
  const { year, month, day: weddingDay } = getKstDateParts(new Date(weddingDateISO));
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  const totalCells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;
  const cells: CalendarCell[] = [];

  for (let idx = 0; idx < totalCells; idx += 1) {
    const dayNumber = idx - firstWeekday + 1;
    const isValidDay = dayNumber >= 1 && dayNumber <= daysInMonth;
    const weekdayIndex = idx % 7;

    cells.push({
      key: `${year}-${month}-${idx}`,
      day: isValidDay ? dayNumber : null,
      weekdayIndex,
      isSunday: weekdayIndex === 0,
      isSaturday: weekdayIndex === 6,
      isWeddingDay: isValidDay && dayNumber === weddingDay,
    });
  }

  return {
    year,
    month,
    monthNameEn: MONTHS_EN_LONG[month - 1] ?? 'May',
    weddingDay,
    cells,
  };
}

export function formatKstKoreanDateTime(weddingDateISO: string): string {
  const { year, month, day, hour, minute, weekdayIndex } = getKstDateParts(
    new Date(weddingDateISO),
  );
  const period = hour < 12 ? '오전' : '오후';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  const minutePart = minute > 0 ? ` ${minute}분` : '';

  return `${year}년 ${month}월 ${day}일 ${WEEKDAYS_KO[weekdayIndex]}요일 ${period} ${displayHour}시${minutePart}`;
}

export function formatKstCoverDate(weddingDateISO: string): {
  dotted: string;
  dayLabelEn: string;
} {
  const { year, month, day, weekdayIndex } = getKstDateParts(new Date(weddingDateISO));
  const monthPadded = String(month).padStart(2, '0');
  const dayPadded = String(day).padStart(2, '0');

  return {
    dotted: `${year}. ${monthPadded}. ${dayPadded}`,
    dayLabelEn: `${WEEKDAYS_EN_UPPER[weekdayIndex]}, ${MONTHS_EN_UPPER[month - 1]} ${year}`,
  };
}
