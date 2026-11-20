import { weddingConfig } from '../data/weddingConfig';

export function Footer() {
  const { footer } = weddingConfig;

  return (
    <footer className="bg-linen border-t border-stone-line/70 pt-16 px-6 text-center pb-[calc(4rem+env(safe-area-inset-bottom))]">
      <div className="w-8 h-px bg-stone-line mx-auto mb-6" aria-hidden="true" />
      <p className="font-serif-kr text-[13.5px] leading-[2] text-ink/80">
        {footer.message}
      </p>
      <p className="mt-4 editorial-eyebrow">{footer.copyright}</p>
    </footer>
  );
}
