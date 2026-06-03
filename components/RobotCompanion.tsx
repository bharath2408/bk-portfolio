"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const RobotScene = dynamic(() => import("./RobotScene"), { ssr: false });

const SECTIONS: Record<string, { emoji: string; label: string; text: string }> = {
  top: {
    emoji: "👋",
    label: "Welcome",
    text: "Hey! I'm BK's digital buddy. Scroll down to explore!",
  },
  about: {
    emoji: "🧠",
    label: "About",
    text: "2.5+ years crafting AI-powered apps end to end. Clean code, real impact.",
  },
  skills: {
    emoji: "⚡",
    label: "Skills",
    text: "50+ technologies — React, Next.js, TensorFlow.js, Docker... the stack never stops.",
  },
  work: {
    emoji: "🚀",
    label: "Projects",
    text: "4 enterprise platforms shipped. Real clients, real problems, real solutions.",
  },
  experience: {
    emoji: "💼",
    label: "Experience",
    text: "Frontend Dev at D2R AI Labs since Aug 2023. Shipping fast, learning faster.",
  },
  contact: {
    emoji: "🤝",
    label: "Contact",
    text: "Like what you see? Bharatha is open for opportunities. Let's build!",
  },
};

const SECTION_ORDER = ["about", "skills", "work", "experience", "contact"];

export function RobotCompanion() {
  const [section, setSection] = useState("top");
  const [wave, setWave]       = useState(false);
  const [poke, setPoke]       = useState(false);
  const [mouseX, setMouseX]   = useState(0);
  const [mouseY, setMouseY]   = useState(0);
  const [hint, setHint]       = useState(true);

  // Global mouse tracking → robot head follows cursor
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setMouseX((e.clientX / window.innerWidth)  * 2 - 1);
      setMouseY((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // Hide the "click me" hint after first poke
  const handlePoke = useCallback(() => {
    setPoke(true);
    setHint(false);
    setTimeout(() => setPoke(false), 1600);
  }, []);

  // Section detection via IntersectionObserver
  useEffect(() => {
    const visible = new Set<string>();

    const trigger = (next: string) => {
      setSection((prev) => {
        if (prev !== next) {
          setWave(true);
          setTimeout(() => setWave(false), 1800);
        }
        return next;
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) visible.add(e.target.id);
          else visible.delete(e.target.id);
        });
        const active = SECTION_ORDER.find((id) => visible.has(id)) ?? "top";
        trigger(active);
      },
      { threshold: 0.3 },
    );

    SECTION_ORDER.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const current = SECTIONS[section];

  return (
    <div className="fixed bottom-4 right-4 z-40 hidden md:flex flex-col items-end gap-2 select-none">

      {/* ── Speech bubble ──────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={section}
          initial={{ opacity: 0, y: 12, scale: 0.88 }}
          animate={{ opacity: 1, y: 0,  scale: 1    }}
          exit={{    opacity: 0, y: -8,  scale: 0.92  }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative mr-4 w-[210px] rounded-2xl rounded-br-sm border border-white/10 bg-surface/80 px-4 py-3.5 shadow-2xl backdrop-blur-xl"
          style={{ boxShadow: "0 0 0 1px rgba(124,92,255,0.15), 0 20px 40px -12px rgba(0,0,0,0.7)" }}
        >
          {/* Section label chip */}
          <div className="mb-2 flex items-center gap-1.5">
            <span className="text-base leading-none">{current.emoji}</span>
            <span className="rounded-full bg-iris/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-iris">
              {current.label}
            </span>
          </div>

          <p className="text-[12px] leading-relaxed text-ink/80">{current.text}</p>

          {/* Bubble tail */}
          <span className="absolute -bottom-[7px] right-5 h-3 w-3 rotate-45 rounded-[2px] border-b border-r border-white/10 bg-surface/80" />
        </motion.div>
      </AnimatePresence>

      {/* ── Robot canvas + click hint ─────── */}
      <div className="relative">
        {/* Click hint */}
        <AnimatePresence>
          {hint && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 2.5 }}
              className="absolute -top-5 left-0 right-0 text-center text-[10px] text-muted/50"
            >
              click me!
            </motion.p>
          )}
        </AnimatePresence>

        <div
          className="h-52 w-36 cursor-pointer"
          onClick={handlePoke}
          title="Click the robot!"
        >
          <RobotScene wave={wave} poke={poke} mouseX={mouseX} mouseY={mouseY} />
        </div>
      </div>
    </div>
  );
}
