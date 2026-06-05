"use client";

import { useEffect, useState } from "react";
import { navLinks, profile } from "@/lib/data";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar({
  name  = profile.name,
  email = profile.email,
}: {
  name?:  string;
  email?: string;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open,     setOpen]     = useState(false);
  const [active,   setActive]   = useState<string>("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scrollspy: highlight section currently in view
  useEffect(() => {
    const ids      = navLinks.map((l) => l.href.replace("#", ""));
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(`#${e.target.id}`);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <div
        className={`transition-all duration-300 ${
          scrolled
            ? "border-b border-line bg-bg/70 backdrop-blur-xl"
            : "border-b border-transparent"
        }`}
      >
        <nav className="mx-auto flex max-w-shell items-center justify-between px-6 py-4 md:px-10">
          {/* Logo */}
          <a href="#top" className="flex items-center gap-2.5">
            <span className="h-3 w-3 rounded-full grad-bg" />
            <span className="font-display text-base font-bold text-ink">{name}</span>
          </a>

          {/* Desktop nav */}
          <div className="hidden items-center gap-7 md:flex">
            {navLinks.map((l) => {
              const on = active === l.href;
              return (
                <a
                  key={l.href}
                  href={l.href}
                  className={`relative text-sm font-medium transition-colors ${
                    on ? "text-ink" : "text-muted hover:text-ink"
                  }`}
                >
                  {l.label}
                  <span
                    className={`absolute -bottom-1.5 left-0 h-px grad-bg transition-all duration-300 ${
                      on ? "w-full opacity-100" : "w-0 opacity-0"
                    }`}
                  />
                </a>
              );
            })}

            <ThemeToggle />

            <button
              onClick={() =>
                window.dispatchEvent(new Event("bk:palette"))
              }
              aria-label="Open command palette"
              className="hidden items-center gap-1 rounded-lg border border-line bg-surface-2 px-2.5 py-1.5 font-mono text-[11px] text-faint transition-colors hover:border-line-strong hover:text-muted lg:flex"
            >
              ⌘K
            </button>

            <a
              href={`mailto:${email}`}
              className="glow-btn rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-bg"
            >
              Resume
            </a>
          </div>

          {/* Mobile: theme toggle + hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink"
              aria-label="Toggle menu"
            >
              <span className="text-lg leading-none">{open ? "×" : "≡"}</span>
            </button>
          </div>
        </nav>

        {/* Mobile drawer */}
        {open && (
          <div className="border-t border-line bg-bg/90 px-6 py-4 backdrop-blur-xl md:hidden">
            <div className="flex flex-col gap-1">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-2 py-2.5 text-sm font-medium text-muted hover:bg-surface hover:text-ink"
                >
                  {l.label}
                </a>
              ))}
              <a
                href={`mailto:${email}`}
                onClick={() => setOpen(false)}
                className="mt-2 rounded-xl grad-bg px-4 py-2.5 text-center text-sm font-semibold text-bg"
              >
                Resume
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
