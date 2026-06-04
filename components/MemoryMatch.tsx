"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ── Tech stack data ─────────────────────────────────────── */
const TECHS = [
  { id: "react",    label: "React",      icon: "⚛️",  color: "#61DAFB" },
  { id: "nextjs",   label: "Next.js",    icon: "▲",   color: "#E2E8F0" },
  { id: "ts",       label: "TypeScript", icon: "TS",  color: "#3B82F6" },
  { id: "tailwind", label: "Tailwind",   icon: "◈",   color: "#38BDF8" },
  { id: "threejs",  label: "Three.js",   icon: "◉",   color: "#7C5CFF" },
  { id: "docker",   label: "Docker",     icon: "⬡",   color: "#2496ED" },
  { id: "openai",   label: "OpenAI",     icon: "✦",   color: "#34D399" },
  { id: "redux",    label: "Redux",      icon: "⊕",   color: "#A78BFA" },
] as const;

/* ── Types ───────────────────────────────────────────────── */
interface Card {
  uid:     string;
  techId:  string;
  label:   string;
  icon:    string;
  color:   string;
  flipped: boolean;
  matched: boolean;
}

/* ── Helpers ─────────────────────────────────────────────── */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function createDeck(): Card[] {
  return shuffle(
    TECHS.flatMap((t) => [
      { uid: `${t.id}_0`, techId: t.id, label: t.label, icon: t.icon, color: t.color, flipped: false, matched: false },
      { uid: `${t.id}_1`, techId: t.id, label: t.label, icon: t.icon, color: t.color, flipped: false, matched: false },
    ])
  );
}

function fmt(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

/* ── Single card ─────────────────────────────────────────── */
function MemCard({
  card,
  onClick,
  shake,
}: {
  card: Card;
  onClick: () => void;
  shake: boolean;
}) {
  const isUp = card.flipped || card.matched;

  return (
    <motion.div
      animate={shake ? { x: [-6, 6, -5, 5, -3, 3, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
      className="cursor-pointer"
      style={{ perspective: "800px" }}
      onClick={onClick}
    >
      <motion.div
        animate={{ rotateY: isUp ? 180 : 0 }}
        transition={{ duration: 0.38, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d", position: "relative" }}
        className="w-[72px] h-[82px] sm:w-[88px] sm:h-[98px]"
      >
        {/* ── Card back (face-down) ── */}
        <div
          className="absolute inset-0 rounded-2xl border border-iris/25 bg-surface-2 flex items-center justify-center select-none"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
        >
          <div className="flex flex-col items-center gap-1 opacity-30">
            <div className="h-5 w-5 rounded-full bg-iris/60" />
            <div className="h-1 w-8 rounded bg-iris/40" />
            <div className="h-1 w-5 rounded bg-iris/30" />
          </div>
        </div>

        {/* ── Card front (face-up) ── */}
        <div
          className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-1.5 select-none border transition-shadow"
          style={{
            backfaceVisibility:       "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform:    "rotateY(180deg)",
            borderColor:  card.matched ? card.color : "rgba(255,255,255,0.1)",
            background:   card.matched ? `${card.color}12` : "#13131C",
            boxShadow:    card.matched ? `0 0 22px ${card.color}55` : "none",
          }}
        >
          <span className="text-2xl sm:text-3xl leading-none">{card.icon}</span>
          <span
            className="text-[9px] sm:text-[10px] font-semibold tracking-wide"
            style={{ color: card.matched ? card.color : "#9B9BAE" }}
          >
            {card.label}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Main game component ─────────────────────────────────── */
export default function MemoryMatch() {
  const [cards,   setCards]   = useState<Card[]>(createDeck);
  const [open,    setOpen]    = useState<string[]>([]);   // ≤2 uids
  const [moves,   setMoves]   = useState(0);
  const [time,    setTime]    = useState(0);
  const [started, setStarted] = useState(false);
  const [won,     setWon]     = useState(false);
  const [locked,  setLocked]  = useState(false);
  const [shake,   setShake]   = useState<string[]>([]);
  const [best,    setBest]    = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* Load best from localStorage */
  useEffect(() => {
    const stored = localStorage.getItem("memMatch_best");
    if (stored) setBest(Number(stored));
  }, []);

  /* Timer */
  useEffect(() => {
    if (started && !won) {
      timerRef.current = setInterval(() => setTime((t) => t + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [started, won]);

  /* Win check */
  useEffect(() => {
    if (cards.length && cards.every((c) => c.matched)) {
      setWon(true);
      const score = moves;
      setBest((prev) => {
        const next = prev === null || score < prev ? score : prev;
        localStorage.setItem("memMatch_best", String(next));
        return next;
      });
    }
  }, [cards, moves]);

  const reset = useCallback(() => {
    setCards(createDeck());
    setOpen([]);
    setMoves(0);
    setTime(0);
    setStarted(false);
    setWon(false);
    setLocked(false);
    setShake([]);
  }, []);

  const handleClick = useCallback((uid: string) => {
    if (locked || won) return;

    const card = cards.find((c) => c.uid === uid);
    if (!card || card.flipped || card.matched) return;

    if (!started) setStarted(true);

    const nextOpen = [...open, uid];

    // Flip the card
    setCards((prev) =>
      prev.map((c) => (c.uid === uid ? { ...c, flipped: true } : c))
    );

    if (nextOpen.length === 1) {
      setOpen(nextOpen);
      return;
    }

    // Second card flipped — evaluate
    setOpen([]);
    setMoves((m) => m + 1);

    const [firstUid] = nextOpen;
    const first = cards.find((c) => c.uid === firstUid)!;

    if (first.techId === card.techId) {
      // Match!
      setCards((prev) =>
        prev.map((c) =>
          c.uid === firstUid || c.uid === uid ? { ...c, flipped: true, matched: true } : c
        )
      );
    } else {
      // No match — shake and flip back after delay
      setLocked(true);
      setShake([firstUid, uid]);
      setTimeout(() => {
        setCards((prev) =>
          prev.map((c) =>
            c.uid === firstUid || c.uid === uid ? { ...c, flipped: false } : c
          )
        );
        setShake([]);
        setLocked(false);
      }, 900);
    }
  }, [cards, locked, open, started, won]);

  const matched = cards.filter((c) => c.matched).length / 2;

  return (
    <div className="flex flex-col items-center gap-6 py-10 px-4">

      {/* Header */}
      <div className="text-center">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          Tech Stack <span className="grad-text">Memory Match</span>
        </h1>
        <p className="mt-2 text-sm text-muted">
          Flip cards to find matching tech pairs. Fewest moves wins!
        </p>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-6 rounded-2xl border border-line bg-surface/60 px-6 py-3 backdrop-blur text-sm">
        <div className="flex flex-col items-center">
          <span className="text-xs text-faint uppercase tracking-widest">Moves</span>
          <span className="font-display text-xl font-bold text-ink">{moves}</span>
        </div>
        <div className="h-8 w-px bg-line" />
        <div className="flex flex-col items-center">
          <span className="text-xs text-faint uppercase tracking-widest">Time</span>
          <span className="font-display text-xl font-bold text-ink font-mono">{fmt(time)}</span>
        </div>
        <div className="h-8 w-px bg-line" />
        <div className="flex flex-col items-center">
          <span className="text-xs text-faint uppercase tracking-widest">Pairs</span>
          <span className="font-display text-xl font-bold text-iris">{matched}/8</span>
        </div>
        {best !== null && (
          <>
            <div className="h-8 w-px bg-line" />
            <div className="flex flex-col items-center">
              <span className="text-xs text-faint uppercase tracking-widest">Best</span>
              <span className="font-display text-xl font-bold text-mint">{best}</span>
            </div>
          </>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
        {cards.map((card) => (
          <MemCard
            key={card.uid}
            card={card}
            onClick={() => handleClick(card.uid)}
            shake={shake.includes(card.uid)}
          />
        ))}
      </div>

      {/* Reset button */}
      <button
        onClick={reset}
        className="rounded-xl border border-line bg-surface-2 px-5 py-2.5 text-sm font-semibold text-muted transition-colors hover:border-line-strong hover:text-ink"
      >
        New Game
      </button>

      {/* Win overlay */}
      <AnimatePresence>
        {won && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: "rgba(7,7,11,0.85)", backdropFilter: "blur(8px)" }}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0, y: 30 }}
              animate={{ scale: 1,   opacity: 1, y: 0  }}
              exit={{    scale: 0.8, opacity: 0        }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-sm rounded-3xl border border-white/10 bg-surface/90 p-8 text-center shadow-2xl backdrop-blur-xl"
              style={{ boxShadow: "0 0 80px rgba(52,211,153,0.2), 0 24px 60px rgba(0,0,0,0.8)" }}
            >
              <motion.div
                animate={{ rotate: [0, -15, 15, -10, 10, 0] }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-5xl mb-4"
              >
                🎉
              </motion.div>

              <h2 className="font-display text-2xl font-extrabold text-ink">You matched them all!</h2>
              <p className="mt-1 text-sm text-muted">Stack unlocked — full knowledge confirmed 💪</p>

              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  { label: "Moves",  value: String(moves),  color: "text-iris" },
                  { label: "Time",   value: fmt(time),      color: "text-cyan" },
                  { label: "Best",   value: best !== null ? String(best) : String(moves), color: "text-mint" },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-line bg-bg/50 p-3">
                    <p className={`font-display text-xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] text-faint">{s.label}</p>
                  </div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={reset}
                className="mt-6 w-full rounded-xl grad-bg py-3 text-sm font-bold text-bg"
              >
                Play Again
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
