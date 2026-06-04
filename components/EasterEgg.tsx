"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const KONAMI = [
  "ArrowUp","ArrowUp","ArrowDown","ArrowDown",
  "ArrowLeft","ArrowRight","ArrowLeft","ArrowRight",
  "b","a",
];

const COLORS = [
  "#7C5CFF","#22D3EE","#34D399",
  "#A78BFA","#67E8F9","#6EE7B7","#FFFFFF",
];

const KEYS_DISPLAY = ["↑","↑","↓","↓","←","→","←","→","B","A"];

interface Particle {
  id:       number;
  x:        number;  // vw offset from center
  y:        number;  // vh offset from center
  color:    string;
  size:     number;
  rotate:   number;
  delay:    number;
  duration: number;
}

function makeParticles(n = 80): Particle[] {
  return Array.from({ length: n }, (_, i) => {
    const angle   = (i / n) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
    const dist    = 25 + Math.random() * 42;
    return {
      id:       i,
      x:        Math.cos(angle) * dist,
      y:        Math.sin(angle) * dist - 10,
      color:    COLORS[Math.floor(Math.random() * COLORS.length)],
      size:     6 + Math.random() * 14,
      rotate:   (Math.random() - 0.5) * 600,
      delay:    Math.random() * 0.18,
      duration: 0.75 + Math.random() * 0.55,
    };
  });
}

// Generate once — stable across renders
const PARTICLES = makeParticles();

export default function EasterEgg() {
  const [active, setActive] = useState(false);

  // Konami code listener
  useEffect(() => {
    let idx = 0;
    const handle = (e: KeyboardEvent) => {
      if (e.key === KONAMI[idx]) {
        idx++;
        if (idx === KONAMI.length) {
          setActive(true);
          idx = 0;
        }
      } else {
        idx = e.key === KONAMI[0] ? 1 : 0;
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, []);

  // Auto-dismiss after 6 s
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => setActive(false), 6000);
    return () => clearTimeout(t);
  }, [active]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[9998] flex items-center justify-center cursor-pointer"
          style={{ background: "rgba(7,7,11,0.88)", backdropFilter: "blur(6px)" }}
          onClick={() => setActive(false)}
        >
          {/* Burst particles */}
          {PARTICLES.map((p) => (
            <motion.span
              key={p.id}
              className="absolute block rounded-full pointer-events-none"
              initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
              animate={{
                x:       `${p.x}vw`,
                y:       `${p.y}vh`,
                opacity: 0,
                rotate:  p.rotate,
                scale:   0,
              }}
              transition={{ duration: p.duration, delay: p.delay, ease: "easeOut" }}
              style={{
                width:     p.size,
                height:    p.size,
                background: p.color,
                boxShadow: `0 0 ${p.size * 1.2}px ${p.color}`,
              }}
            />
          ))}

          {/* Center card — stop propagation so clicking card doesn't dismiss */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0, y: 24 }}
            animate={{ scale: 1,   opacity: 1, y: 0  }}
            exit={{    scale: 0.8, opacity: 0        }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
            className="relative z-10 mx-4 flex flex-col items-center gap-5 rounded-3xl border border-white/10 bg-surface/90 px-8 py-8 text-center shadow-2xl backdrop-blur-xl sm:px-12"
            style={{ boxShadow: "0 0 90px rgba(124,92,255,0.28), 0 24px 64px rgba(0,0,0,0.85)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <motion.div
              animate={{ rotate: [0, -12, 12, -8, 8, 0] }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-5xl"
            >
              🎮
            </motion.div>

            {/* Headline */}
            <div>
              <p className="font-display text-2xl font-extrabold text-ink">
                You found the Easter egg!
              </p>
              <p className="mt-1.5 text-sm text-muted">
                Not many developers make it this far 👀
              </p>
            </div>

            {/* Konami sequence */}
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {KEYS_DISPLAY.map((k, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + i * 0.055 }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-iris/40 bg-iris/10 text-xs font-bold text-iris"
                >
                  {k}
                </motion.span>
              ))}
            </div>

            {/* Message */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="max-w-xs text-sm leading-relaxed text-muted"
            >
              Bharatha built this for curious developers like you.
              If you noticed this, you'd make a great colleague. 🚀
            </motion.p>

            {/* Dismiss */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setActive(false)}
              className="rounded-xl border border-iris/30 bg-iris/10 px-6 py-2.5 text-sm font-semibold text-iris transition-colors hover:bg-iris/20"
            >
              Nice find! ✨
            </motion.button>

            {/* Auto-dismiss hint */}
            <p className="text-[10px] text-faint">click anywhere or wait to dismiss</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
