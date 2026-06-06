"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { SectionHeading } from "./SectionHeading";

type Milestone = {
  year: string;
  title: string;
  sub: string;
  body: string;
  icon: string;
  accent: "iris" | "cyan" | "mint";
  tag?: string;
};

const milestones: Milestone[] = [
  {
    year: "2020",
    icon: "🎓",
    title: "M.Sc. Computer Science",
    sub: "Thiruvalluvar University",
    body: "Pursued post-graduate studies in Computer Science, building a strong foundation in algorithms, software engineering, and data structures. Graduated with a CGPA of 8.8.",
    accent: "mint",
    tag: "Education",
  },
  {
    year: "Aug 2023",
    icon: "🚀",
    title: "Joined D2R AI Labs",
    sub: "Frontend Developer · Chennai",
    body: "Started as a Frontend Developer, independently owning the full frontend stack — from UI architecture and component libraries to CI/CD pipelines and AWS deployments.",
    accent: "iris",
    tag: "Career",
  },
  {
    year: "Late 2023",
    icon: "🏗️",
    title: "Customer Hub — Turtle CRM",
    sub: "Enterprise CRM Platform",
    body: "Delivered a full-scale CRM with real-time Quickbase data visualisation via FusionCharts, dual SSO + Azure AD B2C auth, and granular role-based access control.",
    accent: "cyan",
    tag: "Project",
  },
  {
    year: "2024",
    icon: "🛒",
    title: "Commerce Hub — Turtle",
    sub: "Order & Supplier Management",
    body: "Built an internal Amazon order platform with SP-API integration for automated order ingestion, supplier onboarding, product tracking, and payment reconciliation modules.",
    accent: "mint",
    tag: "Project",
  },
  {
    year: "2024",
    icon: "🤖",
    title: "POA — AI Purchase Order Automation",
    sub: "Revalgo · OpenAI Integration",
    body: "Engineered an AI-powered PO automation system using OpenAI API to extract product and pricing data from vendor emails — with a self-service vendor order form triggered by email workflows.",
    accent: "iris",
    tag: "Project",
  },
  {
    year: "2025",
    icon: "👁️",
    title: "Dream Hire — AI Hiring Suite",
    sub: "In-browser TensorFlow.js Proctoring",
    body: "Built real-time eye tracking, person detection and voice monitoring entirely in-browser using TensorFlow.js and MediaStream API — no server-side inference needed.",
    accent: "cyan",
    tag: "Project",
  },
  {
    year: "Now",
    icon: "⚡",
    title: "AI-assisted Development",
    sub: "Claude Code · GitHub Copilot",
    body: "Levelling up with AI-assisted development workflows — shipping faster without cutting corners on quality. This very portfolio was built with Claude Code.",
    accent: "mint",
    tag: "Present",
  },
];

const accentMap = {
  iris: { dot: "bg-iris", border: "border-iris/40", text: "text-iris", tag: "bg-iris/10 text-iris" },
  cyan: { dot: "bg-cyan", border: "border-cyan/40", text: "text-cyan", tag: "bg-cyan/10 text-cyan" },
  mint: { dot: "bg-mint", border: "border-mint/40", text: "text-mint", tag: "bg-mint/10 text-mint" },
};

function CardContent({ m, a }: { m: Milestone; a: (typeof accentMap)[keyof typeof accentMap] }) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${a.tag}`}>
          {m.tag}
        </span>
        <span className="font-mono text-xs text-faint">{m.year}</span>
      </div>
      <h3 className="mt-3 font-display text-base font-bold text-ink">{m.title}</h3>
      <p className={`mt-0.5 text-xs font-medium ${a.text}`}>{m.sub}</p>
      <p className="mt-2.5 text-sm leading-relaxed text-muted">{m.body}</p>
    </>
  );
}

function MilestoneCard({ m, index }: { m: Milestone; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const isLeft = index % 2 === 0;
  const a = accentMap[m.accent];

  return (
    <div ref={ref}>
      {/* ── Mobile layout ── */}
      <div className="flex gap-3 lg:hidden">
        {/* Left: icon + connector line */}
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={inView ? { scale: 1, opacity: 1 } : {}}
            transition={{ duration: 0.35, delay: 0.1 }}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${a.border} bg-bg text-base shadow`}
          >
            {m.icon}
          </motion.div>
          {index < milestones.length - 1 && (
            <div className={`mt-2 w-px flex-1 ${a.dot} opacity-25`} />
          )}
        </div>

        {/* Right: card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.45, ease: [0.21, 0.47, 0.32, 0.98] }}
          className={`mb-6 flex-1 rounded-2xl border ${a.border} bg-surface-2 p-4 shadow`}
        >
          <CardContent m={m} a={a} />
        </motion.div>
      </div>

      {/* ── Desktop layout (alternating) ── */}
      <div className="hidden lg:grid lg:grid-cols-[1fr_64px_1fr] lg:items-start">
        {/* Left column */}
        <div className="pr-8">
          {isLeft && (
            <motion.div
              initial={{ opacity: 0, x: -36 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] }}
              className={`card rounded-2xl border ${a.border} bg-surface-2 p-5 shadow-lg`}
            >
              <CardContent m={m} a={a} />
            </motion.div>
          )}
        </div>

        {/* Centre dot */}
        <div className="flex justify-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={inView ? { scale: 1, opacity: 1 } : {}}
            transition={{ duration: 0.35, delay: 0.15 }}
            className={`z-10 flex h-11 w-11 items-center justify-center rounded-full border-2 ${a.border} bg-bg text-xl shadow-lg`}
          >
            {m.icon}
          </motion.div>
        </div>

        {/* Right column */}
        <div className="pl-8">
          {!isLeft && (
            <motion.div
              initial={{ opacity: 0, x: 36 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] }}
              className={`card rounded-2xl border ${a.border} bg-surface-2 p-5 shadow-lg`}
            >
              <CardContent m={m} a={a} />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export function Timeline() {
  return (
    <section id="timeline" className="mx-auto max-w-shell px-6 py-24 md:px-10">
      <SectionHeading eyebrow="Journey" title="Career timeline" />

      <div className="relative mt-14">
        {/* Centre vertical line — desktop only */}
        <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-iris/40 via-cyan/40 to-mint/40 lg:block" />

        <div className="flex flex-col lg:gap-10">
          {milestones.map((m, i) => (
            <MilestoneCard key={m.title} m={m} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
