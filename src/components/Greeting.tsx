import { weddingConfig, type PersonInfo } from '../data/weddingConfig';
import { FadeIn } from './FadeIn';

function ParentName({ name, isDeceased }: { name: string; isDeceased?: boolean }) {
  return (
    <span>
      {isDeceased && <span className="text-taupe mr-0.5 text-[12px]">故</span>}
      {name}
    </span>
  );
}

function FamilyLine({ person }: { person: PersonInfo }) {
  return (
    <p className="font-serif-kr text-[15px] leading-relaxed text-ink tracking-wide">
      <span className="text-ink/90">
        <ParentName name={person.fatherName} isDeceased={person.fatherDeceased} />
        <span className="mx-1.5 text-taupe">·</span>
        <ParentName name={person.motherName} isDeceased={person.motherDeceased} />
      </span>
      <span className="text-[12.5px] text-taupe mx-1.5">의 {person.relation}</span>
      <span className="font-bold text-ink">{person.firstName}</span>
    </p>
  );
}

export function Greeting() {
  const { greeting, groom, bride } = weddingConfig;

  return (
    <section id="greeting" className="bg-ivory py-24 px-7 text-center">
      <FadeIn>
        <p className="editorial-eyebrow">{greeting.eyebrow}</p>
        <h2 className="mt-3 font-serif-kr text-[19px] font-normal tracking-wide text-ink">
          {greeting.title}
        </h2>

        <div className="w-px h-8 bg-stone-line mx-auto my-8" aria-hidden="true" />

        <div className="space-y-6">
          {greeting.paragraphs.map((paragraph, index) => (
            <p
              key={index}
              className="font-serif-kr text-[14.5px] leading-[2.2] text-ink/85 whitespace-pre-line break-keep"
            >
              {paragraph}
            </p>
          ))}
        </div>

        <div className="w-12 h-px bg-stone-line mx-auto my-10" aria-hidden="true" />

        <div className="space-y-2.5">
          <FamilyLine person={groom} />
          <FamilyLine person={bride} />
        </div>
      </FadeIn>
    </section>
  );
}
