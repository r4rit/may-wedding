import { useCallback, useEffect, useState, type FormEvent } from 'react';
import confetti from 'canvas-confetti';
import { Loader2, Send, Trash2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import {
  addGuestbookEntry,
  deleteGuestbookEntry,
  fetchGuestbookEntries,
  type GuestbookEntry,
} from '../lib/supabase';
import { FadeIn } from './FadeIn';
import { GuestbookDeleteModal } from './GuestbookDeleteModal';

const PAGE_SIZE = 6;
const EDITORIAL_CONFETTI_COLORS = [
  '#D9C5B2',
  '#B89F8D',
  '#E8DDD3',
  '#9E6B64',
  '#8E7F72',
];

const kstEntryDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

function formatEntryDateKst(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';
  return kstEntryDateFormatter.format(date).replaceAll('-', '. ');
}

function fireEditorialConfetti(): void {
  if (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return;
  }

  void confetti({
    particleCount: 48,
    spread: 64,
    origin: { y: 0.72 },
    colors: EDITORIAL_CONFETTI_COLORS,
    ticks: 180,
    scalar: 0.9,
    disableForReducedMotion: true,
  });
}

function mergeUniqueEntries(
  existing: GuestbookEntry[],
  incoming: GuestbookEntry[],
): GuestbookEntry[] {
  const seen = new Set(existing.map((item) => item.id));
  const merged = [...existing];
  for (const item of incoming) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      merged.push(item);
    }
  }
  return merged;
}

export function Guestbook() {
  const { showToast } = useToast();

  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [authorName, setAuthorName] = useState('');
  const [message, setMessage] = useState('');
  const [pin, setPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<GuestbookEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const loadInitial = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const result = await fetchGuestbookEntries(0, PAGE_SIZE);
      setEntries(result.entries);
      setTotalCount(result.totalCount);
      setHasMore(result.hasMore);
      setIsDemoMode(result.isDemoMode);
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : '방명록을 불러오지 못했습니다.';
      setLoadError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInitial();
  }, [loadInitial]);

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);

    try {
      const result = await fetchGuestbookEntries(entries.length, PAGE_SIZE);
      setEntries((prev) => mergeUniqueEntries(prev, result.entries));
      setTotalCount(result.totalCount);
      setHasMore(result.hasMore);
    } catch {
      showToast('방명록을 더 불러오지 못했습니다', 'error');
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const trimmedName = authorName.trim();
    const trimmedMessage = message.trim();

    if (trimmedName.length < 1 || trimmedName.length > 20) {
      showToast('작성자 이름은 1~20자 이내로 입력해 주세요', 'error');
      return;
    }

    if (trimmedMessage.length < 1 || trimmedMessage.length > 300) {
      showToast('축하 메시지는 1~300자 이내로 입력해 주세요', 'error');
      return;
    }

    if (!/^[0-9]{4}$/.test(pin)) {
      showToast('삭제용 비밀번호는 숫자 4자리로 입력해 주세요', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const created = await addGuestbookEntry(trimmedName, trimmedMessage, pin);
      setEntries((prev) => mergeUniqueEntries([created], prev));
      setTotalCount((prev) => prev + 1);
      setAuthorName('');
      setMessage('');
      setPin('');
      fireEditorialConfetti();
      showToast('축하 메시지가 등록되었습니다', 'success');
    } catch (error) {
      const errMsg =
        error instanceof Error ? error.message : '방명록 등록에 실패했습니다';
      showToast(errMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDeleteModal = (entry: GuestbookEntry) => {
    setDeleteError(null);
    setDeleteTarget(entry);
  };

  const handleConfirmDelete = async (inputPin: string) => {
    if (!deleteTarget || isDeleting) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const deleted = await deleteGuestbookEntry(deleteTarget.id, inputPin);
      if (deleted) {
        const targetId = deleteTarget.id;
        setEntries((prev) => prev.filter((item) => item.id !== targetId));
        setTotalCount((prev) => Math.max(0, prev - 1));
        setDeleteTarget(null);
        showToast('방명록이 삭제되었습니다', 'success');
      } else {
        setDeleteError('비밀번호가 일치하지 않습니다.');
        showToast('비밀번호가 일치하지 않습니다', 'error');
      }
    } catch (error) {
      const errMsg =
        error instanceof Error ? error.message : '방명록 삭제에 실패했습니다.';
      setDeleteError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section
      id="guestbook"
      className="bg-linen py-24 px-6 border-t border-stone-line/70"
    >
      <FadeIn>
        <div className="text-center">
          <p className="editorial-eyebrow">GUESTBOOK</p>
          <h2 className="mt-3 font-serif-kr text-[19px] font-normal tracking-wide text-ink">
            축하 메시지
          </h2>
          <p className="mt-3 font-serif-kr text-[13.5px] text-taupe">
            두 사람의 새로운 시작에 따뜻한 마음을 남겨 주세요
          </p>
          {isDemoMode && (
            <p className="mt-2 font-sans text-[11px] text-taupe/75">
              * 현재 로컬 미리보기 모드입니다 (샘플 삭제 비밀번호: 1234)
            </p>
          )}
        </div>

        {/* 방명록 작성 폼 */}
        <form
          onSubmit={handleSubmit}
          className="mt-10 bg-ivory border border-stone-line p-5 space-y-3.5"
        >
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label htmlFor="guestbook-author" className="sr-only">
                이름
              </label>
              <input
                id="guestbook-author"
                type="text"
                maxLength={20}
                value={authorName}
                disabled={isSubmitting}
                onChange={(event) => setAuthorName(event.target.value)}
                placeholder="이름 (최대 20자)"
                className="w-full bg-linen/60 border border-stone-line px-3.5 py-2.5 text-[16px] text-ink placeholder:text-[13px] placeholder:text-taupe/70 focus:outline-none focus:border-bronze"
              />
            </div>

            <div>
              <label htmlFor="guestbook-pin" className="sr-only">
                삭제 비밀번호 숫자 4자리
              </label>
              <input
                id="guestbook-pin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                autoComplete="off"
                value={pin}
                disabled={isSubmitting}
                onChange={(event) =>
                  setPin(event.target.value.replace(/\D/g, '').slice(0, 4))
                }
                placeholder="비밀번호 4자리"
                className="w-full bg-linen/60 border border-stone-line px-3.5 py-2.5 text-[16px] text-ink placeholder:text-[13px] placeholder:text-taupe/70 focus:outline-none focus:border-bronze"
              />
            </div>
          </div>

          <div>
            <label htmlFor="guestbook-message" className="sr-only">
              축하 메시지
            </label>
            <textarea
              id="guestbook-message"
              rows={3}
              maxLength={300}
              value={message}
              disabled={isSubmitting}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="신랑·신부에게 따뜻한 축하의 마음을 전해 주세요"
              className="w-full bg-linen/60 border border-stone-line px-3.5 py-2.5 text-[16px] leading-relaxed text-ink placeholder:text-[13px] placeholder:text-taupe/70 resize-none focus:outline-none focus:border-bronze"
            />
            <div className="mt-1 flex items-center justify-between text-[11px] font-sans text-taupe">
              <span>비밀번호는 본인 글 삭제 시 사용됩니다</span>
              <span className="tabular-nums">{message.length} / 300</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-ink text-ivory hover:bg-ink/90 active:scale-[0.99] disabled:opacity-50 transition-all py-3 text-[13px] font-sans flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.7} />
                <span>등록 중...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" strokeWidth={1.6} />
                <span>축하 메시지 남기기</span>
              </>
            )}
          </button>
        </form>

        {/* 방명록 목록 */}
        <div className="mt-8 space-y-3">
          {!isLoading && !loadError && (
            <p className="font-serif-en text-[11px] tracking-[0.2em] text-taupe text-right tabular-nums">
              TOTAL {totalCount}
            </p>
          )}

          {isLoading ? (
            <div className="py-12 text-center">
              <Loader2
                className="w-5 h-5 text-taupe animate-spin mx-auto"
                strokeWidth={1.5}
              />
              <p className="mt-2 font-sans text-[12.5px] text-taupe">
                방명록을 불러오는 중입니다...
              </p>
            </div>
          ) : loadError ? (
            <div className="bg-ivory border border-stone-line py-10 px-5 text-center space-y-3">
              <p className="font-sans text-[13px] text-taupe">{loadError}</p>
              <button
                type="button"
                onClick={() => void loadInitial()}
                className="border border-stone-line bg-linen/70 hover:bg-linen px-4 py-2 text-[12px] font-sans text-ink cursor-pointer"
              >
                다시 시도
              </button>
            </div>
          ) : entries.length === 0 ? (
            <div className="bg-ivory border border-stone-line py-12 px-5 text-center">
              <p className="font-serif-kr text-[13.5px] text-taupe">
                첫 번째 축하 메시지를 남겨 주세요
              </p>
            </div>
          ) : (
            entries.map((entry) => (
              <article
                key={entry.id}
                className="bg-ivory border border-stone-line px-5 py-4 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-baseline gap-2 min-w-0">
                    <h3 className="font-serif-kr text-[14.5px] font-bold text-ink truncate">
                      {entry.author_name}
                    </h3>
                    <time
                      dateTime={entry.created_at}
                      className="font-serif-en text-[11.5px] tracking-[0.08em] text-taupe tabular-nums shrink-0"
                    >
                      {formatEntryDateKst(entry.created_at)}
                    </time>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenDeleteModal(entry)}
                    aria-label={`${entry.author_name}님의 방명록 삭제`}
                    className="p-1 text-taupe/70 hover:text-rose-clay transition-colors shrink-0 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>
                </div>

                <p className="font-sans text-[13.5px] leading-[1.75] text-ink/85 whitespace-pre-wrap break-words">
                  {entry.message}
                </p>
              </article>
            ))
          )}

          {hasMore && !isLoading && (
            <button
              type="button"
              onClick={() => void handleLoadMore()}
              disabled={isLoadingMore}
              className="w-full border border-stone-line bg-ivory hover:bg-ivory/70 py-3 text-[12.5px] font-sans text-ink/85 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isLoadingMore ? '불러오는 중...' : '더 보기'}
            </button>
          )}
        </div>
      </FadeIn>

      <GuestbookDeleteModal
        entry={deleteTarget}
        isDeleting={isDeleting}
        errorMessage={deleteError}
        onClose={() => {
          if (!isDeleting) {
            setDeleteTarget(null);
            setDeleteError(null);
          }
        }}
        onConfirm={handleConfirmDelete}
      />
    </section>
  );
}
