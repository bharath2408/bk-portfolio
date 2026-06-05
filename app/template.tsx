"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Framer Motion page transition — acts as the fallback when the browser
 * doesn't support document.startViewTransition (used by ViewTransitionLink).
 * Fully disabled when prefers-reduced-motion is set.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: reduced ? 0 : 14 }}
      animate={{ opacity: 1, y: 0              }}
      exit={{    opacity: 0, y: reduced ? 0 : -10 }}
      transition={{ duration: reduced ? 0 : 0.35, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
