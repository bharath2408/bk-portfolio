"use client";

import { useRef, type ReactNode } from "react";

const GLOW: Record<string, string> = {
  iris: "rgba(124,92,255,0.16)",
  cyan: "rgba(34,211,238,0.16)",
  mint: "rgba(52,211,153,0.16)",
};

/** A card that renders a soft glow following the cursor. */
export function SpotlightCard({
  children,
  className = "",
  accent,
}: {
  children: ReactNode;
  className?: string;
  accent?: "iris" | "cyan" | "mint";
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      style={accent ? ({ "--glow": GLOW[accent] } as React.CSSProperties) : undefined}
      className={`spotlight ${className}`}
    >
      {children}
    </div>
  );
}
