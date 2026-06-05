"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ══════════════════════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════════════════════ */
const COLS = 10;
const ROWS = 20;
const CELL = 26; // px per cell on canvas
const CANVAS_W = COLS * CELL;
const CANVAS_H = ROWS * CELL;

const PIECE_TYPES = ["I","O","T","S","Z","J","L"] as const;
type PieceType = (typeof PIECE_TYPES)[number];

// Portfolio-accent palette
const COLORS: Record<PieceType, string> = {
  I: "#22D3EE",
  O: "#FBBF24",
  T: "#A78BFA",
  S: "#34D399",
  Z: "#EF4444",
  J: "#7C5CFF",
  L: "#FB923C",
};

const SHAPES: Record<PieceType, number[][]> = {
  I: [[1,1,1,1]],
  O: [[1,1],[1,1]],
  T: [[0,1,0],[1,1,1]],
  S: [[0,1,1],[1,1,0]],
  Z: [[1,1,0],[0,1,1]],
  J: [[1,0,0],[1,1,1]],
  L: [[0,0,1],[1,1,1]],
};

// Tetris scoring (points × level)
const LINE_SCORES = [0, 100, 300, 500, 800];

/* ══════════════════════════════════════════════════════════════
   PURE GAME UTILITIES  (no React)
══════════════════════════════════════════════════════════════ */
interface Piece { type: PieceType; x: number; y: number; shape: number[][] }

function emptyBoard(): number[][] {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function rotateCW(shape: number[][]): number[][] {
  const rows = shape.length, cols = shape[0].length;
  return Array.from({ length: cols }, (_, c) =>
    Array.from({ length: rows }, (_, r) => shape[rows - 1 - r][c])
  );
}

function isValid(piece: Piece, board: number[][]): boolean {
  for (let r = 0; r < piece.shape.length; r++)
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (!piece.shape[r][c]) continue;
      const br = piece.y + r, bc = piece.x + c;
      if (bc < 0 || bc >= COLS || br >= ROWS) return false;
      if (br >= 0 && board[br][bc])          return false;
    }
  return true;
}

function mergeBoard(piece: Piece, board: number[][]): number[][] {
  const nb = board.map(row => [...row]);
  const ci = PIECE_TYPES.indexOf(piece.type) + 1;
  piece.shape.forEach((row, r) =>
    row.forEach((v, c) => {
      if (v && piece.y + r >= 0) nb[piece.y + r][piece.x + c] = ci;
    })
  );
  return nb;
}

function clearLines(board: number[][]): { board: number[][], count: number } {
  const kept = board.filter(row => row.some(v => !v));
  const count = ROWS - kept.length;
  while (kept.length < ROWS) kept.unshift(Array(COLS).fill(0));
  return { board: kept, count };
}

function ghostY(piece: Piece, board: number[][]): number {
  let gy = piece.y;
  while (isValid({ ...piece, y: gy + 1 }, board)) gy++;
  return gy;
}

function tryRotate(piece: Piece, board: number[][]): Piece | null {
  const rotated = { ...piece, shape: rotateCW(piece.shape) };
  const kicks = [0, -1, 1, -2, 2];
  for (const dx of kicks) {
    const p = { ...rotated, x: rotated.x + dx };
    if (isValid(p, board)) return p;
  }
  return null;
}

function dropInterval(level: number) {
  return Math.max(50, 900 - (level - 1) * 85);
}

/* ══════════════════════════════════════════════════════════════
   CANVAS RENDERING
══════════════════════════════════════════════════════════════ */
function drawCell(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  color: string,
  alpha = 1,
) {
  if (cy < 0) return;
  const pad = 1;
  const x = cx * CELL + pad, y = cy * CELL + pad;
  const w = CELL - pad * 2,  h = CELL - pad * 2;
  ctx.globalAlpha = alpha;
  ctx.fillStyle   = color;
  ctx.fillRect(x, y, w, h);
  if (alpha === 1) {
    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.fillRect(x + 1, y + 1, w - 2, 4);
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(x, y + h - 4, w, 4);
  }
  ctx.globalAlpha = 1;
}

function renderBoard(
  ctx: CanvasRenderingContext2D,
  board: number[][],
  current: Piece | null,
  gy: number,
) {
  // Background
  ctx.fillStyle = "#07070B";
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Grid lines
  ctx.strokeStyle = "rgba(255,255,255,0.04)";
  ctx.lineWidth   = 0.5;
  for (let c = 0; c <= COLS; c++) {
    ctx.beginPath();
    ctx.moveTo(c * CELL, 0); ctx.lineTo(c * CELL, CANVAS_H); ctx.stroke();
  }
  for (let r = 0; r <= ROWS; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * CELL); ctx.lineTo(CANVAS_W, r * CELL); ctx.stroke();
  }

  // Locked cells
  board.forEach((row, r) =>
    row.forEach((v, c) => {
      if (v) drawCell(ctx, c, r, COLORS[PIECE_TYPES[v - 1]]);
    })
  );

  if (!current) return;

  // Ghost
  current.shape.forEach((row, r) =>
    row.forEach((v, c) => {
      if (v) drawCell(ctx, current.x + c, gy + r, COLORS[current.type], 0.18);
    })
  );

  // Current piece
  current.shape.forEach((row, r) =>
    row.forEach((v, c) => {
      if (v) drawCell(ctx, current.x + c, current.y + r, COLORS[current.type]);
    })
  );
}

/* ══════════════════════════════════════════════════════════════
   MINI-GRID — for Hold / Next previews
══════════════════════════════════════════════════════════════ */
function MiniGrid({ type }: { type: PieceType | null }) {
  if (!type) return (
    <div className="flex h-16 w-20 items-center justify-center">
      <span className="text-xs text-faint">—</span>
    </div>
  );
  const shape = SHAPES[type];
  const color = COLORS[type];
  // Pad to 4×4 for consistent layout
  const rows = shape.length, cols = shape[0].length;
  const padTop  = Math.floor((4 - rows) / 2);
  const padLeft = Math.floor((4 - cols) / 2);
  const grid: (0 | 1)[][] = Array.from({ length: 4 }, () => Array(4).fill(0));
  shape.forEach((row, r) => row.forEach((v, c) => {
    if (v) grid[r + padTop][c + padLeft] = 1;
  }));
  return (
    <div className="flex flex-col gap-0.5">
      {grid.map((row, r) => (
        <div key={r} className="flex gap-0.5">
          {row.map((v, c) => (
            <div
              key={c}
              className="h-4 w-4 rounded-[2px]"
              style={{ background: v ? color : "rgba(255,255,255,0.04)" }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TETRIS GAME COMPONENT
══════════════════════════════════════════════════════════════ */
export default function TetrisGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /* All game state in refs — no re-renders during the loop */
  const boardRef    = useRef(emptyBoard());
  const currentRef  = useRef<Piece | null>(null);
  const nextRef     = useRef<PieceType | null>(null);
  const holdRef     = useRef<PieceType | null>(null);
  const bagRef      = useRef<PieceType[]>([]);
  const canHoldRef  = useRef(true);
  const scoreRef    = useRef(0);
  const levelRef    = useRef(1);
  const linesRef    = useRef(0);
  const gameOverRef = useRef(false);
  const pausedRef   = useRef(false);
  const lastDropRef = useRef(0);
  const rafRef      = useRef(0);

  /* UI state — only updated on meaningful events */
  const [score,    setScore]    = useState(0);
  const [level,    setLevel]    = useState(1);
  const [lines,    setLines]    = useState(0);
  const [holdType, setHoldType] = useState<PieceType | null>(null);
  const [nextType, setNextType] = useState<PieceType | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [paused,   setPaused]   = useState(false);
  const [started,  setStarted]  = useState(false);
  const [best,     setBest]     = useState(0);

  // ── 7-bag randomiser ──
  const pullBag = useCallback((): PieceType => {
    if (bagRef.current.length === 0) {
      const bag = [...PIECE_TYPES] as PieceType[];
      for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
      }
      bagRef.current = bag;
    }
    return bagRef.current.pop()!;
  }, []);

  const spawnPiece = useCallback((type?: PieceType): Piece => {
    const t = type ?? pullBag();
    const shape = SHAPES[t];
    return { type: t, x: Math.floor((COLS - shape[0].length) / 2), y: -1, shape };
  }, [pullBag]);

  // ── Sync UI refs → React state ──
  const syncUI = useCallback(() => {
    setScore(scoreRef.current);
    setLevel(levelRef.current);
    setLines(linesRef.current);
    setHoldType(holdRef.current);
    setNextType(nextRef.current);
  }, []);

  // ── Lock piece, clear lines, spawn next ──
  const lock = useCallback(() => {
    const piece = currentRef.current;
    if (!piece) return;

    const merged = mergeBoard(piece, boardRef.current);
    const { board: clearedBoard, count } = clearLines(merged);
    boardRef.current = clearedBoard;

    if (count > 0) {
      const pts = LINE_SCORES[count] * levelRef.current;
      scoreRef.current += pts;
      linesRef.current += count;
      levelRef.current  = Math.floor(linesRef.current / 10) + 1;
    }

    const next = spawnPiece(nextRef.current ?? undefined);
    nextRef.current = pullBag();
    canHoldRef.current = true;

    if (!isValid(next, boardRef.current)) {
      gameOverRef.current = true;
      const best = Number(localStorage.getItem("tetris_best") ?? 0);
      if (scoreRef.current > best) {
        localStorage.setItem("tetris_best", String(scoreRef.current));
        setBest(scoreRef.current);
      }
      setGameOver(true);
    } else {
      currentRef.current = next;
    }

    syncUI();
  }, [pullBag, spawnPiece, syncUI]);

  // ── Move down one row ──
  const moveDown = useCallback((soft = false) => {
    const piece = currentRef.current;
    if (!piece) return;
    const moved = { ...piece, y: piece.y + 1 };
    if (isValid(moved, boardRef.current)) {
      currentRef.current = moved;
      if (soft) scoreRef.current += 1;
    } else {
      lock();
    }
  }, [lock]);

  // ── Hard drop ──
  const hardDrop = useCallback(() => {
    const piece = currentRef.current;
    if (!piece) return;
    const gy = ghostY(piece, boardRef.current);
    const rows = gy - piece.y;
    scoreRef.current += rows * 2;
    currentRef.current = { ...piece, y: gy };
    lock();
  }, [lock]);

  // ── Hold ──
  const doHold = useCallback(() => {
    if (!canHoldRef.current || !currentRef.current) return;
    const prev = holdRef.current;
    holdRef.current    = currentRef.current.type;
    currentRef.current = spawnPiece(prev ?? undefined);
    if (!prev) nextRef.current = pullBag();
    canHoldRef.current = false;
    syncUI();
  }, [spawnPiece, pullBag, syncUI]);

  // ── RAF game loop ──
  const loop = useCallback((ts: number) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    if (!pausedRef.current && !gameOverRef.current) {
      if (ts - lastDropRef.current >= dropInterval(levelRef.current)) {
        moveDown();
        lastDropRef.current = ts;
      }
    }

    const piece = currentRef.current;
    const gy    = piece ? ghostY(piece, boardRef.current) : -1;
    renderBoard(ctx, boardRef.current, piece, gy);

    rafRef.current = requestAnimationFrame(loop);
  }, [moveDown]);

  // ── Start / restart ──
  const init = useCallback(() => {
    boardRef.current    = emptyBoard();
    bagRef.current      = [];
    const first = spawnPiece();
    currentRef.current  = first;
    nextRef.current     = pullBag();
    holdRef.current     = null;
    canHoldRef.current  = true;
    scoreRef.current    = 0;
    levelRef.current    = 1;
    linesRef.current    = 0;
    gameOverRef.current = false;
    pausedRef.current   = false;
    lastDropRef.current = 0;
    setGameOver(false);
    setPaused(false);
    setStarted(true);
    setBest(Number(localStorage.getItem("tetris_best") ?? 0));
    syncUI();
  }, [spawnPiece, pullBag, syncUI]);

  // ── Keyboard ──
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (!started || gameOver) return;

      if (e.code === "KeyP" || e.code === "Escape") {
        pausedRef.current = !pausedRef.current;
        setPaused(pausedRef.current);
        return;
      }
      if (pausedRef.current) return;

      const piece = currentRef.current;
      if (!piece) return;

      switch (e.code) {
        case "ArrowLeft": {
          const p = { ...piece, x: piece.x - 1 };
          if (isValid(p, boardRef.current)) currentRef.current = p;
          break;
        }
        case "ArrowRight": {
          const p = { ...piece, x: piece.x + 1 };
          if (isValid(p, boardRef.current)) currentRef.current = p;
          break;
        }
        case "ArrowDown":
          e.preventDefault();
          moveDown(true);
          break;
        case "ArrowUp":
        case "KeyZ": {
          const r = tryRotate(piece, boardRef.current);
          if (r) currentRef.current = r;
          break;
        }
        case "Space":
          e.preventDefault();
          hardDrop();
          break;
        case "KeyC":
        case "ShiftLeft":
        case "ShiftRight":
          doHold();
          break;
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [started, gameOver, moveDown, hardDrop, doHold]);

  // ── Start RAF on mount ──
  useEffect(() => {
    rafRef.current = requestAnimationFrame(loop);
    setBest(Number(localStorage.getItem("tetris_best") ?? 0));
    return () => cancelAnimationFrame(rafRef.current);
  }, [loop]);

  // ── Touch/button helpers ──
  const move = (dx: number) => {
    const p = currentRef.current;
    if (!p || pausedRef.current || gameOverRef.current) return;
    const moved = { ...p, x: p.x + dx };
    if (isValid(moved, boardRef.current)) currentRef.current = moved;
  };
  const rotate = () => {
    const p = currentRef.current;
    if (!p || pausedRef.current || gameOverRef.current) return;
    const r = tryRotate(p, boardRef.current);
    if (r) currentRef.current = r;
  };

  /* ── Render ── */
  return (
    <div className="flex flex-col items-center gap-4 py-6 px-4">

      {/* Header */}
      <div className="text-center">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          Block <span className="grad-text">Drop</span>
        </h1>
        <p className="mt-1 text-sm text-muted">
          Arrow keys · Space to hard drop · C to hold
        </p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-5 rounded-2xl border border-line bg-surface/60 px-5 py-2.5 backdrop-blur text-sm">
        {[
          { label: "Score", value: score,  color: "text-iris" },
          { label: "Level", value: level,  color: "text-cyan" },
          { label: "Lines", value: lines,  color: "text-mint" },
          { label: "Best",  value: best,   color: "text-faint" },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-widest text-faint">{label}</span>
            <span className={`font-display text-lg font-bold ${color}`}>{value}</span>
          </div>
        ))}
      </div>

      {/* Game area */}
      <div className="flex items-start gap-3">

        {/* Hold */}
        <div className="flex flex-col items-center gap-1.5 rounded-xl border border-line bg-surface-2 p-3">
          <span className="text-[10px] uppercase tracking-widest text-faint">Hold</span>
          <MiniGrid type={holdType} />
        </div>

        {/* Canvas */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            className="rounded-xl border border-line"
            style={{ imageRendering: "pixelated" }}
          />

          {/* Start / Game-over overlay */}
          <AnimatePresence>
            {(!started || gameOver) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-xl"
                style={{ background: "rgba(7,7,11,0.88)", backdropFilter: "blur(6px)" }}
              >
                {gameOver && (
                  <>
                    <p className="font-display text-2xl font-extrabold text-ink">Game Over</p>
                    <p className="text-sm text-muted">Score: <span className="text-iris font-bold">{score}</span></p>
                  </>
                )}
                {!started && !gameOver && (
                  <p className="font-display text-xl font-bold text-ink">Block Drop</p>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
                  onClick={init}
                  className="rounded-xl grad-bg px-6 py-3 text-sm font-bold text-bg"
                >
                  {gameOver ? "Play Again" : "Start Game"}
                </motion.button>
              </motion.div>
            )}

            {/* Pause overlay */}
            {paused && started && !gameOver && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-xl"
                style={{ background: "rgba(7,7,11,0.75)", backdropFilter: "blur(4px)" }}
              >
                <p className="font-display text-2xl font-bold text-ink">Paused</p>
                <p className="text-xs text-faint">Press P or Esc to resume</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Next */}
        <div className="flex flex-col items-center gap-1.5 rounded-xl border border-line bg-surface-2 p-3">
          <span className="text-[10px] uppercase tracking-widest text-faint">Next</span>
          <MiniGrid type={nextType} />
        </div>
      </div>

      {/* Mobile controls */}
      <div className="flex flex-col items-center gap-2 sm:hidden">
        <button
          onClick={rotate}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-iris/30 bg-iris/10 text-iris font-bold"
        >
          ↺
        </button>
        <div className="flex gap-3">
          <button onClick={() => move(-1)} className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-surface-2 text-ink">←</button>
          <button onClick={() => moveDown(true)} className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-surface-2 text-ink">↓</button>
          <button onClick={() => move(1)} className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-surface-2 text-ink">→</button>
        </div>
        <div className="flex gap-3">
          <button onClick={hardDrop} className="rounded-xl border border-iris/30 bg-iris/10 px-4 py-2.5 text-xs font-bold text-iris">DROP</button>
          <button onClick={doHold}   className="rounded-xl border border-line bg-surface-2 px-4 py-2.5 text-xs font-semibold text-muted">HOLD</button>
          <button
            onClick={() => { pausedRef.current = !pausedRef.current; setPaused(pausedRef.current); }}
            className="rounded-xl border border-line bg-surface-2 px-4 py-2.5 text-xs font-semibold text-muted"
          >
            {paused ? "▶" : "⏸"}
          </button>
        </div>
      </div>

      {/* Keyboard hint (desktop) */}
      <p className="hidden text-[11px] text-faint sm:block">
        ← → move &nbsp;·&nbsp; ↑ / Z rotate &nbsp;·&nbsp; ↓ soft drop &nbsp;·&nbsp; Space hard drop &nbsp;·&nbsp; C hold &nbsp;·&nbsp; P pause
      </p>
    </div>
  );
}
