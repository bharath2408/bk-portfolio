import { profile } from "@/lib/data";
import type { Highlight } from "@/lib/types";
import { Reveal } from "./Reveal";
import { SpotlightCard } from "./SpotlightCard";
import { SectionHeading } from "./SectionHeading";

export function About({
  about = profile.about,
  highlights = profile.highlights,
}: {
  about?: string;
  highlights?: Highlight[];
}) {
  return (
    <section id="about" className="mx-auto max-w-shell px-6 py-24 md:px-10">
      <SectionHeading
        eyebrow="About me"
        title="I turn complex requirements into clean, fast interfaces."
      />

      <div className="mt-10 grid gap-10 md:grid-cols-[1fr_320px] md:items-start">
        <Reveal delay={0.05}>
          <p className="text-base leading-relaxed text-muted md:text-lg">{about}</p>
        </Reveal>

        <Reveal delay={0.15} className="flex flex-col gap-4">
          {highlights.map((h) => (
            <SpotlightCard key={h.title} className="card p-5">
              <p className="font-display text-lg font-semibold text-ink">{h.title}</p>
              <p className="mt-0.5 text-sm text-faint">{h.sub}</p>
            </SpotlightCard>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
