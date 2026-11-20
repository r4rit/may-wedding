import { AlertCircle, Check } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export function ToastContainer() {
  const { toast } = useToast();

  if (!toast) {
    return null;
  }

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-3rem)] max-w-[380px] pointer-events-none mb-safe"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        key={toast.id}
        className="bg-ink/90 text-ivory backdrop-blur-sm border border-white/10 rounded-full px-5 py-3 shadow-[0_8px_24px_rgba(35,33,31,0.18)] flex items-center justify-center gap-2 text-[13px] font-sans tracking-tight animate-toast-enter"
      >
        {toast.type === 'success' && (
          <Check className="w-3.5 h-3.5 text-ivory/90 shrink-0" strokeWidth={1.75} />
        )}
        {toast.type === 'error' && (
          <AlertCircle className="w-3.5 h-3.5 text-rose-clay shrink-0" strokeWidth={1.75} />
        )}
        <span className="truncate">{toast.message}</span>
      </div>
    </div>
  );
}
