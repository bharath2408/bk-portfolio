"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

/* ── Types ───────────────────────────────────────────────── */
interface Entry {
  _id:        string;
  name:       string;
  message:    string;
  location?:  string | null;
  emoji:      string;
  _createdAt: string;
}

/* ── Constants ───────────────────────────────────────────── */
const EMOJIS = [
  "👋","😊","🚀","💻","🎉","🌟","❤️","🤖",
  "🎨","⚡","🔥","💡","🌈","🎯","🏆","🌍",
  "🦄","🐻","🎸","🍕","🧑‍💻","✨","🙌","💜",
];
const MSG_MAX  = 280;
const NAME_MAX = 50;
const LOC_MAX  = 60;

/* ── Helpers ─────────────────────────────────────────────── */
function relativeDate(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)     return "just now";
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/* ── Entry card ──────────────────────────────────────────── */
function EntryCard({ entry, index }: { entry: Entry; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-3 rounded-2xl border border-white/8 bg-surface/60 p-5 backdrop-blur transition-colors hover:border-white/16"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-surface-2 text-lg">
            {entry.emoji}
          </span>
          <div>
            <p className="text-[13px] font-semibold text-ink">{entry.name}</p>
            {entry.location && (
              <p className="text-[11px] text-faint">{entry.location}</p>
            )}
          </div>
        </div>
        <span className="shrink-0 text-[10px] text-faint" suppressHydrationWarning>
          {relativeDate(entry._createdAt)}
        </span>
      </div>
      <p className="text-[13px] leading-relaxed text-muted">{entry.message}</p>
    </motion.div>
  );
}

/* ── Page ────────────────────────────────────────────────── */
export default function GuestbookPage() {
  const [entries,   setEntries]   = useState<Entry[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  /* form fields */
  const [name,     setName]     = useState("");
  const [message,  setMessage]  = useState("");
  const [location, setLocation] = useState("");
  const [emoji,    setEmoji]    = useState("👋");

  const formRef = useRef<HTMLFormElement>(null);

  /* Load entries */
  useEffect(() => {
    fetch("/api/guestbook")
      .then((r) => r.json())
      .then((data: Entry[]) => setEntries(data))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, []);

  /* Submit */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !message.trim() || submitting) return;

    setSubmitting(true);
    setError(null);

    /* Optimistic entry */
    const optimistic: Entry = {
      _id:        `opt-${Date.now()}`,
      name:       name.trim(),
      message:    message.trim(),
      location:   location.trim() || null,
      emoji,
      _createdAt: new Date().toISOString(),
    };
    setEntries((prev) => [optimistic, ...prev]);
    setName(""); setMessage(""); setLocation(""); setEmoji("👋");
    setSubmitted(true);

    try {
      const res = await fetch("/api/guestbook", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name: optimistic.name, message: optimistic.message, location: optimistic.location, emoji }),
      });
      if (!res.ok) {
        const { error: msg } = await res.json().catch(() => ({ error: "Failed" }));
        setError(msg ?? "Something went wrong");
        setEntries((prev) => prev.filter((e) => e._id !== optimistic._id));
        setSubmitted(false);
      } else {
        const created: Entry = await res.json();
        setEntries((prev) =>
          prev.map((e) => (e._id === optimistic._id ? created : e))
        );
      }
    } catch {
      setError("Network error. Please try again.");
      setEntries((prev) => prev.filter((e) => e._id !== optimistic._id));
      setSubmitted(false);
    } finally {
      setSubmitting(false);
    }
  }

  const charsLeft  = MSG_MAX - message.length;
  const nearLimit  = message.length > MSG_MAX * 0.8;

  return (
    <main className="relative min-h-screen">
      {/* Back link */}
      <div className="mx-auto max-w-shell px-6 pt-6 md:px-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink"
        >
          ← Back to portfolio
        </Link>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-10 md:px-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 text-center"
        >
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink">
            Guest<span className="grad-text">book</span>
          </h1>
          <p className="mt-2 text-sm text-muted">
            Leave a note — say hi, share thoughts, or just drop a friendly message.
          </p>
          {!loading && (
            <p className="mt-1 text-[11px] text-faint">
              {entries.length} {entries.length === 1 ? "entry" : "entries"}
            </p>
          )}
        </motion.div>

        {/* ── Form ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 rounded-2xl border border-white/10 bg-surface/60 p-6 backdrop-blur"
          style={{ boxShadow: "0 0 40px rgba(124,92,255,0.08), 0 8px 32px rgba(0,0,0,0.4)" }}
        >
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="thanks"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-3 py-6 text-center"
              >
                <span className="text-4xl">🎉</span>
                <p className="text-base font-semibold text-ink">Thanks for signing!</p>
                <p className="text-sm text-muted">Your message is now live below.</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-2 text-[12px] text-iris underline underline-offset-2 hover:text-cyan"
                >
                  Leave another message
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                ref={formRef}
                onSubmit={handleSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-4"
              >
                <p className="text-[12px] font-semibold uppercase tracking-widest text-faint">
                  Sign the guestbook
                </p>

                {/* Emoji picker */}
                <div>
                  <p className="mb-2 text-[11px] text-faint">Choose your avatar</p>
                  <div className="flex flex-wrap gap-1.5">
                    {EMOJIS.map((e) => (
                      <button
                        key={e}
                        type="button"
                        onClick={() => setEmoji(e)}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg border text-base transition-all ${
                          emoji === e
                            ? "border-iris/60 bg-iris/15 shadow-[0_0_10px_rgba(124,92,255,0.3)]"
                            : "border-white/8 bg-surface-2 hover:border-white/20"
                        }`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name + Location */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="mb-1 block text-[11px] text-faint">
                      Name <span className="text-iris">*</span>
                    </label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value.slice(0, NAME_MAX))}
                      placeholder="Your name"
                      required
                      className="w-full rounded-xl border border-white/8 bg-bg/60 px-3 py-2 text-[13px] text-ink placeholder:text-faint focus:border-iris/40 focus:outline-none"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="mb-1 block text-[11px] text-faint">
                      Location <span className="text-faint/50">(optional)</span>
                    </label>
                    <input
                      value={location}
                      onChange={(e) => setLocation(e.target.value.slice(0, LOC_MAX))}
                      placeholder="City, Country"
                      className="w-full rounded-xl border border-white/8 bg-bg/60 px-3 py-2 text-[13px] text-ink placeholder:text-faint focus:border-iris/40 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Message */}
                <div className="relative">
                  <label className="mb-1 block text-[11px] text-faint">
                    Message <span className="text-iris">*</span>
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value.slice(0, MSG_MAX))}
                    placeholder="Say something nice… or nerdy 🤓"
                    required
                    rows={3}
                    className="w-full resize-none rounded-xl border border-white/8 bg-bg/60 px-3 py-2 text-[13px] leading-relaxed text-ink placeholder:text-faint focus:border-iris/40 focus:outline-none"
                  />
                  {nearLimit && (
                    <span className={`absolute bottom-3 right-3 text-[10px] font-mono ${charsLeft < 20 ? "text-red-400" : "text-faint"}`}>
                      {charsLeft}
                    </span>
                  )}
                </div>

                {/* Error */}
                {error && (
                  <p className="text-[12px] text-red-400">{error}</p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={!name.trim() || !message.trim() || submitting}
                  className="glow-btn self-start rounded-xl grad-bg px-5 py-2.5 text-[13px] font-semibold text-bg disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? "Signing…" : "Sign Guestbook ✍️"}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Entries ── */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl border border-white/6 bg-surface/40" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="py-16 text-center">
            <span className="text-5xl">📭</span>
            <p className="mt-3 text-sm text-muted">No entries yet — be the first to sign!</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {entries.map((entry, i) => (
              <EntryCard key={entry._id} entry={entry} index={i} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
