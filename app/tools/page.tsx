"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import ColorPalette       from "@/components/tools/ColorPalette";
import BoxShadow          from "@/components/tools/BoxShadow";
import UnitConverter      from "@/components/tools/UnitConverter";
import GradientGenerator  from "@/components/tools/GradientGenerator";
import ContrastChecker    from "@/components/tools/ContrastChecker";

/* ── Tool registry ───────────────────────────────────────── */
const TOOLS = [
  {
    id:      "color-palette",
    label:   "Color Palette Generator",
    emoji:   "🎨",
    desc:    "Pick a base color and generate complementary, analogous, triadic or monochromatic palettes. Copy as CSS variables or Tailwind config.",
    accent:  "#7C5CFF",
    tag:     "Design",
  },
  {
    id:      "box-shadow",
    label:   "Box Shadow Generator",
    emoji:   "🌑",
    desc:    "Build CSS box shadows visually with sliders. Stack up to 4 layers with color, blur, spread and inset control.",
    accent:  "#22D3EE",
    tag:     "CSS",
  },
  {
    id:      "unit-converter",
    label:   "px → rem Converter",
    emoji:   "📐",
    desc:    "Convert between px and rem instantly with a configurable root font size and a quick-reference table of common values.",
    accent:  "#34D399",
    tag:     "Utility",
  },
  {
    id:      "gradient-generator",
    label:   "Gradient Generator",
    emoji:   "🌈",
    desc:    "Build CSS gradients visually — drag color stops, set angle with a dial, pick linear/radial/conic, and export CSS instantly.",
    accent:  "#7C5CFF",
    tag:     "CSS",
  },
  {
    id:      "contrast-checker",
    label:   "Contrast Checker",
    emoji:   "♿",
    desc:    "Check WCAG AA/AAA contrast ratios with a live preview, color blindness simulation and auto-fix suggestions.",
    accent:  "#22D3EE",
    tag:     "Accessibility",
  },
] as const;

type ToolId = (typeof TOOLS)[number]["id"];

/* ── Tool card ───────────────────────────────────────────── */
function ToolCard({
  tool, index, onClick,
}: {
  tool:    (typeof TOOLS)[number];
  index:   number;
  onClick: () => void;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="group relative flex flex-col items-start rounded-2xl border border-white/8 bg-surface/60 p-6 text-left backdrop-blur transition-all hover:border-white/16 hover:shadow-2xl"
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.boxShadow =
          `0 0 40px ${tool.accent}22, 0 20px 40px rgba(0,0,0,0.5)`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
      }}
    >
      {/* Tag badge */}
      <span
        className="mb-4 self-end rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest"
        style={{
          background: `${tool.accent}18`,
          color:       tool.accent,
          border:     `1px solid ${tool.accent}35`,
        }}
      >
        {tool.tag}
      </span>

      {/* Emoji */}
      <motion.span
        animate={{ rotate: [0, -6, 6, 0] }}
        transition={{ duration: 3, repeat: Infinity, delay: index * 0.9 }}
        className="mb-3 text-5xl leading-none"
      >
        {tool.emoji}
      </motion.span>

      {/* Title */}
      <h2 className="font-display text-xl font-bold text-ink">{tool.label}</h2>

      {/* Description */}
      <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted">{tool.desc}</p>

      {/* CTA */}
      <div
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-colors"
        style={{ background: `${tool.accent}18`, color: tool.accent }}
      >
        <span>Open Tool</span>
        <span className="transition-transform group-hover:translate-x-1">→</span>
      </div>
    </motion.button>
  );
}

/* ── Page ────────────────────────────────────────────────── */
export default function ToolsPage() {
  const [selected, setSelected] = useState<ToolId | null>(null);

  const selectedTool = TOOLS.find((t) => t.id === selected);

  return (
    <main className="relative min-h-screen">
      {/* Top bar */}
      <div className="mx-auto max-w-shell px-6 pt-6 md:px-10">
        {selected ? (
          <button
            onClick={() => setSelected(null)}
            className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink"
          >
            <span>←</span>
            <span>Back to tools</span>
          </button>
        ) : (
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink"
          >
            <span>←</span>
            <span>Back to portfolio</span>
          </Link>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* ── Tool selection screen ── */}
        {!selected && (
          <motion.div
            key="selection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
            className="mx-auto max-w-shell px-6 py-10 md:px-10"
          >
            <div className="mb-8 text-center">
              <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink">
                Dev <span className="grad-text">Tools</span>
              </h1>
              <p className="mt-2 text-sm text-muted">
                Handy in-browser tools for everyday frontend work.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {TOOLS.map((t, i) => (
                <ToolCard
                  key={t.id}
                  tool={t}
                  index={i}
                  onClick={() => setSelected(t.id)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Active tool ── */}
        {selected && (
          <motion.div
            key={selected}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Tool title bar */}
            <div className="mx-auto max-w-shell px-6 pt-4 md:px-10">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedTool?.emoji}</span>
                <h1 className="font-display text-xl font-bold text-ink">
                  {selectedTool?.label}
                </h1>
                <span
                  className="ml-2 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest"
                  style={{
                    background: `${selectedTool?.accent}18`,
                    color:       selectedTool?.accent,
                    border:     `1px solid ${selectedTool?.accent}35`,
                  }}
                >
                  {selectedTool?.tag}
                </span>
              </div>
            </div>

            {selected === "color-palette"      && <ColorPalette />}
            {selected === "box-shadow"         && <BoxShadow />}
            {selected === "unit-converter"     && <UnitConverter />}
            {selected === "gradient-generator" && <GradientGenerator />}
            {selected === "contrast-checker"   && <ContrastChecker />}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
