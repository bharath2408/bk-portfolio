import Link from "next/link";
import type { Metadata } from "next";
import { profile, skillGroups, experience, education, certifications, projects } from "@/lib/data";

export const metadata: Metadata = {
  title: `${profile.name} — Resume`,
  description: `Resume of ${profile.name}, ${profile.role}`,
  robots: { index: false },
};

export default function ResumePage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* Print toolbar — hidden when printing */}
      <div className="print:hidden sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white/90 px-6 py-3 backdrop-blur-sm">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          ← Back to portfolio
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">Ready to print · A4</span>
          <button
            onClick={() => window.print()}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 transition-colors"
          >
            Download PDF
          </button>
        </div>
      </div>

      {/* Resume body */}
      <main className="mx-auto max-w-[820px] px-8 py-10 print:px-0 print:py-0">

        {/* Header */}
        <header className="border-b-2 border-gray-900 pb-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
                {profile.name}
              </h1>
              <p className="mt-1 text-base font-semibold text-indigo-600">{profile.role}</p>
            </div>
            <div className="text-right text-xs text-gray-500 space-y-1">
              <div>
                <a href={`mailto:${profile.email}`} className="hover:text-indigo-600">{profile.email}</a>
              </div>
              <div>{profile.phone}</div>
              <div>
                <a href={profile.linkedin} className="hover:text-indigo-600">linkedin.com/in/bharathakumar</a>
              </div>
              <div>{profile.location}</div>
              <div>
                <a href={profile.siteUrl} className="hover:text-indigo-600">bk-portfolio-bharath2408.vercel.app</a>
              </div>
            </div>
          </div>

          {/* Summary */}
          <p className="mt-4 text-sm leading-relaxed text-gray-600">{profile.about}</p>
        </header>

        {/* Experience */}
        <Section title="Experience">
          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <span className="font-bold text-gray-900">{experience.role}</span>
                <span className="mx-2 text-gray-400">·</span>
                <span className="text-sm font-semibold text-indigo-600">{experience.company}</span>
                <span className="mx-1 text-gray-400">·</span>
                <span className="text-sm text-gray-500">{experience.place}</span>
              </div>
              <span className="text-xs font-mono text-gray-400">{experience.period}</span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{experience.summary}</p>
            <ul className="mt-2 space-y-1">
              {experience.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* Projects */}
        <Section title="Key Projects">
          <div className="grid gap-3 sm:grid-cols-2">
            {projects.map((p) => (
              <div key={p.title} className="rounded-lg border border-gray-200 p-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-sm text-gray-900">{p.title}</span>
                  <span className="shrink-0 rounded text-[10px] font-mono font-semibold px-1.5 py-0.5 bg-indigo-50 text-indigo-600">{p.kind}</span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-gray-500">{p.desc}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {p.tags.map((t) => (
                    <span key={t} className="rounded text-[10px] bg-gray-100 px-1.5 py-0.5 text-gray-500">{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Skills */}
        <Section title="Skills">
          <div className="grid gap-2 sm:grid-cols-2">
            {skillGroups.map((g) => (
              <div key={g.title} className="text-sm">
                <span className="font-semibold text-gray-700">{g.title}: </span>
                <span className="text-gray-500">{g.items.join(", ")}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Education & Certs side by side */}
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <Section title="Education" compact>
            <div>
              <p className="font-semibold text-sm text-gray-900">{education.degree}</p>
              <p className="text-sm text-gray-500">{education.school}</p>
              <p className="text-sm text-gray-500">{education.year} · CGPA {education.cgpa}</p>
            </div>
          </Section>

          <Section title="Certifications" compact>
            <ul className="space-y-1.5">
              {certifications.map((c) => (
                <li key={c.title} className="text-sm">
                  <span className="font-medium text-gray-900">{c.title}</span>
                  <span className="text-gray-400"> · {c.sub}</span>
                </li>
              ))}
            </ul>
          </Section>
        </div>

        {/* Footer */}
        <p className="mt-8 print:mt-6 text-center text-[11px] text-gray-300 print:text-gray-400">
          {profile.siteUrl} · {profile.email}
        </p>
      </main>
    </div>
  );
}

function Section({
  title,
  children,
  compact = false,
}: {
  title: string;
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <section className={compact ? "mt-0" : "mt-6"}>
      <h2 className="mb-3 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
        {title}
        <span className="flex-1 border-t border-gray-200" />
      </h2>
      {children}
    </section>
  );
}
