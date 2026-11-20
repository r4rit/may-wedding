import { useEffect, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import type { GuestbookEntry } from '../lib/supabase';

interface GuestbookDeleteModalProps {
  entry: GuestbookEntry | null;
  isDeleting: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onConfirm: (pin: string) => Promise<void>;
}

export function GuestbookDeleteModal({
  entry,
  isDeleting,
  errorMessage,
  onClose,
  onConfirm,
}: GuestbookDeleteModalProps) {
  const [pin, setPin] = useState('');
  const isOpen = entry !== null;

  useEffect(() => {
    setPin('');
  }, [entry?.id]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isDeleting) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDeleting, isOpen, onClose]);

  if (!entry) {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pin.length !== 4 || isDeleting) return;
    await onConfirm(pin);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="guestbook-delete-title"
      onClick={() => {
        if (!isDeleting) onClose();
      }}
      className="fixed inset-0 z-50 bg-ink/55 backdrop-blur-[2px] flex items-center justify-center p-6"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-[340px] bg-ivory border border-stone-line p-6 shadow-[0_12px_36px_rgba(35,33,31,0.2)]"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="editorial-eyebrow">DELETE MESSAGE</p>
            <h3
              id="guestbook-delete-title"
              className="mt-1.5 font-serif-kr text-[17px] text-ink"
            >
              방명록 삭제
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            aria-label="닫기"
            className="p-1 text-taupe hover:text-ink disabled:opacity-40 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" strokeWidth={1.6} />
          </button>
        </div>

        <p className="mt-3 font-sans text-[13px] leading-relaxed text-taupe break-keep">
          <span className="text-ink font-medium">{entry.author_name}</span>님의
          축하 메시지를 삭제하려면 작성 시 설정한 숫자 4자리 비밀번호를 입력해
          주세요.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="delete-pin-input" className="sr-only">
              비밀번호 4자리
            </label>
            <input
              id="delete-pin-input"
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              autoComplete="off"
              autoFocus
              value={pin}
              disabled={isDeleting}
              onChange={(event) =>
                setPin(event.target.value.replace(/\D/g, '').slice(0, 4))
              }
              placeholder="숫자 4자리 비밀번호"
              className="w-full bg-linen/70 border border-stone-line px-3.5 py-2.5 text-[16px] text-center tracking-[0.35em] text-ink placeholder:tracking-normal placeholder:text-[13px] placeholder:text-taupe/70 focus:outline-none focus:border-bronze"
            />
            {errorMessage && (
              <p className="mt-2 font-sans text-[12px] text-rose-clay text-center">
                {errorMessage}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="border border-stone-line bg-ivory hover:bg-linen py-2.5 text-[13px] font-sans text-ink/80 disabled:opacity-50 transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={pin.length !== 4 || isDeleting}
              className="bg-ink text-ivory hover:bg-ink/90 py-2.5 text-[13px] font-sans disabled:opacity-40 transition-colors cursor-pointer"
            >
              {isDeleting ? '삭제 중...' : '삭제하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
