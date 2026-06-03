import { certifications as fbCerts, education as fbEdu, experience as fbExp } from "@/lib/data";
import type { Certification, Education, ExperienceItem } from "@/lib/types";
import { Reveal } from "./Reveal";
import { SpotlightCard } from "./SpotlightCard";
import { SectionHeading } from "./SectionHeading";

export function Experience({
  experience = fbExp,
  education = fbEdu,
  certifications = fbCerts,
}: {
  experience?: ExperienceItem;
  education?: Education;
  certifications?: Certification[];
}) {
  return (
    <section id="experience" className="border-y border-line bg-bg-soft/40">
      <div className="mx-auto max-w-shell px-6 py-24 md:px-10">
        <SectionHeading eyebrow="Career" title="Experience & education" />

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
          <Reveal className="h-full">
            <SpotlightCard className="card flex h-full flex-col gap-5 p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-display text-xl font-bold text-ink">{experience.role}</h3>
                  <p className="mt-0.5 text-sm font-medium text-cyan">
                    {experience.company} · {experience.place}
                  </p>
                </div>
                <span className="rounded-full border border-line bg-surface-2 px-3 py-1.5 text-xs font-medium text-muted">
                  {experience.period}
                </span>
              </div>

              <p className="text-sm leading-relaxed text-muted">{experience.summary}</p>

              <ul className="flex flex-col gap-2.5">
                {experience.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-mint" />
                    <span className="text-sm text-muted">{b}</span>
                  </li>
                ))}
              </ul>
            </SpotlightCard>
          </Reveal>

          <Reveal delay={0.1} className="flex flex-col gap-6">
            <SpotlightCard className="card p-6">
              <p className="font-mono text-xs uppercase tracking-widest text-faint">Education</p>
              <h4 className="mt-2 font-display text-lg font-bold text-ink">{education.degree}</h4>
              <p className="text-sm text-muted">
                {education.school} · {education.year}
              </p>
              <p className="mt-2 text-sm text-faint">
                CGPA <span className="font-display font-bold text-mint">{education.cgpa}</span>
              </p>
            </SpotlightCard>

            <SpotlightCard className="card p-6">
              <p className="font-mono text-xs uppercase tracking-widest text-faint">Certifications</p>
              <div className="mt-3 flex flex-col gap-3.5">
                {certifications.map((c) => (
                  <div key={c.title}>
                    <p className="text-sm font-semibold text-ink">{c.title}</p>
                    <p className="text-xs text-faint">{c.sub}</p>
                  </div>
                ))}
              </div>
            </SpotlightCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
