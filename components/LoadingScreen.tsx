"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";

// Dynamically import the Three.js canvas — no SSR
const BK3D = dynamic(() => import("./BK3D"), { ssr: false });

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
          className="w-[480px] h-[480px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(124,92,255,0.16) 0%, transparent 70%)",
          }}
        />
      </motion.div>

      {/* 3D BK text */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10"
        style={{ width: "clamp(220px, 40vw, 380px)", height: "clamp(140px, 22vw, 220px)" }}
      >
        <BK3D />
      </motion.div>

      {/* Name */}
      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35, ease: "easeOut" }}
        className="relative z-10 mt-2 text-[11px] tracking-[0.38em] uppercase text-muted font-sans"
      >
        Bharatha Kumar
      </motion.p>

      {/* Role */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.38 }}
        transition={{ duration: 0.4, delay: 0.5 }}
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
