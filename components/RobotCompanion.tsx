"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const RobotScene = dynamic(() => import("./RobotScene"), { ssr: false });

const SECTIONS: Record<string, { emoji: string; label: string; text: string }> = {
  top: {
    emoji: "🐱",
    label: "Hey!",
    text: "Meow! I'm Tom — Bharatha's hype-cat. Scroll down, I'll show you what he's built!",
  },
  about: {
    emoji: "😼",
    label: "About",
    text: "2.5+ years of experience! That's almost as long as I've been chasing Jerry. Almost.",
  },
  skills: {
    emoji: "⚡",
    label: "Skills",
    text: "50+ technologies? Even I can't catch someone this fast. React, Three.js, AI... purr-fect.",
  },
  work: {
    emoji: "🚀",
    label: "Projects",
    text: "4 enterprise platforms shipped. Bharatha moves faster than Jerry on roller skates!",
  },
  experience: {
    emoji: "💼",
    label: "Experience",
    text: "Frontend Dev since Aug 2023 at D2R AI Labs. Shipping daily — no Jerry can stop him!",
  },
  contact: {
    emoji: "🤝",
    label: "Contact",
    text: "Want to hire Bharatha? Send that email — I'll keep Jerry distracted, I promise. 😄",
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

  // Global mouse tracking
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setMouseX((e.clientX / window.innerWidth)  * 2 - 1);
      setMouseY((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // Click → speed up Tom's dance
  const handlePoke = useCallback(() => {
    setPoke(true);
    setHint(false);
    setTimeout(() => setPoke(false), 2200);
  }, []);

  // Section detection
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
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2 select-none">

      {/* Speech bubble */}
      <AnimatePresence mode="wait">
        <motion.div
          key={section}
          initial={{ opacity: 0, y: 12, scale: 0.88 }}
          animate={{ opacity: 1, y: 0,  scale: 1    }}
          exit={{    opacity: 0, y: -8,  scale: 0.92  }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative mr-2 hidden sm:block w-[200px] rounded-2xl rounded-br-sm border border-white/10 bg-surface/80 px-4 py-3.5 shadow-2xl backdrop-blur-xl"
          style={{ boxShadow: "0 0 0 1px rgba(124,92,255,0.15), 0 20px 40px -12px rgba(0,0,0,0.7)" }}
        >
          <div className="mb-2 flex items-center gap-1.5">
            <span className="text-base leading-none">{current.emoji}</span>
            <span className="rounded-full bg-iris/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-iris">
              {current.label}
            </span>
          </div>
          <p className="text-[12px] leading-relaxed text-ink/80">{current.text}</p>
          <span className="absolute -bottom-[7px] right-5 h-3 w-3 rotate-45 rounded-[2px] border-b border-r border-white/10 bg-surface/80" />
        </motion.div>
      </AnimatePresence>

      {/* Tom canvas */}
      <div className="relative">
        <AnimatePresence>
          {hint && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 3 }}
              className="absolute -top-5 left-0 right-0 text-center text-[10px] text-muted/50"
            >
              click Tom! 🐱
            </motion.p>
          )}
        </AnimatePresence>

        <div
          className="h-40 w-24 sm:h-56 sm:w-36 cursor-pointer"
          onClick={handlePoke}
          title="Click Tom to make him dance faster!"
        >
          <RobotScene wave={wave} poke={poke} mouseX={mouseX} mouseY={mouseY} />
        </div>
      </div>
    </div>
  );
}
