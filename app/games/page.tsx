"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import MemoryMatch from "@/components/MemoryMatch";
import SnakeGame   from "@/components/SnakeGame";
import BugWhacker  from "@/components/BugWhacker";
import TetrisGame  from "@/components/TetrisGame";

/* ── Game registry ───────────────────────────────────────── */
const GAMES = [
  {
    id:          "memory",
    label:       "Memory Match",
    emoji:       "🃏",
    desc:        "Flip cards to find matching tech pairs. Fewest moves wins!",
    accent:      "#7C5CFF",
    bestKey:     "memMatch_best",
    bestLabel:   "Best moves",
    controls:    "Click to flip",
    difficulty:  "Easy",
  },
  {
    id:          "snake",
    label:       "Code Runner",
    emoji:       "🐍",
    desc:        "Eat the tech stack. Grow longer. Don't crash!",
    accent:      "#22D3EE",
    bestKey:     "snake_best",
    bestLabel:   "Best score",
    controls:    "Arrow keys / Swipe",
    difficulty:  "Medium",
  },
  {
    id:          "bugs",
    label:       "Bug Whacker",
    emoji:       "🐛",
    desc:        "Squash bugs before they escape. Combos = bonus points!",
    accent:      "#34D399",
    bestKey:     "bugWhacker_best",
    bestLabel:   "Best score",
    controls:    "Click / Tap",
    difficulty:  "Hard",
  },
  {
    id:          "tetris",
    label:       "Block Drop",
    emoji:       "🟦",
    desc:        "Classic Tetris — ghost piece, hold, 7-bag randomiser, progressive speed.",
    accent:      "#22D3EE",
    bestKey:     "tetris_best",
    bestLabel:   "Best score",
    controls:    "Arrow keys / D-pad",
    difficulty:  "Expert",
  },
] as const;

type GameId = (typeof GAMES)[number]["id"];

/* ── Game card ───────────────────────────────────────────── */
function GameCard({
  game,
  best,
  onClick,
  index,
}: {
  game:    (typeof GAMES)[number];
  best:    number | null;
  onClick: () => void;
  index:   number;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="group relative flex flex-col items-start rounded-2xl border border-white/8 bg-surface/60 p-6 text-left backdrop-blur transition-all hover:border-white/16 hover:shadow-2xl"
      style={{
        boxShadow: `0 0 0 0 ${game.accent}`,
        transition: "box-shadow 0.3s, border-color 0.3s, transform 0.2s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.boxShadow =
          `0 0 40px ${game.accent}22, 0 20px 40px rgba(0,0,0,0.5)`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
      }}
    >
      {/* Difficulty badge */}
      <span
        className="mb-4 self-end rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest"
        style={{ background: `${game.accent}18`, color: game.accent, border: `1px solid ${game.accent}35` }}
      >
        {game.difficulty}
      </span>

      {/* Emoji */}
      <motion.span
        animate={{ rotate: [0, -8, 8, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, delay: index * 0.7 }}
        className="mb-3 text-5xl leading-none"
      >
        {game.emoji}
      </motion.span>

      {/* Title */}
      <h2 className="font-display text-xl font-bold text-ink">{game.label}</h2>

      {/* Description */}
      <p className="mt-1.5 text-sm leading-relaxed text-muted">{game.desc}</p>

      {/* Controls */}
      <p className="mt-3 text-xs text-faint">🕹 {game.controls}</p>

      {/* Best score */}
      {best !== null && (
        <div
          className="mt-4 rounded-xl px-3 py-1.5 text-xs font-semibold"
          style={{ background: `${game.accent}12`, color: game.accent }}
        >
          {game.bestLabel}: {best}
        </div>
      )}

      {/* Play button */}
      <div
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-colors"
        style={{ background: `${game.accent}18`, color: game.accent }}
      >
        <span>Play Now</span>
        <span className="transition-transform group-hover:translate-x-1">→</span>
      </div>
    </motion.button>
  );
}

/* ── Page ────────────────────────────────────────────────── */
export default function GamesPage() {
  const [selected, setSelected] = useState<GameId | null>(null);
  const [bests, setBests]       = useState<Record<string, number | null>>({});

  // Read best scores from localStorage
  useEffect(() => {
    const scores: Record<string, number | null> = {};
    GAMES.forEach((g) => {
      const v = localStorage.getItem(g.bestKey);
      scores[g.id] = v !== null ? Number(v) : null;
    });
    setBests(scores);
  }, [selected]); // refresh when returning from a game

  const selectedGame = GAMES.find((g) => g.id === selected);

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
            <span>Back to games</span>
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
        {/* ── Game selection screen ── */}
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
                Mini <span className="grad-text">Games</span>
              </h1>
              <p className="mt-2 text-sm text-muted">
                Pick a game and take a break from scrolling.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {GAMES.map((g, i) => (
                <GameCard
                  key={g.id}
                  game={g}
                  best={bests[g.id] ?? null}
                  index={i}
                  onClick={() => setSelected(g.id)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Active game ── */}
        {selected && (
          <motion.div
            key={selected}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0  }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Game title bar */}
            <div className="mx-auto max-w-shell px-6 pt-4 md:px-10">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedGame?.emoji}</span>
                <h1 className="font-display text-xl font-bold text-ink">
                  {selectedGame?.label}
                </h1>
              </div>
            </div>

            {selected === "memory" && <MemoryMatch />}
            {selected === "snake"  && <SnakeGame />}
            {selected === "bugs"   && <BugWhacker />}
            {selected === "tetris" && <TetrisGame />}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
