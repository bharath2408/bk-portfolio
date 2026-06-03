import { skillGroups } from "@/lib/data";
import type { SkillGroup } from "@/lib/types";
import { Reveal } from "./Reveal";
import { SpotlightCard } from "./SpotlightCard";
import { SectionHeading } from "./SectionHeading";

const dot: Record<string, string> = {
  iris: "bg-iris",
  cyan: "bg-cyan",
  mint: "bg-mint",
};

export function Skills({ groups = skillGroups }: { groups?: SkillGroup[] }) {
  return (
    <section id="skills" className="border-y border-line bg-bg-soft/40">
      <div className="mx-auto max-w-shell px-6 py-24 md:px-10">
        <SectionHeading eyebrow="Tech stack" title="Skills & technologies" />

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {groups.map((g, i) => (
            <Reveal key={g.title} delay={(i % 4) * 0.06} className="h-full">
              <SpotlightCard
                accent={g.accent}
                className="card flex h-full flex-col gap-4 p-6"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`h-2.5 w-2.5 rounded-full ${dot[g.accent] ?? "bg-iris"}`} />
                  <h3 className="font-display text-base font-semibold text-ink">{g.title}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {g.items.map((t) => (
                    <span
                      key={t}
                      className="rounded-lg border border-line bg-surface-2 px-2.5 py-1.5 font-mono text-xs text-muted transition-colors hover:border-line-strong hover:text-ink"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
