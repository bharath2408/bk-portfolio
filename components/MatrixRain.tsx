"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";

const CHARS = "アイウエオカキクケコサシスセソタチツテト日本語ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*";

export function MatrixRain({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const fontSize = 15;
    const cols     = Math.floor(canvas.width / fontSize);
    const drops    = Array.from({ length: cols }, () => Math.random() * -50);

    function draw() {
      ctx.fillStyle = "rgba(0,0,0,0.05)";
      ctx.fillRect(0, 0, canvas!.width, canvas!.height);

      for (let i = 0; i < drops.length; i++) {
        const bright = Math.random() > 0.95;
        ctx.fillStyle  = bright ? "#fff" : "#00ff41";
        ctx.shadowColor = "#00ff41";
        ctx.shadowBlur  = bright ? 8 : 2;
        ctx.font        = `${fontSize}px monospace`;

        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas!.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += 0.8;
      }
    }

    const raf = { id: 0 };
    let last = 0;
    function loop(ts: number) {
      if (ts - last > 33) { draw(); last = ts; }
      raf.id = requestAnimationFrame(loop);
    }
    raf.id = requestAnimationFrame(loop);

    const timer = setTimeout(() => {
      cancelAnimationFrame(raf.id);
      onDone();
    }, 6000);

    return () => { cancelAnimationFrame(raf.id); clearTimeout(timer); };
  }, [onDone]);

  if (typeof window === "undefined") return null;

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[9990] pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-xs text-[#00ff41] animate-pulse">
        SYSTEM HACK INITIATED... press any key to abort
      </div>
    </motion.div>,
    document.body,
  );
}
