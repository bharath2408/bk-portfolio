"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { profile } from "@/lib/data";
import { Reveal } from "./Reveal";
import { makeParticles, type Particle } from "@/lib/confetti";

function ConfettiBurst({ origin }: { origin: { x: number; y: number } }) {
  const [particles] = useState<Particle[]>(() => makeParticles(90));
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return createPortal(
    <div
      className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden"
      aria-hidden
    >
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute block rounded-sm"
          style={{
            left: origin.x,
            top:  origin.y,
            width:     p.size,
            height:    p.size * 0.5,
            background: p.color,
            boxShadow: `0 0 ${p.size}px ${p.color}88`,
          }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
          animate={{
            x:       p.x * 8,
            y:       p.y * 6 - 120,
            opacity: 0,
            rotate:  p.rotate,
            scale:   0,
          }}
          transition={{ duration: p.duration + 0.3, delay: p.delay, ease: "easeOut" }}
        />
      ))}
    </div>,
    document.body,
  );
}

const contactItems = [
  { icon: "✉", label: "Email", value: profile.email, href: `mailto:${profile.email}` },
  { icon: "in", label: "LinkedIn", value: "linkedin.com/in/bharathakumar", href: profile.linkedin },
  { icon: "📞", label: "Phone", value: profile.phone, href: `tel:${profile.phone}` },
  { icon: "📍", label: "Location", value: profile.location, href: null },
];

export function Contact({
  email    = profile.email,
  linkedin = profile.linkedin,
  phone    = profile.phone,
  location = profile.location,
}: {
  email?:    string;
  linkedin?: string;
  phone?:    string;
  location?: string;
}) {
  const [form, setForm]       = useState({ name: "", email: "", message: "" });
  const [status, setStatus]   = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError]     = useState("");
  const [burst, setBurst]     = useState(false);
  const [origin, setOrigin]   = useState({ x: 0, y: 0 });
  const btnRef                = useRef<HTMLButtonElement>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to send.");
      }
      setStatus("sent");
      setForm({ name: "", email: "", message: "" });
      if (btnRef.current) {
        const r = btnRef.current.getBoundingClientRect();
        setOrigin({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
      }
      setBurst(true);
      setTimeout(() => setBurst(false), 1800);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  return (
    <section id="contact" className="mx-auto max-w-shell px-6 py-28 md:px-10">
      {/* Heading */}
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
      </Reveal>

      {/* Two-column layout */}
      <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-start">

        {/* Left — contact cards */}
        <Reveal delay={0.1} className="flex flex-col gap-4">
          {contactItems.map(({ icon, label, value, href }) => (
            <div
              key={label}
              className="card flex items-center gap-4 rounded-2xl border border-line bg-surface-2 px-5 py-4"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line bg-bg font-mono text-sm text-muted">
                {icon}
              </span>
              <div className="min-w-0">
                <p className="font-mono text-[11px] uppercase tracking-widest text-faint">{label}</p>
                {href ? (
                  <a
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                    className="truncate text-sm font-medium text-ink hover:text-iris transition-colors"
                  >
                    {value}
                  </a>
                ) : (
                  <p className="truncate text-sm font-medium text-ink">{value}</p>
                )}
              </div>
            </div>
          ))}
        </Reveal>

        {/* Right — contact form */}
        <Reveal delay={0.2}>
          <form
            onSubmit={handleSubmit}
            className="card rounded-2xl border border-line bg-surface-2 p-6 flex flex-col gap-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[11px] uppercase tracking-widest text-faint">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Bharatha Kumar"
                  value={form.name}
                  onChange={set("name")}
                  required
                  maxLength={80}
                  className="rounded-xl border border-line bg-bg px-4 py-2.5 text-sm text-ink placeholder:text-faint focus:border-iris/60 focus:outline-none focus:ring-1 focus:ring-iris/30 transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[11px] uppercase tracking-widest text-faint">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={set("email")}
                  required
                  className="rounded-xl border border-line bg-bg px-4 py-2.5 text-sm text-ink placeholder:text-faint focus:border-iris/60 focus:outline-none focus:ring-1 focus:ring-iris/30 transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="font-mono text-[11px] uppercase tracking-widest text-faint">
                  Message
                </label>
                <span className="font-mono text-[11px] text-faint">{form.message.length}/2000</span>
              </div>
              <textarea
                placeholder="Tell me about your project or opportunity…"
                value={form.message}
                onChange={set("message")}
                required
                rows={5}
                maxLength={2000}
                className="resize-none rounded-xl border border-line bg-bg px-4 py-2.5 text-sm text-ink placeholder:text-faint focus:border-iris/60 focus:outline-none focus:ring-1 focus:ring-iris/30 transition-colors"
              />
            </div>

            {/* Feedback */}
            <AnimatePresence mode="wait">
              {status === "error" && (
                <motion.p
                  key="err"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400"
                >
                  {error}
                </motion.p>
              )}
              {status === "sent" && (
                <motion.p
                  key="ok"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-xl border border-mint/30 bg-mint/10 px-4 py-2.5 text-sm text-mint"
                >
                  Message sent! I&apos;ll get back to you soon.
                </motion.p>
              )}
            </AnimatePresence>

            {burst && <ConfettiBurst origin={origin} />}

            <button
              ref={btnRef}
              type="submit"
              disabled={status === "sending" || status === "sent"}
              className="glow-btn rounded-xl grad-bg px-6 py-3 text-sm font-semibold text-bg disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
            >
              {status === "sending" ? "Sending…" : status === "sent" ? "Sent ✓" : "Send message"}
            </button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}

export function Footer({ name = profile.name }: { name?: string }) {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-shell flex-col items-center justify-between gap-2 px-6 py-7 text-xs text-faint sm:flex-row md:px-10">
        <span>© {new Date().getFullYear()} {name}</span>
        <span className="font-mono">Built with Next.js · Tailwind · Sanity</span>
        <Link href="/games"    className="font-mono transition-colors hover:text-iris"  title="Play the mini game">🎮 Mini Game</Link>
        <Link href="/tools"    className="font-mono transition-colors hover:text-cyan"  title="Dev tools">🛠 Dev Tools</Link>
        <Link href="/guestbook" className="font-mono transition-colors hover:text-mint" title="Guestbook">✍️ Guestbook</Link>
      </div>
    </footer>
  );
}
