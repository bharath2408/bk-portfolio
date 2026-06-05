/** Shared confetti helpers — pure TS, no React, no side-effects. */

export const CONFETTI_COLORS = [
  "#7C5CFF","#22D3EE","#34D399",
  "#A78BFA","#67E8F9","#6EE7B7","#FFFFFF",
] as const;

export interface Particle {
  id:       number;
  x:        number;   // vw offset from burst centre
  y:        number;   // vh offset from burst centre
  color:    string;
  size:     number;
  rotate:   number;
  delay:    number;
  duration: number;
}

/** Generate `n` particles arranged in a radial burst. */
export function makeParticles(n = 80): Particle[] {
  return Array.from({ length: n }, (_, i) => {
    const angle = (i / n) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
    const dist  = 25 + Math.random() * 42;
    return {
      id:       i,
      x:        Math.cos(angle) * dist,
      y:        Math.sin(angle) * dist - 10,
      color:    CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size:     6 + Math.random() * 14,
      rotate:   (Math.random() - 0.5) * 600,
      delay:    Math.random() * 0.18,
      duration: 0.75 + Math.random() * 0.55,
    };
  });
}
