import { projects as fbProjects } from "@/lib/data";
import type { Project } from "@/lib/types";
import { Reveal }              from "./Reveal";
import { Parallax }            from "./Parallax";
import { SpotlightCard }       from "./SpotlightCard";
import { SectionHeading }      from "./SectionHeading";
import { ViewTransitionLink }  from "./ViewTransitionLink";

const banner: Record<string, string> = {
  iris: "from-iris/30",
  cyan: "from-cyan/30",
  mint: "from-mint/30",
};
const pill: Record<string, string> = {
  iris: "border-iris/50 bg-iris/15 text-iris",
  cyan: "border-cyan/50 bg-cyan/15 text-cyan",
  mint: "border-mint/50 bg-mint/15 text-mint",
};

/** Typed helper for the (still-untyped) CSS view-transition-name property */
function vt(name: string) {
  return { ["viewTransitionName" as string]: name } as React.CSSProperties;
}

export function Projects({ projects = fbProjects }: { projects?: Project[] }) {
  return (
    <section id="work" className="mx-auto max-w-shell px-6 py-24 md:px-10">
      <SectionHeading eyebrow="Featured work" title="Platforms I've built" />

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {projects.map((p, i) => (
          <Parallax key={p.slug} speed={i % 2 === 0 ? 0.18 : 0.42} className="h-full">
            <Reveal delay={(i % 2) * 0.08} className="h-full">
              {/*
                view-transition-name on the link element — the browser captures
                this box and morphs it to the matching hero element on /work/[slug].
              */}
              <ViewTransitionLink
                href={`/work/${p.slug}`}
                className="block h-full"
                style={vt(`project-${p.slug}`)}
              >
                <SpotlightCard
                  accent={p.accent}
                  className="card group flex h-full flex-col overflow-hidden"
                >
                  <div
                    className={`relative flex items-start bg-gradient-to-br ${banner[p.accent] ?? "from-iris/30"} to-transparent px-7 pb-14 pt-7`}
                  >
                    <span
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${pill[p.accent] ?? pill.iris}`}
                    >
                      {p.kind}
                    </span>
                    <span className="proj-index absolute right-6 top-4 select-none">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col gap-3.5 px-7 pb-7 pt-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-display text-xl font-bold text-ink">{p.title}</h3>
                      <span className="mt-1 text-lg text-faint transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink">
                        ↗
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-muted">{p.desc}</p>
                    <div className="mt-auto flex flex-wrap gap-2 pt-2">
                      {p.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-md border border-line bg-surface-2 px-2.5 py-1 font-mono text-[11px] text-muted"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    {(p.url || p.github) && (
                      <div className="flex gap-4 pt-1 text-sm font-semibold">
                        {p.url && (
                          <a href={p.url} target="_blank" rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-cyan hover:underline">
                            Live ↗
                          </a>
                        )}
                        {p.github && (
                          <a href={p.github} target="_blank" rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-muted hover:text-ink">
                            GitHub ↗
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </SpotlightCard>
              </ViewTransitionLink>
            </Reveal>
          </Parallax>
        ))}
      </div>
    </section>
  );
}
