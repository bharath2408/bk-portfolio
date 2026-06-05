"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

interface Particle {
  x:     number;
  y:     number;
  vx:    number;
  vy:    number;
  life:  number;   // 1 → 0
  decay: number;
  r:     number;   // radius
  color: string;
}

const COLORS = [
  "#7C5CFF", // iris
  "#22D3EE", // cyan
  "#34D399", // mint
  "#A78BFA", // violet
  "#67E8F9", // sky
];
const MAX_PARTICLES = 60;

export default function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ptcls     = useRef<Particle[]>([]);
  const rafRef    = useRef(0);
  const reduced   = useReducedMotion();
  // Mount-gate: never render the canvas during SSR to avoid hydration mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || reduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    /* Size the canvas to the viewport */
    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    /* Spawn 1-2 particles per mousemove */
    const onMove = (e: MouseEvent) => {
      const count = 1 + (Math.random() > 0.55 ? 1 : 0);
      for (let i = 0; i < count; i++) {
        if (ptcls.current.length >= MAX_PARTICLES) break;
        ptcls.current.push({
          x:     e.clientX + (Math.random() - 0.5) * 6,
          y:     e.clientY + (Math.random() - 0.5) * 6,
          vx:    (Math.random() - 0.5) * 1.4,
          vy:    (Math.random() - 0.5) * 1.4 - 0.5, // bias upward
          life:  1,
          decay: 0.022 + Math.random() * 0.028,
          r:     2 + Math.random() * 2.5,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
        });
      }
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    /* RAF render loop */
    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Remove dead particles
      ptcls.current = ptcls.current.filter(p => p.life > 0.02);

      for (const p of ptcls.current) {
        ctx.globalAlpha = p.life * 0.72;
        ctx.shadowBlur  = 10;
        ctx.shadowColor = p.color;
        ctx.fillStyle   = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
        ctx.fill();

        // Physics
        p.x    += p.vx;
        p.y    += p.vy;
        p.vy   -= 0.02;   // float upward over time
        p.vx   *= 0.98;   // light drag
        p.life -= p.decay;
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur  = 0;
      rafRef.current  = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [mounted, reduced]);

  if (!mounted || reduced) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[9990]"
    />
  );
}
