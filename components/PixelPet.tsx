"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/* ── Types ──────────────────────────────────────────────────────── */
type Mode  = "floor" | "drag" | "jumping" | "perched";
type State = "walk" | "run" | "idle" | "sleep" | "happy" | "surprised" | "sit" | "jump";
type Dir   = "left" | "right";

interface JumpData {
  sx: number; sy: number;
  ex: number; ey: number;
  arcH: number; dur: number;
  t0: number;
  onDone: () => void;
}

interface ElInfo {
  kind: "button" | "link" | "input" | "media" | "heading" | "nav" | "large" | "surface";
  msg: string;
  stay: number;
}

/* ── Constants ──────────────────────────────────────────────────── */
const PET_W        = 48;
const PET_H        = 44;
const FLOOR_BTM    = 16;
const WALK_SPEED   = 1.8;
const RUN_SPEED    = 5.5;
const IDLE_MS      = 10_000;
const SLEEP_MS     = 25_000;

/* ── Message banks ──────────────────────────────────────────────── */
const CLICK_MSGS = [
  "Meow! 🐾", "It's not a bug, it's a feature 🐛",
  "Have you tried turning it off? 🔌", "git commit -m 'fixed everything' 😅",
  "Works on MY machine 🤷", "undefined is not a function 😭",
  "// TODO: pet me (never)", "npm install happiness --save 💾",
  "TypeScript or bust 💜", "Stack Overflow is my co-pilot 🙏",
  "Cannot center div... 😤", "I pushed to prod on Friday 💀",
  "Feed me or I'll merge main 😈", "404: belly rubs not found",
  "*knocks your code off the desk*", "Senior dev energy 👨‍💻",
  "I've been here since npm v2", "This is fine. 🔥",
  "I linted your code. It's bad. 🚨", "Next.js go brrr 🚀",
  "console.log('pet me') → undefined", "Ship it! 🚢",
  "const me = 'not a bug' as const", "I dream in async/await 💭",
];
const DOUBLE_MSGS  = ["WHEEEEE 🌀", "ZOOOOM!", "YEET 🚀", "MAXIMUM SPEED 💨", "THIS IS FINE 🔥"];
const DRAG_MSGS    = ["PUT ME DOWN 😤", "Hooman! I can walk!!", "UNDIGNIFIED! 😾", "I am NOT a cursor!", "I'll bite ur keyboard!"];
const LAND_MSGS    = ["Nailed it! 🐾", "THUMP! Ow... 💫", "Cat landing: ✅", "I'm a professional 😎", "10/10 🎯", "Geronimo done 🐱"];
const SLEEP_MSGS   = ["zzz... zz...", "shhh... 🌙", "*purring intensifies*", "dreaming of 0 bugs..."];
const TYPE_MSGS    = ["tap tap tap 🐾", "fjdksafjdksa", "meow meow meow", "*cat typing detected*", "I wrote ur code 😏"];
const BORED_MSGS   = ["boring... 😑", "OK I'm leaving", "byeee 🐾", "Enough of this", "I found better spot"];

const EASTER_EGGS: Record<number, string> = {
  5:   "5 clicks! Am I a button?? 🤔",
  10:  "10 times! Not a stress ball!",
  20:  "20 CLICKS. Logging this 📝",
  50:  "50 CLICKS?! You need help 🆘",
  100: "100 clicks. Called HR 📞",
};

/* ── Element detector ───────────────────────────────────────────── */
function detectEl(el: Element): ElInfo | null {
  const tag  = el.tagName.toLowerCase();
  const role = el.getAttribute("role") ?? "";
  const rect = el.getBoundingClientRect();
  if (rect.width < 30 || rect.height < 10) return null;
  if (["html","body","script","style","meta"].includes(tag)) return null;

  if (tag === "button" || role === "button" || tag === "select")
    return { kind: "button",  msg: "Ooh a button! Should I press it? 👆", stay: 10000 };
  if ((tag === "a" && (el as HTMLAnchorElement).href) || role === "link")
    return { kind: "link",    msg: "Where does this link go? 🔗",          stay: 9000  };
  if (tag === "input" || tag === "textarea")
    return { kind: "input",   msg: "Let me type for you! 🐾",              stay: 13000 };
  if (tag === "img" || tag === "video" || tag === "canvas")
    return { kind: "media",   msg: "Staring contest... 👁️ I win.",        stay: 12000 };
  if (/^h[1-6]$/.test(tag))
    return { kind: "heading", msg: "Nice title! Mine now 😤",              stay: 9000  };
  if (tag === "nav" || role === "navigation")
    return { kind: "nav",     msg: "I'm in the nav now 🗺️",               stay: 8000  };
  if (rect.width > 180 && rect.height > 90)
    return { kind: "large",   msg: "This looks comfy 😴",                  stay: 20000 };
  if (rect.width > 50 && rect.height > 24)
    return { kind: "surface", msg: "Found a nice spot! 🐾",                stay: 9000  };
  return null;
}

/* ── Sprite ─────────────────────────────────────────────────────── */
function Sprite({ state, dir, frame }: { state: State; dir: Dir; frame: number }) {
  const step = frame % 2 === 0;
  const b  = "#a78bfa", l  = "#c4b5fd", v = "#e9d5ff";
  const d  = "#7c3aed", pk = "#f9a8d4";
  let inner: React.ReactElement;

  if (state === "sleep") {
    inner = (
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
    inner = (
      <svg viewBox="0 0 16 24" width="32" height="48" style={{ imageRendering: "pixelated" }}>
        <rect x="3"  y="9"  width="10" height="12" rx="2" fill={b} />
        <rect x="3"  y="2"  width="10" height="9"  rx="2" fill={l} />
        <rect x="2"  y="0"  width="3"  height="4"  fill={l} />
        <rect x="11" y="0"  width="3"  height="4"  fill={l} />
        <rect x="3"  y="1"  width="2"  height="2"  fill={v} />
        <rect x="12" y="1"  width="2"  height="2"  fill={v} />
        <rect x="4"  y="4"  width="3"  height="3"  fill="#fff" />
        <rect x="9"  y="4"  width="3"  height="3"  fill="#fff" />
        <rect x="5"  y="5"  width="1"  height="1"  fill="#000" />
        <rect x="10" y="5"  width="1"  height="1"  fill="#000" />
        <rect x="7"  y="9"  width="2"  height="2"  fill={d} />
        <rect x="3"  y="20" width="3"  height="3"  fill={b} />
        <rect x="10" y="20" width="3"  height="3"  fill={b} />
        <rect x="13" y="11" width="2"  height="5"  fill={b} />
        <text x="0"  y="5"  fontSize="7" fill="#facc15" fontFamily="monospace">!</text>
      </svg>
    );
  } else if (state === "jump") {
    inner = (
      <svg viewBox="0 0 20 26" width="40" height="52" style={{ imageRendering: "pixelated" }}>
        <rect x="5"  y="8"  width="10" height="9"  rx="2" fill={b} />
        <rect x="4"  y="2"  width="11" height="8"  rx="2" fill={l} />
        <rect x="3"  y="0"  width="3"  height="3"  fill={l} />
        <rect x="13" y="0"  width="3"  height="3"  fill={l} />
        <rect x="4"  y="1"  width="2"  height="2"  fill={v} />
        <rect x="14" y="1"  width="2"  height="2"  fill={v} />
        {/* wide excited eyes */}
        <rect x="5"  y="4"  width="3"  height="3"  fill="#fff" />
        <rect x="11" y="4"  width="3"  height="3"  fill="#fff" />
        <rect x="6"  y="5"  width="1"  height="1"  fill="#3b0764" />
        <rect x="12" y="5"  width="1"  height="1"  fill="#3b0764" />
        <rect x="8"  y="8"  width="2"  height="2"  fill={d} />
        {/* legs spread super wide */}
        <rect x="0"  y="19" width="4"  height="5"  fill={b} />
        <rect x="15" y="19" width="4"  height="5"  fill={b} />
        {/* tail streaming up */}
        <rect x="15" y="5"  width="2"  height="8"  fill={b} />
        <rect x="16" y="3"  width="2"  height="3"  fill={b} />
      </svg>
    );
  } else if (state === "happy") {
    inner = (
      <svg viewBox="0 0 18 24" width="36" height="48" style={{ imageRendering: "pixelated" }}>
        <rect x="3"  y="9"  width="10" height="10" rx="2" fill={b} />
        <rect x="3"  y="3"  width="10" height="8"  rx="2" fill={l} />
        <rect x="3"  y="1"  width="3"  height="4"  fill={l} />
        <rect x="10" y="1"  width="3"  height="4"  fill={l} />
        <rect x="4"  y="2"  width="2"  height="2"  fill={v} />
        <rect x="11" y="2"  width="2"  height="2"  fill={v} />
        <rect x="4"  y="6"  width="3"  height="1"  fill={d} />
        <rect x="9"  y="6"  width="3"  height="1"  fill={d} />
        <rect x="4"  y="5"  width="1"  height="1"  fill={d} />
        <rect x="12" y="5"  width="1"  height="1"  fill={d} />
        <rect x="6"  y="9"  width="1"  height="1"  fill={d} />
        <rect x="7"  y="10" width="2"  height="1"  fill={d} />
        <rect x="9"  y="9"  width="1"  height="1"  fill={d} />
        <rect x="3"  y="19" width="3"  height="3"  fill={b} />
        <rect x="10" y="19" width="3"  height="3"  fill={b} />
        <rect x="13" y="7"  width="2"  height="8"  fill={b} />
        <rect x="14" y="5"  width="2"  height="3"  fill={b} />
        <text x="13" y="4"  fontSize="5" fill="#f472b6" fontFamily="monospace">♥</text>
      </svg>
    );
  } else if (state === "sit") {
    inner = (
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
    inner = (
      <svg viewBox="0 0 22 22" width="44" height="44" style={{ imageRendering: "pixelated" }}>
        <rect x="6"  y="7"  width="12" height="8"  rx="2" fill={b} />
        <rect x="8"  y="2"  width="11" height="7"  rx="2" fill={l} />
        <rect x="8"  y="0"  width="3"  height="4"  fill={l} />
        <rect x="15" y="0"  width="3"  height="4"  fill={l} />
        <rect x="9"  y="1"  width="2"  height="2"  fill={v} />
        <rect x="16" y="1"  width="2"  height="2"  fill={v} />
        <rect x="10" y="3"  width="2"  height="2"  fill="#fff" />
        <rect x="15" y="3"  width="2"  height="2"  fill="#fff" />
        <rect x="11" y="4"  width="1"  height="1"  fill="#3b0764" />
        <rect x="16" y="4"  width="1"  height="1"  fill="#3b0764" />
        <rect x="4"  y={l1} width="3"  height="5"  fill={b} />
        <rect x="10" y={l2} width="3"  height="5"  fill={b} />
        <rect x="0"  y="8"  width="7"  height="2"  fill={b} />
        <rect x="0"  y="11" width="5"  height="1"  fill={b} style={{ opacity: 0.5 }} />
      </svg>
    );
  } else {
    const l1y = step ? 15 : 17, l2y = step ? 17 : 15;
    const lh1 = step ? 4  : 2,  lh2 = step ? 2  : 4;
    inner = (
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
      {inner}
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────── */
export function PixelPet() {
  const [pos,      setPos]      = useState({ x: 140, y: -1 }); // y=-1 = floor (CSS bottom)
  const [dir,      setDir]      = useState<Dir>("right");
  const [state,    setState]    = useState<State>("walk");
  const [frame,    setFrame]    = useState(0);
  const [bubble,   setBubble]   = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [mounted,  setMounted]  = useState(false);
  const [shadow,   setShadow]   = useState(false);

  // Refs — no stale closures in RAF
  const posRef         = useRef({ x: 140, y: -1 });
  const dirRef         = useRef<Dir>("right");
  const stateRef       = useRef<State>("walk");
  const modeRef        = useRef<Mode>("floor");
  const mouseXRef      = useRef(300);
  const jumpRef        = useRef<JumpData | null>(null);
  const perchElRef     = useRef<Element | null>(null);
  const perchElInfoRef = useRef<ElInfo | null>(null);
  const rafRef         = useRef(0);
  const frameCountRef  = useRef(0);
  const clickCountRef  = useRef(0);
  const lastClickRef   = useRef(0);
  const petDivRef      = useRef<HTMLDivElement>(null);
  const idleTimerRef   = useRef<ReturnType<typeof setTimeout>>();
  const sleepTimerRef  = useRef<ReturnType<typeof setTimeout>>();
  const perchTimerRef  = useRef<ReturnType<typeof setTimeout>>();
  const bubbleTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const typeIntervalRef = useRef<ReturnType<typeof setInterval>>();

  /* ── Helpers ── */
  const showBubble = useCallback((msg: string, dur = 2400) => {
    clearTimeout(bubbleTimerRef.current);
    setBubble(msg);
    bubbleTimerRef.current = setTimeout(() => setBubble(null), dur);
  }, []);

  const setMode = useCallback((m: Mode) => { modeRef.current = m; }, []);

  const floorY = useCallback(
    () => window.innerHeight - FLOOR_BTM - PET_H,
    [],
  );

  const resetIdleTimers = useCallback(() => {
    clearTimeout(idleTimerRef.current);
    clearTimeout(sleepTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      if (modeRef.current === "floor" && !["happy","surprised"].includes(stateRef.current)) {
        stateRef.current = "idle"; setState("idle");
      }
    }, IDLE_MS);
    sleepTimerRef.current = setTimeout(() => {
      if (modeRef.current === "floor" && !["happy","surprised"].includes(stateRef.current)) {
        stateRef.current = "sleep"; setState("sleep");
        showBubble(SLEEP_MSGS[Math.floor(Math.random() * SLEEP_MSGS.length)], 5000);
      }
    }, SLEEP_MS);
  }, [showBubble]);

  /* ── Jump animation launcher ── */
  const startJump = useCallback((
    sx: number, sy: number,
    ex: number, ey: number,
    arcH: number, dur: number,
    onDone: () => void,
  ) => {
    jumpRef.current = { sx, sy, ex, ey, arcH, dur, t0: performance.now(), onDone };
    modeRef.current = "jumping";
    stateRef.current = "jump";
    setState("jump");
  }, []);

  /* ── Jump to floor ── */
  const jumpToFloor = useCallback(() => {
    clearTimeout(perchTimerRef.current);
    clearInterval(typeIntervalRef.current);
    perchElRef.current = null;
    perchElInfoRef.current = null;

    const sx  = posRef.current.x;
    const sy  = posRef.current.y >= 0 ? posRef.current.y : floorY();
    const ex  = Math.max(0, Math.min(window.innerWidth - PET_W, mouseXRef.current - PET_W / 2));
    const ey  = floorY();
    const arcH = Math.max(60, Math.abs(sy - ey) * 0.4 + 50);

    showBubble(BORED_MSGS[Math.floor(Math.random() * BORED_MSGS.length)], 700);

    startJump(sx, sy, ex, ey, arcH, 650, () => {
      modeRef.current = "floor";
      posRef.current  = { x: ex, y: -1 };
      setPos({ x: ex, y: -1 });
      stateRef.current = "happy";
      setState("happy");
      showBubble(LAND_MSGS[Math.floor(Math.random() * LAND_MSGS.length)], 1500);
      setTimeout(() => { stateRef.current = "walk"; setState("walk"); }, 1500);
      resetIdleTimers();
    });
  }, [floorY, showBubble, startJump, resetIdleTimers]);

  /* ── Land on perch after drop ── */
  const landOnPerch = useCallback((el: Element, info: ElInfo) => {
    const rect = el.getBoundingClientRect();
    const minX = Math.max(0, rect.left + 4);
    const maxX = Math.min(window.innerWidth - PET_W, rect.right - PET_W - 4);
    if (maxX < minX) { jumpToFloor(); return; }

    const ex = minX + Math.random() * Math.max(0, maxX - minX);
    const ey = rect.top - PET_H - 2;
    if (ey < -PET_H * 2 || ey > window.innerHeight + 10) { jumpToFloor(); return; }

    const sx   = posRef.current.x;
    const sy   = posRef.current.y >= 0 ? posRef.current.y : floorY();
    const arcH = Math.max(80, Math.abs(sy - ey) * 0.55 + 60);

    startJump(sx, sy, ex, ey, arcH, 620, () => {
      modeRef.current = "perched";
      perchElRef.current = el;
      perchElInfoRef.current = info;
      posRef.current = { x: ex, y: ey };
      setPos({ x: ex, y: ey });
      stateRef.current = "sit";
      setState("sit");
      showBubble(info.msg, 2800);

      // Perch-specific behaviors
      if (info.kind === "input") {
        let ti = 0;
        typeIntervalRef.current = setInterval(() => {
          if (modeRef.current !== "perched") { clearInterval(typeIntervalRef.current); return; }
          showBubble(TYPE_MSGS[ti % TYPE_MSGS.length], 1800);
          ti++;
        }, 3500);
      }

      if (info.kind === "button") {
        setTimeout(() => {
          if (modeRef.current !== "perched") return;
          showBubble("*tap tap tap* 👆", 1800);
        }, 3500);
      }

      if (info.kind === "large") {
        setTimeout(() => {
          if (modeRef.current !== "perched") return;
          stateRef.current = "sleep";
          setState("sleep");
          showBubble("zzzz... 💤", 5000);
        }, 2500);
      }

      if (info.kind === "media") {
        setTimeout(() => {
          if (modeRef.current !== "perched") return;
          showBubble("👁️ ...I blinked. You lost.", 2000);
        }, 4000);
      }

      if (info.kind === "heading") {
        setTimeout(() => {
          if (modeRef.current !== "perched") return;
          showBubble("*pushes heading off the page*", 2000);
        }, 3500);
      }

      if (info.kind === "nav") {
        setTimeout(() => {
          if (modeRef.current !== "perched") return;
          showBubble("I'm navigating 🗺️ do not disturb", 2200);
        }, 3000);
      }

      if (info.kind === "link") {
        setTimeout(() => {
          if (modeRef.current !== "perched") return;
          showBubble("I'm not clicking that 🔗", 2000);
        }, 3000);
      }

      // Schedule auto-return to floor
      perchTimerRef.current = setTimeout(() => {
        if (modeRef.current === "perched") jumpToFloor();
      }, info.stay + Math.random() * 5000);
    });
  }, [floorY, startJump, showBubble, jumpToFloor]);

  /* ── Main RAF loop ── */
  useEffect(() => {
    setMounted(true);
    resetIdleTimers();

    function loop() {
      frameCountRef.current++;

      // Leg animation frame ~7fps
      if (frameCountRef.current % 9 === 0) {
        setFrame(f => f + 1);
      }

      // ── Jump animation ──
      if (jumpRef.current) {
        const j = jumpRef.current;
        const raw = Math.min(1, (performance.now() - j.t0) / j.dur);
        // ease-in-out for horizontal, raw parabola for vertical
        const ease = raw < 0.5 ? 2 * raw * raw : -1 + (4 - 2 * raw) * raw;
        const x = j.sx + (j.ex - j.sx) * ease;
        const baseY = j.sy + (j.ey - j.sy) * raw;
        const y = baseY - j.arcH * 4 * raw * (1 - raw);

        posRef.current = { x, y };
        setPos({ x, y });

        if (j.ex !== j.sx) {
          const nd: Dir = j.ex > j.sx ? "right" : "left";
          if (nd !== dirRef.current) { dirRef.current = nd; setDir(nd); }
        }

        if (raw >= 1) { jumpRef.current = null; j.onDone(); }
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      // ── Perch: track element as page scrolls ──
      if (modeRef.current === "perched" && perchElRef.current) {
        const rect = perchElRef.current.getBoundingClientRect();
        const ey = rect.top - PET_H - 2;
        // Clamp x within element
        const minX = Math.max(0, rect.left + 4);
        const maxX = Math.min(window.innerWidth - PET_W, rect.right - PET_W - 4);
        const clampedX = Math.min(Math.max(posRef.current.x, minX), Math.max(minX, maxX));

        if (Math.abs(ey - posRef.current.y) > 0.5 || Math.abs(clampedX - posRef.current.x) > 0.5) {
          posRef.current = { x: clampedX, y: ey };
          setPos({ x: clampedX, y: ey });
        }
        // Element scrolled off-screen → jump back
        if (rect.top > window.innerHeight + 60 || rect.bottom < -60) {
          jumpToFloor();
        }
      }

      // ── Floor: chase cursor ──
      if (modeRef.current === "floor") {
        const blocked = ["happy","surprised","sleep"].includes(stateRef.current);
        if (!blocked) {
          const targetX = Math.max(0, Math.min(window.innerWidth - PET_W, mouseXRef.current - PET_W / 2));
          const dx   = targetX - posRef.current.x;
          const dist = Math.abs(dx);
          let ns: State = "sit";
          let sp = 0;
          if (dist > 250)       { ns = "run";  sp = RUN_SPEED;  }
          else if (dist > 40)   { ns = "walk"; sp = WALK_SPEED; }
          else if (dist > 8)    { ns = "walk"; sp = 0.8;        }
          if (ns !== stateRef.current) { stateRef.current = ns; setState(ns); }
          if (sp > 0) {
            const step = Math.sign(dx) * Math.min(sp, dist);
            posRef.current.x = Math.max(0, Math.min(window.innerWidth - PET_W, posRef.current.x + step));
            setPos({ x: posRef.current.x, y: -1 });
            const nd: Dir = dx > 0 ? "right" : "left";
            if (nd !== dirRef.current) { dirRef.current = nd; setDir(nd); }
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
      clearTimeout(perchTimerRef.current);
      clearTimeout(bubbleTimerRef.current);
      clearInterval(typeIntervalRef.current);
    };
  }, [resetIdleTimers, jumpToFloor]);

  /* ── Mouse tracking & wake ── */
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseXRef.current = e.clientX;
      if (modeRef.current === "floor" && ["sleep","idle"].includes(stateRef.current)) {
        stateRef.current = "walk"; setState("walk"); setBubble(null);
      }
      resetIdleTimers();
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [resetIdleTimers]);

  /* ── Scroll → surprised ── */
  useEffect(() => {
    let last = 0;
    const onWheel = (e: WheelEvent) => {
      const now = Date.now();
      if (now - last < 250 && Math.abs(e.deltaY) > 50 && modeRef.current === "floor") {
        stateRef.current = "surprised"; setState("surprised");
        showBubble("!!! 😱", 1200);
        setTimeout(() => {
          if (stateRef.current === "surprised") { stateRef.current = "walk"; setState("walk"); }
        }, 1400);
      }
      last = now;
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, [showBubble]);

  /* ── Drag ── */
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (modeRef.current === "jumping") return;
    e.preventDefault();

    clearTimeout(perchTimerRef.current);
    clearInterval(typeIntervalRef.current);
    perchElRef.current = null;
    perchElInfoRef.current = null;
    modeRef.current = "drag";
    stateRef.current = "sit";
    setState("sit");
    setShadow(true);
    showBubble(DRAG_MSGS[Math.floor(Math.random() * DRAG_MSGS.length)], 2000);

    const startX = e.clientX - posRef.current.x;
    const startY = e.clientY - (posRef.current.y >= 0 ? posRef.current.y : floorY());

    function onMove(ev: MouseEvent) {
      if (modeRef.current !== "drag") return;
      const nx = Math.max(0, Math.min(window.innerWidth  - PET_W, ev.clientX - startX));
      const ny = Math.max(0, Math.min(window.innerHeight - PET_H, ev.clientY - startY));
      posRef.current = { x: nx, y: ny };
      setPos({ x: nx, y: ny });
      if (ev.movementX !== 0) {
        const nd: Dir = ev.movementX > 0 ? "right" : "left";
        if (nd !== dirRef.current) { dirRef.current = nd; setDir(nd); }
      }
    }

    function onUp(ev: MouseEvent) {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onUp);
      setShadow(false);
      if (modeRef.current !== "drag") return;

      // Find element under drop point (exclude the pet widget itself)
      const dropX = ev.clientX;
      const dropY = ev.clientY + PET_H * 0.6; // cat's feet
      const all   = document.elementsFromPoint(dropX, dropY);
      const target = all.find(el =>
        !petDivRef.current?.contains(el) &&
        el !== petDivRef.current &&
        !["html","body"].includes(el.tagName.toLowerCase()),
      );

      const info = target ? detectEl(target) : null;

      if (target && info) {
        landOnPerch(target, info);
      } else {
        // Just land on floor
        const fx = Math.max(0, Math.min(window.innerWidth - PET_W, dropX - PET_W / 2));
        const fy = floorY();
        const cx = posRef.current.x;
        const cy = posRef.current.y >= 0 ? posRef.current.y : fy;
        const arcH = Math.max(40, Math.abs(cy - fy) * 0.3 + 30);
        startJump(cx, cy, fx, fy, arcH, 400, () => {
          modeRef.current = "floor";
          posRef.current  = { x: fx, y: -1 };
          setPos({ x: fx, y: -1 });
          stateRef.current = "happy";
          setState("happy");
          showBubble("Freedom!! 😤", 1400);
          setTimeout(() => { stateRef.current = "walk"; setState("walk"); }, 1400);
          resetIdleTimers();
        });
      }
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
  }, [floorY, landOnPerch, startJump, showBubble, resetIdleTimers]);

  /* ── Click / double-click ── */
  const handleClick = useCallback(() => {
    if (modeRef.current === "jumping") return;
    const now = Date.now();
    const isDouble = now - lastClickRef.current < 320;
    lastClickRef.current = now;

    clickCountRef.current++;
    const count = clickCountRef.current;

    if (EASTER_EGGS[count]) {
      stateRef.current = "happy"; setState("happy");
      showBubble(EASTER_EGGS[count], 3200);
      setTimeout(() => { stateRef.current = "walk"; setState("walk"); }, 3200);
      if (modeRef.current === "floor") resetIdleTimers();
      return;
    }

    if (isDouble) {
      setSpinning(true);
      showBubble(DOUBLE_MSGS[Math.floor(Math.random() * DOUBLE_MSGS.length)], 700);
      setTimeout(() => setSpinning(false), 700);
      return;
    }

    // If perched and clicked → jump back early
    if (modeRef.current === "perched") {
      showBubble("OK OK I'm going! 😾", 800);
      setTimeout(() => jumpToFloor(), 900);
      return;
    }

    stateRef.current = "happy"; setState("happy");
    showBubble(CLICK_MSGS[Math.floor(Math.random() * CLICK_MSGS.length)]);
    if (modeRef.current === "floor") resetIdleTimers();
    setTimeout(() => { if (stateRef.current === "happy") { stateRef.current = "walk"; setState("walk"); } }, 2000);
  }, [showBubble, resetIdleTimers, jumpToFloor]);

  if (!mounted) return null;

  const isFloor = pos.y === -1;
  const style: React.CSSProperties = isFloor
    ? { position: "fixed", bottom: FLOOR_BTM, left: pos.x, zIndex: 200, transition: "left 0.016s linear" }
    : { position: "fixed", top:    pos.y,     left: pos.x, zIndex: 200 };

  return (
    <>
      <style>{`
        @keyframes petSpin {
          0%   { transform: rotate(0deg)   scale(1); }
          50%  { transform: rotate(360deg) scale(1.4); }
          100% { transform: rotate(720deg) scale(1); }
        }
        .pet-spin { animation: petSpin 0.65s cubic-bezier(0.36,0.07,0.19,0.97); }
      `}</style>

      <div
        ref={petDivRef}
        style={style}
        onClick={handleClick}
        onMouseDown={onMouseDown}
        title="Click · Double-click · Drag me onto anything!"
        className="select-none"
      >
        {/* Speech bubble */}
        {bubble && (
          <div
            className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-xl border border-iris/40 bg-surface-2 px-3 py-1.5 font-mono text-[11px] text-iris shadow-lg pointer-events-none"
            style={{ zIndex: 1 }}
          >
            {bubble}
            <div className="absolute -bottom-1.5 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-b border-r border-iris/40 bg-surface-2" />
          </div>
        )}

        {/* Sprite */}
        <div
          className={spinning ? "pet-spin" : ""}
          style={{ transformOrigin: "center center" }}
        >
          <Sprite state={state} dir={dir} frame={frame} />
        </div>

        {/* Drag shadow */}
        {shadow && (
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 h-2 w-10 rounded-full bg-black/25 blur-sm" />
        )}
      </div>
    </>
  );
}
