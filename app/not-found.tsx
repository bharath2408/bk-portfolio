"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

// Load the Three.js orb client-side only — same pattern as Hero.tsx
const HeroOrb = dynamic(() => import("@/components/HeroOrb"), { ssr: false });

export default function NotFound() {
  const reduced = useReducedMotion();

  // When prefers-reduced-motion: start at final state, zero duration
  function fade(delay = 0, y = 18) {
    return {
      initial:    { opacity: reduced ? 1 : 0, y: reduced ? 0 : y },
      animate:    { opacity: 1, y: 0 },
      transition: { duration: reduced ? 0 : 0.6, delay: reduced ? 0 : delay, ease: [0.21, 0.47, 0.32, 0.98] },
    };
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">

      {/* Subtle centre glow — matches site atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(700px circle at 50% 44%, rgba(124,92,255,0.09), transparent 62%)," +
            "radial-gradient(500px circle at 50% 56%, rgba(34,211,238,0.06), transparent 60%)",
        }}
      />

      {/* Film grain (matches .grain in globals.css but scoped here) */}
      <div className="grain" aria-hidden />

      {/* Orb — drifting in space, smaller than the hero */}
      <motion.div
        {...fade(0, 0)}
        style={{ opacity: reduced ? 1 : 0 }} // overridden by animate
        initial={{ opacity: reduced ? 1 : 0, scale: reduced ? 1 : 0.78 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: reduced ? 0 : 1.1, ease: "easeOut" }}
        className="relative mx-auto h-[200px] w-[200px] sm:h-[260px] sm:w-[260px]"
      >
        <HeroOrb />
      </motion.div>

      {/* 404 */}
      <motion.p
        {...fade(0.18, 24)}
        className="grad-text mt-2 font-display text-[88px] font-extrabold leading-none tracking-tighter sm:text-[120px]"
      >
        404
      </motion.p>

      {/* Headline */}
      <motion.h1
        {...fade(0.32, 16)}
        className="mt-3 font-display text-2xl font-bold text-ink sm:text-3xl"
      >
        Lost in the void
      </motion.h1>

      {/* Sub-copy */}
      <motion.p
        {...fade(0.46)}
        className="mt-3 max-w-[340px] text-sm leading-relaxed text-muted"
      >
        This page drifted off somewhere between commits.
        The void is peaceful — but there&apos;s nothing here.
      </motion.p>

      {/* CTAs */}
      <motion.div
        {...fade(0.6, 12)}
        className="mt-8 flex flex-wrap items-center justify-center gap-3"
      >
        <Link
          href="/"
          className="glow-btn rounded-xl grad-bg px-6 py-3.5 text-sm font-semibold text-bg"
        >
          ← Back to Earth
        </Link>
        <Link
          href="/games"
          className="rounded-xl border border-line bg-surface-2 px-6 py-3.5 text-sm font-semibold text-ink transition-colors hover:border-line-strong"
        >
          Play a game instead 🎮
        </Link>
      </motion.div>

      {/* Easter-egg nudge */}
      <motion.p
        {...fade(0.9)}
        className="mt-10 font-mono text-[11px] text-faint"
      >
        error_code: PAGE_NOT_FOUND &nbsp;·&nbsp; status: 404 &nbsp;·&nbsp; universe: still intact
      </motion.p>
    </main>
  );
}
