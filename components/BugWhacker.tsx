"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ── Config ──────────────────────────────────────────────── */
const COLS          = 5;
const ROWS          = 5;
const CELLS         = COLS * ROWS;
const GAME_DURATION = 30;

const BUG_TYPES = {
  normal: { emoji: "🐛", label: "Bug",      points: 10, life: 2200, chance: 0.65, color: "#34D399" },
  fast:   { emoji: "🦟", label: "Mosquito", points: 25, life: 1100, chance: 0.25, color: "#22D3EE" },
  golden: { emoji: "⭐", label: "Golden",   points: 50, life: 1800, chance: 0.10, color: "#FBBF24" },
} as const;

type BugType = keyof typeof BUG_TYPES;

interface Bug {
  id:      number;
  cell:    number;
  type:    BugType;
  born:    number; // timestamp
}

let nextId = 0;

function pickType(): BugType {
  const r = Math.random();
  if (r < BUG_TYPES.normal.chance) return "normal";
  if (r < BUG_TYPES.normal.chance + BUG_TYPES.fast.chance) return "fast";
  return "golden";
}

/* ── Bug cell ────────────────────────────────────────────── */
function BugCell({
  bug,
  now,
  onWhack,
}: {
  bug:     Bug;
  now:     number;
  onWhack: (id: number, pts: number) => void;
}) {
  const cfg     = BUG_TYPES[bug.type];
  const elapsed = now - bug.born;
  const frac    = Math.min(1, elapsed / cfg.life);

  return (
    <motion.button
      key={bug.id}
      initial={{ scale: 0, rotate: -20 }}
      animate={{ scale: 1,  rotate: 0  }}
      exit={{    scale: 0,  rotate: 20, opacity: 0 }}
      transition={{ duration: 0.18, ease: "backOut" }}
      whileTap={{ scale: 0.6 }}
      onClick={() => onWhack(bug.id, cfg.points)}
      className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 cursor-pointer select-none"
      style={{ zIndex: 10 }}
    >
      {/* Countdown ring */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 48 48">
        <circle
          cx="24" cy="24" r="20"
          fill="none"
          stroke={cfg.color}
          strokeWidth="2.5"
          strokeOpacity={0.3}
        />
        <circle
          cx="24" cy="24" r="20"
          fill="none"
          stroke={cfg.color}
          strokeWidth="2.5"
          strokeDasharray={`${125.66 * (1 - frac)} 125.66`}
          strokeLinecap="round"
          transform="rotate(-90 24 24)"
          style={{ transition: "stroke-dasharray 0.1s linear" }}
        />
      </svg>

      <motion.span
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
        className="text-2xl leading-none"
      >
        {cfg.emoji}
      </motion.span>
      <span className="text-[9px] font-bold" style={{ color: cfg.color }}>
        +{cfg.points}
      </span>
    </motion.button>
  );
}

/* ── Main component ──────────────────────────────────────── */
export default function BugWhacker() {
  const [bugs,     setBugs]     = useState<Bug[]>([]);
  const [score,    setScore]    = useState(0);
  const [best,     setBest]     = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [started,  setStarted]  = useState(false);
  const [over,     setOver]     = useState(false);
  const [combo,    setCombo]    = useState(0);
  const [squashed, setSquashed] = useState(0);
  const [floats,   setFloats]   = useState<{ id: number; cell: number; text: string; color: string }[]>([]);
  const [now,      setNow]      = useState(Date.now());

  const scoreRef  = useRef(0);
  const bugsRef   = useRef<Bug[]>([]);
  const comboRef  = useRef(0);
  const comboTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load best
  useEffect(() => {
    const s = localStorage.getItem("bugWhacker_best");
    if (s) setBest(Number(s));
  }, []);

  // Tick "now" for countdown rings
  useEffect(() => {
    if (!started || over) return;
    const id = setInterval(() => setNow(Date.now()), 80);
    return () => clearInterval(id);
  }, [started, over]);

  // Countdown timer
  useEffect(() => {
    if (!started || over) return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setOver(true);
          const b = Math.max(scoreRef.current, Number(localStorage.getItem("bugWhacker_best") ?? 0));
          localStorage.setItem("bugWhacker_best", String(b));
          setBest(b);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [started, over]);

  // Expire bugs that ran out of time
  useEffect(() => {
    if (!started || over) return;
    const id = setInterval(() => {
      const n = Date.now();
      setBugs((prev) => {
        const next = prev.filter((b) => n - b.born < BUG_TYPES[b.type].life);
        bugsRef.current = next;
        return next;
      });
    }, 100);
    return () => clearInterval(id);
  }, [started, over]);

  // Spawn bugs — adaptive rate
  useEffect(() => {
    if (!started || over) return;
    const rate = Math.max(420, 1100 - Math.floor(scoreRef.current / 40) * 60);
    const id = setInterval(() => {
      setBugs((prev) => {
        const occupied = new Set(prev.map((b) => b.cell));
        const free = Array.from({ length: CELLS }, (_, i) => i).filter((c) => !occupied.has(c));
        if (free.length === 0) return prev;
        const cell = free[Math.floor(Math.random() * free.length)];
        const bug: Bug = { id: nextId++, cell, type: pickType(), born: Date.now() };
        const next = [...prev, bug];
        bugsRef.current = next;
        return next;
      });
    }, rate);
    return () => clearInterval(id);
  }, [started, over, score]); // re-run when score changes to update rate

  // Whack handler
  const handleWhack = useCallback((id: number, pts: number) => {
    setBugs((prev) => {
      const bug = prev.find((b) => b.id === id);
      if (!bug) return prev;

      // Combo logic
      if (comboTimer.current) clearTimeout(comboTimer.current);
      comboRef.current += 1;
      setCombo(comboRef.current);
      comboTimer.current = setTimeout(() => {
        comboRef.current = 0;
        setCombo(0);
      }, 1200);

      const multiplier = comboRef.current >= 5 ? 3 : comboRef.current >= 3 ? 2 : 1;
      const earned = pts * multiplier;
      scoreRef.current += earned;
      setScore(scoreRef.current);
      setSquashed((s) => s + 1);

      // Floating score text
      const fid = nextId++;
      setFloats((f) => [...f, {
        id: fid,
        cell: bug.cell,
        text: multiplier > 1 ? `+${earned} ×${multiplier}!` : `+${earned}`,
        color: multiplier > 1 ? "#FBBF24" : BUG_TYPES[bug.type].color,
      }]);
      setTimeout(() => setFloats((f) => f.filter((x) => x.id !== fid)), 800);

      const next = prev.filter((b) => b.id !== id);
      bugsRef.current = next;
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setBugs([]);
    bugsRef.current = [];
    setScore(0);
    scoreRef.current = 0;
    setTimeLeft(GAME_DURATION);
    setStarted(false);
    setOver(false);
    setCombo(0);
    comboRef.current = 0;
    setSquashed(0);
    setFloats([]);
    nextId = 0;
  }, []);

  const timeFrac = timeLeft / GAME_DURATION;

  return (
    <div className="flex flex-col items-center gap-5 py-8 px-4">
      {/* Header */}
      <div className="text-center">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          Bug <span className="grad-text">Whacker</span>
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          Tap bugs before they escape. Combos = bonus points!
        </p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 rounded-2xl border border-line bg-surface/60 px-5 py-3 backdrop-blur text-sm">
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-faint uppercase tracking-widest">Score</span>
          <span className="font-display text-xl font-bold text-iris">{score}</span>
        </div>
        <div className="h-8 w-px bg-line" />
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-faint uppercase tracking-widest">Best</span>
          <span className="font-display text-xl font-bold text-mint">{best}</span>
        </div>
        <div className="h-8 w-px bg-line" />
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-faint uppercase tracking-widest">Squashed</span>
          <span className="font-display text-xl font-bold text-cyan">{squashed}</span>
        </div>
        {combo >= 2 && (
          <>
            <div className="h-8 w-px bg-line" />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center"
            >
              <span className="text-[10px] text-faint uppercase tracking-widest">Combo</span>
              <span className="font-display text-xl font-bold text-yellow-400">×{combo}</span>
            </motion.div>
          </>
        )}
      </div>

      {/* Timer bar */}
      <div className="w-full max-w-[340px] h-2 rounded-full bg-surface-2 overflow-hidden border border-line">
        <motion.div
          className="h-full rounded-full"
          style={{
            width: `${timeFrac * 100}%`,
            background: timeFrac > 0.5 ? "#34D399" : timeFrac > 0.25 ? "#FBBF24" : "#EF4444",
          }}
          transition={{ duration: 0.9 }}
        />
      </div>
      <p className="text-sm font-mono font-bold text-muted -mt-3">{timeLeft}s</p>

      {/* Grid */}
      <div
        className="relative rounded-2xl border border-line overflow-hidden"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          width:  "min(340px, 90vw)",
          height: "min(340px, 90vw)",
          background: "#07070B",
          gap: 2,
          padding: 2,
        }}
      >
        {/* Empty cells */}
        {Array.from({ length: CELLS }, (_, i) => (
          <div
            key={i}
            className="relative rounded-xl border border-white/[0.04] bg-surface/30"
          />
        ))}

        {/* Bugs */}
        {Array.from({ length: CELLS }, (_, cell) => {
          const bug = bugs.find((b) => b.cell === cell);
          return (
            <div
              key={`bug-${cell}`}
              className="absolute rounded-xl"
              style={{
                left:   `calc(${(cell % COLS) / COLS * 100}% + 2px)`,
                top:    `calc(${Math.floor(cell / COLS) / ROWS * 100}% + 2px)`,
                width:  `calc(${100 / COLS}% - 4px)`,
                height: `calc(${100 / ROWS}% - 4px)`,
              }}
            >
              <AnimatePresence>
                {bug && (
                  <BugCell key={bug.id} bug={bug} now={now} onWhack={handleWhack} />
                )}
              </AnimatePresence>

              {/* Floating score */}
              <AnimatePresence>
                {floats.filter((f) => f.cell === cell).map((f) => (
                  <motion.span
                    key={f.id}
                    initial={{ opacity: 1, y: 0, scale: 1 }}
                    animate={{ opacity: 0, y: -28, scale: 1.2 }}
                    exit={{}}
                    transition={{ duration: 0.75 }}
                    className="absolute inset-0 flex items-center justify-center text-[11px] font-extrabold pointer-events-none z-20"
                    style={{ color: f.color }}
                  >
                    {f.text}
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          );
        })}

        {/* Start overlay */}
        {!started && !over && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-bg/85 backdrop-blur-sm rounded-2xl z-30">
            <p className="text-3xl">🐛</p>
            <p className="font-display text-lg font-bold text-ink">Squash the Bugs!</p>
            <div className="flex gap-3 text-xs text-muted">
              <span>🐛 +10</span><span>🦟 +25</span><span>⭐ +50</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
              onClick={() => setStarted(true)}
              className="mt-1 rounded-xl grad-bg px-6 py-2.5 text-sm font-bold text-bg"
            >
              Start Whacking!
            </motion.button>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-muted">
        {Object.entries(BUG_TYPES).map(([, cfg]) => (
          <span key={cfg.emoji} style={{ color: cfg.color }}>
            {cfg.emoji} {cfg.label} +{cfg.points}
          </span>
        ))}
      </div>

      <button
        onClick={reset}
        className="rounded-xl border border-line bg-surface-2 px-5 py-2.5 text-sm font-semibold text-muted transition-colors hover:border-line-strong hover:text-ink"
      >
        New Game
      </button>

      {/* Game over overlay */}
      <AnimatePresence>
        {over && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: "rgba(7,7,11,0.88)", backdropFilter: "blur(8px)" }}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0, y: 30 }}
              animate={{ scale: 1,   opacity: 1, y: 0  }}
              exit={{    scale: 0.8, opacity: 0        }}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-sm rounded-3xl border border-white/10 bg-surface/90 p-8 text-center shadow-2xl backdrop-blur-xl"
              style={{ boxShadow: "0 0 80px rgba(52,211,153,0.15), 0 24px 60px rgba(0,0,0,0.8)" }}
            >
              <motion.div
                animate={{ rotate: [0, -15, 15, -10, 10, 0] }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-5xl mb-4"
              >
                {score >= best && score > 0 ? "🏆" : "💀"}
              </motion.div>
              <h2 className="font-display text-2xl font-extrabold text-ink">Time's up!</h2>
              <p className="mt-1 text-sm text-muted">
                {score >= best && score > 0 ? "New best score! 🎉" : "The bugs won this round..."}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  { label: "Score",    value: score,    color: "text-iris" },
                  { label: "Best",     value: best,     color: "text-mint" },
                  { label: "Squashed", value: squashed, color: "text-cyan" },
                  { label: "Max Combo",value: `×${combo || 1}`, color: "text-yellow-400" },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-line bg-bg/50 p-3">
                    <p className={`font-display text-xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] text-faint">{s.label}</p>
                  </div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
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
