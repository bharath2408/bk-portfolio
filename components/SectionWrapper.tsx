"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

/**
 * Wraps a page section so its content drifts at a slower rate than the
 * scroll speed, producing the parallax "page sliding past" feel.
 * offset: ["start end", "end start"] tracks from when the section bottom
 * enters the viewport to when the section top leaves — the full travel arc.
 */
export function SectionWrapper({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Section enters from below (+56 px) → rests at 0 → exits upward (−56 px)
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReduced ? [0, 0] : [56, -56]
  );

  return (
    <div ref={ref}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
}
