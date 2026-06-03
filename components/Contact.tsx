import { profile } from "@/lib/data";
import { Reveal } from "./Reveal";

export function Contact({
  email = profile.email,
  linkedin = profile.linkedin,
  phone = profile.phone,
  location = profile.location,
}: {
  email?: string;
  linkedin?: string;
  phone?: string;
  location?: string;
}) {
  return (
    <section id="contact" className="mx-auto max-w-shell px-6 py-28 md:px-10">
      <Reveal className="flex flex-col items-center text-center">
        <div className="flex items-center gap-2.5">
          <span className="h-px w-7 grad-bg" />
          <span className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-cyan">
            Get in touch
          </span>
          <span className="h-px w-7 grad-bg" />
        </div>

        <h2 className="mt-4 max-w-2xl font-display text-4xl font-extrabold leading-tight tracking-tight text-ink md:text-5xl">
          Let&apos;s build something great together
        </h2>
        <p className="mt-4 max-w-md text-base text-muted">
          Open to frontend and fullstack opportunities. I usually reply within a day.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href={`mailto:${email}`}
            className="glow-btn rounded-xl grad-bg px-6 py-3.5 text-sm font-semibold text-bg"
          >
            {email}
          </a>
          <a
            href={linkedin}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-line bg-surface-2 px-6 py-3.5 text-sm font-semibold text-ink transition-colors hover:border-line-strong"
          >
            LinkedIn
          </a>
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-sm text-faint">
          <span>{phone}</span>
          <span className="hidden sm:inline">·</span>
          <span>{location}</span>
        </div>
      </Reveal>
    </section>
  );
}

export function Footer({ name = profile.name }: { name?: string }) {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-shell flex-col items-center justify-between gap-2 px-6 py-7 text-xs text-faint sm:flex-row md:px-10">
        <span>© {new Date().getFullYear()} {name}</span>
        <span className="font-mono">Built with Next.js · Tailwind · Sanity</span>
      </div>
    </footer>
  );
}
