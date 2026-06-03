"use client";

import { motion } from "framer-motion";

export default function LoadingScreen() {
  return (
    <motion.div
      initial={{ y: 0 }}
      exit={{
        y: "-100%",
        transition: { duration: 0.72, ease: [0.76, 0, 0.24, 1] },
      }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-bg overflow-hidden"
    >
      {/* Iris ambient glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div
          className="w-[420px] h-[420px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(124,92,255,0.18) 0%, transparent 70%)",
          }}
        />
      </motion.div>

      {/* BK monogram */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 font-display font-extrabold text-iris leading-none select-none"
        style={{ fontSize: "clamp(5.5rem, 16vw, 9.5rem)", letterSpacing: "-0.04em" }}
      >
        BK
      </motion.div>

      {/* Name */}
      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
        className="relative z-10 mt-5 text-[11px] tracking-[0.38em] uppercase text-muted font-sans"
      >
        Bharatha Kumar
      </motion.p>

      {/* Role */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.38 }}
        transition={{ duration: 0.4, delay: 0.48 }}
        className="relative z-10 mt-2 text-[10px] tracking-[0.22em] uppercase text-muted font-sans"
      >
        Frontend Developer
      </motion.p>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/[0.04]">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.65, delay: 0.08, ease: [0.4, 0, 0.2, 1] }}
          style={{ originX: 0 }}
          className="h-full bg-iris"
        />
      </div>
    </motion.div>
  );
}
