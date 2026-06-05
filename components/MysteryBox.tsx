"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { profile } from "@/lib/data";
import { makeParticles, type Particle } from "@/lib/confetti";

/* ── Safe viewport positions ─────────────────────────────────────────────────
   All coords avoid: top 0-12 % (navbar), dead-centre (hero text / CTAs),
   and common button zones. Chosen from page corners, edges, and section gaps.
   Position is fixed so it stays reachable regardless of scroll depth.
──────────────────────────────────────────────────────────────────────────── */
const SAFE_ZONES = [
  { top: "87%", left: "2%"  },   // bottom-left corner
  { top: "87%", left: "93%" },   // bottom-right corner
  { top: "33%", left: "1%"  },   // left edge, upper-mid
  { top: "52%", left: "1%"  },   // left edge, mid
  { top: "68%", left: "1%"  },   // left edge, lower-mid
  { top: "28%", left: "95%" },   // right edge, upper-mid
  { top: "48%", left: "95%" },   // right edge, mid
  { top: "64%", left: "95%" },   // right edge, lower-mid
  { top: "78%", left: "18%" },   // near footer, left
  { top: "78%", left: "80%" },   // near footer, right
  { top: "72%", left: "6%"  },   // lower-left gap
  { top: "72%", left: "92%" },   // lower-right gap
] as const;

type SafeZone = { top: string; left: string };

export default function MysteryBox() {
  // null = not yet mounted / position not computed → render nothing (SSR-safe)
  const [pos,       setPos]       = useState<SafeZone | null>(null);
  const [open,      setOpen]      = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const prefersReduced = useReducedMotion();

  // ── Randomise position CLIENT-SIDE only (after mount) ──────────────────────
  // Using useEffect prevents any hydration mismatch: the server renders nothing,
  // the client picks a random zone after first paint.
  useEffect(() => {
    const idx = Math.floor(Math.random() * SAFE_ZONES.length);
    setPos(SAFE_ZONES[idx]);
    setParticles(makeParticles(72));
  }, []);

  // ── Close on Esc ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [open]);

  const close = useCallback(() => setOpen(false), []);

  // Hidden until client assigns a position
  if (!pos) return null;

  return (
    <>
      {/* ── The mystery spot ─────────────────────────────────────────────── */}
      <motion.button
        aria-label="You found something hidden…"
        title="You found something…"
        initial={{ opacity: 0, scale: 0.4 }}
        animate={{ opacity: 1, scale: 1   }}
        transition={{ delay: 2.8, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ scale: 2.2 }}
        whileTap={{ scale: 1.6 }}
        onClick={() => setOpen(true)}
        style={{
          position:     "fixed",
          top:          pos.top,
          left:         pos.left,
          zIndex:       30,
          width:        10,
          height:       10,
          borderRadius: "50%",
          padding:      0,
          border:       "none",
          cursor:       "pointer",
          background:   "rgba(124,92,255,0.55)",
          boxShadow:    "0 0 8px rgba(124,92,255,0.4)",
          // Transform-origin keeps pulse centred on the dot
          transformOrigin: "center",
        }}
      >
        {/* Ripple rings — omitted when prefers-reduced-motion */}
        {!prefersReduced && (
          <>
            <motion.span
              aria-hidden
              animate={{ scale: [1, 2.6], opacity: [0.45, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
              style={{
                position: "absolute", inset: 0,
                borderRadius: "50%",
                background: "rgba(124,92,255,0.5)",
                pointerEvents: "none",
              }}
            />
            <motion.span
              aria-hidden
              animate={{ scale: [1, 3.8], opacity: [0.25, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut", delay: 0.55 }}
              style={{
                position: "absolute", inset: 0,
                borderRadius: "50%",
                background: "rgba(34,211,238,0.35)",
                pointerEvents: "none",
              }}
            />
          </>
        )}
      </motion.button>

      {/* ── Reward modal ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="mystery-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{    opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[9997] flex items-center justify-center px-4 cursor-pointer"
            style={{ background: "rgba(7,7,11,0.88)", backdropFilter: "blur(7px)" }}
            onClick={close}
          >
            {/* Confetti burst (skipped when reduced-motion) */}
            {!prefersReduced && particles.map((p) => (
              <motion.span
                key={p.id}
                aria-hidden
                className="absolute block rounded-full pointer-events-none"
                initial={{ x: 0,       y: 0,       opacity: 1, rotate: 0,        scale: 1 }}
                animate={{ x: `${p.x}vw`, y: `${p.y}vh`, opacity: 0, rotate: p.rotate, scale: 0 }}
                transition={{ duration: p.duration, delay: p.delay, ease: "easeOut" }}
                style={{
                  width:     p.size,
                  height:    p.size,
                  background: p.color,
                  boxShadow: `0 0 ${p.size * 1.2}px ${p.color}`,
                }}
              />
            ))}

            {/* Card */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0, y: 28 }}
              animate={{ scale: 1,   opacity: 1, y: 0  }}
              exit={{    scale: 0.85, opacity: 0        }}
              transition={{ duration: 0.44, ease: [0.22, 1, 0.36, 1], delay: 0.06 }}
              className="relative z-10 mx-auto w-full max-w-sm rounded-3xl border border-white/10 bg-surface/90 p-8 text-center shadow-2xl backdrop-blur-xl cursor-default"
              style={{ boxShadow: "0 0 100px rgba(124,92,255,0.22), 0 0 40px rgba(34,211,238,0.1), 0 28px 64px rgba(0,0,0,0.88)" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={close}
                aria-label="Close"
                className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs text-faint transition-colors hover:border-white/20 hover:text-ink"
              >
                ✕
              </button>

              {/* Animated icon */}
              <motion.div
                animate={prefersReduced ? {} : {
                  rotate: [0, -14, 14, -9, 9, 0],
                  y:      [0, -5, 0],
                }}
                transition={{ duration: 0.85, delay: 0.18 }}
                className="mb-4 text-5xl"
              >
                🎁
              </motion.div>

              {/* Headline */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <p className="font-display text-2xl font-extrabold text-ink">
                  You found it!
                </p>
                <p className="mt-1 text-sm text-muted">
                  {profile.name.split(" ")[0]} hid this just for curious people like you 👀
                </p>
              </motion.div>

              {/* Personal message */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="mt-4 text-sm leading-relaxed text-muted"
              >
                Most visitors never look this carefully — but you did.
                That kind of curiosity is exactly what makes a great engineer.
                While you&apos;re here, let&apos;s connect!
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
                className="mt-6 flex flex-col gap-3"
              >
                {/* Resume download */}
                <a
                  href="/resume.pdf"
                  download
                  onClick={close}
                  className="glow-btn flex items-center justify-center gap-2 rounded-xl grad-bg py-3 text-sm font-bold text-bg"
                >
                  <span>⬇</span>
                  <span>Download Résumé</span>
                </a>

                {/* Let's talk */}
                <a
                  href={`mailto:${profile.email}`}
                  onClick={close}
                  className="flex items-center justify-center gap-2 rounded-xl border border-iris/30 bg-iris/10 py-3 text-sm font-semibold text-iris transition-colors hover:bg-iris/20"
                >
                  <span>✉</span>
                  <span>Let&apos;s talk →</span>
                </a>
              </motion.div>

              {/* Dismiss hint */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-5 text-[10px] text-faint"
              >
                press Esc · click outside · or close ✕
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
