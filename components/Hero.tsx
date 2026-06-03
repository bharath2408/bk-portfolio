"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform } from "framer-motion";
import { profile } from "@/lib/data";
import { Counter } from "./Counter";
import type { Stat } from "@/lib/types";

const HeroOrb = dynamic(() => import("./HeroOrb"), { ssr: false });

const chips = [
  { label: "Next.js", className: "left-[6%] top-[14%]", border: "border-iris/50" },
  { label: "React", className: "right-[2%] top-[26%]", border: "border-cyan/50" },
  { label: "TypeScript", className: "left-[0%] bottom-[20%]", border: "border-mint/50" },
  { label: "Three.js", className: "right-[8%] bottom-[12%]", border: "border-iris/50" },
];

const fade = {
  hidden: { opacity: 0, y: 22 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: 0.1 + i * 0.1, ease: [0.21, 0.47, 0.32, 0.98] },
  }),
};

export function Hero({
  role = profile.role,
  blurb = profile.blurb,
  stats = profile.stats,
  email = profile.email,
}: {
  role?: string;
  blurb?: string;
  stats?: Stat[];
  email?: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  // different depths -> parallax
  const textY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const orbY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const chipsY = useTransform(scrollYProgress, [0, 1], [0, 240]);
  const orbScale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);
  const fadeOut = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative mx-auto max-w-shell px-6 pb-20 pt-32 md:px-10 md:pt-40"
    >
      <div className="aurora left-[-6rem] top-[6rem] h-72 w-72 md:h-96 md:w-96" aria-hidden />
      <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        {/* Left — text drifts slowly */}
        <motion.div style={{ y: textY, opacity: fadeOut }} className="flex flex-col items-start">
          <motion.div
            custom={0}
            variants={fade}
            initial="hidden"
            animate="show"
            className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-2 px-3.5 py-2"
          >
            <span className="h-2 w-2 rounded-full bg-mint animate-pulse-dot" />
            <span className="text-xs font-medium text-muted">Available for opportunities</span>
          </motion.div>

          <motion.h1
            custom={1}
            variants={fade}
            initial="hidden"
            animate="show"
            className="mt-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-5xl md:text-6xl"
          >
            {role} building <span className="grad-text">AI-powered</span> web experiences
          </motion.h1>

          <motion.p
            custom={2}
            variants={fade}
            initial="hidden"
            animate="show"
            className="mt-6 max-w-xl text-base leading-relaxed text-muted md:text-lg"
          >
            {blurb}
          </motion.p>

          <motion.div
            custom={3}
            variants={fade}
            initial="hidden"
            animate="show"
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <a
              href="#work"
              className="glow-btn rounded-xl grad-bg px-6 py-3.5 text-sm font-semibold text-bg"
            >
              View my work
            </a>
            <a
              href="#contact"
              className="rounded-xl border border-line bg-surface-2 px-6 py-3.5 text-sm font-semibold text-ink transition-colors hover:border-line-strong"
            >
              Get in touch
            </a>
          </motion.div>

          <motion.div
            custom={4}
            variants={fade}
            initial="hidden"
            animate="show"
            className="mt-12 flex gap-10"
          >
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col">
                <span className="font-display text-3xl font-bold text-ink"><Counter value={s.value} /></span>
                <span className="mt-0.5 text-xs text-faint">{s.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right — orb and chips drift at deeper rates */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          className="relative mx-auto aspect-square w-full max-w-[460px]"
        >
          <motion.div style={{ y: orbY, scale: orbScale }} className="absolute inset-0">
            <HeroOrb />
          </motion.div>

          <motion.div style={{ y: chipsY }} className="absolute inset-0">
            {chips.map((c, i) => (
              <motion.div
                key={c.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 + i * 0.12 }}
                className={`absolute ${c.className} animate-float rounded-xl border ${c.border} bg-surface/90 px-3.5 py-2 text-sm font-semibold text-ink shadow-lg shadow-black/40 backdrop-blur-sm`}
                style={{ animationDelay: `${i * 0.8}s` }}
              >
                {c.label}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="mt-16 hidden justify-center md:flex"
      >
        <div className="scroll-cue" aria-hidden>
          <span />
        </div>
      </motion.div>
    </section>
  );
}
