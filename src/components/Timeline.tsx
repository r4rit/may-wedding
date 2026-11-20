import { weddingConfig } from '../data/weddingConfig';
import { FadeIn } from './FadeIn';

export function Timeline() {
  const { timeline } = weddingConfig;

  return (
    <section id="timeline" className="bg-ivory py-24 px-6">
      <FadeIn>
        <div className="text-center">
          <p className="editorial-eyebrow">TIMELINE</p>
          <h2 className="mt-3 font-serif-kr text-[19px] font-normal tracking-wide text-ink">
            예식 순서 안내
          </h2>
        </div>

        <div className="max-w-[300px] mx-auto mt-12 relative">
          <div
            aria-hidden="true"
            className="absolute left-[7.5px] top-2 bottom-2 w-px bg-stone-line"
          />

          <ol>
            {timeline.map((item, index) => {
              const isCeremony = item.id === 'ceremony';
              const isLast = index === timeline.length - 1;

              return (
                <li
                  key={item.id}
                  className={`relative pl-8 ${isLast ? '' : 'pb-10'}`}
                >
                  <span
                    aria-hidden="true"
                    className={`absolute left-0 top-1.5 w-4 h-4 rounded-full flex items-center justify-center ${
                      isCeremony
                        ? 'bg-rose-clay/20'
                        : 'bg-ivory'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isCeremony
                          ? 'bg-rose-clay'
                          : 'bg-ivory border border-bronze'
                      }`}
                    />
                  </span>

                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2.5">
                      <span className="font-serif-en text-[14px] tracking-[0.1em] text-bronze tabular-nums">
                        {item.time}
                      </span>
                      <h3 className="font-serif-kr text-[15.5px] font-normal text-ink">
                        {item.title}
                      </h3>
                    </div>

                    <p className="font-sans text-[12px] text-taupe">
                      {item.location}
                    </p>
                    <p className="font-sans text-[12.5px] text-ink/75 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </FadeIn>
    </section>
  );
}
