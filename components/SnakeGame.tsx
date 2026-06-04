"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ── Constants ───────────────────────────────────────────── */
const COLS = 20;
const ROWS = 20;

const FOODS = ["⚛️","▲","TS","🌊","◉","🐳","✦","⊕"];

type Dir = [number, number];
type Pos = [number, number];

const RIGHT: Dir = [ 1,  0];
const LEFT:  Dir = [-1,  0];
const UP:    Dir = [ 0, -1];
const DOWN:  Dir = [ 0,  1];

function initSnake(): Pos[] {
  return [[10, 10], [9, 10], [8, 10]];
}

function randomFood(snake: Pos[]): Pos {
  let p: Pos;
  do { p = [Math.floor(Math.random() * COLS), Math.floor(Math.random() * ROWS)]; }
  while (snake.some(([x, y]) => x === p[0] && y === p[1]));
  return p;
}

function randomFoodIcon() {
  return FOODS[Math.floor(Math.random() * FOODS.length)];
}

function opposite(a: Dir, b: Dir) {
  return a[0] === -b[0] && a[1] === -b[1];
}

/* ── Custom interval hook ────────────────────────────────── */
function useInterval(cb: () => void, delay: number | null) {
  const saved = useRef(cb);
  useEffect(() => { saved.current = cb; }, [cb]);
  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => saved.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

/* ── Main component ──────────────────────────────────────── */
export default function SnakeGame() {
  const [snake,   setSnake]   = useState<Pos[]>(initSnake);
  const [food,    setFood]    = useState<Pos>(() => randomFood(initSnake()));
  const [icon,    setIcon]    = useState(randomFoodIcon);
  const [score,   setScore]   = useState(0);
  const [best,    setBest]    = useState<number>(0);
  const [over,    setOver]    = useState(false);
  const [started, setStarted] = useState(false);

  // Use refs for values consumed inside interval
  const dirRef     = useRef<Dir>(RIGHT);
  const nextDirRef = useRef<Dir>(RIGHT);
  const snakeRef   = useRef<Pos[]>(initSnake());
  const foodRef    = useRef<Pos>(food);
  const scoreRef   = useRef(0);
  const speedRef   = useRef(140);

  // Sync food ref
  useEffect(() => { foodRef.current = food; }, [food]);

  // Load best
  useEffect(() => {
    const s = localStorage.getItem("snake_best");
    if (s) setBest(Number(s));
  }, []);

  /* ── Game loop ─────────────────────────────────────────── */
  useInterval(() => {
    if (!started || over) return;

    dirRef.current = nextDirRef.current;
    const [dx, dy] = dirRef.current;
    const [hx, hy] = snakeRef.current[0];
    const nx = hx + dx;
    const ny = hy + dy;

    // Wall collision
    if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) {
      setOver(true);
      const b = Math.max(scoreRef.current, Number(localStorage.getItem("snake_best") ?? 0));
      localStorage.setItem("snake_best", String(b));
      setBest(b);
      return;
    }

    // Self collision
    if (snakeRef.current.some(([x, y]) => x === nx && y === ny)) {
      setOver(true);
      const b = Math.max(scoreRef.current, Number(localStorage.getItem("snake_best") ?? 0));
      localStorage.setItem("snake_best", String(b));
      setBest(b);
      return;
    }

    const ate = nx === foodRef.current[0] && ny === foodRef.current[1];
    const newSnake: Pos[] = ate
      ? [[nx, ny], ...snakeRef.current]
      : [[nx, ny], ...snakeRef.current.slice(0, -1)];

    snakeRef.current = newSnake;
    setSnake([...newSnake]);

    if (ate) {
      const ns = scoreRef.current + 10;
      scoreRef.current = ns;
      setScore(ns);
      speedRef.current = Math.max(55, speedRef.current - 4);
      const nf = randomFood(newSnake);
      foodRef.current = nf;
      setFood(nf);
      setIcon(randomFoodIcon());
    }
  }, started && !over ? speedRef.current : null);

  /* ── Keyboard controls ─────────────────────────────────── */
  useEffect(() => {
    const map: Record<string, Dir> = {
      ArrowRight: RIGHT, ArrowLeft: LEFT, ArrowUp: UP, ArrowDown: DOWN,
      d: RIGHT, a: LEFT, w: UP, s: DOWN,
    };
    const handle = (e: KeyboardEvent) => {
      const d = map[e.key];
      if (!d) return;
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) e.preventDefault();
      if (!opposite(d, dirRef.current)) nextDirRef.current = d;
      if (!started && !over) setStarted(true);
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [started, over]);

  /* ── Touch / swipe controls ────────────────────────────── */
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);
  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    touchStart.current = null;
    let d: Dir;
    if (Math.abs(dx) > Math.abs(dy)) {
      d = dx > 20 ? RIGHT : dx < -20 ? LEFT : dirRef.current;
    } else {
      d = dy > 20 ? DOWN : dy < -20 ? UP : dirRef.current;
    }
    if (!opposite(d, dirRef.current)) nextDirRef.current = d;
    if (!started && !over) setStarted(true);
  }, [started, over]);

  /* ── D-pad tap for mobile ──────────────────────────────── */
  const tapDir = (d: Dir) => {
    if (!opposite(d, dirRef.current)) nextDirRef.current = d;
    if (!started && !over) setStarted(true);
  };

  /* ── Reset ─────────────────────────────────────────────── */
  const reset = useCallback(() => {
    const s = initSnake();
    const f = randomFood(s);
    snakeRef.current   = s;
    foodRef.current    = f;
    dirRef.current     = RIGHT;
    nextDirRef.current = RIGHT;
    scoreRef.current   = 0;
    speedRef.current   = 140;
    setSnake(s);
    setFood(f);
    setIcon(randomFoodIcon());
    setScore(0);
    setOver(false);
    setStarted(false);
  }, []);

  /* ── Render ────────────────────────────────────────────── */
  const snakeSet = new Set(snake.map(([x, y]) => `${x},${y}`));
  const isHead   = ([x, y]: Pos) => x === snake[0][0] && y === snake[0][1];

  return (
    <div className="flex flex-col items-center gap-5 py-8 px-4">

      {/* Header */}
      <div className="text-center">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          Code <span className="grad-text">Runner</span>
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          Eat the tech stack. Don't crash. Arrow keys / WASD / swipe.
        </p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 rounded-2xl border border-line bg-surface/60 px-6 py-3 backdrop-blur text-sm">
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
          <span className="text-[10px] text-faint uppercase tracking-widest">Length</span>
          <span className="font-display text-xl font-bold text-cyan">{snake.length}</span>
        </div>
      </div>

      {/* Grid */}
      <div
        className="relative rounded-xl border border-line overflow-hidden touch-none"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          width:  "min(340px, 90vw)",
          height: "min(340px, 90vw)",
          background: "#07070B",
        }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {Array.from({ length: ROWS * COLS }, (_, i) => {
          const x = i % COLS;
          const y = Math.floor(i / COLS);
          const key = `${x},${y}`;
          const head = isHead([x, y]);
          const body = !head && snakeSet.has(key);
          const isFood = x === food[0] && y === food[1];

          // Snake segment depth (head = 0, tail = length-1)
          const depth = snake.findIndex(([sx, sy]) => sx === x && sy === y);
          const opacity = body ? Math.max(0.25, 1 - depth / snake.length) : 1;

          return (
            <div
              key={key}
              className="relative flex items-center justify-center"
              style={{
                background: head
                  ? "#7C5CFF"
                  : body
                  ? `rgba(124,92,255,${opacity})`
                  : "transparent",
                borderRadius: head || body ? 3 : 0,
                boxShadow: head
                  ? "0 0 8px #7C5CFF"
                  : isFood
                  ? "0 0 10px #34D399"
                  : "none",
              }}
            >
              {isFood && (
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="text-[10px] sm:text-xs leading-none select-none"
                >
                  {icon}
                </motion.span>
              )}
              {/* Head eyes */}
              {head && (
                <div className="absolute inset-0 flex items-center justify-center gap-[2px]">
                  <div className="w-[3px] h-[3px] rounded-full bg-white/80" />
                  <div className="w-[3px] h-[3px] rounded-full bg-white/80" />
                </div>
              )}
            </div>
          );
        })}

        {/* Start overlay */}
        {!started && !over && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-bg/80 backdrop-blur-sm">
            <p className="font-display text-lg font-bold text-ink">Ready?</p>
            <p className="text-xs text-muted">Press any arrow key or swipe to start</p>
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
              onClick={() => { nextDirRef.current = RIGHT; setStarted(true); }}
              className="rounded-xl grad-bg px-5 py-2.5 text-sm font-bold text-bg"
            >
              Start →
            </motion.button>
          </div>
        )}
      </div>

      {/* Mobile D-pad */}
      <div className="grid grid-cols-3 gap-2 sm:hidden">
        <div />
        <button onClick={() => tapDir(UP)}    className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface-2 text-ink active:bg-iris/20">↑</button>
        <div />
        <button onClick={() => tapDir(LEFT)}  className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface-2 text-ink active:bg-iris/20">←</button>
        <button onClick={() => tapDir(DOWN)}  className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface-2 text-ink active:bg-iris/20">↓</button>
        <button onClick={() => tapDir(RIGHT)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface-2 text-ink active:bg-iris/20">→</button>
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
              style={{ boxShadow: "0 0 80px rgba(124,92,255,0.2), 0 24px 60px rgba(0,0,0,0.8)" }}
            >
              <motion.div
                animate={{ rotate: [0, -15, 15, -10, 10, 0] }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-5xl mb-4"
              >
                💥
              </motion.div>
              <h2 className="font-display text-2xl font-extrabold text-ink">Game Over!</h2>
              <p className="mt-1 text-sm text-muted">
                {score >= best && score > 0 ? "New best score! 🏆" : "Better luck next time!"}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  { label: "Score",  value: score, color: "text-iris" },
                  { label: "Best",   value: best,  color: "text-mint" },
                  { label: "Length", value: snake.length, color: "text-cyan" },
                  { label: "Stack",  value: `${Math.floor(score / 10)} eaten`, color: "text-faint" },
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
                Try Again
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
