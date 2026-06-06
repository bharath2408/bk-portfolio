"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

const VIDEO_ID = "5D79ltcE8YQ";

export function IntroVideoModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  /* close on Escape */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  /* lock body scroll while open */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (typeof window === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="intro-backdrop"
          className="fixed inset-0 z-[9998] flex items-center justify-center p-4 md:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/85 backdrop-blur-xl" />

          {/* Glow blobs */}
          <div className="pointer-events-none absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-iris/20 blur-[80px]" />
          <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-cyan/15 blur-[80px]" />

          {/* Modal frame */}
          <motion.div
            key="intro-modal"
            className="relative z-10 w-full max-w-4xl"
            initial={{ scale: 0.88, opacity: 0, y: 32 }}
            animate={{ scale: 1,    opacity: 1, y: 0  }}
            exit={{    scale: 0.92, opacity: 0, y: 16 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="mb-3 flex items-center justify-between px-1">
              <div className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-mint animate-pulse-dot" />
                <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                  Portfolio Intro
                </span>
              </div>
              <button
                onClick={onClose}
                aria-label="Close video"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-surface-2 text-muted transition-colors hover:border-iris/50 hover:text-iris"
              >
                ✕
              </button>
            </div>

            {/* Gradient border frame */}
            <div
              className="rounded-2xl p-[1.5px]"
              style={{ background: "linear-gradient(135deg,#7B35E8,#9365FF,#C41E3A)" }}
            >
              <div className="overflow-hidden rounded-[14px] bg-black shadow-2xl"
                style={{ boxShadow: "0 0 80px rgba(147,101,255,0.40), 0 0 40px rgba(196,30,58,0.20), 0 32px 80px rgba(0,0,0,0.85)" }}
              >
                {/* 16:9 responsive wrapper */}
                <div className="relative aspect-video w-full">
                  <iframe
                    src={`https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1&rel=0&modestbranding=1&color=white`}
                    title="Portfolio Intro"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full"
                  />
                </div>
              </div>
            </div>

            {/* Footer hint */}
            <p className="mt-3 text-center font-mono text-[11px] text-faint">
              Press <kbd className="rounded border border-line bg-surface-2 px-1.5 py-0.5 text-[10px] text-muted">Esc</kbd> to close
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
