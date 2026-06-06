"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type State = "walk" | "run" | "idle" | "sleep" | "happy" | "surprised" | "sit" | "drag";
type Dir   = "left" | "right";

/* ── Messages ─────────────────────────────────────────────────── */
const CLICK_MSGS = [
  "Meow! 🐾",
  "It's not a bug, it's a feature 🐛",
  "Have you tried turning it off? 🔌",
  "git commit -m 'fixed everything' 😅",
  "Works on MY machine 🤷",
  "undefined is not a function 😭",
  "// TODO: pet me (never)",
  "npm install happiness --save 💾",
  "TypeScript or bust 💜",
  "Stack Overflow is my co-pilot 🙏",
  "Cannot center div... 😤",
  "I pushed to prod on Friday 💀",
  "Feed me or I'll merge main 😈",
  "404: belly rubs not found",
  "*knocks your code off the desk*",
  "Senior dev energy 👨‍💻",
  "I've been here since npm v2",
  "Deploying... napping first 💤",
  "yarn or npm? I use pnpm 😏",
  "This is fine. Everything is fine. 🔥",
  "I linted your code. It's bad. 🚨",
  "woof? no wait... meow 🐱",
  "Next.js go brrr 🚀",
  "I dream in async/await 💭",
  "console.log('pet me') → undefined",
  "Ship it! 🚢",
  "Type errors? Never heard of them 💜",
  "Tailwind my beloved ✨",
  "I've survived 3 rebases today",
  "const me = 'not a bug' as const",
];

const DOUBLE_CLICK_MSGS = [
  "WHEEEEE 🌀",
  "ZOOOOM!",
  "Maximum velocity achieved!! 💨",
  "THIS IS FINE 🔥",
  "YEET 🚀",
];

const DRAG_MSGS = [
  "PUT ME DOWN 😤",
  "Hooman! I can walk!!",
  "This is UNDIGNIFIED 😾",
  "I am NOT a cursor!",
  "I'll bite your keyboard!",
];

const SLEEP_MSGS = ["zzz... zz...", "shhh... 🌙", "*purring intensifies*", "dreaming of 0 bugs..."];

const EASTER_EGGS: Record<number, string> = {
  5:   "5 clicks! Am I a button?? 🤔",
  10:  "10 times! I'm not a stress ball!",
  20:  "20 CLICKS. I'm logging this 📝",
  50:  "50 CLICKS?! You need help 🆘",
  100: "100 clicks. I called HR 📞",
};

/* ── Sprite ───────────────────────────────────────────────────── */
function Sprite({ state, dir, frame }: { state: State; dir: Dir; frame: number }) {
  const step = frame % 2 === 0;
  const b  = "#a78bfa", l  = "#c4b5fd", v = "#e9d5ff";
  const d  = "#7c3aed", pk = "#f9a8d4";

  let svg: React.ReactElement;

  if (state === "sleep") {
    svg = (
      <svg viewBox="0 0 24 18" width="48" height="36" style={{ imageRendering: "pixelated" }}>
        <rect x="4"  y="6"  width="16" height="8"  rx="4" fill={b} />
        <rect x="2"  y="8"  width="6"  height="6"  rx="3" fill={b} />
        <rect x="9"  y="4"  width="8"  height="6"  rx="2" fill={l} />
        <rect x="9"  y="2"  width="2"  height="3"  fill={l} />
        <rect x="15" y="2"  width="2"  height="3"  fill={l} />
        <rect x="11" y="5"  width="2"  height="1"  fill={d} />
        <rect x="14" y="5"  width="2"  height="1"  fill={d} />
        <text x="18" y="5"  fontSize="4" fill={b} fontFamily="monospace">z</text>
        <text x="20" y="3"  fontSize="3" fill={b} fontFamily="monospace">z</text>
        <text x="22" y="1"  fontSize="3" fill={b} fontFamily="monospace">z</text>
      </svg>
    );
  } else if (state === "surprised") {
    svg = (
      <svg viewBox="0 0 16 24" width="32" height="48" style={{ imageRendering: "pixelated" }}>
        <rect x="3"  y="9"  width="10" height="12" rx="2" fill={b} />
        <rect x="3"  y="2"  width="10" height="9"  rx="2" fill={l} />
        <rect x="2"  y="0"  width="3"  height="4"  fill={l} />
        <rect x="11" y="0"  width="3"  height="4"  fill={l} />
        <rect x="3"  y="1"  width="2"  height="2"  fill={v} />
        <rect x="12" y="1"  width="2"  height="2"  fill={v} />
        {/* big round eyes */}
        <rect x="4"  y="4"  width="3"  height="3"  fill="#fff" />
        <rect x="9"  y="4"  width="3"  height="3"  fill="#fff" />
        <rect x="5"  y="5"  width="1"  height="1"  fill="#000" />
        <rect x="10" y="5"  width="1"  height="1"  fill="#000" />
        {/* O mouth */}
        <rect x="7"  y="9"  width="2"  height="2"  fill={d} />
        <rect x="3"  y="20" width="3"  height="3"  fill={b} />
        <rect x="10" y="20" width="3"  height="3"  fill={b} />
        <rect x="13" y="11" width="2"  height="5"  fill={b} />
        <text x="0"  y="5"  fontSize="7" fill="#facc15" fontFamily="monospace">!</text>
      </svg>
    );
  } else if (state === "happy") {
    svg = (
      <svg viewBox="0 0 18 24" width="36" height="48" style={{ imageRendering: "pixelated" }}>
        <rect x="3"  y="9"  width="10" height="10" rx="2" fill={b} />
        <rect x="3"  y="3"  width="10" height="8"  rx="2" fill={l} />
        <rect x="3"  y="1"  width="3"  height="4"  fill={l} />
        <rect x="10" y="1"  width="3"  height="4"  fill={l} />
        <rect x="4"  y="2"  width="2"  height="2"  fill={v} />
        <rect x="11" y="2"  width="2"  height="2"  fill={v} />
        {/* ^ ^ happy eyes */}
        <rect x="4"  y="6"  width="3"  height="1"  fill={d} />
        <rect x="9"  y="6"  width="3"  height="1"  fill={d} />
        <rect x="4"  y="5"  width="1"  height="1"  fill={d} />
        <rect x="12" y="5"  width="1"  height="1"  fill={d} />
        {/* smile */}
        <rect x="6"  y="9"  width="1"  height="1"  fill={d} />
        <rect x="7"  y="10" width="2"  height="1"  fill={d} />
        <rect x="9"  y="9"  width="1"  height="1"  fill={d} />
        <rect x="3"  y="19" width="3"  height="3"  fill={b} />
        <rect x="10" y="19" width="3"  height="3"  fill={b} />
        {/* tail high */}
        <rect x="13" y="7"  width="2"  height="8"  fill={b} />
        <rect x="14" y="5"  width="2"  height="3"  fill={b} />
        <text x="13" y="4"  fontSize="5" fill="#f472b6" fontFamily="monospace">♥</text>
      </svg>
    );
  } else if (state === "sit" || state === "drag") {
    svg = (
      <svg viewBox="0 0 16 20" width="32" height="40" style={{ imageRendering: "pixelated" }}>
        <rect x="3"  y="8"  width="10" height="10" rx="3" fill={b} />
        <rect x="3"  y="2"  width="10" height="8"  rx="2" fill={l} />
        <rect x="3"  y="0"  width="3"  height="4"  fill={l} />
        <rect x="10" y="0"  width="3"  height="4"  fill={l} />
        <rect x="4"  y="1"  width="2"  height="2"  fill={v} />
        <rect x="11" y="1"  width="2"  height="2"  fill={v} />
        <rect x="5"  y="4"  width="2"  height="2"  fill="#fff" />
        <rect x="9"  y="4"  width="2"  height="2"  fill="#fff" />
        <rect x="6"  y="5"  width="1"  height="1"  fill="#3b0764" />
        <rect x="10" y="5"  width="1"  height="1"  fill="#3b0764" />
        <rect x="7"  y="6"  width="2"  height="1"  fill={pk} />
        <rect x="4"  y="16" width="3"  height="2"  rx="1" fill={l} />
        <rect x="9"  y="16" width="3"  height="2"  rx="1" fill={l} />
        <rect x="13" y="12" width="2"  height="4"  fill={b} />
        <rect x="11" y="15" width="2"  height="2"  fill={b} />
      </svg>
    );
  } else if (state === "run") {
    const l1 = step ? 15 : 18, l2 = step ? 18 : 15;
    svg = (
      <svg viewBox="0 0 22 22" width="44" height="44" style={{ imageRendering: "pixelated" }}>
        {/* leaning body */}
        <rect x="6"  y="7"  width="12" height="8"  rx="2" fill={b} />
        {/* head pushed forward */}
        <rect x="8"  y="2"  width="11" height="7"  rx="2" fill={l} />
        <rect x="8"  y="0"  width="3"  height="4"  fill={l} />
        <rect x="15" y="0"  width="3"  height="4"  fill={l} />
        <rect x="9"  y="1"  width="2"  height="2"  fill={v} />
        <rect x="16" y="1"  width="2"  height="2"  fill={v} />
        {/* focused eyes */}
        <rect x="10" y="3"  width="2"  height="2"  fill="#fff" />
        <rect x="15" y="3"  width="2"  height="2"  fill="#fff" />
        <rect x="11" y="4"  width="1"  height="1"  fill="#3b0764" />
        <rect x="16" y="4"  width="1"  height="1"  fill="#3b0764" />
        {/* spread legs */}
        <rect x="4"  y={l1} width="3"  height="5"  fill={b} />
        <rect x="10" y={l2} width="3"  height="5"  fill={b} />
        {/* speed lines */}
        <rect x="0"  y="8"  width="7"  height="2"  fill={b} />
        <rect x="0"  y="11" width="5"  height="1"  fill={b} style={{ opacity: 0.5 }} />
        <rect x="0"  y="6"  width="4"  height="1"  fill={b} style={{ opacity: 0.3 }} />
      </svg>
    );
  } else {
    // walk / idle
    const l1y = step ? 15 : 17, l2y = step ? 17 : 15;
    const lh1 = step ? 4  : 2,  lh2 = step ? 2  : 4;
    svg = (
      <svg viewBox="0 0 16 22" width="32" height="44" style={{ imageRendering: "pixelated" }}>
        <rect x="3"  y="9"  width="10" height="9"  rx="2" fill={b} />
        <rect x="3"  y="3"  width="10" height="7"  rx="2" fill={l} />
        <rect x="3"  y="1"  width="3"  height="4"  fill={l} />
        <rect x="10" y="1"  width="3"  height="4"  fill={l} />
        <rect x="4"  y="2"  width="2"  height="2"  fill={v} />
        <rect x="11" y="2"  width="2"  height="2"  fill={v} />
        <rect x="4"  y="5"  width="2"  height="2"  fill="#fff" />
        <rect x="9"  y="5"  width="2"  height="2"  fill="#fff" />
        <rect x="5"  y="6"  width="1"  height="1"  fill="#3b0764" />
        <rect x="10" y="6"  width="1"  height="1"  fill="#3b0764" />
        <rect x="7"  y="7"  width="2"  height="1"  fill={pk} />
        <rect x="4"  y={l1y} width="3" height={lh1} fill={b} />
        <rect x="9"  y={l2y} width="3" height={lh2} fill={b} />
        <rect x="13" y="11" width="2"  height="4"  fill={b} />
        <rect x="14" y="10" width="2"  height="2"  fill={b} />
      </svg>
    );
  }

  return (
    <div style={{ transform: dir === "left" ? "scaleX(-1)" : undefined, display: "inline-block" }}>
      {svg}
    </div>
  );
}

/* ── PixelPet ─────────────────────────────────────────────────── */
const SPEED_WALK = 1.8;
const SPEED_RUN  = 5.0;
const IDLE_MS    = 10_000;
const SLEEP_MS   = 25_000;
const PET_W      = 50;

export function PixelPet() {
  const [pos,      setPos]      = useState({ x: 120, y: -1 }); // y=-1 = fixed bottom
  const [dir,      setDir]      = useState<Dir>("right");
  const [state,    setState]    = useState<State>("walk");
  const [frame,    setFrame]    = useState(0);
  const [bubble,   setBubble]   = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [mounted,  setMounted]  = useState(false);

  // Refs to avoid stale closures in RAF
  const posRef        = useRef({ x: 120, y: -1 });
  const dirRef        = useRef<Dir>("right");
  const stateRef      = useRef<State>("walk");
  const mouseXRef     = useRef(200);
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const rafRef        = useRef<number>(0);
  const frameCountRef = useRef(0);
  const clickCountRef = useRef(0);
  const lastClickRef  = useRef(0);
  const idleTimerRef  = useRef<ReturnType<typeof setTimeout>>();
  const sleepTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const bubbleTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const showBubble = useCallback((msg: string, duration = 2200) => {
    clearTimeout(bubbleTimerRef.current);
    setBubble(msg);
    bubbleTimerRef.current = setTimeout(() => setBubble(null), duration);
  }, []);

  const setTempState = useCallback((s: State, duration: number) => {
    stateRef.current = s;
    setState(s);
    setTimeout(() => {
      if (stateRef.current === s) {
        stateRef.current = "walk";
        setState("walk");
      }
    }, duration);
  }, []);

  const resetIdleTimers = useCallback(() => {
    clearTimeout(idleTimerRef.current);
    clearTimeout(sleepTimerRef.current);
    idleTimerRef.current  = setTimeout(() => {
      if (!isDraggingRef.current && !["happy", "surprised"].includes(stateRef.current)) {
        stateRef.current = "idle"; setState("idle");
      }
    }, IDLE_MS);
    sleepTimerRef.current = setTimeout(() => {
      if (!isDraggingRef.current && !["happy", "surprised"].includes(stateRef.current)) {
        stateRef.current = "sleep"; setState("sleep");
        showBubble(SLEEP_MSGS[Math.floor(Math.random() * SLEEP_MSGS.length)], 4000);
      }
    }, SLEEP_MS);
  }, [showBubble]);

  // Main RAF loop
  useEffect(() => {
    setMounted(true);
    resetIdleTimers();

    function loop() {
      frameCountRef.current++;

      // Leg animation frame (every 8 RAF frames ≈ 7.5fps)
      if (frameCountRef.current % 8 === 0) {
        setFrame(f => f + 1);
      }

      if (!isDraggingRef.current) {
        const blocked = ["happy", "surprised", "sleep"].includes(stateRef.current);
        const targetX = Math.max(0, Math.min(
          window.innerWidth - PET_W,
          mouseXRef.current - PET_W / 2,
        ));
        const dx   = targetX - posRef.current.x;
        const dist = Math.abs(dx);

        if (!blocked) {
          let newState: State = "sit";
          let speed = 0;

          if (dist > 250)       { newState = "run";  speed = SPEED_RUN; }
          else if (dist > 40)   { newState = "walk"; speed = SPEED_WALK; }
          else if (dist > 8)    { newState = "walk"; speed = 0.7; }

          if (newState !== stateRef.current) {
            stateRef.current = newState;
            setState(newState);
          }

          if (speed > 0) {
            const step = Math.sign(dx) * Math.min(speed, dist);
            posRef.current.x = Math.max(0, Math.min(window.innerWidth - PET_W, posRef.current.x + step));
            setPos({ x: posRef.current.x, y: posRef.current.y });

            const newDir: Dir = dx > 0 ? "right" : "left";
            if (newDir !== dirRef.current) {
              dirRef.current = newDir;
              setDir(newDir);
            }
          }
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(idleTimerRef.current);
      clearTimeout(sleepTimerRef.current);
      clearTimeout(bubbleTimerRef.current);
    };
  }, [resetIdleTimers]);

  // Track mouse position
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseXRef.current = e.clientX;
      // Wake from sleep
      if (stateRef.current === "sleep" || stateRef.current === "idle") {
        stateRef.current = "walk";
        setState("walk");
        setBubble(null);
      }
      resetIdleTimers();
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [resetIdleTimers]);

  // Scroll = surprised
  useEffect(() => {
    let lastScroll = 0;
    const onWheel = (e: WheelEvent) => {
      const now = Date.now();
      if (now - lastScroll < 300 && Math.abs(e.deltaY) > 40) {
        setTempState("surprised", 1500);
        showBubble("!!! 😱", 1500);
      }
      lastScroll = now;
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, [setTempState, showBubble]);

  // Drag handlers
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    dragOffsetRef.current = {
      x: e.clientX - posRef.current.x,
      y: e.clientY - (window.innerHeight - 60),
    };
    stateRef.current = "drag";
    setState("drag");
    showBubble(DRAG_MSGS[Math.floor(Math.random() * DRAG_MSGS.length)], 2000);

    function onMove(ev: MouseEvent) {
      if (!isDraggingRef.current) return;
      const newX = Math.max(0, Math.min(window.innerWidth - PET_W, ev.clientX - dragOffsetRef.current.x));
      const newY = ev.clientY;
      posRef.current = { x: newX, y: newY };
      setPos({ x: newX, y: newY });
      dirRef.current = ev.movementX > 0 ? "right" : ev.movementX < 0 ? "left" : dirRef.current;
      setDir(dirRef.current);
    }

    function onUp() {
      isDraggingRef.current = false;
      posRef.current.y = -1;
      setPos(p => ({ x: p.x, y: -1 }));
      stateRef.current = "happy";
      setState("happy");
      showBubble("Freedom!! 😤", 1500);
      setTimeout(() => { stateRef.current = "walk"; setState("walk"); }, 1500);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [showBubble]);

  // Click handler with double-click detection
  const handleClick = useCallback(() => {
    const now = Date.now();
    const isDouble = now - lastClickRef.current < 300;
    lastClickRef.current = now;

    clickCountRef.current++;
    const count = clickCountRef.current;

    // Easter egg overrides
    if (EASTER_EGGS[count]) {
      stateRef.current = "happy";
      setState("happy");
      showBubble(EASTER_EGGS[count], 3000);
      setTimeout(() => { stateRef.current = "walk"; setState("walk"); }, 3000);
      resetIdleTimers();
      return;
    }

    if (isDouble) {
      // Double-click = spin!
      setSpinning(true);
      showBubble(DOUBLE_CLICK_MSGS[Math.floor(Math.random() * DOUBLE_CLICK_MSGS.length)], 700);
      setTimeout(() => setSpinning(false), 700);
      return;
    }

    // Single click = happy + message
    stateRef.current = "happy";
    setState("happy");
    const msg = CLICK_MSGS[Math.floor(Math.random() * CLICK_MSGS.length)];
    showBubble(msg);
    resetIdleTimers();
    setTimeout(() => { stateRef.current = "walk"; setState("walk"); }, 2000);
  }, [showBubble, resetIdleTimers]);

  if (!mounted) return null;

  const isDragging = pos.y !== -1;

  const style: React.CSSProperties = isDragging
    ? { position: "fixed", left: pos.x, top: pos.y - 40, zIndex: 201, cursor: "grabbing" }
    : { position: "fixed", bottom: 16, left: pos.x, zIndex: 200, cursor: "grab",
        transition: "left 0.016s linear" };

  return (
    <>
      {/* keyframe for spin */}
      <style>{`
        @keyframes petSpin {
          0%   { transform: rotate(0deg) scale(1.1); }
          50%  { transform: rotate(360deg) scale(1.3); }
          100% { transform: rotate(720deg) scale(1); }
        }
        .pet-spinning { animation: petSpin 0.65s cubic-bezier(0.36,0.07,0.19,0.97); }
      `}</style>

      <div
        style={style}
        onClick={handleClick}
        onMouseDown={onMouseDown}
        title="Click me! Drag me! Double-click me!"
        className="select-none"
      >
        {/* Speech bubble - not flipped with sprite */}
        {bubble && (
          <div
            className="absolute -top-11 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-xl border border-iris/40 bg-surface-2 px-3 py-1.5 font-mono text-[11px] text-iris shadow-lg"
            style={{ zIndex: 1 }}
          >
            {bubble}
            <div className="absolute -bottom-1.5 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-b border-r border-iris/40 bg-surface-2" />
          </div>
        )}

        {/* Sprite wrapper — spinning class applied here */}
        <div
          className={spinning ? "pet-spinning" : ""}
          style={{ transformOrigin: "center center" }}
        >
          <Sprite state={state} dir={dir} frame={frame} />
        </div>

        {/* Drag shadow */}
        {isDragging && (
          <div
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-2 w-8 rounded-full bg-black/30 blur-sm"
          />
        )}
      </div>
    </>
  );
}
