"use client";

import { useScroll, useSpring, motion } from "framer-motion";

/**
 * Thin iris→cyan gradient bar fixed at the top of the viewport.
 * scaleX is driven by scroll progress — useSpring smooths out any jitter.
 */
export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping:   30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden
      style={{
        scaleX,
        transformOrigin: "left",
        position:   "fixed",
        top:        0,
        left:       0,
        right:      0,
        height:     3,
        zIndex:     9995,
        background: "linear-gradient(90deg, #9365FF 0%, #C41E3A 100%)",
      }}
    />
  );
}
