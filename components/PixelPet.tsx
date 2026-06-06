"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type PetState = "walk" | "idle" | "sleep" | "jump" | "happy";

/* ── Pixel cat SVG frames ── */
function CatSprite({ state, dir }: { state: PetState; dir: "left" | "right" }) {
  const flip = dir === "left" ? "scale(-1,1)" : "scale(1,1)";

  if (state === "sleep") {
    return (
      <svg viewBox="0 0 20 14" width="40" height="28" style={{ imageRendering: "pixelated" }}>
        {/* sleeping cat - curled up */}
        <rect x="4"  y="6"  width="12" height="6" rx="3" fill="#a78bfa"/>
        <rect x="2"  y="8"  width="4"  height="4" rx="2" fill="#a78bfa"/>
        <rect x="14" y="7"  width="4"  height="3" rx="1" fill="#a78bfa"/>
        <rect x="7"  y="4"  width="6"  height="5" rx="2" fill="#c4b5fd"/>
        {/* ears */}
        <rect x="7"  y="2"  width="2"  height="3" fill="#c4b5fd"/>
        <rect x="11" y="2"  width="2"  height="3" fill="#c4b5fd"/>
        {/* eyes closed */}
        <rect x="9"  y="5"  width="2"  height="1" fill="#7c3aed"/>
        {/* zzz */}
        <text x="14" y="4" fontSize="4" fill="#a78bfa" fontFamily="monospace">z</text>
        <text x="16" y="2" fontSize="3" fill="#a78bfa" fontFamily="monospace">z</text>
      </svg>
    );
  }

  if (state === "happy") {
    return (
      <svg viewBox="0 0 16 20" width="32" height="40" transform={flip} style={{ imageRendering: "pixelated" }}>
        <rect x="3"  y="5"  width="10" height="10" rx="2" fill="#a78bfa"/>
        <rect x="2"  y="1"  width="3"  height="5"  fill="#a78bfa"/>
        <rect x="11" y="1"  width="3"  height="5"  fill="#a78bfa"/>
        <rect x="3"  y="2"  width="2"  height="2"  fill="#c4b5fd"/>
        <rect x="11" y="2"  width="2"  height="2"  fill="#c4b5fd"/>
        {/* happy eyes */}
        <rect x="5"  y="8"  width="2"  height="1"  fill="#fff"/>
        <rect x="9"  y="8"  width="2"  height="1"  fill="#fff"/>
        {/* smile */}
        <rect x="6"  y="10" width="1"  height="1"  fill="#7c3aed"/>
        <rect x="7"  y="11" width="2"  height="1"  fill="#7c3aed"/>
        <rect x="9"  y="10" width="1"  height="1"  fill="#7c3aed"/>
        {/* legs - spread for jump */}
        <rect x="2"  y="15" width="3"  height="3"  fill="#a78bfa"/>
        <rect x="11" y="15" width="3"  height="3"  fill="#a78bfa"/>
        {/* tail up */}
        <rect x="13" y="8"  width="2"  height="5"  fill="#a78bfa"/>
        <rect x="14" y="6"  width="2"  height="3"  fill="#a78bfa"/>
        <rect x="13" y="5"  width="2"  height="2"  fill="#a78bfa"/>
        {/* heart */}
        <text x="0" y="4" fontSize="5" fill="#f472b6" fontFamily="monospace">♥</text>
      </svg>
    );
  }

  const legL = state === "walk" ? 2 : 1;
  const legR = state === "walk" ? 0 : 1;

  return (
    <svg viewBox="0 0 16 20" width="32" height="40" transform={flip} style={{ imageRendering: "pixelated" }}>
      {/* body */}
      <rect x="3"  y="8"  width="10" height="8"  rx="2" fill="#a78bfa"/>
      {/* head */}
      <rect x="3"  y="3"  width="10" height="7"  rx="2" fill="#c4b5fd"/>
      {/* ears */}
      <rect x="3"  y="1"  width="3"  height="4"  fill="#c4b5fd"/>
      <rect x="10" y="1"  width="3"  height="4"  fill="#c4b5fd"/>
      <rect x="4"  y="2"  width="2"  height="2"  fill="#e9d5ff"/>
      <rect x="11" y="2"  width="2"  height="2"  fill="#e9d5ff"/>
      {/* eyes */}
      <rect x="5"  y="6"  width="2"  height="2"  fill="#fff"/>
      <rect x="9"  y="6"  width="2"  height="2"  fill="#fff"/>
      <rect x="6"  y="7"  width="1"  height="1"  fill="#3b0764"/>
      <rect x="10" y="7"  width="1"  height="1"  fill="#3b0764"/>
      {/* nose */}
      <rect x="7"  y="8"  width="2"  height="1"  fill="#f9a8d4"/>
      {/* legs */}
      <rect x="4"  y={15 + legL} width="3" height={4 - legL} fill="#a78bfa"/>
      <rect x="9"  y={15 + legR} width="3" height={4 - legR} fill="#a78bfa"/>
      {/* tail */}
      <rect x="13" y="10" width="2"  height="4"  fill="#a78bfa"/>
      <rect x="14" y="9"  width="2"  height="2"  fill="#a78bfa"/>
    </svg>
  );
}

const SPEED    = 0.6;   // px per frame
const IDLE_MS  = 8000;  // go idle after 8s still
const SLEEP_MS = 20000; // sleep after 20s idle

export function PixelPet() {
  const [pos,     setPos]     = useState(120);
  const [dir,     setDir]     = useState<"left" | "right">("right");
  const [state,   setState]   = useState<PetState>("walk");
  const [bubble,  setBubble]  = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const idleTimer  = useRef<ReturnType<typeof setTimeout>>();
  const sleepTimer = useRef<ReturnType<typeof setTimeout>>();
  const rafRef     = useRef<number>();
  const posRef     = useRef(120);
  const dirRef     = useRef<"left"|"right">("right");
  const stateRef   = useRef<PetState>("walk");

  const MESSAGES = ["Meow! 🐾", "Pat me!", "I like TypeScript 💜", "Next.js is fast!", "Pet me~", "woof? no wait…", "…zzzz", "Need coffee ☕"];

  const resetIdleTimers = useCallback(() => {
    clearTimeout(idleTimer.current);
    clearTimeout(sleepTimer.current);
    idleTimer.current  = setTimeout(() => { setState("idle"); stateRef.current = "idle"; }, IDLE_MS);
    sleepTimer.current = setTimeout(() => { setState("sleep"); stateRef.current = "sleep"; }, SLEEP_MS);
  }, []);

  useEffect(() => {
    setMounted(true);
    resetIdleTimers();

    function loop() {
      if (stateRef.current !== "walk") { rafRef.current = requestAnimationFrame(loop); return; }
      const maxX = window.innerWidth - 48;
      let next = posRef.current + (dirRef.current === "right" ? SPEED : -SPEED);
      if (next >= maxX) { next = maxX; dirRef.current = "left"; setDir("left"); }
      if (next <= 0)    { next = 0;    dirRef.current = "right"; setDir("right"); }
      posRef.current = next;
      setPos(next);
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafRef.current!);
      clearTimeout(idleTimer.current);
      clearTimeout(sleepTimer.current);
    };
  }, [resetIdleTimers]);

  function handleClick() {
    setState("happy");
    stateRef.current = "happy";
    const msg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
    setBubble(msg);
    clearTimeout(idleTimer.current);
    clearTimeout(sleepTimer.current);

    setTimeout(() => {
      setState("walk");
      stateRef.current = "walk";
      setBubble(null);
      resetIdleTimers();
    }, 2000);
  }

  if (!mounted) return null;

  return (
    <div
      className="fixed bottom-4 z-[200] cursor-pointer select-none"
      style={{ left: pos, transition: "left 0.016s linear" }}
      onClick={handleClick}
      title="Click me!"
    >
      {bubble && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-xl border border-iris/40 bg-surface-2 px-3 py-1.5 font-mono text-[11px] text-iris shadow-lg">
          {bubble}
          <div className="absolute -bottom-1.5 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-b border-r border-iris/40 bg-surface-2" />
        </div>
      )}
      <CatSprite state={state} dir={dir} />
    </div>
  );
}
