import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects, experience, profile } from "@/lib/data";

/* ── Static params — one page pre-built per project ── */
export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

/* ── Metadata per project ── */
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const p = projects.find((x) => x.slug === params.slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.desc,
  };
}

/* ── Accent helpers ── */
const accentText: Record<string, string> = {
  iris: "text-iris",
  cyan: "text-cyan",
  mint: "text-mint",
};
const accentBorder: Record<string, string> = {
  iris: "border-iris/40 bg-iris/10 text-iris",
  cyan: "border-cyan/40 bg-cyan/10 text-cyan",
  mint: "border-mint/40 bg-mint/10 text-mint",
};
const accentGrad: Record<string, string> = {
  iris: "from-iris/20",
  cyan: "from-cyan/20",
  mint: "from-mint/20",
};

/** Set the CSS view-transition-name to match the card on the home page */
function vt(name: string) {
  return { ["viewTransitionName" as string]: name } as React.CSSProperties;
}

/* ── Page ── */
export default function CaseStudyPage({
  params,
}: {
  params: { slug: string };
}) {
  const p = projects.find((x) => x.slug === params.slug);
  if (!p) notFound();

  const idx      = projects.indexOf(p);
  const prevProj = projects[idx - 1];
  const nextProj = projects[idx + 1];

  return (
    <main className="relative min-h-screen">

      {/* ── Back link ── */}
      <div className="mx-auto max-w-shell px-6 pt-28 md:px-10">
        <Link
          href="/#work"
          className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink"
        >
          ← All projects
        </Link>
      </div>

      {/*
        ── Hero ─────────────────────────────────────────────────────
        view-transition-name matches the card on the home page,
        so the browser morphs between the two elements on navigation.
      */}
      <section
        style={vt(`project-${p.slug}`)}
        className={`mx-auto mt-6 max-w-shell overflow-hidden rounded-2xl border border-line bg-gradient-to-br ${accentGrad[p.accent] ?? "from-iris/20"} to-transparent px-8 py-12 md:px-14 md:py-16`}
      >
        <span
          className={`inline-block rounded-full border px-3 py-1.5 text-xs font-semibold ${accentBorder[p.accent] ?? accentBorder.iris}`}
        >
          {p.kind}
        </span>

        <h1 className="mt-5 font-display text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl md:text-5xl">
          {p.title}
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
          {p.desc}
        </p>

        {/* Stack pills */}
        <div className="mt-7 flex flex-wrap gap-2">
          {p.tags.map((t) => (
            <span
              key={t}
              className="rounded-md border border-line bg-surface-2 px-2.5 py-1 font-mono text-[11px] text-muted"
            >
              {t}
            </span>
          ))}
        </div>

        {/* External links */}
        {(p.url || p.github) && (
          <div className="mt-7 flex gap-4 text-sm font-semibold">
            {p.url && (
              <a
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className={`${accentText[p.accent] ?? "text-iris"} hover:underline`}
              >
                Live site ↗
              </a>
            )}
            {p.github && (
              <a
                href={p.github}
                target="_blank"
                rel="noreferrer"
                className="text-muted hover:text-ink"
              >
                GitHub ↗
              </a>
            )}
          </div>
        )}
      </section>

      {/* ── Body ───────────────────────────────────────────────────── */}
      <div className="mx-auto mt-12 max-w-shell px-6 pb-24 md:px-10">
        <div className="grid gap-10 md:grid-cols-[1fr_280px]">

          {/* Left — overview */}
          <div className="flex flex-col gap-8">
            <section>
              <h2 className="font-display text-xl font-bold text-ink">Overview</h2>
              <p className="mt-3 text-base leading-relaxed text-muted">{p.desc}</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-ink">My role</h2>
              <p className="mt-3 text-base leading-relaxed text-muted">
                {experience.role} at <span className="text-ink">{experience.company}</span> ·{" "}
                {experience.period}
              </p>
              <ul className="mt-4 flex flex-col gap-2">
                {experience.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm text-muted">
                    <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-${p.accent}`} />
                    {b}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Right — meta */}
          <aside className="flex flex-col gap-6">
            <div className="rounded-2xl border border-line bg-surface-2 p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-faint">
                Tech stack
              </p>
              <div className="flex flex-wrap gap-2">
                {p.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-md border border-line bg-bg px-2 py-1 font-mono text-[10px] text-muted"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-surface-2 p-5">
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-faint">
                Built by
              </p>
              <p className="text-sm font-semibold text-ink">{profile.name}</p>
              <p className="mt-0.5 text-xs text-muted">{profile.role}</p>
            </div>
          </aside>
        </div>

        {/* ── Prev / Next navigation ── */}
        <nav className="mt-16 flex items-center justify-between gap-4 border-t border-line pt-8">
          {prevProj ? (
            <Link
              href={`/work/${prevProj.slug}`}
              className="group flex flex-col text-left"
            >
              <span className="text-xs text-faint">← Previous</span>
              <span className="mt-0.5 text-sm font-semibold text-muted transition-colors group-hover:text-ink">
                {prevProj.title}
              </span>
            </Link>
          ) : <div />}

          {nextProj ? (
            <Link
              href={`/work/${nextProj.slug}`}
              className="group flex flex-col text-right"
            >
              <span className="text-xs text-faint">Next →</span>
              <span className="mt-0.5 text-sm font-semibold text-muted transition-colors group-hover:text-ink">
                {nextProj.title}
              </span>
            </Link>
          ) : <div />}
        </nav>
      </div>
    </main>
  );
}
